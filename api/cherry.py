from __future__ import annotations

import base64
import gzip
import json
import os
import re
import tempfile
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]

HOME_ADDRESS = "หมู่บ้าน Malton Gates ซอย 8 เลขที่ 18/36"
MAPS_URL = (
    "https://www.google.com/maps/dir/?api=1"
    "&destination=13.7569722,100.6874444"
)

CALENDAR_API_URL = os.getenv(
    "CHERRY_CALENDAR_API_URL",
    "https://script.google.com/macros/s/"
    "AKfycbwDPuv7-9Vv_fYArKtMcdZ9WOvJzT3eDJKHF6SjzyEKzzP2z4c83hnz4NdpA_6dO5_Hbw/exec",
)

LINE_LETTERS = {
    "a": "เอ", "b": "บี", "c": "ซี", "d": "ดี", "e": "อี",
    "f": "เอฟ", "g": "จี", "h": "เอช", "i": "ไอ", "j": "เจ",
    "k": "เค", "l": "แอล", "m": "เอ็ม", "n": "เอ็น", "o": "โอ",
    "p": "พี", "q": "คิว", "r": "อาร์", "s": "เอส", "t": "ที",
    "u": "ยู", "v": "วี", "w": "ดับเบิลยู", "x": "เอ็กซ์",
    "y": "วาย", "z": "แซด",
}

DIGITS = {
    "0": "ศูนย์", "1": "หนึ่ง", "2": "สอง", "3": "สาม", "4": "สี่",
    "5": "ห้า", "6": "หก", "7": "เจ็ด", "8": "แปด", "9": "เก้า",
}

_CONTACT_CACHE: list[dict[str, Any]] | None = None
_CONTACT_LOAD_STATUS = "not_loaded"


def _norm(value: Any) -> str:
    return re.sub(r"\s+", "", str(value or "").lower())


def _load_files() -> list[dict[str, Any]]:
    path = ROOT / "data" / "cherry_home_files.json"
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
        return payload if isinstance(payload, list) else []
    except Exception:
        return []


def _load_contacts() -> list[dict[str, Any]]:
    global _CONTACT_CACHE, _CONTACT_LOAD_STATUS

    if _CONTACT_CACHE is not None:
        return _CONTACT_CACHE

    compressed = os.getenv("CHERRY_CONTACTS_GZIP_B64", "").strip()

    if compressed:
        try:
            raw = gzip.decompress(base64.b64decode(compressed))
            payload = json.loads(raw.decode("utf-8"))

            if isinstance(payload, list) and payload:
                _CONTACT_CACHE = payload
                _CONTACT_LOAD_STATUS = "gzip_b64"
                return payload

            _CONTACT_LOAD_STATUS = "gzip_b64_empty"
        except Exception:
            _CONTACT_LOAD_STATUS = "gzip_b64_invalid"

    raw_json = os.getenv("CHERRY_CONTACTS_JSON", "").strip()

    if raw_json:
        try:
            payload = json.loads(raw_json)

            if isinstance(payload, list) and payload:
                _CONTACT_CACHE = payload
                _CONTACT_LOAD_STATUS = "json_env"
                return payload

            _CONTACT_LOAD_STATUS = "json_env_empty"
        except Exception:
            _CONTACT_LOAD_STATUS = "json_env_invalid"

    private_path = ROOT / "data" / "cherry_contacts.private.json"

    try:
        payload = json.loads(private_path.read_text(encoding="utf-8"))

        if isinstance(payload, list) and payload:
            _CONTACT_CACHE = payload
            _CONTACT_LOAD_STATUS = "private_file"
            return payload
    except Exception:
        pass

    _CONTACT_CACHE = []

    if _CONTACT_LOAD_STATUS == "not_loaded":
        _CONTACT_LOAD_STATUS = "missing"

    return []


def _public_contact(contact: dict[str, Any]) -> dict[str, Any]:
    # Never send thousands of private matching aliases to the browser.
    return {
        "name": str(contact.get("name") or ""),
        "phone": str(contact.get("phone") or ""),
        "line_id": str(contact.get("line_id") or ""),
    }


def _public_file(item: dict[str, Any]) -> dict[str, Any]:
    return {
        "category": str(item.get("category") or ""),
        "name": str(item.get("name") or ""),
        "url": str(item.get("url") or ""),
        "note": str(item.get("note") or ""),
    }


def _match_contacts(
    question: str,
    contacts: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    q = _norm(question)
    found = []

    for contact in contacts:
        terms = [contact.get("name", "")] + list(contact.get("aliases") or [])

        if any(_norm(term) and _norm(term) in q for term in terms):
            found.append(contact)

    return found


def _match_files(
    question: str,
    files: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    q = _norm(question)
    scored = []

    for item in files:
        terms = (
            [item.get("name", ""), item.get("category", "")]
            + list(item.get("aliases") or [])
        )

        score = sum(
            len(_norm(term))
            for term in terms
            if _norm(term) and _norm(term) in q
        )

        if score:
            scored.append((score, item))

    scored.sort(key=lambda x: x[0], reverse=True)

    if not scored:
        return []

    best = scored[0][0]

    return [
        item
        for score, item in scored
        if score >= max(2, best * 0.45)
    ]


def _spell_line_id(value: str) -> str:
    parts = []

    for char in str(value or "").strip():
        low = char.lower()

        if low in LINE_LETTERS:
            parts.append(LINE_LETTERS[low])
        elif char in DIGITS:
            parts.append(DIGITS[char])
        elif char == "_":
            parts.append("ขีดล่าง")
        elif char == "-":
            parts.append("ขีด")
        elif char == ".":
            parts.append("จุด")
        elif char == "@":
            parts.append("แอด")
        else:
            parts.append(char)

    return " ... ".join(parts)


def _format_phone(value: str) -> str:
    digits = re.sub(r"\D", "", str(value or ""))

    if len(digits) == 10:
        return f"{digits[:3]}-{digits[3:6]}-{digits[6:]}"

    return value or "ยังไม่ระบุ"


def _calendar_rows() -> list[dict[str, Any]]:
    if not CALENDAR_API_URL:
        return []

    try:
        query = urllib.parse.urlencode({"action": "listAppointments"})
        url = CALENDAR_API_URL + ("&" if "?" in CALENDAR_API_URL else "?") + query
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "CherryAI/12.3"},
        )

        with urllib.request.urlopen(req, timeout=10) as response:
            payload = json.loads(response.read().decode("utf-8"))

        rows = (
            payload.get("appointments", payload.get("data", payload))
            if isinstance(payload, dict)
            else payload
        )

        return rows[:100] if isinstance(rows, list) else []
    except Exception:
        return []


def _openai_client():
    key = os.getenv("OPENAI_API_KEY", "").strip()

    if not key:
        return None

    from openai import OpenAI
    return OpenAI(api_key=key)


def _rate_to_speed(value: Any) -> float:
    raw = str(value if value is not None else "").strip()

    if not raw:
        return 1.0

    try:
        if raw.endswith("%"):
            return max(0.25, min(4.0, 1.0 + float(raw[:-1]) / 100.0))

        return max(0.25, min(4.0, float(raw)))
    except Exception:
        return 1.0


def _deterministic_answer(
    question: str,
) -> tuple[str, str, dict[str, Any], bool]:
    q = question.lower()
    contacts = _load_contacts()
    files = _load_files()
    actions: dict[str, Any] = {}

    if any(
        k in q
        for k in (
            "ที่อยู่", "บ้านอยู่ไหน", "ตำแหน่งบ้าน",
            "นำทาง", "แผนที่", "map",
        )
    ):
        answer = (
            f"บ้านอยู่ที่ {HOME_ADDRESS} ค่ะ "
            "มีปุ่มเปิด Google Maps ให้แล้วค่ะ"
        )

        actions["map"] = {
            "label": "เปิด Google Maps นำทาง",
            "url": MAPS_URL,
        }

        return answer, answer, actions, True

    if any(k in q for k in ("นัด", "calendar", "ปฏิทิน", "ตาราง")):
        rows = _calendar_rows()[:8]
        actions["appointments"] = rows

        if not rows:
            answer = "ยังไม่พบนัดหมายจาก Calendar ค่ะ"
            return answer, answer, actions, True

        parts = [
            f"วันที่ {r.get('date','')} เวลา {r.get('time','')} "
            f"{r.get('name','')} นัดหมายเรื่อง {r.get('details','')}"
            for r in rows
        ]

        answer = "พบนัดหมายดังนี้ค่ะ " + " ".join(parts)
        return answer, answer, actions, True

    if any(
        k in q
        for k in (
            "ติดต่อ", "contact", "เบอร์", "โทร",
            "line", "line id", "ไลน์", "ไลน์ไอดี",
        )
    ):
        if not contacts:
            answer = (
                "ยังไม่พบข้อมูล Contact ใน Vercel Production ค่ะ "
                "กรุณารัน SETUP-VERCEL-CHERRY-V12-3.ps1 แล้ว Deploy ใหม่ค่ะ"
            )

            return answer, answer, actions, True

        specific = _match_contacts(question, contacts)
        selected = specific or contacts

        actions["contacts"] = [
            _public_contact(c)
            for c in selected[:8]
        ]

        if specific:
            c = selected[0]
            name = str(c.get("name") or "ผู้ติดต่อ")
            phone = _format_phone(str(c.get("phone") or ""))
            line_id = str(c.get("line_id") or "").strip()

            if "line" in q or "ไลน์" in q:
                if not line_id:
                    answer = f"{name} ยังไม่ได้ระบุ Line ID ค่ะ"
                    return answer, answer, actions, True

                answer = f"Line ID ของ {name} คือ {line_id} ค่ะ"

                speech = (
                    f"Line ID ของ {name} สะกดทีละตัวว่า "
                    f"{_spell_line_id(line_id)} ค่ะ"
                )

                return answer, speech, actions, True

            answer = f"{name} เบอร์โทร {phone}"

            if line_id:
                answer += f" และ Line ID {line_id}"

            answer += " ค่ะ"

            speech = f"{name} เบอร์โทร {phone} ค่ะ"

            if line_id:
                speech += (
                    " Line ID สะกดว่า "
                    f"{_spell_line_id(line_id)} ค่ะ"
                )

            return answer, speech, actions, True

        names = ", ".join(
            str(c.get("name", ""))
            for c in selected[:8]
        )

        answer = f"พบข้อมูล Contact ดังนี้ค่ะ {names}"
        return answer, answer, actions, True

    file_clues = (
        "ไฟล์", "พิมพ์เขียว", "adam", "อดัม", "ggb",
        "solar", "โซลาร์", "garage", "โรงรถ", "interior",
        "pavilion", "laundry", "landscape", "ใบเสนอราคา",
        "เครื่องใช้ไฟฟ้า", "ดาวน์โหลด",
    )

    if any(k in q for k in file_clues):
        matched = _match_files(question, files)
        selected = matched or files

        actions["files"] = [
            _public_file(f)
            for f in selected[:8]
        ]

        if not selected:
            answer = "ยังไม่พบไฟล์บ้านค่ะ"
            return answer, answer, actions, True

        if len(selected) == 1:
            answer = (
                f"พบ {selected[0].get('name','')} ค่ะ "
                "มีปุ่มเปิดไฟล์ให้แล้วค่ะ"
            )
        else:
            answer = (
                "พบไฟล์ดังนี้ค่ะ "
                + ", ".join(
                    str(f.get("name", ""))
                    for f in selected[:8]
                )
            )

        return answer, answer, actions, True

    return "", "", actions, False


def _chat(message: str) -> dict[str, Any]:
    answer, speech, actions, handled = _deterministic_answer(message)

    if handled:
        return {
            "answer": answer,
            "speech_answer": speech,
            "actions": actions,
        }

    client = _openai_client()

    if client is None:
        answer = (
            "ตอนนี้ Cherry AI Public ใช้งานคำถามข้อมูลบ้านได้ค่ะ "
            "หากต้องการคำถามทั่วไปและเสียงผู้หญิงจาก Server "
            "ให้ตั้ง OPENAI_API_KEY ใน Vercel Environment Variables ค่ะ"
        )

        return {
            "answer": answer,
            "speech_answer": answer,
            "actions": {},
        }

    response = client.responses.create(
        model=os.getenv("OPENAI_CHAT_MODEL", "gpt-4.1-mini"),
        instructions=(
            "คุณคือ Cherry AI ผู้ช่วยผู้หญิงประจำ Family Home Dashboard "
            "ตอบภาษาไทยสุภาพ กระชับ ชัดเจน "
            "และไม่แต่งข้อมูลส่วนตัวของครอบครัวเอง"
        ),
        input=message,
    )

    answer = response.output_text.strip()

    return {
        "answer": answer,
        "speech_answer": answer,
        "actions": {},
    }


class handler(BaseHTTPRequestHandler):
    def _cors(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

    def _json(self, payload: Any, status: int = 200) -> None:
        raw = json.dumps(
            payload,
            ensure_ascii=False,
        ).encode("utf-8")

        self.send_response(status)
        self.send_header(
            "Content-Type",
            "application/json; charset=utf-8",
        )
        self.send_header("Content-Length", str(len(raw)))
        self._cors()
        self.end_headers()
        self.wfile.write(raw)

    def _bytes(
        self,
        payload: bytes,
        content_type: str = "audio/mpeg",
        status: int = 200,
    ) -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(payload)))
        self._cors()
        self.end_headers()
        self.wfile.write(payload)

    def _body_json(self) -> dict[str, Any]:
        length = int(self.headers.get("Content-Length", "0") or 0)
        raw = self.rfile.read(length) if length else b"{}"

        try:
            return json.loads(raw.decode("utf-8"))
        except Exception:
            return {}

    def _action(self) -> str:
        parsed = urllib.parse.urlparse(self.path)
        query = urllib.parse.parse_qs(parsed.query)
        return str((query.get("action") or ["health"])[0])

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self) -> None:
        action = self._action()

        if action != "health":
            return self._json(
                {"error": "Unsupported GET action"},
                404,
            )

        key_ready = bool(
            os.getenv("OPENAI_API_KEY", "").strip()
        )

        contacts_ready = bool(_load_contacts())

        return self._json({
            "ok": True,
            "name": "Cherry AI Vercel API V12.3",
            "contacts_configured": contacts_ready,
            "contacts_source": _CONTACT_LOAD_STATUS,
            "female_server_voice_configured": key_ready,
            "tts_model": os.getenv("OPENAI_TTS_MODEL", "gpt-4o-mini-tts"),
            "tts_voice": os.getenv("OPENAI_TTS_VOICE", "coral"),
            "features": {
                "chat": True,
                "tts": key_ready,
                "stt": key_ready,
                "general_ai": key_ready,
                "contacts_configured": contacts_ready,
                "browser_female_voice_fallback": True,
            },
        })

    def do_POST(self) -> None:
        action = self._action()
        body = self._body_json()

        try:
            if action == "chat":
                message = str(
                    body.get("message", "")
                ).strip()[:2000]

                if not message:
                    return self._json(
                        {"error": "กรุณาพิมพ์คำถามค่ะ"},
                        400,
                    )

                return self._json(_chat(message))

            if action == "speech":
                client = _openai_client()

                if client is None:
                    return self._json({
                        "fallback": "browser",
                        "error": "TTS key not configured",
                    })

                text = str(
                    body.get("text", "")
                ).strip()[:4000]

                if not text:
                    return self._json(
                        {"error": "ไม่มีข้อความสำหรับสร้างเสียง"},
                        400,
                    )

                # V12 accepts both normal numeric speed and the user's
                # original app.js rate strings such as '0%' / '10%'.
                rate = body.get("rate", "")
                speed = _rate_to_speed(
                    rate if str(rate).strip()
                    else body.get("speed", 1)
                )

                instructions = (
                    str(body.get("instructions", "")).strip()
                    or (
                        "พูดภาษาไทยด้วยเสียงผู้หญิงวัยผู้ใหญ่ที่นุ่มนวล "
                        "เป็นธรรมชาติ สุภาพ ชัดเจน ไม่รีบ "
                        "โดยเฉพาะตัวเลข เบอร์โทร และตัวอักษรภาษาอังกฤษ"
                    )
                )

                response = client.audio.speech.create(
                    model=os.getenv(
                        "OPENAI_TTS_MODEL",
                        "gpt-4o-mini-tts",
                    ),
                    voice=os.getenv(
                        "OPENAI_TTS_VOICE",
                        "coral",
                    ),
                    input=text,
                    instructions=instructions,
                    response_format="mp3",
                    speed=speed,
                )

                return self._bytes(
                    response.read(),
                    "audio/mpeg",
                )

            if action == "transcribe":
                client = _openai_client()

                if client is None:
                    return self._json({
                        "fallback": "browser",
                        "error": "STT key not configured",
                    })

                encoded = str(
                    body.get("audio_base64", "")
                )

                if not encoded:
                    return self._json(
                        {"error": "ไม่พบไฟล์เสียง"},
                        400,
                    )

                audio = base64.b64decode(encoded)
                filename = str(
                    body.get("filename", "voice.webm")
                )

                suffix = ".webm"

                if "." in filename:
                    suffix = (
                        "."
                        + filename.rsplit(".", 1)[-1][:8]
                    )

                with tempfile.NamedTemporaryFile(
                    suffix=suffix,
                    delete=True,
                ) as temp:
                    temp.write(audio)
                    temp.flush()

                    with open(temp.name, "rb") as f:
                        result = (
                            client.audio.transcriptions.create(
                                model=os.getenv(
                                    "OPENAI_STT_MODEL",
                                    "gpt-4o-mini-transcribe",
                                ),
                                file=f,
                                language="th",
                            )
                        )

                return self._json({
                    "text": result.text,
                })

            return self._json(
                {"error": "Unknown action"},
                404,
            )

        except Exception as exc:
            return self._json(
                {"error": str(exc)},
                500,
            )

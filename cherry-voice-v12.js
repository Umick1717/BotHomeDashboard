/* =========================================================
   CHERRY VOICE V12
   Ported from the user's proven Cherry V6.5 app.js.

   Contact timing preserved exactly:
   PHONE_DIGIT_PAUSE_MS       = 30
   PHONE_GROUP_PAUSE_MS       = 100
   LINE_CHAR_PAUSE_MS         = 40
   PHONE_TTS_RATE             = '0%'
   LINE_TTS_RATE              = '0%'
   CONTACT_NORMAL_RATE        = '10%'
   PHONE_AUDIO_PLAYBACK_RATE  = 1.30
   LINE_AUDIO_PLAYBACK_RATE   = 1.25
   NORMAL_AUDIO_PLAYBACK_RATE = 1.10
   ========================================================= */
(() => {
  "use strict";

  const PHONE_DIGIT_PAUSE_MS = 30;
  const PHONE_GROUP_PAUSE_MS = 100;
  const LINE_CHAR_PAUSE_MS = 40;

  const PHONE_TTS_RATE = "0%";
  const LINE_TTS_RATE = "0%";
  const CONTACT_NORMAL_RATE = "10%";

  const PHONE_AUDIO_PLAYBACK_RATE = 1.30;
  const LINE_AUDIO_PLAYBACK_RATE = 1.25;
  const NORMAL_AUDIO_PLAYBACK_RATE = 1.10;

  const FEMALE_INSTRUCTIONS =
    "พูดภาษาไทยด้วยเสียงผู้หญิงวัยผู้ใหญ่ที่นุ่มนวล เป็นธรรมชาติ " +
    "สุภาพ ชัดเจน ไม่รีบ โดยเฉพาะตัวเลข เบอร์โทร และตัวอักษรภาษาอังกฤษ";

  const LINE_LETTERS = {
    a:"เอ", b:"บี", c:"ซี", d:"ดี", e:"อี", f:"เอฟ", g:"จี", h:"เอช",
    i:"ไอ", j:"เจ", k:"เค", l:"แอล", m:"เอ็ม", n:"เอ็น", o:"โอ", p:"พี",
    q:"คิว", r:"อาร์", s:"เอส", t:"ที", u:"ยู", v:"วี", w:"ดับเบิลยู",
    x:"เอ็กซ์", y:"วาย", z:"แซด"
  };

  const LINE_DIGITS = {
    "0":"ศูนย์", "1":"หนึ่ง", "2":"สอง", "3":"สาม", "4":"สี่",
    "5":"ห้า", "6":"หก", "7":"เจ็ด", "8":"แปด", "9":"เก้า"
  };

  const audio = new Audio();
  audio.playsInline = true;

  const ttsAudioCache = new Map();

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  const ratePercentToSpeed = rate => {
    const value = String(rate ?? "").trim();
    if (!value) return 1;

    if (value.endsWith("%")) {
      const pct = Number(value.slice(0, -1));
      return Number.isFinite(pct) ? Math.max(0.25, Math.min(4, 1 + pct / 100)) : 1;
    }

    const numeric = Number(value);
    return Number.isFinite(numeric) ? Math.max(0.25, Math.min(4, numeric)) : 1;
  };

  const lineCharName = ch => {
    const low = String(ch || "").toLowerCase();
    if (LINE_LETTERS[low]) return LINE_LETTERS[low];
    if (LINE_DIGITS[ch]) return LINE_DIGITS[ch];
    if (ch === "_") return "ขีดล่าง";
    if (ch === "-") return "ขีด";
    if (ch === ".") return "จุด";
    if (ch === "@") return "แอด";
    return ch;
  };

  const phoneGroups = phone => {
    const digits = String(phone || "").replace(/\D/g, "");
    if (digits.length === 10) {
      return [digits.slice(0,3), digits.slice(3,6), digits.slice(6,10)];
    }
    return digits ? [digits] : [];
  };

  const formatPhoneDisplay = phone => {
    const digits = String(phone || "").replace(/\D/g, "");
    if (digits.length === 10) {
      return `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6,10)}`;
    }
    return String(phone || "-");
  };

  const isContactQuestion = text => {
    const q = String(text || "").toLowerCase().replace(/\s+/g, "");
    return (
      q.includes("contact") ||
      q.includes("ติดต่อ") ||
      q.includes("เบอร์") ||
      q.includes("โทร") ||
      q.includes("line") ||
      q.includes("lineid") ||
      q.includes("ไลน์") ||
      q.includes("ไลน์ไอดี")
    );
  };

  async function resolveSpeechRequest(text, rate = "") {
    const clean = String(text || "").trim();
    if (!clean) return null;

    const client = window.CherryAI?.client;
    const cfg = window.CHERRY_CONFIG || {};
    let caps = null;

    try {
      caps = await client?.getCapabilities?.();
    } catch (_) {}

    const isLocal =
      caps?.backend === "local" ||
      location.hostname === "127.0.0.1" ||
      location.hostname === "localhost";

    let endpoint;
    let payload;

    if (isLocal && cfg.localBackend) {
      endpoint = `${cfg.localBackend}/api/speech`;
      payload = { text: clean, rate };
    } else {
      endpoint = `${cfg.publicBackend || "/api/cherry"}?action=speech`;
      payload = {
        text: clean,
        rate,
        speed: ratePercentToSpeed(rate),
        instructions: FEMALE_INSTRUCTIONS
      };
    }

    return { endpoint, payload, client, caps };
  }

  async function getSpeechUrl(text, rate = "") {
    const clean = String(text || "").trim();
    if (!clean) return null;

    const key = `${rate}|${clean}`;
    if (ttsAudioCache.has(key)) return ttsAudioCache.get(key);

    const promise = (async () => {
      const requestInfo = await resolveSpeechRequest(clean, rate);
      if (!requestInfo) return null;

      const response = await fetch(requestInfo.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestInfo.payload)
      });

      const contentType = response.headers.get("content-type") || "";

      if (!response.ok || !contentType.includes("audio/")) {
        // Server voice may not be configured on Public.
        // Return null so caller can use Cherry core/browser TTS fallback.
        return null;
      }

      return URL.createObjectURL(await response.blob());
    })();

    ttsAudioCache.set(key, promise);
    return promise;
  }

  async function playPreparedUrl(url, playbackRate = NORMAL_AUDIO_PLAYBACK_RATE) {
    if (!url) return false;

    audio.pause();
    audio.src = url;
    audio.currentTime = 0;
    audio.playbackRate = playbackRate;

    await new Promise((resolve, reject) => {
      const cleanup = () => {
        audio.removeEventListener("ended", onEnded);
        audio.removeEventListener("error", onError);
      };

      const onEnded = () => {
        cleanup();
        resolve();
      };

      const onError = () => {
        cleanup();
        reject(new Error("เล่นเสียง Cherry ไม่สำเร็จ"));
      };

      audio.addEventListener("ended", onEnded, { once: true });
      audio.addEventListener("error", onError, { once: true });

      audio.play().catch(err => {
        cleanup();
        reject(err);
      });
    });

    return true;
  }

  async function playSpeechSegment(text, rate = "", playbackRate = NORMAL_AUDIO_PLAYBACK_RATE) {
    const clean = String(text || "").trim();
    if (!clean) return;

    const url = await getSpeechUrl(clean, rate);

    if (url) {
      await playPreparedUrl(url, playbackRate);
      return;
    }

    // Fallback when Public server TTS is not configured.
    const client = window.CherryAI?.client;
    if (!client?.speak) {
      throw new Error("ระบบเสียง Cherry ยังไม่พร้อมค่ะ");
    }

    await client.speak(clean, {
      rate: Math.max(0.5, Math.min(2, playbackRate)),
      playbackRate
    });
  }

  async function speakPhoneSlow(phone) {
    const groups = phoneGroups(phone);

    if (!groups.length) {
      await playSpeechSegment(
        "ยังไม่ได้ระบุเบอร์โทรศัพท์ค่ะ",
        CONTACT_NORMAL_RATE,
        NORMAL_AUDIO_PLAYBACK_RATE
      );
      return;
    }

    const flatDigits = [];

    groups.forEach((group, groupIndex) => {
      group.split("").forEach(ch => {
        flatDigits.push({
          text: LINE_DIGITS[ch] || ch,
          groupIndex
        });
      });
    });

    // Same strategy as the user's app.js:
    // prefetch all digit audio first to avoid network gaps during playback.
    const urls = await Promise.all(
      flatDigits.map(item => getSpeechUrl(item.text, PHONE_TTS_RATE))
    );

    let cursor = 0;

    for (let gi = 0; gi < groups.length; gi++) {
      const chars = groups[gi].split("");

      for (let i = 0; i < chars.length; i++) {
        const url = urls[cursor++];

        if (url) {
          await playPreparedUrl(url, PHONE_AUDIO_PLAYBACK_RATE);
        } else {
          await playSpeechSegment(
            LINE_DIGITS[chars[i]] || chars[i],
            PHONE_TTS_RATE,
            PHONE_AUDIO_PLAYBACK_RATE
          );
        }

        if (i < chars.length - 1) {
          await sleep(PHONE_DIGIT_PAUSE_MS);
        }
      }

      if (gi < groups.length - 1) {
        await sleep(PHONE_GROUP_PAUSE_MS);
      }
    }
  }

  async function speakLineIdVerySlow(lineId) {
    const chars = String(lineId || "").trim().split("");

    if (!chars.length) {
      await playSpeechSegment(
        "ยังไม่ได้ระบุ Line ID ค่ะ",
        CONTACT_NORMAL_RATE,
        NORMAL_AUDIO_PLAYBACK_RATE
      );
      return;
    }

    const names = chars.map(lineCharName);

    // Same prefetch strategy as the user's exact app.js.
    const urls = await Promise.all(
      names.map(name => getSpeechUrl(name, LINE_TTS_RATE))
    );

    for (let i = 0; i < names.length; i++) {
      if (urls[i]) {
        await playPreparedUrl(urls[i], LINE_AUDIO_PLAYBACK_RATE);
      } else {
        await playSpeechSegment(
          names[i],
          LINE_TTS_RATE,
          LINE_AUDIO_PLAYBACK_RATE
        );
      }

      if (i < names.length - 1) {
        await sleep(LINE_CHAR_PAUSE_MS);
      }
    }
  }

  async function speakContactList(contacts) {
    if (!Array.isArray(contacts) || !contacts.length) return false;

    await playSpeechSegment(
      `พบข้อมูล Contact ทั้งหมด ${contacts.length} รายการค่ะ`,
      CONTACT_NORMAL_RATE,
      NORMAL_AUDIO_PLAYBACK_RATE
    );

    await sleep(650);

    for (let index = 0; index < contacts.length; index++) {
      const c = contacts[index] || {};
      const name = String(c.name || "ผู้ติดต่อ").trim();

      await playSpeechSegment(
        `รายชื่อคนที่ ${index + 1} ${name} ค่ะ`,
        CONTACT_NORMAL_RATE,
        NORMAL_AUDIO_PLAYBACK_RATE
      );

      await sleep(500);

      await playSpeechSegment(
        "เบอร์โทรศัพท์",
        CONTACT_NORMAL_RATE,
        NORMAL_AUDIO_PLAYBACK_RATE
      );

      await sleep(350);
      await speakPhoneSlow(c.phone);
      await sleep(900);

      await playSpeechSegment(
        "Line ID สะกดทีละตัวช้า ๆ ว่า",
        CONTACT_NORMAL_RATE,
        NORMAL_AUDIO_PLAYBACK_RATE
      );

      await sleep(500);
      await speakLineIdVerySlow(c.line_id);

      if (index < contacts.length - 1) {
        await sleep(1300);

        await playSpeechSegment(
          "ต่อไปค่ะ",
          CONTACT_NORMAL_RATE,
          NORMAL_AUDIO_PLAYBACK_RATE
        );

        await sleep(700);
      }
    }

    await sleep(700);

    await playSpeechSegment(
      "จบข้อมูล Contact ทั้งหมดค่ะ",
      CONTACT_NORMAL_RATE,
      NORMAL_AUDIO_PLAYBACK_RATE
    );

    return true;
  }

  async function speakNormal(text) {
    await playSpeechSegment(
      text,
      "",
      NORMAL_AUDIO_PLAYBACK_RATE
    );
  }

  async function speakAnswer(question, data, callbacks = {}) {
    const contacts = Array.isArray(data?.actions?.contacts)
      ? data.actions.contacts
      : [];

    callbacks.onStart?.();

    try {
      if (isContactQuestion(question) && contacts.length) {
        await speakContactList(contacts);
      } else {
        await speakNormal(data?.speech_answer || data?.answer || "");
      }
    } finally {
      callbacks.onEnd?.();
    }
  }

  window.CherryVoiceV12 = Object.freeze({
    PHONE_DIGIT_PAUSE_MS,
    PHONE_GROUP_PAUSE_MS,
    LINE_CHAR_PAUSE_MS,
    PHONE_TTS_RATE,
    LINE_TTS_RATE,
    CONTACT_NORMAL_RATE,
    PHONE_AUDIO_PLAYBACK_RATE,
    LINE_AUDIO_PLAYBACK_RATE,
    NORMAL_AUDIO_PLAYBACK_RATE,
    formatPhoneDisplay,
    isContactQuestion,
    speakPhoneSlow,
    speakLineIdVerySlow,
    speakContactList,
    speakNormal,
    speakAnswer
  });
})();

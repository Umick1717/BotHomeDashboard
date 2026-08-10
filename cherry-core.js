/* =========================================================
   CHERRY AI CORE
   Shared API / STT / TTS client for floating widget + full page.
   ========================================================= */
(() => {
  "use strict";

  const cfg = window.CHERRY_CONFIG || {};
  const localHosts = new Set(cfg.localHostnames || ["localhost", "127.0.0.1"]);
  const isLocal = localHosts.has(location.hostname);

  const withTimeout = async (promiseFactory, timeoutMs = cfg.requestTimeoutMs || 30000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await promiseFactory(controller.signal);
    } finally {
      clearTimeout(timer);
    }
  };

  const jsonFetch = async (url, options = {}) => {
    const response = await withTimeout(signal => fetch(url, { ...options, signal }));
    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : { raw: await response.text() };
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    return data;
  };

  const blobToBase64 = blob => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      resolve(result.includes(",") ? result.split(",")[1] : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  const pickThaiVoice = () => {
    const voices = speechSynthesis.getVoices();
    return voices.find(v => /^th(-|_)/i.test(v.lang))
      || voices.find(v => /thai/i.test(v.name))
      || voices[0]
      || null;
  };

  class CherryClient {
    constructor() {
      this.capabilities = null;
      this.capabilityPromise = null;
      this.audio = new Audio();
      this.audio.playsInline = true;
    }

    async getCapabilities(force = false) {
      if (this.capabilities && !force) return this.capabilities;
      if (this.capabilityPromise && !force) return this.capabilityPromise;

      this.capabilityPromise = (async () => {
        if (isLocal) {
          try {
            await jsonFetch(`${cfg.localBackend}/api/health`);
            this.capabilities = {
              backend: "local",
              chat: true,
              tts: true,
              stt: true,
              browserSpeechRecognition: !!(window.SpeechRecognition || window.webkitSpeechRecognition)
            };
            return this.capabilities;
          } catch (_) {
            // Local Cherry is not running; fall through to Vercel API.
          }
        }

        try {
          const health = await jsonFetch(`${cfg.publicBackend}?action=health`);
          this.capabilities = {
            backend: "public",
            chat: true,
            tts: !!health?.features?.tts,
            stt: !!health?.features?.stt,
            browserSpeechRecognition: !!(window.SpeechRecognition || window.webkitSpeechRecognition)
          };
        } catch (_) {
          this.capabilities = {
            backend: "offline",
            chat: false,
            tts: false,
            stt: false,
            browserSpeechRecognition: !!(window.SpeechRecognition || window.webkitSpeechRecognition)
          };
        }
        return this.capabilities;
      })();

      try {
        return await this.capabilityPromise;
      } finally {
        this.capabilityPromise = null;
      }
    }

    async chat(message) {
      const caps = await this.getCapabilities();
      const clean = String(message || "").trim();
      if (!clean) throw new Error("กรุณาพิมพ์หรือพูดคำถามค่ะ");

      if (caps.backend === "local") {
        return jsonFetch(`${cfg.localBackend}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: clean })
        });
      }

      return jsonFetch(`${cfg.publicBackend}?action=chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: clean })
      });
    }

    async requestServerSpeech(text, options = {}) {
      const caps = await this.getCapabilities();
      if (!caps.tts) return false;

      const endpoint = caps.backend === "local"
        ? `${cfg.localBackend}/api/speech`
        : `${cfg.publicBackend}?action=speech`;

      const payload = caps.backend === "local"
        ? { text }
        : {
            text,
            speed: Number(options.speed || 1),
            instructions: options.instructions || ""
          };

      const response = await withTimeout(signal => fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal
      }), 45000);

      if (!response.ok) return false;
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("audio/")) return false;

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      this.audio.pause();
      this.audio.src = url;
      this.audio.playbackRate = Number(options.playbackRate || 1);

      await new Promise((resolve, reject) => {
        const cleanup = () => {
          this.audio.onended = null;
          this.audio.onerror = null;
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        };
        this.audio.onended = () => { cleanup(); resolve(); };
        this.audio.onerror = () => { cleanup(); reject(new Error("เล่นเสียง Cherry ไม่สำเร็จ")); };
        this.audio.play().catch(err => { cleanup(); reject(err); });
      });
      return true;
    }

    async browserSpeak(text, options = {}) {
      if (!("speechSynthesis" in window)) return false;
      speechSynthesis.cancel();

      await new Promise(resolve => {
        if (speechSynthesis.getVoices().length) return resolve();
        const timer = setTimeout(resolve, 800);
        speechSynthesis.addEventListener("voiceschanged", () => {
          clearTimeout(timer);
          resolve();
        }, { once: true });
      });

      const utterance = new SpeechSynthesisUtterance(String(text || ""));
      const voice = pickThaiVoice();
      if (voice) utterance.voice = voice;
      utterance.lang = cfg.browserVoice?.lang || "th-TH";
      utterance.rate = Number(options.rate || cfg.browserVoice?.rate || 0.95);
      utterance.pitch = Number(options.pitch || cfg.browserVoice?.pitch || 1.02);
      utterance.volume = Number(options.volume || cfg.browserVoice?.volume || 1);

      await new Promise((resolve, reject) => {
        utterance.onend = resolve;
        utterance.onerror = event => reject(new Error(event.error || "Browser TTS error"));
        speechSynthesis.speak(utterance);
      });
      return true;
    }

    async speak(text, options = {}) {
      const clean = String(text || "").trim();
      if (!clean) return;
      try {
        const serverSpoken = await this.requestServerSpeech(clean, options);
        if (serverSpoken) return;
      } catch (err) {
        console.warn("Cherry server TTS fallback:", err);
      }
      await this.browserSpeak(clean, options);
    }

    async browserRecognition() {
      const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!Recognition) {
        throw new Error("Browser นี้ไม่รองรับ Speech Recognition โดยตรง กรุณาพิมพ์คำถาม หรือเปิด OPENAI_API_KEY บน Vercel");
      }

      return new Promise((resolve, reject) => {
        const recognition = new Recognition();
        recognition.lang = "th-TH";
        recognition.interimResults = false;
        recognition.continuous = false;
        recognition.maxAlternatives = 1;
        recognition.onresult = event => {
          resolve(event.results?.[0]?.[0]?.transcript || "");
        };
        recognition.onerror = event => reject(new Error(event.error || "รับเสียงไม่สำเร็จ"));
        recognition.onend = () => {};
        recognition.start();
      });
    }

    async recordAudio(seconds = cfg.recordSeconds || 7) {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
        throw new Error("อุปกรณ์นี้ไม่รองรับ MediaRecorder");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1
        }
      });

      return new Promise((resolve, reject) => {
        const chunks = [];
        let recorder;
        try {
          const preferred = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
            ? "audio/webm;codecs=opus"
            : "";
          recorder = new MediaRecorder(stream, preferred ? { mimeType: preferred } : undefined);
        } catch (err) {
          stream.getTracks().forEach(t => t.stop());
          return reject(err);
        }

        recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
        recorder.onerror = e => {
          stream.getTracks().forEach(t => t.stop());
          reject(e.error || new Error("บันทึกเสียงไม่สำเร็จ"));
        };
        recorder.onstop = () => {
          stream.getTracks().forEach(t => t.stop());
          resolve(new Blob(chunks, { type: recorder.mimeType || "audio/webm" }));
        };

        recorder.start(250);
        setTimeout(() => {
          if (recorder.state === "recording") recorder.stop();
        }, Math.max(1000, Number(seconds) * 1000));
      });
    }

    async transcribe(blob) {
      const caps = await this.getCapabilities();

      if (caps.backend === "local") {
        const fd = new FormData();
        fd.append("audio", blob, "voice.webm");
        const response = await withTimeout(signal => fetch(`${cfg.localBackend}/api/transcribe`, {
          method: "POST",
          body: fd,
          signal
        }), 60000);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "ถอดเสียงไม่สำเร็จ");
        return data.text || "";
      }

      if (!caps.stt) {
        return this.browserRecognition();
      }

      const audioBase64 = await blobToBase64(blob);
      const data = await jsonFetch(`${cfg.publicBackend}?action=transcribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audio_base64: audioBase64,
          mime_type: blob.type || "audio/webm",
          filename: "voice.webm"
        })
      });
      return data.text || "";
    }

    async listen() {
      const caps = await this.getCapabilities();

      // If the public backend has no STT key, use browser speech recognition directly.
      if (caps.backend !== "local" && !caps.stt && caps.browserSpeechRecognition) {
        return this.browserRecognition();
      }

      const blob = await this.recordAudio(cfg.recordSeconds || 7);
      return this.transcribe(blob);
    }
  }

  window.CherryAI = {
    client: new CherryClient(),
    config: cfg
  };
})();

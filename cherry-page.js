/* =========================================================
   CHERRY FULL PAGE V12
   3 videos + exact Contact voice timing from user's app.js

   idle                 -> cherry-idle.mp4
   listening/thinking   -> cherry-reaction.mp4
   speaking             -> cherry-talking.mp4
   ========================================================= */
(() => {
  "use strict";

  const client = window.CherryAI?.client;
  const voiceEngine = window.CherryVoiceV12;

  if (!client || !voiceEngine) {
    console.error("Cherry V12 core/voice module not loaded");
    return;
  }

  const $ = s => document.querySelector(s);

  const messages = $("#cherryPageMessages");
  const actions = $("#cherryPageActions");
  const form = $("#cherryPageForm");
  const input = $("#cherryPageInput");
  const mic = $("#cherryPageMic");
  const state = $("#cherryPageState");
  const avatar = $("#cherryPageAvatar");
  const video = $("#cherryPageVideo");
  const imageFallback = $("#cherryPageImageFallback");
  const letterFallback = $("#cherryPageFallback");

  const VIDEO_SOURCES = Object.freeze({
    idle: "cherry-assets/cherry-idle.mp4?v=12",
    reaction: "cherry-assets/cherry-reaction.mp4?v=12",
    talking: "cherry-assets/cherry-talking.mp4?v=12"
  });

  let desiredMode = "idle";
  let switchToken = 0;

  const normalizedPath = src => {
    try {
      return new URL(src || "", location.href).pathname;
    } catch (_) {
      return "";
    }
  };

  const configureVideo = () => {
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;

    video.setAttribute("muted", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("loop", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.setAttribute("preload", "auto");
  };

  const showVideo = () => {
    if (video) video.hidden = false;
    if (imageFallback) imageFallback.hidden = true;
    if (letterFallback) letterFallback.hidden = true;
  };

  const showImageFallback = () => {
    if (video) video.hidden = true;
    if (imageFallback) imageFallback.hidden = false;
    if (letterFallback) letterFallback.hidden = true;
  };

  const setAvatarMode = async mode => {
    if (!VIDEO_SOURCES[mode]) mode = "idle";
    desiredMode = mode;

    if (!video) return false;

    configureVideo();

    const token = ++switchToken;
    const wanted = VIDEO_SOURCES[mode];

    if (
      normalizedPath(video.currentSrc || video.src) !==
      normalizedPath(wanted)
    ) {
      try { video.pause(); } catch (_) {}
      video.src = wanted;
      video.load();
    }

    try {
      await video.play();

      if (token !== switchToken || desiredMode !== mode) {
        return false;
      }

      showVideo();
      return true;
    } catch (_) {
      if (token === switchToken) showImageFallback();
      return false;
    }
  };

  const setState = (mode, text) => {
    if (state) state.textContent = text;
    if (avatar) avatar.dataset.state = mode;

    if (mode === "speaking") {
      setAvatarMode("talking");
    } else if (
      mode === "listening" ||
      mode === "thinking" ||
      mode === "reacting"
    ) {
      setAvatarMode("reaction");
    } else {
      setAvatarMode("idle");
    }
  };

  // Preload all 3 videos for faster switching on iOS/Android.
  Object.values(VIDEO_SOURCES).forEach(src => {
    const probe = document.createElement("video");
    probe.preload = "auto";
    probe.muted = true;
    probe.playsInline = true;
    probe.src = src;
    probe.load();
  });

  video?.addEventListener("canplay", showVideo);
  video?.addEventListener("playing", showVideo);
  video?.addEventListener("error", showImageFallback);

  imageFallback?.addEventListener("error", () => {
    if (imageFallback) imageFallback.hidden = true;
    if (letterFallback) letterFallback.hidden = false;
  });

  ["pointerdown", "touchstart"].forEach(eventName => {
    document.addEventListener(
      eventName,
      () => setAvatarMode(desiredMode),
      { passive: true }
    );
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) setAvatarMode(desiredMode);
  });

  window.addEventListener("pageshow", () => {
    setAvatarMode(desiredMode);
  });

  const bubble = (text, type = "assistant") => {
    const div = document.createElement("div");
    div.className = `cherry-page-message cherry-${type}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  };

  const renderActions = data => {
    actions.innerHTML = "";

    const card = (title, detail, url, label = "เปิด") => {
      const item = document.createElement("div");
      item.className = "cherry-page-action";

      const info = document.createElement("div");
      const strong = document.createElement("strong");
      const small = document.createElement("small");

      strong.textContent = title || "";
      small.textContent = detail || "";

      info.append(strong, small);
      item.appendChild(info);

      if (url) {
        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = label;
        item.appendChild(a);
      }

      actions.appendChild(item);
    };

    if (data?.map) {
      card(data.map.label, "Malton Gates", data.map.url, "นำทาง");
    }

    (data?.contacts || []).forEach(c => {
      card(
        c.name,
        `${voiceEngine.formatPhoneDisplay(c.phone)} • LINE: ${c.line_id || "-"}`,
        c.phone ? `tel:${String(c.phone).replace(/\D/g, "")}` : "",
        "โทร"
      );
    });

    (data?.files || []).forEach(f => {
      card(f.name, f.category, f.url, "เปิดไฟล์");
    });

    (data?.appointments || []).slice(0, 8).forEach(a => {
      card(
        `${a.date || ""} ${a.time || ""}`,
        `${a.name || ""}: ${a.details || ""}`,
        "",
        ""
      );
    });
  };

  const speakResponse = async (question, data) => {
    await voiceEngine.speakAnswer(question, data, {
      onStart: () => setState("speaking", "กำลังพูดค่ะ"),
      onEnd: () => setState("idle", "พร้อมรับคำถามค่ะ")
    });
  };

  const ask = async text => {
    const q = String(text || "").trim();
    if (!q) return;

    bubble(q, "user");
    input.value = "";
    actions.innerHTML = "";

    setState("thinking", "กำลังค้นหาข้อมูล...");

    try {
      const data = await client.chat(q);

      bubble(data.answer || "ยังไม่มีคำตอบค่ะ", "assistant");
      renderActions(data.actions || {});

      await speakResponse(q, data);
    } catch (err) {
      bubble(err.message || "เกิดข้อผิดพลาด", "error");
      setState("idle", "กรุณาตรวจสอบการเชื่อมต่อแล้วลองใหม่");
    }
  };

  form.addEventListener("submit", e => {
    e.preventDefault();
    ask(input.value);
  });

  mic.addEventListener("click", async () => {
    mic.classList.add("is-listening");
    setState("listening", "กำลังฟัง... พูดได้เลยค่ะ");

    try {
      const text = await client.listen();

      if (!text) {
        throw new Error("ไม่ได้ยินคำถาม กรุณาลองอีกครั้งค่ะ");
      }

      input.value = text;
      await ask(text);
    } catch (err) {
      bubble(err.message || "รับเสียงไม่สำเร็จ", "error");
      setState("idle", "ลองกดไมโครโฟนใหม่ค่ะ");
    } finally {
      mic.classList.remove("is-listening");
    }
  });

  document.querySelectorAll("[data-cherry-q]").forEach(btn => {
    btn.addEventListener("click", () => {
      ask(btn.dataset.cherryQ || "");
    });
  });

  avatar.addEventListener("click", async () => {
    setState("reacting", "เชอร์รี่กำลังยิ้มและทักทายค่ะ ♡");

    try {
      await voiceEngine.speakNormal(
        "สวัสดีค่ะ ฉันคือเชอร์รี่เอไอ พร้อมช่วยเหลือคุณค่ะ"
      );
    } finally {
      setState("idle", "พร้อมรับคำถามค่ะ");
    }
  });

  configureVideo();
  setAvatarMode("idle");
})();

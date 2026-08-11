/* =========================================================
   CHERRY AI FULL PAGE - 3 VIDEO CROSS-DEVICE FINAL V10

   idle      -> cherry-idle.mp4
   reaction  -> cherry-reaction.mp4
   talking   -> cherry-talking.mp4

   iPhone / iPad / Android / Tablet / Desktop
   ========================================================= */
(() => {
  "use strict";

  const client = window.CherryAI?.client;
  if (!client) return;

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
    idle: "cherry-assets/cherry-idle.mp4?v=10",
    reaction: "cherry-assets/cherry-reaction.mp4?v=10",
    talking: "cherry-assets/cherry-talking.mp4?v=10"
  });

  let currentMode = "idle";
  let desiredMode = "idle";
  let switchingToken = 0;

  // Preload all three videos so switching is faster on mobile.
  const preloadVideos = () => {
    Object.values(VIDEO_SOURCES).forEach(src => {
      const probe = document.createElement("video");
      probe.preload = "auto";
      probe.muted = true;
      probe.playsInline = true;
      probe.src = src;
      probe.load();
    });
  };

  const configureVideoElement = () => {
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.autoplay = true;
    video.playsInline = true;
    video.loop = true;

    video.setAttribute("muted", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.setAttribute("preload", "auto");
  };

  const showVideo = () => {
    if (!video) return;
    video.hidden = false;
    if (imageFallback) imageFallback.hidden = true;
    if (letterFallback) letterFallback.hidden = true;
  };

  const showImageFallback = () => {
    if (video) video.hidden = true;
    if (imageFallback) imageFallback.hidden = false;
    if (letterFallback) letterFallback.hidden = true;
  };

  const showLetterFallback = () => {
    if (video) video.hidden = true;
    if (imageFallback) imageFallback.hidden = true;
    if (letterFallback) letterFallback.hidden = false;
  };

  imageFallback?.addEventListener("error", showLetterFallback);

  const normalizedPath = src => {
    try {
      return new URL(src || "", location.href).pathname;
    } catch (_) {
      return "";
    }
  };

  const playCurrentVideo = async () => {
    if (!video) return false;

    configureVideoElement();

    try {
      await video.play();
      showVideo();
      return true;
    } catch (err) {
      // iOS/in-app browsers may temporarily reject autoplay.
      // The same requested video remains selected; a real user gesture retries it.
      showImageFallback();
      return false;
    }
  };

  const setAvatarMode = async mode => {
    if (!VIDEO_SOURCES[mode]) mode = "idle";
    desiredMode = mode;

    if (!video) return false;

    const token = ++switchingToken;
    const wanted = VIDEO_SOURCES[mode];

    configureVideoElement();

    const currentPath = normalizedPath(video.currentSrc || video.src);
    const wantedPath = normalizedPath(wanted);

    // Keep looping for all 3 states so short videos do not freeze on mobile.
    video.loop = true;

    if (currentPath !== wantedPath) {
      try {
        video.pause();
      } catch (_) {}

      video.src = wanted;
      video.load();
    }

    try {
      await video.play();

      // Ignore stale async play() completions when states changed quickly.
      if (token !== switchingToken || desiredMode !== mode) return false;

      currentMode = mode;
      showVideo();
      return true;
    } catch (err) {
      if (token !== switchingToken) return false;
      showImageFallback();
      return false;
    }
  };

  const setState = (mode, text) => {
    if (state) state.textContent = text;
    if (avatar) avatar.dataset.state = mode;

    // State -> video mapping.
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

  video?.addEventListener("loadeddata", () => {
    if (normalizedPath(video.currentSrc || video.src) === normalizedPath(VIDEO_SOURCES[desiredMode])) {
      showVideo();
      playCurrentVideo().catch(() => {});
    }
  });

  video?.addEventListener("canplay", () => {
    showVideo();
  });

  video?.addEventListener("playing", showVideo);

  video?.addEventListener("error", () => {
    showImageFallback();
  });

  // If a mobile browser pauses video when backgrounded, resume the requested state.
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      setAvatarMode(desiredMode);
    }
  });

  window.addEventListener("pageshow", () => {
    setAvatarMode(desiredMode);
  });

  // Real user gestures unlock video playback on iOS/WebViews.
  const unlockPlayback = () => {
    setAvatarMode(desiredMode);
  };

  ["pointerdown", "touchstart"].forEach(eventName => {
    document.addEventListener(eventName, unlockPlayback, {
      passive: true
    });
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
        `${c.phone || "-"} • LINE: ${c.line_id || "-"}`,
        c.phone ? `tel:${String(c.phone).replace(/\D/g, "")}` : "",
        "โทร"
      );
    });

    (data?.files || []).slice(0, 8).forEach(f => {
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

  const ask = async text => {
    const q = String(text || "").trim();
    if (!q) return;

    bubble(q, "user");
    input.value = "";
    actions.innerHTML = "";

    // Reaction video while Cherry searches/thinks.
    setState("thinking", "กำลังค้นหาข้อมูล...");

    try {
      const data = await client.chat(q);
      const answer = data.answer || "ยังไม่มีคำตอบค่ะ";

      bubble(answer, "assistant");
      renderActions(data.actions || {});

      // Talking video during TTS.
      setState("speaking", "กำลังพูดค่ะ");
      await client.speak(data.speech_answer || answer);

      // Return to idle video.
      setState("idle", "พร้อมรับคำถามค่ะ");
    } catch (err) {
      bubble(err.message || "เกิดข้อผิดพลาด", "error");
      setState("idle", "กรุณาลองใหม่ค่ะ");
    }
  };

  form.addEventListener("submit", e => {
    e.preventDefault();
    ask(input.value);
  });

  mic.addEventListener("click", async () => {
    mic.classList.add("is-listening");

    // Reaction video while listening.
    setState("listening", "กำลังฟัง... พูดได้เลยค่ะ");

    try {
      const text = await client.listen();
      if (!text) throw new Error("ไม่ได้ยินคำถามค่ะ");

      input.value = text;
      await ask(text);
    } catch (err) {
      bubble(err.message || "รับเสียงไม่สำเร็จ", "error");
      setState("idle", "พิมพ์คำถามได้เลยค่ะ");
    } finally {
      mic.classList.remove("is-listening");
    }
  });

  document.querySelectorAll("[data-cherry-q]").forEach(btn => {
    btn.addEventListener("click", () => {
      ask(btn.dataset.cherryQ || "");
    });
  });

  // Tap avatar -> reaction video + greeting voice -> idle.
  avatar.addEventListener("click", async () => {
    setState("reacting", "Cherry กำลังทักทายค่ะ");

    try {
      await client.speak(
        "สวัสดีค่ะ ฉันคือ Cherry AI ผู้ช่วยประจำบ้าน พร้อมช่วยคุณเสมอค่ะ"
      );
    } finally {
      setState("idle", "พร้อมรับคำถามค่ะ");
    }
  });

  configureVideoElement();
  preloadVideos();

  // Initial page state must always be idle video.
  setAvatarMode("idle");
})();

/* =========================================================
   CHERRY FLOATING WIDGET V12
   ready/listening/thinking -> cherry-reaction.mp4
   speaking                 -> cherry-talking.mp4
   exact Contact voice timing via CherryVoiceV12
   ========================================================= */
(() => {
  "use strict";

  const client = window.CherryAI?.client;
  const voiceEngine = window.CherryVoiceV12;

  if (!client || !voiceEngine || document.querySelector("#cherryWidgetRoot")) {
    return;
  }

  const POPUP_VIDEOS = Object.freeze({
    reaction: "cherry-assets/cherry-reaction.mp4?v=12",
    talking: "cherry-assets/cherry-talking.mp4?v=12"
  });

  const POPUP_FALLBACK = "cherry-assets/avatar-agent.png?v=12";

  const root = document.createElement("div");
  root.id = "cherryWidgetRoot";

  root.innerHTML = `
    <button class="cherry-fab" id="cherryFab" type="button" aria-label="เปิด Cherry AI">
      <span class="cherry-fab-pulse"></span>
      <span class="cherry-fab-icon">C</span>
      <span class="cherry-fab-label">Cherry AI</span>
    </button>

    <section class="cherry-widget-panel" id="cherryWidgetPanel" aria-hidden="true">
      <header class="cherry-widget-header">
        <div class="cherry-widget-title">
          <strong>Cherry AI</strong>
          <small><span class="cherry-online-dot"></span> Family Home Assistant</small>
        </div>

        <a class="cherry-full-link" href="cherry.html" aria-label="เปิด Cherry AI เต็มหน้า">
          <i class="fas fa-up-right-from-square"></i>
        </a>

        <button class="cherry-close" id="cherryClose" type="button" aria-label="ปิด Cherry AI">×</button>
      </header>

      <div class="cherry-widget-video-visual">
        <video
          id="cherryWidgetVideo"
          class="cherry-widget-video"
          src="${POPUP_VIDEOS.reaction}"
          poster="${POPUP_FALLBACK}"
          autoplay
          loop
          muted
          playsinline
          webkit-playsinline
          preload="auto"
        ></video>

        <img
          id="cherryWidgetVideoFallback"
          class="cherry-widget-video-fallback"
          src="${POPUP_FALLBACK}"
          alt="Cherry AI"
          hidden
        >
      </div>

      <div class="cherry-widget-messages" id="cherryWidgetMessages" aria-live="polite">
        <div class="cherry-message cherry-assistant">
          สวัสดีค่ะ ฉันคือ Cherry AI ผู้ช่วยประจำบ้าน ถามเรื่องนัดหมาย Contact ไฟล์บ้าน หรือเส้นทางได้เลยค่ะ
        </div>
      </div>

      <div class="cherry-widget-actions" id="cherryWidgetActions"></div>

      <div class="cherry-widget-status" id="cherryWidgetStatus">
        พร้อมรับคำถามค่ะ
      </div>

      <form class="cherry-widget-composer" id="cherryWidgetForm">
        <button class="cherry-mic" id="cherryWidgetMic" type="button" aria-label="พูดกับ Cherry AI">
          <i class="fas fa-microphone"></i>
        </button>

        <input
          id="cherryWidgetInput"
          type="text"
          autocomplete="off"
          placeholder="ถาม Cherry AI..."
          aria-label="คำถามถึง Cherry AI"
        >

        <button class="cherry-send" type="submit" aria-label="ส่งคำถาม">
          <i class="fas fa-paper-plane"></i>
        </button>
      </form>
    </section>
  `;

  document.body.appendChild(root);

  const menu = document.querySelector("#mainMenu > ul");

  if (menu && !menu.querySelector("[data-cherry-menu]")) {
    const li = document.createElement("li");
    li.innerHTML = `
      <a data-cherry-menu href="cherry.html">
        <i class="fas fa-robot"></i>
        Cherry AI
      </a>
    `;
    menu.appendChild(li);
  }

  const fab = document.querySelector("#cherryFab");
  const panel = document.querySelector("#cherryWidgetPanel");
  const close = document.querySelector("#cherryClose");
  const form = document.querySelector("#cherryWidgetForm");
  const input = document.querySelector("#cherryWidgetInput");
  const mic = document.querySelector("#cherryWidgetMic");
  const messages = document.querySelector("#cherryWidgetMessages");
  const actions = document.querySelector("#cherryWidgetActions");
  const status = document.querySelector("#cherryWidgetStatus");
  const video = document.querySelector("#cherryWidgetVideo");
  const fallback = document.querySelector("#cherryWidgetVideoFallback");

  let desiredMode = "reaction";
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
    if (fallback) fallback.hidden = true;
  };

  const showFallback = () => {
    if (video) video.hidden = true;
    if (fallback) fallback.hidden = false;
  };

  const setPopupVideo = async mode => {
    if (!POPUP_VIDEOS[mode]) mode = "reaction";

    desiredMode = mode;

    if (!video) return false;

    configureVideo();

    const token = ++switchToken;
    const wanted = POPUP_VIDEOS[mode];

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
      if (token === switchToken) showFallback();
      return false;
    }
  };

  ["reaction", "talking"].forEach(mode => {
    const probe = document.createElement("video");
    probe.preload = "auto";
    probe.muted = true;
    probe.playsInline = true;
    probe.src = POPUP_VIDEOS[mode];
    probe.load();
  });

  video?.addEventListener("canplay", showVideo);
  video?.addEventListener("playing", showVideo);
  video?.addEventListener("error", showFallback);

  ["pointerdown", "touchstart"].forEach(eventName => {
    panel?.addEventListener(
      eventName,
      () => setPopupVideo(desiredMode),
      { passive: true }
    );
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && panel?.classList.contains("is-open")) {
      setPopupVideo(desiredMode);
    }
  });

  const setOpen = open => {
    panel.classList.toggle("is-open", open);
    panel.setAttribute("aria-hidden", String(!open));
    fab.classList.toggle("is-hidden", open);

    if (open) {
      status.textContent = "พร้อมรับคำถามค่ะ";
      setPopupVideo("reaction");

      setTimeout(() => {
        input.focus({ preventScroll: true });
      }, 150);
    } else {
      try { video?.pause(); } catch (_) {}
    }
  };

  fab.addEventListener("click", () => setOpen(true));
  close.addEventListener("click", () => setOpen(false));

  const addMessage = (text, type = "assistant") => {
    const div = document.createElement("div");
    div.className = `cherry-message cherry-${type}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  };

  const renderActions = data => {
    actions.innerHTML = "";

    const add = (label, url, icon = "fa-arrow-up-right-from-square") => {
      if (!url) return;

      const a = document.createElement("a");
      a.className = "cherry-action-pill";
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener";

      const i = document.createElement("i");
      i.className = `fas ${icon}`;

      const span = document.createElement("span");
      span.textContent = label;

      a.append(i, span);
      actions.appendChild(a);
    };

    if (data?.map) {
      add(data.map.label || "เปิดแผนที่", data.map.url, "fa-location-arrow");
    }

    (data?.files || []).slice(0, 6).forEach(file => {
      add(file.name || "เปิดไฟล์", file.url, "fa-file-pdf");
    });

    (data?.contacts || []).slice(0, 6).forEach(contact => {
      if (contact.phone) {
        add(
          `โทร ${contact.name}`,
          `tel:${String(contact.phone).replace(/\D/g, "")}`,
          "fa-phone"
        );
      }
    });
  };

  const speakResponse = async (question, data) => {
    await voiceEngine.speakAnswer(question, data, {
      onStart: () => {
        status.textContent = "กำลังพูดค่ะ";
        setPopupVideo("talking");
      },
      onEnd: () => {
        status.textContent = "พร้อมรับคำถามค่ะ";
        setPopupVideo("reaction");
      }
    });
  };

  const ask = async text => {
    const question = String(text || "").trim();
    if (!question) return;

    addMessage(question, "user");

    input.value = "";
    actions.innerHTML = "";
    status.textContent = "กำลังคิดคำตอบ...";
    form.classList.add("is-busy");

    setPopupVideo("reaction");

    try {
      const data = await client.chat(question);

      addMessage(data.answer || "ยังไม่มีคำตอบค่ะ", "assistant");
      renderActions(data.actions || {});

      await speakResponse(question, data);
    } catch (err) {
      addMessage(err.message || "เกิดข้อผิดพลาด", "error");
      status.textContent = "เชื่อมต่อ Cherry AI ไม่สำเร็จ";
      setPopupVideo("reaction");
    } finally {
      form.classList.remove("is-busy");
    }
  };

  form.addEventListener("submit", e => {
    e.preventDefault();
    ask(input.value);
  });

  mic.addEventListener("click", async () => {
    mic.classList.add("is-listening");
    status.textContent = "กำลังฟัง... พูดได้เลยค่ะ";
    setPopupVideo("reaction");

    try {
      const text = await client.listen();

      if (!text) {
        throw new Error("ไม่ได้ยินคำถาม กรุณาลองอีกครั้งค่ะ");
      }

      input.value = text;
      await ask(text);
    } catch (err) {
      addMessage(err.message || "รับเสียงไม่สำเร็จ", "error");
      status.textContent = "กรุณาลองใหม่ หรือพิมพ์คำถามค่ะ";
      setPopupVideo("reaction");
    } finally {
      mic.classList.remove("is-listening");
    }
  });

  configureVideo();
})();

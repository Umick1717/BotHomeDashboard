/* =========================================================
   CHERRY AI FLOATING WIDGET
   ========================================================= */
(() => {
  "use strict";

  const client = window.CherryAI?.client;
  if (!client || document.querySelector("#cherryWidgetRoot")) return;

  const el = document.createElement("div");
  el.id = "cherryWidgetRoot";
  el.innerHTML = `
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
        <a class="cherry-full-link" href="cherry.html" aria-label="เปิด Cherry AI เต็มหน้า" title="เปิดเต็มหน้า">
          <i class="fas fa-up-right-from-square"></i>
        </a>
        <button class="cherry-close" id="cherryClose" type="button" aria-label="ปิด Cherry AI">×</button>
      </header>

      <div class="cherry-widget-video-visual">
        <video
          id="cherryWidgetVideo"
          class="cherry-widget-video"
          src="cherry-assets/cherry-floating-agent.mp4?v=7"
          poster="cherry-assets/cherry-floating-exact.png?v=7"
          autoplay
          loop
          muted
          playsinline
          webkit-playsinline
          preload="auto"
          aria-label="Cherry AI Avatar"
        ></video>

        <img
          id="cherryWidgetVideoFallback"
          class="cherry-widget-video-fallback"
          src="cherry-assets/cherry-floating-exact.png?v=7"
          alt="Cherry AI"
          draggable="false"
        >
      </div>

      <div class="cherry-widget-messages" id="cherryWidgetMessages" aria-live="polite">
        <div class="cherry-message cherry-assistant">
          สวัสดีค่ะ ฉันคือ Cherry AI ผู้ช่วยประจำบ้าน ถามเรื่องนัดหมาย Contact ไฟล์บ้าน หรือเส้นทางได้เลยค่ะ
        </div>
      </div>

      <div class="cherry-widget-actions" id="cherryWidgetActions"></div>

      <div class="cherry-widget-status" id="cherryWidgetStatus">พร้อมรับคำถามค่ะ</div>

      <form class="cherry-widget-composer" id="cherryWidgetForm">
        <button class="cherry-mic" id="cherryWidgetMic" type="button" aria-label="พูดกับ Cherry AI">
          <i class="fas fa-microphone"></i>
        </button>
        <input id="cherryWidgetInput" type="text" autocomplete="off"
          placeholder="ถาม Cherry AI..." aria-label="คำถามถึง Cherry AI">
        <button class="cherry-send" type="submit" aria-label="ส่งคำถาม">
          <i class="fas fa-paper-plane"></i>
        </button>
      </form>
    </section>
  `;
  document.body.appendChild(el);

  // Add a permanent menu entry without requiring a large edit to index.html.
  const menu = document.querySelector("#mainMenu > ul");
  if (menu && !menu.querySelector("[data-cherry-menu]")) {
    const li = document.createElement("li");
    li.innerHTML = `
      <a data-cherry-menu href="cherry.html">
        <i class="fas fa-robot"></i>
        Cherry AI
      </a>`;
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

  const floatingVideo = document.querySelector("#cherryWidgetVideo");
  const floatingVideoFallback = document.querySelector("#cherryWidgetVideoFallback");

  const showVideoFallback = () => {
    if (floatingVideo) floatingVideo.hidden = true;
    if (floatingVideoFallback) floatingVideoFallback.hidden = false;
  };

  const showFloatingVideo = () => {
    if (floatingVideo) floatingVideo.hidden = false;
    if (floatingVideoFallback) floatingVideoFallback.hidden = true;
  };

  floatingVideo?.addEventListener("canplay", () => {
    showFloatingVideo();
    floatingVideo.play().catch(() => showVideoFallback());
  });

  floatingVideo?.addEventListener("error", showVideoFallback);

  // iOS/Safari can pause autoplay after a tab becomes inactive.
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && floatingVideo && !floatingVideo.hidden) {
      floatingVideo.play().catch(() => {});
    }
  });

  const setOpen = open => {
    panel.classList.toggle("is-open", open);
    panel.setAttribute("aria-hidden", String(!open));
    fab.classList.toggle("is-hidden", open);
    if (open) {
      floatingVideo?.play().catch(() => {});
      setTimeout(() => input.focus({ preventScroll: true }), 150);
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

    if (data?.map) add(data.map.label || "เปิดแผนที่", data.map.url, "fa-location-arrow");
    (data?.files || []).slice(0, 5).forEach(file => add(file.name || "เปิดไฟล์", file.url, "fa-file-pdf"));
    (data?.contacts || []).slice(0, 6).forEach(contact => {
      if (contact.phone) add(`โทร ${contact.name}`, `tel:${String(contact.phone).replace(/\D/g, "")}`, "fa-phone");
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

    try {
      const data = await client.chat(question);
      const answer = data.answer || "ยังไม่มีคำตอบค่ะ";
      addMessage(answer, "assistant");
      renderActions(data.actions || {});
      status.textContent = "กำลังพูด...";
      await client.speak(data.speech_answer || answer);
      status.textContent = "พร้อมรับคำถามค่ะ";
    } catch (err) {
      addMessage(err.message || "เกิดข้อผิดพลาด", "error");
      status.textContent = "เชื่อมต่อ Cherry AI ไม่สำเร็จ";
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
    try {
      const text = await client.listen();
      if (!text) throw new Error("ไม่ได้ยินคำถาม กรุณาลองอีกครั้งค่ะ");
      input.value = text;
      await ask(text);
    } catch (err) {
      addMessage(err.message || "รับเสียงไม่สำเร็จ", "error");
      status.textContent = "กรุณาลองใหม่ หรือพิมพ์คำถามค่ะ";
    } finally {
      mic.classList.remove("is-listening");
    }
  });
})();

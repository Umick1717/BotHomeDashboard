/* =========================================================
   Cherry Home UI V16
   Progressive enhancement for floating + full-page Cherry UI.
   ========================================================= */
(() => {
  "use strict";

  if (window.__CHERRY_HOME_UI_V16__) return;
  window.__CHERRY_HOME_UI_V16__ = true;

  const FAB_AVATAR = "https://cdn.pixabay.com/photo/2024/08/17/07/18/ai-generated-8975276_1280.jpg";

  const classifyStatus = text => {
    const value = String(text || "").trim();
    if (/กำลังคิด|คิดคำตอบ|กำลังค้นหา/i.test(value)) return "thinking";
    if (/กำลังฟัง|พูดได้เลย/i.test(value)) return "listening";
    if (/กำลังพูด|กำลังตอบ/i.test(value)) return "speaking";
    if (/ไม่สำเร็จ|ผิดพลาด|ลองใหม่|ไม่ได้ยิน/i.test(value)) return "error";
    return "idle";
  };

  const upgradeFab = () => {
    const icon = document.querySelector(".cherry-fab-icon");
    if (!icon || icon.dataset.v16Ready === "1") return !!icon;

    icon.dataset.v16Ready = "1";
    icon.textContent = "";

    const image = document.createElement("img");
    image.src = FAB_AVATAR;
    image.alt = "Cherry AI";
    image.loading = "eager";
    image.decoding = "async";
    image.referrerPolicy = "no-referrer";

    image.addEventListener("error", () => {
      icon.textContent = "AI";
    }, { once: true });

    icon.appendChild(image);
    return true;
  };

  const observeStatus = (selector, key) => {
    const status = document.querySelector(selector);
    if (!status) return false;

    const apply = () => {
      status.dataset.cherryState = classifyStatus(status.textContent);
    };

    apply();
    const attr = `v16Observed${key}`;
    if (status.dataset[attr] !== "1") {
      status.dataset[attr] = "1";
      const observer = new MutationObserver(apply);
      observer.observe(status, { childList: true, characterData: true, subtree: true });
    }
    return true;
  };

  const removeCalendarConnectionStatus = () => {
    const calendarStatus = document.querySelector("#calendarConnectionStatus");
    if (!calendarStatus) return false;
    calendarStatus.hidden = true;
    calendarStatus.setAttribute("aria-hidden", "true");
    return true;
  };

  const enhance = () => {
    const hasFab = document.querySelector(".cherry-fab-icon") ? upgradeFab() : true;
    const popup = document.querySelector("#cherryWidgetStatus") ? observeStatus("#cherryWidgetStatus", "Popup") : true;
    const page = document.querySelector("#cherryPageState") ? observeStatus("#cherryPageState", "Page") : true;
    removeCalendarConnectionStatus();
    return hasFab && popup && page;
  };

  const run = () => {
    enhance();
    const body = document.body;
    if (!body) return;

    const observer = new MutationObserver(enhance);
    observer.observe(body, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 20000);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
})();

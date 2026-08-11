/* =========================================================
   Cherry Home UI V15
   Progressive enhancement for the floating Cherry widget.
   ========================================================= */
(() => {
  "use strict";

  if (window.__CHERRY_HOME_UI_V15__) return;
  window.__CHERRY_HOME_UI_V15__ = true;

  const FAB_AVATAR = "cherry-assets/avatar-agent.png?v=15";

  const classifyStatus = text => {
    const value = String(text || "").trim();

    if (/กำลังคิด|คิดคำตอบ/i.test(value)) return "thinking";
    if (/กำลังฟัง|พูดได้เลย/i.test(value)) return "listening";
    if (/กำลังพูด|กำลังตอบ/i.test(value)) return "speaking";
    if (/ไม่สำเร็จ|ผิดพลาด|ลองใหม่|ไม่ได้ยิน/i.test(value)) return "error";

    return "idle";
  };

  const upgradeFab = () => {
    const icon = document.querySelector(".cherry-fab-icon");
    if (!icon || icon.dataset.v15Ready === "1") return !!icon;

    icon.dataset.v15Ready = "1";
    icon.textContent = "";

    const image = document.createElement("img");
    image.src = FAB_AVATAR;
    image.alt = "Cherry AI";
    image.loading = "eager";
    image.decoding = "async";

    image.addEventListener("error", () => {
      icon.textContent = "AI";
    }, { once: true });

    icon.appendChild(image);
    return true;
  };

  const upgradeStatus = () => {
    const status = document.querySelector("#cherryWidgetStatus");
    if (!status) return false;

    const apply = () => {
      status.dataset.cherryState = classifyStatus(status.textContent);
    };

    apply();

    if (status.dataset.v15Observed !== "1") {
      status.dataset.v15Observed = "1";

      const observer = new MutationObserver(apply);
      observer.observe(status, {
        childList: true,
        characterData: true,
        subtree: true
      });
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
    const fabReady = upgradeFab();
    const statusReady = upgradeStatus();
    removeCalendarConnectionStatus();

    return fabReady && statusReady;
  };

  const run = () => {
    if (enhance()) return;

    const body = document.body;
    if (!body) return;

    const observer = new MutationObserver(() => {
      if (enhance()) observer.disconnect();
    });

    observer.observe(body, {
      childList: true,
      subtree: true
    });

    window.setTimeout(() => observer.disconnect(), 15000);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
})();

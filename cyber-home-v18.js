/* =========================================================
   CYBER FUTURISTIC HOME V18
   Cherry assistance pulse + 5-second helper bubble
   Keeps all existing Cherry MP4/video behavior untouched.
   ========================================================= */
(() => {
  "use strict";

  if (window.__CYBER_HOME_V18__) return;
  window.__CYBER_HOME_V18__ = true;

  const HELP_TEXT = "ต้องการให้ช่วยเหลืออะไรไหมคะ?";
  const SHOW_EVERY_MS = 5000;
  const VISIBLE_MS = 3000;

  const setupCherryPrompt = () => {
    const root = document.querySelector("#cherryWidgetRoot");
    const fab = document.querySelector("#cherryFab");
    const panel = document.querySelector("#cherryWidgetPanel");

    if (!root || !fab || !panel) return false;
    if (root.dataset.cyberPromptReady === "1") return true;
    root.dataset.cyberPromptReady = "1";

    fab.classList.add("cyber-cherry-fab");

    const waves = document.createElement("span");
    waves.className = "cyber-cherry-soundwaves";
    waves.setAttribute("aria-hidden", "true");
    waves.innerHTML = "<i></i><i></i><i></i><i></i><i></i>";
    fab.appendChild(waves);

    const bubble = document.createElement("button");
    bubble.type = "button";
    bubble.className = "cyber-cherry-helper";
    bubble.setAttribute("aria-label", `${HELP_TEXT} เปิด Cherry AI`);
    bubble.innerHTML = `
      <span class="cyber-helper-kicker"><i></i> CHERRY AI</span>
      <strong>${HELP_TEXT}</strong>
      <small>แตะเพื่อคุยกับผู้ช่วยประจำบ้าน</small>
      <span class="cyber-helper-caret" aria-hidden="true"></span>
    `;
    root.appendChild(bubble);

    let hideTimer = 0;

    const isOpen = () => panel.classList.contains("is-open") || panel.getAttribute("aria-hidden") === "false";

    const hide = () => {
      window.clearTimeout(hideTimer);
      bubble.classList.remove("is-visible");
      fab.classList.remove("is-calling");
    };

    const show = () => {
      if (document.hidden || isOpen()) {
        hide();
        return;
      }

      bubble.classList.add("is-visible");
      fab.classList.add("is-calling");
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(hide, VISIBLE_MS);
    };

    const interval = window.setInterval(show, SHOW_EVERY_MS);
    root.dataset.cyberPromptInterval = String(interval);

    bubble.addEventListener("click", () => {
      hide();
      fab.click();
    });

    fab.addEventListener("click", hide);

    const panelObserver = new MutationObserver(() => {
      if (isOpen()) hide();
    });
    panelObserver.observe(panel, { attributes: true, attributeFilter: ["class", "aria-hidden"] });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) hide();
    });

    // First friendly nudge appears shortly after the page settles.
    window.setTimeout(show, 2200);
    return true;
  };

  const enhance = () => {
    if (setupCherryPrompt()) return;

    const target = document.body;
    if (!target) return;

    const observer = new MutationObserver(() => {
      if (setupCherryPrompt()) observer.disconnect();
    });

    observer.observe(target, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 20000);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enhance, { once: true });
  } else {
    enhance();
  }
})();

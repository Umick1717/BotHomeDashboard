/* =========================================================
   FUTURE NAVBAR V17 - PERFORMANCE MODE
   Mouse-follow tilt and click-wave effects intentionally disabled.
   Visual styling remains in future-navbar-v17.css.
   ========================================================= */
(() => {
  "use strict";

  if (window.__FUTURE_NAVBAR_V17__) return;
  window.__FUTURE_NAVBAR_V17__ = true;

  const cleanup = () => {
    document.querySelectorAll("#mainMenu > ul > li > a").forEach(link => {
      link.classList.remove("future-nav-hover", "future-tap-active");
      link.style.removeProperty("--fx-x");
      link.style.removeProperty("--fx-y");
      link.style.removeProperty("--fx-rx");
      link.style.removeProperty("--fx-ry");
    });

    document.querySelectorAll(".future-click-wave").forEach(node => node.remove());
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", cleanup, { once: true });
  } else {
    cleanup();
  }
})();

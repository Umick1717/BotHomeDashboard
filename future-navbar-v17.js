/* =========================================================
   FUTURE NAVBAR V17
   Desktop 3D tilt + touch feedback + click energy wave
   ========================================================= */
(() => {
  "use strict";

  if (window.__FUTURE_NAVBAR_V17__) return;
  window.__FUTURE_NAVBAR_V17__ = true;

  const isFinePointer = () => window.matchMedia?.("(hover:hover) and (pointer:fine)")?.matches;

  const navLinks = () => Array.from(document.querySelectorAll("#mainMenu > ul > li > a"));

  const bindDesktopTilt = link => {
    if (link.dataset.futureTiltBound === "1") return;
    link.dataset.futureTiltBound = "1";

    link.addEventListener("pointermove", event => {
      if (!isFinePointer()) return;

      const rect = link.getBoundingClientRect();
      const px = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      const py = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));

      const ry = (px - .5) * 10;
      const rx = (.5 - py) * 8;

      link.style.setProperty("--fx-x", `${(px * 100).toFixed(1)}%`);
      link.style.setProperty("--fx-y", `${(py * 100).toFixed(1)}%`);
      link.style.setProperty("--fx-rx", `${rx.toFixed(2)}deg`);
      link.style.setProperty("--fx-ry", `${ry.toFixed(2)}deg`);
      link.classList.add("future-nav-hover");
    });

    const reset = () => {
      link.classList.remove("future-nav-hover");
      link.style.removeProperty("--fx-rx");
      link.style.removeProperty("--fx-ry");
    };

    link.addEventListener("pointerleave", reset);
    link.addEventListener("blur", reset);
  };

  const bindTouch = link => {
    if (link.dataset.futureTouchBound === "1") return;
    link.dataset.futureTouchBound = "1";

    const on = () => link.classList.add("future-tap-active");
    const off = () => link.classList.remove("future-tap-active");

    link.addEventListener("touchstart", on, { passive: true });
    link.addEventListener("touchend", off, { passive: true });
    link.addEventListener("touchcancel", off, { passive: true });
  };

  const addWave = (x, y) => {
    const wave = document.createElement("span");
    wave.className = "future-click-wave";
    wave.style.left = `${x}px`;
    wave.style.top = `${y}px`;
    document.body.appendChild(wave);
    window.setTimeout(() => wave.remove(), 700);
  };

  const bindClickWave = link => {
    if (link.dataset.futureWaveBound === "1") return;
    link.dataset.futureWaveBound = "1";

    link.addEventListener("pointerdown", event => {
      addWave(event.clientX, event.clientY);
    });
  };

  const enhance = () => {
    navLinks().forEach(link => {
      bindDesktopTilt(link);
      bindTouch(link);
      bindClickWave(link);
    });
  };

  const observe = () => {
    enhance();

    const target = document.querySelector("#mainMenu") || document.body;
    if (!target) return;

    const observer = new MutationObserver(enhance);
    observer.observe(target, { childList: true, subtree: true });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", observe, { once: true });
  } else {
    observe();
  }
})();

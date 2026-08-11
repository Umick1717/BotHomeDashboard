/* =========================================================
   Snow36 AI Cursor + Touch FX V16
   ========================================================= */
(() => {
  "use strict";

  if (window.__snow36AiFxLoaded) return;
  window.__snow36AiFxLoaded = true;

  const coarse = matchMedia("(pointer: coarse)").matches || matchMedia("(hover: none)").matches;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const burst = (x, y, className) => {
    if (reduced) return;
    const el = document.createElement("span");
    el.className = className;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 750);
  };

  if (coarse) {
    document.addEventListener("pointerdown", e => {
      if (e.pointerType === "touch" || e.pointerType === "pen") {
        burst(e.clientX, e.clientY, "ai-touch-halo");
      }
    }, { passive: true });
    return;
  }

  const dot = document.createElement("span");
  const ring = document.createElement("span");
  dot.className = "ai-cursor-dot";
  ring.className = "ai-cursor-ring";
  document.body.append(dot, ring);

  document.documentElement.classList.add("ai-pointer-active");

  let x = innerWidth / 2;
  let y = innerHeight / 2;
  let rx = x;
  let ry = y;
  let raf = 0;

  const draw = () => {
    rx += (x - rx) * .22;
    ry += (y - ry) * .22;
    dot.style.transform = `translate3d(${x}px,${y}px,0)`;
    ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
    raf = requestAnimationFrame(draw);
  };
  raf = requestAnimationFrame(draw);

  document.addEventListener("pointermove", e => {
    x = e.clientX;
    y = e.clientY;
    const interactive = e.target.closest?.("a,button,input,textarea,select,[role='button'],label,.file-card,.menu-card");
    ring.classList.toggle("is-hover", !!interactive);
  }, { passive: true });

  document.addEventListener("pointerdown", e => {
    ring.classList.add("is-down");
    burst(e.clientX, e.clientY, "ai-click-burst");
  }, { passive: true });

  document.addEventListener("pointerup", () => ring.classList.remove("is-down"), { passive: true });
  document.addEventListener("pointercancel", () => ring.classList.remove("is-down"), { passive: true });
  window.addEventListener("blur", () => document.documentElement.classList.remove("ai-pointer-active"));
  window.addEventListener("focus", () => document.documentElement.classList.add("ai-pointer-active"));

  window.addEventListener("pagehide", () => cancelAnimationFrame(raf), { once: true });
})();

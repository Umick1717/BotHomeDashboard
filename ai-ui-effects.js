/* =========================================================
   Snow36 AI Cursor + Heart Touch FX V19.1
   ========================================================= */
(() => {
  "use strict";

  if (window.__snow36AiFxLoaded) return;
  window.__snow36AiFxLoaded = true;

  const coarse = matchMedia("(pointer: coarse)").matches || matchMedia("(hover: none)").matches;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const heartBurst = (x, y) => {
    if (reduced) return;
    const frag = document.createDocumentFragment();
    const count = coarse ? 7 : 9;

    for (let i = 0; i < count; i += 1) {
      const heart = document.createElement("span");
      heart.className = "ai-heart-particle";
      heart.textContent = i % 3 === 0 ? "💗" : (i % 2 ? "💖" : "💕");
      const angle = (Math.PI * 2 * i / count) + (Math.random() * .35 - .175);
      const distance = 34 + Math.random() * 42;
      heart.style.left = `${x}px`;
      heart.style.top = `${y}px`;
      heart.style.setProperty("--hx", `${Math.cos(angle) * distance}px`);
      heart.style.setProperty("--hy", `${Math.sin(angle) * distance}px`);
      heart.style.setProperty("--hr", `${Math.round(Math.random() * 80 - 40)}deg`);
      heart.style.setProperty("--hs", `${(.75 + Math.random() * .7).toFixed(2)}`);
      frag.appendChild(heart);
      setTimeout(() => heart.remove(), 900);
    }
    document.body.appendChild(frag);
  };

  if (coarse) {
    document.addEventListener("pointerdown", e => {
      if (e.pointerType === "touch" || e.pointerType === "pen") {
        heartBurst(e.clientX, e.clientY);
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
    rx += (x - rx) * .38;
    ry += (y - ry) * .38;
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
    heartBurst(e.clientX, e.clientY);
  }, { passive: true });

  document.addEventListener("pointerup", () => ring.classList.remove("is-down"), { passive: true });
  document.addEventListener("pointercancel", () => ring.classList.remove("is-down"), { passive: true });
  window.addEventListener("blur", () => document.documentElement.classList.remove("ai-pointer-active"));
  window.addEventListener("focus", () => document.documentElement.classList.add("ai-pointer-active"));
  window.addEventListener("pagehide", () => cancelAnimationFrame(raf), { once: true });
})();

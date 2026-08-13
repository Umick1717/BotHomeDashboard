/* =========================================================
   SNOW36 PERFORMANCE LITE V20
   Runtime performance controller
   ========================================================= */
(() => {
  "use strict";

  if (window.__SNOW36_PERFORMANCE_LITE_V20__) return;
  window.__SNOW36_PERFORMANCE_LITE_V20__ = true;

  const coarse = matchMedia("(pointer:coarse)").matches || matchMedia("(hover:none)").matches;
  const mobile = innerWidth <= 991;
  const saveData = navigator.connection?.saveData === true;
  const lowMemory = typeof navigator.deviceMemory === "number" && navigator.deviceMemory <= 4;
  const lite = coarse || mobile || saveData || lowMemory;

  document.documentElement.classList.add("performance-lite-v20");
  if (lite) document.documentElement.classList.add("performance-lite-v20-mobile");

  const trimSnow = () => {
    const flakes = Array.from(document.querySelectorAll("#snowContainer .snowflake"));
    const keep = lite ? 10 : 24;
    flakes.slice(keep).forEach(node => node.remove());
  };

  const stopLegacyNavFx = () => {
    document.querySelectorAll("#mainMenu > ul > li > a").forEach(link => {
      link.classList.remove("future-nav-hover", "future-tap-active");
      link.style.removeProperty("--fx-x");
      link.style.removeProperty("--fx-y");
      link.style.removeProperty("--fx-rx");
      link.style.removeProperty("--fx-ry");
    });
  };

  const removeTransientFx = () => {
    document.querySelectorAll(".future-click-wave,.ai-heart-particle").forEach(node => node.remove());
  };

  const optimizeCherryVideo = () => {
    const panel = document.querySelector("#cherryWidgetPanel");
    const video = document.querySelector("#cherryWidgetVideo");
    if (!video || !panel) return;

    video.preload = "metadata";

    const sync = () => {
      const open = panel.classList.contains("is-open") || panel.getAttribute("aria-hidden") === "false";
      if (!open) {
        try { video.pause(); } catch (_) {}
      }
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(panel, { attributes:true, attributeFilter:["class", "aria-hidden"] });
  };

  const optimize = () => {
    trimSnow();
    stopLegacyNavFx();
    removeTransientFx();
    optimizeCherryVideo();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", optimize, { once:true });
  } else {
    optimize();
  }

  /* Short startup observer only: catch snow/Cherry nodes created after DOM ready. */
  const target = document.body || document.documentElement;
  if (target) {
    const observer = new MutationObserver(() => {
      trimSnow();
      removeTransientFx();
    });
    observer.observe(target, { childList:true, subtree:true });
    setTimeout(() => observer.disconnect(), 5000);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      document.querySelectorAll("video").forEach(video => {
        if (!video.closest("#cherryWidgetPanel.is-open")) {
          try { video.pause(); } catch (_) {}
        }
      });
    }
  });
})();

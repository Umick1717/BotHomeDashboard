/* =========================================================
   CYBER FUTURISTIC HOME V19
   Real-time decorative status rail + immediate Calendar status hiding.
   No fake weather values are injected.
   ========================================================= */
(() => {
  "use strict";

  if (window.__CYBER_HOME_V19__) return;
  window.__CYBER_HOME_V19__ = true;

  const hideCalendarStatus = () => {
    const nodes = document.querySelectorAll("#calendarConnectionStatus, .calendar-connection-status");
    nodes.forEach(node => {
      node.hidden = true;
      node.setAttribute("aria-hidden", "true");
      node.style.display = "none";
    });
  };

  const buildStatusRail = () => {
    const home = document.querySelector("#home");
    if (!home || home.querySelector(".cyber-v19-status-rail")) return;

    const rail = document.createElement("aside");
    rail.className = "cyber-v19-status-rail";
    rail.setAttribute("aria-hidden", "true");
    rail.innerHTML = `
      <section class="cyber-v19-card">
        <small>Snow36 Home Time</small>
        <div class="cyber-v19-clock" data-v19-clock>--:--</div>
        <div class="cyber-v19-date" data-v19-date>กำลังโหลดเวลา...</div>
      </section>
      <section class="cyber-v19-card">
        <small>Smart Home</small>
        <div class="cyber-v19-system-row"><span>Dashboard</span><strong class="cyber-v19-ok">ONLINE</strong></div>
        <div class="cyber-v19-system-row"><span>Cherry AI</span><strong class="cyber-v19-ok">READY</strong></div>
      </section>
    `;
    home.appendChild(rail);

    const clock = rail.querySelector("[data-v19-clock]");
    const date = rail.querySelector("[data-v19-date]");

    const renderTime = () => {
      const now = new Date();
      if (clock) {
        clock.textContent = new Intl.DateTimeFormat("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "Asia/Bangkok"
        }).format(now);
      }
      if (date) {
        date.textContent = new Intl.DateTimeFormat("th-TH", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
          timeZone: "Asia/Bangkok"
        }).format(now);
      }
    };

    renderTime();
    window.setInterval(renderTime, 30000);
  };

  const enhance = () => {
    hideCalendarStatus();
    buildStatusRail();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enhance, { once: true });
  } else {
    enhance();
  }

  const observer = new MutationObserver(() => {
    hideCalendarStatus();
    buildStatusRail();
  });

  const startObserver = () => {
    if (document.body) observer.observe(document.body, { childList: true, subtree: true });
  };

  if (document.body) startObserver();
  else document.addEventListener("DOMContentLoaded", startObserver, { once: true });
})();

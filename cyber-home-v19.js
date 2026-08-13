/* =========================================================
   CYBER FUTURISTIC HOME V20 LITE
   - Snow36 time / weather / smart-home / member rail
   - Lightweight Calendar-status suppression
   - No continuous full-DOM scanning
   ========================================================= */
(() => {
  "use strict";

  if (window.__CYBER_HOME_V19__) return;
  window.__CYBER_HOME_V19__ = true;

  const CALENDAR_TEXT = "กำลังตรวจสอบการเชื่อมต่อ Calendar API";
  const WEATHER_URL = "https://api.open-meteo.com/v1/forecast?latitude=13.7563&longitude=100.5018&current=temperature_2m,apparent_temperature,weather_code&timezone=Asia%2FBangkok";

  const hideElement = node => {
    if (!(node instanceof Element)) return;
    node.hidden = true;
    node.setAttribute("aria-hidden", "true");
    node.style.setProperty("display", "none", "important");
  };

  const hideCalendarStatus = root => {
    const scope = root?.querySelectorAll ? root : document;
    scope.querySelectorAll?.("#calendarConnectionStatus,.calendar-connection-status,[data-calendar-connection-status]").forEach(hideElement);

    scope.querySelectorAll?.("[role='status'],[role='alert'],.dashboard-toast").forEach(node => {
      const text = String(node.textContent || "").replace(/\s+/g, " ").trim();
      if (text.includes(CALENDAR_TEXT)) hideElement(node);
    });
  };

  const weatherMeta = code => {
    const c = Number(code);
    if (c === 0) return { icon: "☀️", label: "ท้องฟ้าแจ่มใส" };
    if ([1,2].includes(c)) return { icon: "🌤️", label: "มีเมฆบางส่วน" };
    if (c === 3) return { icon: "☁️", label: "มีเมฆมาก" };
    if ([45,48].includes(c)) return { icon: "🌫️", label: "มีหมอก" };
    if ([51,53,55,56,57].includes(c)) return { icon: "🌦️", label: "ฝนปรอย" };
    if ([61,63,65,66,67,80,81,82].includes(c)) return { icon: "🌧️", label: "มีฝน" };
    if ([71,73,75,77,85,86].includes(c)) return { icon: "❄️", label: "หิมะ" };
    if ([95,96,99].includes(c)) return { icon: "⛈️", label: "พายุฝนฟ้าคะนอง" };
    return { icon: "🌡️", label: "สภาพอากาศปัจจุบัน" };
  };

  const updateWeather = async rail => {
    const temp = rail.querySelector("[data-v19-weather-temp]");
    const feels = rail.querySelector("[data-v19-weather-feels]");
    const icon = rail.querySelector("[data-v19-weather-icon]");
    const label = rail.querySelector("[data-v19-weather-label]");

    try {
      const response = await fetch(WEATHER_URL, { cache: "no-store" });
      if (!response.ok) throw new Error(`Weather HTTP ${response.status}`);
      const data = await response.json();
      const current = data?.current || {};
      const meta = weatherMeta(current.weather_code);

      if (temp) temp.textContent = Number.isFinite(Number(current.temperature_2m)) ? `${Math.round(Number(current.temperature_2m))}°C` : "--°C";
      if (feels) feels.textContent = Number.isFinite(Number(current.apparent_temperature)) ? `${Math.round(Number(current.apparent_temperature))}°` : "--°";
      if (icon) icon.textContent = meta.icon;
      if (label) label.textContent = `${meta.label} • Bangkok`;
    } catch (error) {
      if (icon) icon.textContent = "🌐";
      if (temp) temp.textContent = "--°C";
      if (feels) feels.textContent = "--°";
      if (label) label.textContent = "Weather service unavailable";
      console.warn("[Snow36 Weather]", error);
    }
  };

  const buildStatusRail = () => {
    const home = document.querySelector("#home");
    if (!home || home.querySelector(".cyber-v19-status-rail")) return null;

    const rail = document.createElement("aside");
    rail.className = "cyber-v19-status-rail";
    rail.setAttribute("aria-label", "Snow36 home status");
    rail.innerHTML = `
      <section class="cyber-v19-card cyber-v19-time-card">
        <small>SNOW36 HOME TIME</small>
        <div class="cyber-v19-clock" data-v19-clock>--:--</div>
        <div class="cyber-v19-date" data-v19-date>กำลังโหลดเวลา...</div>
      </section>
      <section class="cyber-v19-card cyber-v19-weather-card">
        <small>SNOW36 WEATHER</small>
        <div class="cyber-v19-weather-main">
          <span class="cyber-v19-weather-icon" data-v19-weather-icon>◌</span>
          <strong data-v19-weather-temp>--°C</strong>
        </div>
        <div class="cyber-v19-weather-label" data-v19-weather-label>กำลังโหลดสภาพอากาศ...</div>
        <div class="cyber-v19-system-row"><span>Feels like</span><strong data-v19-weather-feels>--°</strong></div>
      </section>
      <section class="cyber-v19-card cyber-v19-smart-card">
        <small>SMART HOME</small>
        <div class="cyber-v19-system-row"><span>Dashboard</span><strong class="cyber-v19-ok">ONLINE</strong></div>
        <div class="cyber-v19-system-row"><span>Cherry AI</span><strong class="cyber-v19-ok">READY</strong></div>
      </section>
      <section class="cyber-v19-card cyber-v19-member-card">
        <small>SNOW36 MEMBER</small>
        <div class="cyber-v19-members">
          <div><span class="cyber-v19-member-avatar">P</span><b>P'Mick</b></div>
          <div><span class="cyber-v19-member-avatar">M</span><b>Mamabear</b></div>
          <div><span class="cyber-v19-member-avatar">U</span><b>Umick</b></div>
          <div><span class="cyber-v19-member-avatar">I</span><b>Imick</b></div>
        </div>
      </section>
    `;
    home.appendChild(rail);

    const clock = rail.querySelector("[data-v19-clock]");
    const date = rail.querySelector("[data-v19-date]");
    const timeFormatter = new Intl.DateTimeFormat("th-TH", { hour:"2-digit", minute:"2-digit", hour12:false, timeZone:"Asia/Bangkok" });
    const dateFormatter = new Intl.DateTimeFormat("th-TH", { weekday:"short", day:"numeric", month:"short", year:"numeric", timeZone:"Asia/Bangkok" });

    const renderTime = () => {
      const now = new Date();
      if (clock) clock.textContent = timeFormatter.format(now);
      if (date) date.textContent = dateFormatter.format(now);
    };

    renderTime();
    updateWeather(rail);
    window.setInterval(renderTime, 60000);
    window.setInterval(() => {
      if (!document.hidden) updateWeather(rail);
    }, 15 * 60 * 1000);
    return rail;
  };

  const enhance = () => {
    hideCalendarStatus(document);
    buildStatusRail();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enhance, { once:true });
  } else {
    enhance();
  }

  /* Observe only briefly during startup, then disconnect. */
  const target = document.documentElement;
  if (target) {
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof Element) hideCalendarStatus(node);
        }
      }
    });
    observer.observe(target, { childList:true, subtree:true });
    window.setTimeout(() => observer.disconnect(), 6000);
  }
})();

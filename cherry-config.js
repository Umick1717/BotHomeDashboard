/* Cherry AI - HomeDashboard integration configuration */
window.CHERRY_CONFIG = Object.freeze({
  localBackend: "http://127.0.0.1:5057",
  publicBackend: "/api/cherry",
  fullPageUrl: "cherry.html",
  recordSeconds: 7,
  requestTimeoutMs: 30000,
  browserVoice: {
    lang: "th-TH",
    rate: 0.95,
    pitch: 1.02,
    volume: 1
  },
  localHostnames: ["localhost", "127.0.0.1"]
});

/* V19.2 FIRST-PAINT STATUS GUARD
 * Starts synchronously before DOMContentLoaded so startup Calendar/Google Sheets
 * messages do not flash in the lower-right corner during the splash screen.
 */
(() => {
  if (window.__SNOW36_STARTUP_STATUS_GUARD__) return;
  window.__SNOW36_STARTUP_STATUS_GUARD__ = true;

  const blocked = [
    "กำลังตรวจสอบการเชื่อมต่อ Calendar API",
    "กำลังโหลดนัดหมายจาก Google Sheets",
    "กำลังโหลดข้อความจาก Google Sheets"
  ];

  const hide = node => {
    if (!(node instanceof Element)) return;
    const text = String(node.textContent || "").replace(/\s+/g, " ").trim();
    if (!blocked.some(phrase => text.includes(phrase))) return;
    node.hidden = true;
    node.setAttribute("aria-hidden", "true");
    node.style.setProperty("display", "none", "important");
  };

  const scan = root => {
    if (!(root instanceof Element || root instanceof Document)) return;
    if (root instanceof Element) hide(root);
    root.querySelectorAll?.("#calendarConnectionStatus,.calendar-connection-status,.dashboard-toast,[role='status'],[role='alert']").forEach(hide);
  };

  scan(document);
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => mutation.addedNodes.forEach(node => {
      if (node instanceof Element) scan(node);
    }));
  });

  const target = document.documentElement;
  if (target) observer.observe(target, { childList: true, subtree: true });
  window.setTimeout(() => observer.disconnect(), 12000);
})();

(() => {
  if (window.__EXPENSE_MENU_V13_LOADER__) return;
  window.__EXPENSE_MENU_V13_LOADER__ = true;
  const script = document.createElement("script");
  script.src = "expense-menu-v13.js?v=13";
  script.async = false;
  script.dataset.expenseMenuLoader = "v13";
  document.head.appendChild(script);
})();

(() => {
  if (window.__NUICE_EXPENSE_MENU_V14_LOADER__) return;
  window.__NUICE_EXPENSE_MENU_V14_LOADER__ = true;
  const script = document.createElement("script");
  script.src = "expense-menu-v14-nuice.js?v=14";
  script.async = false;
  script.dataset.expenseNuIceLoader = "v14";
  document.head.appendChild(script);
})();

(() => {
  if (window.__CHERRY_HOME_UI_V16_LOADER__) return;
  window.__CHERRY_HOME_UI_V16_LOADER__ = true;
  const addCss = (href, key) => {
    if (document.querySelector(`link[data-${key}]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute(`data-${key}`, "1");
    document.head.appendChild(link);
  };
  const addScript = (src, key) => {
    if (document.querySelector(`script[data-${key}]`)) return;
    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    script.setAttribute(`data-${key}`, "1");
    document.head.appendChild(script);
  };
  addCss("cherry-home-ui-v15.css?v=16", "cherry-home-ui-v16");
  addCss("ai-ui-effects.css?v=19.2", "ai-ui-effects-v16");
  addScript("cherry-home-ui-v15.js?v=16", "cherry-home-ui-v16");
  addScript("cherry-line-actions-v16.js?v=16", "cherry-line-actions-v16");
  addScript("ai-ui-effects.js?v=19.2", "ai-ui-effects-v16");
})();

(() => {
  if (window.__FUTURE_NAV_V17_LOADER__) return;
  window.__FUTURE_NAV_V17_LOADER__ = true;
  if (!document.querySelector('link[data-future-nav-v17]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "future-navbar-v17.css?v=17";
    link.dataset.futureNavV17 = "1";
    document.head.appendChild(link);
  }
  if (!document.querySelector('script[data-future-nav-v17]')) {
    const script = document.createElement("script");
    script.src = "future-navbar-v17.js?v=17";
    script.defer = true;
    script.dataset.futureNavV17 = "1";
    document.head.appendChild(script);
  }
})();

(() => {
  if (window.__CYBER_HOME_V18_LOADER__) return;
  window.__CYBER_HOME_V18_LOADER__ = true;
  const addCss = (href, key) => {
    if (document.querySelector(`link[data-${key}]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute(`data-${key}`, "1");
    document.head.appendChild(link);
  };
  const addScript = (src, key) => {
    if (document.querySelector(`script[data-${key}]`)) return;
    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    script.setAttribute(`data-${key}`, "1");
    document.head.appendChild(script);
  };
  addCss("cyber-home-v18.css?v=18", "cyber-home-v18");
  addCss("cyber-cherry-v18.css?v=18", "cyber-cherry-v18");
  addScript("cyber-home-v18.js?v=18", "cyber-home-v18");
})();

(() => {
  if (window.__CYBER_HOME_V19_LOADER__) return;
  window.__CYBER_HOME_V19_LOADER__ = true;

  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = "cyber-home-v19.css?v=19.3";
  css.dataset.cyberHomeV19 = "1";
  document.head.appendChild(css);

  const script = document.createElement("script");
  script.src = "cyber-home-v19.js?v=19.2";
  script.defer = true;
  script.dataset.cyberHomeV19 = "1";
  document.head.appendChild(script);
})();

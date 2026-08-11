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

/* HomeDashboard Expense Dropdown V13 loader */
(() => {
  if (window.__EXPENSE_MENU_V13_LOADER__) return;
  window.__EXPENSE_MENU_V13_LOADER__ = true;

  const script = document.createElement("script");
  script.src = "expense-menu-v13.js?v=13";
  script.async = false;
  script.dataset.expenseMenuLoader = "v13";
  document.head.appendChild(script);
})();

/* Nu'Ice dedicated Expense page V14 route */
(() => {
  if (window.__NUICE_EXPENSE_MENU_V14_LOADER__) return;
  window.__NUICE_EXPENSE_MENU_V14_LOADER__ = true;

  const script = document.createElement("script");
  script.src = "expense-menu-v14-nuice.js?v=14";
  script.async = false;
  script.dataset.expenseNuIceLoader = "v14";
  document.head.appendChild(script);
})();

/* Cherry Home UI V16
 * - Pixabay AI portrait on floating button
 * - animated hearts on popup + full Cherry page while thinking/listening/speaking
 * - LINE Add Friend + App Store + Google Play actions
 * - AI cursor for mouse/trackpad and touch halo for phone/tablet
 */
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
  addCss("ai-ui-effects.css?v=16", "ai-ui-effects-v16");

  addScript("cherry-home-ui-v15.js?v=16", "cherry-home-ui-v16");
  addScript("cherry-line-actions-v16.js?v=16", "cherry-line-actions-v16");
  addScript("ai-ui-effects.js?v=16", "ai-ui-effects-v16");
})();

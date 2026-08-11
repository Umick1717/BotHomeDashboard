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

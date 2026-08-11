/* Expense Menu Nu'Ice V14
 * Overrides only the Nu'Ice tracker destination from the direct
 * Google Sheet URL to the new responsive Nu'Ice input page.
 */
(() => {
  "use strict";

  if (window.__NUICE_EXPENSE_MENU_V14__) return;
  window.__NUICE_EXPENSE_MENU_V14__ = true;

  const NUICE_PAGE = "nuice-expense.html";

  document.addEventListener(
    "click",
    event => {
      const target = event.target.closest('[data-expense-tracker="nuice"]');
      if (!target) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      if (typeof window.showToast === "function") {
        window.showToast(
          "กำลังเปิด My Expense Tracker 2026 Nu'Ice...",
          "success",
          1200
        );
      }

      window.setTimeout(() => {
        window.location.href = NUICE_PAGE;
      }, 350);
    },
    true
  );
})();

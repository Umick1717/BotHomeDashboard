(() => {
  'use strict';

  const goToExpense = () => {
    try {
      if (typeof navigateToPage === 'function') {
        navigateToPage('expense');
        return;
      }
    } catch (_) {}
    location.hash = '#expense';
  };

  const bindHeroButton = () => {
    const btn = document.getElementById('gotoExpense');
    if (!btn || btn.dataset.expenseChoiceBound === '1') return;
    btn.dataset.expenseChoiceBound = '1';
    btn.addEventListener('click', event => {
      event.preventDefault();
      goToExpense();
    }, true);
  };

  const bindNuIce = () => {
    const btn = document.getElementById('openNuIceExpense');
    if (!btn || btn.dataset.nuiceBound === '1') return;
    btn.dataset.nuiceBound = '1';
    btn.addEventListener('click', () => {
      const url = window.NUICE_EXPENSE_URL || 'https://bot-home-dashboard.vercel.app/nuice-expense.html';
      if (!url) {
        if (typeof showToast === 'function') {
          showToast("ยังไม่ได้ตั้งค่าลิงก์ My Expense Tracker 2026 Nu'Ice", 'warning', 4200);
        } else {
          alert("ยังไม่ได้ตั้งค่าลิงก์ My Expense Tracker 2026 Nu'Ice");
        }
        return;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  };

  const syncExpenseFocus = () => {
    const isExpense = location.hash === '#expense';
    document.body.classList.toggle('expense-focus-mode', isExpense);
    const selectors = [
      '.market-intelligence',
      '#marketIntelligence',
      '[data-home-market-intelligence]',
      '.home-market-intelligence',
      '.market-dashboard',
      '.market-intelligence-section'
    ];
    document.querySelectorAll(selectors.join(',')).forEach(el => {
      el.hidden = isExpense;
    });
  };

  const init = () => {
    bindHeroButton();
    bindNuIce();
    syncExpenseFocus();
  };

  window.addEventListener('hashchange', syncExpenseFocus);
  init();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once:true });
  }
})();
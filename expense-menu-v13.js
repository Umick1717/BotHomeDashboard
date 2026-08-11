/* =========================================================
   FAMILY HOME DASHBOARD
   Expense Dropdown V13

   - My Expense Tracker 2026-Mick
     Keeps the existing tracker URL already used by HomeDashboard.
   - My Expense Tracker 2026 Nu'Ice
     Opens the supplied Google Sheet.
   - Keeps the existing HomeDashboard loading/toast behavior.
   ========================================================= */
(() => {
  "use strict";

  if (window.__EXPENSE_MENU_V13_LOADED__) return;
  window.__EXPENSE_MENU_V13_LOADED__ = true;

  const TRACKERS = Object.freeze({
    mick: Object.freeze({
      key: "mick",
      label: "My Expense Tracker 2026-Mick",
      description: "ระบบเดิม / Google Sheet เดิมของ Mick",
      url: "https://umick.vercel.app/",
      icon: "fa-wallet"
    }),
    nuice: Object.freeze({
      key: "nuice",
      label: "My Expense Tracker 2026 Nu'Ice",
      description: "Google Sheet สำหรับ Nu'Ice",
      url: "https://docs.google.com/spreadsheets/d/1_G5dDFWUcAb_dANQ8GVF5VL6v3QDTOxhJD8Fc0nUPos/edit?gid=34336380#gid=34336380",
      icon: "fa-file-excel"
    })
  });

  window.EXPENSE_TRACKER_CONFIG = TRACKERS;

  function injectExpenseStyles() {
    if (document.getElementById("expenseMenuV13Styles")) return;

    const style = document.createElement("style");
    style.id = "expenseMenuV13Styles";
    style.textContent = `
      #mainMenu > ul > li.expense-dropdown {
        position: relative;
      }

      #mainMenu .expense-dropdown > a .expense-chevron {
        margin-left: 7px;
        transition: transform .25s ease;
      }

      #mainMenu .expense-dropdown.is-open > a .expense-chevron {
        transform: rotate(180deg);
      }

      #mainMenu .expense-dropdown .expense-submenu {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        min-width: 310px;
        padding: 8px;
        border-radius: 14px;
        background: rgba(15, 23, 42, .98);
        border: 1px solid rgba(255, 255, 255, .14);
        box-shadow: 0 18px 40px rgba(0, 0, 0, .35);
        backdrop-filter: blur(18px);
        z-index: 10050;
      }

      #mainMenu .expense-dropdown .expense-submenu a {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 13px;
        line-height: 1.35;
        text-decoration: none;
      }

      #mainMenu .expense-dropdown .expense-submenu a i {
        width: 21px;
        text-align: center;
      }

      #mainMenu .expense-dropdown .expense-submenu .expense-subtitle {
        display: block;
        margin-top: 2px;
        color: #94a3b8;
        font-size: 11px;
        font-weight: 400;
      }

      #expense .expense-box.expense-choice-box {
        width: min(900px, calc(100% - 28px));
        margin-inline: auto;
      }

      .expense-tracker-grid-v13 {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 18px;
        width: 100%;
        margin-top: 22px;
      }

      .expense-tracker-card-v13 {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        min-height: 210px;
        padding: 22px 18px;
        border-radius: 20px;
        background: rgba(255,255,255,.08);
        border: 1px solid rgba(255,255,255,.16);
        box-shadow: 0 16px 35px rgba(0,0,0,.18);
        text-align: center;
      }

      .expense-tracker-card-v13 .tracker-icon-v13 {
        display: grid;
        place-items: center;
        width: 58px;
        height: 58px;
        border-radius: 17px;
        background: linear-gradient(135deg, rgba(59,130,246,.28), rgba(34,211,238,.18));
        border: 1px solid rgba(255,255,255,.16);
        font-size: 24px;
      }

      .expense-tracker-card-v13 h4 {
        margin: 0;
        color: #fff;
        font-size: clamp(17px, 2vw, 21px);
        line-height: 1.35;
      }

      .expense-tracker-card-v13 p {
        margin: 0;
        color: #cbd5e1;
        font-size: 13px;
        line-height: 1.55;
      }

      .expense-open-v13 {
        width: 100%;
        max-width: 250px;
        padding: 12px 16px;
        border: 0;
        border-radius: 13px;
        color: #fff;
        font-family: inherit;
        font-weight: 700;
        cursor: pointer;
        background: linear-gradient(135deg, #2563eb, #06b6d4);
        box-shadow: 0 10px 24px rgba(37,99,235,.23);
        transition: transform .2s ease, filter .2s ease;
      }

      .expense-open-v13:hover {
        transform: translateY(-2px);
        filter: brightness(1.08);
      }

      @media (max-width: 991px) {
        #mainMenu > ul > li.expense-dropdown {
          width: 100%;
        }

        #mainMenu .expense-dropdown .expense-submenu {
          position: static;
          width: 100%;
          min-width: 0;
          margin-top: 10px;
          box-shadow: none;
          background: rgba(255,255,255,.06);
        }

        #mainMenu .expense-dropdown .expense-submenu a {
          white-space: normal;
        }
      }

      @media (max-width: 700px) {
        .expense-tracker-grid-v13 {
          grid-template-columns: 1fr;
        }

        #expense .expense-box.expense-choice-box {
          width: min(100% - 18px, 620px);
        }
      }
    `;

    document.head.appendChild(style);
  }

  function showExpenseLoading(tracker) {
    const message = tracker.key === "mick"
      ? "กำลังเปิด My Expense Tracker 2026-Mick..."
      : "กำลังเปิด My Expense Tracker 2026 Nu'Ice...";

    if (typeof window.showToast === "function") {
      window.showToast(message, "success", 1200);
      return;
    }

    console.log(message);
  }

  function openTracker(key) {
    const tracker = TRACKERS[key];
    if (!tracker) return;

    let parsed;
    try {
      parsed = new URL(tracker.url, window.location.href);
    } catch (error) {
      console.error(error);
      if (typeof window.showToast === "function") {
        window.showToast("ลิงก์ Expense Tracker ไม่ถูกต้อง", "error");
      }
      return;
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
      if (typeof window.showToast === "function") {
        window.showToast("ลิงก์ Expense Tracker ไม่รองรับ", "error");
      }
      return;
    }

    showExpenseLoading(tracker);

    window.setTimeout(() => {
      window.location.href = parsed.href;
    }, 350);
  }

  function closeExpenseDropdown(parent, submenu, button) {
    if (!parent || !submenu || !button) return;

    parent.classList.remove("is-open");
    submenu.classList.remove("show");
    button.setAttribute("aria-expanded", "false");
  }

  function enhanceTopMenu() {
    const originalLink = document.querySelector(
      '#mainMenu > ul > li > a[data-page="expense"]'
    );

    if (!originalLink) return;

    const parent = originalLink.closest("li");
    if (!parent || parent.dataset.expenseV13 === "ready") return;

    parent.dataset.expenseV13 = "ready";
    parent.classList.add("expense-dropdown");

    // Clone removes the old SPA click listener that home.js attached.
    const button = originalLink.cloneNode(true);
    button.removeAttribute("data-page");
    button.setAttribute("href", "#");
    button.setAttribute("aria-haspopup", "true");
    button.setAttribute("aria-expanded", "false");
    button.innerHTML = `
      <i class="fas fa-wallet"></i>
      รายรับ–รายจ่าย
      <i class="fas fa-chevron-down expense-chevron"></i>
    `;

    originalLink.replaceWith(button);

    const submenu = document.createElement("ul");
    submenu.className = "submenu expense-submenu";
    submenu.setAttribute("aria-label", "เลือกระบบรายรับรายจ่าย");

    Object.values(TRACKERS).forEach(tracker => {
      const item = document.createElement("li");
      const link = document.createElement("a");

      link.href = "#";
      link.dataset.expenseTracker = tracker.key;
      link.innerHTML = `
        <i class="fas ${tracker.icon}"></i>
        <span>
          ${tracker.label}
          <small class="expense-subtitle">${tracker.description}</small>
        </span>
      `;

      link.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();

        closeExpenseDropdown(parent, submenu, button);

        if (typeof window.closeMobileMenu === "function") {
          window.closeMobileMenu();
        }

        openTracker(tracker.key);
      });

      item.appendChild(link);
      submenu.appendChild(item);
    });

    parent.appendChild(submenu);

    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();

      // Close the house-files dropdown if it is open.
      if (typeof window.closeDropdown === "function") {
        window.closeDropdown();
      }

      const isOpen = submenu.classList.contains("show");

      if (isOpen) {
        closeExpenseDropdown(parent, submenu, button);
      } else {
        parent.classList.add("is-open");
        submenu.classList.add("show");
        button.setAttribute("aria-expanded", "true");
      }
    });

    document.addEventListener("click", event => {
      if (!parent.contains(event.target)) {
        closeExpenseDropdown(parent, submenu, button);
      }
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        closeExpenseDropdown(parent, submenu, button);
      }
    });
  }

  function enhanceExpensePage() {
    const expenseBox = document.querySelector("#expense .expense-box");
    if (!expenseBox || expenseBox.dataset.expenseV13 === "ready") return;

    expenseBox.dataset.expenseV13 = "ready";
    expenseBox.classList.add("expense-choice-box");

    expenseBox.innerHTML = `
      <img class="expense-bear" src="images/bear.png" alt="Expense Tracker">
      <h3>My Expense Tracker 2026</h3>
      <p>เลือกไฟล์ที่ต้องการกรอกข้อมูลรายรับ–รายจ่าย</p>

      <div class="expense-tracker-grid-v13">
        <article class="expense-tracker-card-v13">
          <div class="tracker-icon-v13">
            <i class="fas fa-wallet"></i>
          </div>
          <h4>My Expense Tracker 2026-Mick</h4>
          <p>ใช้ระบบเดิมและ Google Sheet เดิมของ Mick</p>
          <button class="expense-open-v13" type="button" data-expense-tracker="mick">
            เปิด My Expense Tracker 2026-Mick
          </button>
        </article>

        <article class="expense-tracker-card-v13">
          <div class="tracker-icon-v13">
            <i class="fas fa-file-excel"></i>
          </div>
          <h4>My Expense Tracker 2026 Nu'Ice</h4>
          <p>เปิด Google Sheet สำหรับบันทึกข้อมูลของ Nu'Ice</p>
          <button class="expense-open-v13" type="button" data-expense-tracker="nuice">
            เปิด My Expense Tracker 2026 Nu'Ice
          </button>
        </article>
      </div>
    `;

    expenseBox
      .querySelectorAll("[data-expense-tracker]")
      .forEach(button => {
        button.addEventListener("click", () => {
          openTracker(button.dataset.expenseTracker);
        });
      });
  }

  function initializeExpenseMenuV13() {
    injectExpenseStyles();
    enhanceTopMenu();
    enhanceExpensePage();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeExpenseMenuV13,
      { once: true }
    );
  } else {
    initializeExpenseMenuV13();
  }
})();

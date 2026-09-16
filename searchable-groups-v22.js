/* =========================================================
   Searchable Group Dropdown V22
   Works with the existing #incomeGroup / #expenseGroup <select>
   without changing the Google Sheets payload.
   Desktop + iPhone/iPad + Android/Tablet friendly.
   ========================================================= */
(() => {
  "use strict";

  if (window.__SEARCHABLE_GROUPS_V22__) return;
  window.__SEARCHABLE_GROUPS_V22__ = true;

  const injectStyles = () => {
    if (document.getElementById("searchableGroupsV22Styles")) return;

    const style = document.createElement("style");
    style.id = "searchableGroupsV22Styles";
    style.textContent = `
      .search-group-v22 {
        position: relative;
        width: 100%;
      }

      .search-group-v22 .search-group-input-v22 {
        width: 100%;
        min-height: 52px;
        padding: 0 44px 0 14px;
        border: 1px solid #cbd5e1;
        border-radius: 12px;
        background: #fff;
        color: #1e293b;
        font: inherit;
        font-size: 16px;
        outline: none;
        -webkit-appearance: none;
        appearance: none;
        transition: border-color .2s ease, box-shadow .2s ease;
      }

      .search-group-v22 .search-group-input-v22:focus {
        border-color: #2563eb;
        box-shadow: 0 0 0 4px rgba(37,99,235,.13);
      }

      .search-group-v22 .search-group-arrow-v22 {
        position: absolute;
        right: 14px;
        top: 26px;
        width: 0;
        height: 0;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-top: 6px solid #64748b;
        pointer-events: none;
        transform: translateY(-50%);
        transition: transform .18s ease;
      }

      .search-group-v22.is-open .search-group-arrow-v22 {
        transform: translateY(-50%) rotate(180deg);
      }

      .search-group-menu-v22 {
        position: absolute;
        left: 0;
        right: 0;
        top: calc(100% + 7px);
        z-index: 20000;
        display: none;
        max-height: min(310px, 42vh);
        overflow-y: auto;
        overscroll-behavior: contain;
        padding: 6px;
        border: 1px solid rgba(148,163,184,.45);
        border-radius: 13px;
        background: rgba(255,255,255,.98);
        box-shadow: 0 18px 42px rgba(15,23,42,.18);
        -webkit-overflow-scrolling: touch;
      }

      .search-group-v22.is-open .search-group-menu-v22 {
        display: block;
      }

      .search-group-option-v22 {
        width: 100%;
        min-height: 44px;
        display: flex;
        align-items: center;
        padding: 10px 12px;
        border: 0;
        border-radius: 9px;
        background: transparent;
        color: #1e293b;
        font: inherit;
        font-size: 14px;
        text-align: left;
        cursor: pointer;
        touch-action: manipulation;
      }

      .search-group-option-v22:hover,
      .search-group-option-v22:focus-visible,
      .search-group-option-v22.is-selected {
        background: #eff6ff;
        color: #1d4ed8;
        outline: none;
      }

      .search-group-empty-v22 {
        padding: 14px 12px;
        color: #64748b;
        font-size: 13px;
        text-align: center;
      }

      select.search-group-native-v22 {
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0,0,0,0) !important;
        white-space: nowrap !important;
        border: 0 !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }

      body.dark-mode .search-group-input-v22,
      body.dark-mode .search-group-menu-v22 {
        background: #111827;
        color: #f8fafc;
        border-color: rgba(148,163,184,.35);
      }

      body.dark-mode .search-group-option-v22 {
        color: #f8fafc;
      }

      body.dark-mode .search-group-option-v22:hover,
      body.dark-mode .search-group-option-v22:focus-visible,
      body.dark-mode .search-group-option-v22.is-selected {
        background: rgba(59,130,246,.18);
        color: #bfdbfe;
      }

      @media (max-width: 700px) {
        .search-group-menu-v22 {
          max-height: min(280px, 38vh);
        }

        .search-group-option-v22 {
          min-height: 48px;
          font-size: 15px;
        }
      }
    `;

    document.head.appendChild(style);
  };

  const normalize = value => String(value || "")
    .toLocaleLowerCase("th-TH")
    .replace(/\s+/g, " ")
    .trim();

  const enhanceSelect = select => {
    if (!select || select.dataset.searchableV22 === "1") return;
    select.dataset.searchableV22 = "1";
    select.classList.add("search-group-native-v22");

    const options = Array.from(select.options)
      .filter(option => String(option.value || "").trim())
      .map(option => ({ value: option.value, label: option.textContent.trim() }));

    const wrapper = document.createElement("div");
    wrapper.className = "search-group-v22";

    const input = document.createElement("input");
    input.type = "search";
    input.className = "search-group-input-v22";
    input.placeholder = "พิมพ์ค้นหาหรือเลือกกลุ่ม";
    input.autocomplete = "off";
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-expanded", "false");
    input.setAttribute("aria-label", "ค้นหากลุ่ม");

    const arrow = document.createElement("span");
    arrow.className = "search-group-arrow-v22";
    arrow.setAttribute("aria-hidden", "true");

    const menu = document.createElement("div");
    menu.className = "search-group-menu-v22";
    menu.setAttribute("role", "listbox");

    wrapper.append(input, arrow, menu);
    select.insertAdjacentElement("afterend", wrapper);

    const close = () => {
      wrapper.classList.remove("is-open");
      input.setAttribute("aria-expanded", "false");
    };

    const open = () => {
      wrapper.classList.add("is-open");
      input.setAttribute("aria-expanded", "true");
    };

    const choose = (value, label) => {
      select.value = value;
      input.value = label;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      close();
    };

    const render = query => {
      const q = normalize(query);
      const matched = q
        ? options.filter(item => normalize(item.label).includes(q))
        : options;

      menu.replaceChildren();

      if (!matched.length) {
        const empty = document.createElement("div");
        empty.className = "search-group-empty-v22";
        empty.textContent = "ไม่พบกลุ่มที่ค้นหา";
        menu.appendChild(empty);
        return;
      }

      matched.forEach(item => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "search-group-option-v22";
        button.textContent = item.label;
        button.setAttribute("role", "option");

        if (select.value === item.value) {
          button.classList.add("is-selected");
          button.setAttribute("aria-selected", "true");
        }

        button.addEventListener("pointerdown", event => event.preventDefault());
        button.addEventListener("click", () => choose(item.value, item.label));
        menu.appendChild(button);
      });
    };

    const syncTypedValue = () => {
      const typed = normalize(input.value);
      const exact = options.find(item => normalize(item.label) === typed);
      select.value = exact ? exact.value : "";
    };

    input.addEventListener("focus", () => {
      render(input.value);
      open();
    });

    input.addEventListener("click", () => {
      render(input.value);
      open();
    });

    input.addEventListener("input", () => {
      syncTypedValue();
      render(input.value);
      open();
    });

    input.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        close();
        input.blur();
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        open();
        const first = menu.querySelector(".search-group-option-v22");
        first?.focus();
      }
    });

    menu.addEventListener("keydown", event => {
      const buttons = Array.from(menu.querySelectorAll(".search-group-option-v22"));
      const index = buttons.indexOf(document.activeElement);

      if (event.key === "ArrowDown") {
        event.preventDefault();
        buttons[Math.min(index + 1, buttons.length - 1)]?.focus();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        if (index <= 0) input.focus();
        else buttons[index - 1]?.focus();
      } else if (event.key === "Escape") {
        close();
        input.focus();
      }
    });

    document.addEventListener("pointerdown", event => {
      if (!wrapper.contains(event.target)) close();
    });

    select.addEventListener("change", () => {
      const current = options.find(item => item.value === select.value);
      input.value = current ? current.label : "";
      render(input.value);
    });

    const saveButtonId = select.id === "incomeGroup" ? "saveIncome" : "saveExpense";
    const saveButton = document.getElementById(saveButtonId);

    saveButton?.addEventListener("click", () => {
      let checks = 0;
      const timer = window.setInterval(() => {
        checks += 1;
        if (!select.value) {
          input.value = "";
          render("");
          window.clearInterval(timer);
        } else if (checks >= 20) {
          window.clearInterval(timer);
        }
      }, 250);
    });

    render("");
  };

  const init = () => {
    injectStyles();
    enhanceSelect(document.getElementById("incomeGroup"));
    enhanceSelect(document.getElementById("expenseGroup"));
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();

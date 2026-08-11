(() => {
  "use strict";

  const CONFIG = window.NUICE_EXPENSE_CONFIG || {};
  const WEB_APP_URL = String(CONFIG.webAppUrl || "").trim();
  const $ = selector => document.querySelector(selector);

  const elements = {
    splash: $("#splashScreen"),
    backendStatus: $("#backendStatus"),
    incomeDate: $("#incomeDate"),
    incomeItem: $("#incomeItem"),
    incomeAmount: $("#incomeAmount"),
    incomeGroup: $("#incomeGroup"),
    expenseDate: $("#expenseDate"),
    expenseItem: $("#expenseItem"),
    expenseAmount: $("#expenseAmount"),
    expenseGroup: $("#expenseGroup"),
    saveIncome: $("#saveIncome"),
    saveExpense: $("#saveExpense"),
    loading: $("#loading"),
    message: $("#message")
  };

  let busy = false;

  function setToday() {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString().slice(0, 10);
    if (elements.incomeDate) elements.incomeDate.value = local;
    if (elements.expenseDate) elements.expenseDate.value = local;
  }

  function hideSplash() {
    window.setTimeout(() => {
      if (!elements.splash) return;
      elements.splash.classList.add("is-hidden");
      window.setTimeout(() => {
        if (elements.splash) elements.splash.style.display = "none";
      }, 750);
    }, 4300);
  }

  function setBackendState(state, text) {
    if (!elements.backendStatus) return;
    elements.backendStatus.classList.remove("is-ready", "is-error");
    if (state === "ready") elements.backendStatus.classList.add("is-ready");
    if (state === "error") elements.backendStatus.classList.add("is-error");
    const label = elements.backendStatus.querySelector("span:last-child");
    if (label) label.textContent = text;
  }

  function isBackendConfigured() {
    return /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/i.test(WEB_APP_URL);
  }

  function updateBackendAvailability() {
    const ready = isBackendConfigured();
    setBackendState(
      ready ? "ready" : "error",
      ready ? "ระบบ Google Sheet Nu'Ice พร้อมใช้งาน" : "ยังไม่ได้ใส่ Google Apps Script Web App URL"
    );
    if (elements.saveIncome) elements.saveIncome.disabled = !ready;
    if (elements.saveExpense) elements.saveExpense.disabled = !ready;
  }

  function cleanAmount(value) {
    const raw = String(value || "").replace(/,/g, "").replace(/[^\d.]/g, "");
    const firstDot = raw.indexOf(".");
    const normalized = firstDot === -1
      ? raw
      : raw.slice(0, firstDot + 1) + raw.slice(firstDot + 1).replace(/\./g, "");
    const number = Number(normalized);
    return Number.isFinite(number) ? number : 0;
  }

  function formatAmountInput(input) {
    if (!input) return;
    if (input.value.trim() === "") return;
    const number = cleanAmount(input.value);
    input.value = number.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function showMessage(text, type = "success") {
    if (!elements.message) return;
    elements.message.className = `message ${type}`;
    elements.message.textContent = `${type === "success" ? "✅" : "❌"} ${text}`;
    window.clearTimeout(showMessage.timer);
    showMessage.timer = window.setTimeout(() => {
      elements.message.className = "message";
      elements.message.textContent = "";
    }, 3500);
  }

  function showLoading() {
    busy = true;
    elements.loading?.classList.add("is-visible");
    if (elements.saveIncome) elements.saveIncome.disabled = true;
    if (elements.saveExpense) elements.saveExpense.disabled = true;
  }

  function hideLoading() {
    busy = false;
    elements.loading?.classList.remove("is-visible");
    updateBackendAvailability();
  }

  function validate(type) {
    const isIncome = type === "income";
    const date = isIncome ? elements.incomeDate : elements.expenseDate;
    const item = isIncome ? elements.incomeItem : elements.expenseItem;
    const amount = isIncome ? elements.incomeAmount : elements.expenseAmount;
    const group = isIncome ? elements.incomeGroup : elements.expenseGroup;

    if (!date?.value) {
      showMessage("กรุณาเลือกวันที่", "error");
      date?.focus(); return false;
    }
    if (!item?.value.trim()) {
      showMessage("กรุณากรอกชื่อรายการ", "error");
      item?.focus(); return false;
    }
    if (cleanAmount(amount?.value) <= 0) {
      showMessage("กรุณากรอกจำนวนเงินให้ถูกต้อง", "error");
      amount?.focus(); return false;
    }
    if (!group?.value) {
      showMessage("กรุณาเลือกกลุ่ม", "error");
      group?.focus(); return false;
    }
    return true;
  }

  function buildPayload(type) {
    const isIncome = type === "income";
    return {
      tracker: "nuice",
      type,
      date: isIncome ? elements.incomeDate.value : elements.expenseDate.value,
      item: (isIncome ? elements.incomeItem.value : elements.expenseItem.value).trim(),
      amount: cleanAmount(isIncome ? elements.incomeAmount.value : elements.expenseAmount.value),
      group: isIncome ? elements.incomeGroup.value : elements.expenseGroup.value,
      clientTime: new Date().toISOString()
    };
  }

  function saveLocalHistory(data) {
    try {
      const key = "nuiceExpenseHistoryV14";
      const current = JSON.parse(localStorage.getItem(key) || "[]");
      current.unshift({ ...data, savedAt: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(current.slice(0, 30)));
    } catch (error) {
      console.warn("Local history unavailable:", error);
    }
  }

  function clearForm(type) {
    if (type === "income") {
      elements.incomeItem.value = "";
      elements.incomeAmount.value = "";
      elements.incomeGroup.selectedIndex = 0;
      elements.incomeItem.focus();
    } else {
      elements.expenseItem.value = "";
      elements.expenseAmount.value = "";
      elements.expenseGroup.selectedIndex = 0;
      elements.expenseItem.focus();
    }
  }

  async function sendData(data) {
    if (!isBackendConfigured()) {
      showMessage("ยังไม่ได้เชื่อม Google Apps Script สำหรับ Nu'Ice", "error");
      return false;
    }

    showLoading();
    try {
      await fetch(WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(data)
      });

      saveLocalHistory(data);
      showMessage("ส่งข้อมูลไปยัง Google Sheet Nu'Ice เรียบร้อยแล้ว", "success");
      return true;
    } catch (error) {
      console.error("Nu'Ice SEND ERROR:", error);
      showMessage("ไม่สามารถเชื่อมต่อ Google Sheet Nu'Ice ได้", "error");
      return false;
    } finally {
      hideLoading();
    }
  }

  async function save(type) {
    if (busy || !validate(type)) return;
    const data = buildPayload(type);
    const success = await sendData(data);
    if (success) clearForm(type);
  }

  function bindAmountInput(input) {
    if (!input) return;
    input.addEventListener("input", () => {
      let value = input.value.replace(/,/g, "").replace(/[^\d.]/g, "");
      const firstDot = value.indexOf(".");
      if (firstDot !== -1) {
        value = value.slice(0, firstDot + 1) + value.slice(firstDot + 1).replace(/\./g, "");
      }
      input.value = value;
    });
    input.addEventListener("blur", () => formatAmountInput(input));
  }

  function init() {
    setToday();
    updateBackendAvailability();
    elements.saveIncome?.addEventListener("click", () => save("income"));
    elements.saveExpense?.addEventListener("click", () => save("expense"));
    bindAmountInput(elements.incomeAmount);
    bindAmountInput(elements.expenseAmount);
    hideSplash();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();

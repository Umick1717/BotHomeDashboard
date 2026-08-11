/****************************************************
 * My Expense Tracker 2026 Nu'Ice
 * Frontend V15
 * UI/behavior based on Mick tracker
 ****************************************************/

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxZXZkW9xOw_PmX0rgJHDj1I2Y6sM1Rk0ENB3vExW8Qe2cbf5xl7wX6a_xFE9Ob0kU/exec";

const incomeDate = document.getElementById("incomeDate");
const incomeItem = document.getElementById("incomeItem");
const incomeAmount = document.getElementById("incomeAmount");
const incomeGroup = document.getElementById("incomeGroup");

const expenseDate = document.getElementById("expenseDate");
const expenseItem = document.getElementById("expenseItem");
const expenseAmount = document.getElementById("expenseAmount");
const expenseGroup = document.getElementById("expenseGroup");

const btnIncome = document.getElementById("saveIncome");
const btnExpense = document.getElementById("saveExpense");

const loading = document.getElementById("loading");
const message = document.getElementById("message");

document.addEventListener("DOMContentLoaded", () => {
    setToday();
    initDarkMode();
    addEvents();
});

function addEvents() {
    btnIncome.addEventListener("click", saveIncome);
    btnExpense.addEventListener("click", saveExpense);

    incomeAmount.addEventListener("blur", formatMoneyInput);
    expenseAmount.addEventListener("blur", formatMoneyInput);

    document.addEventListener("keydown", enterKeySave);
}

function setToday() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    const todayISO = `${year}-${month}-${day}`;

    incomeDate.value = todayISO;
    expenseDate.value = todayISO;
}

function enterKeySave(e) {
    if (e.key !== "Enter") return;

    const active = document.activeElement;

    if (active && active.closest(".income-card")) {
        saveIncome();
    }

    if (active && active.closest(".expense-card")) {
        saveExpense();
    }
}

function cleanNumber(value) {
    const cleaned = String(value || "")
        .replace(/,/g, "")
        .trim();

    const number = Number(cleaned);

    return Number.isFinite(number)
        ? number
        : 0;
}

function validateIncome() {
    if (incomeDate.value === "") {
        showError("กรุณาเลือกวันที่");
        incomeDate.focus();
        return false;
    }

    if (incomeItem.value.trim() === "") {
        showError("กรุณากรอกชื่อรายการ");
        incomeItem.focus();
        return false;
    }

    if (cleanNumber(incomeAmount.value) <= 0) {
        showError("กรุณากรอกจำนวนเงิน");
        incomeAmount.focus();
        return false;
    }

    if (incomeGroup.value === "") {
        showError("กรุณาเลือกกลุ่ม");
        incomeGroup.focus();
        return false;
    }

    return true;
}

function validateExpense() {
    if (expenseDate.value === "") {
        showError("กรุณาเลือกวันที่");
        expenseDate.focus();
        return false;
    }

    if (expenseItem.value.trim() === "") {
        showError("กรุณากรอกชื่อรายการ");
        expenseItem.focus();
        return false;
    }

    if (cleanNumber(expenseAmount.value) <= 0) {
        showError("กรุณากรอกจำนวนเงิน");
        expenseAmount.focus();
        return false;
    }

    if (expenseGroup.value === "") {
        showError("กรุณาเลือกกลุ่ม");
        expenseGroup.focus();
        return false;
    }

    return true;
}

function formatMoneyInput(e) {
    let value = e.target.value;

    if (value === "") return;

    value = value.replace(/,/g, "");

    const number = Number(value);

    if (Number.isNaN(number)) {
        e.target.value = "";
        return;
    }

    e.target.value = number.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function showLoading() {
    loading.style.display = "block";
    btnIncome.disabled = true;
    btnExpense.disabled = true;
}

function hideLoading() {
    loading.style.display = "none";
    btnIncome.disabled = false;
    btnExpense.disabled = false;
}

function showSuccess(text) {
    message.className = "message success";
    message.innerHTML = "✅ " + text;

    setTimeout(() => {
        message.className = "message";
        message.innerHTML = "";
    }, 3500);
}

function showError(text) {
    message.className = "message error";
    message.innerHTML = "❌ " + text;

    setTimeout(() => {
        message.className = "message";
        message.innerHTML = "";
    }, 4000);
}

function initDarkMode() {
    const dark = window.matchMedia("(prefers-color-scheme: dark)");

    applyTheme(dark.matches);

    if (dark.addEventListener) {
        dark.addEventListener("change", e => applyTheme(e.matches));
    }
}

function applyTheme(isDark) {
    document.body.classList.toggle("dark-mode", !!isDark);
}

function clearIncome() {
    incomeItem.value = "";
    incomeAmount.value = "";
    incomeGroup.selectedIndex = 0;
    incomeItem.focus();
}

function clearExpense() {
    expenseItem.value = "";
    expenseAmount.value = "";
    expenseGroup.selectedIndex = 0;
    expenseItem.focus();
}

async function saveIncome() {
    if (!validateIncome()) return;

    const data = {
        tracker: "nuice",
        type: "income",
        date: incomeDate.value,
        item: incomeItem.value.trim(),
        amount: cleanNumber(incomeAmount.value),
        group: incomeGroup.value
    };

    await sendData(data, clearIncome);
}

async function saveExpense() {
    if (!validateExpense()) return;

    const data = {
        tracker: "nuice",
        type: "expense",
        date: expenseDate.value,
        item: expenseItem.value.trim(),
        amount: cleanNumber(expenseAmount.value),
        group: expenseGroup.value
    };

    await sendData(data, clearExpense);
}

/*
 * V15 ส่งเป็น application/x-www-form-urlencoded
 * Google Apps Script จะอ่านจาก e.parameter ได้ตรง ๆ
 * และไม่ต้อง parse JSON ก่อน
 */
async function sendData(data, callback) {
    if (!WEB_APP_URL || !WEB_APP_URL.endsWith("/exec")) {
        showError("Google Apps Script Web App URL ไม่ถูกต้อง");
        return;
    }

    showLoading();

    try {
        const params = new URLSearchParams();

        Object.entries(data).forEach(([key, value]) => {
            params.set(key, String(value));
        });

        await fetch(WEB_APP_URL, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
            },
            body: params.toString()
        });

        showSuccess("ส่งข้อมูลไปยัง Google Sheet Nu'Ice แล้ว");
        callback();

        localStorage.setItem(
            "nuiceLastRecordV15",
            JSON.stringify({
                ...data,
                datetime: new Date().toISOString()
            })
        );
    }
    catch (error) {
        console.error("NUICE SEND ERROR:", error);
        showError("ไม่สามารถเชื่อมต่อ Google Apps Script ได้");
    }
    finally {
        hideLoading();
    }
}

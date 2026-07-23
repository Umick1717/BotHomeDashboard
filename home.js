/* ===========================================================
   FAMILY HOME DASHBOARD
   home.js Version 2.0

   ระบบภายในไฟล์นี้
   1. Initial Setup
   2. Splash Loading
   3. SPA Navigation
   4. Hamburger Menu
   5. Dropdown Menu
   6. House Files Navigation
   7. Expense Tracker Navigation
   8. Google Maps
   9. Family Board + LocalStorage
   10. Snow Animation
   11. Hero Parallax
   12. Scroll Reveal
   13. Toast Notification
   14. Error Protection

   Developed by Umick © 2026
=========================================================== */


/* ===========================================================
   1. APPLICATION CONFIGURATION
=========================================================== */

const APP_CONFIG = Object.freeze({

    splash: {
        duration: 2300,
        fadeDuration: 500,
        progressInterval: 25
    },

    navigation: {
        defaultPage: "home",
        mobileBreakpoint: 991
    },

    expense: {
    url: "https://umick.vercel.app/"
    },

    maps: {
    url: "https://www.google.com/maps/place/13%C2%B045'25.1%22N+100%C2%B041'14.8%22E/@13.7569656,100.6873565,73m/data=!3m1!1e3!4m4!3m3!8m2!3d13.7569722!4d100.6874444?entry=ttu&g_ep=EgoyMDI2MDcxOS4wIKXMDSoASAFQAw%3D%3D"
    },

    api: {
        enabled: true,

        url:  
            "https://script.google.com/macros/s/AKfycbwK3z_BLcWlqQ9ctUIayvQ_93jG99-SgJl73dw8bljhIyrlTZaOF9chK8rkXjTHorLQ6A/exec",

        requestTimeout:
            15000
    },

    family: {
        storageKey: "familyMessages",
        maximumMessages: 100
    },


    calendarApi: {
        enabled: true,

        /* วาง URL Web App ของ CalendarCode.gs ที่ลงท้ายด้วย /exec */
        url: "https://script.google.com/macros/s/AKfycbwDPuv7-9Vv_fYArKtMcdZ9WOvJzT3eDJKHF6SjzyEKzzP2z4c83hnz4NdpA_6dO5_Hbw/exec",

        requestTimeout: 15000,
        storageKey: "familyCalendarAppointments"
    },

    snow: {
        amountDesktop: 75,
        amountMobile: 35
    }

});


/* ===========================================================
   2. DOM HELPER FUNCTIONS
=========================================================== */

/**
 * เลือก Element เพียงหนึ่งรายการ
 * @param {string} selector
 * @param {ParentNode} parent
 * @returns {Element|null}
 */
function select(selector, parent = document) {

    return parent.querySelector(selector);

}


/**
 * เลือก Element หลายรายการ
 * @param {string} selector
 * @param {ParentNode} parent
 * @returns {Element[]}
 */
function selectAll(selector, parent = document) {

    return Array.from(parent.querySelectorAll(selector));

}


/**
 * ตรวจสอบว่าเป็นหน้าจอมือถือหรือไม่
 * @returns {boolean}
 */
function isMobileScreen() {

    return window.innerWidth <= APP_CONFIG.navigation.mobileBreakpoint;

}


/**
 * ตรวจสอบว่าอุปกรณ์รองรับ Hover หรือไม่
 * @returns {boolean}
 */
function supportsHover() {

    return window.matchMedia("(hover: hover)").matches;

}


/**
 * จำกัดตัวเลขไม่ให้เกินช่วง
 * @param {number} value
 * @param {number} minimum
 * @param {number} maximum
 * @returns {number}
 */
function clamp(value, minimum, maximum) {

    return Math.min(Math.max(value, minimum), maximum);

}


/**
 * ป้องกันข้อความ HTML ที่ผู้ใช้กรอก
 * @param {unknown} value
 * @returns {string}
 */
function escapeHTML(value) {

    const text = String(value ?? "");

    const element = document.createElement("div");

    element.textContent = text;

    return element.innerHTML;

}


/**
 * สร้าง ID สำหรับข้อความ Family Board
 * @returns {string}
 */
function createMessageId() {

    if (
        window.crypto &&
        typeof window.crypto.randomUUID === "function"
    ) {

        return window.crypto.randomUUID();

    }

    return (
        Date.now().toString(36) +
        Math.random().toString(36).slice(2)
    );

}


/* ===========================================================
   3. DOM ELEMENTS
=========================================================== */

const DOM = {

    splashScreen: null,
    loadingProgress: null,
    application: null,

    menuToggle: null,
    menuIcon: null,
    mainMenu: null,

    dropdown: null,
    dropdownButton: null,
    submenu: null,

    pages: [],
    pageLinks: [],
    quickMenu: null,
    quickMenuCards: [],
    footer: null,

    startButton: null,
    goToExpenseButton: null,
    openExpenseButton: null,

    openFileButtons: [],
    fileMenuLinks: [],

    googleMapButton: null,

    userNameInput: null,
    familyMessageInput: null,
    postMessageButton: null,
    clearMessageButton: null,
    messageContainer: null,

    snowContainer: null,
    heroOverlay: null,
    heroCard: null

};


/**
 * เก็บ DOM Element หลังจาก HTML โหลดเสร็จ
 */
function cacheDOMElements() {

    DOM.splashScreen = select("#splashScreen");
    DOM.loadingProgress = select(".loading-progress");
    DOM.application = select("#app");

    DOM.menuToggle = select("#menuToggle");
    DOM.menuIcon = select("#menuToggle i");
    DOM.mainMenu = select("#mainMenu");

    DOM.dropdown = select(".dropdown");
    DOM.dropdownButton = select(".dropdown > a");
    DOM.submenu = select(".dropdown .submenu");

    DOM.pages = selectAll(".page");
    DOM.pageLinks = selectAll("[data-page]");

    DOM.quickMenu = select(".quick-menu");
    DOM.quickMenuCards = selectAll(".menu-card[data-page]");

    DOM.footer = select(".main-footer");

    DOM.startButton = select("#startBtn");
    DOM.goToExpenseButton = select("#gotoExpense");
    DOM.openExpenseButton = select("#openExpense");

    DOM.openFileButtons = selectAll(".open-file");
    DOM.fileMenuLinks = selectAll("[data-file]");

    DOM.googleMapButton = select("#googleMapButton");

    DOM.userNameInput = select("#userName");
    DOM.familyMessageInput = select("#familyMessage");
    DOM.postMessageButton = select("#postMessage");
    DOM.clearMessageButton = select("#clearMessage");
    DOM.messageContainer = select("#messageContainer");

    DOM.snowContainer = select("#snowContainer");
    DOM.heroOverlay = select(".hero-overlay");
    DOM.heroCard = select(".hero-card");

}


/* ===========================================================
   4. RUNTIME CSS

   ส่วนนี้สร้าง CSS ที่จำเป็นจาก JavaScript
   จึงยังไม่จำเป็นต้องแก้ home.css เพิ่ม
=========================================================== */

function injectRuntimeStyles() {

    if (select("#homeRuntimeStyles")) return;

    const style = document.createElement("style");

    style.id = "homeRuntimeStyles";

    style.textContent = `

        /* ป้องกัน Splash กระพริบ */
        #splashScreen {
            transition:
                opacity ${APP_CONFIG.splash.fadeDuration}ms ease,
                visibility ${APP_CONFIG.splash.fadeDuration}ms ease;
        }

        #splashScreen.splash-hide {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
        }

        /* ปุ่ม Hamburger */
        #menuToggle i {
            transition: transform .3s ease;
        }

        #menuToggle[aria-expanded="true"] i {
            transform: rotate(90deg);
        }

        /* ลูกศร Dropdown */
        .dropdown > a .fa-chevron-down {
            transition: transform .3s ease;
        }

        .dropdown.dropdown-open > a .fa-chevron-down {
            transform: rotate(180deg);
        }

        /* แก้ selector เมนูหลักไม่ให้กระทบ Submenu */
        #mainMenu > ul {
            display: flex;
        }

        #mainMenu .submenu {
            display: none;
            flex-direction: column;
            gap: 4px;
        }

        #mainMenu .submenu.show {
            display: flex;
        }

        #mainMenu .submenu li {
            width: 100%;
        }

        #mainMenu .submenu a {
            width: 100%;
            border-radius: 10px;
            white-space: nowrap;
        }

        /* เมนูที่กำลังเปิด */
        #mainMenu > ul > li > a.navigation-active {
            background: rgba(56, 189, 248, .22);
            color: #ffffff;
        }

        /* ซ่อน Quick Menu เมื่อไม่ได้อยู่หน้า Home */
        .quick-menu.quick-menu-hidden {
            display: none !important;
        }

        /* Animation ตอนเปลี่ยนหน้า */
        .page.page-enter {
            animation: homePageEnter .45s ease both;
        }

        @keyframes homePageEnter {
            from {
                opacity: 0;
                transform: translateY(24px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* Scroll Reveal */
        .js-reveal {
            opacity: 0;
            transform: translateY(35px);
            transition:
                opacity .7s ease,
                transform .7s ease;
        }

        .js-reveal.reveal-visible {
            opacity: 1;
            transform: translateY(0);
        }

        /* Snow */
        #snowContainer {
            z-index: 900;
        }

        .snowflake {
            position: absolute;
            top: -30px;
            color: rgba(255, 255, 255, .9);
            user-select: none;
            pointer-events: none;
            will-change: transform;
            animation-name: snowFall;
            animation-timing-function: linear;
            animation-iteration-count: infinite;
        }

        @keyframes snowFall {
            0% {
                transform:
                    translate3d(var(--snow-start-x), -40px, 0)
                    rotate(0deg);
            }

            50% {
                transform:
                    translate3d(var(--snow-middle-x), 50vh, 0)
                    rotate(180deg);
            }

            100% {
                transform:
                    translate3d(var(--snow-end-x), 110vh, 0)
                    rotate(360deg);
            }
        }

        /* Family Board Messages */
        .message-card {
            padding: 22px;
            margin-bottom: 18px;
            border-radius: 18px;
            background: rgba(255, 255, 255, .11);
            border: 1px solid rgba(255, 255, 255, .2);
            box-shadow: 0 12px 30px rgba(0, 0, 0, .18);
            animation: messageEnter .4s ease both;
            overflow-wrap: anywhere;
        }

        @keyframes messageEnter {
            from {
                opacity: 0;
                transform: translateY(20px) scale(.98);
            }

            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }

        .message-top {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 15px;
            margin-bottom: 12px;
        }

        .message-top h3 {
            color: #ffffff;
            margin: 0;
        }

        .message-top span {
            color: #94a3b8;
            font-size: 13px;
            text-align: right;
        }

        .message-card p {
            color: #e2e8f0;
            line-height: 1.8;
            white-space: pre-wrap;
            margin-bottom: 15px;
        }

        .message-delete {
            padding: 9px 16px;
            border: none;
            border-radius: 10px;
            color: #ffffff;
            background: rgba(239, 68, 68, .85);
            transition: .25s ease;
        }

        .message-delete:hover {
            background: #ef4444;
            transform: translateY(-2px);
        }

        .message-empty {
            padding: 35px 20px;
            text-align: center;
            color: #94a3b8;
            border: 1px dashed rgba(255, 255, 255, .25);
            border-radius: 18px;
        }

        /* Toast */
        #dashboardToastContainer {
            position: fixed;
            right: 20px;
            bottom: 20px;
            width: min(360px, calc(100vw - 40px));
            z-index: 100000;
            display: flex;
            flex-direction: column;
            gap: 12px;
            pointer-events: none;
        }

        .dashboard-toast {
            padding: 15px 18px;
            border-radius: 14px;
            color: #ffffff;
            background: rgba(15, 23, 42, .95);
            border: 1px solid rgba(255, 255, 255, .18);
            box-shadow: 0 15px 35px rgba(0, 0, 0, .3);
            backdrop-filter: blur(15px);
            animation: toastEnter .35s ease both;
            pointer-events: auto;
        }

        .dashboard-toast.toast-success {
            border-left: 5px solid #10b981;
        }

        .dashboard-toast.toast-warning {
            border-left: 5px solid #f59e0b;
        }

        .dashboard-toast.toast-error {
            border-left: 5px solid #ef4444;
        }

        .dashboard-toast.toast-leave {
            animation: toastLeave .3s ease both;
        }

        @keyframes toastEnter {
            from {
                opacity: 0;
                transform: translateX(35px);
            }

            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        @keyframes toastLeave {
            to {
                opacity: 0;
                transform: translateX(35px);
            }
        }

        /* Calendar appointment actions */
        .appointment-actions {
            display: flex;
            flex-direction: column;
            gap: 10px;
            align-items: stretch;
        }

        .appointment-edit-btn,
        #cancelEditAppointment {
            border: none;
            border-radius: 12px;
            padding: 11px 16px;
            font-weight: 700;
            cursor: pointer;
            transition: transform .2s ease, filter .2s ease;
        }

        .appointment-edit-btn {
            color: #ffffff;
            background: linear-gradient(135deg, #f59e0b, #f97316);
        }

        #cancelEditAppointment {
            width: 100%;
            margin-top: 10px;
            color: #ffffff;
            background: rgba(148, 163, 184, .28);
            border: 1px solid rgba(255, 255, 255, .18);
        }

        .appointment-edit-btn:hover,
        #cancelEditAppointment:hover {
            transform: translateY(-2px);
            filter: brightness(1.08);
        }

        @media (max-width: 700px) {
            .appointment-actions {
                width: 100%;
                flex-direction: row;
            }

            .appointment-actions button {
                flex: 1;
            }
        }

        /* Mobile */
        @media (max-width: 991px) {

            #mainMenu > ul {
                flex-direction: column;
            }

            #mainMenu .submenu {
                position: static;
                width: 100%;
                min-width: 0;
                margin-top: 10px;
                box-shadow: none;
                background: rgba(255, 255, 255, .06);
            }

            #mainMenu .submenu a {
                white-space: normal;
            }

            body.mobile-menu-open {
                overflow: hidden;
            }

        }

        @media (max-width: 575px) {

            .message-top {
                flex-direction: column;
            }

            .message-top span {
                text-align: left;
            }

        }

        /* ลด Animation ตามการตั้งค่าของผู้ใช้ */
        @media (prefers-reduced-motion: reduce) {

            *,
            *::before,
            *::after {
                scroll-behavior: auto !important;
                animation-duration: .01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: .01ms !important;
            }

        }

    `;

    document.head.appendChild(style);

}


/* ===========================================================
   5. TOAST NOTIFICATION
=========================================================== */

function createToastContainer() {

    let container = select("#dashboardToastContainer");

    if (container) return container;

    container = document.createElement("div");

    container.id = "dashboardToastContainer";
    container.setAttribute("aria-live", "polite");
    container.setAttribute("aria-atomic", "true");

    document.body.appendChild(container);

    return container;

}


/**
 * แสดงข้อความแจ้งเตือนมุมขวาล่าง
 * @param {string} message
 * @param {"success"|"warning"|"error"|"info"} type
 * @param {number} duration
 */
function showToast(
    message,
    type = "info",
    duration = 2800
) {

    const container = createToastContainer();

    const toast = document.createElement("div");

    toast.className =
        `dashboard-toast toast-${type}`;

    toast.textContent = message;

    container.appendChild(toast);

    window.setTimeout(() => {

        toast.classList.add("toast-leave");

        window.setTimeout(() => {

            toast.remove();

        }, 320);

    }, duration);

}


/* ===========================================================
   6. SPLASH LOADING
=========================================================== */

function startSplashLoading() {

    const {
        splashScreen,
        loadingProgress,
        application
    } = DOM;

    if (!application) return;

    if (!splashScreen) {

        application.classList.add("show");

        return;

    }

    let currentProgress = 0;

    const totalSteps = Math.max(
        1,
        Math.floor(
            APP_CONFIG.splash.duration /
            APP_CONFIG.splash.progressInterval
        )
    );

    const progressPerStep = 100 / totalSteps;

    const progressTimer = window.setInterval(() => {

        currentProgress += progressPerStep;

        const displayedProgress =
            clamp(currentProgress, 0, 100);

        if (loadingProgress) {

            loadingProgress.style.width =
                `${displayedProgress}%`;

        }

        if (displayedProgress >= 100) {

            window.clearInterval(progressTimer);

            hideSplashScreen();

        }

    }, APP_CONFIG.splash.progressInterval);

}


/**
 * ซ่อน Splash และแสดง Application
 */
function hideSplashScreen() {

    if (DOM.loadingProgress) {

        DOM.loadingProgress.style.width = "100%";

    }

    if (DOM.application) {

        DOM.application.classList.add("show");

    }

    if (!DOM.splashScreen) return;

    DOM.splashScreen.classList.add("splash-hide");

    window.setTimeout(() => {

        DOM.splashScreen.style.display = "none";

    }, APP_CONFIG.splash.fadeDuration + 50);

}


/* ===========================================================
   7. SPA NAVIGATION
=========================================================== */

/**
 * เปิด Section ตาม ID โดยไม่ Refresh หน้าเว็บ
 * @param {string} pageId
 * @param {object} options
 */
function navigateToPage(
    pageId,
    options = {}
) {

    const settings = {
        updateHash: true,
        smoothScroll: true,
        ...options
    };

    const targetPage =
        document.getElementById(pageId);

    if (!targetPage || !targetPage.classList.contains("page")) {

        showToast(
            `ไม่พบหน้าที่ชื่อ ${pageId}`,
            "warning"
        );

        return false;

    }

    DOM.pages.forEach(page => {

        page.classList.remove(
            "active",
            "page-enter"
        );

        page.classList.add("hidden-page");

        page.setAttribute("aria-hidden", "true");

    });

    targetPage.classList.remove("hidden-page");
    targetPage.classList.add("active");

    targetPage.setAttribute("aria-hidden", "false");

    requestAnimationFrame(() => {

        targetPage.classList.add("page-enter");

    });

    updateQuickMenuVisibility(pageId);

    updateNavigationActiveState(pageId);

    closeDropdown();

    if (isMobileScreen()) {

        closeMobileMenu();

    }

    if (settings.updateHash) {

        history.replaceState(
            null,
            "",
            `#${pageId}`
        );

    }

    if (settings.smoothScroll) {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    } else {

        window.scrollTo(0, 0);

    }

    return true;

}


/**
 * แสดง Quick Menu เฉพาะหน้า Home
 * @param {string} pageId
 */
function updateQuickMenuVisibility(pageId) {

    if (!DOM.quickMenu) return;

    DOM.quickMenu.classList.toggle(
        "quick-menu-hidden",
        pageId !== "home"
    );

}


/**
 * ทำ Highlight เมนูที่กำลังเปิด
 * @param {string} pageId
 */
function updateNavigationActiveState(pageId) {

    selectAll("#mainMenu [data-page]").forEach(link => {

        const isCurrent =
            link.dataset.page === pageId;

        link.classList.toggle(
            "navigation-active",
            isCurrent
        );

        if (isCurrent) {

            link.setAttribute(
                "aria-current",
                "page"
            );

        } else {

            link.removeAttribute("aria-current");

        }

    });

}


/**
 * อ่านหน้าเริ่มต้นจาก URL Hash
 * @returns {string}
 */
function getInitialPageFromHash() {

    const hashPage =
        window.location.hash.replace("#", "").trim();

    const pageExists = DOM.pages.some(
        page => page.id === hashPage
    );

    return pageExists
        ? hashPage
        : APP_CONFIG.navigation.defaultPage;

}


/**
 * ผูก Event ของ SPA Navigation
 */
function initializeSPANavigation() {

    DOM.pageLinks.forEach(element => {

        element.addEventListener("click", event => {

            const pageId =
                element.dataset.page;

            if (!pageId) return;

            event.preventDefault();

            navigateToPage(pageId);

        });

    });

    if (DOM.startButton) {

        DOM.startButton.addEventListener(
            "click",
            () => navigateToPage("files")
        );

    }

    if (DOM.goToExpenseButton) {

        DOM.goToExpenseButton.addEventListener(
            "click",
            () => navigateToPage("expense")
        );

    }

    window.addEventListener("hashchange", () => {

        const pageId = getInitialPageFromHash();

        navigateToPage(pageId, {
            updateHash: false,
            smoothScroll: false
        });

    });

}


/* ===========================================================
   8. HAMBURGER MOBILE MENU
=========================================================== */

function openMobileMenu() {

    if (!DOM.mainMenu || !DOM.menuToggle) return;

    DOM.mainMenu.classList.add("active");

    DOM.menuToggle.setAttribute(
        "aria-expanded",
        "true"
    );

    DOM.menuToggle.setAttribute(
        "aria-label",
        "ปิดเมนู"
    );

    if (DOM.menuIcon) {

        DOM.menuIcon.className = "fas fa-xmark";

    }

    document.body.classList.add(
        "mobile-menu-open"
    );

}


function closeMobileMenu() {

    if (!DOM.mainMenu || !DOM.menuToggle) return;

    DOM.mainMenu.classList.remove("active");

    DOM.menuToggle.setAttribute(
        "aria-expanded",
        "false"
    );

    DOM.menuToggle.setAttribute(
        "aria-label",
        "เปิดเมนู"
    );

    if (DOM.menuIcon) {

        DOM.menuIcon.className = "fas fa-bars";

    }

    document.body.classList.remove(
        "mobile-menu-open"
    );

    closeDropdown();

}


function toggleMobileMenu() {

    if (!DOM.mainMenu) return;

    const isOpen =
        DOM.mainMenu.classList.contains("active");

    if (isOpen) {

        closeMobileMenu();

    } else {

        openMobileMenu();

    }

}


function initializeMobileMenu() {

    if (!DOM.menuToggle || !DOM.mainMenu) return;

    DOM.menuToggle.setAttribute(
        "type",
        "button"
    );

    DOM.menuToggle.setAttribute(
        "aria-controls",
        "mainMenu"
    );

    DOM.menuToggle.setAttribute(
        "aria-expanded",
        "false"
    );

    DOM.menuToggle.setAttribute(
        "aria-label",
        "เปิดเมนู"
    );

    DOM.menuToggle.addEventListener(
        "click",
        event => {

            event.preventDefault();
            event.stopPropagation();

            toggleMobileMenu();

        }
    );

    document.addEventListener("click", event => {

        if (!isMobileScreen()) return;

        const clickedInsideMenu =
            DOM.mainMenu.contains(event.target);

        const clickedMenuButton =
            DOM.menuToggle.contains(event.target);

        if (
            !clickedInsideMenu &&
            !clickedMenuButton
        ) {

            closeMobileMenu();

        }

    });

    window.addEventListener("resize", () => {

        if (!isMobileScreen()) {

            closeMobileMenu();

        }

    });

}


/* ===========================================================
   9. DROPDOWN MENU
=========================================================== */

function openDropdown() {

    if (
        !DOM.dropdown ||
        !DOM.submenu ||
        !DOM.dropdownButton
    ) return;

    DOM.dropdown.classList.add(
        "dropdown-open"
    );

    DOM.submenu.classList.add("show");

    DOM.dropdownButton.setAttribute(
        "aria-expanded",
        "true"
    );

}


function closeDropdown() {

    if (
        !DOM.dropdown ||
        !DOM.submenu ||
        !DOM.dropdownButton
    ) return;

    DOM.dropdown.classList.remove(
        "dropdown-open"
    );

    DOM.submenu.classList.remove("show");

    DOM.dropdownButton.setAttribute(
        "aria-expanded",
        "false"
    );

}


function toggleDropdown() {

    if (!DOM.submenu) return;

    const isOpen =
        DOM.submenu.classList.contains("show");

    if (isOpen) {

        closeDropdown();

    } else {

        openDropdown();

    }

}


function initializeDropdown() {

    if (
        !DOM.dropdownButton ||
        !DOM.dropdown ||
        !DOM.submenu
    ) return;

    DOM.dropdownButton.setAttribute(
        "aria-haspopup",
        "true"
    );

    DOM.dropdownButton.setAttribute(
        "aria-expanded",
        "false"
    );

    DOM.dropdownButton.addEventListener(
        "click",
        event => {

            event.preventDefault();
            event.stopPropagation();

            toggleDropdown();

        }
    );

    DOM.submenu.addEventListener(
        "click",
        event => {

            event.stopPropagation();

        }
    );

    document.addEventListener("click", event => {

        if (!DOM.dropdown.contains(event.target)) {

            closeDropdown();

        }

    });

    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {

            closeDropdown();
            closeMobileMenu();

        }

    });

}


/* ===========================================================
   10. HOUSE FILES
=========================================================== */

/*
   หมายเลขลำดับของ File Card ภายในหน้า files

   0 = Blueprint
   1 = Adam
   2 = GGB
   3 = Solar
   4 = Electric
*/

const FILE_CARD_INDEX = Object.freeze({

    blueprint: 0,
    adam: 1,
    ggb: 2,
    solar: 3,
    electric: 4

});


/**
 * เปิดหน้า Files และเลื่อนไปยัง Card ที่เลือก
 * @param {string} fileType
 */
function openHouseFileSection(fileType) {

    const index = FILE_CARD_INDEX[fileType];

    navigateToPage("files");

    const cards = selectAll("#files .file-card");

    const selectedCard = cards[index];

    if (!selectedCard) return;

    window.setTimeout(() => {

        selectedCard.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        selectedCard.animate(
            [
                {
                    transform: "scale(1)",
                    boxShadow:
                        "0 15px 40px rgba(0,0,0,.25)"
                },
                {
                    transform: "scale(1.035)",
                    boxShadow:
                        "0 0 35px rgba(56,189,248,.75)"
                },
                {
                    transform: "scale(1)",
                    boxShadow:
                        "0 15px 40px rgba(0,0,0,.25)"
                }
            ],
            {
                duration: 850,
                easing: "ease"
            }
        );

    }, 450);

}


/**
 * เปิด URL เอกสาร
 * @param {string} url
 */
function openExternalFile(url) {

    const cleanURL = String(url || "").trim();

    if (
        !cleanURL ||
        cleanURL === "#"
    ) {

        showToast(
            "ยังไม่ได้กำหนดลิงก์เอกสาร",
            "warning"
        );

        return;

    }

    try {

        const parsedURL =
            new URL(cleanURL, window.location.href);

        const allowedProtocols = [
            "http:",
            "https:"
        ];

        if (
            !allowedProtocols.includes(
                parsedURL.protocol
            )
        ) {

            throw new Error(
                "Unsupported URL protocol"
            );

        }

        window.open(
            parsedURL.href,
            "_blank",
            "noopener,noreferrer"
        );

    } catch (error) {

        console.error(error);

        showToast(
            "ลิงก์เอกสารไม่ถูกต้อง",
            "error"
        );

    }

}


function initializeHouseFiles() {

    DOM.fileMenuLinks.forEach(link => {

        link.addEventListener("click", event => {

            event.preventDefault();

            const fileType =
                link.dataset.file;

            if (!fileType) return;

            closeDropdown();

            openHouseFileSection(fileType);

        });

    });

    DOM.openFileButtons.forEach(button => {

        button.setAttribute("type", "button");

        button.addEventListener("click", () => {

            openExternalFile(
                button.dataset.link
            );

        });

    });

}


/* ===========================================================
   11. EXPENSE TRACKER
=========================================================== */

function openExpenseTracker() {

    showToast(
        "กำลังเปิดระบบรายรับ–รายจ่าย...",
        "success",
        1200
    );

    window.setTimeout(() => {

        window.location.href =
            APP_CONFIG.expense.url;

    }, 350);

}


function initializeExpenseTracker() {

    if (!DOM.openExpenseButton) return;

    DOM.openExpenseButton.setAttribute(
        "type",
        "button"
    );

    DOM.openExpenseButton.addEventListener(
        "click",
        openExpenseTracker
    );

}


/* ===========================================================
   12. GOOGLE MAPS
=========================================================== */

function openGoogleMaps() {

    const mapURL = APP_CONFIG.maps.url;

    const newWindow = window.open(
        mapURL,
        "_blank",
        "noopener,noreferrer"
    );

    if (!newWindow) {

        window.location.href = mapURL;

    }

}


function initializeGoogleMaps() {

    if (!DOM.googleMapButton) return;

    DOM.googleMapButton.setAttribute(
        "type",
        "button"
    );

    DOM.googleMapButton.addEventListener(
        "click",
        openGoogleMaps
    );

}

/* ===========================================================
   GOOGLE APPS SCRIPT API
=========================================================== */

/**
 * ส่งคำขอไป Google Apps Script
 * ใช้ text/plain เพื่อลดปัญหา CORS preflight
 */
async function callFamilyAPI(
    action,
    payload = {}
) {

    if (
        !APP_CONFIG.api?.enabled ||
        !APP_CONFIG.api?.url
    ) {

        throw new Error(
            "ยังไม่ได้เปิดใช้งาน Family API"
        );

    }

    const controller =
        new AbortController();

    const timeoutId =
        window.setTimeout(
            () => controller.abort(),
            APP_CONFIG.api.requestTimeout
        );

    try {

        const response = await fetch(
            APP_CONFIG.api.url,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "text/plain;charset=utf-8"
                },

                body: JSON.stringify({
                    action,
                    ...payload
                }),

                signal:
                    controller.signal,

                redirect:
                    "follow"
            }
        );

        if (!response.ok) {

            throw new Error(
                `API Error ${response.status}`
            );

        }

        const result =
            await response.json();

        if (!result.success) {

            throw new Error(
                result.message ||
                "ไม่สามารถดำเนินการได้"
            );

        }

        return result;

    } catch (error) {

        if (error.name === "AbortError") {

            throw new Error(
                "การเชื่อมต่อใช้เวลานานเกินไป"
            );

        }

        throw error;

    } finally {

        window.clearTimeout(timeoutId);

    }

}


/**
 * โหลดโพสต์ทั้งหมดจาก Google Sheets
 */
async function loadFamilyMessagesFromAPI() {

    if (
        !APP_CONFIG.api?.enabled ||
        !APP_CONFIG.api?.url
    ) {

        loadFamilyMessages();

        renderFamilyMessages();

        return;

    }

    try {

        showToast(
            "กำลังโหลดข้อความจาก Google Sheets...",
            "info",
            1500
        );

        const url = new URL(
            APP_CONFIG.api.url
        );

        url.searchParams.set(
            "action",
            "list"
        );

        url.searchParams.set(
            "_",
            String(Date.now())
        );

        const response = await fetch(
            url.toString(),
            {
                method: "GET",
                redirect: "follow",
                cache: "no-store"
            }
        );

        if (!response.ok) {

            throw new Error(
                `API Error ${response.status}`
            );

        }

        const result =
            await response.json();

        if (
            !result.success ||
            !Array.isArray(result.data)
        ) {

            throw new Error(
                result.message ||
                "รูปแบบข้อมูลไม่ถูกต้อง"
            );

        }

        familyMessages =
            result.data.map(message => ({

                id:
                    String(message.id),

                user:
                    String(message.user),

                text:
                    String(message.text),

                createdAt:
                    String(message.createdAt),

                comments:
                    Array.isArray(message.comments)
                        ? message.comments.map(
                            comment => ({

                                id:
                                    String(comment.id),

                                postId:
                                    String(comment.postId),

                                user:
                                    String(comment.user),

                                text:
                                    String(comment.text),

                                createdAt:
                                    String(comment.createdAt)

                            })
                        )
                        : []

            }));

        /*
           เก็บสำรองใน LocalStorage
           ใช้แสดงเมื่ออินเทอร์เน็ตล่ม
        */

        saveFamilyMessages();

        renderFamilyMessages();

    } catch (error) {

        console.error(
            "Load Family API Error:",
            error
        );

        /*
           หาก API ใช้ไม่ได้ ให้โหลดข้อมูลสำรอง
        */

        loadFamilyMessages();

        renderFamilyMessages();

        showToast(
            "เชื่อมต่อ Google Sheets ไม่สำเร็จ แสดงข้อมูลสำรองในเครื่อง",
            "warning",
            4500
        );

    }

}


/* ===========================================================
   13. FAMILY BOARD DATA
=========================================================== */

let familyMessages = [];


/**
 * โหลดข้อความจาก LocalStorage
 */
function loadFamilyMessages() {

    try {

        const savedData =
            localStorage.getItem(
                APP_CONFIG.family.storageKey
            );

        if (!savedData) {

            familyMessages = [];

            return;

        }

        const parsedData =
            JSON.parse(savedData);

        if (!Array.isArray(parsedData)) {

            throw new Error(
                "Stored messages are not an array"
            );

        }

        familyMessages = parsedData
            .filter(message => {

                return (
                    message &&
                    typeof message === "object" &&
                    typeof message.user === "string" &&
                    typeof message.text === "string"
                );

            })
            .map(message => ({

                id:
                    message.id ||
                    createMessageId(),

                user:
                    String(message.user),

                text:
                    String(message.text),

                createdAt:
                    message.createdAt ||
                    message.date ||
                    new Date().toISOString(),

                comments:
                    Array.isArray(message.comments)
                    ? message.comments
                    : []

                    }))
            .slice(
                0,
                APP_CONFIG.family.maximumMessages
            );

    } catch (error) {

        console.error(
            "ไม่สามารถอ่าน Family Messages:",
            error
        );

        familyMessages = [];

        showToast(
            "ข้อมูลข้อความเดิมเสียหาย ระบบเริ่มรายการใหม่",
            "warning",
            4500
        );

    }

}


/**
 * บันทึกข้อความลง LocalStorage
 */
function saveFamilyMessages() {

    try {

        localStorage.setItem(
            APP_CONFIG.family.storageKey,
            JSON.stringify(familyMessages)
        );

        return true;

    } catch (error) {

        console.error(
            "ไม่สามารถบันทึก Family Messages:",
            error
        );

        showToast(
            "ไม่สามารถบันทึกข้อความในอุปกรณ์นี้ได้",
            "error"
        );

        return false;

    }

}


/**
 * จัดรูปแบบวันเวลาไทย
 * @param {string} dateValue
 * @returns {string}
 */
function formatThaiDateTime(dateValue) {

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {

        return String(dateValue || "");

    }

    return new Intl.DateTimeFormat(
        "th-TH",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    ).format(date);

}


/**
 * สร้าง Message Card อย่างปลอดภัย
 * @param {object} message
 * @returns {HTMLElement}
 */
function createMessageCard(message) {

    const card = document.createElement("article");

    card.className = "message-card";
    card.dataset.messageId = message.id;


    /* ==============================
       ส่วนหัวโพสต์
    ============================== */

    const messageTop =
        document.createElement("div");

    messageTop.className = "message-top";


    const userHeading =
        document.createElement("h3");

    userHeading.textContent = message.user;


    const dateElement =
        document.createElement("span");

    dateElement.textContent =
        formatThaiDateTime(
            message.createdAt
        );


    messageTop.append(
        userHeading,
        dateElement
    );


    /* ==============================
       เนื้อหาโพสต์
    ============================== */

    const textElement =
        document.createElement("p");

    textElement.className = "message-text";

    textElement.textContent = message.text;


    /* ==============================
       กล่อง Comment
    ============================== */

    const commentSection =
        document.createElement("div");

    commentSection.className =
        "comment-section";


    const commentTitle =
        document.createElement("h4");

    commentTitle.className =
        "comment-title";

    commentTitle.textContent =
        `💬 ความคิดเห็น (${message.comments?.length || 0})`;


    const commentList =
        document.createElement("div");

    commentList.className =
        "comment-list";


    renderCommentsIntoContainer(
        message,
        commentList
    );


    /* ==============================
       ช่องกรอก Comment
    ============================== */

    const commentForm =
        document.createElement("div");

    commentForm.className =
        "comment-form";


    const commentName =
        document.createElement("input");

    commentName.type = "text";

    commentName.className =
        "comment-name";

    commentName.placeholder =
        "ชื่อผู้แสดงความคิดเห็น";


    const commentInput =
        document.createElement("textarea");

    commentInput.className =
        "comment-input";

    commentInput.placeholder =
        "เขียนความคิดเห็น...";

    commentInput.rows = 2;


    const commentButton =
        document.createElement("button");

    commentButton.type = "button";

    commentButton.className =
        "comment-submit";

    commentButton.textContent =
        "ส่งความคิดเห็น";


    commentButton.addEventListener(
        "click",
        () => {

            addCommentToMessage(
                message.id,
                commentName.value,
                commentInput.value
            );

        }
    );


    commentForm.append(
        commentName,
        commentInput,
        commentButton
    );


    commentSection.append(
        commentTitle,
        commentList,
        commentForm
    );


    /* ==============================
       ปุ่มลบโพสต์
    ============================== */

    const deleteButton =
        document.createElement("button");

    deleteButton.type = "button";

    deleteButton.className =
        "message-delete";

    deleteButton.textContent =
        "🗑 ลบข้อความ";


    deleteButton.addEventListener(
    "click",
    () => deleteFamilyMessage(message.id)
);


/* ==============================
   กล่องจัดปุ่มลบให้อยู่กึ่งกลาง
============================== */

const deleteButtonWrapper =
    document.createElement("div");

deleteButtonWrapper.className =
    "message-delete-wrapper";

deleteButtonWrapper.appendChild(
    deleteButton
);


/*
   นำปุ่มลบเข้าไปอยู่ในกรอบ Comment
   เพื่อให้กึ่งกลางตรงกับกล่องสีเทา
*/

commentSection.appendChild(
    deleteButtonWrapper
);


/*
   ไม่ต้องใส่ deleteButton ต่อท้าย card อีก
*/

card.append(
    messageTop,
    textElement,
    commentSection
);


return card;

}

function renderCommentsIntoContainer(
    message,
    container
) {

    container.replaceChildren();

    const comments =
        Array.isArray(message.comments)
            ? message.comments
            : [];


    if (comments.length === 0) {

        const emptyComment =
            document.createElement("p");

        emptyComment.className =
            "comment-empty";

        emptyComment.textContent =
            "ยังไม่มีความคิดเห็น";

        container.appendChild(
            emptyComment
        );

        return;

    }


    comments.forEach(comment => {

        const commentItem =
            document.createElement("div");

        commentItem.className =
            "comment-item";


        const commentHeader =
            document.createElement("div");

        commentHeader.className =
            "comment-header";


        const commentUser =
            document.createElement("strong");

        commentUser.textContent =
            comment.user;


        const commentDate =
            document.createElement("span");

        commentDate.textContent =
            formatThaiDateTime(
                comment.createdAt
            );


        const commentText =
            document.createElement("p");

        commentText.textContent =
            comment.text;


        const deleteCommentButton =
            document.createElement("button");

        deleteCommentButton.type =
            "button";

        deleteCommentButton.className =
            "comment-delete";

        deleteCommentButton.textContent =
            "ลบ";


        deleteCommentButton.addEventListener(
            "click",
            () => {

                deleteCommentFromMessage(
                    message.id,
                    comment.id
                );

            }
        );


        commentHeader.append(
            commentUser,
            commentDate
        );


        commentItem.append(
            commentHeader,
            commentText,
            deleteCommentButton
        );


        container.appendChild(
            commentItem
        );

    });

}

async function addCommentToMessage(
    messageId,
    userName,
    commentText
) {

    const user =
        String(userName || "").trim();

    const text =
        String(commentText || "").trim();

    if (!user) {

        showToast(
            "กรุณากรอกชื่อผู้แสดงความคิดเห็น",
            "warning"
        );

        return;

    }

    if (!text) {

        showToast(
            "กรุณากรอกความคิดเห็น",
            "warning"
        );

        return;

    }

    try {

        await callFamilyAPI(
            "createComment",
            {
                postId: messageId,
                user,
                text
            }
        );

        showToast(
            "เพิ่มความคิดเห็นเรียบร้อยแล้ว",
            "success"
        );

        await loadFamilyMessagesFromAPI();

    } catch (error) {

        console.error(error);

        showToast(
            error.message ||
            "ไม่สามารถเพิ่มความคิดเห็นได้",
            "error"
        );

    }

}

async function deleteCommentFromMessage(
    messageId,
    commentId
) {

    const confirmed =
        window.confirm(
            "ต้องการลบความคิดเห็นนี้หรือไม่?"
        );

    if (!confirmed) return;

    try {

        await callFamilyAPI(
            "deleteComment",
            {
                postId: messageId,
                commentId
            }
        );

        showToast(
            "ลบความคิดเห็นเรียบร้อยแล้ว",
            "success"
        );

        await loadFamilyMessagesFromAPI();

    } catch (error) {

        console.error(error);

        showToast(
            error.message ||
            "ไม่สามารถลบความคิดเห็นได้",
            "error"
        );

    }

}


/**
 * แสดงข้อความทั้งหมด
 */
function renderFamilyMessages() {

    if (!DOM.messageContainer) return;

    DOM.messageContainer.replaceChildren();

    if (familyMessages.length === 0) {

        const emptyState =
            document.createElement("div");

        emptyState.className = "message-empty";

        emptyState.innerHTML = `
            <div style="font-size:42px;margin-bottom:10px;">
                💬
            </div>
            <p>
                ยังไม่มีข้อความใน Family Board
            </p>
        `;

        DOM.messageContainer.appendChild(
            emptyState
        );

        return;

    }

    const fragment =
        document.createDocumentFragment();

    familyMessages.forEach(message => {

        fragment.appendChild(
            createMessageCard(message)
        );

    });

    DOM.messageContainer.appendChild(fragment);

}


/**
 * เพิ่มข้อความใหม่
 */
async function postFamilyMessage() {

    if (
        !DOM.userNameInput ||
        !DOM.familyMessageInput
    ) return;

    const user =
        DOM.userNameInput.value.trim();

    const text =
        DOM.familyMessageInput.value.trim();

    if (!user) {

        showToast(
            "กรุณากรอกชื่อผู้โพสต์",
            "warning"
        );

        DOM.userNameInput.focus();

        return;

    }

    if (!text) {

        showToast(
            "กรุณากรอกข้อความถึงครอบครัว",
            "warning"
        );

        DOM.familyMessageInput.focus();

        return;

    }

    if (user.length > 60) {

        showToast(
            "ชื่อผู้โพสต์ต้องไม่เกิน 60 ตัวอักษร",
            "warning"
        );

        return;

    }

    if (text.length > 2000) {

        showToast(
            "ข้อความต้องไม่เกิน 2,000 ตัวอักษร",
            "warning"
        );

        return;

    }

    const confirmed = window.confirm(
        "ต้องการโพสต์ข้อความนี้ใช่หรือไม่?"
    );

    if (!confirmed) return;

    DOM.postMessageButton.disabled = true;

DOM.postMessageButton.textContent =
    "กำลังโพสต์...";

try {

    await callFamilyAPI(
        "createPost",
        {
            user,
            text
        }
    );

    DOM.familyMessageInput.value = "";

    showToast(
        "โพสต์ข้อความเข้า Google Sheets เรียบร้อยแล้ว",
        "success"
    );

    await loadFamilyMessagesFromAPI();

} catch (error) {

    console.error(error);

    showToast(
        error.message ||
        "ไม่สามารถโพสต์ข้อความได้",
        "error"
    );

} finally {

    DOM.postMessageButton.disabled = false;

    DOM.postMessageButton.textContent =
        "📨 โพสต์ข้อความ";

}

}


/**
 * ลบข้อความตาม ID
 * @param {string} messageId
 */
async function deleteFamilyMessage(
    messageId
) {

    const message =
        familyMessages.find(
            item => item.id === messageId
        );

    if (!message) return;

    const confirmed =
        window.confirm(
            `ต้องการลบข้อความของ “${message.user}” หรือไม่?`
        );

    if (!confirmed) return;

    try {

        await callFamilyAPI(
            "deletePost",
            {
                postId: messageId
            }
        );

        showToast(
            "ลบโพสต์เรียบร้อยแล้ว",
            "success"
        );

        await loadFamilyMessagesFromAPI();

    } catch (error) {

        console.error(error);

        showToast(
            error.message ||
            "ไม่สามารถลบโพสต์ได้",
            "error"
        );

    }

}


/**
 * ล้างช่องกรอกข้อความ
 */
function clearFamilyForm() {

    if (DOM.userNameInput) {

        DOM.userNameInput.value = "";

    }

    if (DOM.familyMessageInput) {

        DOM.familyMessageInput.value = "";

    }

    if (DOM.userNameInput) {

        DOM.userNameInput.focus();

    }

}


/**
 * เริ่มระบบ Family Board
 */
function initializeFamilyBoard() {

    loadFamilyMessagesFromAPI();

    if (DOM.postMessageButton) {

        DOM.postMessageButton.setAttribute(
            "type",
            "button"
        );

        DOM.postMessageButton.addEventListener(
            "click",
            postFamilyMessage
        );

    }

    if (DOM.clearMessageButton) {

        DOM.clearMessageButton.setAttribute(
            "type",
            "button"
        );

        DOM.clearMessageButton.addEventListener(
            "click",
            clearFamilyForm
        );

    }

    if (DOM.familyMessageInput) {

        DOM.familyMessageInput.addEventListener(
            "keydown",
            event => {

                /*
                    Ctrl + Enter บน Windows
                    Command + Enter บน macOS
                */

                if (
                    event.key === "Enter" &&
                    (event.ctrlKey || event.metaKey)
                ) {

                    event.preventDefault();

                    postFamilyMessage();

                }

            }
        );

    }

}


/* ===========================================================
   14. SNOW ANIMATION
=========================================================== */

/**
 * สร้างเกล็ดหิมะหนึ่งเม็ด
 * @returns {HTMLSpanElement}
 */
function createSnowflake() {

    const flake =
        document.createElement("span");

    flake.className = "snowflake";
    flake.textContent =
        Math.random() > 0.65 ? "❄" : "•";

    const size =
        Math.random() * 16 + 7;

    const opacity =
        Math.random() * 0.55 + 0.3;

    const duration =
        Math.random() * 10 + 9;

    const delay =
        Math.random() * -18;

    const startX =
        Math.random() * 100;

    const drift =
        Math.random() * 16 - 8;

    flake.style.left = `${startX}vw`;
    flake.style.fontSize = `${size}px`;
    flake.style.opacity = String(opacity);

    flake.style.animationDuration =
        `${duration}s`;

    flake.style.animationDelay =
        `${delay}s`;

    flake.style.setProperty(
        "--snow-start-x",
        "0px"
    );

    flake.style.setProperty(
        "--snow-middle-x",
        `${drift * 0.55}vw`
    );

    flake.style.setProperty(
        "--snow-end-x",
        `${drift}vw`
    );

    return flake;

}


/**
 * สร้างระบบหิมะตก
 */
function initializeSnowAnimation() {

    if (!DOM.snowContainer) return;

    DOM.snowContainer.replaceChildren();

    const reducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

    if (reducedMotion) return;

    const snowAmount = isMobileScreen()
        ? APP_CONFIG.snow.amountMobile
        : APP_CONFIG.snow.amountDesktop;

    const fragment =
        document.createDocumentFragment();

    for (
        let index = 0;
        index < snowAmount;
        index += 1
    ) {

        fragment.appendChild(
            createSnowflake()
        );

    }

    DOM.snowContainer.appendChild(fragment);

}


/* ===========================================================
   15. HERO PARALLAX
=========================================================== */

function initializeHeroParallax() {

    if (
        !DOM.heroOverlay ||
        !DOM.heroCard ||
        !supportsHover()
    ) return;

    const reducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

    if (reducedMotion) return;

    let animationFrame = null;

    DOM.heroOverlay.addEventListener(
        "mousemove",
        event => {

            if (isMobileScreen()) return;

            if (animationFrame) {

                cancelAnimationFrame(
                    animationFrame
                );

            }

            animationFrame =
                requestAnimationFrame(() => {

                    const bounds =
                        DOM.heroOverlay
                            .getBoundingClientRect();

                    const relativeX =
                        (
                            event.clientX -
                            bounds.left
                        ) / bounds.width;

                    const relativeY =
                        (
                            event.clientY -
                            bounds.top
                        ) / bounds.height;

                    const rotateY =
                        (relativeX - 0.5) * 5;

                    const rotateX =
                        (0.5 - relativeY) * 5;

                    DOM.heroCard.style.transform = `
                        perspective(1000px)
                        rotateX(${rotateX}deg)
                        rotateY(${rotateY}deg)
                        translateZ(5px)
                    `;

                });

        }
    );

    DOM.heroOverlay.addEventListener(
        "mouseleave",
        () => {

            DOM.heroCard.style.transform = "";

        }
    );

}


/* ===========================================================
   16. SCROLL REVEAL
=========================================================== */

function initializeScrollReveal() {

    const revealElements = selectAll(
        [
            ".menu-card",
            ".file-card",
            ".expense-box",
            ".family-wrapper",
            "#location iframe",
            ".main-footer"
        ].join(",")
    );

    if (revealElements.length === 0) return;

    revealElements.forEach(element => {

        element.classList.add("js-reveal");

    });

    if (
        !("IntersectionObserver" in window)
    ) {

        revealElements.forEach(element => {

            element.classList.add(
                "reveal-visible"
            );

        });

        return;

    }

    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting) {

                        return;

                    }

                    entry.target.classList.add(
                        "reveal-visible"
                    );

                    observer.unobserve(
                        entry.target
                    );

                });

            },
            {
                threshold: 0.12,
                rootMargin:
                    "0px 0px -35px 0px"
            }
        );

    revealElements.forEach(element => {

        observer.observe(element);

    });

}


/* ===========================================================
   17. BUTTON RIPPLE EFFECT
=========================================================== */

function initializeButtonEffects() {

    const buttons = selectAll(
        [
            "button",
            ".menu-card",
            "#mainMenu a"
        ].join(",")
    );

    buttons.forEach(element => {

        element.addEventListener(
            "pointerdown",
            event => {

                if (
                    element.tagName === "A" &&
                    event.button !== 0
                ) return;

                const animation =
                    element.animate(
                        [
                            {
                                transform:
                                    getComputedStyle(element)
                                        .transform
                            },
                            {
                                filter:
                                    "brightness(1.22)"
                            },
                            {
                                filter:
                                    "brightness(1)"
                            }
                        ],
                        {
                            duration: 240,
                            easing: "ease-out"
                        }
                    );

                animation.addEventListener(
                    "finish",
                    () => {

                        element.style.filter = "";

                    }
                );

            }
        );

    });

}


/* ===========================================================
   18. ACCESSIBILITY
=========================================================== */

function initializeAccessibility() {

    DOM.pages.forEach(page => {

        const isActive =
            page.classList.contains("active");

        page.setAttribute(
            "aria-hidden",
            String(!isActive)
        );

    });

    DOM.openFileButtons.forEach(button => {

        if (!button.hasAttribute("type")) {

            button.setAttribute(
                "type",
                "button"
            );

        }

    });

}




/* ===========================================================
   21. REAL-TIME FAMILY CALENDAR
   - ปฏิทินทุกเดือน/ทุกปี
   - เพิ่มและลบนัดหมาย
   - LocalStorage สำรอง
   - Google Sheets API
=========================================================== */

const CALENDAR_MONTHS_TH = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน",
    "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม",
    "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

const calendarState = {
    visibleDate: new Date(),
    selectedDate: "",
    appointments: [],
    filterDate: "",
    editingAppointmentId: ""
};

function getCalendarElements() {
    return {
        grid: select("#calendarGrid"),
        monthLabel: select("#calendarMonthLabel"),
        previousButton: select("#calendarPrev"),
        nextButton: select("#calendarNext"),
        userInput: select("#appointmentUser"),
        dateInput: select("#appointmentDate"),
        timeInput: select("#appointmentTime"),
        detailsInput: select("#appointmentDetails"),
        saveButton: select("#saveAppointment"),
        cancelEditButton: select("#cancelEditAppointment"),
        list: select("#appointmentList"),
        filterLabel: select("#appointmentFilterLabel"),
        showAllButton: select("#showAllAppointments"),
        connectionStatus: select("#calendarConnectionStatus")
    };
}

function calendarDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function parseCalendarDate(dateText) {
    const parts = String(dateText || "").split("-").map(Number);

    if (
        parts.length !== 3 ||
        !parts[0] ||
        !parts[1] ||
        !parts[2]
    ) {
        return null;
    }

    return new Date(parts[0], parts[1] - 1, parts[2]);
}

function formatCalendarDateThai(dateText) {
    const date = parseCalendarDate(dateText);

    if (!date) return dateText;

    return new Intl.DateTimeFormat("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric"
    }).format(date);
}

function createCalendarAppointmentId() {
    if (
        window.crypto &&
        typeof window.crypto.randomUUID === "function"
    ) {
        return window.crypto.randomUUID();
    }

    return `calendar_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2)}`;
}

function isCalendarAPIConfigured() {
    const config = APP_CONFIG.calendarApi;

    return Boolean(
        config?.enabled &&
        config?.url &&
        !config.url.includes("วาง_URL_")
    );
}

function updateCalendarConnectionStatus(
    message,
    state = "offline"
) {
    const element = getCalendarElements().connectionStatus;

    if (!element) return;

    element.classList.remove("is-online", "is-offline");

    if (state === "online") {
        element.classList.add("is-online");
    } else if (state === "offline") {
        element.classList.add("is-offline");
    }

    const text = element.querySelector("span:last-child");

    if (text) {
        text.textContent = message;
    }
}

function loadCalendarLocalBackup() {
    try {
        const raw = localStorage.getItem(
            APP_CONFIG.calendarApi.storageKey
        );

        const parsed = JSON.parse(raw || "[]");

        calendarState.appointments =
            Array.isArray(parsed)
                ? parsed
                : [];
    } catch (error) {
        console.error("Calendar LocalStorage Error:", error);
        calendarState.appointments = [];
    }
}

function saveCalendarLocalBackup() {
    try {
        localStorage.setItem(
            APP_CONFIG.calendarApi.storageKey,
            JSON.stringify(calendarState.appointments)
        );
    } catch (error) {
        console.error("Calendar backup error:", error);
    }
}

async function callCalendarAPI(
    action,
    payload = {},
    method = "POST"
) {
    if (!isCalendarAPIConfigured()) {
        throw new Error("ยังไม่ได้ตั้งค่า Calendar API");
    }

    const controller = new AbortController();

    const timeoutId = window.setTimeout(
        () => controller.abort(),
        APP_CONFIG.calendarApi.requestTimeout
    );

    try {
        let url = APP_CONFIG.calendarApi.url;
        const options = {
            method,
            redirect: "follow",
            cache: "no-store",
            signal: controller.signal
        };

        if (method === "GET") {
            const requestURL = new URL(url);
            requestURL.searchParams.set("action", action);
            requestURL.searchParams.set("_", Date.now());
            url = requestURL.toString();
        } else {
            options.headers = {
                "Content-Type": "text/plain;charset=utf-8"
            };

            options.body = JSON.stringify({
                action,
                ...payload
            });
        }

        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`Calendar API ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(
                result.message || "Calendar API ทำงานไม่สำเร็จ"
            );
        }

        return result;
    } catch (error) {
        if (error.name === "AbortError") {
            throw new Error("Calendar API ใช้เวลาตอบกลับนานเกินไป");
        }

        throw error;
    } finally {
        window.clearTimeout(timeoutId);
    }
}

async function loadCalendarAppointments() {
    loadCalendarLocalBackup();
    renderFamilyCalendar();

    if (!isCalendarAPIConfigured()) {
        updateCalendarConnectionStatus(
            "กำลังใช้ข้อมูลสำรองใน Browser — ยังไม่ได้ใส่ Calendar API URL",
            "offline"
        );
        return;
    }

    try {
        updateCalendarConnectionStatus(
            "กำลังโหลดนัดหมายจาก Google Sheets..."
        );

        const result = await callCalendarAPI(
            "listAppointments",
            {},
            "GET"
        );

        calendarState.appointments =
            Array.isArray(result.data)
                ? result.data
                : [];

        saveCalendarLocalBackup();
        renderFamilyCalendar();

        updateCalendarConnectionStatus(
            "เชื่อมต่อ Google Sheets, LINE และ Telegram API พร้อมใช้งาน",
            "online"
        );
    } catch (error) {
        console.error("Load Calendar API:", error);

        updateCalendarConnectionStatus(
            "เชื่อมต่อ API ไม่สำเร็จ — แสดงข้อมูลสำรองใน Browser",
            "offline"
        );

        showToast(
            "Calendar API ไม่พร้อมใช้งาน กำลังใช้ข้อมูลสำรองในเครื่อง",
            "warning",
            4500
        );
    }
}

function renderFamilyCalendar() {
    renderCalendarMonth();
    renderAppointmentList();
}

function renderCalendarMonth() {
    const elements = getCalendarElements();

    if (!elements.grid || !elements.monthLabel) return;

    const year = calendarState.visibleDate.getFullYear();
    const month = calendarState.visibleDate.getMonth();

    elements.monthLabel.textContent =
        `${CALENDAR_MONTHS_TH[month]} ${year + 543}`;

    elements.grid.replaceChildren();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const leadingDays = firstDay.getDay();
    const totalDays = lastDay.getDate();
    const todayKey = calendarDateKey(new Date());

    for (let index = 0; index < leadingDays; index += 1) {
        const blank = document.createElement("div");
        blank.className = "calendar-day is-outside-month";
        blank.setAttribute("aria-hidden", "true");
        elements.grid.appendChild(blank);
    }

    for (let day = 1; day <= totalDays; day += 1) {
        const date = new Date(year, month, day);
        const dateKey = calendarDateKey(date);

        const dayAppointments =
            calendarState.appointments.filter(
                item =>
                    item.status !== "deleted" &&
                    item.date === dateKey
            );

        const button = document.createElement("button");
        button.type = "button";
        button.className = "calendar-day";
        button.dataset.date = dateKey;
        button.setAttribute(
            "aria-label",
            `${formatCalendarDateThai(dateKey)} มี ${dayAppointments.length} นัดหมาย`
        );

        if (dateKey === todayKey) {
            button.classList.add("is-today");
        }

        if (dateKey === calendarState.selectedDate) {
            button.classList.add("is-selected");
        }

        if (dayAppointments.length > 0) {
            button.classList.add("has-appointments");
        }

        const dayNumber = document.createElement("span");
        dayNumber.className = "calendar-day-number";
        dayNumber.textContent = String(day);

        button.appendChild(dayNumber);

        if (dayAppointments.length > 0) {
            const count = document.createElement("span");
            count.className = "calendar-event-count";
            count.textContent = String(dayAppointments.length);
            button.appendChild(count);
        }

        button.addEventListener("click", () => {
            calendarState.selectedDate = dateKey;
            calendarState.filterDate = dateKey;

            const currentElements = getCalendarElements();

            if (currentElements.dateInput) {
                currentElements.dateInput.value = dateKey;
            }

            renderFamilyCalendar();
        });

        elements.grid.appendChild(button);
    }
}

function renderAppointmentList() {
    const elements = getCalendarElements();

    if (!elements.list) return;

    let appointments = calendarState.appointments
        .filter(item => item.status !== "deleted")
        .sort((first, second) => {
            return (
                `${first.date}T${first.time}`.localeCompare(
                    `${second.date}T${second.time}`
                )
            );
        });

    if (calendarState.filterDate) {
        appointments = appointments.filter(
            item => item.date === calendarState.filterDate
        );
    }

    if (elements.filterLabel) {
        elements.filterLabel.textContent =
            calendarState.filterDate
                ? `นัดหมายวันที่ ${formatCalendarDateThai(
                    calendarState.filterDate
                )}`
                : "แสดงรายการนัดหมายทั้งหมด";
    }

    elements.list.replaceChildren();

    if (appointments.length === 0) {
        const empty = document.createElement("div");
        empty.className = "appointment-empty";
        empty.textContent =
            calendarState.filterDate
                ? "ยังไม่มีนัดหมายในวันที่เลือก"
                : "ยังไม่มีรายการนัดหมาย";
        elements.list.appendChild(empty);
        return;
    }

    const todayKey = calendarDateKey(new Date());

    appointments.forEach(appointment => {
        const card = document.createElement("article");
        card.className = "appointment-card";

        if (appointment.date === todayKey) {
            card.classList.add("is-today");
        }

        const timeBlock = document.createElement("div");
        timeBlock.className = "appointment-time-block";

        const time = document.createElement("strong");
        time.textContent = appointment.time;

        const date = document.createElement("span");
        date.textContent = formatCalendarDateThai(
            appointment.date
        );

        timeBlock.append(time, date);

        const content = document.createElement("div");
        content.className = "appointment-content";

        const meta = document.createElement("div");
        meta.className = "appointment-meta";

        const user = document.createElement("strong");
        user.textContent = appointment.user;

        const status = document.createElement("span");
        status.textContent =
            appointment.date === todayKey
                ? "นัดหมายวันนี้"
                : "กำลังจะมาถึง";

        meta.append(user, status);

        const details = document.createElement("p");
        details.textContent = appointment.details;

        const source = document.createElement("span");
        source.className = "appointment-source";
        source.innerHTML =
            `<i class="fas fa-cloud"></i> ${
                appointment.source === "local"
                    ? "ข้อมูลสำรองในเครื่อง"
                    : "Google Sheets"
            }`;

        content.append(meta, details, source);

        const actions = document.createElement("div");
        actions.className = "appointment-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "appointment-edit-btn";
        editButton.innerHTML =
            '<i class="fas fa-pen-to-square"></i> แก้ไข';

        editButton.addEventListener("click", () => {
            startEditingCalendarAppointment(appointment);
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "appointment-delete-btn";
        deleteButton.innerHTML =
            '<i class="fas fa-trash"></i> ลบนัดหมาย';

        deleteButton.addEventListener("click", () => {
            deleteCalendarAppointment(
                appointment,
                deleteButton
            );
        });

        actions.append(editButton, deleteButton);
        card.append(timeBlock, content, actions);
        elements.list.appendChild(card);
    });
}

function ensureCalendarCancelEditButton() {
    const elements = getCalendarElements();

    if (!elements.saveButton) return null;

    let cancelButton = select("#cancelEditAppointment");

    if (cancelButton) return cancelButton;

    cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.id = "cancelEditAppointment";
    cancelButton.hidden = true;
    cancelButton.innerHTML =
        '<i class="fas fa-xmark"></i> ยกเลิกการแก้ไข';

    elements.saveButton.insertAdjacentElement(
        "afterend",
        cancelButton
    );

    cancelButton.addEventListener(
        "click",
        cancelCalendarAppointmentEdit
    );

    return cancelButton;
}

function startEditingCalendarAppointment(appointment) {
    const elements = getCalendarElements();
    const cancelButton = ensureCalendarCancelEditButton();

    calendarState.editingAppointmentId =
        String(appointment.id || "");

    if (elements.userInput) {
        elements.userInput.value = appointment.user || "";
    }

    if (elements.dateInput) {
        elements.dateInput.value = appointment.date || "";
    }

    if (elements.timeInput) {
        elements.timeInput.value = appointment.time || "";
    }

    if (elements.detailsInput) {
        elements.detailsInput.value = appointment.details || "";
        elements.detailsInput.focus();
    }

    if (elements.saveButton) {
        elements.saveButton.innerHTML =
            '<i class="fas fa-floppy-disk"></i> บันทึกการแก้ไข';
    }

    if (cancelButton) {
        cancelButton.hidden = false;
    }

    const editDate = parseCalendarDate(appointment.date);

    if (editDate) {
        calendarState.visibleDate = new Date(
            editDate.getFullYear(),
            editDate.getMonth(),
            1
        );
        calendarState.selectedDate = appointment.date;
        calendarState.filterDate = appointment.date;
    }

    renderFamilyCalendar();

    showToast(
        "กำลังแก้ไขนัดหมาย กรุณาปรับข้อมูลแล้วกดบันทึกการแก้ไข",
        "info",
        3500
    );

    document
        .querySelector("#appointmentUser")
        ?.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
}

function cancelCalendarAppointmentEdit() {
    const elements = getCalendarElements();

    calendarState.editingAppointmentId = "";

    if (elements.userInput) {
        elements.userInput.value = "";
    }

    if (elements.timeInput) {
        elements.timeInput.value = "";
    }

    if (elements.detailsInput) {
        elements.detailsInput.value = "";
    }

    if (elements.dateInput) {
        elements.dateInput.value =
            calendarState.selectedDate ||
            calendarDateKey(new Date());
    }

    if (elements.saveButton) {
        elements.saveButton.disabled = false;
        elements.saveButton.innerHTML =
            '<i class="fas fa-floppy-disk"></i> บันทึกนัดหมาย';
    }

    const cancelButton = select("#cancelEditAppointment");

    if (cancelButton) {
        cancelButton.hidden = true;
    }

    showToast(
        "ยกเลิกการแก้ไขแล้ว",
        "info",
        1800
    );
}

async function saveCalendarAppointment() {
    const elements = getCalendarElements();

    const user = String(
        elements.userInput?.value || ""
    ).trim();

    const date = String(
        elements.dateInput?.value || ""
    ).trim();

    const time = String(
        elements.timeInput?.value || ""
    ).trim();

    const details = String(
        elements.detailsInput?.value || ""
    ).trim();

    if (!user || !date || !time || !details) {
        showToast(
            "กรุณากรอกชื่อ วันที่ เวลา และรายละเอียดให้ครบ",
            "warning"
        );
        return;
    }

    const duplicated =
        calendarState.appointments.some(item => {
            return (
                item.status !== "deleted" &&
                item.id !== calendarState.editingAppointmentId &&
                item.date === date &&
                item.time === time
            );
        });

    if (duplicated) {
        showToast(
            "ช่วงเวลานี้มีผู้ใช้งานบันทึกนัดหมายไว้แล้ว กรุณาลบรายการเดิมหรือเลือกเวลาใหม่",
            "warning",
            4500
        );
        return;
    }

    const isEditing =
        Boolean(calendarState.editingAppointmentId);

    const temporaryAppointment = {
        id: isEditing
            ? calendarState.editingAppointmentId
            : createCalendarAppointmentId(),
        user,
        date,
        time,
        details,
        createdAt: new Date().toISOString(),
        status: "active",
        source: "local"
    };

    if (elements.saveButton) {
        elements.saveButton.disabled = true;
        elements.saveButton.innerHTML =
            isEditing
                ? '<i class="fas fa-spinner fa-spin"></i> กำลังอัปเดต...'
                : '<i class="fas fa-spinner fa-spin"></i> กำลังบันทึก...';
    }

    try {
        if (isCalendarAPIConfigured()) {
            const action = isEditing
                ? "updateAppointment"
                : "createAppointment";

            const payload = isEditing
                ? {
                    appointmentId:
                        calendarState.editingAppointmentId,
                    user,
                    date,
                    time,
                    details
                }
                : temporaryAppointment;

            const result = await callCalendarAPI(
                action,
                payload
            );

            const savedAppointment = {
                ...(result.appointment || temporaryAppointment),
                id:
                    result.appointment?.id ||
                    calendarState.editingAppointmentId ||
                    temporaryAppointment.id,
                source: "sheet"
            };

            if (isEditing) {
                calendarState.appointments =
                    calendarState.appointments.map(item =>
                        item.id === calendarState.editingAppointmentId
                            ? savedAppointment
                            : item
                    );
            } else {
                calendarState.appointments.push(
                    savedAppointment
                );
            }

            updateCalendarConnectionStatus(
                isEditing
                    ? "อัปเดตนัดหมายใน Google Sheets สำเร็จ"
                    : "บันทึกลง Google Sheets สำเร็จ",
                "online"
            );
        } else if (isEditing) {
            calendarState.appointments =
                calendarState.appointments.map(item =>
                    item.id === calendarState.editingAppointmentId
                        ? temporaryAppointment
                        : item
                );
        } else {
            calendarState.appointments.push(
                temporaryAppointment
            );
        }

        saveCalendarLocalBackup();

        calendarState.visibleDate =
            parseCalendarDate(date) || new Date();

        calendarState.selectedDate = date;
        calendarState.filterDate = date;

        if (elements.detailsInput) {
            elements.detailsInput.value = "";
        }

        if (elements.timeInput) {
            elements.timeInput.value = "";
        }

        calendarState.editingAppointmentId = "";

        const cancelButton = select("#cancelEditAppointment");

        if (cancelButton) {
            cancelButton.hidden = true;
        }

        renderFamilyCalendar();

        showToast(
            isEditing
                ? "แก้ไขนัดหมายเรียบร้อยแล้ว"
                : (
                    isCalendarAPIConfigured()
                        ? "บันทึกนัดหมายลง Google Sheets เรียบร้อยแล้ว"
                        : "บันทึกนัดหมายไว้ใน Browser แล้ว"
                ),
            "success"
        );
    } catch (error) {
        console.error("Save Calendar:", error);

        showToast(
            error.message || "ไม่สามารถบันทึกนัดหมายได้",
            "error",
            4500
        );
    } finally {
        if (elements.saveButton) {
            elements.saveButton.disabled = false;
            elements.saveButton.innerHTML =
                calendarState.editingAppointmentId
                    ? '<i class="fas fa-floppy-disk"></i> บันทึกการแก้ไข'
                    : '<i class="fas fa-floppy-disk"></i> บันทึกนัดหมาย';
        }
    }
}

async function deleteCalendarAppointment(
    appointment,
    button
) {
    const confirmed = window.confirm(
        `ต้องการลบนัดหมายวันที่ ${formatCalendarDateThai(
            appointment.date
        )} เวลา ${appointment.time} หรือไม่?`
    );

    if (!confirmed) return;

    button.disabled = true;
    button.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> กำลังลบ...';

    try {
        if (
            isCalendarAPIConfigured() &&
            appointment.source !== "local"
        ) {
            await callCalendarAPI(
                "deleteAppointment",
                {
                    appointmentId: appointment.id
                }
            );
        }

        calendarState.appointments =
            calendarState.appointments.filter(
                item => item.id !== appointment.id
            );

        saveCalendarLocalBackup();
        renderFamilyCalendar();

        showToast(
            "ลบนัดหมายเรียบร้อยแล้ว ช่วงเวลานี้สามารถใช้งานใหม่ได้",
            "success"
        );
    } catch (error) {
        console.error("Delete Calendar:", error);

        button.disabled = false;
        button.innerHTML =
            '<i class="fas fa-trash"></i> ลบนัดหมาย';

        showToast(
            error.message || "ไม่สามารถลบนัดหมายได้",
            "error"
        );
    }
}

function initializeFamilyCalendar() {
    const elements = getCalendarElements();

    if (!elements.grid) return;

    const today = new Date();
    const todayKey = calendarDateKey(today);

    calendarState.visibleDate =
        new Date(today.getFullYear(), today.getMonth(), 1);

    calendarState.selectedDate = todayKey;

    if (elements.dateInput) {
        elements.dateInput.value = todayKey;
        elements.dateInput.min = todayKey;

        elements.dateInput.addEventListener(
            "change",
            event => {
                const date =
                    parseCalendarDate(event.target.value);

                if (!date) return;

                calendarState.visibleDate =
                    new Date(
                        date.getFullYear(),
                        date.getMonth(),
                        1
                    );

                calendarState.selectedDate =
                    event.target.value;

                renderCalendarMonth();
            }
        );
    }

    elements.previousButton?.addEventListener(
        "click",
        () => {
            calendarState.visibleDate = new Date(
                calendarState.visibleDate.getFullYear(),
                calendarState.visibleDate.getMonth() - 1,
                1
            );

            renderCalendarMonth();
        }
    );

    elements.nextButton?.addEventListener(
        "click",
        () => {
            calendarState.visibleDate = new Date(
                calendarState.visibleDate.getFullYear(),
                calendarState.visibleDate.getMonth() + 1,
                1
            );

            renderCalendarMonth();
        }
    );

    elements.showAllButton?.addEventListener(
        "click",
        () => {
            calendarState.filterDate = "";
            renderAppointmentList();
        }
    );

    ensureCalendarCancelEditButton();

    elements.saveButton?.addEventListener(
        "click",
        saveCalendarAppointment
    );

    elements.detailsInput?.addEventListener(
        "keydown",
        event => {
            if (
                event.key === "Enter" &&
                (event.ctrlKey || event.metaKey)
            ) {
                saveCalendarAppointment();
            }
        }
    );

    loadCalendarAppointments();
}



/* ===========================================================
   19. GLOBAL ERROR HANDLING
=========================================================== */

window.addEventListener("error", event => {

    console.error(
        "Family Dashboard Error:",
        event.error || event.message
    );

});


window.addEventListener(
    "unhandledrejection",
    event => {

        console.error(
            "Unhandled Promise Rejection:",
            event.reason
        );

    }
);


/* ===========================================================
   20. APPLICATION INITIALIZATION
=========================================================== */

function initializeApplication() {

    cacheDOMElements();

    injectRuntimeStyles();

    initializeAccessibility();

    initializeSPANavigation();

    initializeMobileMenu();

    initializeDropdown();

    initializeHouseFiles();

    initializeExpenseTracker();

    initializeGoogleMaps();

    initializeFamilyBoard();

    initializeFamilyCalendar();

    initializeSnowAnimation();

    initializeHeroParallax();

    initializeScrollReveal();

    initializeButtonEffects();

    const initialPage =
        getInitialPageFromHash();

    navigateToPage(initialPage, {
        updateHash: false,
        smoothScroll: false
    });

    startSplashLoading();
    
}


/* ===========================================================
   START APPLICATION
=========================================================== */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeApplication,
        { once: true }
    );

} else {

    initializeApplication();

}
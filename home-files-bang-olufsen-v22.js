/* =========================================================
   HOME FILES - BANG & OLUFSEN V22
   Adds Bang & Olufsen quotation to:
   - top "ข้อมูลไฟล์บ้าน" submenu
   - house files overview page
   - dedicated Bang & Olufsen page
   ========================================================= */
(() => {
  "use strict";

  if (window.__BANG_OLUFSEN_FILES_V22__) return;
  window.__BANG_OLUFSEN_FILES_V22__ = true;

  const PAGE_ID = "bang-olufsen-files";
  const PDF_URL = "pdf/Bang-Olufsen-Quotation.pdf";

  const fallbackNavigate = pageId => {
    document.querySelectorAll(".page").forEach(page => {
      page.classList.remove("active", "page-enter");
      page.classList.add("hidden-page");
      page.setAttribute("aria-hidden", "true");
    });

    const target = document.getElementById(pageId);
    if (!target) return;

    target.classList.remove("hidden-page");
    target.classList.add("active", "page-enter");
    target.setAttribute("aria-hidden", "false");

    document.querySelector(".quick-menu")?.classList.add("quick-menu-hidden");
    history.replaceState(null, "", `#${pageId}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigate = pageId => {
    try {
      if (typeof navigateToPage === "function") {
        navigateToPage(pageId);
        return;
      }
    } catch (_) {}

    fallbackNavigate(pageId);
  };

  const bindPageLink = element => {
    if (!element || element.dataset.boBound === "1") return;
    element.dataset.boBound = "1";

    element.addEventListener("click", event => {
      event.preventDefault();
      navigate(PAGE_ID);
    });
  };

  const addSubmenuItem = () => {
    const submenu = document.querySelector("#mainMenu .dropdown .submenu");
    if (!submenu || submenu.querySelector(`[data-page="${PAGE_ID}"]`)) return;

    const li = document.createElement("li");
    const link = document.createElement("a");

    link.href = `#${PAGE_ID}`;
    link.dataset.page = PAGE_ID;
    link.innerHTML = "🎵 Bang &amp; Olufsen";

    li.appendChild(link);
    submenu.appendChild(li);
    bindPageLink(link);
  };

  const addOverviewCard = () => {
    const grid = document.querySelector("#files .file-grid");
    if (!grid || grid.querySelector(`[data-bo-card-v22]`)) return;

    const card = document.createElement("div");
    card.className = "file-card";
    card.dataset.boCardV22 = "1";
    card.innerHTML = `
      <div class="file-icon">🎵</div>
      <h3>Bang &amp; Olufsen</h3>
      <p>Quotation / Audio System</p>
      <button class="category-page-button" data-page="${PAGE_ID}" type="button">
        เปิดใบเสนอราคา
      </button>
    `;

    grid.appendChild(card);
    bindPageLink(card.querySelector("button"));
  };

  const addDedicatedPage = () => {
    if (document.getElementById(PAGE_ID)) return;

    const expensePage = document.getElementById("expense");
    const content = document.getElementById("content");
    if (!content) return;

    const section = document.createElement("section");
    section.className = "page hidden-page";
    section.id = PAGE_ID;
    section.setAttribute("aria-hidden", "true");

    section.innerHTML = `
      <div class="page-title">
        <h2>🎵 Bang &amp; Olufsen</h2>
        <p>เอกสารใบเสนอราคาระบบเครื่องเสียงภายในบ้าน</p>
      </div>
      <div class="file-grid">
        <div class="file-card">
          <div class="file-icon">🧾</div>
          <h3>ใบเสนอราคา Bang &amp; Olufsen</h3>
          <p>B&amp;O Proposal / Quotation PDF</p>
          <button class="open-file bo-open-file-v22" type="button">
            เปิดไฟล์
          </button>
        </div>
      </div>
    `;

    if (expensePage) content.insertBefore(section, expensePage);
    else content.appendChild(section);

    section.querySelector(".bo-open-file-v22")?.addEventListener("click", () => {
      window.open(PDF_URL, "_blank", "noopener,noreferrer");
    });
  };

  const refreshHomeRuntimeCollections = () => {
    try {
      if (typeof DOM !== "undefined") {
        DOM.pages = Array.from(document.querySelectorAll(".page"));
        DOM.pageLinks = Array.from(document.querySelectorAll("[data-page]"));
      }
    } catch (_) {}
  };

  const init = () => {
    addSubmenuItem();
    addOverviewCard();
    addDedicatedPage();
    refreshHomeRuntimeCollections();

    document
      .querySelectorAll(`[data-page="${PAGE_ID}"]`)
      .forEach(bindPageLink);

    if (location.hash === `#${PAGE_ID}`) {
      window.setTimeout(() => navigate(PAGE_ID), 0);
    }
  };

  // The loader is executed at the end of index.html. Inject immediately so
  // home.js can still cache the new page during its DOMContentLoaded setup.
  init();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  }
})();

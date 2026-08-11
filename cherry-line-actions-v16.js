/* =========================================================
   Cherry AI LINE Add Friend Actions V16
   Adds LINE deep-link + App Store + Google Play whenever
   Cherry returns a contact with a LINE ID.
   ========================================================= */
(() => {
  "use strict";
  if (window.__CHERRY_LINE_ACTIONS_V16__) return;
  window.__CHERRY_LINE_ACTIONS_V16__ = true;

  const LINE_APP_STORE = "https://apps.apple.com/app/line/id443904275";
  const LINE_PLAY_STORE = "https://play.google.com/store/apps/details?id=jp.naver.line.android";

  const cleanLineId = value => String(value || "").trim().replace(/^@/, "");
  const addFriendUrl = lineId => `https://line.me/ti/p/~${encodeURIComponent(cleanLineId(lineId))}`;

  const makeLink = (label, url, className = "") => {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.className = className;
    a.textContent = label;
    return a;
  };

  const renderWidgetContacts = contacts => {
    const host = document.querySelector("#cherryWidgetActions");
    if (!host) return;

    contacts.forEach(contact => {
      const lineId = cleanLineId(contact?.line_id);
      if (!lineId) return;

      const friend = makeLink(`เพิ่ม LINE ${contact.name || lineId}`, addFriendUrl(lineId), "cherry-action-pill cherry-line-friend-v16");
      friend.dataset.cherryLineV16 = lineId;
      friend.innerHTML = `<i class="fab fa-line"></i><span>เพิ่ม LINE ${contact.name || lineId}</span>`;
      host.appendChild(friend);
    });

    if (contacts.some(c => cleanLineId(c?.line_id))) {
      const ios = makeLink("LINE • App Store", LINE_APP_STORE, "cherry-action-pill cherry-line-store-v16");
      ios.innerHTML = '<i class="fab fa-apple"></i><span>LINE • App Store</span>';
      const android = makeLink("LINE • Google Play", LINE_PLAY_STORE, "cherry-action-pill cherry-line-store-v16");
      android.innerHTML = '<i class="fab fa-google-play"></i><span>LINE • Google Play</span>';
      host.append(ios, android);
    }
  };

  const enhanceFullPageContacts = contacts => {
    const host = document.querySelector("#cherryPageActions");
    if (!host) return;

    contacts.forEach(contact => {
      const lineId = cleanLineId(contact?.line_id);
      if (!lineId) return;

      const card = document.createElement("div");
      card.className = "cherry-page-action cherry-line-card-v16";
      card.dataset.cherryLineV16 = lineId;

      const info = document.createElement("div");
      const strong = document.createElement("strong");
      const small = document.createElement("small");
      strong.textContent = contact.name || "LINE";
      small.textContent = `LINE ID: ${lineId}`;
      info.append(strong, small);

      const buttons = document.createElement("div");
      buttons.className = "cherry-line-buttons-v16";
      const add = makeLink("เพิ่มเพื่อน", addFriendUrl(lineId));
      add.className = "cherry-line-add-v16";
      buttons.appendChild(add);
      card.append(info, buttons);
      host.appendChild(card);
    });

    if (contacts.some(c => cleanLineId(c?.line_id))) {
      const stores = document.createElement("div");
      stores.className = "cherry-page-action cherry-line-store-card-v16";
      const info = document.createElement("div");
      info.innerHTML = "<strong>ยังไม่มีแอป LINE?</strong><small>ดาวน์โหลดตามอุปกรณ์ของคุณ</small>";
      const buttons = document.createElement("div");
      buttons.className = "cherry-line-buttons-v16";
      buttons.append(
        makeLink("App Store", LINE_APP_STORE),
        makeLink("Google Play", LINE_PLAY_STORE)
      );
      stores.append(info, buttons);
      host.appendChild(stores);
    }
  };

  const install = () => {
    const client = window.CherryAI?.client;
    if (!client || client.__lineActionsV16Wrapped) return false;

    const originalChat = client.chat.bind(client);
    client.chat = async (...args) => {
      const data = await originalChat(...args);
      queueMicrotask(() => {
        const contacts = Array.isArray(data?.actions?.contacts) ? data.actions.contacts : [];
        if (!contacts.length) return;
        setTimeout(() => {
          renderWidgetContacts(contacts);
          enhanceFullPageContacts(contacts);
        }, 0);
      });
      return data;
    };
    client.__lineActionsV16Wrapped = true;
    return true;
  };

  if (!install()) {
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      if (install() || tries > 80) clearInterval(timer);
    }, 100);
  }
})();

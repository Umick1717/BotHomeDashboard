/* =========================================================
   CHERRY AI FULL PAGE
   ========================================================= */
(() => {
  "use strict";
  const client = window.CherryAI?.client;
  if (!client) return;

  const $ = s => document.querySelector(s);
  const messages = $("#cherryPageMessages");
  const actions = $("#cherryPageActions");
  const form = $("#cherryPageForm");
  const input = $("#cherryPageInput");
  const mic = $("#cherryPageMic");
  const state = $("#cherryPageState");
  const avatar = $("#cherryPageAvatar");
  const video = $("#cherryPageVideo");
  const fallback = $("#cherryPageFallback");
  const imageFallback = $("#cherryPageImageFallback");

  const avatarImageCandidates = [
    "cherry-assets/avatar-agent.png",
    "cherry-assets/avatar.png",
    "cherry-assets/avatar-sprite.png"
  ];
  let avatarImageIndex = 0;

  const showImageFallback = () => {
    if (video) video.hidden = true;
    if (imageFallback) {
      imageFallback.hidden = false;
      if (!imageFallback.getAttribute("src")) {
        imageFallback.src = avatarImageCandidates[0];
      }
    }
    if (fallback) fallback.hidden = true;
  };

  const showLetterFallback = () => {
    if (video) video.hidden = true;
    if (imageFallback) imageFallback.hidden = true;
    if (fallback) fallback.hidden = false;
  };

  video?.addEventListener("error", showImageFallback);
  video?.addEventListener("canplay", () => {
    video.hidden = false;
    if (imageFallback) imageFallback.hidden = true;
    if (fallback) fallback.hidden = true;
  });

  imageFallback?.addEventListener("load", () => {
    if (video?.hidden) {
      imageFallback.hidden = false;
      fallback.hidden = true;
    }
  });

  imageFallback?.addEventListener("error", () => {
    avatarImageIndex += 1;
    if (avatarImageIndex < avatarImageCandidates.length) {
      imageFallback.src = avatarImageCandidates[avatarImageIndex];
    } else {
      showLetterFallback();
    }
  });

  const setState = (mode, text) => {
    state.textContent = text;
    avatar.dataset.state = mode;
    if (!video || video.hidden) return;
    const src = mode === "speaking"
      ? "cherry-assets/cherry-talking.mp4"
      : mode === "reacting"
        ? "cherry-assets/cherry-reaction.mp4"
        : "cherry-assets/cherry-idle.mp4";
    const currentPath = new URL(video.currentSrc || video.src || "", location.href).pathname;
    const wantedPath = new URL(src, location.href).pathname;
    if (currentPath !== wantedPath) {
      video.hidden = false;
      video.src = src;
      video.loop = mode !== "reacting";
      video.load();
      video.play().catch(() => showImageFallback());
    } else {
      video.hidden = false;
      video.play().catch(() => showImageFallback());
    }
  };

  const bubble = (text, type = "assistant") => {
    const div = document.createElement("div");
    div.className = `cherry-page-message cherry-${type}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  };

  const renderActions = data => {
    actions.innerHTML = "";
    const card = (title, detail, url, label = "เปิด") => {
      const item = document.createElement("div");
      item.className = "cherry-page-action";
      const info = document.createElement("div");
      const strong = document.createElement("strong");
      strong.textContent = title || "";
      const small = document.createElement("small");
      small.textContent = detail || "";
      info.append(strong, small);
      item.appendChild(info);
      if (url) {
        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = label;
        item.appendChild(a);
      }
      actions.appendChild(item);
    };

    if (data?.map) card(data.map.label, "Malton Gates", data.map.url, "นำทาง");
    (data?.contacts || []).forEach(c => card(
      c.name,
      `${c.phone || "-"} • LINE: ${c.line_id || "-"}`,
      c.phone ? `tel:${String(c.phone).replace(/\D/g, "")}` : "",
      "โทร"
    ));
    (data?.files || []).slice(0, 8).forEach(f => card(f.name, f.category, f.url, "เปิดไฟล์"));
    (data?.appointments || []).slice(0, 8).forEach(a => card(
      `${a.date || ""} ${a.time || ""}`,
      `${a.name || ""}: ${a.details || ""}`,
      "",
      ""
    ));
  };

  const ask = async text => {
    const q = String(text || "").trim();
    if (!q) return;
    bubble(q, "user");
    input.value = "";
    actions.innerHTML = "";
    setState("thinking", "กำลังค้นหาข้อมูล...");

    try {
      const data = await client.chat(q);
      const answer = data.answer || "ยังไม่มีคำตอบค่ะ";
      bubble(answer, "assistant");
      renderActions(data.actions || {});
      setState("speaking", "กำลังพูดค่ะ");
      await client.speak(data.speech_answer || answer);
      setState("idle", "พร้อมรับคำถามค่ะ");
    } catch (err) {
      bubble(err.message || "เกิดข้อผิดพลาด", "error");
      setState("idle", "กรุณาลองใหม่ค่ะ");
    }
  };

  form.addEventListener("submit", e => {
    e.preventDefault();
    ask(input.value);
  });

  mic.addEventListener("click", async () => {
    mic.classList.add("is-listening");
    setState("listening", "กำลังฟัง... พูดได้เลยค่ะ");
    try {
      const text = await client.listen();
      if (!text) throw new Error("ไม่ได้ยินคำถามค่ะ");
      input.value = text;
      await ask(text);
    } catch (err) {
      bubble(err.message || "รับเสียงไม่สำเร็จ", "error");
      setState("idle", "พิมพ์คำถามได้เลยค่ะ");
    } finally {
      mic.classList.remove("is-listening");
    }
  });

  document.querySelectorAll("[data-cherry-q]").forEach(btn => {
    btn.addEventListener("click", () => ask(btn.dataset.cherryQ || ""));
  });

  avatar.addEventListener("click", async () => {
    setState("reacting", "Cherry กำลังทักทายค่ะ");
    try {
      await client.speak("สวัสดีค่ะ ฉันคือ Cherry AI ผู้ช่วยประจำบ้าน พร้อมช่วยคุณเสมอค่ะ");
    } finally {
      setState("idle", "พร้อมรับคำถามค่ะ");
    }
  });
})();

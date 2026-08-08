(() => {
  'use strict';

  const ua = navigator.userAgent || '';
  const isIOS = /iPad|iPhone|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  const isLine = /Line\//i.test(ua) || /\bLINE\b/i.test(ua);
  const isFacebook = /FBAN|FBAV/i.test(ua);
  const isInstagram = /Instagram/i.test(ua);
  const isInAppBrowser = isLine || isFacebook || isInstagram;
  const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/i.test(ua) && !isInAppBrowser;
  const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition || null;

  function preferredBrowser() {
    return isIOS ? 'Safari' : 'Chrome';
  }

  function browserName() {
    if (isLine) return 'LINE';
    if (isFacebook) return 'Facebook';
    if (isInstagram) return 'Instagram';
    if (isSafari) return 'Safari';
    return 'Browser';
  }

  function speechServiceHelp(code = '') {
    const c = String(code || '').toLowerCase();

    if (isInAppBrowser) {
      return `ระบบตอบด้วยเสียงไม่รองรับภายใน ${browserName()} กรุณาเปิดลิงก์ด้วย ${preferredBrowser()} โดยตรง`;
    }

    if (c === 'service-not-allowed') {
      if (isIOS && isSafari) {
        return 'Safari เข้าถึงไมโครโฟนได้ แต่บริการ Speech Recognition ของ iOS ยังไม่พร้อม ให้เปิด Settings > General > Keyboard > Enable Dictation แล้วกลับมา Reload หน้าเกม หากยังไม่ได้ให้ใช้โหมด Dictation สำรอง';
      }
      return 'บริการ Speech Recognition ถูกปฏิเสธโดยเบราว์เซอร์ กรุณาตรวจการตั้งค่าเสียงแล้วลองใหม่';
    }

    if (c === 'not-allowed' || c === 'permission-denied') {
      return 'กรุณาอนุญาต Microphone ให้เว็บไซต์ใน Settings ของเบราว์เซอร์ แล้ว Reload หน้าเกม';
    }
    if (c === 'audio-capture') return 'ไม่พบไมโครโฟน หรือไมโครโฟนกำลังถูกแอปอื่นใช้งาน';
    if (c === 'network') return 'ระบบรู้จำเสียงต้องใช้อินเทอร์เน็ต กรุณาตรวจสอบเครือข่าย';
    if (c === 'no-speech') return 'ยังไม่ได้ยินเสียง กรุณาพูดใกล้ไมโครโฟนแล้วลองใหม่';
    if (c === 'aborted') return 'การฟังถูกยกเลิก กรุณากดลองใหม่';
    return 'ระบบรู้จำเสียงยังไม่พร้อม กรุณาลองใหม่ หรือใช้ Dictation สำรอง';
  }

  function createRecognition(lang, handlers = {}) {
    if (!SpeechRecognitionCtor) return null;
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 5;
    Object.entries(handlers).forEach(([name, handler]) => {
      recognition[`on${name}`] = handler;
    });
    return recognition;
  }

  // IMPORTANT: start() is deliberately synchronous. Safari may reject SpeechRecognition
  // when start() is deferred until after an awaited getUserMedia() permission request.
  function startRecognitionNow(recognition) {
    if (isInAppBrowser) {
      const error = new Error(speechServiceHelp('service-not-allowed'));
      error.code = 'service-not-allowed';
      throw error;
    }
    if (!recognition) {
      const error = new Error('Speech Recognition ไม่รองรับในเบราว์เซอร์นี้');
      error.code = 'unsupported';
      throw error;
    }
    try { recognition.abort(); } catch (_) {}
    recognition.start();
  }

  async function testMicrophoneCapture() {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('Microphone API ไม่รองรับในเบราว์เซอร์นี้');
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    stream.getTracks().forEach(track => track.stop());
    return true;
  }

  function ensureDictationSheet() {
    let sheet = document.getElementById('voiceDictationSheet');
    if (sheet) return sheet;

    sheet = document.createElement('div');
    sheet.id = 'voiceDictationSheet';
    sheet.className = 'dictation-sheet';
    sheet.hidden = true;
    sheet.innerHTML = `
      <div class="dictation-card" role="dialog" aria-modal="true" aria-labelledby="dictationTitle">
        <button class="dictation-close" type="button" aria-label="ปิด">×</button>
        <h3 id="dictationTitle">🎙️ Voice / Dictation</h3>
        <p class="dictation-help"></p>
        <input class="dictation-input" type="text" autocomplete="off" autocapitalize="off" enterkeyhint="done" />
        <p class="dictation-tip">iPhone/iPad: แตะช่องด้านบน แล้วแตะปุ่ม 🎤 Dictation บนคีย์บอร์ด จากนั้นกด “ใช้คำตอบนี้”</p>
        <button class="dictation-submit" type="button">✅ ใช้คำตอบนี้</button>
      </div>`;
    document.body.appendChild(sheet);
    sheet.querySelector('.dictation-close').addEventListener('click', () => { sheet.hidden = true; });
    sheet.addEventListener('click', event => { if (event.target === sheet) sheet.hidden = true; });
    return sheet;
  }

  function showDictationFallback({ title = 'Voice / Dictation', help = '', placeholder = 'พูดหรือพิมพ์คำตอบ', inputMode = 'text', onSubmit }) {
    const sheet = ensureDictationSheet();
    const titleEl = sheet.querySelector('#dictationTitle');
    const helpEl = sheet.querySelector('.dictation-help');
    const input = sheet.querySelector('.dictation-input');
    const submit = sheet.querySelector('.dictation-submit');

    titleEl.textContent = `🎙️ ${title}`;
    helpEl.textContent = help || (isIOS ? 'ถ้า Safari Speech Recognition ใช้ไม่ได้ ให้ใช้ Dictation ของคีย์บอร์ด iPhone/iPad เป็นโหมดสำรอง' : 'พูดหรือพิมพ์คำตอบ แล้วกดยืนยัน');
    input.value = '';
    input.placeholder = placeholder;
    input.inputMode = inputMode;
    sheet.hidden = false;

    const finish = () => {
      const value = input.value.trim();
      if (!value) return;
      sheet.hidden = true;
      onSubmit?.(value);
    };

    submit.onclick = finish;
    input.onkeydown = event => { if (event.key === 'Enter') finish(); };
    setTimeout(() => input.focus({ preventScroll: false }), 80);
  }

  window.MobileVoiceFixV2 = {
    isIOS,
    isAndroid,
    isSafari,
    isInAppBrowser,
    SpeechRecognitionCtor,
    preferredBrowser,
    browserName,
    speechServiceHelp,
    createRecognition,
    startRecognitionNow,
    testMicrophoneCapture,
    showDictationFallback
  };
})();

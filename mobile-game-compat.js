(() => {
  'use strict';

  const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  const isSecure = window.isSecureContext || location.hostname === 'localhost' || location.hostname === '127.0.0.1';

  function mediaErrorMessage(error, kind = 'media') {
    const name = error?.name || '';
    if (!isSecure) return 'ต้องเปิดเว็บผ่าน HTTPS หรือ localhost จึงจะใช้กล้อง/ไมโครโฟนได้';
    if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
      return kind === 'camera'
        ? 'กรุณาอนุญาต Camera ให้เว็บไซต์ใน Settings ของเบราว์เซอร์'
        : 'กรุณาอนุญาต Microphone ให้เว็บไซต์ใน Settings ของเบราว์เซอร์';
    }
    if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
      return kind === 'camera' ? 'ไม่พบกล้องที่ใช้งานได้' : 'ไม่พบไมโครโฟนที่ใช้งานได้';
    }
    if (name === 'NotReadableError' || name === 'TrackStartError') {
      return kind === 'camera'
        ? 'กล้องกำลังถูกแอปอื่นใช้งาน กรุณาปิดแอปกล้องแล้วลองใหม่'
        : 'ไมโครโฟนกำลังถูกแอปอื่นใช้งาน กรุณาลองใหม่';
    }
    if (name === 'OverconstrainedError') return 'อุปกรณ์ไม่รองรับค่ากล้องที่ร้องขอ ระบบจะลองค่ามาตรฐานแทน';
    return error?.message || 'ไม่สามารถเปิดอุปกรณ์ได้';
  }

  async function requestCamera(videoEl, preferredFacing = 'user') {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('getUserMedia ไม่รองรับในเบราว์เซอร์นี้');
    if (!isSecure) throw new Error('ต้องเปิดเว็บผ่าน HTTPS หรือ localhost');

    const attempts = [
      { video: { facingMode: { ideal: preferredFacing }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
      { video: { facingMode: preferredFacing }, audio: false },
      { video: true, audio: false }
    ];

    let lastError;
    for (const constraints of attempts) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoEl.setAttribute('playsinline', '');
        videoEl.setAttribute('webkit-playsinline', '');
        videoEl.muted = true;
        videoEl.autoplay = true;
        videoEl.srcObject = stream;
        try { await videoEl.play(); } catch (_) {}
        return stream;
      } catch (error) {
        lastError = error;
        if (error?.name === 'NotAllowedError') break;
      }
    }
    throw lastError || new Error('เปิดกล้องไม่สำเร็จ');
  }

  async function requestMicrophonePermission() {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('getUserMedia ไม่รองรับในเบราว์เซอร์นี้');
    if (!isSecure) throw new Error('ต้องเปิดเว็บผ่าน HTTPS หรือ localhost');
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: { ideal: true },
        noiseSuppression: { ideal: true },
        autoGainControl: { ideal: true }
      },
      video: false
    });
    stream.getTracks().forEach(track => track.stop());
    return true;
  }

  function createRecognition(lang, handlers = {}) {
    if (!SpeechRecognitionCtor) return null;
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 5;
    Object.entries(handlers).forEach(([eventName, handler]) => {
      recognition[`on${eventName}`] = handler;
    });
    return recognition;
  }

  async function startRecognition(recognition) {
    if (!recognition) throw new Error('Speech Recognition ไม่รองรับในเบราว์เซอร์นี้');
    await requestMicrophonePermission();
    try { recognition.abort(); } catch (_) {}
    await new Promise(resolve => setTimeout(resolve, 80));
    recognition.start();
  }

  function stopStream(stream) {
    stream?.getTracks?.().forEach(track => track.stop());
  }

  function viewportSize() {
    const vv = window.visualViewport;
    return {
      width: Math.round(vv?.width || window.innerWidth || document.documentElement.clientWidth),
      height: Math.round(vv?.height || window.innerHeight || document.documentElement.clientHeight)
    };
  }

  function applyViewportClasses() {
    const { width, height } = viewportSize();
    const root = document.documentElement;
    root.style.setProperty('--app-vw', `${width}px`);
    root.style.setProperty('--app-vh', `${height}px`);
    root.classList.toggle('is-landscape', width > height);
    root.classList.toggle('is-portrait', height >= width);
    root.classList.toggle('is-compact-height', height < 560);
    root.classList.toggle('is-small-screen', Math.min(width, height) < 430);
  }

  function watchViewport(callback) {
    const run = () => {
      applyViewportClasses();
      callback?.(viewportSize());
    };
    window.addEventListener('resize', run, { passive: true });
    window.addEventListener('orientationchange', () => setTimeout(run, 120), { passive: true });
    window.visualViewport?.addEventListener('resize', run, { passive: true });
    window.visualViewport?.addEventListener('scroll', run, { passive: true });
    run();
    return run;
  }

  function wakeSpeechVoices() {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.getVoices();
    speechSynthesis.addEventListener?.('voiceschanged', () => speechSynthesis.getVoices(), { once: true });
  }

  wakeSpeechVoices();
  applyViewportClasses();

  window.MobileGameCompat = {
    SpeechRecognitionCtor,
    isSecure,
    mediaErrorMessage,
    requestCamera,
    requestMicrophonePermission,
    createRecognition,
    startRecognition,
    stopStream,
    viewportSize,
    watchViewport,
    applyViewportClasses
  };
})();

"use strict";

const camera = document.getElementById("camera");
const handCanvas = document.getElementById("handCanvas");
const handCtx = handCanvas.getContext("2d");
const cameraButton = document.getElementById("cameraButton");
const handStatus = document.getElementById("handStatus");
const voiceStatus = document.getElementById("voiceStatus");
const soundButton = document.getElementById("soundButton");

let stream = null;
let soundEnabled = true;
let hoveredAnswer = null;
let lastPinchAt = 0;
let mpCamera = null;
let handsInstance = null;

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;
  handCanvas.width = Math.round(width * dpr);
  handCanvas.height = Math.round(height * dpr);
  handCanvas.style.width = `${width}px`;
  handCanvas.style.height = `${height}px`;
  handCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function speak(text, lang = "en-US", rate = 0.68) {
  if (!soundEnabled || !("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = rate;
  u.pitch = 1;
  speechSynthesis.speak(u);
}

function clearCursor() {
  handCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  hoveredAnswer?.classList.remove("hand-hover");
  hoveredAnswer = null;
}

function answerAt(x, y) {
  const margin = 12;
  return [...document.querySelectorAll(".answer:not(:disabled)")].find((el) => {
    const r = el.getBoundingClientRect();
    return x >= r.left - margin && x <= r.right + margin && y >= r.top - margin && y <= r.bottom + margin;
  }) || null;
}

function drawCursor(x, y, pinching) {
  handCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  handCtx.beginPath();
  handCtx.arc(x, y, pinching ? 25 : 18, 0, Math.PI * 2);
  handCtx.fillStyle = pinching ? "rgba(250,204,21,.92)" : "rgba(45,212,191,.84)";
  handCtx.fill();
  handCtx.lineWidth = 4;
  handCtx.strokeStyle = "white";
  handCtx.stroke();
}

let smoothX = null;
let smoothY = null;
let pinchActive = false;

function onHandResults(results) {
  const lm = results.multiHandLandmarks?.[0];
  if (!lm) {
    handStatus.textContent = "🖐️ มือ: ยังไม่พบ";
    clearCursor();
    smoothX = smoothY = null;
    pinchActive = false;
    return;
  }

  handStatus.textContent = "🖐️ มือ: ตรวจพบ";
  const index = lm[8];
  const thumb = lm[4];
  const rawX = (1 - index.x) * window.innerWidth;
  const rawY = index.y * window.innerHeight;
  const alpha = 0.38;
  smoothX = smoothX == null ? rawX : smoothX + (rawX - smoothX) * alpha;
  smoothY = smoothY == null ? rawY : smoothY + (rawY - smoothY) * alpha;

  const distance = Math.hypot(index.x - thumb.x, index.y - thumb.y);
  if (!pinchActive && distance < 0.050) pinchActive = true;
  if (pinchActive && distance > 0.075) pinchActive = false;

  drawCursor(smoothX, smoothY, pinchActive);

  const current = answerAt(smoothX, smoothY);
  if (current !== hoveredAnswer) {
    hoveredAnswer?.classList.remove("hand-hover");
    current?.classList.add("hand-hover");
    hoveredAnswer = current;
  }

  const now = Date.now();
  if (pinchActive && current && now - lastPinchAt > 900) {
    lastPinchAt = now;
    current.click();
  }
}

async function enableCamera() {
  if (stream) {
    handStatus.textContent = "🖐️ มือ: กล้องพร้อม";
    return;
  }
  if (!window.MobileGameCompat) {
    handStatus.textContent = "🖐️ มือ: ระบบมือถือยังโหลดไม่เสร็จ";
    return;
  }

  cameraButton.disabled = true;
  cameraButton.textContent = "📷 กำลังเปิด...";

  try {
    stream = await MobileGameCompat.requestCamera(camera, "user");
    cameraButton.textContent = "✅ กล้องพร้อม";
    handStatus.textContent = "🖐️ มือ: กำลังเริ่ม AR";

    if (!window.Hands || !window.Camera) {
      handStatus.textContent = "🖐️ มือ: โหลด MediaPipe ไม่สำเร็จ";
      return;
    }

    handsInstance = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    handsInstance.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: .62,
      minTrackingConfidence: .58
    });

    handsInstance.onResults(onHandResults);

    mpCamera = new Camera(camera, {
      onFrame: async () => {
        if (document.visibilityState === "visible") {
          await handsInstance.send({ image: camera });
        }
      },
      width: 1280,
      height: 720
    });

    await mpCamera.start();
    handStatus.textContent = "🖐️ มือ: พร้อม";
  } catch (error) {
    handStatus.textContent = `🖐️ ${MobileGameCompat.mediaErrorMessage(error, "camera")}`;
    cameraButton.textContent = "📷 ลองเปิดกล้องอีกครั้ง";
  } finally {
    cameraButton.disabled = false;
  }
}

soundButton?.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundButton.textContent = soundEnabled ? "🔊 เสียงเปิด" : "🔇 เสียงปิด";
});

cameraButton?.addEventListener("click", enableCamera);

MobileGameCompat?.watchViewport(() => resizeCanvas());
window.addEventListener("resize", resizeCanvas, { passive: true });
window.addEventListener("orientationchange", () => setTimeout(resizeCanvas, 150), { passive: true });
window.addEventListener("beforeunload", () => {
  MobileGameCompat?.stopStream(stream);
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") speechSynthesis?.cancel();
});

resizeCanvas();

// Important for iOS/iPadOS: do not request camera automatically on page load.
// Camera and microphone permission requests are started only after a user taps a button.

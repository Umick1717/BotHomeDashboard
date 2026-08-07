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

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function resizeCanvas() {
  handCanvas.width = window.innerWidth;
  handCanvas.height = window.innerHeight;
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
  handCtx.clearRect(0, 0, handCanvas.width, handCanvas.height);
  hoveredAnswer?.classList.remove("hand-hover");
  hoveredAnswer = null;
}

function answerAt(x, y) {
  return [...document.querySelectorAll(".answer:not(:disabled)")].find((el) => {
    const r = el.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  }) || null;
}

function drawCursor(x, y, pinching) {
  handCtx.clearRect(0, 0, handCanvas.width, handCanvas.height);
  handCtx.beginPath();
  handCtx.arc(x, y, pinching ? 23 : 17, 0, Math.PI * 2);
  handCtx.fillStyle = pinching ? "rgba(250,204,21,.9)" : "rgba(45,212,191,.82)";
  handCtx.fill();
  handCtx.lineWidth = 4;
  handCtx.strokeStyle = "white";
  handCtx.stroke();
}

function onHandResults(results) {
  const lm = results.multiHandLandmarks?.[0];
  if (!lm) {
    handStatus.textContent = "🖐️ มือ: ยังไม่พบ";
    clearCursor();
    return;
  }

  handStatus.textContent = "🖐️ มือ: ตรวจพบ";
  const index = lm[8];
  const thumb = lm[4];
  const x = (1 - index.x) * window.innerWidth;
  const y = index.y * window.innerHeight;
  const pinch = Math.hypot(index.x - thumb.x, index.y - thumb.y) < .055;

  drawCursor(x, y, pinch);

  const current = answerAt(x, y);
  if (current !== hoveredAnswer) {
    hoveredAnswer?.classList.remove("hand-hover");
    current?.classList.add("hand-hover");
    hoveredAnswer = current;
  }

  const now = Date.now();
  if (pinch && current && now - lastPinchAt > 1100) {
    lastPinchAt = now;
    current.click();
  }
}

async function enableCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    handStatus.textContent = "🖐️ มือ: ไม่รองรับกล้อง";
    return;
  }

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "user" }, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false
    });

    camera.srcObject = stream;
    await camera.play();
    cameraButton.textContent = "✅ กล้องพร้อม";

    if (!window.Hands || !window.Camera) {
      handStatus.textContent = "🖐️ มือ: โหลด MediaPipe ไม่สำเร็จ";
      return;
    }

    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: .65,
      minTrackingConfidence: .6
    });

    hands.onResults(onHandResults);

    const mpCamera = new Camera(camera, {
      onFrame: async () => hands.send({ image: camera }),
      width: 1280,
      height: 720
    });

    mpCamera.start();
  } catch (error) {
    handStatus.textContent = "🖐️ มือ: เปิดกล้องไม่สำเร็จ";
  }
}

soundButton.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundButton.textContent = soundEnabled ? "🔊 เสียงเปิด" : "🔇 เสียงปิด";
});

cameraButton.addEventListener("click", enableCamera);
window.addEventListener("resize", resizeCanvas);
window.addEventListener("beforeunload", () => stream?.getTracks().forEach(t => t.stop()));

resizeCanvas();
enableCamera();

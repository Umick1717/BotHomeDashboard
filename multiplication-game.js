"use strict";

const camera = document.getElementById("camera");
const handCanvas = document.getElementById("handCanvas");
const handContext = handCanvas.getContext("2d");
const cameraFallback = document.getElementById("cameraFallback");
const cameraButton = document.getElementById("cameraButton");
const startButton = document.getElementById("startButton");
const playAgainButton = document.getElementById("playAgainButton");
const soundButton = document.getElementById("soundButton");
const voiceButton = document.getElementById("voiceButton");
const levelSelect = document.getElementById("level");
const questionText = document.getElementById("question");
const messageText = document.getElementById("message");
const answerZone = document.getElementById("answerZone");
const scoreText = document.getElementById("score");
const streakText = document.getElementById("streak");
const timeText = document.getElementById("time");
const finalScoreText = document.getElementById("finalScore");
const resultDialog = document.getElementById("resultDialog");
const handStatus = document.getElementById("handStatus");
const voiceStatus = document.getElementById("voiceStatus");

let score = 0;
let streak = 0;
let timeLeft = 60;
let timerId = null;
let activeQuestion = null;
let gameRunning = false;
let soundEnabled = true;
let cameraStream = null;
let mediaPipeCamera = null;
let handsInstance = null;
let lastPinchAt = 0;
let hoveredOrb = null;
let recognition = null;
let questionQueue = [];
let askedQuestionKeys = new Set();
let smoothX = null;
let smoothY = null;
let pinchActive = false;

function shuffle(items) {
  const list = [...items];
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function questionKey(left, right) {
  return `${Number(left)}x${Number(right)}`;
}

function makeChoices(answer) {
  const choices = new Set([Number(answer)]);
  let guard = 0;
  while (choices.size < 4 && guard < 200) {
    guard += 1;
    const delta = Math.floor(Math.random() * 25) - 12;
    const candidate = Math.max(0, Number(answer) + delta);
    choices.add(candidate);
  }
  let bump = 1;
  while (choices.size < 4) choices.add(Number(answer) + bump++);
  return shuffle([...choices]);
}

function makeQuestion(left, right) {
  const answer = Number(left) * Number(right);
  return {
    left: Number(left),
    right: Number(right),
    answer,
    question: `${left} × ${right} = ?`,
    choices: makeChoices(answer)
  };
}

function buildQuestionQueue(maxNumber) {
  const questions = [];
  for (let left = 1; left <= maxNumber; left += 1) {
    for (let right = 1; right <= maxNumber; right += 1) {
      questions.push(makeQuestion(left, right));
    }
  }
  return shuffle(questions);
}

async function getQuestion() {
  while (questionQueue.length) {
    const q = questionQueue.shift();
    const key = questionKey(q.left, q.right);
    if (!askedQuestionKeys.has(key)) {
      askedQuestionKeys.add(key);
      return q;
    }
  }
  return null;
}

function speak(text, rate = 0.72) {
  if (!soundEnabled || !("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "th-TH";
  utterance.rate = rate;
  utterance.pitch = 1;
  speechSynthesis.speak(utterance);
}

function resizeHandCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;
  handCanvas.width = Math.round(width * dpr);
  handCanvas.height = Math.round(height * dpr);
  handCanvas.style.width = `${width}px`;
  handCanvas.style.height = `${height}px`;
  handContext.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawFingerCursor(x, y, pinching) {
  handContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
  handContext.beginPath();
  handContext.arc(x, y, pinching ? 24 : 17, 0, Math.PI * 2);
  handContext.fillStyle = pinching ? "rgba(250, 204, 21, 0.90)" : "rgba(45, 212, 191, 0.82)";
  handContext.fill();
  handContext.lineWidth = 4;
  handContext.strokeStyle = "white";
  handContext.stroke();
  handContext.beginPath();
  handContext.arc(x, y, 4, 0, Math.PI * 2);
  handContext.fillStyle = "white";
  handContext.fill();
}

function clearHandCursor() {
  handContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
  hoveredOrb?.classList.remove("hand-hover");
  hoveredOrb = null;
}

function orbAtPoint(x, y) {
  const margin = 12;
  const orbs = [...answerZone.querySelectorAll(".answer-orb:not(:disabled)")];
  return orbs.find(orb => {
    const r = orb.getBoundingClientRect();
    return x >= r.left - margin && x <= r.right + margin && y >= r.top - margin && y <= r.bottom + margin;
  }) || null;
}

function processHandResults(results) {
  const landmarks = results.multiHandLandmarks?.[0];
  if (!landmarks) {
    handStatus.textContent = "🖐️ มือ: ยังไม่พบมือ";
    smoothX = smoothY = null;
    pinchActive = false;
    clearHandCursor();
    return;
  }

  const indexTip = landmarks[8];
  const thumbTip = landmarks[4];
  const rawX = (1 - indexTip.x) * window.innerWidth;
  const rawY = indexTip.y * window.innerHeight;
  const alpha = 0.38;
  smoothX = smoothX == null ? rawX : smoothX + (rawX - smoothX) * alpha;
  smoothY = smoothY == null ? rawY : smoothY + (rawY - smoothY) * alpha;

  const pinchDistance = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);
  if (!pinchActive && pinchDistance < 0.050) pinchActive = true;
  if (pinchActive && pinchDistance > 0.075) pinchActive = false;

  handStatus.textContent = "🖐️ มือ: ตรวจพบแล้ว";
  drawFingerCursor(smoothX, smoothY, pinchActive);

  const currentOrb = orbAtPoint(smoothX, smoothY);
  if (hoveredOrb !== currentOrb) {
    hoveredOrb?.classList.remove("hand-hover");
    currentOrb?.classList.add("hand-hover");
    hoveredOrb = currentOrb;
  }

  const now = Date.now();
  if (pinchActive && currentOrb && gameRunning && now - lastPinchAt > 900) {
    lastPinchAt = now;
    currentOrb.click();
  }
}

async function enableCamera() {
  if (cameraStream) {
    cameraButton.textContent = "✅ กล้องพร้อม";
    return;
  }
  if (!window.MobileGameCompat) {
    messageText.textContent = "ระบบกล้องมือถือยังโหลดไม่เสร็จ กรุณาลองอีกครั้ง";
    return;
  }

  cameraButton.disabled = true;
  cameraButton.textContent = "📷 กำลังเปิด...";

  try {
    cameraStream = await MobileGameCompat.requestCamera(camera, "user");
    cameraFallback.hidden = true;
    cameraButton.textContent = "✅ กล้องพร้อม";

    if (!window.Hands || !window.Camera) {
      handStatus.textContent = "🖐️ มือ: โหลด MediaPipe ไม่สำเร็จ";
      return;
    }

    if (!mediaPipeCamera) {
      handsInstance = new Hands({
        locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });
      handsInstance.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.62,
        minTrackingConfidence: 0.58
      });
      handsInstance.onResults(processHandResults);

      mediaPipeCamera = new Camera(camera, {
        onFrame: async () => {
          if (document.visibilityState === "visible") await handsInstance.send({ image: camera });
        },
        width: 1280,
        height: 720
      });
      await mediaPipeCamera.start();
    }

    handStatus.textContent = "🖐️ มือ: พร้อม";
  } catch (error) {
    cameraFallback.hidden = false;
    cameraButton.textContent = "📷 ลองเปิดกล้องอีกครั้ง";
    handStatus.textContent = `🖐️ ${MobileGameCompat.mediaErrorMessage(error, "camera")}`;
    messageText.textContent = "หากกล้องใช้ไม่ได้ ยังสามารถแตะคำตอบหรือใช้ไมโครโฟนได้";
  } finally {
    cameraButton.disabled = false;
  }
}

function randomPosition(index) {
  const landscape = window.innerWidth > window.innerHeight;
  const small = Math.min(window.innerWidth, window.innerHeight) < 500;
  const positions = landscape
    ? [[5, 9], [68, 7], [18, 57], [72, 55]]
    : small
      ? [[4, 8], [55, 5], [10, 58], [58, 56]]
      : [[7, 9], [69, 5], [17, 61], [73, 60]];
  return positions[index % positions.length];
}

function renderChoices(question) {
  answerZone.replaceChildren();
  question.choices.forEach((choice, index) => {
    const button = document.createElement("button");
    const [left, top] = randomPosition(index);
    button.type = "button";
    button.className = "answer-orb";
    button.textContent = choice;
    button.style.left = `${left}%`;
    button.style.top = `${top}%`;
    button.style.animationDelay = `${index * 0.25}s`;
    button.addEventListener("click", () => selectAnswer(button, Number(choice)));
    answerZone.appendChild(button);
  });
}

async function nextQuestion() {
  if (!gameRunning) return;
  activeQuestion = await getQuestion();
  if (!activeQuestion) {
    endGame("ทำครบทุกคำถามในระดับนี้แล้ว");
    return;
  }

  questionText.textContent = activeQuestion.question;
  messageText.textContent = `คำถามไม่ซ้ำ • ทำไปแล้ว ${askedQuestionKeys.size} ข้อ • แตะ ใช้มือ AR หรือพูดคำตอบ`;
  renderChoices(activeQuestion);
  speak(`${activeQuestion.left} คูณ ${activeQuestion.right} เท่ากับเท่าไร`, 0.68);
}

async function selectAnswer(button, selected) {
  if (!gameRunning || !activeQuestion) return;
  const isCorrect = selected === Number(activeQuestion.answer);
  answerZone.querySelectorAll("button").forEach(item => { item.disabled = true; });

  if (isCorrect) {
    streak += 1;
    score += 10 + Math.min(streak * 2, 20);
    button?.classList.add("correct");
    messageText.textContent = "เก่งมาก! ตอบถูกแล้ว 🎉";
    speak("เก่งมาก ตอบถูกแล้ว", 0.70);
  } else {
    streak = 0;
    score = Math.max(0, score - 3);
    button?.classList.add("wrong");
    messageText.textContent = `ยังไม่ถูก คำตอบที่ถูกคือ ${activeQuestion.answer}`;
    speak(`ยังไม่ถูกนะ คำตอบที่ถูกคือ ${activeQuestion.answer}`, 0.68);
    answerZone.querySelectorAll("button").forEach(item => {
      if (Number(item.textContent) === Number(activeQuestion.answer)) item.classList.add("correct");
    });
  }

  scoreText.textContent = score;
  streakText.textContent = `${streak} 🔥`;
  window.setTimeout(() => { if (gameRunning) nextQuestion(); }, 1500);
}

function findOrbByValue(value) {
  return [...answerZone.querySelectorAll(".answer-orb")].find(orb => Number(orb.textContent) === Number(value));
}

const thaiDigitMap = { "๐":"0", "๑":"1", "๒":"2", "๓":"3", "๔":"4", "๕":"5", "๖":"6", "๗":"7", "๘":"8", "๙":"9" };

function normalizeThaiDigits(text) {
  return [...text].map(char => thaiDigitMap[char] ?? char).join("");
}

function parseThaiNumberWords(text) {
  const cleaned = normalizeThaiDigits(text)
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/คำตอบ|ตอบว่า|เท่ากับ|คือ|ครับ|ค่ะ|คะ/g, "");

  const digitMatch = cleaned.match(/\d{1,3}/);
  if (digitMatch) return Number(digitMatch[0]);

  const english = {
    zero:0, one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8, nine:9,
    ten:10, eleven:11, twelve:12, thirteen:13, fourteen:14, fifteen:15, sixteen:16, seventeen:17, eighteen:18, nineteen:19,
    twenty:20, thirty:30, forty:40, fifty:50, sixty:60, seventy:70, eighty:80, ninety:90
  };
  const spaced = text.toLowerCase().replace(/[^a-z\s-]/g, " ").split(/[\s-]+/).filter(Boolean);
  let englishTotal = 0;
  let englishMatched = false;
  spaced.forEach(token => {
    if (Object.prototype.hasOwnProperty.call(english, token)) {
      englishTotal += english[token];
      englishMatched = true;
    }
  });
  if (englishMatched) return englishTotal;

  const units = { ศูนย์:0, หนึ่ง:1, เอ็ด:1, สอง:2, ยี่:2, สาม:3, สี่:4, ห้า:5, หก:6, เจ็ด:7, แปด:8, เก้า:9 };
  let total = 0, matched = false, remaining = cleaned;

  const hundredMatch = remaining.match(/(หนึ่ง|สอง|สาม|สี่|ห้า|หก|เจ็ด|แปด|เก้า)ร้อย/);
  if (hundredMatch) {
    total += units[hundredMatch[1]] * 100;
    remaining = remaining.replace(hundredMatch[0], "");
    matched = true;
  }

  const tenMatch = remaining.match(/(ยี่สิบ|สิบ|หนึ่งสิบ|สองสิบ|สามสิบ|สี่สิบ|ห้าสิบ|หกสิบ|เจ็ดสิบ|แปดสิบ|เก้าสิบ)/);
  if (tenMatch) {
    const token = tenMatch[1];
    if (token === "สิบ" || token === "หนึ่งสิบ") total += 10;
    else if (token === "ยี่สิบ" || token === "สองสิบ") total += 20;
    else total += (units[token.replace("สิบ", "")] || 0) * 10;
    remaining = remaining.replace(token, "");
    matched = true;
  }

  for (const token of Object.keys(units).sort((a,b) => b.length - a.length)) {
    if (remaining.includes(token)) {
      total += units[token];
      matched = true;
      break;
    }
  }
  return matched ? total : null;
}

function setupVoiceRecognition() {
  if (!window.MobileGameCompat?.SpeechRecognitionCtor) {
    voiceButton.disabled = true;
    voiceStatus.textContent = "🎤 เสียงพูด: เบราว์เซอร์ไม่รองรับ Speech Recognition";
    voiceButton.title = "ยังสามารถแตะคำตอบหรือใช้มือ AR ได้";
    return;
  }

  recognition = MobileGameCompat.createRecognition("th-TH", {
    start: () => {
      voiceButton.classList.add("listening");
      voiceButton.textContent = "🎤 กำลังฟัง...";
      voiceStatus.textContent = "🎤 เสียง: กำลังฟัง";
    },
    end: () => {
      voiceButton.classList.remove("listening");
      voiceButton.textContent = "🎤 ตอบด้วยเสียง";
      voiceStatus.textContent = "🎤 เสียง: พร้อม";
    },
    error: event => {
      voiceButton.classList.remove("listening");
      voiceButton.textContent = "🎤 ตอบด้วยเสียง";
      voiceStatus.textContent = `🎤 เสียง: ${event.error || "error"}`;
      messageText.textContent = "ไมค์หรือระบบรู้จำเสียงไม่พร้อม กรุณาแตะคำตอบหรือใช้มือ AR";
    },
    result: event => {
      const transcripts = [...event.results[0]].map(result => result.transcript);
      const parsedAnswers = transcripts.map(parseThaiNumberWords).filter(value => Number.isFinite(value));
      const selected = parsedAnswers[0];

      if (!Number.isFinite(selected)) {
        messageText.textContent = `ได้ยินว่า “${transcripts[0]}” แต่ยังอ่านเป็นตัวเลขไม่ได้`;
        speak("กรุณาพูดคำตอบเป็นตัวเลขอีกครั้ง", 0.68);
        return;
      }

      messageText.textContent = `ได้ยินคำตอบ ${selected}`;
      selectAnswer(findOrbByValue(selected), selected);
    }
  });
}

async function startVoiceAnswer() {
  if (!gameRunning) {
    messageText.textContent = "กรุณากดเริ่มเกมก่อน";
    return;
  }
  if (!recognition) {
    messageText.textContent = "เบราว์เซอร์นี้ไม่รองรับการรู้จำเสียง กรุณาแตะคำตอบหรือใช้มือ AR";
    return;
  }

  speechSynthesis?.cancel();
  voiceButton.disabled = true;
  voiceStatus.textContent = "🎤 กำลังขอสิทธิ์ไมโครโฟน...";
  try {
    await MobileGameCompat.startRecognition(recognition);
  } catch (error) {
    voiceStatus.textContent = `🎤 ${MobileGameCompat.mediaErrorMessage(error, "microphone")}`;
    messageText.textContent = "หากไมค์ใช้ไม่ได้ ยังสามารถแตะคำตอบหรือใช้มือ AR ได้";
  } finally {
    voiceButton.disabled = false;
  }
}

function startGame() {
  score = 0;
  streak = 0;
  timeLeft = 60;
  gameRunning = true;
  activeQuestion = null;
  askedQuestionKeys = new Set();
  questionQueue = buildQuestionQueue(Number(levelSelect.value));

  scoreText.textContent = score;
  streakText.textContent = `${streak} 🔥`;
  timeText.textContent = timeLeft;
  startButton.textContent = "เริ่มใหม่";

  clearInterval(timerId);
  timerId = setInterval(() => {
    timeLeft -= 1;
    timeText.textContent = timeLeft;
    if (timeLeft <= 0) endGame("หมดเวลา");
  }, 1000);

  nextQuestion();
}

function endGame(reason = "หมดเวลา") {
  gameRunning = false;
  clearInterval(timerId);
  timerId = null;
  answerZone.replaceChildren();
  questionText.textContent = reason;
  messageText.textContent = "กดเล่นอีกครั้งเพื่อเริ่มภารกิจใหม่";
  startButton.textContent = "เริ่มเกม";
  finalScoreText.textContent = score;
  speak(`${reason} คะแนนของคุณคือ ${score} คะแนน`, 0.70);

  if (typeof resultDialog.showModal === "function" && !resultDialog.open) resultDialog.showModal();
}

cameraButton.addEventListener("click", enableCamera);
startButton.addEventListener("click", startGame);
voiceButton.addEventListener("click", startVoiceAnswer);
playAgainButton.addEventListener("click", () => {
  resultDialog.close();
  startGame();
});

soundButton.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundButton.textContent = soundEnabled ? "🔊 เสียงเปิด" : "🔇 เสียงปิด";
  soundButton.setAttribute("aria-pressed", String(soundEnabled));
});

MobileGameCompat?.watchViewport(() => resizeHandCanvas());
window.addEventListener("resize", resizeHandCanvas, { passive: true });
window.addEventListener("orientationchange", () => setTimeout(resizeHandCanvas, 150), { passive: true });
window.addEventListener("beforeunload", () => MobileGameCompat?.stopStream(cameraStream));

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    speechSynthesis?.cancel();
    try { recognition?.abort(); } catch (_) {}
  }
});

resizeHandCanvas();
setupVoiceRecognition();
messageText.textContent = "V3 Mobile Ready • แตะคำตอบได้ทันที • กล้องและไมค์จะขอสิทธิ์เมื่อกดปุ่ม";

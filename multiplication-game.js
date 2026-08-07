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
let lastPinchAt = 0;
let hoveredOrb = null;
let recognition = null;

let questionQueue = [];
let askedQuestionKeys = new Set();

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

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
    choices.add(Math.max(0, Number(answer) + delta));
  }
  let bump = 1;
  while (choices.size < 4) choices.add(Number(answer) + bump++);
  return shuffle([...choices]);
}

function makeQuestion(left, right) {
  const answer = Number(left) * Number(right);
  return { left:Number(left), right:Number(right), answer, question:`${left} × ${right} = ?`, choices:makeChoices(answer) };
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
    const question = questionQueue.shift();
    const key = questionKey(question.left, question.right);
    if (!askedQuestionKeys.has(key)) {
      askedQuestionKeys.add(key);
      return question;
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
  handCanvas.width = window.innerWidth;
  handCanvas.height = window.innerHeight;
}

function drawFingerCursor(x, y, pinching) {
  handContext.clearRect(0, 0, handCanvas.width, handCanvas.height);
  handContext.beginPath();
  handContext.arc(x, y, pinching ? 23 : 17, 0, Math.PI * 2);
  handContext.fillStyle = pinching ? "rgba(250, 204, 21, 0.85)" : "rgba(45, 212, 191, 0.78)";
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
  handContext.clearRect(0, 0, handCanvas.width, handCanvas.height);
  hoveredOrb?.classList.remove("hand-hover");
  hoveredOrb = null;
}

function orbAtPoint(x, y) {
  const orbs = [...answerZone.querySelectorAll(".answer-orb:not(:disabled)")];
  return orbs.find((orb) => {
    const rect = orb.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }) || null;
}

function processHandResults(results) {
  const landmarks = results.multiHandLandmarks?.[0];
  if (!landmarks) {
    handStatus.textContent = "🖐️ มือ: ยังไม่พบมือ";
    clearHandCursor();
    return;
  }
  handStatus.textContent = "🖐️ มือ: ตรวจพบแล้ว";
  const indexTip = landmarks[8];
  const thumbTip = landmarks[4];
  const x = (1 - indexTip.x) * window.innerWidth;
  const y = indexTip.y * window.innerHeight;
  const pinchDistance = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);
  const pinching = pinchDistance < 0.055;
  drawFingerCursor(x, y, pinching);
  const currentOrb = orbAtPoint(x, y);
  if (hoveredOrb !== currentOrb) {
    hoveredOrb?.classList.remove("hand-hover");
    currentOrb?.classList.add("hand-hover");
    hoveredOrb = currentOrb;
  }
  const now = Date.now();
  if (pinching && currentOrb && gameRunning && now - lastPinchAt > 1100) {
    lastPinchAt = now;
    currentOrb.click();
  }
}

async function enableCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    messageText.textContent = "เบราว์เซอร์นี้ไม่รองรับกล้อง";
    return;
  }
  try {
    if (!cameraStream) {
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video:{facingMode:{ideal:"user"},width:{ideal:1280},height:{ideal:720}},audio:false
      });
      camera.srcObject = cameraStream;
    }
    cameraFallback.hidden = true;
    cameraButton.textContent = "✅ กล้องพร้อม";
    await camera.play();
    if (!mediaPipeCamera) startHandTracking();
  } catch (error) {
    cameraFallback.hidden = false;
    handStatus.textContent = "🖐️ มือ: เปิดกล้องไม่สำเร็จ";
    messageText.textContent = "กรุณาอนุญาตกล้อง หรือเล่นด้วยการแตะและคำสั่งเสียง";
  }
}

function startHandTracking() {
  if (!window.Hands || !window.Camera) {
    handStatus.textContent = "🖐️ มือ: โหลดระบบไม่สำเร็จ";
    return;
  }
  const hands = new Hands({ locateFile:(file)=>`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });
  hands.setOptions({maxNumHands:1,modelComplexity:1,minDetectionConfidence:0.65,minTrackingConfidence:0.60});
  hands.onResults(processHandResults);
  mediaPipeCamera = new Camera(camera,{onFrame:async()=>{await hands.send({image:camera});},width:1280,height:720});
  mediaPipeCamera.start();
}

function randomPosition(index) {
  const mobile = window.innerWidth < 680;
  const positions = mobile ? [[5,8],[56,4],[12,58],[60,56]] : [[7,9],[69,5],[17,61],[73,60]];
  return positions[index % positions.length];
}

function renderChoices(question) {
  answerZone.replaceChildren();
  question.choices.forEach((choice,index)=>{
    const button = document.createElement("button");
    const [left,top] = randomPosition(index);
    button.type = "button";
    button.className = "answer-orb";
    button.textContent = choice;
    button.style.left = `${left}%`;
    button.style.top = `${top}%`;
    button.style.animationDelay = `${index * 0.35}s`;
    button.addEventListener("click",()=>selectAnswer(button,Number(choice)));
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
  messageText.textContent = `คำถามไม่ซ้ำ • ทำไปแล้ว ${askedQuestionKeys.size} ข้อ • ชี้นิ้วไปที่คำตอบแล้วจีบนิ้ว`;
  renderChoices(activeQuestion);
  speak(`${activeQuestion.left} คูณ ${activeQuestion.right} เท่ากับเท่าไร`,0.68);
}

async function selectAnswer(button, selected) {
  if (!gameRunning || !activeQuestion) return;
  const isCorrect = selected === Number(activeQuestion.answer);
  answerZone.querySelectorAll("button").forEach((item)=>{item.disabled=true;});
  if (isCorrect) {
    streak += 1;
    score += 10 + Math.min(streak * 2,20);
    button?.classList.add("correct");
    messageText.textContent = "เก่งมาก! ตอบถูกแล้ว 🎉";
    speak("เก่งมาก ตอบถูกแล้ว",0.70);
  } else {
    streak = 0;
    score = Math.max(0,score - 3);
    button?.classList.add("wrong");
    messageText.textContent = `ยังไม่ถูก คำตอบที่ถูกคือ ${activeQuestion.answer}`;
    speak(`ยังไม่ถูกนะ คำตอบที่ถูกคือ ${activeQuestion.answer}`,0.68);
    answerZone.querySelectorAll("button").forEach((item)=>{
      if (Number(item.textContent) === Number(activeQuestion.answer)) item.classList.add("correct");
    });
  }
  scoreText.textContent = score;
  streakText.textContent = `${streak} 🔥`;
  window.setTimeout(()=>{if(gameRunning)nextQuestion();},1500);
}

function findOrbByValue(value) {
  return [...answerZone.querySelectorAll(".answer-orb")].find((orb)=>Number(orb.textContent)===Number(value));
}

const thaiDigitMap={"๐":"0","๑":"1","๒":"2","๓":"3","๔":"4","๕":"5","๖":"6","๗":"7","๘":"8","๙":"9"};
function normalizeThaiDigits(text){return[...text].map((char)=>thaiDigitMap[char]??char).join("");}

function parseThaiNumberWords(text) {
  const cleaned = normalizeThaiDigits(text).replace(/\s+/g,"").replace(/คำตอบ|ตอบว่า|เท่ากับ|คือ|ครับ|ค่ะ|คะ/g,"");
  const digitMatch = cleaned.match(/\d{1,3}/);
  if (digitMatch) return Number(digitMatch[0]);
  const units={ศูนย์:0,หนึ่ง:1,เอ็ด:1,สอง:2,ยี่:2,สาม:3,สี่:4,ห้า:5,หก:6,เจ็ด:7,แปด:8,เก้า:9};
  let total=0,matched=false,remaining=cleaned;
  const hundredMatch=remaining.match(/(หนึ่ง|สอง|สาม|สี่|ห้า|หก|เจ็ด|แปด|เก้า)ร้อย/);
  if(hundredMatch){total+=units[hundredMatch[1]]*100;remaining=remaining.replace(hundredMatch[0],"");matched=true;}
  const tenMatch=remaining.match(/(ยี่สิบ|สิบ|หนึ่งสิบ|สองสิบ|สามสิบ|สี่สิบ|ห้าสิบ|หกสิบ|เจ็ดสิบ|แปดสิบ|เก้าสิบ)/);
  if(tenMatch){const token=tenMatch[1];if(token==="สิบ"||token==="หนึ่งสิบ")total+=10;else if(token==="ยี่สิบ"||token==="สองสิบ")total+=20;else total+=(units[token.replace("สิบ","")]||0)*10;remaining=remaining.replace(token,"");matched=true;}
  for(const token of Object.keys(units).sort((a,b)=>b.length-a.length)){if(remaining.includes(token)){total+=units[token];matched=true;break;}}
  return matched?total:null;
}

function setupVoiceRecognition() {
  if (!SpeechRecognition) {
    voiceButton.disabled = true;
    voiceStatus.textContent = "🎤 เสียง: เบราว์เซอร์ไม่รองรับ";
    return;
  }
  recognition = new SpeechRecognition();
  recognition.lang = "th-TH";
  recognition.interimResults = false;
  recognition.maxAlternatives = 3;
  recognition.onstart=()=>{voiceButton.classList.add("listening");voiceButton.textContent="🎤 กำลังฟัง...";voiceStatus.textContent="🎤 เสียง: กำลังฟัง";};
  recognition.onend=()=>{voiceButton.classList.remove("listening");voiceButton.textContent="🎤 ตอบด้วยเสียง";voiceStatus.textContent="🎤 เสียง: พร้อม";};
  recognition.onerror=(event)=>{voiceStatus.textContent=`🎤 เสียง: ${event.error}`;messageText.textContent="ไม่ได้ยินคำตอบชัดเจน กรุณากดไมค์แล้วพูดใหม่";};
  recognition.onresult=(event)=>{
    const transcripts=[...event.results[0]].map((result)=>result.transcript);
    const parsedAnswers=transcripts.map(parseThaiNumberWords).filter((value)=>Number.isFinite(value));
    const selected=parsedAnswers[0];
    if(!Number.isFinite(selected)){messageText.textContent=`ได้ยินว่า “${transcripts[0]}” แต่ยังอ่านเป็นตัวเลขไม่ได้`;speak("กรุณาพูดคำตอบเป็นตัวเลขอีกครั้ง",0.68);return;}
    messageText.textContent=`ได้ยินคำตอบ ${selected}`;
    selectAnswer(findOrbByValue(selected),selected);
  };
}

function startVoiceAnswer() {
  if(!gameRunning){messageText.textContent="กรุณากดเริ่มเกมก่อน";return;}
  if(!recognition){messageText.textContent="เบราว์เซอร์นี้ไม่รองรับคำสั่งเสียง";return;}
  speechSynthesis?.cancel();
  try{recognition.start();}catch{}
}

function startGame() {
  score=0;streak=0;timeLeft=60;gameRunning=true;
  const maxNumber=Number(levelSelect.value);
  askedQuestionKeys=new Set();
  questionQueue=buildQuestionQueue(maxNumber);
  scoreText.textContent=score;
  streakText.textContent=`${streak} 🔥`;
  timeText.textContent=timeLeft;
  startButton.textContent="เริ่มใหม่";
  levelSelect.disabled=true;
  if(resultDialog.open)resultDialog.close();
  clearInterval(timerId);
  timerId=setInterval(()=>{timeLeft-=1;timeText.textContent=timeLeft;if(timeLeft<=0)endGame("หมดเวลา");},1000);
  nextQuestion();
}

function endGame(reason="หมดเวลา") {
  gameRunning=false;
  clearInterval(timerId);timerId=null;levelSelect.disabled=false;
  answerZone.replaceChildren();
  questionText.textContent=reason;
  messageText.textContent=`ตอบไป ${askedQuestionKeys.size} คำถามโดยไม่มีคำถามซ้ำ • กดเล่นอีกครั้งเพื่อเริ่มภารกิจใหม่`;
  startButton.textContent="เริ่มเกม";
  finalScoreText.textContent=score;
  speak(`${reason} คะแนนของคุณคือ ${score} คะแนน`,0.70);
  if(typeof resultDialog.showModal==="function"&&!resultDialog.open)resultDialog.showModal();
}

cameraButton.addEventListener("click",enableCamera);
startButton.addEventListener("click",startGame);
voiceButton.addEventListener("click",startVoiceAnswer);
playAgainButton.addEventListener("click",()=>{if(resultDialog.open)resultDialog.close();startGame();});
soundButton.addEventListener("click",()=>{soundEnabled=!soundEnabled;soundButton.textContent=soundEnabled?"🔊 เสียงเปิด":"🔇 เสียงปิด";soundButton.setAttribute("aria-pressed",String(soundEnabled));});
window.addEventListener("resize",resizeHandCanvas);
window.addEventListener("beforeunload",()=>{cameraStream?.getTracks().forEach((track)=>track.stop());});
resizeHandCanvas();
setupVoiceRecognition();
enableCamera();
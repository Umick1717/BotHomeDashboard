(() => {
'use strict';

const path = location.pathname.toLowerCase();
const isMath = path.includes('multiplication-game');
const isAnimal = path.includes('animal-game');
const isStory = path.includes('story-game');
const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;

const STOP_WORDS = new Set(['a','an','the','is','are','was','were','to','of','in','into','on','at','and','or','he','she','it','they','we','i']);
let voiceArmed = false;
let listening = false;
let recognition = null;
let restartTimer = null;
let readyTimer = null;
let lastSignature = '';
let answeredSignature = '';
let resultHandled = false;
let startAttempts = 0;

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[.,!?"'’]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(text) {
  return normalize(text).split(' ').filter(Boolean).filter(token => !STOP_WORDS.has(token));
}

function levenshtein(a, b) {
  a = normalize(a); b = normalize(b);
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const prev = Array.from({length: b.length + 1}, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let left = i;
    let diag = i - 1;
    for (let j = 1; j <= b.length; j++) {
      const up = prev[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const value = Math.min(up + 1, left + 1, diag + cost);
      diag = up;
      prev[j] = value;
      left = value;
    }
    prev[0] = i;
  }
  return prev[b.length];
}

function similarity(a, b) {
  a = normalize(a); b = normalize(b);
  const maxLen = Math.max(a.length, b.length, 1);
  return 1 - (levenshtein(a, b) / maxLen);
}

function answerScore(heardText, answerText, allAnswers = []) {
  const heard = normalize(heardText);
  const answer = normalize(answerText);
  if (!heard || !answer) return 0;
  if (heard === answer) return 1;
  if (heard.includes(answer) || answer.includes(heard)) return 0.96;

  const ht = tokens(heard);
  const at = tokens(answer);
  if (at.length) {
    const matched = at.filter(token => ht.some(h => h === token || similarity(h, token) >= 0.72));
    if (matched.length === at.length) return 0.94;
    if (matched.length / at.length >= 0.6) return 0.86;
  }

  // If the learner says one meaningful keyword and that keyword is unique among choices, accept it.
  for (const h of ht) {
    const own = at.some(a => a === h || similarity(a, h) >= 0.74);
    if (!own) continue;
    let otherMatches = 0;
    for (const other of allAnswers) {
      if (normalize(other) === answer) continue;
      if (tokens(other).some(t => t === h || similarity(t, h) >= 0.74)) otherMatches += 1;
    }
    if (otherMatches === 0) return 0.88;
  }

  return similarity(heard, answer);
}

function parseEnglishNumber(text) {
  const n = normalize(text);
  const direct = n.match(/\d{1,3}/);
  if (direct) return Number(direct[0]);
  const ones = {zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19};
  const tens = {twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90};
  const parts = n.replace(/-/g,' ').split(' ').filter(Boolean);
  let total = 0, current = 0, matched = false;
  for (const p of parts) {
    if (Object.prototype.hasOwnProperty.call(ones,p)) { current += ones[p]; matched = true; }
    else if (Object.prototype.hasOwnProperty.call(tens,p)) { current += tens[p]; matched = true; }
    else if (p === 'hundred') { current = Math.max(1,current) * 100; matched = true; }
  }
  total += current;
  return matched ? total : null;
}

function parseThaiNumber(text) {
  const mapDigits = {'๐':'0','๑':'1','๒':'2','๓':'3','๔':'4','๕':'5','๖':'6','๗':'7','๘':'8','๙':'9'};
  const converted = [...String(text || '')].map(c => mapDigits[c] ?? c).join('');
  const direct = converted.match(/\d{1,3}/);
  if (direct) return Number(direct[0]);
  const th = {'ศูนย์':0,'หนึ่ง':1,'เอ็ด':1,'สอง':2,'ยี่':2,'สาม':3,'สี่':4,'ห้า':5,'หก':6,'เจ็ด':7,'แปด':8,'เก้า':9};
  let s = converted.toLowerCase().replace(/\s+/g,'');
  let total = 0, matched = false;
  const hundred = s.match(/(หนึ่ง|สอง|สาม|สี่|ห้า|หก|เจ็ด|แปด|เก้า)ร้อย/);
  if (hundred) { total += th[hundred[1]] * 100; s = s.replace(hundred[0],''); matched = true; }
  const ten = s.match(/(ยี่สิบ|สิบ|หนึ่งสิบ|สองสิบ|สามสิบ|สี่สิบ|ห้าสิบ|หกสิบ|เจ็ดสิบ|แปดสิบ|เก้าสิบ)/);
  if (ten) {
    const x = ten[1];
    if (x === 'สิบ' || x === 'หนึ่งสิบ') total += 10;
    else if (x === 'ยี่สิบ' || x === 'สองสิบ') total += 20;
    else total += (th[x.replace('สิบ','')] || 0) * 10;
    s = s.replace(x,''); matched = true;
  }
  for (const key of Object.keys(th).sort((a,b) => b.length - a.length)) {
    if (s.includes(key)) { total += th[key]; matched = true; break; }
  }
  return matched ? total : null;
}

function parseNumber(text) {
  return parseEnglishNumber(text) ?? parseThaiNumber(text);
}

function ui() {
  return {
    button: document.getElementById('voiceButton'),
    status: document.getElementById('voiceStatus'),
    message: document.getElementById('message')
  };
}

function enabledAnswers() {
  return isMath
    ? [...document.querySelectorAll('.answer-orb:not(:disabled)')]
    : [...document.querySelectorAll('.answer:not(:disabled)')];
}

function questionSignature() {
  const answers = enabledAnswers().map(b => normalize(b.dataset.answer || b.textContent)).join('|');
  const question = isMath
    ? document.getElementById('question')?.textContent
    : isAnimal
      ? document.getElementById('animalPrompt')?.textContent + '|' + document.getElementById('animalPhoto')?.getAttribute('src')
      : document.getElementById('storyTitle')?.textContent + '|' + document.getElementById('storyProgress')?.textContent;
  return normalize(question) + '::' + answers;
}

function recognitionLang() {
  if (isMath) return document.body.dataset.questionLanguage === 'en' ? 'en-US' : 'th-TH';
  return 'en-US';
}

function stopRecognition() {
  clearTimeout(restartTimer);
  clearTimeout(readyTimer);
  try { recognition?.abort(); } catch (_) {}
  recognition = null;
  listening = false;
}

function speechBusy() {
  return !!(window.speechSynthesis && (speechSynthesis.speaking || speechSynthesis.pending));
}

function canListenNow() {
  return voiceArmed && enabledAnswers().length > 0 && !speechBusy() && document.visibilityState === 'visible';
}

function setVoiceButtonState(state) {
  const {button,status} = ui();
  if (!button) return;
  if (!voiceArmed) {
    button.textContent = isAnimal ? '🎤 พูดชื่อสัตว์' : '🎤 ตอบด้วยเสียง';
    button.classList.remove('voice-auto-on','listening');
    if (status) status.textContent = '🎤 เสียง: พร้อม';
    return;
  }
  button.classList.add('voice-auto-on');
  if (state === 'listening') {
    button.textContent = '🔴 กำลังฟังอัตโนมัติ';
    button.classList.add('listening');
    if (status) status.textContent = '🎤 Voice Auto: กำลังฟัง';
  } else {
    button.textContent = '🎤 Voice Auto: ON';
    button.classList.remove('listening');
    if (status) status.textContent = '🎤 Voice Auto: เปิดแล้ว';
  }
}

function applyTranscript(text) {
  const {status,message} = ui();
  if (status) status.textContent = `🎤 ได้ยิน: ${text}`;

  if (isMath) {
    const value = parseNumber(text);
    if (!Number.isFinite(value)) {
      if (message) message.textContent = `ได้ยิน “${text}” ลองพูดเฉพาะตัวเลขอีกครั้ง`;
      return false;
    }
    const target = enabledAnswers().find(b => Number(b.textContent) === value);
    if (target) { target.click(); return true; }
    if (message) message.textContent = `ได้ยิน ${value} แต่ไม่ตรงกับตัวเลือก ลองพูดใหม่ได้เลย`;
    return false;
  }

  const buttons = enabledAnswers();
  if (!buttons.length) return false;
  const answerTexts = buttons.map(b => b.dataset.answer || b.textContent);
  let best = null;
  for (const button of buttons) {
    const answer = button.dataset.answer || button.textContent;
    const score = answerScore(text, answer, answerTexts);
    if (!best || score > best.score) best = {button, answer, score};
  }

  // 0.66 intentionally tolerates imperfect accents while avoiding random selections.
  if (best && best.score >= 0.66) {
    if (message) message.textContent = `ได้ยิน “${text}” → ${best.answer}`;
    best.button.click();
    return true;
  }

  if (message) message.textContent = `ได้ยิน “${text}” แต่ยังไม่ชัด ลองพูดเฉพาะคำสำคัญอีกครั้ง`;
  return false;
}

function buildRecognition() {
  if (!Recognition) return null;
  const r = new Recognition();
  r.lang = recognitionLang();
  r.continuous = false;
  r.interimResults = false;
  r.maxAlternatives = 10;

  r.onstart = () => {
    listening = true;
    resultHandled = false;
    startAttempts = 0;
    setVoiceButtonState('listening');
  };

  r.onresult = event => {
    const alternatives = [...event.results[0]].map(x => x.transcript).filter(Boolean);
    for (const transcript of alternatives) {
      if (applyTranscript(transcript)) {
        resultHandled = true;
        answeredSignature = questionSignature();
        break;
      }
    }
    if (!resultHandled && alternatives[0]) applyTranscript(alternatives[0]);
  };

  r.onerror = event => {
    listening = false;
    const {status,message} = ui();
    const code = String(event.error || '');
    if (code === 'no-speech' || code === 'aborted') {
      if (status) status.textContent = '🎤 Voice Auto: รอฟังใหม่';
    } else {
      const msg = code === 'service-not-allowed'
        ? 'Safari ปฏิเสธ Speech Recognition แม้ Microphone จะ Allow'
        : code === 'not-allowed'
          ? 'Safari ยังไม่อนุญาตระบบรับเสียงของหน้าเว็บ'
          : `ระบบเสียง: ${code}`;
      if (status) status.textContent = `🎤 ${msg}`;
      if (message) message.textContent = msg;
    }
  };

  r.onend = () => {
    listening = false;
    recognition = null;
    setVoiceButtonState('armed');
    if (!voiceArmed) return;

    // If this same question is still unanswered, automatically listen again.
    const sig = questionSignature();
    if (enabledAnswers().length && sig !== answeredSignature) {
      restartTimer = setTimeout(() => scheduleListening(450), 450);
    }
  };
  return r;
}

function startListening() {
  if (!voiceArmed || listening || !canListenNow()) return;
  const sig = questionSignature();
  if (!sig || sig === answeredSignature) return;
  lastSignature = sig;
  recognition = buildRecognition();
  if (!recognition) {
    const {status,message} = ui();
    const msg = 'เบราว์เซอร์นี้ไม่มี Speech Recognition API';
    if (status) status.textContent = `🎤 ${msg}`;
    if (message) message.textContent = msg;
    return;
  }
  try {
    recognition.start();
  } catch (error) {
    listening = false;
    recognition = null;
    startAttempts += 1;
    if (startAttempts < 4) restartTimer = setTimeout(() => scheduleListening(500), 500);
  }
}

function scheduleListening(delay = 250) {
  clearTimeout(readyTimer);
  if (!voiceArmed) return;
  readyTimer = setTimeout(() => {
    if (!voiceArmed) return;
    if (!enabledAnswers().length) return;
    if (speechBusy()) {
      scheduleListening(300);
      return;
    }
    startListening();
  }, delay);
}

function onQuestionChanged() {
  if (!voiceArmed) return;
  const sig = questionSignature();
  if (!sig || !enabledAnswers().length) return;
  if (sig !== lastSignature) {
    answeredSignature = '';
    stopRecognition();
    lastSignature = sig;
    // Let TTS finish first; scheduleListening keeps polling speechSynthesis.
    scheduleListening(300);
  }
}

function armVoiceMode() {
  const {message} = ui();
  voiceArmed = true;
  answeredSignature = '';
  setVoiceButtonState('armed');
  if (message) message.textContent = '🎤 Voice Auto เปิดแล้ว • ข้อต่อไปไม่ต้องกดไมค์ซ้ำ';
  scheduleListening(120);
}

function bind() {
  const {button} = ui();
  if (!button || button.dataset.autoVoiceBound === '1') return;
  button.dataset.autoVoiceBound = '1';
  button.disabled = false;
  button.style.pointerEvents = 'auto';

  // One user tap enables voice mode for the rest of the game.
  button.addEventListener('click', event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!voiceArmed) armVoiceMode();
    else scheduleListening(50);
  }, true);

  const observer = new MutationObserver(onQuestionChanged);
  const targets = [
    document.getElementById('answerZone'),
    document.getElementById('answers'),
    document.getElementById('question'),
    document.getElementById('animalPrompt'),
    document.getElementById('storyTitle'),
    document.getElementById('storyProgress')
  ].filter(Boolean);
  targets.forEach(target => observer.observe(target, {childList:true,subtree:true,characterData:true,attributes:true}));

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') stopRecognition();
    else if (voiceArmed) scheduleListening(500);
  });

  window.addEventListener('beforeunload', stopRecognition);
  setVoiceButtonState('off');
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, {once:true});
else bind();

window.GameVoiceAuto = { armVoiceMode, scheduleListening, applyTranscript };
})();

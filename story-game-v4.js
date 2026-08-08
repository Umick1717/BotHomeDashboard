"use strict";

const stories = [
  {
    title: "The Kind Little Lion",
    emoji: "🦁",
    text: "Leo is a little lion. He lives near a green forest. One morning, Leo sees a small bird on the ground. The bird cannot fly. Leo gently carries the bird to a safe tree. The bird says, Thank you, Leo. Leo feels happy because kindness makes everyone stronger.",
    questions: [
      { q: "What animal is Leo?", choices: ["A lion", "A bird", "A rabbit", "A dog"], answer: "A lion" },
      { q: "Who cannot fly?", choices: ["The bird", "Leo", "A fish", "A tiger"], answer: "The bird" },
      { q: "Why does Leo feel happy?", choices: ["He was kind", "He found food", "He ran fast", "He slept"], answer: "He was kind" }
    ]
  },
  {
    title: "Mia and the Red Balloon",
    emoji: "🎈",
    text: "Mia has a bright red balloon. She takes it to the park. A strong wind blows, and the balloon flies into a tree. A tall giraffe named Gina reaches up and brings the balloon down. Mia smiles and says, Thank you, Gina. They play together until sunset.",
    questions: [
      { q: "What color is Mia's balloon?", choices: ["Red", "Blue", "Green", "Yellow"], answer: "Red" },
      { q: "Where does the balloon fly?", choices: ["Into a tree", "Into a house", "Into the sea", "Into a car"], answer: "Into a tree" },
      { q: "Who helps Mia?", choices: ["Gina the giraffe", "A lion", "A duck", "A monkey"], answer: "Gina the giraffe" }
    ]
  },
  {
    title: "Ben's Rainy Day",
    emoji: "🌧️",
    text: "Ben wakes up and sees rain outside. He puts on his yellow raincoat and blue boots. In the garden, he finds a tiny frog under a leaf. Ben makes a small shelter with a box. The frog stays dry, and Ben learns that rainy days can still be fun.",
    questions: [
      { q: "What color is Ben's raincoat?", choices: ["Yellow", "Blue", "Red", "Black"], answer: "Yellow" },
      { q: "What animal does Ben find?", choices: ["A frog", "A cat", "A bird", "A fish"], answer: "A frog" },
      { q: "What does Ben make?", choices: ["A shelter", "A boat", "A cake", "A kite"], answer: "A shelter" }
    ]
  }
];

const storySelect = document.getElementById("storySelect");
const storyTitle = document.getElementById("storyTitle");
const storyEmoji = document.getElementById("storyEmoji");
const storyText = document.getElementById("storyText");
const storyProgress = document.getElementById("storyProgress");
const message = document.getElementById("message");
const answers = document.getElementById("answers");
const startStory = document.getElementById("startStory");
const repeatButton = document.getElementById("repeatButton");
const scoreEl = document.getElementById("score");

let story = stories[0];
let questionIndex = -1;
let score = 0;
let transitionTimer = null;
let runToken = 0;

function normalize(text) {
  return String(text || "").toLowerCase().replace(/[.,!?"'’]/g, "").replace(/\s+/g, " ").trim();
}

stories.forEach((item, index) => {
  const option = document.createElement("option");
  option.value = String(index);
  option.textContent = item.title;
  storySelect.appendChild(option);
});

function speak(text, rate = 0.48, onEnd = null) {
  if (!("speechSynthesis" in window)) {
    if (onEnd) setTimeout(onEnd, 500);
    return;
  }
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = rate;
  utterance.pitch = 1;
  let completed = false;
  const finish = () => {
    if (completed) return;
    completed = true;
    onEnd?.();
  };
  utterance.onend = finish;
  utterance.onerror = finish;
  speechSynthesis.speak(utterance);
}

function countdownToQuestions(token) {
  if (token !== runToken) return;
  clearTimeout(transitionTimer);
  let seconds = 3;

  const tick = () => {
    if (token !== runToken) return;
    if (seconds <= 0) {
      nextQuestion(token);
      return;
    }
    storyProgress.textContent = `อ่านเรื่องจบแล้ว • เริ่มคำถามใน ${seconds} วินาที`;
    message.textContent = `เตรียมตัวตอบคำถาม... ${seconds}`;
    seconds -= 1;
    transitionTimer = setTimeout(tick, 1000);
  };
  tick();
}

function startCurrentStory() {
  runToken += 1;
  const token = runToken;
  clearTimeout(transitionTimer);
  speechSynthesis?.cancel();

  story = stories[Number(storySelect.value) || 0];
  questionIndex = -1;
  score = 0;
  scoreEl.textContent = "0";
  answers.replaceChildren();

  storyTitle.textContent = story.title;
  storyEmoji.textContent = story.emoji;
  storyText.textContent = story.text;
  storyProgress.textContent = "กำลังอ่านนิทาน";
  message.textContent = "ตั้งใจฟังนะ เมื่ออ่านจบ ระบบจะรอ 3 วินาทีแล้วเริ่มคำถาม";
  startStory.textContent = "🔄 เริ่มเรื่องใหม่";

  // Direct click starts speech on iOS Safari reliably.
  speak(story.text, 0.46, () => countdownToQuestions(token));
}

function nextQuestion(token = runToken) {
  if (token !== runToken) return;
  clearTimeout(transitionTimer);
  questionIndex += 1;

  if (questionIndex >= story.questions.length) {
    storyProgress.textContent = "จบนิทานและคำถามแล้ว";
    storyTitle.textContent = "Well done!";
    storyEmoji.textContent = "🏆";
    storyText.textContent = `You finished the story. Your score is ${score}.`;
    message.textContent = "เลือกนิทานเรื่องใหม่หรือกดเริ่มเรื่องใหม่";
    answers.replaceChildren();
    speak(`Well done. Your score is ${score}.`, 0.62);
    return;
  }

  const q = story.questions[questionIndex];
  storyProgress.textContent = `Question ${questionIndex + 1} of ${story.questions.length}`;
  storyTitle.textContent = q.q;
  storyEmoji.textContent = "❓";
  storyText.textContent = "Choose the best answer.";
  message.textContent = "แตะคำตอบ ใช้มือ AR หรือกดไมค์แล้วพูดคำตอบภาษาอังกฤษ";
  answers.replaceChildren();

  q.choices.forEach(choice => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer";
    button.textContent = choice;
    button.dataset.answer = choice;
    button.addEventListener("click", () => checkAnswer(button, choice, token));
    answers.appendChild(button);
  });

  speak(q.q, 0.46);
}

function checkAnswer(button, selected, token = runToken) {
  if (token !== runToken || questionIndex < 0 || questionIndex >= story.questions.length) return;
  const q = story.questions[questionIndex];
  answers.querySelectorAll(".answer").forEach(b => { b.disabled = true; });

  if (normalize(selected) === normalize(q.answer)) {
    score += 10;
    button?.classList.add("correct");
    message.textContent = `Correct! The answer is ${q.answer}.`;
    speak(`Correct. The answer is ${q.answer}.`, 0.50);
  } else {
    button?.classList.add("wrong");
    [...answers.querySelectorAll(".answer")].find(b => normalize(b.textContent) === normalize(q.answer))?.classList.add("correct");
    message.textContent = `Not quite. The correct answer is ${q.answer}.`;
    speak(`Not quite. The correct answer is ${q.answer}.`, 0.48);
  }

  scoreEl.textContent = String(score);
  setTimeout(() => nextQuestion(token), 2000);
}

function repeatCurrent() {
  if (questionIndex >= 0 && questionIndex < story.questions.length) {
    speak(story.questions[questionIndex].q, 0.46);
  } else {
    speak(story.text, 0.46);
  }
}

startStory.addEventListener("click", startCurrentStory);
repeatButton.addEventListener("click", repeatCurrent);
storySelect.addEventListener("change", () => {
  runToken += 1;
  clearTimeout(transitionTimer);
  speechSynthesis?.cancel();
  story = stories[Number(storySelect.value) || 0];
  questionIndex = -1;
  answers.replaceChildren();
  storyTitle.textContent = story.title;
  storyEmoji.textContent = story.emoji;
  storyText.textContent = story.text;
  storyProgress.textContent = "พร้อมเริ่มนิทาน";
  message.textContent = "กดเริ่มเล่าเพื่อเริ่มเกม";
});

console.log("English Story Time V5 ready");

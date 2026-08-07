"use strict";

const stories = [
  {
    title: "The Kind Little Lion",
    emoji: "🦁",
    text: "Leo is a little lion. He lives near a green forest. One morning, Leo sees a small bird on the ground. The bird cannot fly. Leo gently carries the bird to a safe tree. The bird says, Thank you, Leo. Leo feels happy because kindness makes everyone stronger.",
    questions: [
      {
        q: "What animal is Leo?",
        choices: ["A lion", "A bird", "A rabbit", "A dog"],
        answer: "A lion"
      },
      {
        q: "Who cannot fly?",
        choices: ["The bird", "Leo", "A fish", "A tiger"],
        answer: "The bird"
      },
      {
        q: "Why does Leo feel happy?",
        choices: ["He was kind", "He found food", "He ran fast", "He slept"],
        answer: "He was kind"
      }
    ]
  },
  {
    title: "Mia and the Red Balloon",
    emoji: "🎈",
    text: "Mia has a bright red balloon. She takes it to the park. A strong wind blows, and the balloon flies into a tree. A tall giraffe named Gina reaches up and brings the balloon down. Mia smiles and says, Thank you, Gina. They play together until sunset.",
    questions: [
      {
        q: "What color is Mia's balloon?",
        choices: ["Red", "Blue", "Green", "Yellow"],
        answer: "Red"
      },
      {
        q: "Where does the balloon fly?",
        choices: ["Into a tree", "Into a house", "Into the sea", "Into a car"],
        answer: "Into a tree"
      },
      {
        q: "Who helps Mia?",
        choices: ["Gina the giraffe", "A lion", "A duck", "A monkey"],
        answer: "Gina the giraffe"
      }
    ]
  },
  {
    title: "Ben's Rainy Day",
    emoji: "🌧️",
    text: "Ben wakes up and sees rain outside. He puts on his yellow raincoat and blue boots. In the garden, he finds a tiny frog under a leaf. Ben makes a small shelter with a box. The frog stays dry, and Ben learns that rainy days can still be fun.",
    questions: [
      {
        q: "What color is Ben's raincoat?",
        choices: ["Yellow", "Blue", "Red", "Black"],
        answer: "Yellow"
      },
      {
        q: "What animal does Ben find?",
        choices: ["A frog", "A cat", "A bird", "A fish"],
        answer: "A frog"
      },
      {
        q: "What does Ben make?",
        choices: ["A shelter", "A boat", "A cake", "A kite"],
        answer: "A shelter"
      }
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
const voiceButton = document.getElementById("voiceButton");
const scoreEl = document.getElementById("score");

let story = stories[0];
let questionIndex = -1;
let score = 0;
let recognition = null;

stories.forEach((item, index) => {
  const option = document.createElement("option");
  option.value = index;
  option.textContent = item.title;
  storySelect.appendChild(option);
});

function loadStory() {
  story = stories[Number(storySelect.value)];
  questionIndex = -1;
  storyTitle.textContent = story.title;
  storyEmoji.textContent = story.emoji;
  storyText.textContent = story.text;
  storyProgress.textContent = "กำลังเล่านิทาน";
  message.textContent = "ตั้งใจฟังนะ หลังจากนั้นจะมีคำถามภาษาอังกฤษ";
  answers.replaceChildren();

  speak(story.text, "en-US", .46);

  const readingTime = Math.max(14000, story.text.split(" ").length * 760);
  setTimeout(() => {
    if (questionIndex === -1) nextQuestion();
  }, readingTime);
}

function repeatCurrent() {
  if (questionIndex < 0) {
    speak(story.text, "en-US", .46);
  } else {
    speak(story.questions[questionIndex].q, "en-US", .46);
  }
}

function nextQuestion() {
  questionIndex += 1;

  if (questionIndex >= story.questions.length) {
    storyProgress.textContent = "จบนิทานและคำถามแล้ว";
    storyTitle.textContent = "Well done!";
    storyEmoji.textContent = "🏆";
    storyText.textContent = `You finished the story. Your score is ${score}.`;
    message.textContent = "เลือกนิทานเรื่องใหม่เพื่อเล่นต่อ";
    answers.replaceChildren();
    speak(`Well done. Your score is ${score}.`, "en-US", .62);
    questionIndex = -2;
    return;
  }

  const q = story.questions[questionIndex];
  storyProgress.textContent = `Question ${questionIndex + 1} of ${story.questions.length}`;
  storyTitle.textContent = q.q;
  storyEmoji.textContent = "❓";
  storyText.textContent = "Choose the best answer, or press the microphone and speak.";
  message.textContent = "เลือกด้วยนิ้ว จีบนิ้วเพื่อยืนยัน หรือพูดคำตอบ";

  answers.replaceChildren();
  q.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.className = "answer";
    btn.textContent = choice;
    btn.addEventListener("click", () => checkAnswer(btn, choice));
    answers.appendChild(btn);
  });

  speak(q.q.replace(/ /g, "... "), "en-US", .46);
}

function checkAnswer(button, answer) {
  if (questionIndex < 0) return;
  const q = story.questions[questionIndex];
  document.querySelectorAll(".answer").forEach(b => b.disabled = true);

  if (answer.toLowerCase() === q.answer.toLowerCase()) {
    score += 10;
    button?.classList.add("correct");
    message.textContent = "Correct! Great listening.";
    speak("Correct... Great... listening.", "en-US", .48);
  } else {
    button?.classList.add("wrong");
    message.textContent = `The correct answer is ${q.answer}.`;
    speak(`The... correct... answer... is... ${q.answer}.`, "en-US", .46);
    [...document.querySelectorAll(".answer")].find(
      b => b.textContent === q.answer
    )?.classList.add("correct");
  }

  scoreEl.textContent = score;
  setTimeout(nextQuestion, 1800);
}

function setupVoice() {
  if (!SpeechRecognition) {
    voiceButton.disabled = true;
    voiceStatus.textContent = "🎤 เสียง: เบราว์เซอร์ไม่รองรับ";
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 5;

  recognition.onstart = () => {
    voiceButton.classList.add("listening");
    voiceButton.textContent = "🎤 Listening...";
    voiceStatus.textContent = "🎤 เสียง: กำลังฟัง";
  };

  recognition.onend = () => {
    voiceButton.classList.remove("listening");
    voiceButton.textContent = "🎤 ตอบด้วยเสียง";
    voiceStatus.textContent = "🎤 เสียง: พร้อม";
  };

  recognition.onresult = (event) => {
    if (questionIndex < 0) return;
    const q = story.questions[questionIndex];
    const heard = [...event.results[0]].map(x => x.transcript.toLowerCase().trim());

    const matchedChoice = q.choices.find(choice =>
      heard.some(text => text.includes(choice.toLowerCase()) || choice.toLowerCase().includes(text))
    );

    if (!matchedChoice) {
      message.textContent = `I heard: "${heard[0]}". Please try again.`;
      speak("Please... try... again.", "en-US", .46);
      return;
    }

    const button = [...document.querySelectorAll(".answer")].find(
      b => b.textContent === matchedChoice
    );
    checkAnswer(button, matchedChoice);
  };
}

voiceButton.addEventListener("click", () => {
  if (questionIndex < 0) return;
  speechSynthesis?.cancel();
  try { recognition?.start(); } catch {}
});

startStory.addEventListener("click", loadStory);
repeatButton.addEventListener("click", repeatCurrent);
storySelect.addEventListener("change", () => {
  story = stories[Number(storySelect.value)];
  storyTitle.textContent = story.title;
  storyEmoji.textContent = story.emoji;
  storyText.textContent = story.text;
  answers.replaceChildren();
  questionIndex = -1;
});

setupVoice();

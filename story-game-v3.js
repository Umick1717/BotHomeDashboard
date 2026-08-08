"use strict";

const stories=[
{title:"The Kind Little Lion",emoji:"🦁",text:"Leo is a little lion. He lives near a green forest. One morning, Leo sees a small bird on the ground. The bird cannot fly. Leo gently carries the bird to a safe tree. The bird says, Thank you, Leo. Leo feels happy because kindness makes everyone stronger.",questions:[{q:"What animal is Leo?",choices:["A lion","A bird","A rabbit","A dog"],answer:"A lion"},{q:"Who cannot fly?",choices:["The bird","Leo","A fish","A tiger"],answer:"The bird"},{q:"Why does Leo feel happy?",choices:["He was kind","He found food","He ran fast","He slept"],answer:"He was kind"}]},
{title:"Mia and the Red Balloon",emoji:"🎈",text:"Mia has a bright red balloon. She takes it to the park. A strong wind blows, and the balloon flies into a tree. A tall giraffe named Gina reaches up and brings the balloon down. Mia smiles and says, Thank you, Gina. They play together until sunset.",questions:[{q:"What color is Mia's balloon?",choices:["Red","Blue","Green","Yellow"],answer:"Red"},{q:"Where does the balloon fly?",choices:["Into a tree","Into a house","Into the sea","Into a car"],answer:"Into a tree"},{q:"Who helps Mia?",choices:["Gina the giraffe","A lion","A duck","A monkey"],answer:"Gina the giraffe"}]},
{title:"Ben's Rainy Day",emoji:"🌧️",text:"Ben wakes up and sees rain outside. He puts on his yellow raincoat and blue boots. In the garden, he finds a tiny frog under a leaf. Ben makes a small shelter with a box. The frog stays dry, and Ben learns that rainy days can still be fun.",questions:[{q:"What color is Ben's raincoat?",choices:["Yellow","Blue","Red","Black"],answer:"Yellow"},{q:"What animal does Ben find?",choices:["A frog","A cat","A bird","A fish"],answer:"A frog"},{q:"What does Ben make?",choices:["A shelter","A boat","A cake","A kite"],answer:"A shelter"}]}
];

const storySelect=document.getElementById('storySelect');
const storyTitle=document.getElementById('storyTitle');
const storyEmoji=document.getElementById('storyEmoji');
const storyText=document.getElementById('storyText');
const storyProgress=document.getElementById('storyProgress');
const message=document.getElementById('message');
const answers=document.getElementById('answers');
const startStory=document.getElementById('startStory');
const repeatButton=document.getElementById('repeatButton');
const voiceButton=document.getElementById('voiceButton');
const voiceStatus=document.getElementById('voiceStatus');
const scoreEl=document.getElementById('score');

let story=stories[0];
let questionIndex=-1;
let score=0;
let recognition=null;
let transitionTimer=null;
let activeUtterance=null;

stories.forEach((item,index)=>{const option=document.createElement('option');option.value=index;option.textContent=item.title;storySelect.appendChild(option);});

function normalize(text){return String(text||'').toLowerCase().replace(/[.,!?"'’]/g,'').replace(/\s+/g,' ').trim();}

function speakText(text,rate=.46,onEnd=null){
  if(!('speechSynthesis' in window)){if(onEnd) setTimeout(onEnd,3000);return;}
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  activeUtterance=u;
  u.lang='en-US';u.rate=rate;u.pitch=1;
  if(onEnd) u.onend=onEnd;
  u.onerror=()=>{if(onEnd) setTimeout(onEnd,3000);};
  speechSynthesis.speak(u);
}

function scheduleQuestionsAfterStory(){
  clearTimeout(transitionTimer);
  storyProgress.textContent='อ่านเรื่องจบแล้ว • เริ่มคำถามใน 3 วินาที';
  message.textContent='เตรียมตัวตอบคำถาม...';
  let left=3;
  const tick=()=>{
    storyProgress.textContent=`อ่านเรื่องจบแล้ว • เริ่มคำถามใน ${left} วินาที`;
    if(left<=0){nextQuestion();return;}
    left-=1;
    transitionTimer=setTimeout(tick,1000);
  };
  tick();
}

function loadStory(){
  clearTimeout(transitionTimer);
  speechSynthesis?.cancel();
  story=stories[Number(storySelect.value)];
  questionIndex=-1;score=0;scoreEl.textContent='0';
  storyTitle.textContent=story.title;storyEmoji.textContent=story.emoji;storyText.textContent=story.text;
  storyProgress.textContent='กำลังเล่านิทาน';
  message.textContent='ตั้งใจฟังนะ หลังอ่านจบ ระบบจะรอ 3 วินาทีแล้วเริ่มคำถาม';
  answers.replaceChildren();
  speakText(story.text,.46,()=>setTimeout(scheduleQuestionsAfterStory,0));
}

function repeatCurrent(){
  clearTimeout(transitionTimer);
  if(questionIndex<0) speakText(story.text,.46,()=>scheduleQuestionsAfterStory());
  else speakText(story.questions[questionIndex].q,.46);
}

function nextQuestion(){
  clearTimeout(transitionTimer);
  questionIndex+=1;
  if(questionIndex>=story.questions.length){
    storyProgress.textContent='จบนิทานและคำถามแล้ว';storyTitle.textContent='Well done!';storyEmoji.textContent='🏆';
    storyText.textContent=`You finished the story. Your score is ${score}.`;message.textContent='เลือกนิทานเรื่องใหม่เพื่อเล่นต่อ';answers.replaceChildren();
    speakText(`Well done. Your score is ${score}.`,.62);questionIndex=-2;return;
  }
  const q=story.questions[questionIndex];
  storyProgress.textContent=`Question ${questionIndex+1} of ${story.questions.length}`;
  storyTitle.textContent=q.q;storyEmoji.textContent='❓';storyText.textContent='Choose the best answer, or press the microphone and speak.';
  message.textContent='แตะคำตอบ ใช้มือ AR หรือกดไมค์แล้วพูดคำตอบ';answers.replaceChildren();
  q.choices.forEach(choice=>{const b=document.createElement('button');b.type='button';b.className='answer';b.textContent=choice;b.dataset.answer=choice;b.addEventListener('click',()=>checkAnswer(b,choice));answers.appendChild(b);});
  speakText(q.q.replace(/ /g,'... '),.46);
}

function checkAnswer(button,answer){
  if(questionIndex<0)return;
  const q=story.questions[questionIndex];
  document.querySelectorAll('.answer').forEach(b=>b.disabled=true);
  if(normalize(answer)===normalize(q.answer)){
    score+=10;button?.classList.add('correct');message.textContent='Correct! Great listening.';speakText('Correct... Great... listening.',.48);
  }else{
    button?.classList.add('wrong');message.textContent=`The correct answer is ${q.answer}.`;speakText(`The correct answer is ${q.answer}.`,.46);
    [...document.querySelectorAll('.answer')].find(b=>b.textContent===q.answer)?.classList.add('correct');
  }
  scoreEl.textContent=score;setTimeout(nextQuestion,1800);
}

function setupVoice(){
  const Ctor=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!Ctor){voiceStatus.textContent='🎤 เบราว์เซอร์นี้ไม่รองรับ Speech Recognition';voiceButton.disabled=true;return;}
  recognition=new Ctor();recognition.lang='en-US';recognition.continuous=false;recognition.interimResults=false;recognition.maxAlternatives=5;
  recognition.onstart=()=>{voiceButton.classList.add('listening');voiceButton.textContent='🎤 Listening...';voiceStatus.textContent='🎤 เสียง: กำลังฟัง';};
  recognition.onend=()=>{voiceButton.classList.remove('listening');voiceButton.textContent='🎤 ตอบด้วยเสียง';if(!MobileVoiceFix?.isInAppBrowser)voiceStatus.textContent='🎤 เสียง: พร้อม';};
  recognition.onerror=e=>{const msg=MobileVoiceFix?.voiceErrorMessage(e.error)||`ไมโครโฟน: ${e.error}`;voiceStatus.textContent=`🎤 ${msg}`;message.textContent=msg;};
  recognition.onresult=e=>{
    if(questionIndex<0)return;
    const q=story.questions[questionIndex];const heard=[...e.results[0]].map(x=>normalize(x.transcript));
    const matched=q.choices.find(choice=>heard.some(t=>t.includes(normalize(choice))||normalize(choice).includes(t)));
    if(!matched){message.textContent=`I heard: “${heard[0]}”. Please try again.`;return;}
    const button=[...document.querySelectorAll('.answer:not(:disabled)')].find(b=>b.textContent===matched);checkAnswer(button,matched);
  };
}

voiceButton.addEventListener('click',async()=>{
  if(questionIndex<0){message.textContent='กรุณารอจนเข้าสู่โหมดคำถามก่อน';return;}
  if(MobileVoiceFix?.isInAppBrowser){const msg=MobileVoiceFix.voiceErrorMessage('service-not-allowed');voiceStatus.textContent=`🎤 เปิดด้วย ${MobileVoiceFix.preferredBrowser()}`;message.textContent=msg;return;}
  speechSynthesis?.cancel();
  try{voiceStatus.textContent='🎤 กำลังขอสิทธิ์ Microphone...';await MobileVoiceFix?.prepareMicrophone?.();recognition?.start();}
  catch(err){const msg=MobileVoiceFix?.voiceErrorMessage(err.code||err.name)||err.message;voiceStatus.textContent=`🎤 ${msg}`;message.textContent=msg;}
});

startStory.addEventListener('click',loadStory);
repeatButton.addEventListener('click',repeatCurrent);
storySelect.addEventListener('change',()=>{clearTimeout(transitionTimer);speechSynthesis?.cancel();story=stories[Number(storySelect.value)];storyTitle.textContent=story.title;storyEmoji.textContent=story.emoji;storyText.textContent=story.text;answers.replaceChildren();questionIndex=-1;});

document.body.classList.add('game-story');
MobileVoiceFix?.decorateVoiceUi?.(voiceButton,voiceStatus,message);
setupVoice();

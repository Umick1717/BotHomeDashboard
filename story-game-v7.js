(() => {
'use strict';

const stories=[
{title:'The Kind Little Lion',emoji:'🦁',text:'Leo is a little lion. He lives near a green forest. One morning, Leo sees a small bird on the ground. The bird cannot fly. Leo gently carries the bird to a safe tree. The bird says, Thank you, Leo. Leo feels happy because kindness makes everyone stronger.',questions:[{q:'What animal is Leo?',choices:['A lion','A bird','A rabbit','A dog'],answer:'A lion'},{q:'Who cannot fly?',choices:['The bird','Leo','A fish','A tiger'],answer:'The bird'},{q:'Why does Leo feel happy?',choices:['He was kind','He found food','He ran fast','He slept'],answer:'He was kind'}]},
{title:'Mia and the Red Balloon',emoji:'🎈',text:'Mia has a bright red balloon. She takes it to the park. A strong wind blows, and the balloon flies into a tree. A tall giraffe named Gina reaches up and brings the balloon down. Mia smiles and says, Thank you, Gina. They play together until sunset.',questions:[{q:"What color is Mia's balloon?",choices:['Red','Blue','Green','Yellow'],answer:'Red'},{q:'Where does the balloon fly?',choices:['Into a tree','Into a house','Into the sea','Into a car'],answer:'Into a tree'},{q:'Who helps Mia?',choices:['Gina the giraffe','A lion','A duck','A monkey'],answer:'Gina the giraffe'}]},
{title:"Ben's Rainy Day",emoji:'🌧️',text:'Ben wakes up and sees rain outside. He puts on his yellow raincoat and blue boots. In the garden, he finds a tiny frog under a leaf. Ben makes a small shelter with a box. The frog stays dry, and Ben learns that rainy days can still be fun.',questions:[{q:"What color is Ben's raincoat?",choices:['Yellow','Blue','Red','Black'],answer:'Yellow'},{q:'What animal does Ben find?',choices:['A frog','A cat','A bird','A fish'],answer:'A frog'},{q:'What does Ben make?',choices:['A shelter','A boat','A cake','A kite'],answer:'A shelter'}]}
];

const $=id=>document.getElementById(id);
const storySelect=$('storySelect');
const storyTitle=$('storyTitle');
const storyEmoji=$('storyEmoji');
const storyText=$('storyText');
const storyProgress=$('storyProgress');
const message=$('message');
const answers=$('answers');
const startStory=$('startStory');
const repeatButton=$('repeatButton');
const scoreEl=$('score');

let story=stories[0];
let questionIndex=-1;
let score=0;
let token=0;
let transitionTimer=null;
let answerTimer=null;

function normalize(text){return String(text||'').toLowerCase().replace(/[.,!?"'’]/g,'').replace(/\s+/g,' ').trim();}
function stopTimers(){clearTimeout(transitionTimer);clearTimeout(answerTimer);}
function speak(text,rate=.48,onEnd=null){
  if(!('speechSynthesis'in window)){if(onEnd)setTimeout(onEnd,100);return;}
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  u.lang='en-US';u.rate=rate;u.pitch=1;
  let done=false;
  const finish=()=>{if(done)return;done=true;onEnd?.();};
  u.onend=finish;u.onerror=finish;
  speechSynthesis.speak(u);
}
function populate(){
  storySelect.replaceChildren();
  stories.forEach((s,i)=>{const o=document.createElement('option');o.value=String(i);o.textContent=s.title;storySelect.appendChild(o);});
}
function preview(){
  story=stories[Number(storySelect.value)||0];
  storyTitle.textContent=story.title;storyEmoji.textContent=story.emoji;storyText.textContent=story.text;
  storyProgress.textContent='พร้อมเริ่มนิทาน';message.textContent='กด ▶️ เริ่มเล่า เพื่อเริ่มเกม';answers.replaceChildren();questionIndex=-1;
}
function countdown(runToken){
  let seconds=3;
  const tick=()=>{
    if(runToken!==token)return;
    if(seconds<=0){showQuestion(runToken);return;}
    storyProgress.textContent=`อ่านเรื่องจบแล้ว • เริ่มคำถามใน ${seconds} วินาที`;
    message.textContent=`เตรียมตัวตอบคำถาม... ${seconds}`;
    seconds-=1;transitionTimer=setTimeout(tick,1000);
  };
  tick();
}
function startGame(){
  token+=1;const runToken=token;stopTimers();speechSynthesis?.cancel();
  story=stories[Number(storySelect.value)||0];questionIndex=-1;score=0;scoreEl.textContent='0';answers.replaceChildren();
  storyTitle.textContent=story.title;storyEmoji.textContent=story.emoji;storyText.textContent=story.text;
  storyProgress.textContent='กำลังอ่านนิทาน';message.textContent='ตั้งใจฟังนะ เมื่ออ่านจบ ระบบจะรอ 3 วินาทีแล้วเริ่มคำถาม';
  startStory.textContent='🔄 เริ่มเรื่องใหม่';
  speak(story.text,.46,()=>countdown(runToken));
}
function showQuestion(runToken=token){
  if(runToken!==token)return;
  questionIndex+=1;
  if(questionIndex>=story.questions.length){
    storyProgress.textContent='จบนิทานและคำถามแล้ว';storyTitle.textContent='Well done!';storyEmoji.textContent='🏆';storyText.textContent=`You finished the story. Your score is ${score}.`;message.textContent='เลือกนิทานเรื่องใหม่ หรือกดเริ่มเรื่องใหม่';answers.replaceChildren();speak(`Well done. Your score is ${score}.`,.62);return;
  }
  const q=story.questions[questionIndex];
  storyProgress.textContent=`Question ${questionIndex+1} of ${story.questions.length}`;storyTitle.textContent=q.q;storyEmoji.textContent='❓';storyText.textContent='Choose the best answer.';message.textContent='แตะคำตอบ ใช้มือ AR หรือกดไมค์แล้วพูดคำตอบภาษาอังกฤษ';answers.replaceChildren();
  q.choices.forEach(choice=>{const b=document.createElement('button');b.type='button';b.className='answer';b.textContent=choice;b.dataset.answer=choice;b.addEventListener('click',()=>checkAnswer(b,choice,runToken));answers.appendChild(b);});
  speak(q.q,.46);
}
function checkAnswer(button,choice,runToken){
  if(runToken!==token||questionIndex<0||questionIndex>=story.questions.length)return;
  const q=story.questions[questionIndex];answers.querySelectorAll('.answer').forEach(b=>b.disabled=true);
  if(normalize(choice)===normalize(q.answer)){score+=10;button.classList.add('correct');message.textContent=`Correct! The answer is ${q.answer}.`;speak(`Correct. The answer is ${q.answer}.`,.5);}else{button.classList.add('wrong');[...answers.querySelectorAll('.answer')].find(b=>normalize(b.textContent)===normalize(q.answer))?.classList.add('correct');message.textContent=`Not quite. The correct answer is ${q.answer}.`;speak(`Not quite. The correct answer is ${q.answer}.`,.48);}
  scoreEl.textContent=String(score);answerTimer=setTimeout(()=>showQuestion(runToken),2000);
}
function repeat(){if(questionIndex>=0&&questionIndex<story.questions.length)speak(story.questions[questionIndex].q,.46);else speak(story.text,.46);}

populate();preview();
startStory.addEventListener('click',startGame);
repeatButton.addEventListener('click',repeat);
storySelect.addEventListener('change',()=>{token+=1;stopTimers();speechSynthesis?.cancel();preview();});
console.log('English Story Time V7 standalone ready');
})();

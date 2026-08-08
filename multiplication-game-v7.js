"use strict";

const camera=document.getElementById('camera');
const handCanvas=document.getElementById('handCanvas');
const handContext=handCanvas.getContext('2d');
const cameraFallback=document.getElementById('cameraFallback');
const cameraButton=document.getElementById('cameraButton');
const startButton=document.getElementById('startButton');
const playAgainButton=document.getElementById('playAgainButton');
const soundButton=document.getElementById('soundButton');
const levelSelect=document.getElementById('level');
const languageSelect=document.getElementById('questionLanguage');
const questionText=document.getElementById('question');
const messageText=document.getElementById('message');
const answerZone=document.getElementById('answerZone');
const scoreText=document.getElementById('score');
const streakText=document.getElementById('streak');
const timeText=document.getElementById('time');
const finalScoreText=document.getElementById('finalScore');
const resultDialog=document.getElementById('resultDialog');
const handStatus=document.getElementById('handStatus');

let score=0,streak=0,timeLeft=60,timerId=null,activeQuestion=null,gameRunning=false,soundEnabled=true;
let cameraStream=null,mediaPipeCamera=null,handsInstance=null,lastPinchAt=0,hoveredOrb=null;
let questionQueue=[],askedQuestionKeys=new Set(),smoothX=null,smoothY=null,pinchActive=false;

function shuffle(items){const list=[...items];for(let i=list.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[list[i],list[j]]=[list[j],list[i]];}return list;}
function key(a,b){return `${a}x${b}`;}
function makeChoices(answer){const s=new Set([answer]);let guard=0;while(s.size<4&&guard++<200){s.add(Math.max(0,answer+Math.floor(Math.random()*25)-12));}let x=1;while(s.size<4)s.add(answer+x++);return shuffle([...s]);}
function makeQuestion(left,right){const answer=left*right;return{left,right,answer,question:`${left} × ${right} = ?`,choices:makeChoices(answer)};}
function buildQueue(max){const q=[];for(let a=1;a<=max;a++)for(let b=1;b<=max;b++)q.push(makeQuestion(a,b));return shuffle(q);}
function getQuestion(){while(questionQueue.length){const q=questionQueue.shift();const k=key(q.left,q.right);if(!askedQuestionKeys.has(k)){askedQuestionKeys.add(k);return q;}}return null;}

function currentLanguage(){return languageSelect.value==='en'?'en':'th';}
function speak(text,lang,rate=.68){if(!soundEnabled||!('speechSynthesis'in window))return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang=lang;u.rate=rate;u.pitch=1;speechSynthesis.speak(u);}
function speakQuestion(){if(!activeQuestion)return;if(currentLanguage()==='en')speak(`${activeQuestion.left} times ${activeQuestion.right}. What is the answer?`,'en-US',.66);else speak(`${activeQuestion.left} คูณ ${activeQuestion.right} เท่ากับเท่าไร`,'th-TH',.68);}
function speakFeedback(correct){if(!activeQuestion)return;if(currentLanguage()==='en')speak(correct?'Correct. Great job.':`Not quite. The correct answer is ${activeQuestion.answer}.`,'en-US',.68);else speak(correct?'เก่งมาก ตอบถูกแล้ว':`ยังไม่ถูก คำตอบที่ถูกคือ ${activeQuestion.answer}`,'th-TH',.68);}

function renderChoices(q){answerZone.replaceChildren();q.choices.forEach(choice=>{const b=document.createElement('button');b.type='button';b.className='answer-orb';b.textContent=choice;b.addEventListener('click',()=>selectAnswer(b,Number(choice)));answerZone.appendChild(b);});}
function nextQuestion(){if(!gameRunning)return;activeQuestion=getQuestion();if(!activeQuestion){endGame(currentLanguage()==='en'?'All questions completed':'ทำครบทุกคำถามแล้ว');return;}questionText.textContent=activeQuestion.question;messageText.textContent=currentLanguage()==='en'?`No repeated questions • Completed ${askedQuestionKeys.size}`:`คำถามไม่ซ้ำ • ทำไปแล้ว ${askedQuestionKeys.size} ข้อ`;renderChoices(activeQuestion);speakQuestion();}
function selectAnswer(button,value){if(!gameRunning||!activeQuestion)return;answerZone.querySelectorAll('button').forEach(x=>x.disabled=true);const correct=value===activeQuestion.answer;if(correct){streak++;score+=10+Math.min(streak*2,20);button?.classList.add('correct');messageText.textContent=currentLanguage()==='en'?'Correct! Great job 🎉':'เก่งมาก! ตอบถูกแล้ว 🎉';}else{streak=0;score=Math.max(0,score-3);button?.classList.add('wrong');messageText.textContent=currentLanguage()==='en'?`Not quite. The correct answer is ${activeQuestion.answer}`:`ยังไม่ถูก คำตอบที่ถูกคือ ${activeQuestion.answer}`;[...answerZone.querySelectorAll('button')].find(x=>Number(x.textContent)===activeQuestion.answer)?.classList.add('correct');}scoreText.textContent=score;streakText.textContent=`${streak} 🔥`;speakFeedback(correct);setTimeout(()=>{if(gameRunning)nextQuestion();},1500);}

function startGame(){score=0;streak=0;timeLeft=60;gameRunning=true;activeQuestion=null;askedQuestionKeys=new Set();questionQueue=buildQueue(Number(levelSelect.value));scoreText.textContent='0';streakText.textContent='0 🔥';timeText.textContent='60';startButton.textContent=currentLanguage()==='en'?'Restart':'เริ่มใหม่';if(resultDialog.open)resultDialog.close();clearInterval(timerId);timerId=setInterval(()=>{timeLeft--;timeText.textContent=timeLeft;if(timeLeft<=0)endGame(currentLanguage()==='en'?'Time is up':'หมดเวลา');},1000);nextQuestion();}
function endGame(reason){gameRunning=false;clearInterval(timerId);timerId=null;answerZone.replaceChildren();questionText.textContent=reason;messageText.textContent=currentLanguage()==='en'?'Press play again to start a new mission':'กดเล่นอีกครั้งเพื่อเริ่มภารกิจใหม่';finalScoreText.textContent=score;startButton.textContent=currentLanguage()==='en'?'Start game':'เริ่มเกม';if(typeof resultDialog.showModal==='function'&&!resultDialog.open)resultDialog.showModal();}

function resizeCanvas(){const dpr=Math.min(window.devicePixelRatio||1,2),w=window.innerWidth,h=window.innerHeight;handCanvas.width=Math.round(w*dpr);handCanvas.height=Math.round(h*dpr);handCanvas.style.width=`${w}px`;handCanvas.style.height=`${h}px`;handContext.setTransform(dpr,0,0,dpr,0,0);}
function clearCursor(){handContext.clearRect(0,0,window.innerWidth,window.innerHeight);hoveredOrb?.classList.remove('hand-hover');hoveredOrb=null;}
function answerAt(x,y){const margin=14;return [...answerZone.querySelectorAll('.answer-orb:not(:disabled)')].find(el=>{const r=el.getBoundingClientRect();return x>=r.left-margin&&x<=r.right+margin&&y>=r.top-margin&&y<=r.bottom+margin;})||null;}
function drawCursor(x,y,pinch){handContext.clearRect(0,0,window.innerWidth,window.innerHeight);handContext.beginPath();handContext.arc(x,y,pinch?24:17,0,Math.PI*2);handContext.fillStyle=pinch?'rgba(250,204,21,.92)':'rgba(45,212,191,.85)';handContext.fill();handContext.lineWidth=4;handContext.strokeStyle='white';handContext.stroke();}
function onHands(results){const lm=results.multiHandLandmarks?.[0];if(!lm){handStatus.textContent='🖐️ มือ: ยังไม่พบ';smoothX=smoothY=null;pinchActive=false;clearCursor();return;}handStatus.textContent='🖐️ มือ: ตรวจพบ';const index=lm[8],thumb=lm[4];const rawX=(1-index.x)*window.innerWidth,rawY=index.y*window.innerHeight,alpha=.38;smoothX=smoothX==null?rawX:smoothX+(rawX-smoothX)*alpha;smoothY=smoothY==null?rawY:smoothY+(rawY-smoothY)*alpha;const d=Math.hypot(index.x-thumb.x,index.y-thumb.y);if(!pinchActive&&d<.05)pinchActive=true;if(pinchActive&&d>.075)pinchActive=false;drawCursor(smoothX,smoothY,pinchActive);const target=answerAt(smoothX,smoothY);if(target!==hoveredOrb){hoveredOrb?.classList.remove('hand-hover');target?.classList.add('hand-hover');hoveredOrb=target;}const now=Date.now();if(pinchActive&&target&&gameRunning&&now-lastPinchAt>900){lastPinchAt=now;target.click();}}
async function enableCamera(){if(cameraStream){cameraButton.textContent='✅ กล้องพร้อม';return;}cameraButton.disabled=true;try{cameraStream=await MobileGameCompat.requestCamera(camera,'user');cameraFallback.hidden=true;cameraButton.textContent='✅ กล้องพร้อม';if(window.Hands&&window.Camera&&!mediaPipeCamera){handsInstance=new Hands({locateFile:file=>`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`});handsInstance.setOptions({maxNumHands:1,modelComplexity:1,minDetectionConfidence:.62,minTrackingConfidence:.58});handsInstance.onResults(onHands);mediaPipeCamera=new Camera(camera,{onFrame:async()=>{if(document.visibilityState==='visible')await handsInstance.send({image:camera});},width:1280,height:720});await mediaPipeCamera.start();}handStatus.textContent='🖐️ มือ: พร้อม';}catch(error){cameraFallback.hidden=false;cameraButton.textContent='📷 ลองเปิดกล้องอีกครั้ง';handStatus.textContent=`🖐️ ${MobileGameCompat.mediaErrorMessage(error,'camera')}`;}finally{cameraButton.disabled=false;}}

languageSelect.disabled=false;languageSelect.style.pointerEvents='auto';
languageSelect.addEventListener('change',()=>{messageText.textContent=currentLanguage()==='en'?'English question mode selected.':'เลือกโหมดคำถามภาษาไทยแล้ว';startButton.textContent=gameRunning?(currentLanguage()==='en'?'Restart':'เริ่มใหม่'):(currentLanguage()==='en'?'Start game':'เริ่มเกม');if(activeQuestion)speakQuestion();});
startButton.addEventListener('click',startGame);cameraButton.addEventListener('click',enableCamera);playAgainButton.addEventListener('click',()=>{if(resultDialog.open)resultDialog.close();startGame();});soundButton.addEventListener('click',()=>{soundEnabled=!soundEnabled;soundButton.textContent=soundEnabled?'🔊 เสียงเปิด':'🔇 เสียงปิด';});
MobileGameCompat?.watchViewport(()=>resizeCanvas());window.addEventListener('resize',resizeCanvas,{passive:true});window.addEventListener('beforeunload',()=>MobileGameCompat?.stopStream(cameraStream));resizeCanvas();
console.log('AR Multiplication V7 clean bilingual ready');

(() => {
'use strict';

const SENTENCES = [{"level": "easy", "th": "ฉันเป็นนักเรียน", "en": "I am a student"}, {"level": "easy", "th": "ฉันรักครอบครัวของฉัน", "en": "I love my family"}, {"level": "easy", "th": "นี่คือแมวของฉัน", "en": "This is my cat"}, {"level": "easy", "th": "ฉันชอบกินแอปเปิล", "en": "I like to eat apples"}, {"level": "easy", "th": "เขาเป็นเพื่อนของฉัน", "en": "He is my friend"}, {"level": "easy", "th": "เธอมีสุนัขหนึ่งตัว", "en": "She has a dog"}, {"level": "easy", "th": "พวกเราไปโรงเรียนทุกวัน", "en": "We go to school every day"}, {"level": "easy", "th": "วันนี้อากาศดี", "en": "The weather is nice today"}, {"level": "easy", "th": "ฉันสามารถว่ายน้ำได้", "en": "I can swim"}, {"level": "easy", "th": "กรุณาเปิดประตู", "en": "Please open the door"}, {"level": "easy", "th": "ลูกบอลอยู่ใต้โต๊ะ", "en": "The ball is under the table"}, {"level": "easy", "th": "ฉันมีหนังสือสองเล่ม", "en": "I have two books"}, {"level": "medium", "th": "ฉันกำลังทำการบ้านอยู่ตอนนี้", "en": "I am doing my homework now"}, {"level": "medium", "th": "แม่ของฉันกำลังทำอาหารในครัว", "en": "My mother is cooking in the kitchen"}, {"level": "medium", "th": "พวกเราเล่นฟุตบอลหลังเลิกเรียน", "en": "We play football after school"}, {"level": "medium", "th": "ฉันตื่นนอนตอนเจ็ดโมงทุกเช้า", "en": "I wake up at seven every morning"}, {"level": "medium", "th": "น้องสาวของฉันชอบวาดรูป", "en": "My sister likes to draw pictures"}, {"level": "medium", "th": "ฉันต้องการน้ำหนึ่งแก้ว", "en": "I would like a glass of water"}, {"level": "medium", "th": "คุณช่วยฉันได้ไหม", "en": "Can you help me please"}, {"level": "medium", "th": "พวกเขากำลังดูหนังด้วยกัน", "en": "They are watching a movie together"}, {"level": "medium", "th": "พ่อของฉันขับรถไปทำงาน", "en": "My father drives to work"}, {"level": "medium", "th": "ฉันอ่านหนังสือก่อนเข้านอน", "en": "I read a book before bedtime"}, {"level": "medium", "th": "เราไปสวนสัตว์เมื่อวันอาทิตย์", "en": "We went to the zoo on Sunday"}, {"level": "medium", "th": "เธอกำลังเรียนภาษาอังกฤษที่โรงเรียน", "en": "She is learning English at school"}, {"level": "hard", "th": "ฉันอยากเป็นนักวิทยาศาสตร์เมื่อฉันโตขึ้น", "en": "I want to be a scientist when I grow up"}, {"level": "hard", "th": "ถ้าฝนตกพวกเราจะอยู่ที่บ้าน", "en": "If it rains we will stay at home"}, {"level": "hard", "th": "ฉันทำการบ้านเสร็จก่อนที่จะเล่นเกม", "en": "I finished my homework before I played games"}, {"level": "hard", "th": "เด็ก ๆ กำลังเตรียมตัวสำหรับการแสดงของโรงเรียน", "en": "The children are preparing for the school show"}, {"level": "hard", "th": "ฉันรู้สึกมีความสุขเพราะวันนี้เป็นวันเกิดของฉัน", "en": "I feel happy because today is my birthday"}, {"level": "hard", "th": "เราควรช่วยกันรักษาโลกให้สะอาด", "en": "We should help keep our planet clean"}, {"level": "hard", "th": "ฉันไม่เคยเห็นสัตว์ตัวนั้นมาก่อน", "en": "I have never seen that animal before"}, {"level": "hard", "th": "หลังจากทานอาหารเย็นฉันช่วยแม่ล้างจาน", "en": "After dinner I help my mother wash the dishes"}, {"level": "hard", "th": "พวกเราจะไปเที่ยวทะเลในวันหยุดหน้า", "en": "We are going to visit the beach next holiday"}, {"level": "hard", "th": "แม้ว่าฉันจะเหนื่อยแต่ฉันก็ทำงานให้เสร็จ", "en": "Although I was tired I finished my work"}, {"level": "hard", "th": "คุณครูขอให้นักเรียนเปิดหนังสือหน้าเลขสิบ", "en": "The teacher asked the students to open page ten"}, {"level": "hard", "th": "ฉันกำลังฝึกภาษาอังกฤษเพื่อพูดได้อย่างมั่นใจ", "en": "I am practicing English so I can speak confidently"}];
const TOTAL = 10;
const POINTS = 10;
const NEXT_DELAY = 1800;
const SPEECH_RATE = 0.55;

const $ = id => document.getElementById(id);
const scoreEl=$('score'), levelEl=$('level'), timeLimitEl=$('timeLimit'),
startBtn=$('startBtn'), cameraBtn=$('cameraBtn'), questionLabel=$('questionLabel'),
timerBox=$('timerBox'), timerEl=$('timer'), thaiPrompt=$('thaiPrompt'),
hintText=$('hintText'), answerZone=$('answerZone'), wordBank=$('wordBank'),
feedback=$('feedback'), listenBtn=$('listenBtn'), speakBtn=$('speakBtn'),
hintBtn=$('hintBtn'), undoBtn=$('undoBtn'), clearBtn=$('clearBtn'),
checkBtn=$('checkBtn'), resultDialog=$('resultDialog'), finalScore=$('finalScore'),
playAgainBtn=$('playAgainBtn'), camera=$('camera'), handCanvas=$('handCanvas'),
handStatus=$('handStatus');

const handCtx = handCanvas.getContext('2d');
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

let queue=[], current=null, index=0, score=0, timerId=null, seconds=0, locked=false;
let recognition=null, cameraStream=null, mediaPipeCamera=null, handsInstance=null;
let smoothX=null, smoothY=null, pinchActive=false, grabbedChip=null, grabbedOrigin=null;
let hoveredChip=null, activeDropZone=null, pinchCloseFrames=0, pinchOpenFrames=0;
let touchDrag=null;

function shuffle(list) {
  const a=[...list];
  for(let i=a.length-1;i>0;i--) {
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

function norm(t) {
  return t.toLowerCase().replace(/[.,!?"'’]/g,'').replace(/\s+/g,' ').trim();
}

function words(s) { return s.split(/\s+/).filter(Boolean); }
function pool() { return levelEl.value==='all' ? SENTENCES : SENTENCES.filter(x=>x.level===levelEl.value); }

function chip(word) {
  const b=document.createElement('button');
  b.type='button'; b.className='word-chip'; b.textContent=word; b.dataset.word=word;
  b.draggable=true; b.id='w-'+Date.now()+'-'+Math.random().toString(36).slice(2);
  b.addEventListener('click',()=>{
    if(b.dataset.suppressClick==='1') { b.dataset.suppressClick='0'; return; }
    move(b);
  });
  b.addEventListener('dragstart',e=>e.dataTransfer.setData('text/plain',b.id));
  b.addEventListener('pointerdown',e=>beginPointerDrag(e,b));
  return b;
}

function move(b) {
  if(locked)return;
  (b.parentElement===wordBank?answerZone:wordBank).appendChild(b);
  placeholder();
}

function placeholder() {
  let p=answerZone.querySelector('.answer-placeholder');
  const has=answerZone.querySelector('.word-chip');
  if(has&&p)p.remove();
  if(!has&&!p) {
    p=document.createElement('span'); p.className='answer-placeholder';
    p.textContent='วางคำตอบที่นี่...'; answerZone.appendChild(p);
  }
}

function drop(e,z) {
  e.preventDefault(); if(locked)return;
  const b=document.getElementById(e.dataTransfer.getData('text/plain'));
  if(b) insertChipAtPoint(b,z,e.clientX,e.clientY);
  placeholder();
}

[answerZone,wordBank].forEach(z=>{
  z.addEventListener('dragover',e=>e.preventDefault());
  z.addEventListener('drop',e=>drop(e,z));
});

function zoneAtPoint(x,y) {
  return document.elementsFromPoint(x,y).find(el=>el===answerZone||el===wordBank) || null;
}

function chipAtPoint(x,y) {
  return document.elementsFromPoint(x,y).find(el=>el.classList?.contains('word-chip')) || null;
}

function insertChipAtPoint(b,zone,x,y) {
  if(!zone) return false;
  const siblings=[...zone.querySelectorAll('.word-chip')].filter(el=>el!==b);
  if(!siblings.length) { zone.appendChild(b); return true; }

  let before=null, best=Infinity;
  for(const el of siblings) {
    const r=el.getBoundingClientRect();
    const cy=r.top+r.height/2, cx=r.left+r.width/2;
    const rowPenalty=Math.abs(y-cy)*2;
    const dist=rowPenalty + Math.abs(x-cx);
    if((y<cy || (Math.abs(y-cy)<r.height/2 && x<cx)) && dist<best) {
      best=dist; before=el;
    }
  }
  if(before) zone.insertBefore(b,before); else zone.appendChild(b);
  return true;
}

function setDropHighlight(zone) {
  if(activeDropZone===zone) return;
  activeDropZone?.classList.remove('drop-active');
  zone?.classList.add('drop-active');
  activeDropZone=zone;
}

function beginPointerDrag(e,b) {
  if(locked || (e.pointerType!=='touch' && e.pointerType!=='pen')) return;
  touchDrag={chip:b,startX:e.clientX,startY:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:false,
    originParent:b.parentElement,originNext:b.nextSibling};
  b.setPointerCapture?.(e.pointerId);
  b.classList.add('dragging');
  e.preventDefault();
}

document.addEventListener('pointermove',e=>{
  if(!touchDrag)return;
  const d=touchDrag; d.lastX=e.clientX; d.lastY=e.clientY;
  const dx=e.clientX-d.startX, dy=e.clientY-d.startY;
  if(Math.hypot(dx,dy)>8) d.moved=true;
  if(d.moved) {
    d.chip.style.transform=`translate(${dx}px,${dy}px) scale(1.05)`;
    setDropHighlight(zoneAtPoint(e.clientX,e.clientY));
  }
},{passive:false});

document.addEventListener('pointerup',e=>{
  if(!touchDrag)return;
  const d=touchDrag;
  d.chip.style.transform='';
  d.chip.classList.remove('dragging');
  setDropHighlight(null);
  if(d.moved) {
    const zone=zoneAtPoint(e.clientX,e.clientY);
    if(zone) insertChipAtPoint(d.chip,zone,e.clientX,e.clientY);
    else if(d.originNext?.parentElement===d.originParent) d.originParent.insertBefore(d.chip,d.originNext);
    else d.originParent.appendChild(d.chip);
    d.chip.dataset.suppressClick='1';
  }
  touchDrag=null; placeholder();
},{passive:false});

function start() {
  const p=pool();
  if(p.length<TOTAL) { feedback.textContent='ระดับนี้มีประโยคไม่ครบ 10 ข้อ'; return; }
  queue=shuffle(p).slice(0,TOTAL); index=0; score=0; scoreEl.textContent='0';
  if(resultDialog.open)resultDialog.close();
  startBtn.textContent='🔄 เริ่มใหม่'; show();
}

function show() {
  clearTimer();
  if(index>=TOTAL) { finish(); return; }
  current=queue[index++]; locked=false; releaseGrabbed(true);
  feedback.className='feedback'; feedback.textContent='เรียงคำให้เป็นประโยคภาษาอังกฤษที่ถูกต้อง';
  questionLabel.textContent=`คำถาม ${index} / ${TOTAL}`; thaiPrompt.textContent=current.th;
  hintText.textContent='แตะคำ ลากบนหน้าจอ หรือจีบนิ้วผ่านกล้องเพื่อจับและวางคำ';
  answerZone.replaceChildren(); wordBank.replaceChildren(); placeholder();
  shuffle(words(current.en)).forEach(w=>wordBank.appendChild(chip(w)));
  startTimer();
}

function answer() {
  return [...answerZone.querySelectorAll('.word-chip')].map(x=>x.dataset.word).join(' ');
}

function check(timeout=false) {
  if(!current||locked)return;
  locked=true; clearTimer(); releaseGrabbed(true);
  const ok=norm(answer())===norm(current.en);
  if(ok) {
    score+=POINTS; scoreEl.textContent=String(score);
    feedback.className='feedback correct'; feedback.textContent=`✅ Correct! ${current.en}`; speak(current.en);
  } else {
    feedback.className='feedback wrong';
    feedback.textContent=timeout?`⏰ Time's up! คำตอบคือ: ${current.en}`:`❌ คำตอบคือ: ${current.en}`;
    speak(`The correct sentence is. ${current.en}`,.50);
  }
  setTimeout(show,NEXT_DELAY);
}

function clearAnswer() {
  if(locked)return;
  [...answerZone.querySelectorAll('.word-chip')].forEach(x=>wordBank.appendChild(x)); placeholder();
}
function undo() {
  if(locked)return;
  const xs=answerZone.querySelectorAll('.word-chip'),last=xs[xs.length-1];
  if(last)wordBank.appendChild(last); placeholder();
}
function hint() {
  if(!current||locked)return;
  document.querySelectorAll('.word-chip').forEach(x=>x.classList.remove('first-hint'));
  const first=words(current.en)[0].toLowerCase();
  const b=[...wordBank.querySelectorAll('.word-chip')].find(x=>x.dataset.word.toLowerCase()===first);
  if(b) {
    b.classList.add('first-hint'); feedback.textContent=`💡 คำแรกคือ “${b.dataset.word}”`;
    setTimeout(()=>b.classList.remove('first-hint'),2200);
  }
}

function speak(text,rate=SPEECH_RATE) {
  if(!('speechSynthesis'in window))return;
  speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(text);
  u.lang='en-US'; u.rate=rate; u.pitch=1; speechSynthesis.speak(u);
}

function startTimer() {
  const limit=Number(timeLimitEl.value); timerBox.classList.remove('warning','danger');
  if(!limit) { timerEl.textContent='∞'; return; }
  seconds=limit; timerEl.textContent=String(seconds);
  timerId=setInterval(()=>{
    seconds--; timerEl.textContent=String(seconds);
    timerBox.classList.toggle('warning',seconds<=10&&seconds>5);
    timerBox.classList.toggle('danger',seconds<=5);
    if(seconds<=0) { clearTimer(); check(true); }
  },1000);
}
function clearTimer() { if(timerId)clearInterval(timerId); timerId=null; }

function setupRecognition() {
  if(!SpeechRecognitionAPI) { speakBtn.disabled=true; return; }
  recognition=new SpeechRecognitionAPI(); recognition.lang='en-US';
  recognition.interimResults=false; recognition.maxAlternatives=3;
  recognition.onstart=()=>{speakBtn.textContent='🎤 Listening...';feedback.textContent='กำลังฟังประโยคภาษาอังกฤษ...';};
  recognition.onend=()=>speakBtn.textContent='🎤 พูดประโยค';
  recognition.onerror=()=>{feedback.className='feedback wrong';feedback.textContent='ไม่ได้ยินชัดเจน กรุณาลองพูดใหม่';};
  recognition.onresult=e=>{
    if(!current||locked)return;
    const heard=[...e.results[0]].map(r=>r.transcript);
    const matched=heard.some(t=>norm(t)===norm(current.en));
    if(matched) {
      [...answerZone.querySelectorAll('.word-chip')].forEach(x=>wordBank.appendChild(x));
      words(current.en).forEach(w=>{
        const b=[...wordBank.querySelectorAll('.word-chip')].find(x=>x.dataset.word.toLowerCase()===w.toLowerCase());
        if(b)answerZone.appendChild(b);
      });
      placeholder(); check();
    } else {
      feedback.className='feedback wrong'; feedback.textContent=`ได้ยินว่า: “${heard[0]}” — ลองอีกครั้ง`;
    }
  };
}

function resizeHandCanvas() {
  const dpr=Math.min(window.devicePixelRatio||1,2);
  handCanvas.width=Math.round(window.innerWidth*dpr);
  handCanvas.height=Math.round(window.innerHeight*dpr);
  handCanvas.style.width=window.innerWidth+'px'; handCanvas.style.height=window.innerHeight+'px';
  handCtx.setTransform(dpr,0,0,dpr,0,0);
}

function drawHandCursor(x,y,pinching,label='') {
  handCtx.clearRect(0,0,window.innerWidth,window.innerHeight);
  handCtx.beginPath(); handCtx.arc(x,y,pinching?23:16,0,Math.PI*2);
  handCtx.fillStyle=pinching?'rgba(250,204,21,.88)':'rgba(45,212,191,.82)'; handCtx.fill();
  handCtx.lineWidth=4; handCtx.strokeStyle='#fff'; handCtx.stroke();
  handCtx.beginPath(); handCtx.arc(x,y,4,0,Math.PI*2); handCtx.fillStyle='#fff'; handCtx.fill();
  if(label) {
    handCtx.font='600 16px Kanit, sans-serif';
    const w=handCtx.measureText(label).width+24;
    handCtx.fillStyle='rgba(7,17,31,.92)'; handCtx.fillRect(x+26,y-18,w,34);
    handCtx.fillStyle='#fff'; handCtx.fillText(label,x+38,y+5);
  }
}

function clearHandUI() {
  handCtx.clearRect(0,0,window.innerWidth,window.innerHeight);
  hoveredChip?.classList.remove('ar-hover'); hoveredChip=null; setDropHighlight(null);
}

function releaseGrabbed(cancel=false,x=null,y=null) {
  if(!grabbedChip)return;
  const b=grabbedChip; b.classList.remove('ar-dragging');
  if(!cancel && Number.isFinite(x) && Number.isFinite(y)) {
    const zone=zoneAtPoint(x,y);
    if(zone) insertChipAtPoint(b,zone,x,y);
    else if(grabbedOrigin?.next?.parentElement===grabbedOrigin.parent) grabbedOrigin.parent.insertBefore(b,grabbedOrigin.next);
    else grabbedOrigin?.parent?.appendChild(b);
  } else if(cancel && grabbedOrigin?.parent && !b.isConnected) {
    grabbedOrigin.parent.appendChild(b);
  }
  grabbedChip=null; grabbedOrigin=null; placeholder(); setDropHighlight(null);
}

function processHandResults(results) {
  const lm=results.multiHandLandmarks?.[0];
  if(!lm) {
    handStatus.textContent='🖐️ มือ: ยังไม่พบ';
    pinchCloseFrames=0; pinchOpenFrames=0;
    if(grabbedChip) releaseGrabbed(true);
    pinchActive=false; clearHandUI(); smoothX=smoothY=null; return;
  }
  handStatus.textContent=grabbedChip?'🤏 กำลังลากคำ':'🖐️ มือ: ตรวจพบแล้ว';
  const indexTip=lm[8], thumbTip=lm[4];
  const rawX=(1-indexTip.x)*window.innerWidth, rawY=indexTip.y*window.innerHeight;
  const alpha=.38;
  smoothX=smoothX==null?rawX:smoothX+(rawX-smoothX)*alpha;
  smoothY=smoothY==null?rawY:smoothY+(rawY-smoothY)*alpha;
  const dist=Math.hypot(indexTip.x-thumbTip.x,indexTip.y-thumbTip.y);

  if(!pinchActive) {
    pinchCloseFrames = dist < .050 ? pinchCloseFrames+1 : 0;
    if(pinchCloseFrames>=2) { pinchActive=true; pinchCloseFrames=0; }
  } else {
    pinchOpenFrames = dist > .075 ? pinchOpenFrames+1 : 0;
    if(pinchOpenFrames>=2) {
      pinchActive=false; pinchOpenFrames=0;
      if(grabbedChip) releaseGrabbed(false,smoothX,smoothY);
    }
  }

  if(!grabbedChip) {
    const candidate=chipAtPoint(smoothX,smoothY);
    if(hoveredChip!==candidate) {
      hoveredChip?.classList.remove('ar-hover'); candidate?.classList.add('ar-hover'); hoveredChip=candidate;
    }
    if(pinchActive && candidate && !locked) {
      grabbedChip=candidate; grabbedOrigin={parent:candidate.parentElement,next:candidate.nextSibling};
      candidate.classList.remove('ar-hover'); candidate.classList.add('ar-dragging'); hoveredChip=null;
    }
  } else {
    setDropHighlight(zoneAtPoint(smoothX,smoothY));
  }
  drawHandCursor(smoothX,smoothY,pinchActive,grabbedChip?.dataset.word||'');
}

async function enableCamera() {
  if(cameraStream) return;
  if(!navigator.mediaDevices?.getUserMedia) {
    handStatus.textContent='🖐️ มือ: เบราว์เซอร์ไม่รองรับกล้อง'; return;
  }
  try {
    cameraStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'user'},width:{ideal:1280},height:{ideal:720}},audio:false});
    camera.srcObject=cameraStream; await camera.play(); camera.classList.add('active');
    cameraBtn.textContent='✅ กล้อง AR พร้อม'; handStatus.textContent='🖐️ มือ: กำลังเริ่มระบบ';
    startHandTracking();
  } catch(err) {
    handStatus.textContent='🖐️ มือ: เปิดกล้องไม่ได้'; cameraBtn.textContent='📷 ลองเปิดกล้องอีกครั้ง';
  }
}

function startHandTracking() {
  if(!window.Hands||!window.Camera) { handStatus.textContent='🖐️ มือ: โหลด MediaPipe ไม่สำเร็จ'; return; }
  if(handsInstance) return;
  handsInstance=new Hands({locateFile:file=>`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`});
  handsInstance.setOptions({maxNumHands:1,modelComplexity:1,minDetectionConfidence:.72,minTrackingConfidence:.72});
  handsInstance.onResults(processHandResults);
  mediaPipeCamera=new Camera(camera,{
    onFrame:async()=>{await handsInstance.send({image:camera});},
    width:1280,height:720
  });
  mediaPipeCamera.start();
}

function finish() {
  clearTimer(); current=null; locked=true; releaseGrabbed(true);
  finalScore.textContent=`${score} / ${TOTAL*POINTS}`;
  resultDialog.showModal?resultDialog.showModal():alert(`จบเกมแล้ว! คะแนน ${score} / 100`);
}

startBtn.addEventListener('click',start);
cameraBtn.addEventListener('click',enableCamera);
checkBtn.addEventListener('click',()=>check());
clearBtn.addEventListener('click',clearAnswer);
undoBtn.addEventListener('click',undo);
hintBtn.addEventListener('click',hint);
listenBtn.addEventListener('click',()=>current?speak(current.en,.50):feedback.textContent='กรุณากดเริ่มเกมก่อน');
speakBtn.addEventListener('click',()=>{
  if(!current||locked) {feedback.textContent='กรุณากดเริ่มเกมก่อน';return;}
  speechSynthesis?.cancel(); try{recognition?.start()}catch{}
});
playAgainBtn.addEventListener('click',start);
timeLimitEl.addEventListener('change',()=>timerEl.textContent=timeLimitEl.value||'∞');
window.addEventListener('resize',resizeHandCanvas);
window.addEventListener('beforeunload',()=>cameraStream?.getTracks().forEach(track=>track.stop()));

resizeHandCanvas(); setupRecognition(); timerEl.textContent=timeLimitEl.value||'∞';
})();
(() => {
'use strict';
const ANIMALS = [{"slug": "lion", "name": "lion", "thai": "สิงโต", "group": "medium", "image": "images/animals/lion.jpg"}, {"slug": "tiger", "name": "tiger", "thai": "เสือ", "group": "medium", "image": "images/animals/tiger.jpg"}, {"slug": "elephant", "name": "elephant", "thai": "ช้าง", "group": "medium", "image": "images/animals/elephant.jpg"}, {"slug": "giraffe", "name": "giraffe", "thai": "ยีราฟ", "group": "medium", "image": "images/animals/giraffe.jpg"}, {"slug": "zebra", "name": "zebra", "thai": "ม้าลาย", "group": "medium", "image": "images/animals/zebra.jpg"}, {"slug": "rhino", "name": "rhino", "thai": "แรด", "group": "medium", "image": "images/animals/rhino.jpg"}, {"slug": "hippopotamus", "name": "hippopotamus", "thai": "ฮิปโปโปเตมัส", "group": "medium", "image": "images/animals/hippopotamus.jpg"}, {"slug": "bear", "name": "bear", "thai": "หมี", "group": "medium", "image": "images/animals/bear.jpg"}, {"slug": "wolf", "name": "wolf", "thai": "หมาป่า", "group": "medium", "image": "images/animals/wolf.jpg"}, {"slug": "fox", "name": "fox", "thai": "สุนัขจิ้งจอก", "group": "medium", "image": "images/animals/fox.jpg"}, {"slug": "deer", "name": "deer", "thai": "กวาง", "group": "medium", "image": "images/animals/deer.jpg"}, {"slug": "kangaroo", "name": "kangaroo", "thai": "จิงโจ้", "group": "medium", "image": "images/animals/kangaroo.jpg"}, {"slug": "panda", "name": "panda", "thai": "แพนด้า", "group": "medium", "image": "images/animals/panda.jpg"}, {"slug": "koala", "name": "koala", "thai": "โคอาลา", "group": "medium", "image": "images/animals/koala.jpg"}, {"slug": "sloth", "name": "sloth", "thai": "สลอธ", "group": "medium", "image": "images/animals/sloth.jpg"}, {"slug": "monkey", "name": "monkey", "thai": "ลิง", "group": "medium", "image": "images/animals/monkey.jpg"}, {"slug": "chimpanzee", "name": "chimpanzee", "thai": "ชิมแปนซี", "group": "medium", "image": "images/animals/chimpanzee.jpg"}, {"slug": "orangutan", "name": "orangutan", "thai": "อุรังอุตัง", "group": "medium", "image": "images/animals/orangutan.jpg"}, {"slug": "gorilla", "name": "gorilla", "thai": "กอริลลา", "group": "medium", "image": "images/animals/gorilla.jpg"}, {"slug": "cheetah", "name": "cheetah", "thai": "เสือชีตาห์", "group": "medium", "image": "images/animals/cheetah.jpg"}, {"slug": "leopard", "name": "leopard", "thai": "เสือดาว", "group": "medium", "image": "images/animals/leopard.jpg"}, {"slug": "snow_leopard", "name": "snow leopard", "thai": "เสือดาวหิมะ", "group": "medium", "image": "images/animals/snow_leopard.jpg"}, {"slug": "jaguar", "name": "jaguar", "thai": "จากัวร์", "group": "medium", "image": "images/animals/jaguar.jpg"}, {"slug": "cougar", "name": "cougar", "thai": "คูการ์", "group": "medium", "image": "images/animals/cougar.jpg"}, {"slug": "dog", "name": "dog", "thai": "สุนัข", "group": "easy", "image": "images/animals/dog.jpg"}, {"slug": "cat", "name": "cat", "thai": "แมว", "group": "easy", "image": "images/animals/cat.jpg"}, {"slug": "rabbit", "name": "rabbit", "thai": "กระต่าย", "group": "easy", "image": "images/animals/rabbit.jpg"}, {"slug": "horse", "name": "horse", "thai": "ม้า", "group": "easy", "image": "images/animals/horse.jpg"}, {"slug": "cow", "name": "cow", "thai": "วัว", "group": "easy", "image": "images/animals/cow.jpg"}, {"slug": "buffalo", "name": "buffalo", "thai": "ควาย", "group": "easy", "image": "images/animals/buffalo.jpg"}, {"slug": "goat", "name": "goat", "thai": "แพะ", "group": "easy", "image": "images/animals/goat.jpg"}, {"slug": "sheep", "name": "sheep", "thai": "แกะ", "group": "easy", "image": "images/animals/sheep.jpg"}, {"slug": "pig", "name": "pig", "thai": "หมู", "group": "easy", "image": "images/animals/pig.jpg"}, {"slug": "chicken", "name": "chicken", "thai": "ไก่", "group": "easy", "image": "images/animals/chicken.jpg"}, {"slug": "duck", "name": "duck", "thai": "เป็ด", "group": "easy", "image": "images/animals/duck.jpg"}, {"slug": "goose", "name": "goose", "thai": "ห่าน", "group": "easy", "image": "images/animals/goose.jpg"}, {"slug": "turkey", "name": "turkey", "thai": "ไก่งวง", "group": "easy", "image": "images/animals/turkey.jpg"}, {"slug": "dove", "name": "dove", "thai": "นกพิราบขาว", "group": "easy", "image": "images/animals/dove.jpg"}, {"slug": "parrot", "name": "parrot", "thai": "นกแก้ว", "group": "easy", "image": "images/animals/parrot.jpg"}, {"slug": "eagle", "name": "eagle", "thai": "นกอินทรี", "group": "easy", "image": "images/animals/eagle.jpg"}, {"slug": "owl", "name": "owl", "thai": "นกฮูก", "group": "easy", "image": "images/animals/owl.jpg"}, {"slug": "hawk", "name": "hawk", "thai": "เหยี่ยว", "group": "easy", "image": "images/animals/hawk.jpg"}, {"slug": "bat", "name": "bat", "thai": "ค้างคาว", "group": "medium", "image": "images/animals/bat.jpg"}, {"slug": "penguin", "name": "penguin", "thai": "เพนกวิน", "group": "easy", "image": "images/animals/penguin.jpg"}, {"slug": "flamingo", "name": "flamingo", "thai": "ฟลามิงโก", "group": "easy", "image": "images/animals/flamingo.jpg"}, {"slug": "swan", "name": "swan", "thai": "หงส์", "group": "easy", "image": "images/animals/swan.jpg"}, {"slug": "seagull", "name": "seagull", "thai": "นกนางนวล", "group": "easy", "image": "images/animals/seagull.jpg"}, {"slug": "crow", "name": "crow", "thai": "อีกา", "group": "easy", "image": "images/animals/crow.jpg"}, {"slug": "peacock", "name": "peacock", "thai": "นกยูง", "group": "easy", "image": "images/animals/peacock.jpg"}, {"slug": "hummingbird", "name": "hummingbird", "thai": "นกฮัมมิงเบิร์ด", "group": "easy", "image": "images/animals/hummingbird.jpg"}, {"slug": "shark", "name": "shark", "thai": "ฉลาม", "group": "medium", "image": "images/animals/shark.jpg"}, {"slug": "dolphin", "name": "dolphin", "thai": "โลมา", "group": "medium", "image": "images/animals/dolphin.jpg"}, {"slug": "whale", "name": "whale", "thai": "วาฬ", "group": "medium", "image": "images/animals/whale.jpg"}, {"slug": "seal", "name": "seal", "thai": "แมวน้ำ", "group": "medium", "image": "images/animals/seal.jpg"}, {"slug": "octopus", "name": "octopus", "thai": "ปลาหมึกยักษ์", "group": "medium", "image": "images/animals/octopus.jpg"}, {"slug": "jellyfish", "name": "jellyfish", "thai": "แมงกะพรุน", "group": "medium", "image": "images/animals/jellyfish.jpg"}, {"slug": "seahorse", "name": "seahorse", "thai": "ม้าน้ำ", "group": "medium", "image": "images/animals/seahorse.jpg"}, {"slug": "starfish", "name": "starfish", "thai": "ปลาดาว", "group": "medium", "image": "images/animals/starfish.jpg"}, {"slug": "clownfish", "name": "clownfish", "thai": "ปลาการ์ตูน", "group": "medium", "image": "images/animals/clownfish.jpg"}, {"slug": "sea_turtle", "name": "sea turtle", "thai": "เต่าทะเล", "group": "medium", "image": "images/animals/sea_turtle.jpg"}, {"slug": "crocodile", "name": "crocodile", "thai": "จระเข้", "group": "medium", "image": "images/animals/crocodile.jpg"}, {"slug": "alligator", "name": "alligator", "thai": "อัลลิเกเตอร์", "group": "medium", "image": "images/animals/alligator.jpg"}, {"slug": "turtle", "name": "turtle", "thai": "เต่า", "group": "medium", "image": "images/animals/turtle.jpg"}, {"slug": "iguana", "name": "iguana", "thai": "อีกัวนา", "group": "medium", "image": "images/animals/iguana.jpg"}, {"slug": "chameleon", "name": "chameleon", "thai": "กิ้งก่าคาเมเลียน", "group": "medium", "image": "images/animals/chameleon.jpg"}, {"slug": "snake", "name": "snake", "thai": "งู", "group": "medium", "image": "images/animals/snake.jpg"}, {"slug": "frog", "name": "frog", "thai": "กบ", "group": "medium", "image": "images/animals/frog.jpg"}, {"slug": "lizard", "name": "lizard", "thai": "กิ้งก่า", "group": "medium", "image": "images/animals/lizard.jpg"}, {"slug": "bee", "name": "bee", "thai": "ผึ้ง", "group": "hard", "image": "images/animals/bee.jpg"}, {"slug": "butterfly", "name": "butterfly", "thai": "ผีเสื้อ", "group": "hard", "image": "images/animals/butterfly.jpg"}, {"slug": "ant", "name": "ant", "thai": "มด", "group": "hard", "image": "images/animals/ant.jpg"}, {"slug": "beetle", "name": "beetle", "thai": "ด้วง", "group": "hard", "image": "images/animals/beetle.jpg"}, {"slug": "ladybug", "name": "ladybug", "thai": "เต่าทอง", "group": "hard", "image": "images/animals/ladybug.jpg"}, {"slug": "dragonfly", "name": "dragonfly", "thai": "แมลงปอ", "group": "hard", "image": "images/animals/dragonfly.jpg"}, {"slug": "grasshopper", "name": "grasshopper", "thai": "ตั๊กแตน", "group": "hard", "image": "images/animals/grasshopper.jpg"}, {"slug": "spider", "name": "spider", "thai": "แมงมุม", "group": "hard", "image": "images/animals/spider.jpg"}, {"slug": "scorpion", "name": "scorpion", "thai": "แมงป่อง", "group": "hard", "image": "images/animals/scorpion.jpg"}, {"slug": "elephant_seal", "name": "elephant seal", "thai": "แมวน้ำช้าง", "group": "medium", "image": "images/animals/elephant_seal.jpg"}, {"slug": "otter", "name": "otter", "thai": "นาก", "group": "medium", "image": "images/animals/otter.jpg"}, {"slug": "hyena", "name": "hyena", "thai": "ไฮยีนา", "group": "medium", "image": "images/animals/hyena.jpg"}];

const TOTAL = 10;
const el = (id) => document.getElementById(id);

const camera = el("camera");
const handCanvas = el("handCanvas");
const ctx = handCanvas.getContext("2d");
const cameraButton = el("cameraButton");
const handStatus = el("handStatus");
const voiceStatus = el("voiceStatus");
const scoreEl = el("score");
const instruction = el("instruction");
const photo = el("animalPhoto");
const promptEl = el("animalPrompt");
const message = el("message");
const answers = el("answers");
const level = el("level");
const startButton = el("startButton");
const listenButton = el("listenButton");
const voiceButton = el("voiceButton");
const soundButton = el("soundButton");

let score = 0;
let index = 0;
let queue = [];
let current = null;
let answered = false;
let soundOn = true;
let recognition = null;
let stream = null;
let hovered = null;
let lastPinch = 0;

const SpeechRecognitionApi = window.SpeechRecognition || window.webkitSpeechRecognition;

function shuffle(items){
  const a=[...items];
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

function speak(text, rate=.48){
  if(!soundOn || !("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  u.lang="en-US";
  u.rate=rate;
  u.pitch=1;
  speechSynthesis.speak(u);
}

function getPool(){
  if(level.value==="easy") return ANIMALS.filter(a=>a.group==="easy");
  if(level.value==="medium") return ANIMALS.filter(a=>a.group!=="hard");
  return ANIMALS;
}

function startGame(){
  score=0;
  index=0;
  answered=false;
  scoreEl.textContent="0";
  queue=shuffle(getPool()).slice(0,TOTAL);
  startButton.textContent="เริ่มใหม่";
  showQuestion();
}

function showQuestion(){
  if(index>=TOTAL){ finishGame(); return; }

  current=queue[index++];
  answered=false;

  instruction.textContent=`คำถาม ${index} / ${TOTAL}`;
  promptEl.textContent="What animal is this?";
  message.textContent="เลือกชื่อสัตว์ที่ถูกต้อง หรือกดไมโครโฟนแล้วพูด";

  photo.src=`${current.image}?v=13`;
  photo.alt=current.name;

  const wrong=shuffle(ANIMALS.filter(a=>a.slug!==current.slug)).slice(0,3);
  const choices=shuffle([current,...wrong]);
  answers.replaceChildren();

  choices.forEach(animal=>{
    const b=document.createElement("button");
    b.type="button";
    b.className="answer";
    b.dataset.answer=animal.name;
    b.textContent=animal.name.charAt(0).toUpperCase()+animal.name.slice(1);
    b.addEventListener("click",()=>checkAnswer(b,animal.name));
    answers.appendChild(b);
  });

  speak("What... animal... is... this?");
}

function checkAnswer(button, selected){
  if(answered || !current) return;
  answered=true;

  document.querySelectorAll(".answer").forEach(b=>b.disabled=true);
  const correct=selected.toLowerCase()===current.name.toLowerCase();

  if(correct){
    score+=10;
    button?.classList.add("correct");
    message.textContent=`Correct! This is a ${current.name}. แปลว่า ${current.thai}`;
    speak(`Correct... This... is... a... ${current.name}.`,.50);
  }else{
    button?.classList.add("wrong");
    [...document.querySelectorAll(".answer")]
      .find(b=>b.dataset.answer===current.name)?.classList.add("correct");
    message.textContent=`Not quite. This is a ${current.name}. แปลว่า ${current.thai}`;
    speak(`Not... quite... This... is... a... ${current.name}.`,.48);
  }

  scoreEl.textContent=String(score);
  setTimeout(showQuestion,1800);
}

function finishGame(){
  current=null;
  answered=true;
  instruction.textContent=`ครบ ${TOTAL} คำถามแล้ว`;
  promptEl.textContent="Game Complete!";
  message.textContent=`คะแนนรวม ${score} / 100`;
  answers.replaceChildren();
  photo.src="images/animals/lion.jpg?v=13";
  speak(`Game complete... Your score is ${score} out of one hundred.`,.48);
}

function resizeCanvas(){
  handCanvas.width=window.innerWidth;
  handCanvas.height=window.innerHeight;
}

function answerAt(x,y){
  return [...document.querySelectorAll(".answer:not(:disabled)")].find(b=>{
    const r=b.getBoundingClientRect();
    return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;
  })||null;
}

function drawCursor(x,y,pinch){
  ctx.clearRect(0,0,handCanvas.width,handCanvas.height);
  ctx.beginPath();
  ctx.arc(x,y,pinch?22:16,0,Math.PI*2);
  ctx.fillStyle=pinch?"rgba(250,204,21,.9)":"rgba(45,212,191,.85)";
  ctx.fill();
  ctx.lineWidth=4;
  ctx.strokeStyle="white";
  ctx.stroke();
}

function onHands(results){
  const lm=results.multiHandLandmarks?.[0];
  if(!lm){
    handStatus.textContent="🖐️ มือ: ยังไม่พบ";
    ctx.clearRect(0,0,handCanvas.width,handCanvas.height);
    hovered?.classList.remove("hand-hover");
    hovered=null;
    return;
  }

  handStatus.textContent="🖐️ มือ: ตรวจพบ";
  const tip=lm[8], thumb=lm[4];
  const x=(1-tip.x)*window.innerWidth;
  const y=tip.y*window.innerHeight;
  const pinch=Math.hypot(tip.x-thumb.x,tip.y-thumb.y)<.055;

  drawCursor(x,y,pinch);
  const target=answerAt(x,y);
  if(target!==hovered){
    hovered?.classList.remove("hand-hover");
    target?.classList.add("hand-hover");
    hovered=target;
  }

  const now=Date.now();
  if(pinch&&target&&now-lastPinch>1100){
    lastPinch=now;
    target.click();
  }
}

async function enableCamera(){
  try{
    stream=await navigator.mediaDevices.getUserMedia({
      video:{facingMode:{ideal:"user"},width:{ideal:1280},height:{ideal:720}},
      audio:false
    });
    camera.srcObject=stream;
    await camera.play();
    cameraButton.textContent="✅ กล้องพร้อม";

    if(window.Hands&&window.Camera){
      const hands=new Hands({
        locateFile:file=>`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });
      hands.setOptions({
        maxNumHands:1,
        modelComplexity:1,
        minDetectionConfidence:.65,
        minTrackingConfidence:.6
      });
      hands.onResults(onHands);

      const mpCamera=new Camera(camera,{
        onFrame:async()=>hands.send({image:camera}),
        width:1280,
        height:720
      });
      mpCamera.start();
    }
  }catch(err){
    cameraButton.textContent="❌ เปิดกล้องไม่ได้";
    handStatus.textContent="🖐️ มือ: ใช้เมาส์/สัมผัสแทน";
  }
}

function setupVoice(){
  if(!SpeechRecognitionApi){
    voiceButton.disabled=true;
    voiceStatus.textContent="🎤 เสียง: ไม่รองรับ";
    return;
  }

  recognition=new SpeechRecognitionApi();
  recognition.lang="en-US";
  recognition.interimResults=false;
  recognition.maxAlternatives=5;

  recognition.onstart=()=>{
    voiceButton.classList.add("listening");
    voiceButton.textContent="🎤 Listening...";
    voiceStatus.textContent="🎤 เสียง: กำลังฟัง";
  };
  recognition.onend=()=>{
    voiceButton.classList.remove("listening");
    voiceButton.textContent="🎤 พูดชื่อสัตว์";
    voiceStatus.textContent="🎤 เสียง: พร้อม";
  };
  recognition.onerror=()=>{
    message.textContent="ไม่ได้ยินชัดเจน กรุณาลองใหม่";
  };
  recognition.onresult=e=>{
    if(!current||answered) return;
    const heard=[...e.results[0]].map(r=>r.transcript.toLowerCase().trim());
    const button=[...document.querySelectorAll(".answer")].find(b=>
      heard.some(t=>t.includes(b.dataset.answer)||b.dataset.answer.includes(t))
    );
    checkAnswer(button,button?.dataset.answer||heard[0]);
  };
}

startButton.addEventListener("click",startGame);
cameraButton.addEventListener("click",enableCamera);
listenButton.addEventListener("click",()=>{
  if(current) speak("What... animal... is... this?");
  else message.textContent="กรุณากดเริ่มเกมก่อน";
});
voiceButton.addEventListener("click",()=>{
  if(!current||answered){ message.textContent="กรุณากดเริ่มเกมก่อน"; return; }
  speechSynthesis?.cancel();
  try{ recognition?.start(); }catch{}
});
soundButton.addEventListener("click",()=>{
  soundOn=!soundOn;
  soundButton.textContent=soundOn?"🔊 เสียงเปิด":"🔇 เสียงปิด";
});

window.addEventListener("resize",resizeCanvas);
window.addEventListener("beforeunload",()=>stream?.getTracks().forEach(t=>t.stop()));

resizeCanvas();
setupVoice();
instruction.textContent=`V13 พร้อมแล้ว • ฐานข้อมูล ${ANIMALS.length} ชนิด • กดเริ่มเกมได้เลย`;
enableCamera();

console.log("Animal Game V13 loaded successfully", ANIMALS.length);
})();

(() => {
'use strict';

const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
const voiceButton = document.getElementById('voiceButton');
const voiceStatus = document.getElementById('voiceStatus');
const message = document.getElementById('message');
const answers = document.getElementById('answers');
const animalPhoto = document.getElementById('animalPhoto');

if (!voiceButton || !answers) return;

const ALIASES = {
  lion:['lion','lions','lying','line','ไลอ้อน','ไลออน','สิงโต'],
  tiger:['tiger','tigers','tieger','ไทเกอร์','ไทเก้อ','เสือ'],
  elephant:['elephant','elephants','elefant','elevant','เอเลเฟนต์','เอเลแฟนท์','ช้าง'],
  giraffe:['giraffe','giraffes','giraff','จีราฟ','ยีราฟ'],
  zebra:['zebra','zebras','zeebra','ซีบร้า','ม้าลาย'],
  rhino:['rhino','rhinoceros','ไรโน','แรด'],
  hippopotamus:['hippopotamus','hippo','hippopotamus','ฮิปโป','ฮิปโปโปเตมัส'],
  bear:['bear','bears','beer','bare','แบร์','หมี'],
  wolf:['wolf','wolves','woof','วูล์ฟ','หมาป่า'],
  fox:['fox','foxes','box','ฟ็อกซ์','สุนัขจิ้งจอก'],
  deer:['deer','deers','dear','เดียร์','กวาง'],
  kangaroo:['kangaroo','kangaroos','แคงการู','จิงโจ้'],
  panda:['panda','pandas','แพนด้า'],
  koala:['koala','koalas','โคอาลา'],
  sloth:['sloth','sloths','slot','slow','สลอธ'],
  monkey:['monkey','monkeys','มังกี้','ลิง'],
  chimpanzee:['chimpanzee','chimp','chimpanzees','ชิมแปนซี'],
  orangutan:['orangutan','orangutans','orang','อุรังอุตัง'],
  gorilla:['gorilla','gorillas','กอริลลา'],
  cheetah:['cheetah','cheetahs','cheater','ชีตาห์','เสือชีตาห์'],
  leopard:['leopard','leopards','leppard','เลพเพิร์ด','เสือดาว'],
  'snow leopard':['snow leopard','snow leopards','สโนว์เลพเพิร์ด','เสือดาวหิมะ'],
  jaguar:['jaguar','jaguars','แจ็กวาร์','จากัวร์'],
  cougar:['cougar','cougars','คูการ์'],
  dog:['dog','dogs','dock','doc','ด็อก','หมา','สุนัข'],
  cat:['cat','cats','cap','cab','แคท','แมว'],
  rabbit:['rabbit','rabbits','rapid','แรบบิท','กระต่าย'],
  horse:['horse','horses','hoarse','ฮอร์ส','ม้า'],
  cow:['cow','cows','call','คาว','วัว'],
  buffalo:['buffalo','buffalos','บัฟฟาโล','ควาย'],
  goat:['goat','goats','go','โกท','แพะ'],
  sheep:['sheep','ship','ชีพ','แกะ'],
  pig:['pig','pigs','pick','พิก','หมู'],
  chicken:['chicken','chickens','ชิคเก้น','ไก่'],
  duck:['duck','ducks','dock','ดั๊ก','เป็ด'],
  goose:['goose','geese','juice','กูส','ห่าน'],
  turkey:['turkey','turkeys','เทอร์กี','ไก่งวง'],
  dove:['dove','doves','dub','ดัฟ','นกพิราบ'],
  parrot:['parrot','parrots','pirate','แพรอท','นกแก้ว'],
  eagle:['eagle','eagles','equal','อีเกิล','นกอินทรี'],
  owl:['owl','owls','all','เอาล์','นกฮูก'],
  hawk:['hawk','hawks','hot','ฮอค','เหยี่ยว'],
  bat:['bat','bats','bad','แบท','ค้างคาว'],
  penguin:['penguin','penguins','เพนกวิน'],
  flamingo:['flamingo','flamingos','ฟลามิงโก'],
  swan:['swan','swans','สวอน','หงส์'],
  seagull:['seagull','sea gull','seagulls','ซี กัล','นกนางนวล'],
  crow:['crow','crows','grow','โครว์','อีกา'],
  peacock:['peacock','peacocks','พีค็อก','นกยูง'],
  hummingbird:['hummingbird','humming bird','ฮัมมิงเบิร์ด','นกฮัมมิงเบิร์ด'],
  shark:['shark','sharks','shock','ชาร์ก','ฉลาม'],
  dolphin:['dolphin','dolphins','ดอลฟิน','โลมา'],
  whale:['whale','whales','well','เวล','วาฬ'],
  seal:['seal','seals','steel','ซีล','แมวน้ำ'],
  octopus:['octopus','octopuses','อ็อกโทพัส','ปลาหมึกยักษ์'],
  jellyfish:['jellyfish','jelly fish','เจลลีฟิช','แมงกะพรุน'],
  seahorse:['seahorse','sea horse','ซีฮอร์ส','ม้าน้ำ'],
  starfish:['starfish','star fish','สตาร์ฟิช','ปลาดาว'],
  clownfish:['clownfish','clown fish','คลาวน์ฟิช','ปลาการ์ตูน'],
  'sea turtle':['sea turtle','sea turtles','ซีเทอร์เทิล','เต่าทะเล'],
  crocodile:['crocodile','crocodiles','คร็อกโคไดล์','จระเข้'],
  alligator:['alligator','alligators','แอลลิเกเตอร์','อัลลิเกเตอร์'],
  turtle:['turtle','turtles','total','เทอร์เทิล','เต่า'],
  iguana:['iguana','iguanas','อีกัวนา'],
  chameleon:['chameleon','chameleons','คาเมเลียน','กิ้งก่าคาเมเลียน'],
  snake:['snake','snakes','snack','สเนก','งู'],
  frog:['frog','frogs','fog','ฟร็อก','กบ'],
  lizard:['lizard','lizards','wizard','ลิซาร์ด','กิ้งก่า'],
  bee:['bee','bees','be','บี','ผึ้ง'],
  butterfly:['butterfly','butterflies','บัตเตอร์ฟลาย','ผีเสื้อ'],
  ant:['ant','ants','and','แอนท์','มด'],
  beetle:['beetle','beetles','บีเทิล','ด้วง'],
  ladybug:['ladybug','lady bug','เลดีบั๊ก','เต่าทอง'],
  dragonfly:['dragonfly','dragon fly','ดรากอนฟลาย','แมลงปอ'],
  grasshopper:['grasshopper','grass hopper','กราสฮอปเปอร์','ตั๊กแตน'],
  spider:['spider','spiders','สไปเดอร์','แมงมุม'],
  scorpion:['scorpion','scorpions','สกอร์เปียน','แมงป่อง'],
  'elephant seal':['elephant seal','elephant seals','เอเลเฟนต์ซีล','แมวน้ำช้าง'],
  otter:['otter','otters','author','ออตเทอร์','นาก'],
  hyena:['hyena','hyenas','ไฮยีนา']
};

let armed = false;
let listening = false;
let recognition = null;
let retryTimer = null;
let watchTimer = null;
let lastQuestion = '';
let acceptedQuestion = '';
let attempt = 0;

function norm(text){
  return String(text||'').toLowerCase().normalize('NFKD').replace(/[.,!?"'’]/g,' ').replace(/\s+/g,' ').trim();
}

function editDistance(a,b){
  a=norm(a);b=norm(b);const dp=Array(b.length+1).fill(0).map((_,i)=>i);
  for(let i=1;i<=a.length;i++){
    let prev=dp[0];dp[0]=i;
    for(let j=1;j<=b.length;j++){
      const old=dp[j];
      dp[j]=Math.min(dp[j]+1,dp[j-1]+1,prev+(a[i-1]===b[j-1]?0:1));
      prev=old;
    }
  }
  return dp[b.length];
}

function similarity(a,b){a=norm(a);b=norm(b);return 1-editDistance(a,b)/Math.max(a.length,b.length,1);}

function phonetic(text){
  return norm(text)
    .replace(/[^a-z]/g,'')
    .replace(/ph/g,'f').replace(/ght/g,'t').replace(/ck/g,'k').replace(/qu/g,'k')
    .replace(/c(?=[aou])/g,'k').replace(/c/g,'s').replace(/x/g,'ks')
    .replace(/[aeiouy]/g,'')
    .replace(/(.)\1+/g,'$1');
}

function aliasesFor(answer){
  const key=norm(answer);
  return [...new Set([key,...(ALIASES[key]||[])].map(norm))];
}

function scoreHeard(heard,answer){
  const h=norm(heard);if(!h)return 0;
  let best=0;
  for(const alias of aliasesFor(answer)){
    if(h===alias)return 1;
    if(h.includes(alias)||alias.includes(h))best=Math.max(best,.94);
    best=Math.max(best,similarity(h,alias));
    const hp=phonetic(h),ap=phonetic(alias);
    if(hp&&ap){
      if(hp===ap)best=Math.max(best,.91);
      else best=Math.max(best,similarity(hp,ap)*.86);
    }
    for(const token of h.split(' ')){
      if(token===alias)best=Math.max(best,.98);
      best=Math.max(best,similarity(token,alias)*.92);
    }
  }
  return best;
}

function buttons(){return [...document.querySelectorAll('#answers .answer:not(:disabled)')];}

function questionKey(){
  const src=animalPhoto?.getAttribute('src')||'';
  return `${src}|${buttons().map(b=>norm(b.dataset.answer||b.textContent)).join('|')}`;
}

function speechBusy(){return !!(window.speechSynthesis&&(speechSynthesis.speaking||speechSynthesis.pending));}

function setState(state,text=''){
  if(state==='listening'){
    voiceButton.textContent='🔴 กำลังฟังอัตโนมัติ';voiceButton.classList.add('listening');
    if(voiceStatus)voiceStatus.textContent='🎤 พูดชื่อสัตว์ได้เลย';
  }else if(armed){
    voiceButton.textContent='🎤 Voice Auto: ON';voiceButton.classList.remove('listening');
    if(voiceStatus)voiceStatus.textContent=text||'🎤 Voice Auto: พร้อมฟัง';
  }else{
    voiceButton.textContent='🎤 เปิด Voice Auto';voiceButton.classList.remove('listening');
    if(voiceStatus)voiceStatus.textContent='🎤 เสียง: พร้อม';
  }
}

function chooseFromTranscripts(transcripts){
  const choices=buttons();if(!choices.length)return false;
  let candidates=[];
  for(const heard of transcripts){
    for(const button of choices){
      const answer=button.dataset.answer||button.textContent;
      candidates.push({heard,button,answer,score:scoreHeard(heard,answer)});
    }
  }
  candidates.sort((a,b)=>b.score-a.score);
  const best=candidates[0];
  const second=candidates.find(x=>x.button!==best?.button);
  if(!best)return false;
  const margin=best.score-(second?.score||0);

  // Very forgiving: 0.48 is enough when clearly better than the other three choices.
  const accept=best.score>=0.64 || (best.score>=0.48&&margin>=0.10);
  if(accept){
    if(message)message.textContent=`🎤 ได้ยิน “${best.heard}” → เข้าใจว่า ${best.answer}`;
    if(voiceStatus)voiceStatus.textContent=`🎤 เข้าใจ: ${best.answer}`;
    acceptedQuestion=questionKey();
    best.button.click();
    return true;
  }

  if(message)message.textContent=`🎤 ได้ยิน “${best.heard}” • ลองพูดสั้น ๆ เฉพาะชื่อสัตว์ เช่น “${choices[0]?.textContent}”`;
  if(voiceStatus)voiceStatus.textContent='🎤 ยังไม่ชัด • กำลังฟังใหม่';
  return false;
}

function stop(){
  clearTimeout(retryTimer);clearTimeout(watchTimer);
  try{recognition?.abort();}catch{}
  recognition=null;listening=false;
}

function recognitionLanguage(){
  // Alternate English and Thai recognition. Thai mode often captures Thai-accent English as Thai phonetics.
  return attempt%3===2?'th-TH':'en-US';
}

function startListening(){
  if(!armed||listening||!buttons().length||speechBusy()||document.visibilityState!=='visible')return;
  const key=questionKey();if(!key||key===acceptedQuestion)return;
  if(!Recognition){if(voiceStatus)voiceStatus.textContent='🎤 Safari รุ่นนี้ไม่มี Speech Recognition';return;}

  const r=new Recognition();recognition=r;
  r.lang=recognitionLanguage();r.continuous=false;r.interimResults=false;r.maxAlternatives=10;
  r.onstart=()=>{listening=true;setState('listening');};
  r.onresult=e=>{
    const transcripts=[...e.results[0]].map(x=>String(x.transcript||'').trim()).filter(Boolean);
    chooseFromTranscripts(transcripts);
  };
  r.onerror=e=>{
    listening=false;
    if(e.error==='service-not-allowed'||e.error==='not-allowed'){
      if(voiceStatus)voiceStatus.textContent=`🎤 Safari: ${e.error}`;
      if(message)message.textContent='Safari ไม่อนุญาตบริการ Speech Recognition ของระบบ';
      return;
    }
    if(voiceStatus)voiceStatus.textContent='🎤 กำลังฟังใหม่...';
  };
  r.onend=()=>{
    listening=false;recognition=null;attempt+=1;setState('armed');
    if(armed&&buttons().length&&questionKey()!==acceptedQuestion){retryTimer=setTimeout(schedule,350);}
  };
  try{r.start();}catch{listening=false;recognition=null;retryTimer=setTimeout(schedule,500);}
}

function schedule(){
  clearTimeout(watchTimer);
  if(!armed)return;
  watchTimer=setTimeout(()=>{
    if(!armed||!buttons().length)return;
    if(speechBusy()){schedule();return;}
    startListening();
  },300);
}

function questionChanged(){
  if(!armed)return;
  const key=questionKey();
  if(!key||!buttons().length)return;
  if(key!==lastQuestion){
    try{recognition?.abort();}catch{}
    recognition=null;listening=false;acceptedQuestion='';attempt=0;lastQuestion=key;
    schedule();
  }
}

voiceButton.addEventListener('click',e=>{
  e.preventDefault();e.stopImmediatePropagation();
  if(!armed){
    armed=true;acceptedQuestion='';attempt=0;setState('armed');
    if(message)message.textContent='🎤 Voice Auto เปิดแล้ว • พูดชื่อสัตว์สั้น ๆ ได้เลย ไม่ต้องสำเนียงเป๊ะ';
  }
  schedule();
},true);

const observer=new MutationObserver(questionChanged);
observer.observe(answers,{childList:true,subtree:true,attributes:true});
if(animalPhoto)observer.observe(animalPhoto,{attributes:true,attributeFilter:['src']});

document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='hidden')stop();
  else if(armed)schedule();
});
window.addEventListener('beforeunload',stop);
setState('off');

console.log('Animal Voice Easy V4 ready');
})();

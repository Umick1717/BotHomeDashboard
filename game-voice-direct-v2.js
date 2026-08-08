(() => {
'use strict';

const path=location.pathname.toLowerCase();
const isMath=path.includes('multiplication-game');
const isAnimal=path.includes('animal-game');
const isStory=path.includes('story-game');
const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition||null;

function normalize(text){return String(text||'').toLowerCase().replace(/[.,!?"'’]/g,'').replace(/\s+/g,' ').trim();}

function parseNumber(text){
  const raw=normalize(text);
  const digit=raw.match(/\d{1,3}/);if(digit)return Number(digit[0]);
  const en={zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19,twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90};
  const parts=raw.replace(/[^a-z\s-]/g,' ').split(/[\s-]+/).filter(Boolean);let total=0,ok=false;
  for(const p of parts){if(Object.prototype.hasOwnProperty.call(en,p)){total+=en[p];ok=true;}}
  if(ok)return total;
  const th={'ศูนย์':0,'หนึ่ง':1,'เอ็ด':1,'สอง':2,'ยี่':2,'สาม':3,'สี่':4,'ห้า':5,'หก':6,'เจ็ด':7,'แปด':8,'เก้า':9};
  let s=raw.replace(/\s+/g,'');total=0;ok=false;
  const h=s.match(/(หนึ่ง|สอง|สาม|สี่|ห้า|หก|เจ็ด|แปด|เก้า)ร้อย/);if(h){total+=th[h[1]]*100;s=s.replace(h[0],'');ok=true;}
  const t=s.match(/(ยี่สิบ|สิบ|หนึ่งสิบ|สองสิบ|สามสิบ|สี่สิบ|ห้าสิบ|หกสิบ|เจ็ดสิบ|แปดสิบ|เก้าสิบ)/);
  if(t){const x=t[1];if(x==='สิบ'||x==='หนึ่งสิบ')total+=10;else if(x==='ยี่สิบ'||x==='สองสิบ')total+=20;else total+=(th[x.replace('สิบ','')]||0)*10;s=s.replace(x,'');ok=true;}
  for(const k of Object.keys(th).sort((a,b)=>b.length-a.length)){if(s.includes(k)){total+=th[k];ok=true;break;}}
  return ok?total:null;
}

function els(){return{button:document.getElementById('voiceButton'),status:document.getElementById('voiceStatus'),message:document.getElementById('message')};}
function lang(){if(isMath)return document.body.dataset.questionLanguage==='en'?'en-US':'th-TH';return'en-US';}

function applyText(text){
  const {status,message}=els();
  if(status)status.textContent=`🎤 ได้ยิน: ${text}`;
  if(message)message.textContent=`ได้ยิน: “${text}”`;
  if(isMath){
    const n=parseNumber(text);
    if(!Number.isFinite(n)){if(message)message.textContent=`ได้ยิน “${text}” แต่ยังอ่านเป็นตัวเลขไม่ได้`;return false;}
    const target=[...document.querySelectorAll('.answer-orb:not(:disabled)')].find(b=>Number(b.textContent)===n);
    if(target){target.click();return true;}
    if(message)message.textContent=`คำตอบ ${n} ไม่อยู่ในตัวเลือก กรุณาลองใหม่`;return false;
  }
  const buttons=[...document.querySelectorAll('.answer:not(:disabled)')];
  if(!buttons.length){if(message)message.textContent=isStory?'กรุณารอจนเข้าสู่คำถามก่อน':'กรุณากดเริ่มเกมก่อน';return false;}
  const heard=normalize(text);
  const target=buttons.find(b=>{const a=normalize(b.dataset.answer||b.textContent);return heard===a||heard.includes(a)||a.includes(heard);});
  if(target){target.click();return true;}
  if(message)message.textContent=`ได้ยิน “${text}” แต่ไม่ตรงกับตัวเลือก`;return false;
}

function errorMessage(code){
  const c=String(code||'').toLowerCase();
  if(c==='service-not-allowed')return'Safari เปิดไมโครโฟนได้ แต่บริการ Speech Recognition ของ iOS ปฏิเสธการใช้งาน';
  if(c==='not-allowed')return'โปรดตั้ง Safari > Microphone เป็น Allow แล้ว Reload หน้าเกม';
  if(c==='audio-capture')return'เปิดไมโครโฟนไม่ได้ หรือไมโครโฟนกำลังถูกใช้งาน';
  if(c==='no-speech')return'ไม่ได้ยินเสียง กรุณากดไมค์แล้วพูดอีกครั้ง';
  if(c==='network')return'ระบบรู้จำเสียงของเบราว์เซอร์เชื่อมต่อไม่ได้';
  return`ไมโครโฟน: ${code||'ไม่พร้อม'}`;
}

async function startDirect(){
  const {button,status,message}=els();
  if(!Recognition){const msg='เบราว์เซอร์นี้ไม่มี Speech Recognition API';if(status)status.textContent=`🎤 ${msg}`;if(message)message.textContent=msg;return;}
  if(isStory&&!document.querySelector('.answer:not(:disabled)')){if(message)message.textContent='กรุณารอจนเข้าสู่คำถามก่อน';return;}
  speechSynthesis?.cancel();
  if(button){button.disabled=true;button.textContent='🎤 กำลังเปิดไมค์...';}
  if(status)status.textContent='🎤 กำลังเปิดไมโครโฟน...';

  let stream=null;
  try{
    // Microphone permission is read from Safari settings. If already Allow, no extra UI is required.
    stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:false});
    const track=stream.getAudioTracks()[0];
    const recognition=new Recognition();
    recognition.lang=lang();recognition.continuous=false;recognition.interimResults=false;recognition.maxAlternatives=5;

    const cleanup=()=>{try{stream?.getTracks().forEach(t=>t.stop());}catch{}if(button){button.disabled=false;button.textContent=isAnimal?'🎤 พูดชื่อสัตว์':'🎤 ตอบด้วยเสียง';}};
    recognition.onstart=()=>{if(status)status.textContent='🎤 กำลังฟัง...';if(button)button.textContent='🔴 กำลังฟัง...';};
    recognition.onresult=e=>{const texts=[...e.results[0]].map(x=>x.transcript).filter(Boolean);let used=false;for(const text of texts){if(applyText(text)){used=true;break;}}if(!used&&texts[0])applyText(texts[0]);};
    recognition.onerror=e=>{const msg=errorMessage(e.error);if(status)status.textContent=`🎤 ${msg}`;if(message)message.textContent=msg;cleanup();};
    recognition.onend=()=>{if(status&&!String(status.textContent).includes('ปฏิเสธ'))status.textContent='🎤 เสียง: พร้อม';cleanup();};

    // Newer implementations may accept a live audio track. Older Safari falls back to microphone input automatically.
    try{recognition.start(track);}catch{recognition.start();}
  }catch(err){
    const msg=errorMessage(err?.name==='NotAllowedError'?'not-allowed':err?.name==='NotReadableError'?'audio-capture':err?.message);
    if(status)status.textContent=`🎤 ${msg}`;if(message)message.textContent=msg;
    try{stream?.getTracks().forEach(t=>t.stop());}catch{}
    if(button){button.disabled=false;button.textContent=isAnimal?'🎤 พูดชื่อสัตว์':'🎤 ตอบด้วยเสียง';}
  }
}

function bind(){
  const {button,status}=els();if(!button||button.dataset.directVoiceBound==='1')return;
  button.dataset.directVoiceBound='1';button.disabled=false;button.style.pointerEvents='auto';
  if(status)status.textContent='🎤 เสียง: พร้อม';
  button.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();startDirect();},true);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();

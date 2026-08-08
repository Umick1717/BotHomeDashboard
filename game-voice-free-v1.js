(() => {
'use strict';

const path = location.pathname.toLowerCase();
const isMath = path.includes('multiplication-game');
const isAnimal = path.includes('animal-game');
const isStory = path.includes('story-game');
const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition || null;
const ua = navigator.userAgent || '';
const isIOS = /iPad|iPhone|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

function normalize(text){
  return String(text || '').toLowerCase().replace(/[.,!?"'’]/g,'').replace(/\s+/g,' ').trim();
}

function parseNumber(text){
  const raw=normalize(text);
  const digit=raw.match(/\d{1,3}/);
  if(digit) return Number(digit[0]);

  const en={zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19,twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90};
  const parts=raw.replace(/[^a-z\s-]/g,' ').split(/[\s-]+/).filter(Boolean);
  let total=0,matched=false;
  for(const p of parts){ if(Object.prototype.hasOwnProperty.call(en,p)){ total+=en[p]; matched=true; } }
  if(matched) return total;

  const th={'ศูนย์':0,'หนึ่ง':1,'เอ็ด':1,'สอง':2,'ยี่':2,'สาม':3,'สี่':4,'ห้า':5,'หก':6,'เจ็ด':7,'แปด':8,'เก้า':9};
  let s=raw.replace(/\s+/g,''); total=0; matched=false;
  const h=s.match(/(หนึ่ง|สอง|สาม|สี่|ห้า|หก|เจ็ด|แปด|เก้า)ร้อย/);
  if(h){ total+=th[h[1]]*100; s=s.replace(h[0],''); matched=true; }
  const t=s.match(/(ยี่สิบ|สิบ|หนึ่งสิบ|สองสิบ|สามสิบ|สี่สิบ|ห้าสิบ|หกสิบ|เจ็ดสิบ|แปดสิบ|เก้าสิบ)/);
  if(t){ const x=t[1]; if(x==='สิบ'||x==='หนึ่งสิบ') total+=10; else if(x==='ยี่สิบ'||x==='สองสิบ') total+=20; else total+=(th[x.replace('สิบ','')]||0)*10; s=s.replace(x,''); matched=true; }
  for(const key of Object.keys(th).sort((a,b)=>b.length-a.length)){ if(s.includes(key)){ total+=th[key]; matched=true; break; } }
  return matched ? total : null;
}

function statusElements(){
  return {
    button: document.getElementById('voiceButton'),
    status: document.getElementById('voiceStatus'),
    message: document.getElementById('message')
  };
}

function createSheet(){
  let sheet=document.getElementById('freeVoiceSheet');
  if(sheet) return sheet;
  sheet=document.createElement('div');
  sheet.id='freeVoiceSheet';
  sheet.className='free-voice-sheet';
  sheet.hidden=true;
  sheet.innerHTML=`
    <div class="free-voice-card" role="dialog" aria-modal="true">
      <button class="free-voice-close" type="button" aria-label="ปิด">×</button>
      <h3>🎙️ ตอบด้วยเสียง</h3>
      <p class="free-voice-help">Safari ไม่สามารถถอดเสียงอัตโนมัติได้ในขณะนี้ ให้แตะช่องคำตอบ แล้วแตะปุ่ม 🎤 บนคีย์บอร์ด iPhone/iPad เพื่อพูด จากนั้นกดใช้คำตอบนี้</p>
      <input class="free-voice-input" type="text" autocomplete="off" enterkeyhint="done" />
      <button class="free-voice-submit" type="button">✅ ใช้คำตอบนี้</button>
    </div>`;
  document.body.appendChild(sheet);
  sheet.querySelector('.free-voice-close').onclick=()=>{sheet.hidden=true;};
  sheet.addEventListener('click',e=>{if(e.target===sheet) sheet.hidden=true;});
  return sheet;
}

function applySpokenText(text){
  const {status,message}=statusElements();
  if(status) status.textContent=`🎤 ได้ยิน: ${text}`;
  if(message) message.textContent=`ได้ยิน: “${text}”`;

  if(isMath){
    const value=parseNumber(text);
    if(!Number.isFinite(value)){
      if(message) message.textContent=`ได้ยิน “${text}” แต่ยังแปลงเป็นตัวเลขไม่ได้`;
      return false;
    }
    const target=[...document.querySelectorAll('.answer-orb:not(:disabled)')].find(b=>Number(b.textContent)===value);
    if(target){ target.click(); return true; }
    if(message) message.textContent=`คำตอบ ${value} ไม่อยู่ในตัวเลือก กรุณาลองใหม่`;
    return false;
  }

  const buttons=[...document.querySelectorAll('.answer:not(:disabled)')];
  if(!buttons.length){
    if(message) message.textContent=isStory?'กรุณารอจนเข้าสู่คำถามก่อน':'กรุณากดเริ่มเกมก่อน';
    return false;
  }
  const heard=normalize(text);
  const target=buttons.find(b=>{
    const answer=normalize(b.dataset.answer || b.textContent);
    return heard===answer || heard.includes(answer) || answer.includes(heard);
  });
  if(target){ target.click(); return true; }
  if(message) message.textContent=`ได้ยิน “${text}” แต่ไม่ตรงกับตัวเลือก กรุณาลองใหม่`;
  return false;
}

function showDictation(){
  const sheet=createSheet();
  const input=sheet.querySelector('.free-voice-input');
  const submit=sheet.querySelector('.free-voice-submit');
  const help=sheet.querySelector('.free-voice-help');
  help.textContent=isIOS
    ? 'แตะช่องคำตอบ แล้วแตะปุ่ม 🎤 Dictation บนคีย์บอร์ด iPhone/iPad จากนั้นพูดคำตอบ และกด “ใช้คำตอบนี้”'
    : 'พูดด้วยระบบ Dictation ของคีย์บอร์ด หรือพิมพ์คำตอบ แล้วกด “ใช้คำตอบนี้”';
  input.value='';
  input.inputMode=isMath?'numeric':'text';
  input.placeholder=isMath?'เช่น 24 / twenty four':'พูดหรือพิมพ์คำตอบ';
  sheet.hidden=false;
  const finish=()=>{
    const value=input.value.trim();
    if(!value) return;
    if(applySpokenText(value)) sheet.hidden=true;
  };
  submit.onclick=finish;
  input.onkeydown=e=>{if(e.key==='Enter')finish();};
  setTimeout(()=>input.focus(),80);
}

function speechErrorMessage(code){
  const c=String(code||'').toLowerCase();
  if(c==='service-not-allowed') return 'Safari อนุญาตไมค์แล้ว แต่บริการ Speech Recognition ปฏิเสธการใช้งาน จึงเปิด Dictation สำรองให้แทน';
  if(c==='not-allowed') return 'Safari ยังไม่อนุญาตไมโครโฟนสำหรับหน้าเว็บนี้';
  if(c==='no-speech') return 'ไม่ได้ยินเสียง กรุณาลองพูดใหม่';
  if(c==='audio-capture') return 'ไม่พบไมโครโฟนหรือไมโครโฟนกำลังถูกใช้งาน';
  return 'ระบบถอดเสียงของเบราว์เซอร์ไม่พร้อม จึงเปิด Dictation สำรองให้แทน';
}

function language(){
  if(isMath) return document.getElementById('questionLanguage')?.value==='en'?'en-US':'th-TH';
  return 'en-US';
}

function startWebSpeech(){
  const {button,status,message}=statusElements();
  if(!SpeechRecognitionCtor){ showDictation(); return; }

  const recognition=new SpeechRecognitionCtor();
  recognition.lang=language();
  recognition.continuous=false;
  recognition.interimResults=false;
  recognition.maxAlternatives=5;

  recognition.onstart=()=>{
    if(button){button.textContent='🎤 กำลังฟัง...';button.classList.add('listening');}
    if(status)status.textContent='🎤 เสียง: กำลังฟัง';
  };
  recognition.onresult=e=>{
    const texts=[...e.results[0]].map(x=>x.transcript).filter(Boolean);
    const matched=texts.find(t=>applySpokenText(t));
    if(!matched && texts[0]) applySpokenText(texts[0]);
  };
  recognition.onerror=e=>{
    const msg=speechErrorMessage(e.error);
    if(status)status.textContent=`🎤 ${msg}`;
    if(message)message.textContent=msg;
    setTimeout(showDictation,180);
  };
  recognition.onend=()=>{
    if(button){button.textContent=isAnimal?'🎤 พูดชื่อสัตว์':'🎤 ตอบด้วยเสียง';button.classList.remove('listening');}
  };

  try{
    // Must be called directly from the user click on iOS Safari.
    recognition.start();
  }catch(_){
    showDictation();
  }
}

function bind(){
  const {button,status,message}=statusElements();
  if(!button) return;
  button.disabled=false;
  button.style.pointerEvents='auto';
  if(status) status.textContent='🎤 เสียง: พร้อม';
  button.addEventListener('click',e=>{
    e.preventDefault();
    e.stopImmediatePropagation();
    if(isStory && !document.querySelector('.answer:not(:disabled)')){
      if(message)message.textContent='กรุณารอจนเข้าสู่คำถามก่อน';
      return;
    }
    startWebSpeech();
  },true);
}

document.addEventListener('DOMContentLoaded',bind,{once:true});
if(document.readyState!=='loading') bind();

window.GameVoiceFree={applySpokenText,showDictation};
})();

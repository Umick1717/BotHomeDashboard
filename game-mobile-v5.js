(() => {
'use strict';

const path = location.pathname.toLowerCase();
const isMath = path.includes('multiplication-game');
const isAnimal = path.includes('animal-game');
const isStory = path.includes('story-game');
const Voice = window.MobileVoiceFixV2;

if (isMath) document.body.classList.add('game-multiplication');
if (isAnimal) document.body.classList.add('game-animal');
if (isStory) document.body.classList.add('game-story');

function normalize(text){
  return String(text||'').toLowerCase().replace(/[.,!?"'’]/g,'').replace(/\s+/g,' ').trim();
}

function parseNumber(text){
  const raw=String(text||'').toLowerCase();
  const digit=raw.match(/\d{1,3}/);if(digit)return Number(digit[0]);
  const ones={zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19};
  const tens={twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90};
  const parts=raw.replace(/[^a-z\s-]/g,' ').split(/[\s-]+/).filter(Boolean);let total=0,ok=false;
  parts.forEach(p=>{if(p in ones){total+=ones[p];ok=true;}else if(p in tens){total+=tens[p];ok=true;}});if(ok)return total;
  const th={'ศูนย์':0,'หนึ่ง':1,'เอ็ด':1,'สอง':2,'ยี่':2,'สาม':3,'สี่':4,'ห้า':5,'หก':6,'เจ็ด':7,'แปด':8,'เก้า':9};
  let s=raw.replace(/\s+/g,'');total=0;ok=false;
  const h=s.match(/(หนึ่ง|สอง|สาม|สี่|ห้า|หก|เจ็ด|แปด|เก้า)ร้อย/);if(h){total+=th[h[1]]*100;s=s.replace(h[0],'');ok=true;}
  const t=s.match(/(ยี่สิบ|สิบ|หนึ่งสิบ|สองสิบ|สามสิบ|สี่สิบ|ห้าสิบ|หกสิบ|เจ็ดสิบ|แปดสิบ|เก้าสิบ)/);
  if(t){const x=t[1];if(x==='สิบ'||x==='หนึ่งสิบ')total+=10;else if(x==='ยี่สิบ'||x==='สองสิบ')total+=20;else total+=(th[x.replace('สิบ','')]||0)*10;s=s.replace(x,'');ok=true;}
  for(const key of Object.keys(th).sort((a,b)=>b.length-a.length)){if(s.includes(key)){total+=th[key];ok=true;break;}}
  return ok?total:null;
}

function showFallback(config){
  Voice?.showDictationFallback(config);
}

function showSpeechError(code,status,message,fallbackConfig){
  const help=Voice?.speechServiceHelp(code)||`Speech Recognition: ${code}`;
  if(status)status.textContent=`🎤 ${help}`;
  if(message)message.textContent=help;
  if((code==='service-not-allowed'||code==='not-allowed'||!Voice?.SpeechRecognitionCtor)&&fallbackConfig){
    setTimeout(()=>showFallback({...fallbackConfig,help}),120);
  }
}

function makeRecognition(lang,button,status,message,onTranscript,fallbackConfig){
  if(!Voice?.SpeechRecognitionCtor)return null;
  return Voice.createRecognition(lang,{
    start:()=>{button?.classList.add('listening');if(button)button.textContent='🎤 กำลังฟัง...';if(status)status.textContent='🎤 เสียง: กำลังฟัง';},
    end:()=>{button?.classList.remove('listening');if(button)button.textContent=button.dataset.voiceLabel||'🎤 ตอบด้วยเสียง';},
    error:e=>{button?.classList.remove('listening');if(button)button.textContent=button.dataset.voiceLabel||'🎤 ตอบด้วยเสียง';showSpeechError(e.error,status,message,fallbackConfig);},
    result:e=>{const heard=[...e.results[0]].map(x=>x.transcript);onTranscript(heard);}
  });
}

function startVoice(recognition,status,message,fallbackConfig){
  if(Voice?.isInAppBrowser){showSpeechError('service-not-allowed',status,message,fallbackConfig);return;}
  if(!recognition){showFallback({...fallbackConfig,help:'เบราว์เซอร์นี้ไม่มี Web Speech Recognition ใช้ Dictation ของคีย์บอร์ดแทนได้'});return;}
  try{
    // Must stay inside the click event on iOS Safari.
    Voice.startRecognitionNow(recognition);
  }catch(error){
    showSpeechError(error.code||error.name,status,message,fallbackConfig);
  }
}

if(isMath){
  const voice=document.getElementById('voiceButton');
  const status=document.getElementById('voiceStatus');
  const message=document.getElementById('message');
  const language=document.getElementById('questionLanguage');
  voice.dataset.voiceLabel='🎤 ตอบด้วยเสียง';
  let rec=null;

  function submitMath(text){
    const value=parseNumber(text);
    if(!Number.isFinite(value)){message.textContent=`ได้ยิน/กรอก “${text}” แต่ยังอ่านเป็นตัวเลขไม่ได้`;return;}
    const target=[...document.querySelectorAll('.answer-orb:not(:disabled)')].find(b=>Number(b.textContent)===value);
    if(target)target.click();else message.textContent=`คำตอบ ${value} ไม่อยู่ในตัวเลือก`;
  }
  function fallback(){return{title:'ตอบโจทย์สูตรคูณ',placeholder:'เช่น 24 / twenty four / ยี่สิบสี่',inputMode:'text',onSubmit:submitMath};}
  function setup(){try{rec?.abort();}catch{}rec=makeRecognition(language?.value==='en'?'en-US':'th-TH',voice,status,message,heard=>submitMath(heard[0]),fallback());}
  setup();language?.addEventListener('change',setup);
  voice.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();startVoice(rec,status,message,fallback());},true);
}

if(isAnimal){
  const voice=document.getElementById('voiceButton');
  const status=document.getElementById('voiceStatus');
  const message=document.getElementById('message');
  voice.dataset.voiceLabel='🎤 พูดชื่อสัตว์';
  function submitAnimal(text){
    const heard=normalize(text);
    const buttons=[...document.querySelectorAll('.answer:not(:disabled)')];
    const target=buttons.find(b=>{const a=normalize(b.dataset.answer||b.textContent);return heard.includes(a)||a.includes(heard);});
    if(target)target.click();else message.textContent=`ได้ยิน/กรอก “${text}” กรุณาลองอีกครั้ง`;
  }
  const fallback=()=>({title:'พูดชื่อสัตว์',placeholder:'เช่น elephant',inputMode:'text',onSubmit:submitAnimal});
  const rec=makeRecognition('en-US',voice,status,message,heard=>submitAnimal(heard[0]),fallback());
  voice.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();startVoice(rec,status,message,fallback());},true);
}

if(isStory){
  const voice=document.getElementById('voiceButton');
  const status=document.getElementById('voiceStatus');
  const message=document.getElementById('message');
  voice.dataset.voiceLabel='🎤 ตอบด้วยเสียง';
  function submitStory(text){
    const heard=normalize(text);
    const buttons=[...document.querySelectorAll('.answer:not(:disabled)')];
    if(!buttons.length){message.textContent='กรุณารอจนเข้าสู่คำถามก่อน';return;}
    const target=buttons.find(b=>{const a=normalize(b.dataset.answer||b.textContent);return heard.includes(a)||a.includes(heard);});
    if(target)target.click();else message.textContent=`ได้ยิน/กรอก “${text}” กรุณาลองอีกครั้ง`;
  }
  const fallback=()=>({title:'ตอบคำถาม Story Time',placeholder:'พูดหรือพิมพ์คำตอบภาษาอังกฤษ',inputMode:'text',onSubmit:submitStory});
  const rec=makeRecognition('en-US',voice,status,message,heard=>submitStory(heard[0]),fallback());
  voice.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();startVoice(rec,status,message,fallback());},true);
}

// Keep AR canvas aligned after Safari address bar/orientation changes.
const redraw=()=>window.dispatchEvent(new Event('resize'));
window.addEventListener('orientationchange',()=>setTimeout(redraw,250),{passive:true});
window.visualViewport?.addEventListener('resize',()=>setTimeout(redraw,60),{passive:true});
})();

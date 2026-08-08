(() => {
'use strict';

const path = location.pathname.toLowerCase();
const isMultiplication = path.includes('multiplication-game');
const isAnimal = path.includes('animal-game');
const isStory = path.includes('story-game');

if (isMultiplication) document.body.classList.add('game-multiplication');
if (isAnimal) document.body.classList.add('game-animal');
if (isStory) document.body.classList.add('game-story');

function addBrowserWarning(messageEl){
  if(!window.MobileVoiceFix?.isInAppBrowser) return;
  if(document.querySelector('.browser-warning')) return;
  const box = document.createElement('div');
  box.className = 'browser-warning';
  box.textContent = `⚠️ เปิดผ่าน ${MobileVoiceFix.browserName()} อยู่: Camera ใช้ได้ แต่ระบบตอบด้วยเสียงอาจถูกบล็อก กรุณาเปิดลิงก์นี้ด้วย ${MobileVoiceFix.preferredBrowser()} โดยตรงเพื่อใช้ Microphone`;
  const status = document.querySelector('.status-row');
  status?.insertAdjacentElement('afterend', box);
  if(messageEl) messageEl.textContent = MobileVoiceFix.voiceErrorMessage('service-not-allowed');
}

function createRecognition(lang, onResult, button, statusEl, messageEl){
  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!Ctor) return null;
  const r = new Ctor();
  r.lang = lang;
  r.continuous = false;
  r.interimResults = false;
  r.maxAlternatives = 5;
  r.onstart = () => {
    button?.classList.add('listening');
    if(button) button.textContent = '🎤 กำลังฟัง...';
    if(statusEl) statusEl.textContent = '🎤 เสียง: กำลังฟัง';
  };
  r.onend = () => {
    button?.classList.remove('listening');
    if(button) button.textContent = button.dataset.defaultLabel || '🎤 ตอบด้วยเสียง';
    if(statusEl && !MobileVoiceFix?.isInAppBrowser) statusEl.textContent = '🎤 เสียง: พร้อม';
  };
  r.onerror = e => {
    button?.classList.remove('listening');
    if(button) button.textContent = button.dataset.defaultLabel || '🎤 ตอบด้วยเสียง';
    const msg = window.MobileVoiceFix?.voiceErrorMessage(e.error) || `ไมโครโฟน: ${e.error}`;
    if(statusEl) statusEl.textContent = `🎤 ${msg}`;
    if(messageEl) messageEl.textContent = msg;
  };
  r.onresult = onResult;
  return r;
}

async function beginRecognition(recognition, button, statusEl, messageEl){
  if(window.MobileVoiceFix?.isInAppBrowser){
    const msg = MobileVoiceFix.voiceErrorMessage('service-not-allowed');
    if(statusEl) statusEl.textContent = `🎤 เปิดด้วย ${MobileVoiceFix.preferredBrowser()}`;
    if(messageEl) messageEl.textContent = msg;
    return;
  }
  try{
    if(button) button.disabled = true;
    if(statusEl) statusEl.textContent = '🎤 กำลังขอสิทธิ์ Microphone...';
    await MobileVoiceFix?.prepareMicrophone?.();
    if(!recognition) throw new Error('Speech Recognition ไม่รองรับในเบราว์เซอร์นี้');
    try{ recognition.abort(); }catch{}
    setTimeout(()=>{ try{ recognition.start(); }catch(err){ if(messageEl) messageEl.textContent = err.message; } },120);
  }catch(err){
    const msg = window.MobileVoiceFix?.voiceErrorMessage(err.code || err.name) || err.message;
    if(statusEl) statusEl.textContent = `🎤 ${msg}`;
    if(messageEl) messageEl.textContent = msg;
  }finally{
    if(button) button.disabled = false;
  }
}

function parseNumber(text){
  const t = String(text||'').toLowerCase().trim();
  const digit = t.match(/\d{1,3}/);
  if(digit) return Number(digit[0]);
  const enOnes={zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19};
  const enTens={twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90};
  const parts=t.replace(/[^a-z\s-]/g,' ').split(/[\s-]+/).filter(Boolean);
  let val=0,matched=false;
  for(const p of parts){ if(p in enOnes){val+=enOnes[p];matched=true;} else if(p in enTens){val+=enTens[p];matched=true;} }
  if(matched) return val;
  const th={'ศูนย์':0,'หนึ่ง':1,'เอ็ด':1,'สอง':2,'ยี่':2,'สาม':3,'สี่':4,'ห้า':5,'หก':6,'เจ็ด':7,'แปด':8,'เก้า':9};
  const compact=t.replace(/\s+/g,'');
  let total=0,ok=false,remaining=compact;
  const h=remaining.match(/(หนึ่ง|สอง|สาม|สี่|ห้า|หก|เจ็ด|แปด|เก้า)ร้อย/);
  if(h){total+=th[h[1]]*100;remaining=remaining.replace(h[0],'');ok=true;}
  const ten=remaining.match(/(ยี่สิบ|สิบ|หนึ่งสิบ|สองสิบ|สามสิบ|สี่สิบ|ห้าสิบ|หกสิบ|เจ็ดสิบ|แปดสิบ|เก้าสิบ)/);
  if(ten){const x=ten[1];if(x==='สิบ'||x==='หนึ่งสิบ')total+=10;else if(x==='ยี่สิบ'||x==='สองสิบ')total+=20;else total+=(th[x.replace('สิบ','')]||0)*10;remaining=remaining.replace(x,'');ok=true;}
  for(const key of Object.keys(th).sort((a,b)=>b.length-a.length)){if(remaining.includes(key)){total+=th[key];ok=true;break;}}
  return ok?total:null;
}

if(isMultiplication){
  const controls=document.querySelector('.controls');
  const level=document.getElementById('level');
  const voice=document.getElementById('voiceButton');
  const voiceStatus=document.getElementById('voiceStatus');
  const message=document.getElementById('message');
  const question=document.getElementById('question');
  voice.dataset.defaultLabel='🎤 ตอบด้วยเสียง';

  let language=document.getElementById('questionLanguage');
  if(!language){
    const label=document.createElement('label');
    label.innerHTML='ภาษา / Language<select id="questionLanguage"><option value="th">ไทย</option><option value="en">English</option></select>';
    level?.closest('label')?.insertAdjacentElement('afterend',label);
    language=label.querySelector('select');
  }

  addBrowserWarning(message);
  MobileVoiceFix?.decorateVoiceUi?.(voice,voiceStatus,message);

  if(typeof window.speak==='function'){
    window.speak=(text,rate=.72)=>{
      if(!('speechSynthesis' in window)) return;
      speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance(text);
      const english=language?.value==='en';
      u.lang=english?'en-US':'th-TH';
      u.rate=rate;
      speechSynthesis.speak(u);
    };
  }

  let lastQuestion='';
  const observer=new MutationObserver(()=>{
    const txt=question?.textContent?.trim();
    if(!txt||txt===lastQuestion||!txt.includes('×')) return;
    lastQuestion=txt;
    const m=txt.match(/(\d+)\s*×\s*(\d+)/);
    if(!m) return;
    const [_,a,b]=m;
    setTimeout(()=>{
      speechSynthesis?.cancel();
      const english=language?.value==='en';
      const u=new SpeechSynthesisUtterance(english?`${a} times ${b}. What is the answer?`:`${a} คูณ ${b} เท่ากับเท่าไร`);
      u.lang=english?'en-US':'th-TH';
      u.rate=.68;
      speechSynthesis?.speak(u);
    },30);
  });
  if(question) observer.observe(question,{childList:true,characterData:true,subtree:true});

  function makeMathRecognition(){
    const lang=language?.value==='en'?'en-US':'th-TH';
    return createRecognition(lang,e=>{
      const heard=[...e.results[0]].map(x=>x.transcript);
      const selected=heard.map(parseNumber).find(Number.isFinite);
      if(!Number.isFinite(selected)){message.textContent=`ได้ยิน: “${heard[0]}” แต่ยังอ่านเป็นตัวเลขไม่ได้`;return;}
      const orb=[...document.querySelectorAll('.answer-orb:not(:disabled)')].find(x=>Number(x.textContent)===selected);
      if(typeof window.selectAnswer==='function') window.selectAnswer(orb,selected); else orb?.click();
    },voice,voiceStatus,message);
  }
  let rec=makeMathRecognition();
  language?.addEventListener('change',()=>{try{rec?.abort();}catch{} rec=makeMathRecognition();});
  voice?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();beginRecognition(rec,voice,voiceStatus,message);},true);
}

if(isAnimal){
  const voice=document.getElementById('voiceButton');
  const voiceStatus=document.getElementById('voiceStatus');
  const message=document.getElementById('message');
  voice.dataset.defaultLabel='🎤 พูดชื่อสัตว์';
  addBrowserWarning(message);
  MobileVoiceFix?.decorateVoiceUi?.(voice,voiceStatus,message);
  const rec=createRecognition('en-US',e=>{
    const heard=[...e.results[0]].map(x=>x.transcript.toLowerCase().trim());
    const buttons=[...document.querySelectorAll('.answer:not(:disabled)')];
    const target=buttons.find(b=>heard.some(t=>t.includes(b.dataset.answer?.toLowerCase())||b.dataset.answer?.toLowerCase().includes(t)));
    if(target) target.click(); else message.textContent=`ได้ยิน: “${heard[0]}” กรุณาลองอีกครั้ง`;
  },voice,voiceStatus,message);
  voice?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();beginRecognition(rec,voice,voiceStatus,message);},true);
}

if(isStory){
  const voice=document.getElementById('voiceButton');
  const voiceStatus=document.getElementById('voiceStatus');
  const message=document.getElementById('message');
  voice.dataset.defaultLabel='🎤 ตอบด้วยเสียง';
  addBrowserWarning(message);
  MobileVoiceFix?.decorateVoiceUi?.(voice,voiceStatus,message);
}
})();

(() => {
'use strict';

const path = location.pathname.toLowerCase();
const isMath = path.includes('multiplication-game');
const isAnimal = path.includes('animal-game');
const isStory = path.includes('story-game');

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

function bestMimeType(){
  const candidates=['audio/mp4','audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus'];
  return candidates.find(type=>window.MediaRecorder?.isTypeSupported?.(type)) || '';
}

function blobToBase64(blob){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>resolve(String(reader.result).split(',')[1]||'');
    reader.onerror=reject;
    reader.readAsDataURL(blob);
  });
}

async function recordAndTranscribe(language,onStatus){
  if(!navigator.mediaDevices?.getUserMedia) throw new Error('เบราว์เซอร์นี้ไม่รองรับ Microphone');
  if(!window.MediaRecorder) throw new Error('เบราว์เซอร์นี้ไม่รองรับการอัดเสียง');

  onStatus?.('🎤 กำลังเปิดไมโครโฟน...');
  const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:false});
  const mimeType=bestMimeType();
  const chunks=[];
  const recorder=mimeType?new MediaRecorder(stream,{mimeType}):new MediaRecorder(stream);
  recorder.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data);};

  const stopped=new Promise((resolve,reject)=>{
    recorder.onstop=resolve;
    recorder.onerror=e=>reject(e.error||new Error('อัดเสียงไม่สำเร็จ'));
  });

  recorder.start(250);
  onStatus?.('🔴 กำลังฟัง... พูดคำตอบได้เลย');
  await new Promise(resolve=>setTimeout(resolve,3600));
  if(recorder.state!=='inactive')recorder.stop();
  await stopped;
  stream.getTracks().forEach(t=>t.stop());

  const blob=new Blob(chunks,{type:recorder.mimeType||mimeType||'audio/webm'});
  if(blob.size<500)throw new Error('ไม่ได้รับเสียง กรุณาพูดใหม่');
  onStatus?.('⏳ กำลังตรวจคำตอบ...');
  const audioBase64=await blobToBase64(blob);

  const response=await fetch('/api/transcribe',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({audioBase64,mimeType:blob.type,language})
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok){
    if(data?.error==='STT_NOT_CONFIGURED')throw new Error('ระบบไมค์พร้อมแล้ว แต่ Vercel ยังไม่ได้ตั้ง OPENAI_API_KEY สำหรับถอดเสียง');
    throw new Error(data?.message||data?.error||'ถอดเสียงไม่สำเร็จ');
  }
  const text=String(data.text||'').trim();
  if(!text)throw new Error('ไม่ได้ยินคำตอบ กรุณาลองใหม่');
  return text;
}

function bindRecorder(button,{language,status,message,onText}){
  if(!button)return;
  button.disabled=false;
  const normalLabel=button.textContent;
  button.addEventListener('click',async event=>{
    event.preventDefault();event.stopImmediatePropagation();
    if(button.dataset.recording==='1')return;
    button.dataset.recording='1';button.disabled=true;
    try{
      const text=await recordAndTranscribe(typeof language==='function'?language():language||'en',text=>{
        if(status)status.textContent=text;
        button.textContent=text.startsWith('🔴')?'🔴 กำลังฟัง...':'🎤 กำลังทำงาน...';
      });
      if(status)status.textContent=`🎤 ได้ยิน: ${text}`;
      if(message)message.textContent=`ได้ยิน: “${text}”`;
      onText(text);
    }catch(error){
      if(status)status.textContent=`🎤 ${error.message}`;
      if(message)message.textContent=error.message;
    }finally{
      button.dataset.recording='0';button.disabled=false;button.textContent=normalLabel;
    }
  },true);
}

if(isMath){
  const voice=document.getElementById('voiceButton');
  const status=document.getElementById('voiceStatus');
  const message=document.getElementById('message');
  const language=document.getElementById('questionLanguage');
  const question=document.getElementById('question');

  language.disabled=false;
  language.style.pointerEvents='auto';
  language.addEventListener('change',()=>{
    message.textContent=language.value==='en'?'English question mode selected.':'เลือกโหมดคำถามภาษาไทยแล้ว';
    const m=question.textContent.match(/(\d+)\s*×\s*(\d+)/);
    if(m){
      speechSynthesis?.cancel();
      const u=new SpeechSynthesisUtterance(language.value==='en'?`${m[1]} times ${m[2]}. What is the answer?`:`${m[1]} คูณ ${m[2]} เท่ากับเท่าไร`);
      u.lang=language.value==='en'?'en-US':'th-TH';u.rate=.68;speechSynthesis?.speak(u);
    }
  });

  let lastQuestion='';
  new MutationObserver(()=>{
    const text=question.textContent.trim();
    if(!text||text===lastQuestion||!text.includes('×'))return;
    lastQuestion=text;
    const m=text.match(/(\d+)\s*×\s*(\d+)/);if(!m)return;
    setTimeout(()=>{
      speechSynthesis?.cancel();
      const english=language.value==='en';
      const u=new SpeechSynthesisUtterance(english?`${m[1]} times ${m[2]}. What is the answer?`:`${m[1]} คูณ ${m[2]} เท่ากับเท่าไร`);
      u.lang=english?'en-US':'th-TH';u.rate=.68;speechSynthesis?.speak(u);
    },80);
  }).observe(question,{childList:true,subtree:true,characterData:true});

  bindRecorder(voice,{language:()=>language.value==='en'?'en':'th',status,message,onText:text=>{
    const value=parseNumber(text);
    if(!Number.isFinite(value)){message.textContent=`ได้ยิน “${text}” แต่ยังแปลงเป็นตัวเลขไม่ได้`;return;}
    const target=[...document.querySelectorAll('.answer-orb:not(:disabled)')].find(b=>Number(b.textContent)===value);
    if(target)target.click();else message.textContent=`คำตอบ ${value} ไม่อยู่ในตัวเลือก กรุณาลองใหม่`;
  }});
}

if(isAnimal){
  const voice=document.getElementById('voiceButton');
  const status=document.getElementById('voiceStatus');
  const message=document.getElementById('message');
  bindRecorder(voice,{language:'en',status,message,onText:text=>{
    const heard=normalize(text);const buttons=[...document.querySelectorAll('.answer:not(:disabled)')];
    const target=buttons.find(b=>{const a=normalize(b.dataset.answer||b.textContent);return heard.includes(a)||a.includes(heard);});
    if(target)target.click();else message.textContent=`ได้ยิน “${text}” แต่ไม่ตรงกับตัวเลือก กรุณาลองใหม่`;
  }});
}

if(isStory){
  const voice=document.getElementById('voiceButton');
  const status=document.getElementById('voiceStatus');
  const message=document.getElementById('message');
  bindRecorder(voice,{language:'en',status,message,onText:text=>{
    const buttons=[...document.querySelectorAll('.answer:not(:disabled)')];
    if(!buttons.length){message.textContent='กรุณารอจนเข้าสู่คำถามก่อน';return;}
    const heard=normalize(text);const target=buttons.find(b=>{const a=normalize(b.dataset.answer||b.textContent);return heard.includes(a)||a.includes(heard);});
    if(target)target.click();else message.textContent=`ได้ยิน “${text}” แต่ไม่ตรงกับตัวเลือก กรุณาลองใหม่`;
  }});
}
})();

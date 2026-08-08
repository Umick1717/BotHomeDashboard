(() => {
  'use strict';
  const ua = navigator.userAgent || '';
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  const isLine = /Line\//i.test(ua) || /\bLINE\b/i.test(ua);
  const isFacebook = /FBAN|FBAV/i.test(ua);
  const isInstagram = /Instagram/i.test(ua);
  const isInAppBrowser = isLine || isFacebook || isInstagram;

  function preferredBrowser(){ return isIOS ? 'Safari' : 'Chrome'; }
  function browserName(){ if(isLine) return 'LINE'; if(isFacebook) return 'Facebook'; if(isInstagram) return 'Instagram'; return 'In-App Browser'; }

  function voiceErrorMessage(code=''){
    code = String(code || '').toLowerCase();
    if(isInAppBrowser || code === 'service-not-allowed'){
      return `ระบบตอบด้วยเสียงไม่ทำงานภายใน ${isInAppBrowser ? browserName() : 'เบราว์เซอร์นี้'} กรุณาเปิดหน้าเว็บด้วย ${preferredBrowser()} โดยตรง แล้วอนุญาต Microphone`;
    }
    if(code === 'not-allowed' || code === 'permission-denied') return 'กรุณาอนุญาต Microphone ให้เว็บไซต์ใน Settings ของเบราว์เซอร์ แล้วลองใหม่';
    if(code === 'audio-capture') return 'ไม่พบไมโครโฟน หรือไมโครโฟนกำลังถูกแอปอื่นใช้งาน';
    if(code === 'network') return 'ระบบรู้จำเสียงต้องใช้อินเทอร์เน็ต กรุณาตรวจสอบการเชื่อมต่อ';
    if(code === 'no-speech') return 'ยังไม่ได้ยินเสียง กรุณาพูดใกล้ไมโครโฟนแล้วลองใหม่';
    return 'ระบบรู้จำเสียงยังไม่พร้อม กรุณาลองใหม่ หรือแตะคำตอบแทน';
  }

  async function prepareMicrophone(){
    if(isInAppBrowser){
      const err = new Error(voiceErrorMessage('service-not-allowed'));
      err.code = 'service-not-allowed';
      throw err;
    }
    if(!navigator.mediaDevices?.getUserMedia){
      const err = new Error('เบราว์เซอร์นี้ไม่รองรับ Microphone API');
      err.code = 'unsupported';
      throw err;
    }
    const stream = await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:false});
    stream.getTracks().forEach(t=>t.stop());
  }

  function decorateVoiceUi(button,status,message){
    if(!isInAppBrowser) return;
    if(status) status.textContent = `🎤 เปิดด้วย ${preferredBrowser()}`;
    if(button){
      button.classList.add('voice-limited');
      button.title = voiceErrorMessage('service-not-allowed');
    }
    if(message) message.textContent = voiceErrorMessage('service-not-allowed');
  }

  window.MobileVoiceFix = {isIOS,isAndroid,isLine,isInAppBrowser,preferredBrowser,browserName,voiceErrorMessage,prepareMicrophone,decorateVoiceUi};
})();

(() => {
'use strict';
const select=document.getElementById('questionLanguage');
const th=document.getElementById('langThaiButton');
const en=document.getElementById('langEnglishButton');
if(!select||!th||!en)return;

function sync(){
  const value=select.value==='en'?'en':'th';
  document.body.dataset.questionLanguage=value;
  th.classList.toggle('active',value==='th');
  en.classList.toggle('active',value==='en');
  th.setAttribute('aria-pressed',String(value==='th'));
  en.setAttribute('aria-pressed',String(value==='en'));
}
function choose(value){
  select.value=value;
  sync();
  select.dispatchEvent(new Event('change',{bubbles:true}));
}
th.addEventListener('click',()=>choose('th'));
en.addEventListener('click',()=>choose('en'));
select.addEventListener('change',sync);
sync();
})();

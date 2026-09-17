(function(){
 const mount=document.getElementById('mickInvestmentWidget');
 if(!mount)return;
 const fmt=()=>new Intl.DateTimeFormat('th-TH',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Bangkok'}).format(new Date());
 mount.innerHTML=`
  <section class="mick-investment-home">
   <div class="mick-investment-head">
    <div><div class="eyebrow">MICK INVESTMENT</div><h2>Global & Thailand Market</h2><p>Market snapshot • อัปเดต ${fmt()}</p></div>
    <a class="mick-investment-open" href="mick-investment.html">📈 เปิด Mick Investment</a>
   </div>
   <div class="mick-market-grid">
    <div class="mick-market-card"><span>USD/THB</span><strong id="homeFx">33.278</strong></div>
    <div class="mick-market-card positive"><span>USA Real Interest Rate</span><strong>+0.475%</strong></div>
    <div class="mick-market-card"><span>Thailand Inflation Rate</span><strong>2.53%</strong></div>
    <div class="mick-market-card negative"><span>Thailand Real Interest Rate</span><strong>-1.03%</strong></div>
   </div>
  </section>`;
 fetch('https://api.frankfurter.app/latest?from=USD&to=THB',{cache:'no-store'})
  .then(r=>r.json()).then(j=>{const n=Number(j?.rates?.THB);if(Number.isFinite(n)){const el=document.getElementById('homeFx');if(el)el.textContent=n.toFixed(3)}})
  .catch(()=>{});
})();
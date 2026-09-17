(function(){
 const mount=document.getElementById('mickInvestmentWidget'); if(!mount)return;
 const fmt=()=>new Intl.DateTimeFormat('th-TH',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Bangkok'}).format(new Date());
 mount.innerHTML=`<section class="mick-investment-home">
 <div class="mick-investment-head"><div><div class="mick-kicker">SNOW MALTON GATES 36 • MICK INVESTMENT</div><h2>Market Intelligence</h2><p>GLOBAL MARKET + THAILAND MARKET • ตรวจล่าสุด <span id="mickHomeUpdated">${fmt()}</span></p></div><a class="mick-investment-open" href="mick-investment.html?v=23">📈 เปิด Investment Dashboard</a></div>
 <div class="mick-market-sections">
  <article class="mick-market-panel"><div class="mick-panel-title"><span>🌐</span><div><small>GLOBAL MARKET</small><h3>USD/THB & United States</h3></div></div><div class="mick-market-grid">
   <div class="mick-market-card"><span>USD / THB</span><strong id="homeFx">—</strong><small id="homeFxTime">กำลังอัปเดต...</small></div>
   <div class="mick-market-card"><span>US 2Y Treasury</span><strong>4.74%</strong><small>Reference 16/09/2026</small></div>
   <div class="mick-market-card"><span>US 10Y Treasury</span><strong>5.01%</strong><small>Reference 16/09/2026</small></div>
   <div class="mick-market-card positive"><span>USA Real Interest</span><strong>+0.475%</strong><small>3.875% − 3.40%</small></div>
  </div></article>
  <article class="mick-market-panel"><div class="mick-panel-title"><span>🇹🇭</span><div><small>THAILAND MARKET</small><h3>Thailand Macro Indicators</h3></div></div><div class="mick-market-grid">
   <div class="mick-market-card"><span>Inflation Rate</span><strong>2.53%</strong><small>Dashboard reference</small></div>
   <div class="mick-market-card"><span>Nominal Interest</span><strong>1.50%</strong><small>Dashboard reference</small></div>
   <div class="mick-market-card negative"><span>Real Interest</span><strong>-1.03%</strong><small>1.50% − 2.53%</small></div>
   <div class="mick-market-card"><span>Active Bond Portfolio</span><strong>฿3.50M</strong><small>Current active principal</small></div>
  </div></article>
 </div></section>`;
 fetch('https://api.frankfurter.app/latest?from=USD&to=THB',{cache:'no-store'}).then(r=>r.json()).then(j=>{const n=Number(j?.rates?.THB);if(Number.isFinite(n)){homeFx.textContent=n.toFixed(3);homeFxTime.textContent=`Reference ${j.date} • ${fmt()}`}}).catch(()=>{homeFx.textContent='33.278';homeFxTime.textContent='Fallback reference • '+fmt()});
})();
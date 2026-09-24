(function(){
 const mount=document.getElementById('mickInvestmentWidget'); if(!mount)return;
 if(location.hash==='#expense'){ mount.replaceChildren(); mount.hidden=true; return; }
 mount.hidden=false;
 const fmt=()=>new Intl.DateTimeFormat('th-TH',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Bangkok'}).format(new Date());
 const usaFlag=`<span class="mick-country-flag mick-flag-us" role="img" aria-label="ธงชาติสหรัฐอเมริกา"><svg viewBox="0 0 741 390" aria-hidden="true"><rect width="741" height="390" fill="#fff"/><g fill="#b22234"><rect width="741" height="30"/><rect y="60" width="741" height="30"/><rect y="120" width="741" height="30"/><rect y="180" width="741" height="30"/><rect y="240" width="741" height="30"/><rect y="300" width="741" height="30"/><rect y="360" width="741" height="30"/></g><rect width="296.4" height="210" fill="#3c3b6e"/><g fill="#fff" font-size="28" font-family="Arial,sans-serif"><text x="18" y="32">★ ★ ★ ★ ★ ★</text><text x="42" y="62">★ ★ ★ ★ ★</text><text x="18" y="92">★ ★ ★ ★ ★ ★</text><text x="42" y="122">★ ★ ★ ★ ★</text><text x="18" y="152">★ ★ ★ ★ ★ ★</text><text x="42" y="182">★ ★ ★ ★ ★</text></g></svg></span>`;
 const thaiFlag=`<span class="mick-country-flag mick-flag-th" role="img" aria-label="ธงชาติไทย"><svg viewBox="0 0 900 600" aria-hidden="true"><rect width="900" height="600" fill="#a51931"/><rect y="100" width="900" height="400" fill="#fff"/><rect y="200" width="900" height="200" fill="#2d2a4a"/></svg></span>`;
 mount.innerHTML=`<section class="mick-investment-home">
 <div class="mick-investment-head"><div><div class="mick-kicker">SNOW MALTON GATES 36 • MICK INVESTMENT</div><h2>Market Intelligence</h2><p>GLOBAL MARKET + THAILAND MARKET • ตรวจล่าสุด <span id="mickHomeUpdated">${fmt()}</span></p></div><a class="mick-investment-open" href="mick-investment.html?v=26">📈 เปิด Investment Dashboard</a></div>
 <div class="mick-market-sections">
  <article class="mick-market-panel"><div class="mick-panel-title">${usaFlag}<div><small>GLOBAL MARKET</small><h3>USD/THB & United States</h3></div></div><div class="mick-market-grid">
   <div class="mick-market-card"><span>USD / THB</span><strong id="homeFx">—</strong><small id="homeFxTime">กำลังอัปเดต...</small></div>
   <div class="mick-market-card"><span>US 2Y Treasury</span><strong>4.74%</strong><small>Reference 16/09/2026</small></div>
   <div class="mick-market-card"><span>US 10Y Treasury</span><strong>5.01%</strong><small>Reference 16/09/2026</small></div>
   <div class="mick-market-card positive"><span>USA Real Interest</span><strong>+0.475%</strong><small>3.875% − 3.40%</small></div>
  </div></article>
  <article class="mick-market-panel"><div class="mick-panel-title">${thaiFlag}<div><small>THAILAND MARKET</small><h3>Thailand Macro Indicators</h3></div></div><div class="mick-market-grid">
   <div class="mick-market-card"><span>Inflation Rate</span><strong>2.53%</strong><small>Dashboard reference</small></div>
   <div class="mick-market-card"><span>Nominal Interest</span><strong>1.50%</strong><small>Dashboard reference</small></div>
   <div class="mick-market-card negative"><span>Real Interest</span><strong>-1.03%</strong><small>1.50% − 2.53%</small></div>
   <div class="mick-market-card"><span>Active Bond Portfolio</span><strong>฿3.50M</strong><small>Current active principal</small></div>
  </div></article>
 </div></section>`;
 fetch('https://api.frankfurter.app/latest?from=USD&to=THB',{cache:'no-store'}).then(r=>r.json()).then(j=>{const n=Number(j?.rates?.THB);if(Number.isFinite(n)){homeFx.textContent=n.toFixed(3);homeFxTime.textContent=`Reference ${j.date} • ${fmt()}`}}).catch(()=>{homeFx.textContent='33.278';homeFxTime.textContent='Fallback reference • '+fmt()});
})();
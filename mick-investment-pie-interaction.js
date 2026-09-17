'use strict';
(() => {
  const charts = new Map();
  const palette = ['#28d9ff','#35e69c','#ffcc66','#a987ff','#ff7f86','#68a8ff'];
  const typeData = [
    {label:'Government Bond', value:28.6},
    {label:'Corporate Bond', value:71.4}
  ];
  const seriesData = [
    {label:'SBST276A', value:28.6},
    {label:'PTTGC296A', value:28.6},
    {label:'CPF308A', value:28.6},
    {label:'TBEV279A', value:14.3}
  ];

  function setup(canvasId, legendId, data){
    const canvas=document.getElementById(canvasId), legend=document.getElementById(legendId);
    if(!canvas||!legend)return;
    const state={canvas,legend,data,active:-1,pressed:false};
    charts.set(canvasId,state);
    canvas.classList.add('interactive-pie');
    canvas.setAttribute('role','img');
    canvas.setAttribute('tabindex','0');
    canvas.setAttribute('aria-label',data.map(d=>`${d.label} ${d.value.toFixed(1)}%`).join(', '));
    legend.innerHTML=data.map((d,i)=>`<button type="button" class="pie-legend-item" data-index="${i}" aria-label="${d.label} ${d.value.toFixed(1)}%"><i style="--pie-color:${palette[i]}"></i><span>${d.label}</span><b>${d.value.toFixed(1)}%</b></button>`).join('');
    legend.querySelectorAll('.pie-legend-item').forEach(btn=>{
      const i=Number(btn.dataset.index);
      btn.addEventListener('mouseenter',()=>select(state,i));
      btn.addEventListener('mouseleave',()=>select(state,-1));
      btn.addEventListener('focus',()=>select(state,i));
      btn.addEventListener('blur',()=>select(state,-1));
      btn.addEventListener('pointerdown',e=>{e.preventDefault();select(state,state.active===i?-1:i,true)});
    });
    canvas.addEventListener('pointermove',e=>{if(e.pointerType==='mouse')select(state,hitTest(state,e))});
    canvas.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')select(state,-1)});
    canvas.addEventListener('pointerdown',e=>{const i=hitTest(state,e);if(i>=0){e.preventDefault();select(state,state.active===i?-1:i,true)}});
    canvas.addEventListener('keydown',e=>{
      if(!['ArrowLeft','ArrowRight','Enter',' '].includes(e.key))return;
      e.preventDefault();
      if(e.key==='ArrowLeft')select(state,(state.active<=0?data.length:state.active)-1,true);
      else if(e.key==='ArrowRight')select(state,(state.active+1)%data.length,true);
      else select(state,state.active<0?0:state.active,true);
    });
    draw(state);
  }

  function select(state,index,pulse=false){
    state.active=index;
    state.legend.querySelectorAll('.pie-legend-item').forEach((el,i)=>el.classList.toggle('is-active',i===index));
    state.canvas.classList.toggle('is-reacting',index>=0);
    draw(state);
    if(pulse&&navigator.vibrate)navigator.vibrate(12);
  }

  function hitTest(state,e){
    const r=state.canvas.getBoundingClientRect(), x=(e.clientX-r.left)*state.canvas.width/r.width, y=(e.clientY-r.top)*state.canvas.height/r.height;
    const cx=state.canvas.width/2,cy=state.canvas.height/2,dx=x-cx,dy=y-cy,dist=Math.hypot(dx,dy),outer=155,inner=82;
    if(dist<inner||dist>outer+18)return -1;
    let angle=Math.atan2(dy,dx)+Math.PI/2;if(angle<0)angle+=Math.PI*2;
    let acc=0,total=state.data.reduce((s,d)=>s+d.value,0);
    for(let i=0;i<state.data.length;i++){acc+=state.data[i].value/total*Math.PI*2;if(angle<=acc)return i}return -1;
  }

  function draw(state){
    const {canvas,data,active}=state,ctx=canvas.getContext('2d'),cx=canvas.width/2,cy=canvas.height/2,total=data.reduce((s,d)=>s+d.value,0);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    let start=-Math.PI/2;
    data.forEach((d,i)=>{
      const arc=d.value/total*Math.PI*2,end=start+arc,mid=(start+end)/2,explode=i===active?10:0,ox=Math.cos(mid)*explode,oy=Math.sin(mid)*explode,outer=i===active?164:155;
      ctx.save();ctx.translate(ox,oy);ctx.beginPath();ctx.arc(cx,cy,outer,start,end);ctx.arc(cx,cy,82,end,start,true);ctx.closePath();ctx.fillStyle=palette[i%palette.length];
      if(i===active){ctx.shadowColor=palette[i%palette.length];ctx.shadowBlur=24}ctx.fill();ctx.restore();start=end;
    });
    ctx.beginPath();ctx.arc(cx,cy,77,0,Math.PI*2);ctx.fillStyle='#081725';ctx.fill();ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff';
    if(active>=0){ctx.font='700 17px Segoe UI, sans-serif';ctx.fillText(data[active].label,cx,cy-12);ctx.font='900 26px Segoe UI, sans-serif';ctx.fillText(`${data[active].value.toFixed(1)}%`,cx,cy+18)}
    else{ctx.font='900 22px Segoe UI, sans-serif';ctx.fillText('100%',cx,cy)}
  }

  function init(){setup('typeChart','typeLegend',typeData);setup('seriesChart','seriesLegend',seriesData)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,0));else setTimeout(init,0);
})();
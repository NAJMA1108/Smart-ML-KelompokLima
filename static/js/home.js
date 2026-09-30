/* ========== JS: HOME ========== */
document.getElementById('pipeline').innerHTML = PIPELINE.map((s,i)=>
  `<div class="card step"><div class="mono">Stage ${i+1}</div><h3 style="margin:6px 0">${s.t}</h3><p style="color:var(--muted);font-size:.88rem">${s.d}</p></div>`).join('');

const series=[]; 
setInterval(()=>{
  const v=0.28+Math.sin(Date.now()/900)*0.05+Math.random()*0.04;
  series.push(v); if(series.length>40) series.shift();
  document.getElementById('liveVal').textContent=v.toFixed(2);
  document.getElementById('sparkLine').setAttribute('points',series.map((y,i)=>`${i*5},${60-y*120}`).join(' '));
  const a=document.getElementById('liveAnom'); a.textContent=v>0.38?'Watch':'Normal'; a.style.color=v>0.38?'var(--amber)':'var(--green)';
},700);

const simVib=document.getElementById('simVib');
simVib.addEventListener('input',()=>{
  const v=+simVib.value;
  document.getElementById('simVibOut').textContent=v.toFixed(1);
  document.getElementById('simRisk').textContent=Math.round(100/(1+Math.exp(-(v-5.5)))) +'%';
});
simVib.dispatchEvent(new Event('input'));

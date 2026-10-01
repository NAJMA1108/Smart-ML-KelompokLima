/* ========== JS: CLASSIFICATION ========== */
document.getElementById('predictBtn').addEventListener('click',()=>{
  const g=id=>+document.getElementById(id).value;
  const status=document.getElementById('fStatus').value;
  let score=(g('fTemp')-60)/40*0.35+g('fVib')/10*0.35+(g('fPres')-5)/5*0.1+(g('fEnergy')-100)/200*0.1+(status==='Overload'?0.2:0);
  const p=Math.min(0.99,Math.max(0.01,score));
  const bad=p>0.5, box=document.getElementById('clsResult');
  box.classList.toggle('bad',bad);
  document.getElementById('clsLabel').textContent=bad?'Maintenance Required':'Normal Operation';
  document.getElementById('clsNote').textContent=`Failure probability ${(p*100).toFixed(1)}% (demo model, not a trained one).`;
  const bar=document.getElementById('clsBar'); bar.style.width=(p*100)+'%'; bar.style.background=bad?'var(--red)':'var(--green)';
});

/* ========== JS: CLUSTERING ========== */
const kNum=document.getElementById('kNum');
kNum.addEventListener('input',()=>document.getElementById('kOut').textContent=kNum.value);

function rng(seed){return()=>((seed=(seed*16807)%2147483647)/2147483647)}
function runClustering(){
  const k=+kNum.value, rand=rng(42+k*7), svg=document.getElementById('scatter');
  const sizes=Array.from({length:k},()=>0.5+rand()); const tot=sizes.reduce((a,b)=>a+b,0);
  let dots='', rows='', dist='', legend='';
  for(let c=0;c<k;c++){
    const cx=60+rand()*280, cy=40+rand()*180, n=45, pts=Math.round(sizes[c]/tot*100000);
    for(let i=0;i<n;i++){
      const x=cx+(rand()+rand()+rand()-1.5)*45, y=cy+(rand()+rand()+rand()-1.5)*35;
      dots+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" fill="${COLORS[c]}" opacity=".75"/>`;
    }
    rows+=`<tr><td style="color:${COLORS[c]}">Cluster ${c}</td><td>${pts.toLocaleString()}</td><td>${(55+rand()*35).toFixed(1)}°C</td><td>${(0.5+rand()*4).toFixed(2)}</td></tr>`;
    dist+=`<i style="width:${sizes[c]/tot*100}%;background:${COLORS[c]}"></i>`;
    legend+=`<span style="margin-right:14px"><i style="background:${COLORS[c]}"></i>Cluster ${c}</span>`;
  }
  svg.innerHTML=dots;
  document.getElementById('cTable').innerHTML=rows;
  document.getElementById('dist').innerHTML=dist;
  document.getElementById('legend').innerHTML=legend.replace(/<i /g,'<i class="dot" ');
  document.getElementById('sK').textContent=k;
  document.getElementById('sSil').textContent=(0.78-k*0.03).toFixed(2);
}
document.getElementById('clusterBtn').addEventListener('click',runClustering);
runClustering();

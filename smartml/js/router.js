/* ========== JS: ROUTER ========== */
function show(id){
  if(!document.getElementById(id)) id='home';
  document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===id));
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.page===id));
  window.scrollTo(0,0);
}
document.querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',()=>{location.hash=b.dataset.page}));
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>{location.hash=b.dataset.go}));
window.addEventListener('hashchange',()=>show(location.hash.slice(1)));

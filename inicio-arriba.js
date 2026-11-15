// Las recargas vuelven a Nosotros; las entradas nuevas conservan sus enlaces directos.
(()=>{
 const navigation=performance.getEntriesByType('navigation')[0];
 const reload=navigation?.type==='reload';
 const previousRestoration=history.scrollRestoration;
 function closeTransientViews(){
  if(typeof window.closeCart==='function')window.closeCart();
  document.querySelectorAll('.galyon-modal').forEach(modal=>modal.classList.add('is-dismissed'));
  document.querySelectorAll('dialog[open]').forEach(dialog=>{
   if(typeof dialog.close==='function')dialog.close();
   else dialog.removeAttribute('open');
  });
  document.getElementById('navlinks')?.classList.remove('is-open');
  document.getElementById('menu-toggle')?.setAttribute('aria-expanded','false');
 }
 if(reload){
  history.scrollRestoration='manual';
  // Se ejecuta antes del router: evita restaurar Suelo, Combos o una ficha abierta.
  history.replaceState(history.state,'',location.pathname+location.search+'#nosotros');
  closeTransientViews();
 }
 function goHome(){
  if(!navigation)return;
  if(!reload&&(navigation.type!=='navigate'||location.hash))return;
  window.scrollTo({top:0,left:0,behavior:'instant'});
 }
 window.addEventListener('load',()=>{
  goHome();
  requestAnimationFrame(()=>{
   goHome();
   if(reload)history.scrollRestoration=previousRestoration;
  });
 },{once:true});
})();

'use strict';
// Áreas independientes con enlaces compartibles e historial nativo.
// Sin JavaScript, todo el contenido conserva sus anclas y sigue disponible.
(()=>{
 const header=document.querySelector('.header');
 const select=document.getElementById('page-section-select');
 const jump=document.querySelector('.page-section-jump');
 const panels=[...document.querySelectorAll('[data-site-panel]')];
 if(!header||!select||!jump||!panels.length)return;
 const names={nosotros:'Nosotros',asesor:'Asesor',combos:'Combos',lineas:'Productos',suelo:'Suelo',garantia:'Acompañamiento'};
 const aliases={'inicio':'nosotros','productos':'lineas','tricho-sustrato':'lineas','humicos':'suelo','fulvicos':'suelo','nodum':'suelo','soluciones-suelo':'suelo','materia-organica':'suelo','analisis':'suelo','acompanamiento':'garantia'};
 const links=[...header.querySelectorAll('.navlinks a[href^="#"]')];
 let current='nosotros';
 function hashId(){try{return decodeURIComponent(location.hash.slice(1));}catch{return '';}}
 function height(){document.documentElement.style.setProperty('--galyon-header-height',Math.ceil(header.getBoundingClientRect().height)+'px');}
 function closeMenu(){
  document.getElementById('navlinks')?.classList.remove('is-open');
  document.getElementById('menu-toggle')?.setAttribute('aria-expanded','false');
 }
 function show({scroll=true,focus=false}={}){
  const id=hashId();
  const modal=id.startsWith('detalle-');
  const target=document.getElementById(id);
  const view=modal?'lineas':aliases[id]||(names[id]?id:target?.closest('[data-site-panel]')?.dataset.sitePanel)||'nosotros';
  const changed=view!==current;
  current=view;
  panels.forEach(panel=>{panel.hidden=panel.dataset.sitePanel!==view;});
  document.body.dataset.siteView=view;
  document.body.classList.add('has-section-views');
  document.title=view==='nosotros'?'GALYON | Biotecnología aplicada a la agricultura':names[view]+' | GALYON';
  links.forEach(link=>{if(link.hash==='#'+view)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});
  select.value=view;
  closeMenu();height();
  if(modal){target?.classList.remove('is-dismissed');return;}
  if(scroll)requestAnimationFrame(()=>{
   const panel=panels.find(p=>p.dataset.sitePanel===view);
   const anchor=target&&!target.hidden&&target!==panel?target:null;
   if(anchor)anchor.scrollIntoView({block:'start',behavior:'instant'});
   else window.scrollTo({top:0,left:0,behavior:'instant'});
   if(focus&&changed){
    const heading=panel?.querySelector('h1,h2');
    if(heading){heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});}
   }
  });
 }
 select.addEventListener('change',()=>{
  const next=select.value;
  if(next==='inicio'&&window.resetToHome){window.resetToHome();return;}
  if(location.hash==='#'+next)show({focus:true});else location.hash=next;
 });
 document.addEventListener('click',event=>{
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const link=event.target.closest('a[href^="#"]');
  if(!link||link.classList.contains('brand'))return;
  if(link.hash===location.hash&&link.hash){event.preventDefault();show({focus:true});}
 });
 window.addEventListener('hashchange',()=>show({focus:true}));
 window.addEventListener('galyon:home',()=>show({focus:true}));
 window.addEventListener('resize',height,{passive:true});
 window.addEventListener('load',()=>show({scroll:!!location.hash}),{once:true});
 if('ResizeObserver' in window)new ResizeObserver(height).observe(header);
 jump.hidden=false;show();
})();

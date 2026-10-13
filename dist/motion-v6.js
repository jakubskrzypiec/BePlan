const preference=matchMedia('(prefers-reduced-motion: reduce)');
let paused=preference.matches;
const pauseButton=document.querySelector('#motionToggle');
const hero=document.querySelector('.hero'),cloud=document.querySelector('.cloud-texture'),scene=document.querySelector('.atmosphere-scene');
const logoStrip=document.querySelector('.logo-strip'),logoTrack=logoStrip.querySelector('.carousel-track');
const layers=[{root:hero,animation:null,visible:false,hover:false},{root:logoStrip,animation:null,visible:false,hover:false}];
function updateLayers(){for(const layer of layers){if(!layer.animation)continue;if(paused||document.hidden||!layer.visible||layer.hover)layer.animation.pause();else layer.animation.play()}document.body.classList.toggle('motion-paused',paused||document.hidden);}
function updatePause(){pauseButton.setAttribute('aria-pressed',String(paused));pauseButton.innerHTML=paused?'Włącz animacje <span aria-hidden="true">▶</span>':'Wstrzymaj animacje <span aria-hidden="true">Ⅱ</span>';updateLayers();}
pauseButton.addEventListener('click',()=>{paused=!paused;updatePause()});preference.addEventListener('change',()=>{paused=preference.matches;updatePause()});document.addEventListener('visibilitychange',updateLayers);

function sizeScene(){const scale=Math.max(hero.clientWidth/1672,hero.clientHeight/941);const x=(hero.clientWidth-1672*scale)*(innerWidth<=760?.57:.5);const y=(hero.clientHeight-941*scale)/2;scene.style.transform=`translate3d(${x}px,${y}px,0) scale(${scale})`;}
new ResizeObserver(sizeScene).observe(hero);sizeScene();
layers[0].animation=cloud.animate([{transform:'translate3d(-690px,0,0)'},{transform:'translate3d(350px,0,0)'}],{duration:75000,iterations:Infinity,easing:'linear'});
layers[0].animation.currentTime=19000;
function animateLogos(){const layer=layers[1],previous=layer.animation;let fraction=0;if(previous){const timing=previous.effect.getTiming();fraction=((previous.currentTime||0)/timing.duration)%1;previous.cancel()}const gap=parseFloat(getComputedStyle(logoTrack).gap)||0;const distance=logoTrack.querySelector('.carousel-set').getBoundingClientRect().width+gap;const duration=distance/22*1000;layer.animation=logoTrack.animate([{transform:'translate3d(0,0,0)'},{transform:`translate3d(-${distance}px,0,0)`}],{duration,iterations:Infinity,easing:'linear'});layer.animation.currentTime=duration*fraction;updateLayers()}
new ResizeObserver(animateLogos).observe(logoStrip);animateLogos();
logoStrip.addEventListener('pointerenter',()=>{layers[1].hover=true;updateLayers()});logoStrip.addEventListener('pointerleave',()=>{layers[1].hover=false;updateLayers()});

const carousel=document.querySelector('.paired-carousel'),pairGrid=carousel.querySelector('.pair-grid');
const ids=['transporeon','glovo','carl-zeiss-offices-dubai','tik-tok','pzu','bacardi'];
const picks=ids.map(id=>window.BEPLAN_PROJECTS.find(p=>p.id===id));
let pairIndex=0,pairVisible=false,pairHovered=false,pairFocused=false,changing=false,lastChange=performance.now();
function projectCard(p){return `<a class="project-card" href="projekty.html#projekt/${p.id}"><div class="project-picture"><img src="${p.images[0]}" alt="${p.title} — ${p.location}" width="1400" height="960" loading="eager"></div><div class="project-meta"><div><h3>${p.title}</h3><p>${p.location}</p></div><span>${p.area} <b aria-hidden="true">↗</b></span></div></a>`;}
async function changePair(step,automatic=false){if(changing)return;changing=true;lastChange=performance.now();const next=(pairIndex+step+3)%3;const pair=picks.slice(next*2,next*2+2);const loaded=await Promise.all(pair.map(p=>{const image=new Image();image.src=p.images[0];return image.decode().catch(()=>{})}));
 const animate=!paused&&!preference.matches; if(animate){await pairGrid.animate([{opacity:1},{opacity:0}],{duration:500,easing:'ease-in-out',fill:'forwards'}).finished.catch(()=>{})}
 pairIndex=next;pairGrid.innerHTML=pair.map(projectCard).join('');carousel.querySelector('.pair-status').textContent=String(pairIndex+1).padStart(2,'0')+' / 03';
 pairGrid.getAnimations().forEach(animation=>animation.cancel());if(animate)pairGrid.animate([{opacity:0},{opacity:1}],{duration:1000,easing:'ease-out'});changing=false;
}
carousel.addEventListener('pointerenter',()=>{pairHovered=true});carousel.addEventListener('pointerleave',()=>{pairHovered=false;lastChange=performance.now()});carousel.addEventListener('focusin',()=>{pairFocused=true});carousel.addEventListener('focusout',()=>{pairFocused=false;lastChange=performance.now()});
document.querySelectorAll('[data-pair-step]').forEach(button=>button.addEventListener('click',()=>changePair(Number(button.dataset.pairStep))));
setInterval(()=>{if(!paused&&!document.hidden&&pairVisible&&!pairHovered&&!pairFocused&&performance.now()-lastChange>11000)changePair(1,true)},1000);
const visibility=new IntersectionObserver(entries=>{for(const entry of entries){const layer=layers.find(x=>x.root===entry.target);if(layer)layer.visible=entry.isIntersecting;if(entry.target===hero)hero.dataset.motionVisible=String(entry.isIntersecting);if(entry.target===carousel){pairVisible=entry.isIntersecting;lastChange=performance.now()}}updateLayers()},{threshold:.02});layers.forEach(layer=>visibility.observe(layer.root));visibility.observe(carousel);updatePause();

const brandsDialog=document.querySelector('#brandsDialog'),brandsOpener=document.querySelector('#showAllBrands');
brandsOpener.addEventListener('click',()=>{brandsDialog.showModal();brandsDialog.scrollTop=0});
function closeBrands(){brandsDialog.close();brandsOpener.focus({preventScroll:true})}
document.querySelector('#closeBrands').addEventListener('click',closeBrands);brandsDialog.addEventListener('cancel',e=>{e.preventDefault();closeBrands()});brandsDialog.addEventListener('click',e=>{if(e.target!==brandsDialog)return;const r=brandsDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeBrands()});

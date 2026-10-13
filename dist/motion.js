const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
let motionPaused=motionPreference.matches;
const motionToggle=document.querySelector('#motionToggle');
function syncMotion(){motionToggle.setAttribute('aria-pressed',String(motionPaused));motionToggle.innerHTML=motionPaused?'Włącz animacje <span aria-hidden="true">▶</span>':'Wstrzymaj animacje <span aria-hidden="true">Ⅱ</span>';}
motionToggle.addEventListener('click',()=>{motionPaused=!motionPaused;syncMotion()});motionPreference.addEventListener('change',()=>{motionPaused=motionPreference.matches;syncMotion()});syncMotion();

const marquees=[...document.querySelectorAll('[data-marquee]')].map(view=>({view,set:view.querySelector('.carousel-set'),visible:false,hover:false,focused:false,holdUntil:0,speed:view.dataset.marquee==='projects'?19:24,wrap:0,position:0}));
const visibleMotion=new IntersectionObserver(entries=>entries.forEach(entry=>{const item=marquees.find(x=>x.view===entry.target);if(item)item.visible=entry.isIntersecting}),{threshold:.02});
function measureMarquee(item){const gap=parseFloat(getComputedStyle(item.view.querySelector('.carousel-track')).gap)||0;if(item.view.dataset.marquee==='projects'){const width=item.view.clientWidth;item.view.style.setProperty('--project-width',`${innerWidth<=760?width*.91:(width-gap)/2}px`)}item.wrap=item.set.getBoundingClientRect().width+gap;}
marquees.forEach(item=>{measureMarquee(item);new ResizeObserver(()=>measureMarquee(item)).observe(item.view);visibleMotion.observe(item.view);item.view.addEventListener('pointerenter',()=>{item.hover=true});item.view.addEventListener('pointerleave',()=>{item.hover=false});item.view.addEventListener('focusin',()=>{item.focused=true});item.view.addEventListener('focusout',()=>{item.focused=false});item.view.addEventListener('pointerdown',()=>{item.holdUntil=performance.now()+6000},{passive:true});item.view.addEventListener('wheel',()=>{item.holdUntil=performance.now()+5000},{passive:true});});
document.querySelectorAll('[data-carousel-step]').forEach(button=>button.addEventListener('click',()=>{const item=marquees.find(x=>x.view.dataset.marquee==='projects');item.holdUntil=performance.now()+6000;item.view.scrollBy({left:Number(button.dataset.carouselStep)*(parseFloat(item.view.style.getPropertyValue('--project-width'))+parseFloat(getComputedStyle(item.set).gap)),behavior:motionPreference.matches?'instant':'smooth'})}));

const canvas=document.querySelector('.hero-atmosphere'),hero=document.querySelector('.hero');
const ctx=canvas.getContext('2d');let heroVisible=true,sceneWidth=0,sceneHeight=0,dpr=1;
new IntersectionObserver(entries=>{heroVisible=entries[0].isIntersecting}).observe(hero);
function sizeCanvas(){sceneWidth=hero.clientWidth;sceneHeight=hero.clientHeight;dpr=Math.min(devicePixelRatio||1,1.6);canvas.width=Math.round(sceneWidth*dpr);canvas.height=Math.round(sceneHeight*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)}
new ResizeObserver(sizeCanvas).observe(hero);sizeCanvas();
const leaves=Array.from({length:9},(_,i)=>({phase:i*2.53,duration:22+i*2.7,size:2.5+i%3,origin:.04+(i%5)*.035,color:['#81714d','#64704a','#8c7955'][i%3]}));
let sceneTime=0,lastFrame=0;
function renderAtmosphere(){ctx.clearRect(0,0,sceneWidth,sceneHeight);const scale=Math.max(sceneWidth/1672,sceneHeight/941),offsetX=(sceneWidth-1672*scale)/2,offsetY=(sceneHeight-941*scale)/2;
 ctx.save();ctx.translate(offsetX,offsetY);ctx.scale(scale,scale);
 // Cloud drift is restricted to the sky at the left of the photograph.
 ctx.save();ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(540,0);ctx.lineTo(0,520);ctx.closePath();ctx.clip();
 for(let i=0;i<3;i++){const x=((sceneTime*2.5+i*180)%660)-140,y=105+i*95;const gradient=ctx.createRadialGradient(x,y,0,x,y,150);gradient.addColorStop(0,'rgba(245,246,240,.10)');gradient.addColorStop(.5,'rgba(243,245,240,.045)');gradient.addColorStop(1,'rgba(245,246,240,0)');ctx.fillStyle=gradient;ctx.fillRect(x-160,y-160,320,320)}ctx.restore();
 ctx.restore();
 // Sparse foreground leaves follow long, slightly irregular wind paths.
 for(const leaf of leaves){const p=((sceneTime+leaf.phase)%leaf.duration)/leaf.duration;const x=sceneWidth*(leaf.origin+p*.29)+Math.sin(sceneTime*.7+leaf.phase)*sceneWidth*.026;const y=-25+p*(sceneHeight+60);const fade=Math.sin(Math.PI*p)*.45;ctx.save();ctx.translate(x,y);ctx.rotate(sceneTime*.8+leaf.phase);ctx.scale(1,Math.cos(sceneTime*1.1+leaf.phase)*.45+.7);ctx.fillStyle=leaf.color;ctx.globalAlpha=fade;ctx.beginPath();ctx.moveTo(-leaf.size,0);ctx.bezierCurveTo(-leaf.size,-leaf.size,leaf.size,-leaf.size*.9,leaf.size*1.6,0);ctx.bezierCurveTo(leaf.size,leaf.size*.6,-leaf.size,leaf.size,-leaf.size,0);ctx.fill();ctx.restore();}
}
function tick(now){const delta=lastFrame?Math.min((now-lastFrame)/1000,.04):0;lastFrame=now;for(const item of marquees){if(document.hidden||motionPaused||!item.visible||item.hover||item.focused||now<item.holdUntil||!item.wrap){item.position=item.view.scrollLeft;continue}item.position+=delta*item.speed;if(item.position>=item.wrap)item.position-=item.wrap;item.view.scrollLeft=item.position}if(!document.hidden&&!motionPaused&&heroVisible){sceneTime+=delta;renderAtmosphere()}requestAnimationFrame(tick)}
requestAnimationFrame(tick);

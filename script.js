// Mobile navigation
const toggle=document.querySelector('.nav-toggle');
const nav=document.querySelector('.nav');
toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');}));

// Original certificate lightbox
const viewer=document.getElementById('viewer'), viewerImg=document.getElementById('viewer-img'), viewerTitle=document.getElementById('viewer-title');
document.querySelectorAll('[data-cert]').forEach(card=>card.addEventListener('click',()=>{
 const image=card.querySelector('img');
 viewerImg.src=image.src;
 viewerTitle.textContent=card.querySelector('h3').textContent+' — ORIGINAL CERTIFICATE';
 viewer.classList.add('open');viewer.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
}));
function closeViewer(){viewer.classList.remove('open');viewer.setAttribute('aria-hidden','true');document.body.style.overflow='';}
document.querySelector('.viewer-close').addEventListener('click',closeViewer);
viewer.addEventListener('click',e=>{if(e.target===viewer)closeViewer();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&viewer.classList.contains('open'))closeViewer();});


// Day / night theme switch. Remember the visitor's selection between visits.
(() => {
  const button=document.getElementById('theme-toggle');
  if(!button)return;
  const icon=button.querySelector('.theme-icon');
  const label=button.querySelector('.theme-label');
  const saved=localStorage.getItem('renz-portfolio-theme');
  if(saved==='light')document.body.classList.add('light-mode');
  function update(){
    const light=document.body.classList.contains('light-mode');
    icon.textContent=light?'☾':'☼';
    label.textContent=light?'DARK MODE':'LIGHT MODE';
    button.setAttribute('aria-label',light?'Switch to dark mode':'Switch to light mode');
    document.documentElement.style.colorScheme=light?'light':'dark';
  }
  update();
  button.addEventListener('click',()=>{
    document.body.classList.toggle('light-mode');
    const mode=document.body.classList.contains('light-mode')?'light':'dark';
    localStorage.setItem('renz-portfolio-theme',mode);
    update();
  });
})();

// Mouse-reactive blue fire: the flame follows the pointer and streams in its wake.
(() => {
  const canvas = document.getElementById('fire-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w=0,h=0,dpr=1,last=0,clock=0,raf=0;
  let pointer={x:-9999,y:-9999,px:-9999,py:-9999,vx:0,vy:0,active:false};
  const particles=[];
  const rand=(a,b)=>a+Math.random()*(b-a);
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

  function resize(){
    dpr=Math.min(window.devicePixelRatio||1,1.6);
    w=innerWidth;h=innerHeight;
    canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
    canvas.style.width=w+'px';canvas.style.height=h+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  function pointerMove(e){
    const x=e.clientX,y=e.clientY;
    if(pointer.active){
      pointer.vx=clamp(x-pointer.x,-38,38);
      pointer.vy=clamp(y-pointer.y,-38,38);
    }
    pointer.px=pointer.x;pointer.py=pointer.y;
    pointer.x=x;pointer.y=y;pointer.active=true;
    const speed=Math.hypot(pointer.vx,pointer.vy);
    const count=Math.round(5+Math.min(speed*.48,16));
    for(let i=0;i<count;i++) emit(pointer.x+rand(-9,9),pointer.y+rand(-8,8),pointer.vx,pointer.vy);
  }
  function emit(x,y,vx=0,vy=0){
    if(particles.length>850) particles.splice(0,particles.length-850);
    const hot=Math.random();
    particles.push({
      x,y,
      vx:rand(-1.25,1.25)-vx*.075,
      vy:rand(-3.8,-1.0)-Math.max(0,-vy)*.07,
      life:rand(28,58),max:rand(28,58),
      size:hot>.78?rand(3,6):rand(6,14),
      heat:hot,twist:rand(-1,1),seed:rand(0,Math.PI*2)
    });
  }
  function drawParticle(p){
    const t=p.life/p.max;
    const radius=p.size*(.25+.9*t);
    const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,radius*2.7);
    g.addColorStop(0,`rgba(235,253,255,${.8*t})`);
    g.addColorStop(.18,`rgba(102,222,255,${.7*t})`);
    g.addColorStop(.48,`rgba(0,139,255,${.42*t})`);
    g.addColorStop(1,'rgba(0,80,255,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,radius*2.7,0,Math.PI*2);ctx.fill();
    if(p.heat>.78){
      ctx.fillStyle=`rgba(190,247,255,${.8*t})`;
      ctx.beginPath();ctx.arc(p.x,p.y,Math.max(.5,radius*.22),0,Math.PI*2);ctx.fill();
    }
  }
  function baseFire(){
    // Low, rolling fire at the bottom corners, with layered flame tongues.
    const base=h+28;
    const groups=[
      {x:w*.025,s:Math.min(230,w*.25),a:.9},
      {x:w*.18,s:Math.min(155,w*.18),a:.55},
      {x:w*.50,s:Math.min(190,w*.22),a:.42},
      {x:w*.82,s:Math.min(155,w*.18),a:.55},
      {x:w*.975,s:Math.min(230,w*.25),a:.9}
    ];
    for(const group of groups){
      const glow=ctx.createRadialGradient(group.x,base,0,group.x,base,group.s*1.8);
      glow.addColorStop(0,`rgba(0,137,255,${.20*group.a})`);
      glow.addColorStop(.55,`rgba(0,72,255,${.09*group.a})`);
      glow.addColorStop(1,'rgba(0,40,255,0)');
      ctx.fillStyle=glow;ctx.fillRect(group.x-group.s*2,base-group.s*1.5,group.s*4,group.s*1.5);
      for(let i=0;i<13;i++){
        const x=group.x+(i-4)*group.s*.18;
        const sway=Math.sin(clock*2.2+i*1.8)*group.s*.14;
        const height=group.s*(.62+.48*(.5+.5*Math.sin(clock*2.7+i*2.3)));
        const tip=x+sway,tipY=base-height;
        const grad=ctx.createLinearGradient(0,base,0,tipY);
        grad.addColorStop(0,'rgba(0,65,255,0)');
        grad.addColorStop(.22,`rgba(0,114,255,${.28*group.a})`);
        grad.addColorStop(.62,`rgba(22,185,255,${.24*group.a})`);
        grad.addColorStop(.88,`rgba(160,244,255,${.17*group.a})`);
        grad.addColorStop(1,'rgba(190,250,255,0)');
        ctx.beginPath();ctx.moveTo(x-group.s*.10,base);
        ctx.bezierCurveTo(x-group.s*.20,base-height*.38,tip-group.s*.08,base-height*.72,tip,tipY);
        ctx.bezierCurveTo(tip+group.s*.08,base-height*.72,x+group.s*.20,base-height*.38,x+group.s*.10,base);
        ctx.closePath();ctx.fillStyle=grad;ctx.shadowColor='#008cff';ctx.shadowBlur=24;ctx.fill();ctx.shadowBlur=0;
      }
    }
  }
  function cursorFlare(){
    if(!pointer.active)return;
    const speed=Math.hypot(pointer.vx,pointer.vy);
    const r=48+Math.min(speed*1.5,48);
    const g=ctx.createRadialGradient(pointer.x,pointer.y,1,pointer.x,pointer.y,r*2.4);
    g.addColorStop(0,'rgba(226,252,255,.30)');
    g.addColorStop(.12,'rgba(74,209,255,.22)');
    g.addColorStop(.42,'rgba(0,129,255,.13)');
    g.addColorStop(1,'rgba(0,80,255,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(pointer.x,pointer.y,r*2.4,0,Math.PI*2);ctx.fill();
    // Bright hot core with a rippling blue halo.
    ctx.strokeStyle=`rgba(123,231,255,${.25+Math.min(speed/45,.35)})`;
    ctx.lineWidth=1;ctx.beginPath();ctx.arc(pointer.x,pointer.y,13+Math.sin(clock*8)*3,0,Math.PI*2);ctx.stroke();
  }
  function frame(now){
    const dt=Math.min((now-last)/16.67||1,2.4);last=now;clock+=.016*dt;
    ctx.clearRect(0,0,w,h);
    ctx.globalCompositeOperation='lighter';
    baseFire();
    // Keep emitting a small living flame while the pointer is held still.
    if(pointer.active&&!reduceMotion&&Math.random()<.88){
      emit(pointer.x+rand(-12,12),pointer.y+rand(-8,8),pointer.vx*.45,pointer.vy*.45);
    }
    cursorFlare();
    for(let i=particles.length-1;i>=0;i--){
      const p=particles[i];
      p.vx+=Math.sin(clock*5+p.seed)*.045+p.twist*.012;
      p.vy-=.018;
      p.x+=p.vx*dt;p.y+=p.vy*dt;
      p.vx*=.985;p.vy*=.992;
      p.life-=dt;
      if(p.life<=0){particles.splice(i,1);continue;}
      drawParticle(p);
    }
    ctx.globalCompositeOperation='source-over';
    pointer.vx*=.82;pointer.vy*=.82;
    if(!reduceMotion)raf=requestAnimationFrame(frame);
  }
  window.addEventListener('pointermove',pointerMove,{passive:true});
  window.addEventListener('pointerleave',()=>{pointer.active=false;},{passive:true});
  window.addEventListener('resize',resize,{passive:true});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden)cancelAnimationFrame(raf);
    else if(!reduceMotion){last=0;raf=requestAnimationFrame(frame);}
  });
  resize();
  if(reduceMotion){frame(0);}else{raf=requestAnimationFrame(frame);}
})();

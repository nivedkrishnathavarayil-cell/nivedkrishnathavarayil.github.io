{
const $=s=>document.querySelector(s);
/* Reduce Motion (an iPhone accessibility setting) no longer swaps the site for a still version:
   everything still plays, and only the opening's push-in and camera weave are toned down. */
const reduce=false,calm=matchMedia('(prefers-reduced-motion: reduce)').matches;
const LOOP='M14,58 C8,26 62,8 112,9 C164,10 196,28 193,54 C190,80 140,94 92,92 C40,90 6,76 9,52 C11,38 34,22 70,15';
const WIDE='M100,6 C160,4 197,22 196,50 C195,80 150,95 100,94 C46,93 4,80 4,50 C4,21 45,8 96,6 C122,5 142,8 160,13';
const SELW=`<span class="sel"><svg viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="${WIDE}"/></svg></span>`;
const SEL=`<span class="sel"><svg viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="${LOOP}"/></svg></span>`;
const BOX='<span class="sel"><svg viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M2,7 C60,3 140,2 197,4 C198,35 196,70 198,97 C130,99 60,98 3,96 C1,66 3,30 1,2 C3,0 30,3 52,5"/></svg></span>';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- opening titles ----------
   An empty frame lights up, the director credit racks into focus, and a scroll, a tap or a
   few seconds of waiting pushes it into camera until a flash cuts to the reel. Sound is
   made in the browser and only plays after a tap, a key or the Sound button. */
const intro=$('#intro'),flash=$('#flash'),ghost=$('#ghost'),credit=$('#credit');
const go=()=>{document.body.classList.remove('lock');document.body.classList.add('go')};
let AC=null,soundOn=false,proj=null;
const unlock=()=>{try{if(navigator.audioSession)navigator.audioSession.type='playback'}catch(e){}try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state!=='running')AC.resume();const b=AC.createBuffer(1,1,22050),s0=AC.createBufferSource();s0.buffer=b;s0.connect(AC.destination);s0.start(0);soundOn=true}catch(e){soundOn=false}};
const noise=sec=>{const n=Math.floor(AC.sampleRate*sec),b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;return b};
const bus=()=>{if(!AC.__out){const c=AC.createDynamicsCompressor();c.threshold.value=-10;c.ratio.value=6;const g=AC.createGain();g.gain.value=.8;c.connect(g).connect(AC.destination);AC.__out=c}return AC.__out};
function projector(){if(!soundOn||proj)return;const t=AC.currentTime;
  const src=AC.createBufferSource();src.buffer=noise(1);src.loop=true;
  const bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=2200;bp.Q.value=.9;
  const amp=AC.createGain();amp.gain.value=.5;const lfo=AC.createOscillator();lfo.type='square';lfo.frequency.value=24;const lg=AC.createGain();lg.gain.value=.5;lfo.connect(lg).connect(amp.gain);
  const hum=AC.createOscillator();hum.frequency.value=58;const hg=AC.createGain();hg.gain.value=.25;hum.connect(hg);
  const out=AC.createGain();out.gain.setValueAtTime(0,t);out.gain.linearRampToValueAtTime(.055,t+.3);
  src.connect(bp).connect(amp).connect(out);hg.connect(out);out.connect(bus());src.start(t);lfo.start(t);hum.start(t);proj={out,stop:[src,lfo,hum]}}
function stopProj(){if(!proj)return;const t=AC.currentTime;proj.out.gain.cancelScheduledValues(t);proj.out.gain.setValueAtTime(proj.out.gain.value,t);proj.out.gain.linearRampToValueAtTime(0,t+.2);proj.stop.forEach(n=>n.stop(t+.25));proj=null}
function whine(d){if(!soundOn)return;const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type='sine';
  o.frequency.setValueAtTime(1300,t);o.frequency.exponentialRampToValueAtTime(7600,t+d);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.028,t+d*.85);g.gain.exponentialRampToValueAtTime(.0001,t+d+.06);
  o.connect(g).connect(bus());o.start(t);o.stop(t+d+.1)}
function pop(){if(!soundOn)return;const t=AC.currentTime;
  const n=AC.createBufferSource();n.buffer=noise(.4);const hp=AC.createBiquadFilter();hp.type='highpass';hp.frequency.value=1100;
  const g=AC.createGain();g.gain.setValueAtTime(.42,t);g.gain.exponentialRampToValueAtTime(.001,t+.32);n.connect(hp).connect(g).connect(bus());n.start(t);
  const o=AC.createOscillator(),og=AC.createGain();o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(40,t+.2);
  og.gain.setValueAtTime(.5,t);og.gain.exponentialRampToValueAtTime(.001,t+.24);o.connect(og).connect(bus());o.start(t);o.stop(t+.26);
  const c=AC.createOscillator(),cg=AC.createGain();c.type='square';c.frequency.value=2600;cg.gain.setValueAtTime(.08,t);cg.gain.exponentialRampToValueAtTime(.001,t+.012);c.connect(cg).connect(bus());c.start(t);c.stop(t+.02)}

let introRun=null;
function runIntro(){
  if(introRun)return;
  try{sessionStorage.setItem('nkt-open','1')}catch(e){}
  document.body.classList.add('lock');document.body.classList.remove('go');
  intro.className='intro';intro.hidden=false;
  const by=credit.querySelector('.by'),nmL=credit.querySelector('.nm'),snd=$('#snd');
  by.style.cssText=nmL.style.cssText=credit.style.cssText='';
  const T=[],at=(ms,f)=>T.push(setTimeout(f,ms));
  let P=0,target=0,rolling=false,fired=false,rollT=0,rollFrom=0,rollDur=0,t0=0,lastW=0,raf=0,autoAt=0,ty=0,tb=0;
  const z=()=>{const creep=Math.min(1,(performance.now()-t0)/3400)*.06;return (creep+P)*(calm?70:290)};
  const paint=now=>{const Z=z();
    nmL.style.transform=`translateZ(${Z}px)`;
    by.style.transform=`translateZ(${Z*.62}px) translateY(${-P*26}px)`;
    const dof=Math.max(0,P-.4)*9;nmL.style.filter=dof>.05?`blur(${dof.toFixed(2)}px)`:'';
    by.style.opacity=Math.max(0,1-P*1.6);
    if(!calm&&now-lastW>41){lastW=now;credit.style.transform=`translate(${((Math.random()-.5)*.9).toFixed(2)}px,${((Math.random()-.5)*.7).toFixed(2)}px)`}};
  const loop=now=>{
    if(rolling){const k=Math.min(1,(now-rollT)/rollDur);P=rollFrom+(1-rollFrom)*k*k*k;paint(now);if(k>=1){fire();return}}
    else{P+=(target-P)*.16;paint(now);if(P>.5)roll();else if(now>=autoAt&&(reelReady()||now>=autoAt+2200))roll()}
    raf=requestAnimationFrame(loop)};
  const roll=()=>{if(reduce){end();return}if(rolling||fired)return;rolling=true;intro.classList.add('rolling');rollFrom=P;rollT=performance.now();rollDur=180+520*(1-P);whine(rollDur/1000)};
  const cleanup=()=>{T.forEach(clearTimeout);cancelAnimationFrame(raf);removeEventListener('keydown',onKey);introRun=null};
  const fire=()=>{if(fired)return;fired=true;cleanup();stopProj();pop();
    ghost.innerHTML=`<div class="cam"><div class="credit">${credit.innerHTML}</div></div>`;
    ghost.querySelector('.nm').style.transform=nmL.style.transform;
    flash.className='flash on';intro.hidden=true;go();
    const cv=$('#cine');if(cv){try{cv.currentTime=0;cv.play().catch(()=>{})}catch(e){}}
    requestAnimationFrame(()=>requestAnimationFrame(()=>{flash.classList.add('pop');ghost.classList.add('on')}));
    setTimeout(()=>{flash.className='flash';ghost.className='ghost';ghost.innerHTML=''},2200)};
  const end=()=>{if(fired)return;fired=true;cleanup();stopProj();intro.classList.add('out');go();setTimeout(()=>{intro.hidden=true;intro.classList.remove('out')},650)};
  const reelReady=()=>{const v=$('#cine');return !v||v.readyState>=3};
  const tapRoll=()=>{if(rolling||fired)return;unlock();if(soundOn){projector();autoAt=Infinity;at(900,roll)}else roll()};
  const onKey=e=>{if(e.key==='Escape'){end();return}
    if(['Enter',' ','ArrowDown','PageDown'].includes(e.key)&&e.target.tagName!=='BUTTON'){e.preventDefault();tapRoll()}};
  addEventListener('keydown',onKey);
  intro.onwheel=e=>{e.preventDefault();if(rolling)return;target=Math.max(0,Math.min(.62,target+e.deltaY*.0016));autoAt=Math.max(autoAt,performance.now()+700)};
  intro.ontouchstart=e=>{ty=e.touches[0].clientY;tb=target};
  intro.ontouchmove=e=>{e.preventDefault();if(rolling)return;target=Math.max(0,Math.min(.62,tb+(ty-e.touches[0].clientY)*.003));autoAt=Math.max(autoAt,performance.now()+700)};
  intro.onclick=e=>{if(e.target.closest('button'))return;tapRoll()};
  snd.onclick=e=>{e.stopPropagation();if(soundOn&&proj){stopProj();soundOn=false;snd.setAttribute('aria-pressed','false');snd.lastChild.textContent='Sound on';return}
    unlock();if(!soundOn)return;snd.setAttribute('aria-pressed','true');snd.lastChild.textContent='Sound off';projector();autoAt=Math.max(autoAt,performance.now()+1400)};
  if(matchMedia('(hover: none)').matches){const h=$('#hint');h.lastChild.textContent='Tap for sound, or swipe up to start'}
  if(reduce){intro.classList.add('calm','s1','s2','s3');$('#hint').hidden=true;at(2400,end);introRun=1;return}
  const start=()=>{t0=performance.now();autoAt=t0+3200;
    requestAnimationFrame(()=>intro.classList.add('lamp'));
    at(420,()=>intro.classList.add('s1'));at(820,()=>intro.classList.add('s2'));at(1700,()=>intro.classList.add('s3'));
    raf=requestAnimationFrame(loop)};
  introRun=1;
  const fontsIn=()=>{try{return Promise.race([document.fonts.load('800 60px Anybody'),new Promise(r=>setTimeout(r,1200))])}catch(e){return Promise.resolve()}};
  const begin=()=>fontsIn().then(start);
  if(document.hidden){const v=()=>{if(!document.hidden){document.removeEventListener('visibilitychange',v);begin()}};document.addEventListener('visibilitychange',v)}else begin();
}
let seen=false;try{const nav=performance.getEntriesByType('navigation')[0];const inside=document.referrer&&new URL(document.referrer).origin===location.origin;seen=(nav&&nav.type==='back_forward')||(!!inside&&!(nav&&nav.type==='reload'))}catch(e){}
if(seen&&!/[?&]opening\b/.test(location.search))go();else runIntro();
window.replayOpening=()=>{scrollTo({top:0,behavior:'instant'});const n=$('#name');if(n){delete n.dataset.s;n.style.animation='';n.style.opacity='';n.style.fontStretch=''}soundOn=false;const s=$('#snd');s.setAttribute('aria-pressed','false');s.lastChild.textContent='Sound on';setTimeout(runIntro,60)};

/* ---------- ledgers: rendered in the HTML so search engines read them ---------- */

/* a brand on the wall opens its row in the client work */
const openRow=(hash,smooth)=>{const el=hash&&hash.length>1&&document.getElementById(hash.slice(1));if(!el)return false;if(el.tagName==='DETAILS')el.open=true;el.scrollIntoView({behavior:smooth?'smooth':'auto',block:'start'});el.classList.remove('hit');void el.offsetWidth;el.classList.add('hit');setTimeout(()=>el.classList.remove('hit'),2200);return true};
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#c-"]');if(a&&openRow(a.getAttribute('href'),true)){e.preventDefault();history.replaceState(null,'',a.getAttribute('href'))}});
if(/^#c-/.test(location.hash))requestAnimationFrame(()=>openRow(location.hash,false));
/* iOS only shows pressed states once a touch listener exists */
document.addEventListener('touchstart',()=>{},{passive:true});


/* ---------- quotes (slides are in the HTML) ---------- */
{
const st=$('#qstage'),tabs=$('#qtabs'),tm=$('#qtimer');let qi=0,timer=null,paused=false;const QN=st.querySelectorAll('.qslide').length;
const qc=$('#qcount');
const show=i=>{qi=(i+QN)%QN;st.querySelectorAll('.qslide').forEach((f,k)=>f.classList.toggle('on',k===qi));tabs.querySelectorAll('.qn').forEach((b,k)=>b.setAttribute('aria-selected',k===qi));qc.textContent=(qi+1)+' of '+QN;restart()};
const restart=()=>{clearTimeout(timer);tabs.classList.remove('run');void tabs.offsetWidth;if(reduce||paused)return;tabs.classList.add('run');timer=setTimeout(()=>show(qi+1),7000)};
tabs.addEventListener('click',e=>{const b=e.target.closest('.qn');if(b)show(+b.dataset.i)});
$('#qprev').addEventListener('click',()=>show(qi-1));$('#qnext').addEventListener('click',()=>show(qi+1));
const box=$('#words');['mouseenter','focusin'].forEach(ev=>box.addEventListener(ev,()=>{paused=true;clearTimeout(timer);tabs.classList.remove('run')}));
['mouseleave','focusout'].forEach(ev=>box.addEventListener(ev,()=>{paused=false;restart()}));
qc.textContent='1 of '+QN;
const qio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)restart();else{clearTimeout(timer);tabs.classList.remove('run')}}),{threshold:.3});qio.observe(box);
}

/* ---------- end credits ---------- */
const ewm=$('#endwm');
function fitEnd(){ewm.style.fontSize='100px';ewm.style.display='inline-block';const w=ewm.getBoundingClientRect().width;ewm.style.display='';ewm.style.fontSize=Math.min(100*ewm.clientWidth*.92/w,300)+'px'}
(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(fitEnd);addEventListener('resize',fitEnd);
$('#again').addEventListener('click',()=>window.replayOpening());

/* ---------- menu ---------- */
/* the menu sheet lives in motion.js, shared by every page */

/* ---------- reel credits: the reel names what's playing ---------- */
const CUES=[[0,"Face Value","Streaming on Canvas. A makeup artist's road to New York Fashion Week. Directed by Nivedkrishna Thavarayil."],
[7.833,"Taser Fight Championship","A thriller shot inside a real fight night in Baltimore. Directed by Nivedkrishna Thavarayil."],
[13.125,"Dear NYC","A five-episode New York romance with Ruhani Sharma. Written and directed by Nivedkrishna Thavarayil."],
[19,"Red Flags","A short-form series on love and lies in New York, starring creator Robert Maxwell. Directed by Nivedkrishna Thavarayil."],
[22.5,"Demo Day","Ten episodes shot at Harvard in four days. Directed by Nivedkrishna Thavarayil."],
[28.667,"Chicks in Finance","Money, explained by the women who know it. Directed by Nivedkrishna Thavarayil."]];
const cine=$('#cine');let cueI=-1;
cine.addEventListener('timeupdate',()=>{const t=cine.currentTime;let i=0;CUES.forEach((c,k)=>{if(t>=c[0])i=k});if(i!==cueI){cueI=i;$('#nowt').textContent=CUES[i][1];$('#capt').textContent=CUES[i][1];$('#capc').lastChild.textContent=CUES[i][2]}});
/* only decode the hero films while they're on screen, so the rest of the page scrolls smoothly */
let stageOn=true,feedWant=false;const fv=$('#feedv');
const syncFeed=()=>{if(stageOn&&feedWant){if(!fv.getAttribute('src')&&fv.dataset.src){fv.poster=fv.dataset.poster;fv.src=fv.dataset.src}if(fv.paused)fv.play().catch(()=>{})}else if(!fv.paused)fv.pause()};
new IntersectionObserver(es=>es.forEach(e=>{stageOn=e.isIntersecting;if(stageOn)cine.play().catch(()=>{});else cine.pause();syncFeed()})).observe($('#stage'));
fv.pause();

/* ---------- hero reframe ---------- */
const stage=$('#stage'),frame=$('#frame'),hd=$('#hd');
const cl=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const ss=(a,b,x)=>{const t=cl((x-a)/(b-a));return t*t*(3-2*t)};
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const L=(a,b,t)=>a+(b-a)*t;
let ticking=false,lastP=-1,force=true;
const E={pin:$('#pin'),hc:$('#hcopy'),nowc:$('#nowc'),shade:$('#shade'),cc:$('#capc'),r1:$('#rt1'),r2:$('#rt2'),tbl:$('#tbl'),fv:$('#feedv'),tw:$('#two')};
let pinH=E.pin.clientHeight,DKY=[];
/* where the black rooms sit, measured once and again only when the page changes size, so scrolling never forces a layout */
const measure=()=>{pinH=E.pin.clientHeight;DKY=DK.map(el=>{const b=el.getBoundingClientRect();return [b.top+scrollY,b.bottom+scrollY]});force=true};
function upd(){ticking=false;
  const W=innerWidth,Hh=pinH,mob=W<760;
  const r=stage.getBoundingClientRect(),tot=stage.offsetHeight-Hh;
  const p=reduce?0:cl(-r.top/tot);
  const past=r.bottom<70;hd.classList.toggle('ink',past||(p>.7&&!mob));hd.classList.toggle('pill',past);
  const y=scrollY+34;hd.classList.toggle('ondark',past&&DKY.some(d=>d[0]<=y&&d[1]>=y));
  if(p===lastP&&!force)return;lastP=p;force=false;
  const A={x:0,y:0,w:W,h:Hh};
  const cw=mob?W*.94:Math.min(W*.84,1500),C={w:cw,h:cw/2.39};C.x=(W-C.w)/2;C.y=mob?Hh*.38:(Hh-C.h)/2-Hh*.03;
  if(mob){
    const t=ease(cl(p/.6));
    frame.style.transform=`translate3d(${L(A.x,C.x,t)}px,${L(A.y,C.y,t)}px,0)`;frame.style.width=L(A.w,C.w,t)+'px';frame.style.height=L(A.h,C.h,t)+'px';
    frame.style.borderRadius=L(0,10,ss(.35,.6,p))+'px';frame.style.boxShadow='none';
    const k=cl(p/.22);E.hc.style.opacity=1-k;E.hc.style.transform=`translate3d(0,${-k*30}px,0)`;E.hc.style.visibility=k>=1?'hidden':'visible';
    E.nowc.style.opacity=.85*(1-k);E.shade.style.opacity=1-ss(.05,.3,p);
    const co=ss(.48,.62,p);E.cc.style.opacity=co;E.cc.style.left=C.x+'px';E.cc.style.top=(C.y+C.h+16)+'px';
    E.r1.style.opacity=co;E.r1.style.left=(C.x+12)+'px';E.r1.style.top=(C.y+12)+'px';
    E.r2.style.opacity=0;E.tbl.style.opacity=0;E.fv.style.opacity=0;E.tw.style.opacity=0;E.tw.style.pointerEvents='none';
    if(feedWant){feedWant=false;syncFeed()}
    return}
  let bh=mob?Math.min(Hh*.5,W*.62*16/9):Math.min(Hh*.76,700);const B={h:bh,w:bh*9/16};
  B.x=mob?(W-B.w)/2:Math.max(W*.6,W-B.w-W*.12);B.y=mob?Hh-B.h-Hh*.05:(Hh-B.h)/2+10;
  let R;
  if(p<.33)R=((t)=>({x:L(A.x,C.x,t),y:L(A.y,C.y,t),w:L(A.w,C.w,t),h:L(A.h,C.h,t)}))(ease(p/.33));
  else if(p<.48)R=C;
  else{const t=ease(cl((p-.48)/.4));R={x:L(C.x,B.x,t),y:L(C.y,B.y,t),w:L(C.w,B.w,t),h:L(C.h,B.h,t)}}
  frame.style.transform=`translate3d(${R.x}px,${R.y}px,0)`;frame.style.width=R.w+'px';frame.style.height=R.h+'px';
  frame.style.borderRadius=L(0,26,ss(.5,.9,p))+'px';
  frame.style.boxShadow=p>.5?`0 40px 80px -30px rgba(0,0,0,${.55*ss(.5,.9,p)})`:'none';
  const k=cl(p/.16);E.hc.style.opacity=1-k;E.hc.style.transform=`translate3d(0,${-k*40}px,0)`;E.hc.style.visibility=k>=1?'hidden':'visible';
  E.nowc.style.opacity=.85*(1-k);
  E.shade.style.opacity=1-ss(.06,.28,p);
  const co=ss(.27,.35,p)*(1-ss(.5,.58,p));E.cc.style.opacity=co;E.cc.style.left=C.x+'px';E.cc.style.top=(C.y+C.h+16)+'px';
  E.r1.style.opacity=co;E.r1.style.left=(C.x+12)+'px';E.r1.style.top=(C.y+12)+'px';
  E.r2.style.opacity=ss(.82,.92,p);E.r2.style.left=(B.x+12)+'px';E.r2.style.top=(B.y+12)+'px';
  E.tbl.style.opacity=ss(.55,.8,p);
  E.fv.style.opacity=ss(.62,.82,p);{const w=p>.5;if(w!==feedWant){feedWant=w;syncFeed()}}
  const tw=E.tw;tw.style.opacity=ss(.8,.93,p);tw.style.pointerEvents=p>.85?'auto':'none';
  if(mob){tw.style.left='5vw';tw.style.right='5vw';tw.style.top='86px';tw.style.width='auto';tw.style.transform='none'}
  else{tw.style.left='max(5vw,24px)';tw.style.top='50%';tw.style.width=Math.min(B.x-W*.1,560)+'px';tw.style.transform='translateY(-50%)'}
}
const nm=$('#name');const DK=[...document.querySelectorAll('.dark')];
function fitT(){document.querySelectorAll('.card .ttl').forEach(el=>{el.style.fontSize='';let f=parseFloat(getComputedStyle(el).fontSize),n=0;while(el.scrollWidth>el.clientWidth+1&&n<30){f*=.94;el.style.fontSize=f+'px';n++}})}
function fit(){fitT();const an=nm.style.animation,st=nm.style.fontStretch;nm.style.animation='none';nm.style.fontSize='100px';nm.style.fontStretch=innerWidth<760?'112%':'140%';const w=Math.max(...[...nm.children].map(c=>c.getBoundingClientRect().width));const avail=$('#hcopy').clientWidth*(innerWidth<760?.98:.9);nm.style.fontSize=Math.min(100*avail/w,190)+'px';nm.style.fontStretch=st;nm.style.animation=an}
const req=()=>{if(!ticking){ticking=true;requestAnimationFrame(upd)}};
const remeasure=()=>{measure();req()};
(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(()=>{fit();remeasure()});addEventListener('resize',()=>{fit();remeasure()});
if(window.ResizeObserver)new ResizeObserver(remeasure).observe(document.body);addEventListener('load',remeasure);
addEventListener('scroll',req,{passive:true});measure();upd();
}
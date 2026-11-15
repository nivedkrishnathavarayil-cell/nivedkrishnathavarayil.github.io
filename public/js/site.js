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

/* ---------- series ---------- */
const S=[
{t:"Face Value",fmt:"Micro-documentary, 4 episodes",role:"Director, co-creative director and line producer",city:"New York",st:"Streaming",live:1,vid:"/media/facevalue_card.mp4",poster:"/media/facevalue_card.jpg",
 log:"Story, a New York makeup artist, rebuilds her life after a life-altering accident and makes it to New York Fashion Week. A series about resilience, ambition, inclusion and faith.",
 note:"Every episode runs under two minutes, a format new to Canvas. I planned pre-production with Directure AI to keep costs low, shot at New York Fashion Week and led post with the editors.",
 cr:"Produced by Abhinav Singla. Creative directors Nivedkrishna Thavarayil and Kamya Mehra. Written by Kamya Mehra. Director of photography Kais Vasaya. Edit and grade by Harsh.",
 link:["Watch on Canvas","https://www.canvasott.com/video/cmw1t94ey00kxs60ek9qkz9gt"]},
{t:"Red Flags",fmt:"Romance series",role:"Director",city:"New York",st:"Coming soon",vid:"/media/redflags_card.mp4",poster:"/media/redflags_card.jpg",
 log:"A short-form series on love and lies in New York, starring creator Robert Maxwell, who has more than a million followers on TikTok.",
 note:"The trailer premiered to live audiences in San Francisco and Los Angeles in October, and I recut it for launch from what those rooms told us."},
{t:"Taser Fight Championship",fmt:"Thriller, 4 episodes",role:"Director",city:"Baltimore",st:"Coming soon",vid:"/media/tfc_card.mp4",poster:"/media/tfc_card.jpg",
 log:"A fictional thriller set inside a real Taser Fight Championship night. Real fighters play themselves, and a masked man in the crowd writes the story.",
 note:"Shot inside a live event in Baltimore, with real fighters. The real championship agreed to co-post the series on its own Instagram."},
{t:"Dear NYC",fmt:"Romance, 5 episodes",role:"Writer and director",city:"New York",st:"Coming soon",vid:"/media/dearnyc_card.mp4",poster:"/media/dearnyc_card.jpg",
 log:"A New York romance in five short episodes, made with actress and creator Ruhani Sharma.",
 note:"Shot in a day across Manhattan, the subway and the Brooklyn Bridge."},
{t:"Demo Day",fmt:"Startup series, 10 episodes",role:"Director",city:"Harvard, Boston",st:"Coming soon",vid:"/media/demoday_card.mp4",poster:"/media/demoday_card.jpg",
 log:"Two roommate founders build an AI filmmaking app and pitch it at Harvard. The real Harvard pitch became the finale.",
 note:"Ten episodes shot guerrilla style at Harvard in four days, each one written the night before around what we had already shot.",
 cr:"Produced by Abhinav Singla, who also stars. Director of photography Kais Vasaya."},
{t:"The Red Carpet Show",fmt:"Interview series",role:"Director",city:"New York",st:"Coming soon",vid:"/media/redcarpet_card.mp4",poster:"/media/redcarpet_card.jpg",
 log:"Creators and founders answer one question in 90 seconds on a red carpet, with creator Ilias Anwar."},
{t:"Young Founders",fmt:"Docuseries",role:"Director",city:"San Francisco",st:"Coming soon",cls:"c-sf",log:"A docuseries about the craziest set of guys building in San Francisco."},
{t:"Hacker Room",fmt:"Docuseries",role:"Director",city:"San Francisco",st:"Coming soon",cls:"c-hack",log:"Founders building side by side inside a San Francisco hacker house."},
{t:"LA Artists",fmt:"Docuseries",role:"Director",city:"Los Angeles",st:"Coming soon",cls:"c-la",log:"Artists in Los Angeles on the work and the city that shaped it."},
{t:"Immigrant Dreams",fmt:"Documentary series",role:"Director",city:"New York",st:"Coming soon",cls:"c-imm",log:"Immigrants who built their lives in America, in their own words.",note:"Episodes include a Brooklyn story and Jaipore Royal in Brewster over Onam, a restaurant I had already marketed."},
{t:"What the Food",fmt:"Food docuseries",role:"Director",city:"New York",st:"Coming soon",cls:"c-food",log:"A food documentary series for Canvas, featuring New York restaurants I had marketed."},
{t:"Chicks in Finance",fmt:"Finance series",role:"Director",city:"New York",st:"Coming soon",cls:"c-fin",log:"Money, explained with Columbia professor May Ling and creator Khushi Jain, who has more than 460,000 followers."}
];
/* series: the shelf is rendered at build time; each spine links to its own page */
/* ---------- ledgers ---------- */
const row=r=>`<details class="lg" id="${r.id}"><summary><div><span class="d num" style="--w:${r.w||'110%'}">${esc(r.n)}${SELW}</span><span class="cap">${esc(r.cap)}</span></div><div><h3>${esc(r.t)}</h3><p class="who">${esc(r.who)}</p></div><span class="pm" aria-hidden="true"></span></summary><div class="bd"><div>${r.p.map(x=>`<p>${esc(x)}</p>`).join('')}${r.src?`<p class="src">${esc(r.src)}${r.links?': '+r.links.map(l=>`<a href="${l[1]}">${esc(l[0])}</a>`).join(', '):''}</p>`:''}</div></div></details>`;



const R=[
{id:"c-bricklane",n:"1.5M",cap:"views on one phaal reel",w:"118%",t:"Brick Lane Curry House, New York",who:"Creative Strategist and Social Media Lead",
 p:["Brick Lane is famous for its phaal, the curry Adam Richman took on in Man v. Food. I turned that challenge into a recurring New York content property with a zero-budget creator strategy, and one phaal reel passed 1.5 million views.","I pitched more than ten food creators myself and brought in Priya's Plates as our guest. Her attempt, posted as a collaboration, passed 57,000 views with nearly 300 shares."],src:"Source: Satinder Sharma, chef and owner, and Brick Lane Curry House on Instagram"},
{id:"c-frangos",n:"50 cups",cap:"given away with orders over $35, so at least $1,750 in orders",w:"84%",t:"Frangos Peri-Peri, New York",who:"Creative and Digital Marketing Strategist, World Cup 2026",
 p:["For the World Cup I put Frangos into NYC Tourism + Conventions' Five Borough Winners Special. When Portugal beat Uzbekistan 5-0, a five-wings-and-free-lemonade offer went out under the line \"Like it. Claim it.\" and about 26 people claimed it.","A paid Meta campaign, geotargeted around Avenue B, offered an official borough World Cup cup with any order over $35. All 50 cups went.","I filmed more than a dozen dishes on my own Sony, made 30+ reels and posts from late June to mid-August, and restarted a TikTok that had sat untouched for two years with 18 posts. Captions carried the phrases people actually search."],src:"Source: Rosina Ishaq, Frangos Peri-Peri"},
{id:"c-samen",n:"FOX 5",cap:"credentialed to film behind the scenes",w:"110%",t:"Michael Samen, mentalist, New York",who:"Shoot, edit and strategy, April to July 2026",
 p:["From mid-April to the end of July I went out with Michael, shot his reels, edited them with music and posted them across Instagram, TikTok, YouTube Shorts, Threads and Facebook. Some of the strategy we built together.","On June 2 I was credentialed to film behind the scenes when he appeared on FOX 5's Talking with Natasha. His long-form YouTube video I took from idea to strategy to the shoot and the edit. NY Weekly wrote about the work in July."],
 src:"Watch and read",links:[["The long-form video on YouTube","https://youtu.be/2oX-n4hvm-8"],["the FOX 5 segment","https://www.fox5ny.com/video/fmc-mosotx1eyqd1xlaf"],["NY Weekly","https://nyweekly.com/business/behind-the-mentalist-how-a-nyc-video-producer-is-building-michael-samens-brand-from-the-streets-to-fox-5/"]]},
{id:"c-sapphire",n:"30,000+",cap:"views on eight videos in about two weeks",w:"92%",t:"Sapphire Banquet NY",who:"TikTok and YouTube launch, May 2026",
 p:["I launched Sapphire's TikTok and YouTube. Within about two weeks eight videos had passed 30,000 views between them: a TikTok reveal of the hall passed 7,000, and a tour with Eshal passed 8,000.","I also designed the guest-of-honor posters for Hina Khawaja Bayat and Harbhajan Mann."],src:"Source: Muhammad Asim Ikram, Sapphire Banquet NY"},
{id:"c-samsha",n:"7,500+",cap:"views on one boosted mandi post, then customers walked in holding it up",w:"100%",t:"Hyderabad Peri Peri, Sips and Semkeh, Brooklyn",who:"Social Media Manager and Content Strategist, March to May 2026",
 p:["Three restaurants, three voices: a polished, premium page for Sips, Lebanese street food for Semkeh, and close, raw kitchen footage of biryani, mandi and goat tahari for Hyderabad Peri Peri.","When the owners asked what to boost, I picked a seven-slide post on our goat mandi over a reel. It drew more than 7,500 views and 70 new followers, and ten to fifteen customers came in holding the post up on their phones to order it. The head chef asked what I had posted, because suddenly everyone wanted mandi.","Across about ten weeks I put out 112 posts, the reels passed 45,000 views, and Hyderabad Peri Peri's views rose 139 percent from March to April."],src:"Source: Faisal Shahzad, co-owner of Sam & Sha Inc."},
{id:"c-fetchy",n:"616,000",cap:"views on one YouTube Short",w:"104%",t:"Fetchy, an AI memory app in Los Angeles",who:"Content strategy, scripts, direction and edit",
 p:["Fetchy's Shorts were averaging 600 to 1,000 views. I built a hub, hype and hygiene content plan across Instagram, TikTok and YouTube, wrote the scripts, directed the founder's phone shoots shot by shot, edited, picked the audio and posted. Shorts settled above 2,000 views each, and one passed 616,000."],src:"Source: Nina Duong, co-founder and CEO of Fetchy"},
{id:"c-coconuts",n:"150 to 2,400",cap:"Instagram followers in about six weeks, no paid spend",w:"78%",t:"Infamous Coconuts, a studio in Los Angeles, New York and Mumbai",who:"Founded by Abi Varghese, director of Netflix's Brown Nation",
 p:["I archived their back catalogue, rebuilt the feed around hub, hype and hygiene content, and turned the Malayalam meme pages already using their clips into credited partners who released new posts with us. The growth got picked up on Reddit, then by the press.","The collaboration post with the meme page It's Malu, about Abi Varghese building his empire, I took from idea to strategy to post. It is one of the most viral posts on the page."],src:"Covered by",links:[["DNA","https://www.dnaindia.com/insights/report-how-one-spontaneous-outreach-opened-doors-for-collaborative-filmmaking-3218319"],["Outlook India","https://www.outlookindia.com/hub4business/nivedkrishna-thavarayil-and-the-creative-collaboration-that-went-beyond-conventional-marketing"],["News24","https://news24online.com/information/nivedkrishna-thavarayil-creating-a-quiet-revolution-with-creative-collaborations/903102/"],["Indian Daily Post","https://m.dailyhunt.in/news/india/english/indian+daily+post+idp-epaper-dh166e30f72d604e7baed95079067eb6f9/from+film+marketing+to+creative+development+nivedkrishna+thavarayil+works+for+a+bigger+purpose-newsid-dh166e30f72d604e7baed95079067eb6f9_52edc1109b7811f1bddf3e753200d161"]]},
{id:"c-sony",n:"4",cap:"Sony Pictures releases on one retainer",w:"150%",t:"WLDD and Sony Pictures India, Bangalore",who:"Creative Strategist, founding team",
 p:["I pitched and closed Sony Pictures as WLDD's first international client. For The Pope's Exorcist we staged a possession in a packed cinema as the trailer played. The clip went viral across India in April 2023 and was covered by News18, India Today, Hindustan Times and The Indian Express.","The relationship grew to cover 65, Spider-Man: Across the Spider-Verse and Insidious: The Red Door."],src:"Covered by",links:[["Hindustan Times","https://www.hindustantimes.com/trending/woman-scares-people-in-theatre-as-the-pope-s-exorcist-trailer-plays-on-screen-101680956103411.html"],["India Today","https://www.indiatoday.in/trending-news/story/woman-acts-possessed-while-trailer-of-the-popes-exorcist-plays-in-movie-theatre-video-is-viral-2357066-2023-04-07"],["The Indian Express","https://indianexpress.com/article/trending/trending-in-india/possessed-woman-growls-at-moviegoers-as-the-popes-exorcist-trailer-plays-in-theatre-8545834/"],["News18","https://www.news18.com/buzz/the-popes-exorcist-trailer-brings-horror-to-life-as-possessed-woman-jumps-out-in-theatre-7496905.html"],["LatestLY","https://www.latestly.com/socially/social-viral/the-popes-exorcist-trailer-combined-with-possessed-woman-turns-theatre-into-horror-hall-watch-video-5047593.html"],["my article on why it worked","https://www.linkedin.com/pulse/what-popes-exorcist-campaign-taught-me-virality-why-most-thavarayil-io7me"]]},
{id:"c-jaipore",n:"75,000+",cap:"views on one creator collaboration",w:"100%",t:"Jaipore Royal and NH44 Indian, New York",who:"Plan, shoot, edit and design",
 p:["For Cross Culture Food's restaurants I planned, shot, edited and designed everything. Jaipore's guests live on Facebook, so that's where the effort went: followers grew from about 1,500 to 2,700. NH44's guests live on Instagram, so I built food creator collaborations there. I also redesigned NH44's logo, now painted on the restaurant wall."],src:"Source: Roshan Balan, owner of Jaipore Royal"},
{id:"c-lr",n:"53",cap:"team jackets, made in Mumbai, worn in Philadelphia",w:"150%",t:"LR Legacy Group, Levin Reji at eXp Realty",who:"Brand, merchandise and listing reels",
 p:["Levin's marketing was one sponsor graphic. I built his brand and logo, then put it where his referrals come from: closing gifts in his clients' homes and custom jackets for his cricket team. About 200 branded pieces, sourced in India and delivered to Philadelphia, plus the reel for his first listing."],src:"Source: Levin Reji, owner of LR Legacy Group"},
{id:"c-wldd",n:"2K to 11K",cap:"followers for WLDD in four months",w:"86%",t:"WLDD, Bangalore",who:"50+ campaigns for Netflix India, Prime Video, Zomato and more",
 p:["As part of WLDD's first fifteen people I worked on more than 50 organic and creator-led campaigns for Netflix India, Prime Video, ZEE5, Zomato, Swiggy, Durex, Xiaomi, OnePlus, Bingo! Mad Angles, Veera Browser and a few dating apps, while growing the agency's own Instagram.","Film and OTT work went well beyond Sony: ZEE5's Taj: Divided by Blood, Tu Jhoothi Main Makkaar, and Kannada cinema, including PR and marketing support around Yash and KGF: Chapter 2."],src:"Source: my own records from WLDD, January 2023 to April 2024"}];
$('#res').insertAdjacentHTML('beforeend',R.map(row).join(''));
$('#also').innerHTML='<b>Also:</b> before any of this, I co-founded Screen Reapers at university, a digital marketing and web agency for brands in India and abroad, jewelry and fashion included. Since then: a TikTok and YouTube launch plan for Cora the Borzoi, a go-to-market plan for Kavikara, web and social for RealtorLevin and YourPrimaryCare, and a documentary-style shoot for AS IF Magazine.';

/* a brand on the wall opens its row in the client work; a tapped name stays circled */
const openRow=(hash,smooth)=>{const el=hash&&hash.length>1&&document.getElementById(hash.slice(1));if(!el)return false;if(el.tagName==='DETAILS')el.open=true;el.scrollIntoView({behavior:smooth?'smooth':'auto',block:'start'});return true};
document.addEventListener('click',e=>{const bw=e.target.closest('.bw');if(bw)bw.querySelector('.bn').classList.add('on');const a=e.target.closest('a[href^="#c-"]');if(a&&openRow(a.getAttribute('href'),true)){e.preventDefault();history.replaceState(null,'',a.getAttribute('href'))}});
if(/^#c-/.test(location.hash))requestAnimationFrame(()=>openRow(location.hash,false));
/* iOS only shows pressed states once a touch listener exists */
document.addEventListener('touchstart',()=>{},{passive:true});
/* circles draw on hover; on touch screens they draw once as they scroll into view */

/* ---------- films ---------- */
const LAUREL='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3c1.6 1.2 2.4 2.7 2.4 4.4S13.6 10.6 12 11.8c-1.6-1.2-2.4-2.7-2.4-4.4S10.4 4.2 12 3Zm-6.5 5c2 .2 3.4 1 4.2 2.4s.9 3 .2 4.8c-2-.2-3.4-1-4.2-2.4s-.9-3-.2-4.8Zm13 0c.7 1.8.6 3.4-.2 4.8s-2.2 2.2-4.2 2.4c-.7-1.8-.6-3.4.2-4.8S16.5 8.2 18.5 8ZM12 13.5l1.2 7.5h-2.4L12 13.5Z"/></svg>';
const F=[
{t:"Frames of Silence",y:"2025",len:"10 min",g:"Psychological drama",w:"112%",
 d:"An aspiring actress is pulled into a celebrated director's games, where art and mentorship blur into manipulation. She resists, and lets the silence expose him.",
 cr:"Written, directed and edited by me, for $696, at the New York Film Academy. Now on the festival circuit.",
 links:[["Watch on YouTube","https://youtu.be/w4IGrik_Qho"],["IMDb","https://www.imdb.com/title/tt43522685/"]],l:[]},
{t:"Love Is Stronger Than Hate",y:"2025",len:"10 min",g:"Drama",w:"96%",img:"/media/listh_still.jpg",
 d:"Two best friends drift apart when one of them finds Holocaust artifacts that belonged to her great-grandmother and grows deeper in her faith.",
 cr:"Director of photography. Written and directed by Yoey Garfield.",
 links:[["The film's page","https://yoeygarfield.wixsite.com/ygproductions/loveisstrongerthanhate"],["IMDb","https://www.imdb.com/title/tt38273553/"]],
 l:[["Winner, Best Costume Design, Follow Your Heart Film Festival, Miami 2026","https://www.followourheart.com/winners-2026-miami"],["Nominee, Best Drama Short, The North Film Festival NYC 2026","https://www.thenorthfilmfestnyc.com/nominations2026"],["Nominee, Best Student Story, Long Island International Film Expo 2026","https://www.cognacscornermagazine.com/long-island-international-film-expo"],["Finalist, Best Student Film, New York International Film Awards, October 2025","https://newyorkinternationalfilmawards.com/wp-content/uploads/sites/10/2025/11/WINNERS-NYIFA-October-2025A.pdf"]]},
{t:"Unspoken Distance",y:"2024",len:"2 min",g:"Drama",w:"84%",
 d:"A couple in a dim living room, and a silence neither of them is willing to break first. Two minutes of everything people don't say.",
 cr:"Written, directed and edited by me. Shot in New Jersey.",
 links:[["IMDb","https://www.imdb.com/title/tt35963429/"]],l:[]},
{t:"The Last Pizza",y:"2024",len:"8 min",g:"Survival thriller",w:"128%",img:"/media/lastpizza_239.jpg",
 d:"On his last delivery of the night, a pizza guy gets trapped on a freezing Manhattan rooftop with a dying phone and nothing but the order.",
 cr:"Written, directed and edited by me. Shot on New York rooftops for $50. Proof you can make a thriller for the price of three slices.",
 links:[["Watch on YouTube","https://www.youtube.com/playlist?list=PL9qG6qOy9jenug9Ea9yCzb0xIiqDPqqOM"],["IMDb","https://www.imdb.com/title/tt35961624/"]],
 l:[["Winner, First Time Filmmaker Sessions Vol. 3",""],["Winner, First Time Filmmaker Sessions Vol. 5",""]]}];
$('#filmlist').innerHTML=F.map(f=>`<article class="film"><div class="strip"><div class="shot${f.img?'':' slate'}">${f.img?`<img src="${f.img}" alt="Still from ${esc(f.t)}" loading="lazy">`:`<span class="ft" style="--w:${f.w}">${esc(f.t)}</span>`}</div></div><div><p class="fmeta">${esc(f.g)}, ${esc(f.y)}, ${esc(f.len)}</p><h3 class="d">${esc(f.t)}</h3><p class="fd">${esc(f.d)}</p><p class="cr">${esc(f.cr)}</p>${f.l.length?`<div class="laurels">${f.l.map(x=>x[1]?`<a class="laurel" href="${x[1]}">${LAUREL}${esc(x[0])}</a>`:`<span class="laurel">${LAUREL}${esc(x[0])}</span>`).join('')}</div>`:''}<p class="flinks">${f.links.map(x=>`<a href="${x[1]}">${esc(x[0])}</a>`).join('')}</p></div></article>`).join('');

/* ---------- quotes ---------- */
const Q=[
["What makes him rare is that he thinks about the audience before he thinks about the shot.","Abhinav Singla","Founder, Canvas by Bombay Canvas"],
["One of the most resourceful and genuinely talented collaborators I have worked with in recent years.","Abi Varghese","Founder, Infamous Coconuts; director of Netflix's Brown Nation"],
["In twenty-four years I have learned how seldom that kind of attention can be produced on purpose. Nivedkrishna Thavarayil produces it on purpose.","Satinder Sharma","Chef and owner, Brick Lane Curry House"],
["I am particular about how our food looks, and he never once argued with a note.","Rosina Ishaq","Owner, Frangos Peri-Peri, New York"],
["Few people can see the story in a plate of biryani, film it well and then write the one line that makes a stranger walk in and order it.","Faisal Shahzad","Co-owner, Hyderabad Peri Peri, Sips and Semkeh"],
["The video he made with Eshal became the center of our new channels, and Sapphire had never had anything like it.","Muhammad Asim Ikram","Owner, Sapphire Banquet NY"],
["The results were real and, frankly, beyond what I expected from a brand-new hire.","Nina Duong","Co-founder and CEO, Fetchy"],
["Plenty of people understand marketing; very few think like a filmmaker the way he does.","Roshan Balan","Owner, Jaipore Royal Indian Cuisine"],
["Before him, my marketing was a sponsor graphic. Now it's a brand.","Levin Reji","Owner, LR Legacy Group, eXp Realty"]];
{
const st=$('#qstage'),tabs=$('#qtabs'),tm=$('#qtimer');let qi=0,timer=null,paused=false;
st.innerHTML=Q.map((q,i)=>`<figure class="qslide${i?'':' on'}" id="qs${i}" role="tabpanel" aria-label="${esc(q[1])}"><blockquote>${esc(q[0])}</blockquote><figcaption><b>${esc(q[1])}</b>${esc(q[2])}</figcaption></figure>`).join('');
tabs.innerHTML=Q.map((q,i)=>`<button class="qn" role="tab" aria-selected="${i?'false':'true'}" aria-controls="qs${i}" data-i="${i}"><span class="qnm">${esc(q[1])}</span><span class="qrl">${esc(q[2].split(',')[0])}</span><i class="qbar"></i></button>`).join('');
const qc=$('#qcount');
const show=i=>{qi=(i+Q.length)%Q.length;st.querySelectorAll('.qslide').forEach((f,k)=>f.classList.toggle('on',k===qi));tabs.querySelectorAll('.qn').forEach((b,k)=>b.setAttribute('aria-selected',k===qi));qc.textContent=(qi+1)+' of '+Q.length;restart()};
const restart=()=>{clearTimeout(timer);tabs.classList.remove('run');void tabs.offsetWidth;if(reduce||paused)return;tabs.classList.add('run');timer=setTimeout(()=>show(qi+1),7000)};
tabs.addEventListener('click',e=>{const b=e.target.closest('.qn');if(b)show(+b.dataset.i)});
$('#qprev').addEventListener('click',()=>show(qi-1));$('#qnext').addEventListener('click',()=>show(qi+1));
const box=$('#words');['mouseenter','focusin'].forEach(ev=>box.addEventListener(ev,()=>{paused=true;clearTimeout(timer);tabs.classList.remove('run')}));
['mouseleave','focusout'].forEach(ev=>box.addEventListener(ev,()=>{paused=false;restart()}));
qc.textContent='1 of '+Q.length;
const qio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)restart();else{clearTimeout(timer);tabs.classList.remove('run')}}),{threshold:.3});qio.observe(box);
}

/* ---------- press ---------- */
const PR=[
["Dezine","Nived Krishna, strategic filmmaker: an interview with Nitya Mehrotra","Sep 6, 2026","https://www.deziart.co/dezine/nived-krishna-strategic-filmmaker-career"],
["DNA","How one spontaneous outreach opened doors for collaborative filmmaking","Aug 12, 2026","https://www.dnaindia.com/insights/report-how-one-spontaneous-outreach-opened-doors-for-collaborative-filmmaking-3218319"],
["Indian Daily Post","From film marketing to creative development, Nivedkrishna Thavarayil works for a bigger purpose<small>Via Dailyhunt</small>","Aug 2026","https://m.dailyhunt.in/news/india/english/indian+daily+post+idp-epaper-dh166e30f72d604e7baed95079067eb6f9/from+film+marketing+to+creative+development+nivedkrishna+thavarayil+works+for+a+bigger+purpose-newsid-dh166e30f72d604e7baed95079067eb6f9_52edc1109b7811f1bddf3e753200d161"],
["Outlook India","Nivedkrishna Thavarayil and the creative collaboration that went beyond conventional marketing","Aug 4, 2026","https://www.outlookindia.com/hub4business/nivedkrishna-thavarayil-and-the-creative-collaboration-that-went-beyond-conventional-marketing"],
["News24","Nivedkrishna Thavarayil: creating a quiet revolution with creative collaborations","Aug 2026","https://news24online.com/information/nivedkrishna-thavarayil-creating-a-quiet-revolution-with-creative-collaborations/903102/"],
["NY Weekly","Behind the Mentalist: how a NYC video producer is building Michael Samen's brand, from the streets to FOX 5","Jul 24, 2026","https://nyweekly.com/business/behind-the-mentalist-how-a-nyc-video-producer-is-building-michael-samens-brand-from-the-streets-to-fox-5/"],
["Bold Journey","Meet Nivedkrishna Thavarayil","Apr 22, 2026","https://boldjourney.com/meet-nivedkrishna-thavarayil/"],
["LinkedIn","What the Pope's Exorcist campaign taught me about virality, and why most brands get it wrong<small>An article I wrote</small>","Apr 7, 2026","https://www.linkedin.com/pulse/what-popes-exorcist-campaign-taught-me-virality-why-most-thavarayil-io7me"],
["LatestLY","The Pope's Exorcist trailer combined with a 'possessed' woman turns a theatre into a horror hall<small>Coverage of the WLDD stunt for Sony Pictures</small>","Apr 9, 2023","https://www.latestly.com/socially/social-viral/the-popes-exorcist-trailer-combined-with-possessed-woman-turns-theatre-into-horror-hall-watch-video-5047593.html"],
["The Indian Express","'Possessed' woman growls at moviegoers as The Pope's Exorcist trailer plays in theatre<small>Coverage of the WLDD stunt for Sony Pictures</small>","Apr 8, 2023","https://indianexpress.com/article/trending/trending-in-india/possessed-woman-growls-at-moviegoers-as-the-popes-exorcist-trailer-plays-in-theatre-8545834/"],
["Hindustan Times","Woman scares people in theatre as The Pope's Exorcist trailer plays on screen<small>Coverage of the WLDD stunt for Sony Pictures</small>","Apr 8, 2023","https://www.hindustantimes.com/trending/woman-scares-people-in-theatre-as-the-pope-s-exorcist-trailer-plays-on-screen-101680956103411.html"],
["News18","The Pope's Exorcist trailer brings horror to life as 'possessed woman' jumps out in theatre<small>Coverage of the WLDD stunt for Sony Pictures</small>","Apr 8, 2023","https://www.news18.com/buzz/the-popes-exorcist-trailer-brings-horror-to-life-as-possessed-woman-jumps-out-in-theatre-7496905.html"],
["India Today","Woman acts possessed while trailer of The Pope's Exorcist plays in movie theatre. Video is viral<small>Coverage of the WLDD stunt for Sony Pictures</small>","Apr 7, 2023","https://www.indiatoday.in/trending-news/story/woman-acts-possessed-while-trailer-of-the-popes-exorcist-plays-in-movie-theatre-video-is-viral-2357066-2023-04-07"]];
const pesc=s=>esc(s).replace(/&lt;small&gt;(.*?)&lt;\/small&gt;/,'<small>$1</small>');
$('#pl').innerHTML=PR.map(p=>{const inner=`<span class="o">${esc(p[0])}${p[3]?SELW:''}</span><span class="h">${pesc(p[1])}</span><span class="dt">${esc(p[2])}</span>`;return p[3]?`<a class="pr" href="${p[3]}">${inner}</a>`:`<div class="pr">${inner}</div>`}).join('');

/* ---------- timeline + clients ---------- */
const TL=[["2011","Channel one","Starts a YouTube channel trying to be Zach King. Shoots, edits and posts every video himself."],
["2016","First paycheck","YouTube money buys his first phone. It survives all of high school."],
["2019","Founder in 12th grade","Starts Screen Reapers: websites, SEO, design and video for clients in India and abroad. It gets him into Christ University for marketing."],
["2022","The side door","Joins CashKaro as a video editing apprentice, meets a brand strategist, decides that's the job."],
["2023","Promoted in two months","Junior Brand Strategist at WLDD, promoted to Brand and Creative Strategist. 50+ campaigns. Brings in Sony Pictures."],
["2024","The other half","Quits to learn how films get made, not just sold. Moves to New York for the New York Film Academy."],
["2025","A studio of his own","Dean's List at NYFA. Starts Thava Studio for restaurants, founders and brands."],
["2026","Twelve series","Creative Director and Marketing Strategist at Canvas. Directs twelve series. Puts a mentalist on FOX 5."]];
$('#tl').innerHTML=TL.map((t,k)=>`<li style="--n:${TL.length-1-k}"${k===TL.length-1?' class="now"':''}><span class="y">${t[0]}</span><b>${esc(t[1])}</b><span>${esc(t[2])}</span></li>`).join('');
const CL=["Canvas","Sony Pictures India","Netflix India","Prime Video","Zee5","Zomato","Swiggy","Durex","Xiaomi","OnePlus","Infamous Coconuts","Fetchy","Frangos Peri-Peri","Michael Samen","Brick Lane Curry House","Sapphire Banquet NY","Jaipore Royal","NH44 Indian","Paratha Junction","LR Legacy Group","Cora the Borzoi","Kavikara","AS IF Magazine","Ophelia Model Management","RTC Sports Academy"];


/* ---------- end credits ---------- */
const CR=[
["Series directed for","Canvas by Bombay Canvas"],
["Filmed on location in","New York|Brooklyn|New Jersey|Philadelphia|Harvard, Boston|Baltimore|San Francisco|Los Angeles"],
["Creative studio","Thava Studio"],
["Campaigns for Sony Pictures India","The Pope's Exorcist|65|Spider-Man: Across the Spider-Verse|Insidious: The Red Door"],
["More film and OTT campaigns","Taj: Divided by Blood for ZEE5|Tu Jhoothi Main Makkaar|Kannada cinema, including KGF: Chapter 2"],
["Campaigns at WLDD for","Netflix India|Prime Video|ZEE5|Zomato|Swiggy|Durex|Xiaomi|OnePlus|Bingo! Mad Angles|Veera Browser|A few dating apps we'll keep between us"],
["Restaurants","Brick Lane Curry House|Frangos Peri-Peri|Hyderabad Peri Peri|Sips Bushwick|Semkeh|Jaipore Royal|NH44 Indian|Paratha Junction"],
["Creators, founders and brands","Michael Samen|Fetchy|Infamous Coconuts|LR Legacy Group|Sapphire Banquet NY|Kavikara|RTC Sports Academy"],
["Fashion","AS IF Magazine|Ophelia Model Management|Cora the Borzoi, who models better than most of us"],
["Agency co-founded at university","Screen Reapers"],
["Trained at","New York Film Academy|Christ University, Bangalore"],
["As featured in","Dezine|DNA|Outlook India|Indian Daily Post|News24|NY Weekly|Bold Journey|Hindustan Times|India Today|The Indian Express|News18|LatestLY"],
["Software","Growvior, maker of Mockits and Bhaksh"],
["Film community","F24Foster"],
["Reviews on","Letterboxd|IMDb|Rotten Tomatoes"],
["Catering","Chai|Samosas|Matcha, far too much of it"]];
$('#crl').innerHTML=CR.map(c=>`<dt>${esc(c[0])}</dt><dd>${c[1].split('|').map(n=>`<span>${esc(n)}</span>`).join('')}</dd>`).join('')+'<p class="thanks">With thanks to every chef, founder and creator who let me tell their story.</p><p class="thanks small">No pizzas were harmed in the making of this website.</p>';
const ewm=$('#endwm');
function fitEnd(){ewm.style.fontSize='100px';ewm.style.display='inline-block';const w=ewm.getBoundingClientRect().width;ewm.style.display='';ewm.style.fontSize=Math.min(100*ewm.clientWidth*.92/w,300)+'px'}
(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(fitEnd);addEventListener('resize',fitEnd);
$('#again').addEventListener('click',()=>window.replayOpening());

/* ---------- menu ---------- */
const nav=$('#nav'),mb=$('#menu');
mb.addEventListener('click',()=>{const o=nav.classList.toggle('open');mb.setAttribute('aria-expanded',o);mb.textContent=o?'Close':'Menu'});
nav.addEventListener('click',e=>{if(e.target.tagName==='A'){nav.classList.remove('open');mb.setAttribute('aria-expanded','false');mb.textContent='Menu'}});

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
const syncFeed=()=>{if(stageOn&&feedWant){if(fv.paused)fv.play().catch(()=>{})}else if(!fv.paused)fv.pause()};
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
  const past=r.bottom<70;hd.classList.toggle('ink',past||p>.7);hd.classList.toggle('pill',past);
  const y=scrollY+34;hd.classList.toggle('ondark',past&&DKY.some(d=>d[0]<=y&&d[1]>=y));
  if(p===lastP&&!force)return;lastP=p;force=false;
  const A={x:0,y:0,w:W,h:Hh};
  const cw=mob?W*.94:Math.min(W*.84,1500),C={w:cw,h:cw/2.39};C.x=(W-C.w)/2;C.y=mob?Hh*.38:(Hh-C.h)/2-Hh*.03;
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
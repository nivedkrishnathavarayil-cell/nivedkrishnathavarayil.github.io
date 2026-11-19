import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const $ = (q, r = document) => r.querySelector(q);
const $$ = (q, r = document) => [...r.querySelectorAll(q)];
const reduce = false; /* Reduce Motion keeps the reading animations; only the opening push-in is toned down (site.js) */
const fine = matchMedia('(hover: hover) and (pointer: fine)');
const page = document.body.dataset.page;


/* ---------- header: floating pill on pages without the reel ---------- */
const hd = $('#hd');
if (hd && page !== 'home') {
  const upd = () => hd.classList.toggle('pill', scrollY > 30);
  addEventListener('scroll', upd, { passive: true });
  upd();
}

/* ---------- menu: a full-screen sheet on phones and tablets, the same on every page ---------- */
const mb = $('#menu'), navEl = $('#nav');
if (mb && navEl) {
  const links = $$('a', navEl).filter((a) => !a.classList.contains('cta'));
  const sheet = document.createElement('div');
  sheet.className = 'sheet';
  sheet.id = 'sheet';
  sheet.setAttribute('aria-hidden', 'true');
  sheet.innerHTML = `<nav class="sheet-nav" aria-label="Menu">${links.map((a, i) => `<a href="${a.getAttribute('href')}" style="--i:${i}">${a.textContent}</a>`).join('')}</nav>
<div class="sheet-foot" style="--i:${links.length}"><a class="btn" href="https://calendly.com/nivedkrishnathavarayil/30min">Book a 30-minute call</a><a class="sheet-mail" href="mailto:nivedkrishnathavarayil@gmail.com">nivedkrishnathavarayil@gmail.com</a><p class="sheet-soc"><a href="https://www.linkedin.com/in/nivedkrishna" rel="me">LinkedIn</a><a href="https://www.imdb.com/name/nm16824024/" rel="me">IMDb</a><a href="https://www.instagram.com/tvedukr_12" rel="me">Instagram</a><a href="/Nivedkrishna-Thavarayil-Resume.pdf" target="_blank" rel="noopener">Resume</a></p></div>`;
  document.body.append(sheet);
  const root = document.documentElement;
  const set = (o) => {
    root.classList.toggle('menu-open', o);
    sheet.setAttribute('aria-hidden', String(!o));
    mb.setAttribute('aria-expanded', String(o));
    mb.textContent = o ? 'Close' : 'Menu';
  };
  mb.addEventListener('click', () => set(!root.classList.contains('menu-open')));
  sheet.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && root.classList.contains('menu-open')) { set(false); mb.focus(); } });
  matchMedia('(min-width: 1061px)').addEventListener('change', (e) => { if (e.matches) set(false); });
}

/* ---------- phones: the press list shows six, the rest one tap away ---------- */
const pl = $('#pl');
if (pl && pl.children.length > 7) {
  const more = document.createElement('button');
  more.className = 'more';
  more.type = 'button';
  more.textContent = `Show all ${pl.children.length} articles`;
  pl.classList.add('clamp');
  pl.after(more);
  more.addEventListener('click', () => { pl.classList.remove('clamp'); more.remove(); });
}

/* ---------- headlines: light crosses each one once as it arrives ---------- */
const gio2 = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return;
  e.target.classList.add('glint');
  gio2.unobserve(e.target);
}), { threshold: 0.6 });
$$('h2.d, h1.sx-t, .wm.big').forEach((el) => gio2.observe(el));

/* ---------- statement: the line reads itself as you scroll ---------- */
const stmt = $('#stmt');
if (stmt && !reduce) {
  const words = [];
  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((w) => {
          if (!w) return;
          if (/^\s+$/.test(w)) { frag.append(w); return; }
          const sp = document.createElement('span');
          sp.className = 'w';
          sp.textContent = w;
          frag.append(sp);
          words.push(sp);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && !n.classList.contains('sel')) walk(n);
    });
  };
  walk(stmt);
  stmt.classList.add('split');
  const mark = $('.mkw', stmt);
  gsap.fromTo(words, { opacity: 0.14 }, {
    opacity: 1,
    ease: 'none',
    stagger: 0.12,
    scrollTrigger: {
      trigger: stmt,
      start: 'top 82%',
      end: 'bottom 48%',
      scrub: 0.5,
      onUpdate: (self) => mark && mark.classList.toggle('on', self.progress > 0.5),
    },
  });
}

/* ---------- the shelf ---------- */
const shelf = $('#shelf');
if (shelf) {
  const sps = $$('.sp', shelf);
  let hoverT = 0;
  const vidOf = (sp) => $('video', sp);
  const play = (sp) => {
    const v = vidOf(sp);
    if (!v || reduce) return;
    if (!v.src && v.dataset.src) v.src = v.dataset.src;
    v.play().then(() => sp.classList.contains('open') && sp.classList.add('playing')).catch(() => {});
  };
  const stop = (sp) => { sp.classList.remove('playing'); vidOf(sp)?.pause(); };
  const open = (sp, follow) => {
    if (sp.classList.contains('open')) return;
    if (follow) {
      /* on phones the rows stack: land on the new row where it will be once the old one has folded */
      const prev = $('.sp.open', shelf);
      let shift = 0;
      if (prev && prev.compareDocumentPosition(sp) & Node.DOCUMENT_POSITION_FOLLOWING) shift = prev.offsetHeight - sp.offsetHeight;
      const y = sp.getBoundingClientRect().top + scrollY - shift - 84;
      scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    }
    sps.forEach((x) => { if (x !== sp) { x.classList.remove('open'); stop(x); } });
    sp.classList.add('open');
    setTimeout(() => sp.classList.contains('open') && play(sp), 260);
  };
  const grid = matchMedia('(max-width: 899px)');
  /* phones: an all-at-once grid; each preview plays while it's on screen */
  const gio = new IntersectionObserver((es) => es.forEach((e) => {
    if (!grid.matches) return;
    const sp = e.target;
    if (e.isIntersecting) { const v = vidOf(sp); if (v && !reduce) { if (!v.src && v.dataset.src) v.src = v.dataset.src; v.play().then(() => sp.classList.add('playing')).catch(() => {}); } }
    else stop(sp);
  }), { threshold: 0.55 });
  sps.forEach((sp) => gio.observe(sp));
  sps.forEach((sp) => {
    sp.addEventListener('mouseenter', () => {
      if (!fine.matches) return;
      clearTimeout(hoverT);
      hoverT = setTimeout(() => open(sp), 90);
    });
    sp.addEventListener('mouseleave', () => clearTimeout(hoverT));
    sp.addEventListener('focus', () => { if (sp.matches(':focus-visible')) open(sp); });
    sp.addEventListener('click', (e) => {
      if (!sp.classList.contains('open') && !fine.matches && !grid.matches) {
        e.preventDefault();
        open(sp, true);
        return;
      }
      sp.style.viewTransitionName = 'm-' + sp.dataset.slug;
    });
  });
  new IntersectionObserver((es) => es.forEach((e) => {
    if (grid.matches) return;
    const sp = $('.sp.open', shelf);
    if (!sp) return;
    if (e.isIntersecting) play(sp); else stop(sp);
  }), { threshold: 0.2 }).observe(shelf);
}

/* ---------- fit the record-light wordmark on pages without the main script ---------- */
const fits = $$('[data-fit]');
if (fits.length) {
  const fit = () => fits.forEach((el) => {
    el.style.fontSize = '100px';
    const spans = $$(':scope>span', el);
    const block = getComputedStyle(spans[0]).display === 'block';
    /* measure the text itself, not the box: a block span is always as wide as the screen */
    const textW = (node) => { const r = document.createRange(); r.selectNodeContents(node); return r.getBoundingClientRect().width; };
    const w = block ? Math.max(...spans.map(textW)) : textW(el);
    const avail = el.parentElement.clientWidth * 0.92;
    el.style.fontSize = Math.min(100 * (avail / w), 400) + 'px';
  });
  (document.fonts?.ready || Promise.resolve()).then(fit);
  addEventListener('resize', fit);
}

/* ---------- series page trailer: play only while on screen ---------- */
const sv = $('.sx-media video');
if (sv) {
  new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) sv.play().catch(() => {}); else sv.pause();
  }), { threshold: 0.2 }).observe(sv);
}

/* ---------- proof links (press, clients, films, profiles) open in a new tab, so the site stays where you left it ---------- */
$$('a[href^="http"]').forEach((a) => {
  if (a.host === location.host) return;
  a.target = '_blank';
  a.rel = (a.rel ? a.rel + ' ' : '') + 'noopener';
});

/* ---------- display headings never run past their column: shrink just enough for the longest word ---------- */
const fitWords = () => {
  const r = document.createRange();
  /* never the hero: the name and the opening size and animate themselves */
  $$('h1.d, h2.d').filter((h) => !h.closest('#name, #stage, #intro, .screen, .frame')).forEach((h) => {
    h.style.fontSize = '';
    const cs = getComputedStyle(h);
    const pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    let par = h.parentElement;
    while (par && !par.clientWidth) par = par.parentElement; /* skip display:contents wrappers */
    const pcs = getComputedStyle(par);
    const left = h.getBoundingClientRect().left + parseFloat(cs.paddingLeft);
    /* a grid column can stretch to fit a long word, so the screen (with an even gutter) is the last word */
    const avail = Math.min(h.clientWidth - pad, par.clientWidth - parseFloat(pcs.paddingLeft) - parseFloat(pcs.paddingRight), document.documentElement.clientWidth - 2 * Math.max(left, 0));
    if (!(avail > 0)) return;
    let widest = 0;
    if (/nowrap|pre/.test(cs.whiteSpace)) { r.selectNodeContents(h); widest = r.getBoundingClientRect().width; } /* one line: the whole line has to fit */
    const walk = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      const re = /\S+/g;
      let m;
      while ((m = re.exec(n.textContent))) {
        r.setStart(n, m.index);
        r.setEnd(n, m.index + m[0].length);
        widest = Math.max(widest, r.getBoundingClientRect().width);
      }
    }
    if (widest > avail) h.style.fontSize = `${Math.floor(parseFloat(cs.fontSize) * (avail / widest) * 0.97 * 10) / 10}px`;
  });
};
let fitW = innerWidth;
document.fonts.ready.then(fitWords);
addEventListener('resize', () => {
  if (innerWidth === fitW) return; /* the phone address bar only changes the height */
  fitW = innerWidth;
  clearTimeout(fitWords.t);
  fitWords.t = setTimeout(fitWords, 120);
});

/* ---------- about: the story opens one tapped word at a time; with no script, everything is open ---------- */
const bio = $('#bio');
if (bio) {
  const btns = $$('.rv-b', bio);
  const count = $('#rvn'), all = $('#rvall'), reset = $('#rvreset');
  const open = (b, on) => {
    b.setAttribute('aria-expanded', String(on));
    const c = document.getElementById(b.getAttribute('aria-controls'));
    c.classList.toggle('on', on);
    c.inert = !on;
  };
  const sync = () => {
    const n = btns.filter((b) => b.getAttribute('aria-expanded') === 'true').length;
    if (count) count.textContent = n;
    if (all) all.hidden = n === btns.length;
    if (reset) reset.hidden = n === 0;
    bio.classList.toggle('done', n === btns.length);
  };
  btns.forEach((b) => open(b, false));
  bio.classList.add('rv-live');
  const ctl = $('#rvctl'); if (ctl) ctl.hidden = false;
  btns.forEach((b) => b.addEventListener('click', () => { open(b, b.getAttribute('aria-expanded') !== 'true'); sync(); }));
  all && all.addEventListener('click', () => { btns.forEach((b) => open(b, true)); sync(); });
  reset && reset.addEventListener('click', () => { btns.forEach((b) => open(b, false)); sync(); bio.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); });
  sync();
}

/* ---------- articles: "Listen to this" reads the piece aloud with the device's own voice ---------- */
const listen = $('#listen');
if (listen && 'speechSynthesis' in window) {
  const synth = window.speechSynthesis;
  const label = listen.textContent;
  let queue = [], playing = false;
  const pickVoice = () => {
    const vs = synth.getVoices().filter((v) => /^en(-|_)/i.test(v.lang));
    const pref = [/Ava|Samantha|Aria|Jenny|Natural|Google US English|Daniel/i];
    return vs.find((v) => pref[0].test(v.name) && /US|GB/i.test(v.lang)) || vs.find((v) => /en-US/i.test(v.lang)) || vs[0];
  };
  const textOf = () => {
    const parts = [$('.cs-t'), $('.cs-line'), ...$$('.post-body > p, .post-body > h2, .post-body > blockquote, .post-body > ul > li')].filter(Boolean).map((e) => e.textContent.trim());
    return parts.join('. ').replace(/\.\s*\./g, '.').match(/[^.!?]+[.!?]+|\S[^.!?]*$/g) || [];
  };
  const stop = () => { synth.cancel(); playing = false; queue = []; listen.textContent = label; listen.setAttribute('aria-pressed', 'false'); };
  const next = () => {
    if (!queue.length) { stop(); return; }
    const u = new SpeechSynthesisUtterance(queue.shift());
    const v = pickVoice(); if (v) u.voice = v;
    u.rate = 1.02;
    u.onend = () => { if (playing) next(); };
    synth.speak(u);
  };
  listen.hidden = false;
  listen.setAttribute('aria-pressed', 'false');
  listen.addEventListener('click', () => {
    if (playing && !synth.paused) { synth.pause(); listen.textContent = 'Resume'; return; }
    if (playing && synth.paused) { synth.resume(); listen.textContent = 'Pause'; return; }
    queue = textOf(); playing = true; listen.textContent = 'Pause'; listen.setAttribute('aria-pressed', 'true'); next();
  });
  addEventListener('pagehide', stop);
}

/* ---------- films and reels play here: a link with data-yt (YouTube) or data-ig (an Instagram reel) opens a full-screen player instead of leaving the site ---------- */
const ytLinks = $$('a[data-yt], a[data-ig]');
if (ytLinks.length && typeof HTMLDialogElement === 'function') {
  const dlg = document.createElement('dialog');
  dlg.className = 'ytbox';
  dlg.setAttribute('aria-label', 'Video player');
  dlg.innerHTML = '<div class="ytbox-in"><button class="ytbox-x" type="button">Close</button><div class="ytbox-frame"></div><p class="ytbox-t"></p></div>';
  document.body.append(dlg);
  const frame = dlg.querySelector('.ytbox-frame');
  const title = dlg.querySelector('.ytbox-t');
  dlg.addEventListener('close', () => { frame.replaceChildren(); document.documentElement.classList.remove('yt-open'); });
  dlg.querySelector('.ytbox-x').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target.classList.contains('ytbox-in')) dlg.close(); });
  ytLinks.forEach((a) => a.addEventListener('click', (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
    e.preventDefault();
    const ig = a.dataset.ig;
    const f = document.createElement('iframe');
    f.src = ig
      ? `https://www.instagram.com/reel/${encodeURIComponent(ig)}/embed/`
      : `https://www.youtube-nocookie.com/embed/${encodeURIComponent(a.dataset.yt)}?autoplay=1&rel=0&playsinline=1`;
    f.title = a.dataset.label || a.dataset.title || 'Video';
    f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.allowFullscreen = true;
    frame.replaceChildren(f);
    dlg.classList.toggle('v', !!ig || 'v' in a.dataset);
    const name = document.createElement('span');
    name.textContent = a.dataset.title || '';
    const out = document.createElement('a');
    out.className = 'ytbox-o';
    out.href = a.href;
    out.target = '_blank';
    out.rel = 'noopener';
    out.textContent = ig ? 'Open on Instagram' : 'Open on YouTube';
    title.replaceChildren(name, out);
    document.documentElement.classList.add('yt-open');
    dlg.showModal();
  }));
}

/* share bar: the native sheet where the phone has one (Instagram, Messages, AirDrop), plus copy link */
document.querySelectorAll('.share-native').forEach((li) => { if (navigator.share) li.hidden = false; });
document.addEventListener('click', async (e) => {
  const nb = e.target.closest('[data-share-url]');
  if (nb) {
    try { await navigator.share({ title: nb.dataset.shareTitle, url: nb.dataset.shareUrl }); } catch (_) { /* closed */ }
    return;
  }
  const cb = e.target.closest('[data-copy]');
  if (!cb) return;
  const ok = cb.closest('.share')?.querySelector('.share-ok');
  try { await navigator.clipboard.writeText(cb.dataset.copy); if (ok) ok.textContent = 'Link copied.'; }
  catch (_) { if (ok) ok.textContent = cb.dataset.copy; }
  clearTimeout(cb._t);
  cb._t = setTimeout(() => { if (ok) ok.textContent = ''; }, 2600);
});

/* audio player: custom controls, waveform seeking, a floating mini bar, lock-screen controls */
const ap = document.querySelector('.ap');
if (ap) {
  const a = ap.querySelector('audio');
  const q = (s, r = ap) => r.querySelector(s);
  const play = q('.ap-play'), seek = q('.ap-seek'), tip = q('.ap-tip'), cur = q('.ap-cur'), left = q('.ap-left'), rate = q('.ap-rate'), resume = q('.ap-resume');
  const mini = document.querySelector('.ap-mini'), mplay = q('.ap-mp', mini), mtime = q('.ap-mtime', mini), mx = q('.ap-mx', mini);
  const dur0 = +ap.dataset.dur || 0;
  const D = () => (isFinite(a.duration) && a.duration) || dur0;
  const fmt = (s) => { s = Math.max(0, Math.floor(s)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  const key = `ap:${location.pathname}`;
  let saved = 0;
  try { saved = +localStorage.getItem(key) || 0; } catch (e) {}
  if (saved > 10 && saved < dur0 - 10) { resume.textContent = `Resume at ${fmt(saved)}`; resume.hidden = false; }
  const paint = () => {
    const d = D(), t = a.currentTime || 0, pc = `${Math.min(100, (t / d) * 100).toFixed(2)}%`;
    ap.style.setProperty('--p', pc); mini.style.setProperty('--p', pc);
    cur.textContent = fmt(t); left.textContent = `-${fmt(Math.ceil(d - t))}`; mtime.textContent = `${fmt(t)} / ${fmt(Math.round(d))}`;
    seek.setAttribute('aria-valuenow', String(Math.round(t))); seek.setAttribute('aria-valuetext', `${fmt(t)} of ${fmt(Math.round(d))}`);
  };
  let inView = true, closed = false;
  const sync = () => {
    const show = !inView && !closed && (a.currentTime > 0);
    mini.classList.toggle('show', show); mini.inert = !show; mini.setAttribute('aria-hidden', String(!show));
  };
  const toggle = () => {
    if (a.paused) {
      if (saved > 10 && a.currentTime < 1 && saved < D() - 10) a.currentTime = saved;
      saved = 0; resume.hidden = true; closed = false;
      a.play().catch(() => {});
    } else a.pause();
  };
  const setState = (on) => {
    ap.classList.toggle('on', on); mini.classList.toggle('on', on);
    const label = on ? 'Pause' : 'Play';
    play.setAttribute('aria-label', label); mplay.setAttribute('aria-label', label);
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = on ? 'playing' : 'paused';
    sync();
  };
  play.addEventListener('click', toggle);
  mplay.addEventListener('click', toggle);
  mx.addEventListener('click', () => { a.pause(); closed = true; sync(); });
  a.addEventListener('play', () => { ap.classList.add('seen'); setState(true); });
  a.addEventListener('pause', () => setState(false));
  a.addEventListener('loadedmetadata', paint);
  let lastSave = 0;
  a.addEventListener('timeupdate', () => {
    paint(); sync();
    if (Math.abs(a.currentTime - lastSave) > 5) { lastSave = a.currentTime; try { localStorage.setItem(key, String(a.currentTime)); } catch (e) {} }
  });
  a.addEventListener('ended', () => { try { localStorage.removeItem(key); } catch (e) {} a.currentTime = 0; paint(); setState(false); });
  const frac = (e) => { const r = seek.getBoundingClientRect(); return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)); };
  const jump = (t) => { a.currentTime = Math.min(D(), Math.max(0, t)); saved = 0; resume.hidden = true; ap.classList.add('seen'); paint(); sync(); };
  let drag = false;
  const hover = (f) => { seek.style.setProperty('--h', `${f * 100}%`); tip.textContent = fmt(f * D()); tip.style.left = `${f * 100}%`; tip.hidden = false; };
  seek.addEventListener('pointerdown', (e) => { drag = true; seek.setPointerCapture(e.pointerId); const f = frac(e); hover(f); jump(f * D()); });
  seek.addEventListener('pointermove', (e) => { const f = frac(e); if (e.pointerType === 'mouse' || drag) hover(f); if (drag) jump(f * D()); });
  const end = () => { drag = false; tip.hidden = true; seek.style.setProperty('--h', '0%'); };
  seek.addEventListener('pointerup', end); seek.addEventListener('pointercancel', end); seek.addEventListener('pointerleave', () => { if (!drag) end(); });
  seek.addEventListener('keydown', (e) => {
    const k = e.key; let t = a.currentTime;
    if (k === 'ArrowRight' || k === 'ArrowUp') t += 5; else if (k === 'ArrowLeft' || k === 'ArrowDown') t -= 5;
    else if (k === 'PageUp') t += 30; else if (k === 'PageDown') t -= 30;
    else if (k === 'Home') t = 0; else if (k === 'End') t = D();
    else if (k === ' ' || k === 'Enter') { e.preventDefault(); toggle(); return; } else return;
    e.preventDefault(); jump(t);
  });
  ap.querySelectorAll('[data-skip]').forEach((b) => b.addEventListener('click', () => jump(a.currentTime + +b.dataset.skip)));
  const RATES = [1, 1.25, 1.5, 2, 0.75];
  rate.addEventListener('click', () => {
    const r = RATES[(RATES.indexOf(a.playbackRate) + 1) % RATES.length] || 1;
    a.playbackRate = r; rate.textContent = `${r}x`; rate.setAttribute('aria-label', `Playback speed, ${r} times`);
  });
  if ('IntersectionObserver' in window) new IntersectionObserver(([en]) => { inView = en.isIntersecting; sync(); }).observe(ap);
  if ('mediaSession' in navigator && 'MediaMetadata' in window) {
    navigator.mediaSession.metadata = new MediaMetadata({ title: ap.dataset.title, artist: 'Nivedkrishna Thavarayil', album: 'Unscripted', artwork: [{ src: '/podcast/cover.jpg', sizes: '3000x3000', type: 'image/jpeg' }] });
    const h = (n, f) => { try { navigator.mediaSession.setActionHandler(n, f); } catch (e) {} };
    h('play', () => a.play()); h('pause', () => a.pause());
    h('seekbackward', (d) => jump(a.currentTime - (d.seekOffset || 15))); h('seekforward', (d) => jump(a.currentTime + (d.seekOffset || 15)));
    h('seekto', (d) => jump(d.seekTime));
  }
  paint();
}

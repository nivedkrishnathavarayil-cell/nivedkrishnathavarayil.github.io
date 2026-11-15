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
  $$('h1.d, h2.d').forEach((h) => {
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

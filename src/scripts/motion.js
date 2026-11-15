import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const $ = (q, r = document) => r.querySelector(q);
const $$ = (q, r = document) => [...r.querySelectorAll(q)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)');
const page = document.body.dataset.page;


/* ---------- header: floating pill on pages without the reel ---------- */
const hd = $('#hd');
if (hd && page !== 'home') {
  const upd = () => hd.classList.toggle('pill', scrollY > 30);
  addEventListener('scroll', upd, { passive: true });
  upd();
  const nav = $('#nav'), mb = $('#menu');
  mb?.addEventListener('click', () => {
    const o = nav.classList.toggle('open');
    mb.setAttribute('aria-expanded', o);
    mb.textContent = o ? 'Close' : 'Menu';
  });
}

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
  sps.forEach((sp) => {
    sp.addEventListener('mouseenter', () => {
      if (!fine.matches) return;
      clearTimeout(hoverT);
      hoverT = setTimeout(() => open(sp), 90);
    });
    sp.addEventListener('mouseleave', () => clearTimeout(hoverT));
    sp.addEventListener('focus', () => { if (sp.matches(':focus-visible')) open(sp); });
    sp.addEventListener('click', (e) => {
      if (!sp.classList.contains('open') && !fine.matches) {
        e.preventDefault();
        open(sp, true);
        return;
      }
      sp.style.viewTransitionName = 'm-' + sp.dataset.slug;
    });
  });
  new IntersectionObserver((es) => es.forEach((e) => {
    const sp = $('.sp.open', shelf);
    if (!sp) return;
    if (e.isIntersecting) play(sp); else stop(sp);
  }), { threshold: 0.2 }).observe(shelf);
}

/* ---------- names on the call sheet: on touch screens the circle follows the middle of the screen ---------- */
if (!fine.matches) {
  const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('on', e.isIntersecting)),
    { rootMargin: '-46% 0px -46% 0px' });
  $$('.wall .bn').forEach((el) => io.observe(el));
}

/* ---------- fit the record-light wordmark on pages without the main script ---------- */
const fits = $$('[data-fit]');
if (fits.length) {
  const fit = () => fits.forEach((el) => {
    el.style.fontSize = '100px';
    const spans = $$(':scope>span', el);
    const block = getComputedStyle(spans[0]).display === 'block';
    let w;
    if (block) w = Math.max(...spans.map((s) => s.getBoundingClientRect().width));
    else { const r = document.createRange(); r.selectNodeContents(el); w = r.getBoundingClientRect().width; }
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

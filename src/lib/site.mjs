import C from './consts.json';
import raw from '../partials/home.html?raw';

export const SITE = (import.meta.env.SITE || 'https://nivedkrishnathavarayil.com').replace(/\/$/, '');
export const NAME = 'Nivedkrishna Thavarayil';
export const ICON = C.icon;
export const PERSON = JSON.parse(JSON.stringify(C.person).replaceAll('https://nivedkrishnathavarayil.com', SITE));

export const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/* the hand-drawn circles from the original site */
export const SEL = `<span class="sel"><svg viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="${C.LOOP}"/></svg></span>`;
export const SELW = `<span class="sel"><svg viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="${C.WIDE}"/></svg></span>`;

/* ---------- home markup, split around the new sections ---------- */
const body = raw.replace(/^[\s\S]*?<body[^>]*>\s*/, '').replace(/<div class="scrim"[\s\S]*$/, '');
export const homeBody = body;

/* the header, re-pointed at the home page for use on other pages */
export const headerHTML = (() => {
  const m = body.match(/<header class="hd" id="hd">[\s\S]*?<\/header>/);
  return m[0]
    .replace('class="hd"', 'class="hd ink"')
    .replace(/href="#top"/g, 'href="/"')
    .replace(/href="#/g, 'href="/#');
})();

/* ---------- 1. statement that reads itself as you scroll ---------- */
export const statementHTML = `
<section class="stmt" id="statement" aria-label="What I do, in one line">
  <div class="wrap">
    <p class="stmt-t d" id="stmt">I direct short-form series, and I build the strategy that gets them <span class="mkw">watched.${SEL}</span> The hook, the shoot, the cut and the paid push all come from one desk in New York.</p>
  </div>
</section>`;

/* ---------- 2. names on the call sheet ---------- */
export const BRANDS = [
  ['Canvas', 'Streaming app'],
  ['Sony Pictures India', 'Film releases'],
  ['Netflix India', 'Streaming'],
  ['Prime Video', 'Streaming'],
  ['Zee5', 'Streaming'],
  ['Zomato', 'Food delivery'],
  ['Swiggy', 'Food delivery'],
  ['Durex', 'Consumer brand'],
  ['Xiaomi', 'Tech'],
  ['OnePlus', 'Tech'],
  ['Infamous Coconuts', 'Film studio'],
  ['Fetchy', 'AI app'],
  ['Frangos Peri-Peri', 'Restaurant'],
  ['Michael Samen', 'Mentalist'],
  ['Brick Lane Curry House', 'Restaurant'],
  ['Sapphire Banquet NY', 'Banquet hall'],
  ['Jaipore Royal', 'Restaurant'],
  ['NH44 Indian', 'Restaurant'],
  ['Paratha Junction', 'Restaurant'],
  ['LR Legacy Group', 'Real estate'],
  ['Cora the Borzoi', 'Pet influencer'],
  ['Kavikara', 'Wedding platform'],
  ['AS IF Magazine', 'Fashion magazine'],
  ['Ophelia Model Management', 'Model agency'],
  ['RTC Sports Academy', 'Sports academy'],
];

export const brandsHTML = `
<section class="band brands" id="brands" aria-labelledby="brands-h">
  <div class="wrap">
    <h2 class="d" id="brands-h">Names on the call sheet.</h2>
    <ul class="wall">${BRANDS.map(
      ([n, k]) => `<li class="bw"><span class="bn">${esc(n)}${SELW}</span><span class="bk">${esc(k)}</span></li>`
    ).join('')}</ul>
  </div>
</section>`;

/* ---------- 3. the series shelf ---------- */
export const shelfHTML = (S) =>
  `<div class="shelf" id="shelf">${S.map((s, i) => {
    const n = String(i + 1).padStart(2, '0');
    const art = s.poster
      ? `<img src="${s.poster}" alt="" loading="lazy" decoding="async" width="540" height="960">`
      : '';
    const vid = s.vid
      ? `<video data-src="${s.vid}" muted loop playsinline preload="none" aria-hidden="true" tabindex="-1"></video>`
      : '';
    return `<a class="sp${s.poster ? ' art' : ` ${s.cls || ''}`}${i === 0 ? ' open' : ''}" href="/series/${s.slug}/" data-slug="${s.slug}" aria-label="${esc(s.t)}, ${esc(s.fmt)}, ${esc(s.st === 'Streaming' ? 'streaming now on Canvas' : 'coming soon to Canvas')}">
  <span class="spm" aria-hidden="true">${art}${vid}</span>
  <span class="spn" aria-hidden="true">No. ${n}${s.live ? '<i class="rec"></i>' : ''}</span>
  <span class="spt d" aria-hidden="true">${esc(s.t)}</span>
  <span class="spx" aria-hidden="true"><b class="d">${esc(s.t)}</b><span class="spf">${esc(s.fmt)}. ${esc(s.city)}.</span><span class="spl">${esc(s.log)}</span><span class="spg">${
      s.live ? `<span class="mk">Streaming on Canvas${SEL}</span>` : 'Coming soon'
    }<u>Open the series</u></span></span>
</a>`;
  }).join('')}</div>`;

/* ---------- schema ---------- */
const eps = (fmt) => {
  const m = /(\d+)\s+episodes/i.exec(fmt || '');
  return m ? +m[1] : undefined;
};
export const seriesLD = (s, i) => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'TVSeries',
      '@id': `${SITE}/series/${s.slug}/#series`,
      name: s.t,
      url: `${SITE}/series/${s.slug}/`,
      description: s.log,
      genre: s.fmt.split(',')[0],
      ...(eps(s.fmt) ? { numberOfEpisodes: eps(s.fmt) } : {}),
      ...(s.poster ? { image: SITE + s.poster } : {}),
      ...(s.vid
        ? {
            trailer: {
              '@type': 'VideoObject',
              name: `${s.t} trailer`,
              description: s.log,
              thumbnailUrl: SITE + (s.poster || '/og.jpg'),
              contentUrl: SITE + s.vid,
              uploadDate: '2026-10-10',
            },
          }
        : {}),
      director: { '@id': `${SITE}/#person` },
      productionCompany: { '@type': 'Organization', name: 'Canvas', url: 'https://www.canvasott.com' },
      locationCreated: { '@type': 'Place', name: s.city },
      ...(s.link ? { sameAs: s.link[1] } : {}),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: NAME, item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Series', item: `${SITE}/#series` },
        { '@type': 'ListItem', position: 3, name: s.t, item: `${SITE}/series/${s.slug}/` },
      ],
    },
    { ...PERSON, '@id': `${SITE}/#person` },
  ],
});

export const homeLD = (S) => ({
  '@context': 'https://schema.org',
  '@graph': [
    PERSON,
    { '@type': 'WebSite', '@id': `${SITE}/#site`, url: `${SITE}/`, name: NAME, publisher: { '@id': `${SITE}/#person` } },
    {
      '@type': 'ItemList',
      name: 'Series directed by Nivedkrishna Thavarayil',
      itemListElement: S.map((s, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}/series/${s.slug}/`, name: s.t })),
    },
    {
      '@type': 'Movie',
      name: 'The Last Pizza',
      director: { '@id': `${SITE}/#person` },
      author: { '@id': `${SITE}/#person` },
      dateCreated: '2024',
    },
  ],
});

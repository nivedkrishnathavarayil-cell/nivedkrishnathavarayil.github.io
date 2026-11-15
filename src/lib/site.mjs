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
  ['Canvas', 'Streaming app', '#series'],
  ['Sony Pictures India', 'Film releases', '#c-sony'],
  ['Netflix India', 'Streaming', '#c-wldd'],
  ['Prime Video', 'Streaming', '#c-wldd'],
  ['Zee5', 'Streaming', '#c-wldd'],
  ['Zomato', 'Food delivery', '#c-wldd'],
  ['Swiggy', 'Food delivery', '#c-wldd'],
  ['Durex', 'Consumer brand', '#c-wldd'],
  ['Xiaomi', 'Tech', '#c-wldd'],
  ['OnePlus', 'Tech', '#c-wldd'],
  ['Infamous Coconuts', 'Film studio', '#c-coconuts'],
  ['Fetchy', 'AI app', '#c-fetchy'],
  ['Frangos Peri-Peri', 'Restaurant', '#c-frangos'],
  ['Michael Samen', 'Mentalist', '#c-samen'],
  ['Brick Lane Curry House', 'Restaurant', '#c-bricklane'],
  ['Sapphire Banquet NY', 'Banquet hall', '#c-sapphire'],
  ['Jaipore Royal', 'Restaurant', '#c-jaipore'],
  ['NH44 Indian', 'Restaurant', '#c-jaipore'],
  ['Paratha Junction', 'Restaurant'],
  ['LR Legacy Group', 'Real estate', '#c-lr'],
  ['Cora the Borzoi', 'Pet influencer', '#also'],
  ['Kavikara', 'Wedding platform', '#also'],
  ['AS IF Magazine', 'Fashion magazine', '#also'],
  ['Ophelia Model Management', 'Model agency'],
  ['RTC Sports Academy', 'Sports academy'],
];

export const brandsHTML = `
<section class="band brands" id="brands" aria-labelledby="brands-h">
  <div class="wrap">
    <h2 class="d" id="brands-h">Brands I've worked with.</h2>
    <p class="lede">Studios, streamers, restaurants and founders, in New York and India. On a film set, this list would be the call sheet.</p>
    <ul class="wall">${BRANDS.map(
      ([n, k, h]) => `<li class="bw">${h ? `<a class="bwa" href="${h}" aria-label="${esc(n)}: see the work"></a>` : ''}<span class="bn">${esc(n)}${SELW}</span><span class="bk">${esc(k)}</span></li>`
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
  }).join('')}</div>${inEditHTML(S)}`;

/* phones: the series still in post sit in a short list instead of five tall title cards */
const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const inEditHTML = (S) => {
  const L = S.filter((s) => !s.poster);
  if (!L.length) return '';
  return `<div class="inedit" aria-labelledby="ie-h">
  <h3 class="d" id="ie-h">In the edit.</h3>
  <p class="iel">${WORDS[L.length] || L.length} more series are in post-production and coming to Canvas. Swipe through.</p>
  <ul class="ie-rail">${L.map((s) => `<li><a class="iecard ie-${s.slug}" href="/series/${s.slug}/" aria-label="${esc(s.t)}, ${esc(s.fmt)}, in post-production"><span class="ie-art" aria-hidden="true"></span><span class="ie-badge" aria-hidden="true"><i></i>In post</span><span class="ie-body" aria-hidden="true"><b class="d">${esc(s.t)}</b><span>${esc(s.fmt)}. ${esc(s.city)}.</span><span class="ie-tl"><i></i></span></span></a></li>`).join('')}</ul>
</div>`;
};

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
              thumbnailUrl: SITE + (s.poster || '/og/home.jpg'),
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
    { ...PERSON, subjectOf: C.press },
    {
      '@type': 'ProfilePage',
      '@id': `${SITE}/#profile`,
      url: `${SITE}/`,
      name: 'Nivedkrishna Thavarayil, Creative Strategist and Director, New York',
      mainEntity: { '@id': `${SITE}/#person` },
      dateModified: new Date().toISOString().slice(0, 10),
    },
    { '@type': 'WebSite', '@id': `${SITE}/#site`, url: `${SITE}/`, name: NAME, publisher: { '@id': `${SITE}/#person` } },
    {
      '@type': 'ItemList',
      name: 'Series directed by Nivedkrishna Thavarayil',
      itemListElement: S.map((s, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}/series/${s.slug}/`, name: s.t })),
    },
    {
      '@type': 'Movie',
      name: 'The Last Pizza',
      description: 'On his last delivery of the night, a pizza guy gets trapped on a freezing Manhattan rooftop with a dying phone and nothing but the order.',
      genre: 'Survival thriller',
      director: { '@id': `${SITE}/#person` },
      author: { '@id': `${SITE}/#person` },
      dateCreated: '2024',
      image: `${SITE}/media/lastpizza_239.jpg`,
      sameAs: 'https://www.imdb.com/title/tt35961624/',
    },
    {
      '@type': 'Movie',
      name: 'Frames of Silence',
      description: "An aspiring actress is pulled into a celebrated director's games, where art and mentorship blur into manipulation.",
      genre: 'Psychological drama',
      director: { '@id': `${SITE}/#person` },
      author: { '@id': `${SITE}/#person` },
      dateCreated: '2025',
      sameAs: ['https://www.imdb.com/title/tt43522685/', 'https://youtu.be/w4IGrik_Qho'],
    },
    {
      '@type': 'Movie',
      name: 'Unspoken Distance',
      genre: 'Drama',
      director: { '@id': `${SITE}/#person` },
      author: { '@id': `${SITE}/#person` },
      dateCreated: '2024',
      sameAs: 'https://www.imdb.com/title/tt35963429/',
    },
    {
      '@type': 'Movie',
      name: 'Love Is Stronger Than Hate',
      genre: 'Drama',
      dateCreated: '2025',
      director: { '@type': 'Person', name: 'Yoey Garfield' },
      contributor: { '@id': `${SITE}/#person` },
      image: `${SITE}/media/listh_still.jpg`,
      sameAs: 'https://www.imdb.com/title/tt38273553/',
    },
  ],
});

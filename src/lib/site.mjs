import C from './consts.json';
import FILMS from '../data/films.json';
import raw from '../partials/home.html?raw';

export const SITE = (import.meta.env.SITE || 'https://nivedkrishnathavarayil.com').replace(/\/$/, '');
export const NAME = 'Nivedkrishna Thavarayil';
/* where the Unscripted podcast lives; add Apple Podcasts here once it's published */
export const PODCAST = {
  name: 'Nivedkrishna Thavarayil, Unscripted',
  page: '/podcast/',
  spotify: 'https://open.spotify.com/show/5BVbdPSHlbD08yEf0LWZgl',
  apple: 'https://podcasts.apple.com/us/podcast/nivedkrishna-thavarayil-unscripted/id6837049334',
  youtube: 'https://www.youtube.com/playlist?list=PLJGDPbW_pVLU',
  podcastIndex: 'https://podcastindex.org/podcast/8123029',
};
/* where to listen, in the order people use them */
export const LISTEN = [
  ['Spotify', PODCAST.spotify],
  ['Apple Podcasts', PODCAST.apple],
  ['YouTube', PODCAST.youtube],
  ['Podcast Index', PODCAST.podcastIndex],
];
export const ICON = C.icon;
export const PERSON = JSON.parse(JSON.stringify(C.person).replaceAll('https://nivedkrishnathavarayil.com', SITE));

/* search descriptions: end on the last full sentence that fits, else on a whole word */
export const metaClip = (t, n = 156, min = 60) => {
  t = String(t).replace(/\s+/g, ' ').trim();
  if (t.length <= n) return t;
  const re = /[.!?]["')\u201d]?(?= [A-Z0-9"\u201c$])/g;
  let end = -1;
  for (let m; (m = re.exec(t)) && m.index + m[0].length <= n; ) end = m.index + m[0].length;
  if (end >= min) return t.slice(0, end);
  return t.slice(0, t.lastIndexOf(' ', n - 1)).replace(/[,.;:]$/, '') + '...';
};
export const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/* the hand-drawn circles from the original site */
export const SEL = `<span class="sel"><svg viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="${C.LOOP}"/></svg></span>`;
export const SELW = `<span class="sel"><svg viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="${C.WIDE}"/></svg></span>`;

/* Press coverage: one list (src/data/press.json) feeds the home Press section and /press/ */
const h = (t = '') => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const pressHTML = (list) =>
  list
    .map(
      (p) =>
        `<a class="pr" href="${h(p.url)}"><span class="o">${h(p.outlet)}${SEL}</span><span class="h">${h(p.title)}${p.note ? `<small>${h(p.note)}</small>` : ''}</span><span class="dt">${h(p.date)}</span></a>`,
    )
    .join('');

/* ---------- home markup, split around the new sections ---------- */
const body = raw.replace(/^[\s\S]*?<body[^>]*>\s*/, '').replace(/<div class="scrim"[\s\S]*$/, '');
export const homeBody = body;

/* the header, re-pointed at the home page for use on other pages */
export const headerHTML = (() => {
  const m = body.match(/<header class="hd" id="hd">[\s\S]*?<\/header>/);
  return m[0]
    .replace('class="hd"', 'class="hd ink"')
    .replace(/href="#top"/g, 'href="/"')
    .replace(/href="#/g, 'href="/#')
    .replace('href="/#press"', 'href="/press/"');
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
  ['Sony Pictures India', 'Film releases', '/work/the-popes-exorcist/'],
  ['Netflix India', 'Streaming', '#c-wldd'],
  ['Prime Video', 'Streaming', '#c-wldd'],
  ['Zee5', 'Streaming', '#c-wldd'],
  ['Zomato', 'Food delivery', '#c-wldd'],
  ['Swiggy', 'Food delivery', '#c-wldd'],
  ['Durex', 'Consumer brand', '/work/thank-you-durex/'],
  ['Xiaomi', 'Tech', '#c-wldd'],
  ['OnePlus', 'Tech', '#c-wldd'],
  ['Infamous Coconuts', 'Film studio', '/work/infamous-coconuts/'],
  ['Fetchy', 'AI app', '/work/fetchy/'],
  ['Frangos Peri-Peri', 'Restaurant', '/work/frangos-world-cup/'],
  ['Michael Samen', 'Mentalist', '#c-samen'],
  ['Brick Lane Curry House', 'Restaurant', '/work/brick-lane-phaal/'],
  ['Sapphire Banquet NY', 'Banquet hall', '#c-sapphire'],
  ['Jaipore Royal', 'Restaurant', '#c-jaipore'],
  ['NH44 Indian', 'Restaurant', '#c-jaipore'],
  ['Paratha Junction', 'Restaurant', '#also'],
  ['LR Legacy Group', 'Real estate', '#c-lr'],
  ['Cora the Borzoi', 'Pet influencer', '#also'],
  ['Kavikara', 'Wedding platform', '#also'],
  ['AS IF Magazine', 'Fashion magazine', '#also'],
  ['Ophelia Model Management', 'Model agency', '#also'],
  ['RTC Sports Academy', 'Sports academy', '#also'],
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


/* who's in it: credits used in image descriptions (only names already public on the site) */
export const SERIES_CREDITS = {
  'face-value': 'with creative directors Nivedkrishna Thavarayil and Kamya Mehra, shot by Kais Vasaya',
  'demo-day': 'produced by and starring Abhinav Singla, shot by Kais Vasaya',
  'dear-nyc': 'with Ruhani Sharma',
  'red-flags': 'with creator Robert Maxwell',
  'taser-fight-championship': 'shot at a live fight event in Baltimore',
};
const kindOf = (fmt) => String(fmt || 'series').split(',')[0].trim().toLowerCase();
const aOrAn = (w) => (/^[aeiou]/i.test(w) ? 'an' : 'a');
export const seriesAlt = (s) => {
  const k = kindOf(s.fmt);
  const credit = SERIES_CREDITS[s.slug] ? `, ${SERIES_CREDITS[s.slug]}` : '';
  return `${s.t}, ${aOrAn(k)} ${k} directed by Nivedkrishna Thavarayil for Canvas${credit}`;
};

/* ---------- case studies: every campaign told start to finish ---------- */
import CASES from '../data/cases.json';
import POSTS from '../data/posts.json';
export const casesHTML = `
<section class="band cases" id="cases" aria-labelledby="cases-h">
  <div class="wrap">
    <h2 class="d" id="cases-h">Six campaigns, start to finish.</h2>
    <p class="lede">The brief, the idea, how it was made and what it did. Open any one for the whole story.</p>
    <ul class="cs-rail">${CASES.filter((c) => c.home !== false).map((c) => `<li><a class="cscard" href="/work/${c.slug}/" style="--c:${c.color}"><span class="cscard-b">${esc(c.brand)}</span><span class="cscard-mid"><span class="cscard-n d">${esc(c.stat)}</span><span class="cscard-c">${esc(c.statCap)}</span></span><span class="cscard-t">${esc(c.title)}</span><span class="cscard-go">Read the case study</span></a></li>`).join('')}</ul>
    <div class="cs-next"><a class="btn" href="/work/">See all work</a>${(() => {
      const p = [...POSTS].sort((a, b) => b.date.localeCompare(a.date))[0];
      return p ? `<p class="cs-latest"><span>Latest ${p.format === 'take' ? 'take' : 'story'}</span><a href="/work/${p.slug}/">${esc(p.title.replace(/\.$/, ''))}</a></p>` : '';
    })()}</div>
  </div>
</section>`;

/* ---------- 3. the series shelf ---------- */
export const shelfHTML = (S) =>
  `<div class="shelf" id="shelf">${S.map((s, i) => {
    const n = String(i + 1).padStart(2, '0');
    const art = s.poster
      ? `<img src="${s.poster}" alt="${esc(seriesAlt(s))}" loading="lazy" decoding="async" width="540" height="960">`
      : '';
    const vid = s.vid
      ? `<video data-src="${s.vid}" muted loop playsinline preload="none" aria-hidden="true" tabindex="-1"></video>`
      : '';
    return `<a class="sp${s.poster ? ' art' : ` ${s.cls || ''}`}${i === 0 ? ' open' : ''}" href="/series/${s.slug}/" data-slug="${s.slug}">
  <span class="spm" aria-hidden="true">${art}${vid}</span>
  <span class="spn" aria-hidden="true">No. ${n}${s.live ? '<i class="rec"></i>' : ''}</span>
  <span class="spt d" aria-hidden="true">${esc(s.t)}</span>
  <span class="spx"><b class="d">${esc(s.t)}</b><span class="spf">${esc(s.fmt)}. ${esc(s.city)}.</span><span class="spl">${esc(s.log)}</span><span class="spg">${
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
  <ul class="ie-rail">${L.map((s) => `<li><a class="iecard ie-${s.slug}" href="/series/${s.slug}/"><span class="ie-art" aria-hidden="true"></span><span class="ie-badge"><i></i>In post</span><span class="ie-body"><b class="d">${esc(s.t)}</b><span>${esc(s.fmt)}. ${esc(s.city)}.</span><span class="ie-tl"><i></i></span></span></a></li>`).join('')}</ul>
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
      dateModified: new Date().toISOString(),
    },
    {
      '@type': 'PodcastSeries',
      '@id': `${SITE}/#podcast`,
      name: PODCAST.name,
      url: `${SITE}${PODCAST.page}`,
      webFeed: `${SITE}/podcast.xml`,
      author: { '@id': `${SITE}/#person` },
      sameAs: [PODCAST.spotify, PODCAST.apple, PODCAST.youtube, PODCAST.podcastIndex],
    },
    { '@type': 'WebSite', '@id': `${SITE}/#site`, url: `${SITE}/`, name: NAME, alternateName: ['NKT', 'Nived Thavarayil'], publisher: { '@id': `${SITE}/#person` } },
    {
      '@type': 'ItemList',
      name: 'Series directed by Nivedkrishna Thavarayil',
      itemListElement: S.map((s, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}/series/${s.slug}/`, name: s.t })),
    },
    ...FILMS.filter((f) => !f.director).map((f) => ({
      '@type': 'Movie',
      name: f.name,
      description: f.description,
      genre: f.genre,
      director: { '@id': `${SITE}/#person` },
      ...(f.year ? { dateCreated: f.year } : {}),
      image: `${SITE}/media/${f.img}`,
      ...(f.cast.length ? { actor: f.cast.map((n) => ({ '@type': 'Person', name: n })) } : {}),
      sameAs: [`https://www.youtube.com/watch?v=${f.yt}`, ...(f.imdb ? [`https://www.imdb.com/title/${f.imdb}/`] : [])],
    })),
    ...FILMS.filter((f) => f.director).map((f) => ({
      '@type': 'Movie',
      name: f.name,
      genre: f.genre,
      dateCreated: f.year,
      director: { '@type': 'Person', name: f.director },
      contributor: { '@id': `${SITE}/#person` },
      actor: f.cast.map((n) => ({ '@type': 'Person', name: n })),
      image: `${SITE}/media/${f.img}`,
      sameAs: [`https://www.youtube.com/watch?v=${f.yt}`, `https://www.imdb.com/title/${f.imdb}/`],
    })),
  ],
});

/* ---------- share bar: every case study and article can be passed on ---------- */
export const shareHTML = (url, title, { label = 'Share this', id = 'share', compact = false } = {}) => {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const both = encodeURIComponent(`${title} ${url}`);
  const nets = [
    ['LinkedIn', `https://www.linkedin.com/sharing/share-offsite/?url=${u}`],
    ['Facebook', `https://www.facebook.com/sharer/sharer.php?u=${u}`],
    ['Threads', `https://www.threads.net/intent/post?text=${both}`],
    ['X', `https://x.com/intent/post?text=${t}&url=${u}`],
    ['WhatsApp', `https://wa.me/?text=${both}`],
    ['Email', `mailto:?subject=${t}&body=${both}`],
  ].filter(([n]) => !compact || n === 'LinkedIn');
  return `<div class="share${compact ? ' share-c' : ''}" role="group" aria-labelledby="${id}-l"><p class="share-l" id="${id}-l">${esc(label)}</p><ul class="share-list">`
    + `<li class="share-native" hidden><button type="button" class="share-b solid" data-share-url="${esc(url)}" data-share-title="${esc(title)}" data-goatcounter-click="share-native">Share</button></li>`
    + nets.map(([n, h]) => `<li><a class="share-b" href="${esc(h)}" target="_blank" rel="noopener" data-goatcounter-click="share-${n.toLowerCase()}" aria-label="Share on ${n}">${n}</a></li>`).join('')
    + `<li><button type="button" class="share-b" data-copy="${esc(url)}" data-goatcounter-click="share-copy">Copy link</button></li>`
    + `</ul><p class="share-ok" aria-live="polite"></p></div>`;
};

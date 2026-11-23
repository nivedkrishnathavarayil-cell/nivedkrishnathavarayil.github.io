/* Unscripted episode copy, built once and used everywhere: the RSS feed (Spotify, Apple Podcasts,
   Podcast Index read it) gets HTML with links, YouTube gets plain text with full URLs and tags.
   Facts come only from the article itself and src/data/podcast.json. No new claims here. */

const md = (t) => (Array.isArray(t) ? t.join(' ') : String(t));
export const plain = (t) => md(t).replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const clean = (h) => plain(h).replace(/^\d+\.\s*/, '').replace(/[.:]$/, '').trim();

export const CALENDLY = 'https://calendly.com/nivedkrishnathavarayil/30min';
export const SUBSCRIBE = 'https://www.youtube.com/@nivedkrishnathavarayil5851?sub_confirmation=1';
export const BIO = [
  'Nivedkrishna Thavarayil (tvedukr_12 on Instagram) is a Creative Strategist and Director in New York: paid and organic social, short-form video, AI video production, brand and influencer marketing, and 12+ micro dramas and short docuseries directed for Canvas.',
  'He founded Thava Studio, a creative studio in New York for restaurants, founders and brands.',
  'Every episode is narrated with his own ElevenLabs voice clone, from the story on his website.',
];

/* links the article itself makes to series and case pages, plus the episode's own picks */
export function mentioned(post, ep, { SITE, series, cases, posts }) {
  const S = Object.fromEntries(series.map((s) => [s.slug, s.t]));
  const C = Object.fromEntries(cases.map((c) => [c.slug, `${c.short} case study`]));
  const P = Object.fromEntries(posts.map((p) => [p.slug, p.title.replace(/\.$/, '')]));
  const out = [];
  const seen = new Set();
  const add = (label, url) => {
    const abs = url.startsWith('/') ? SITE + url : url;
    if (!label || seen.has(abs) || abs === `${SITE}/work/${post.slug}/`) return;
    seen.add(abs);
    out.push([label, abs]);
  };
  for (const [, path, kind, slug] of JSON.stringify(post.body).matchAll(/\]\((\/(series|work)\/([a-z0-9-]+)\/)\)/g)) {
    add(kind === 'series' ? S[slug] && `${S[slug]}, the series` : C[slug] || P[slug], path);
  }
  for (const [label, url] of ep.links || []) add(label, url);
  return out;
}

export function episodeCopy(post, ep, ctx) {
  const { SITE, LISTEN, follow } = ctx;
  const url = `${SITE}/work/${post.slug}/`;
  const first = plain(post.body.find((b) => b[0] === 'p')[1]);
  const topics = post.body.filter((b) => b[0] === 'h2').map((b) => clean(b[1])).filter(Boolean);
  const links = mentioned(post, ep, ctx);
  const title = post.title.replace(/\.$/, '');
  const a = (label, u) => `<a href="${esc(u)}">${esc(label)}</a>`;

  const html = [
    `<p>${esc(ep.intro)}</p>`,
    `<p>${esc(first)}</p>`,
    topics.length ? `<p><strong>In this episode</strong></p><ul>${topics.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : '',
    `<p><strong>Read the full story, with photos and video:</strong> ${a(title, url)}</p>`,
    links.length ? `<p><strong>Mentioned in this episode:</strong> ${links.map(([l, u]) => a(l, u)).join(' · ')}</p>` : '',
    `<p><strong>About the host:</strong> ${esc(BIO.join(' '))}</p>`,
    `<p><strong>Work with Nivedkrishna:</strong> ${a('Book a 30-minute call', CALENDLY)} · ${a('Thava Studio', `${SITE}/work-with-me/`)} · ${a('nivedkrishnathavarayil.com', `${SITE}/`)}</p>`,
    `<p><strong>Follow Nivedkrishna Thavarayil:</strong> ${follow.map(([l, u]) => a(l, u)).join(' · ')}</p>`,
    `<p><strong>Listen to Unscripted:</strong> ${LISTEN.map(([l, u]) => a(l, u)).join(' · ')} · ${a('All episodes', `${SITE}/podcast/`)}</p>`,
  ].filter(Boolean).join('');

  const handle = (l) => l.replace(/ @(\S+)$/, ' ($1)');
  const text = [
    ep.intro,
    first,
    topics.length ? `In this episode:\n${topics.map((t) => `• ${t}`).join('\n')}` : '',
    `Read the full story, with photos and video:\n${url}`,
    links.length ? `Mentioned in this episode:\n${links.map(([l, u]) => `• ${l}: ${u}`).join('\n')}` : '',
    `Listen to Unscripted:\n${LISTEN.filter(([l]) => l !== 'YouTube').map(([l, u]) => `${l}: ${u}`).join('\n')}\nAll episodes: ${SITE}/podcast/\nSubscribe on YouTube: ${SUBSCRIBE}`,
    `About the host:\n${BIO.join(' ')}`,
    `Work with Nivedkrishna:\nBook a 30-minute call: ${CALENDLY}\nThava Studio: ${SITE}/work-with-me/`,
    `Follow Nivedkrishna Thavarayil:\n${follow.filter(([l]) => l !== 'YouTube').map(([l, u]) => `${handle(l)}: ${u}`).join('\n')}`,
    (ep.hashtags || []).join(' '),
  ].filter(Boolean).join('\n\n');

  const tags = [...(ctx.commonTags || []), ...(ep.tags || [])];
  return { url, title, html, text, tags, keywords: [...new Set([...(ep.tags || []).slice(0, 6), 'Nivedkrishna Thavarayil', 'tvedukr_12'])].join(', ') };
}

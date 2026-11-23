import P from '../data/posts.json';
import S from '../data/series.json';
import CASES from '../data/cases.json';
import POD from '../data/podcast.json';
import { SITE, LISTEN } from '../lib/site.mjs';
import { episodeCopy, CALENDLY } from '../lib/podcast-copy.mjs';

/* Podcast feed: every article that has an audio file becomes an episode.
   Spotify, Apple Podcasts, Podcast Index and YouTube read https://nivedkrishnathavarayil.com/podcast.xml.
   Episode copy (intro, tags, links) lives in src/data/podcast.json; the shared builder is src/lib/podcast-copy.mjs. */
const SHOW = {
  title: 'Nivedkrishna Thavarayil, Unscripted',
  author: 'Nivedkrishna Thavarayil',
  summary: POD.show.summary,
  cover: `${SITE}/podcast/cover.jpg`,
  email: 'nivedkrishnathavarayil@gmail.com',
  category: ['TV &amp; Film', 'Business'],
};
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const cdata = (t) => `<![CDATA[${String(t).replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
const ctx = { SITE, LISTEN, follow: POD.follow, commonTags: POD.commonTags, series: S, cases: CASES, posts: P };

const showHTML = [
  `<p>${esc(SHOW.summary)}</p>`,
  `<p>Read every story with photos and video: <a href="${SITE}/podcast/">nivedkrishnathavarayil.com/podcast</a></p>`,
  `<p>Follow: ${POD.follow.map(([l, u]) => `<a href="${esc(u)}">${esc(l)}</a>`).join(' · ')}</p>`,
  `<p>Work with Nivedkrishna: <a href="${CALENDLY}">book a 30-minute call</a> or see <a href="${SITE}/work-with-me/">Thava Studio</a>.</p>`,
].join('');

export function GET() {
  const eps = P.filter((p) => p.audio).sort((a, b) => (b.audio.ep || 0) - (a.audio.ep || 0) || b.date.localeCompare(a.date));
  const items = eps.map((p) => {
    const ep = POD.episodes[p.slug] || { intro: `${p.dek}`, tags: [], hashtags: [], links: [] };
    const c = episodeCopy(p, ep, ctx);
    return `    <item>
      <title>${esc(c.title)}</title>
      <itunes:title>${esc(c.title)}</itunes:title>
      <link>${c.url}</link>
      <guid isPermaLink="false">${c.url}#audio</guid>
      <pubDate>${new Date(p.audio.published || p.date).toUTCString()}</pubDate>
      <description>${cdata(c.html)}</description>
      <content:encoded>${cdata(c.html)}</content:encoded>
      <itunes:summary>${esc(ep.intro)}</itunes:summary>
      <itunes:author>${SHOW.author}</itunes:author>
      <itunes:keywords>${esc(c.keywords)}</itunes:keywords>
      <enclosure url="${SITE}${p.audio.src}" length="${p.audio.bytes}" type="audio/mpeg"/>
      <itunes:duration>${p.audio.secs}</itunes:duration>
      <itunes:explicit>false</itunes:explicit>
      <itunes:episodeType>full</itunes:episodeType>${p.audio.ep ? `
      <itunes:episode>${p.audio.ep}</itunes:episode>` : ''}
      <podcast:person role="host" href="${SITE}/" img="${SITE}/media/about/nived-on-set-1000.jpg">${SHOW.author}</podcast:person>
    </item>`;
  }).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:podcast="https://podcastindex.org/namespace/1.0">
  <channel>
    <title>${SHOW.title}</title>
    <link>${SITE}/podcast/</link>
    <atom:link href="${SITE}/podcast.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <description>${cdata(showHTML)}</description>
    <itunes:summary>${esc(SHOW.summary)}</itunes:summary>
    <itunes:subtitle>Stories from a New York creative strategist and director</itunes:subtitle>
    <itunes:keywords>${esc(POD.show.keywords)}</itunes:keywords>
    <itunes:author>${SHOW.author}</itunes:author>
    <itunes:owner><itunes:name>${SHOW.author}</itunes:name><itunes:email>${SHOW.email}</itunes:email></itunes:owner>
    <itunes:image href="${SHOW.cover}"/>
    <image><url>${SHOW.cover}</url><title>${SHOW.title}</title><link>${SITE}/</link></image>
    ${SHOW.category.map((c) => `<itunes:category text="${c}"/>`).join('\n    ')}
    <itunes:explicit>false</itunes:explicit>
    <itunes:type>episodic</itunes:type>
    <podcast:person role="host" href="${SITE}/" img="${SITE}/media/about/nived-on-set-1000.jpg">${SHOW.author}</podcast:person>
    <podcast:location>New York, NY</podcast:location>
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}

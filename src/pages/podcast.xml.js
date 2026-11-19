import P from '../data/posts.json';
import { SITE } from '../lib/site.mjs';

/* Podcast feed: every article that has an audio file becomes an episode.
   Submit https://nivedkrishnathavarayil.com/podcast.xml to Spotify for Creators, Apple Podcasts Connect and YouTube Studio once it has episodes. */
const SHOW = {
  title: 'Nivedkrishna Thavarayil, Unscripted',
  author: 'Nivedkrishna Thavarayil',
  summary: 'A New York creative strategist and director on making films, micro dramas and campaigns that people finish watching. The stories behind every shoot, written by the guy who shot them and narrated with his own ElevenLabs voice clone.',
  cover: `${SITE}/podcast/cover.jpg`,
  email: 'nivedkrishnathavarayil@gmail.com',
  category: ['TV &amp; Film', 'Business'],
};
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const plain = (t) => (Array.isArray(t) ? t.join(' ') : String(t)).replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

export function GET() {
  const eps = P.filter((p) => p.audio).sort((a, b) => b.date.localeCompare(a.date));
  const items = eps.map((p) => {
    const url = `${SITE}/work/${p.slug}/`;
    const first = plain(p.body.find((b) => b[0] === 'p')[1]);
    return `    <item>
      <title>${esc(p.title.replace(/\.$/, ''))}</title>
      <link>${url}</link>
      <guid isPermaLink="false">${url}#audio</guid>
      <pubDate>${new Date(p.audio.published || p.date).toUTCString()}</pubDate>
      <description>${esc(`${p.dek} ${first} Read it with links and photos: ${url}`)}</description>
      <enclosure url="${SITE}${p.audio.src}" length="${p.audio.bytes}" type="audio/mpeg"/>
      <itunes:duration>${p.audio.secs}</itunes:duration>
      <itunes:explicit>false</itunes:explicit>
      <itunes:episodeType>full</itunes:episodeType>
    </item>`;
  }).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SHOW.title}</title>
    <link>${SITE}/work/</link>
    <atom:link href="${SITE}/podcast.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <description>${esc(SHOW.summary)}</description>
    <itunes:author>${SHOW.author}</itunes:author>
    <itunes:owner><itunes:name>${SHOW.author}</itunes:name><itunes:email>${SHOW.email}</itunes:email></itunes:owner>
    <itunes:image href="${SHOW.cover}"/>
    <image><url>${SHOW.cover}</url><title>${SHOW.title}</title><link>${SITE}/</link></image>
    ${SHOW.category.map((c) => `<itunes:category text="${c}"/>`).join('\n    ')}
    <itunes:explicit>false</itunes:explicit>
    <itunes:type>episodic</itunes:type>
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}

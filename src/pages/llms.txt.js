import P from '../data/posts.json';
import C from '../data/cases.json';
import S from '../data/series.json';
import PRESS from '../data/press.json';
import K from '../lib/consts.json';
import { SITE, PODCAST } from '../lib/site.mjs';
import { FACTS } from '../lib/facts.mjs';

/* /llms.txt (llmstxt.org): a plain Markdown map of the site for AI assistants and answer engines.
   Built from the same data as the pages, so it never drifts from what the site says. */
const plain = (t) => String(t || '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
export function GET() {
  const p = K.person;
  const posts = [...P].sort((a, b) => b.date.localeCompare(a.date));
  const lines = [
    `# ${p.name}`,
    '',
    `> ${p.description}`,
    '',
    `Also known as: ${p.alternateName.join(', ')}.`,
    '',
    '## The short version',
    ...FACTS.map(([q, a]) => `- **${q}** ${a}`),
    '',
    '## Case studies',
    ...C.map((c) => `- [${c.brand}: ${c.title}](${SITE}/work/${c.slug}/): ${c.stat} ${c.statCap}. ${plain(c.line)}`),
    '',
    '## Articles and takes',
    ...posts.map((x) => `- [${x.title}](${SITE}/work/${x.slug}/): ${plain(x.dek)}${x.audio ? ` (also an Unscripted podcast episode, ${x.audio.label})` : ''}`),
    '',
    '## Series he directed for Canvas',
    ...S.map((s) => `- [${s.t}](${SITE}/series/${s.slug}/): ${s.fmt}. Role: ${s.role}.`),
    '',
    '## Press coverage',
    ...PRESS.filter((x) => x.kind !== 'own').map((x) => `- [${x.outlet}: ${x.title}](${x.url}), ${x.date}${x.note ? ` (${x.note})` : ''}`),
    '',
    '## More',
    `- [About](${SITE}/about/): the full story, press and profiles`,
    `- [Press kit](${SITE}/press/): bios, fast facts, photos and logos, free to use with credit`,
    `- [Work with me](${SITE}/work-with-me/): services and how to hire`,
    `- [Resume (PDF)](${SITE}/Nivedkrishna-Thavarayil-Resume.pdf)`,
    `- [Unscripted, his podcast](${SITE}${PODCAST.page}): every article read in his own voice, on [Spotify](${PODCAST.spotify}), [Apple Podcasts](${PODCAST.apple}), [YouTube](${PODCAST.youtube}), [Podcast Index](${PODCAST.podcastIndex}) and the [RSS feed](${SITE}/podcast.xml)`,
    `- [Full text of every article and case study](${SITE}/llms-full.txt)`,
    '',
    '## Profiles',
    ...p.sameAs.map((u) => `- ${u}`),
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}

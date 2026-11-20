import P from '../data/posts.json';
import C from '../data/cases.json';
import S from '../data/series.json';
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
    '## More',
    `- [About](${SITE}/about/): the full story, press and profiles`,
    `- [Work with me](${SITE}/work-with-me/): services and how to hire`,
    `- [Resume (PDF)](${SITE}/Nivedkrishna-Thavarayil-Resume.pdf)`,
    `- Unscripted, his podcast: every article read in his own voice, on [Spotify](${PODCAST.spotify}), [YouTube](${PODCAST.youtube}), [Podcast Index](${PODCAST.podcastIndex}) and the [RSS feed](${SITE}/podcast.xml)`,
    `- [Full text of every article and case study](${SITE}/llms-full.txt)`,
    '',
    '## Profiles',
    ...p.sameAs.map((u) => `- ${u}`),
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}

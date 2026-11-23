import P from '../data/posts.json';
import C from '../data/cases.json';
import K from '../lib/consts.json';
import { SITE } from '../lib/site.mjs';
import { FACTS } from '../lib/facts.mjs';

/* /llms-full.txt: the full text of every article and case study as Markdown, for AI assistants that read a whole site at once. */
const plain = (t) => String(t || '').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, a, u) => `${a} (${u.startsWith('/') ? SITE + u : u})`);
const block = (b) => {
  const [k, v] = b;
  if (k === 'p') return plain(v);
  if (k === 'h2') return `### ${v}`;
  if (k === 'quote') return `> ${plain(Array.isArray(v) ? v[0] : v)}`;
  if (k === 'ul') return (v || []).map((i) => `- ${plain(i)}`).join('\n');
  return '';
};
export function GET() {
  const out = [`# ${K.person.name}: articles and case studies`, '', `> ${K.person.description}`, ''];
  out.push('## The short version', ...FACTS.map(([q, a]) => `- **${q}** ${a}`), '');
  for (const c of C) {
    out.push(`## Case study: ${c.brand}. ${c.title}`, `URL: ${SITE}/work/${c.slug}/`, `Headline result: ${c.stat} ${c.statCap}.`, '');
    if (c.client) out.push(`Client: ${c.client}. Role: ${c.role}.`, '');
    for (const k of ['brief', 'idea']) if (c[k]) out.push(...c[k].map(plain), '');
    for (const st of [...(Array.isArray(c.story) ? c.story : c.story ? [c.story] : []), ...(c.after || [])]) out.push(`### ${st.h}`, ...(st.p || []).map(plain), ...(st.ul || []).map((x) => `- ${plain(x)}`), '');
    if (c.how) out.push('### How', ...c.how.map((x) => `- ${plain(x)}`), '');
    if (c.result) out.push('### What happened', ...c.result.map((x) => `- ${plain(x)}`), '');
    if (c.source) out.push(c.source, '');
  }
  for (const x of [...P].sort((a, b) => b.date.localeCompare(a.date))) {
    out.push(`## ${x.title}`, `URL: ${SITE}/work/${x.slug}/`, plain(x.dek), '');
    for (const b of x.body || []) { const t = block(b); if (t) out.push(t, ''); }
  }
  return new Response(out.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}

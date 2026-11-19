/* Search engines and AI assistants are all welcome: the point of this site is to be found and quoted. */
const AI = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'CCBot', 'Bingbot', 'Googlebot'];
export function GET({ site }) {
  const base = String(site).replace(/\/$/, '');
  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    ...AI.flatMap((a) => [`User-agent: ${a}`, 'Allow: /', '']),
    `Sitemap: ${base}/sitemap-index.xml`,
    '',
    `# A plain-text guide to this site for AI assistants: ${base}/llms.txt`,
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}

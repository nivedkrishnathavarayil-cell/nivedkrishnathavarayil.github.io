/* Lists the pages whose built HTML differs from what is live right now, so the deploy
   only pings IndexNow for pages that really changed. Run after `astro build`, before deploy.
   Prints a JSON array of URLs. A page that can't be fetched counts as changed. */
import { readFileSync, existsSync } from 'node:fs';

const SITE = (process.env.SITE_URL || 'https://nivedkrishnathavarayil.com').replace(/\/$/, '');
const EXTRA = ['/llms.txt', '/llms-full.txt', '/podcast.xml'];
// ignore what changes without the page's content changing: the build time and the
// hashed names of shared CSS and JS files (a style tweak renames them on every page)
const norm = (s) => s.replace(/"dateModified":"[^"]*"/g, '').replace(/\/_astro\/[^"' )]+/g, '/_astro/x');

const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const index = readFileSync('dist/sitemap-index.xml', 'utf8');
const urls = [];
for (const map of locs(index)) urls.push(...locs(readFileSync(`dist${new URL(map).pathname}`, 'utf8')));
urls.push(...EXTRA.map((p) => SITE + p));

const file = (u) => { const p = new URL(u).pathname; return `dist${p.endsWith('/') ? p + 'index.html' : p}`; };
const changed = [];
await Promise.all([...new Set(urls)].map(async (u) => {
  const f = file(u);
  if (!existsSync(f)) return;
  try {
    const r = await fetch(u, { cache: 'no-store', signal: AbortSignal.timeout(15000) });
    if (!r.ok || norm(await r.text()) !== norm(readFileSync(f, 'utf8'))) changed.push(u);
  } catch { changed.push(u); }
}));
console.log(JSON.stringify(changed.sort()));

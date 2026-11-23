/* Prints the YouTube copy for every Unscripted episode as JSON:
   { slug: { yt, title, description, tags } }. Paste or apply these in YouTube Studio.
   Run: node tools/podcast/youtube.mjs [slug] */
import fs from 'node:fs';
import { episodeCopy } from '../../src/lib/podcast-copy.mjs';

const read = (f) => JSON.parse(fs.readFileSync(new URL(`../../src/data/${f}`, import.meta.url)));
const SITE = (process.env.SITE_URL || 'https://nivedkrishnathavarayil.com').replace(/\/$/, '');
const site = fs.readFileSync(new URL('../../src/lib/site.mjs', import.meta.url), 'utf8');
const pick = (k) => site.match(new RegExp(`${k}: '([^']+)'`))[1];
const LISTEN = [['Spotify', pick('spotify')], ['Apple Podcasts', pick('apple')], ['YouTube', pick('youtube')], ['Podcast Index', pick('podcastIndex')]];
const POD = read('podcast.json');
const posts = read('posts.json');
const ctx = { SITE, LISTEN, follow: POD.follow, commonTags: POD.commonTags, series: read('series.json'), cases: read('cases.json'), posts };
const only = process.argv[2];
const out = {};
for (const p of posts.filter((x) => x.audio && POD.episodes[x.slug] && (!only || x.slug === only))) {
  const ep = POD.episodes[p.slug];
  const c = episodeCopy(p, ep, ctx);
  if (/[<>]/.test(c.text)) throw new Error(`${p.slug}: YouTube descriptions can't contain < or >`);
  const tagLen = c.tags.reduce((n, t) => n + t.length + (t.includes(' ') ? 2 : 0), 0) + c.tags.length - 1;
  out[p.slug] = { yt: ep.yt, title: c.title, description: c.text, chars: c.text.length, tags: c.tags, tagChars: tagLen };
}
console.log(JSON.stringify(out, null, 1));

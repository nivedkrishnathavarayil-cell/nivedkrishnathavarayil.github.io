/* Sends the changed URLs (JSON array in CHANGED) to IndexNow, which shares them with Bing,
   Yandex, Seznam, Naver and Yep. Run after the deploy is live. */
const SITE = (process.env.SITE_URL || 'https://nivedkrishnathavarayil.com').replace(/\/$/, '');
const KEY = '5ac611aa88be386d266fa4391dbf3fee';
const urlList = JSON.parse(process.env.CHANGED || '[]');
if (!urlList.length) { console.log('IndexNow: nothing changed'); process.exit(0); }
const r = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: new URL(SITE).host, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList }),
});
console.log(`IndexNow: ${r.status} for ${urlList.length} URL(s)`);
urlList.forEach((u) => console.log('  ' + u));
// 200 and 202 both mean accepted
if (r.status !== 200 && r.status !== 202) process.exit(1);

"""Share preview for one case study, in the same style as the existing /og/work-<case>.jpg images.
Usage: python3 tools/og/gen_case.py <slug>"""
import asyncio, html, json, os, sys
from playwright.async_api import async_playwright
REPO = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..') + '/'
slug = sys.argv[1]
c = [x for x in json.load(open(REPO + 'src/data/cases.json')) if x['slug'] == slug][0]
PATH = 'M83.71,64.32 L110.76,100 L137.11,100 L96.43,46.33 L129.20,0 L103.48,0 L72,44.51 L72,0 L54,0 L54,64.71 L21,0 L0,0 L0,100 L18,100 L18,35.29 L51,100 L72,100 L72,80.87ZM166,100 L166,0 L148,0 L148,100Z'
logo = f'<svg viewBox="0 0 197 100" width="110"><path fill="#fff" d="{PATH}"/><rect x="117" y="0" width="80" height="18" fill="#ff4438"/></svg>'
fonts = REPO + 'public/fonts/'
page = f'''<!doctype html><html><head><meta charset=utf-8><style>
@font-face{{font-family:Anybody;font-weight:100 900;font-stretch:50% 150%;src:url(file://{fonts}anybody.woff2)}}
@font-face{{font-family:"Hanken Grotesk";font-weight:100 900;src:url(file://{fonts}hanken-grotesk.woff2)}}
html,body{{margin:0;width:1200px;height:630px;overflow:hidden}}p{{margin:0}}
body{{position:relative;color:#fff;font-family:"Hanken Grotesk";background:radial-gradient(70% 90% at 0% 0%,rgba(255,255,255,.22),transparent 60%),radial-gradient(60% 70% at 100% 100%,rgba(0,0,0,.42),transparent 70%),{c['color']}}}
.lg{{position:absolute;left:64px;top:56px}}
.k{{position:absolute;left:64px;top:146px;font-size:22px;font-weight:600;opacity:.92}}
.n{{position:absolute;left:58px;top:212px;font-family:Anybody;font-weight:850;font-stretch:118%;font-size:150px;line-height:1}}
.c{{position:absolute;left:64px;top:392px;font-size:26px;font-weight:600}}
.t{{position:absolute;left:64px;top:484px;font-family:Anybody;font-weight:850;font-stretch:104%;font-size:42px;line-height:1.05;max-width:1080px}}
.b{{position:absolute;left:64px;top:548px;font-size:20px;opacity:.8}}
</style></head><body><div class=lg>{logo}</div><p class=k>Case study, {html.escape(c['short'])}</p>
<p class=n>{html.escape(c['stat'])}</p><p class=c>{html.escape(c['statCap'])}</p><p class=t>{html.escape(c['title'])}</p>
<p class=b>Nivedkrishna Thavarayil, Creative Strategist and Director, New York</p></body></html>'''
tmp = '/tmp/case-og.html'; open(tmp, 'w').write(page)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        pg = await b.new_page(viewport={'width': 1200, 'height': 630})
        await pg.goto('file://' + tmp); await pg.evaluate('document.fonts.ready'); await pg.wait_for_timeout(200)
        await pg.screenshot(path=REPO + f'public/og/work-{slug}.jpg', type='jpeg', quality=85)
        await b.close()
asyncio.run(main()); print('ok', slug)

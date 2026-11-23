"""Share preview for /press/: the on-set portrait beside the press kit title.
Usage: python3 tools/og/gen_press.py"""
import asyncio, os
from playwright.async_api import async_playwright
REPO = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..') + '/'
PATH = 'M83.71,64.32 L110.76,100 L137.11,100 L96.43,46.33 L129.20,0 L103.48,0 L72,44.51 L72,0 L54,0 L54,64.71 L21,0 L0,0 L0,100 L18,100 L18,35.29 L51,100 L72,100 L72,80.87ZM166,100 L166,0 L148,0 L148,100Z'
logo = f'<svg viewBox="0 0 197 100" width="104"><path fill="#fff" d="{PATH}"/><rect x="117" y="0" width="80" height="18" fill="#ff4438"/></svg>'
fonts = REPO + 'public/fonts/'
photo = REPO + 'public/press/view-on-set-800.jpg'
page = f'''<!doctype html><html><head><meta charset=utf-8><style>
@font-face{{font-family:Anybody;font-weight:100 900;font-stretch:50% 150%;src:url(file://{fonts}anybody.woff2)}}
@font-face{{font-family:"Hanken Grotesk";font-weight:100 900;src:url(file://{fonts}hanken-grotesk.woff2)}}
html,body{{margin:0;width:1200px;height:630px;overflow:hidden}}p{{margin:0}}
body{{position:relative;color:#fff;font-family:"Hanken Grotesk";background:#000}}
img{{position:absolute;right:0;top:0;width:504px;height:630px;object-fit:cover;object-position:40% 40%}}
.lg{{position:absolute;left:64px;top:58px}}
.k{{position:absolute;left:64px;top:150px;font-size:22px;font-weight:600;opacity:.7}}
.t{{position:absolute;left:58px;top:196px;width:600px;font-family:Anybody;font-weight:850;font-stretch:108%;font-size:84px;line-height:.95}}
.l{{position:absolute;left:64px;top:430px;width:560px;font-size:25px;line-height:1.35;font-weight:600}}
.b{{position:absolute;left:64px;bottom:52px;font-size:20px;opacity:.75}}
.pill{{display:inline-block;border:2px solid #ff5a4e;color:#ff5a4e;border-radius:999px;padding:0 .4em .08em;font-size:.92em}}
</style></head><body><img src="file://{photo}"><div class=lg>{logo}</div><p class=k>Press</p>
<p class=t>Press kit.</p>
<p class=l>Bios, photos, logos and every article about the work. Free to use with credit.</p>
<p class=b>Nivedkrishna Thavarayil</p></body></html>'''
tmp = '/tmp/press-og.html'; open(tmp, 'w').write(page)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        pg = await b.new_page(viewport={'width': 1200, 'height': 630})
        await pg.goto('file://' + tmp); await pg.evaluate('document.fonts.ready'); await pg.wait_for_timeout(300)
        await pg.screenshot(path=REPO + 'public/og/press.jpg', type='jpeg', quality=86)
        await b.close()
asyncio.run(main()); print('ok')

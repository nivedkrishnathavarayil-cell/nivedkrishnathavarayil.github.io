"""Share previews for /work/, /work-with-me/ and /podcast/, so no page shares the home card.
Text is each page's own kicker and heading; images are stills already on the site.
Usage: python3 tools/og/gen_pages.py"""
import asyncio, os
from PIL import Image
from playwright.async_api import async_playwright
REPO = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..') + '/'
PATH = 'M83.71,64.32 L110.76,100 L137.11,100 L96.43,46.33 L129.20,0 L103.48,0 L72,44.51 L72,0 L54,0 L54,64.71 L21,0 L0,0 L0,100 L18,100 L18,35.29 L51,100 L72,100 L72,80.87ZM166,100 L166,0 L148,0 L148,100Z'
logo = f'<svg viewBox="0 0 197 100" width="104"><path fill="#fff" d="{PATH}"/><rect x="117" y="0" width="80" height="18" fill="#ff4438"/></svg>'
fonts = REPO + 'public/fonts/'
M = REPO + 'public/media/'

CARDS = {
    'work': ('Work', "Everything I've made, and what it taught me.",
             [M + 'posts/indie-budget.jpg', M + 'agent_x_239.jpg', M + 'posts/demo-day-harvard.jpg']),
    'work-with-me': ('Work with me', 'Strategy, short-form video and AI, from one desk.',
                     [M + 'stills/01-fv-eye.jpg', M + 'stills/02-tfc-mask.jpg', M + 'stills/03-rf-glow.jpg']),
}

def page(kick, title, stills):
    imgs = ''.join(f'<img src="file://{s}" style="top:{i * 210}px">' for i, s in enumerate(stills))
    return f'''<!doctype html><html><head><meta charset=utf-8><style>
@font-face{{font-family:Anybody;font-weight:100 900;font-stretch:50% 150%;src:url(file://{fonts}anybody.woff2)}}
@font-face{{font-family:"Hanken Grotesk";font-weight:100 900;src:url(file://{fonts}hanken-grotesk.woff2)}}
html,body{{margin:0;width:1200px;height:630px;overflow:hidden}}p{{margin:0}}
body{{position:relative;color:#fff;font-family:"Hanken Grotesk";background:#000}}
img{{position:absolute;right:0;width:504px;height:208px;object-fit:cover}}
.lg{{position:absolute;left:64px;top:58px}}
.k{{position:absolute;left:64px;top:150px;font-size:22px;font-weight:600;opacity:.7}}
.t{{position:absolute;left:58px;top:196px;width:600px;font-family:Anybody;font-weight:850;font-stretch:108%;font-size:66px;line-height:.98}}
.b{{position:absolute;left:64px;bottom:52px;font-size:20px;opacity:.75}}
</style></head><body>{imgs}<div class=lg>{logo}</div><p class=k>{kick}</p>
<p class=t>{title}</p>
<p class=b>Nivedkrishna Thavarayil, Creative Strategist and Director, New York</p></body></html>'''

async def main():
    async with async_playwright() as p:
        exe = '/usr/bin/google-chrome' if os.path.exists('/usr/bin/google-chrome') else None
        b = await p.chromium.launch(executable_path=exe) if exe else await p.chromium.launch()
        pg = await b.new_page(viewport={'width': 1200, 'height': 630})
        for name, (kick, title, stills) in CARDS.items():
            tmp = f'/tmp/og-{name}.html'; open(tmp, 'w').write(page(kick, title, stills))
            await pg.goto('file://' + tmp); await pg.evaluate('document.fonts.ready'); await pg.wait_for_timeout(300)
            await pg.screenshot(path=REPO + f'public/og/{name}.jpg', type='jpeg', quality=86)
        await b.close()
    # the podcast cover art, centred on its own background so wide crops keep the whole square
    cover = Image.open(REPO + 'public/podcast/cover.jpg').convert('RGB').resize((630, 630), Image.LANCZOS)
    bg = cover.getpixel((8, 8))
    card = Image.new('RGB', (1200, 630), bg); card.paste(cover, (285, 0))
    card.save(REPO + 'public/og/podcast.jpg', quality=86, optimize=True)

asyncio.run(main()); print('ok')

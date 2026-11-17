import json,html,asyncio,re
from playwright.async_api import async_playwright
import os
REPO=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..')+'/'
W=os.path.join(REPO,'tools','og','work')
os.makedirs(W,exist_ok=True); os.chdir(W)
import shutil,glob
[shutil.copy(f,W) for f in glob.glob(REPO+'public/media/posts/*.jpg')]
if not os.path.exists('fonts'): os.symlink(os.path.join(REPO,'public','fonts'),'fonts')
P=json.load(open(REPO+'src/data/posts.json'))
PATH='M83.71,64.32 L110.76,100 L137.11,100 L96.43,46.33 L129.20,0 L103.48,0 L72,44.51 L72,0 L54,0 L54,64.71 L21,0 L0,0 L0,100 L18,100 L18,35.29 L51,100 L72,100 L72,80.87ZM166,100 L166,0 L148,0 L148,100Z'
def logo(w,fill='#fff'): return f'<svg viewBox="0 0 197 100" width="{w}"><path fill="{fill}" d="{PATH}"/><rect x="117" y="0" width="80" height="18" fill="#ff4438"/></svg>'
FONTS='''@font-face{font-family:Anybody;font-weight:100 900;font-stretch:50% 150%;src:url(fonts/anybody.woff2)}
@font-face{font-family:"Hanken Grotesk";font-weight:100 900;src:url(fonts/hanken-grotesk.woff2)}'''
FMT={'take':'Take','bts':'Behind the scenes'}
NOISE="url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"
# 1) the designed cover for the Brick Lane take (no photo exists for it)
cover=f'''<!doctype html><html><head><meta charset=utf-8><style>{FONTS}
html,body{{margin:0;width:1600px;height:900px;overflow:hidden}}p{{margin:0}}
body{{position:relative;color:#fff;font-family:"Hanken Grotesk";background:radial-gradient(90% 70% at 18% 0%,rgba(255,255,255,.2),transparent 60%),radial-gradient(80% 80% at 100% 100%,rgba(0,0,0,.5),transparent 70%),#b4321b}}
body::after{{content:"";position:absolute;inset:0;opacity:.16;mix-blend-mode:overlay;background-image:{NOISE}}}
.k{{position:absolute;left:96px;top:92px;font-size:34px;font-weight:600;opacity:.9}}
.n{{position:absolute;left:84px;top:178px;font-family:Anybody;font-weight:850;font-stretch:88%;font-size:410px;line-height:.86;letter-spacing:-.01em}}
.n svg{{position:absolute;left:-4%;top:-10%;width:108%;height:118%;overflow:visible}}
.n path{{fill:none;stroke:#fff;stroke-width:3;vector-effect:non-scaling-stroke;opacity:.95}}
.c{{position:absolute;left:96px;bottom:150px;font-size:44px;font-weight:600;line-height:1.2;max-width:24ch}}
.f{{position:absolute;left:96px;right:96px;bottom:70px;padding-top:22px;border-top:2px solid rgba(255,255,255,.3);font-size:26px;font-weight:600;opacity:.85;display:flex;justify-content:space-between}}
</style></head><body><p class=k>Brick Lane Curry House, New York</p>
<p class=n>1.5M<svg viewBox="0 0 200 100" preserveAspectRatio="none"><path d="M100,6 C160,4 197,22 196,50 C195,80 150,95 100,94 C46,93 4,80 4,50 C4,21 45,8 96,6 C122,5 142,8 160,13"/></svg></p>
<p class=c>views on one phaal reel. Zero dollars on paid creators.</p>
<p class=f><span>Nivedkrishna Thavarayil</span><span>The phaal, as a format</span></p></body></html>'''
open('format-cover.html','w').write(cover)
# 2) share previews: text on the left, the cover photo on the right
base='''<!doctype html><html><head><meta charset=utf-8><style>%(fonts)s
html,body{margin:0;width:1200px;height:630px;background:#121212;color:#fff;overflow:hidden}
body{display:grid;grid-template-columns:1fr %(rw)spx;font-family:"Hanken Grotesk"}
.l{padding:56px 56px 50px 64px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:inset 14px 0 0 %(c)s}
.k{font-size:24px;font-weight:600;color:#bdbdb6;margin:0 0 16px}
h1{font-family:Anybody;font-weight:850;font-stretch:100%%;font-size:%(fs)spx;line-height:.95;margin:0;text-wrap:balance}
.d{font-size:25px;line-height:1.3;color:#d6d6cf;margin:18px 0 0;text-wrap:balance}
.by{font-size:20px;color:#9d9d96;margin:0}
.r{position:relative;overflow:hidden}
.r img{width:100%%;height:100%%;object-fit:cover;object-position:%(pos)s;display:block}
.st{position:absolute;inset:0;padding:56px 44px;display:flex;flex-direction:column;justify-content:center;gap:18px;background:radial-gradient(90%% 70%% at 18%% 0%%,rgba(255,255,255,.2),transparent 60%%),radial-gradient(80%% 80%% at 100%% 100%%,rgba(0,0,0,.5),transparent 70%%),#b4321b}
.st b{position:relative;display:inline-block;align-self:flex-start;font-family:Anybody;font-weight:850;font-stretch:88%%;font-size:150px;line-height:.86}
.st b svg{position:absolute;left:-6%%;top:-14%%;width:112%%;height:128%%;overflow:visible}.st b path{fill:none;stroke:#fff;stroke-width:3;vector-effect:non-scaling-stroke}
.st span{font-size:26px;font-weight:600;line-height:1.25}.st i{font-style:normal;font-size:19px;opacity:.8}
</style></head><body><div class=l><div>%(logo)s</div><div><p class=k>%(kick)s</p><h1>%(t)s</h1><p class=d>%(dek)s</p></div><p class=by>Nivedkrishna Thavarayil, Creative Strategist and Director, New York</p></div><div class=r>%(art)s</div></body></html>'''
STAT='<div class=st><i>Brick Lane Curry House</i><b>1.5M<svg viewBox="0 0 200 100" preserveAspectRatio="none"><path d="M100,6 C160,4 197,22 196,50 C195,80 150,95 100,94 C46,93 4,80 4,50 C4,21 45,8 96,6 C122,5 142,8 160,13"/></svg></b><span>views on one phaal reel. Zero dollars on paid creators.</span></div>'
POS={'how-we-plan-a-micro-drama-in-a-day':'38% 50%','ten-episodes-at-harvard-in-under-four-days':'40% 50%','what-the-popes-exorcist-taught-me-about-virality':'0% 50%','the-only-sales-strategy-i-have-ever-used':'100% 50%','your-product-needs-a-format-not-an-ad':'18% 50%'}
for p in P:
    t=p['title']; n=len(t); fs=64 if n<=34 else 56 if n<=46 else 50
    img=p['cover']['src'].split('/')[-1]
    open(f'og-{p["slug"]}.html','w').write(base%{'fonts':FONTS,'rw':(560 if p['slug']=='the-only-sales-strategy-i-have-ever-used' else 470),'c':p['color'],'fs':fs,'logo':logo(84),'kick':html.escape(FMT[p['format']]+', '+p['topic']),'t':html.escape(t),'dek':html.escape(p['dek']),'art':(STAT if p['slug']=='your-product-needs-a-format-not-an-ad' else f'<img src="{img}">'),'pos':POS.get(p['slug'],'50% 50%')})
async def main():
    async with async_playwright() as pw:
        b=await pw.chromium.launch(executable_path='/usr/bin/google-chrome')
        pg=await b.new_page(viewport={'width':1600,'height':900})
        await pg.goto('file://'+W+'/format-cover.html'); await pg.evaluate('document.fonts.ready'); await pg.wait_for_timeout(200)
        await pg.screenshot(path=REPO+'public/media/posts/format-not-an-ad.jpg',type='jpeg',quality=88)
        await pg.screenshot(path='format-not-an-ad.jpg',type='jpeg',quality=88)
        await pg.set_viewport_size({'width':1200,'height':630})
        for p in P:
            await pg.goto(f'file://{W}/og-{p["slug"]}.html'); await pg.evaluate('document.fonts.ready'); await pg.wait_for_timeout(150)
            await pg.screenshot(path=REPO+f'public/og/work-{p["slug"]}.jpg',type='jpeg',quality=85)
        await b.close()
asyncio.run(main())
print('ok')

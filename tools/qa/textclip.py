import asyncio
from playwright.async_api import async_playwright
import glob,os
D=os.path.join(os.path.dirname(__file__),'..','..','dist')
PAGES=sorted('/'+os.path.relpath(f,D).replace('index.html','') for f in glob.glob(D+'/**/index.html',recursive=True))+['/404.html']
import sys
if len(sys.argv)>1: PAGES=sys.argv[1:]
JS="""(()=>{const out=[];const W=innerWidth;
function inScroller(e){for(let p=e.parentElement;p;p=p.parentElement){const cs=getComputedStyle(p);if(/(auto|scroll)/.test(cs.overflowX)&&p.scrollWidth>p.clientWidth+1)return true;if(p.matches('.sp,.shelf,.frame,.stage,.screen,#intro,.sheet,.panel,.ticker,.marq'))return true}return false}
document.querySelectorAll('h1,h2,h3,p,a,li,b,span,dt,dd,figcaption,blockquote').forEach(e=>{if(e.closest('.vh'))return;if(!e.childNodes.length||e.matches('.skip'))return;const t=[...e.childNodes].some(n=>n.nodeType==3&&n.textContent.trim());if(!t)return;const cs=getComputedStyle(e);if(cs.visibility=='hidden'||cs.display=='none'||+cs.opacity===0)return;let L=1e9,R=-1e9;for(const n of e.childNodes){if(n.nodeType!=3||!n.textContent.trim())continue;const r=document.createRange();r.selectNodeContents(n);for(const q of r.getClientRects()){if(q.width<1)continue;L=Math.min(L,q.left);R=Math.max(R,q.right)}}if(R<0)return;const b={left:L,right:R};if((b.right>W+1||b.left<-1)&&!inScroller(e))out.push([e.tagName+'.'+e.className,e.textContent.trim().slice(0,40),Math.round(b.left),Math.round(b.right)]);
 if(e.scrollWidth>e.clientWidth+2&&cs.overflowX!='visible'&&!inScroller(e)&&e.clientWidth>0&&cs.textOverflow!='ellipsis'&&!(cs.webkitLineClamp&&cs.webkitLineClamp!='none'))out.push(['CLIPPED '+e.tagName+'.'+e.className,e.textContent.trim().slice(0,40),e.scrollWidth,e.clientWidth])});return out})()"""
async def m():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        tot=0
        for w,h,mob in [(320,640,True),(344,740,True),(360,780,True),(375,812,True),(390,844,True),(414,896,True),(430,932,True),(600,960,True),(768,1024,True),(820,1180,True),(1024,768,False),(1280,800,False),(1440,900,False),(1920,1080,False)]:
            ctx=await b.new_context(viewport={'width':w,'height':h},is_mobile=mob,has_touch=mob)
            pg=await ctx.new_page(); found={}
            for path in PAGES:
                await pg.goto('http://localhost:'+os.environ.get('PORT','4321')+path+'?x',wait_until='load'); await pg.wait_for_timeout(250)
                if path=='/': await pg.evaluate("document.body.classList.remove('lock');document.body.classList.add('go');document.getElementById('intro').hidden=true;window.scrollTo(0,document.querySelector('#work,.stmt').offsetTop)")
                await pg.wait_for_timeout(300)
                r=await pg.evaluate(JS)
                if r: found[path]=r[:6]; tot+=len(r)
            print(w,'ok' if not found else found,flush=True); await ctx.close()
        print('total',tot); await b.close()
asyncio.run(m())

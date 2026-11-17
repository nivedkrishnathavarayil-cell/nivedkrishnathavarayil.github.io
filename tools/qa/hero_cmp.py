import asyncio,os
from playwright.async_api import async_playwright
VP=[(1440,900),(1280,800),(800,1020),(800,1280),(430,932),(390,844),(375,812)]
JS="(()=>{const e=document.getElementById('name');const b=e.getBoundingClientRect();return [parseFloat(getComputedStyle(e).fontSize),+b.left.toFixed(2),+b.width.toFixed(2),+b.top.toFixed(2)]})()"
async def m():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        diff=0
        for w,h in VP:
            out=[]
            for port in (int(os.environ.get('OLD','4322')),int(os.environ.get('PORT','4321'))):
                mob=w<800
                ctx=await b.new_context(viewport={'width':w,'height':h},is_mobile=mob,has_touch=mob)
                pg=await ctx.new_page(); await pg.goto(f'http://localhost:{port}/?h',wait_until='load'); await pg.wait_for_timeout(1500)
                out.append(await pg.evaluate(JS)); await ctx.close()
            same=out[0]==out[1]; diff+=0 if same else 1
            print(w,h,'old',out[0],'new',out[1],'SAME' if same else 'DIFF')
        print('diffs',diff); await b.close()
asyncio.run(m())

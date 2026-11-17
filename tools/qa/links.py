import re, os, glob, html, urllib.parse
import os
D=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','dist')
pages=glob.glob(D+'/**/*.html',recursive=True)
ids={}
for p in pages:
    s=open(p).read(); ids[p]=set(re.findall(r'\sid="([^"]+)"',s))
bad=[]; ext=set(); n=0
def route(path):
    path=urllib.parse.unquote(path.split('?')[0])
    f=D+path
    if path.endswith('/'): f+= 'index.html'
    elif not os.path.splitext(path)[1]: f+='/index.html'
    return f
for p in pages:
    s=open(p).read()
    for h in re.findall(r'href="([^"]+)"',s):
        h=html.unescape(h); n+=1
        if h.startswith(('mailto:','tel:')): continue
        if h.startswith('http'):
            if 'nivedkrishnathavarayil.com' in h and not h.startswith('https://calendly'): h=h.split('nivedkrishnathavarayil.com',1)[1] or '/'
            else: ext.add(h); continue
        if h.startswith('#'):
            if h[1:] and h[1:] not in ids[p]: bad.append((p.replace(D,''),h))
            continue
        path,_,frag=h.partition('#')
        f=route(path)
        if not os.path.exists(f): bad.append((p.replace(D,''),h)); continue
        if frag and f.endswith('.html') and frag not in ids.get(f,set()): bad.append((p.replace(D,''),h))
print(len(pages),'pages',n,'links; broken:',bad[:20]); print(len(ext),'external')
open('/tmp/ext.txt','w').write('\n'.join(sorted(ext)))

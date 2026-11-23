"""Builds the downloadable photos and logos for /press/ into public/press/.
Run once per new source; the outputs are committed, the sources are not.
Usage: python3 tools/press/make_assets.py ON_SET.jpg SF_FRAME.png THAVA_LOGO_RGBA.png
  ON_SET.jpg          the on-set portrait he sent (1717 x 2576), same photo as the About page
  SF_FRAME.png        SF06 from the Canvas SF Tech Week after-movie, 4x upscale (3840 x 2880)
  THAVA_LOGO_RGBA.png Thava Studio logo, transparent, white and red, original 'STUDIOS' spacing (2048)
Every output is re-encoded, so no camera or location metadata survives."""
import os, subprocess, sys
import numpy as np
from PIL import Image

REPO = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..') + '/'
OUT = REPO + 'public/press/'
os.makedirs(OUT, exist_ok=True)
on_set, sf, logo = sys.argv[1:4]

# ---- photos: clean re-encode, sRGB, no metadata
im = Image.open(on_set).convert('RGB')
im.save(OUT + 'nivedkrishna-thavarayil-on-set.jpg', quality=90, optimize=True, progressive=True)
im = Image.open(sf).convert('RGB').resize((2400, 1800), Image.LANCZOS)
im.save(OUT + 'nivedkrishna-thavarayil-sf-tech-week-2026.jpg', quality=88, optimize=True, progressive=True)

# ---- monogram: the site's own mark, for light and dark backgrounds
PATH = 'M83.71,64.32 L110.76,100 L137.11,100 L96.43,46.33 L129.20,0 L103.48,0 L72,44.51 L72,0 L54,0 L54,64.71 L21,0 L0,0 L0,100 L18,100 L18,35.29 L51,100 L72,100 L72,80.87ZM166,100 L166,0 L148,0 L148,100Z'
for name, ink in (('light', '#000000'), ('dark', '#ffffff')):
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -10 217 120" width="868" height="480">'
           f'<title>NKT monogram, Nivedkrishna Thavarayil</title>'
           f'<path fill="{ink}" d="{PATH}"/><rect x="117" y="0" width="80" height="18" fill="#ff4438"/></svg>\n')
    p = OUT + f'nkt-monogram-for-{name}-backgrounds.svg'
    open(p, 'w').write(svg)
    subprocess.run(['rsvg-convert', '-w', '2000', p, '-o', p[:-4] + '.png'], check=True)

# ---- Thava Studio: 'STUDIOS' re-spaced to 'STUDIO', letters spread across the full width like the 800px listing logo
A = np.array(Image.open(logo).convert('RGBA'))
alpha = A[..., 3] > 40
rows = alpha.any(1)
bands, s = [], None
for i, r in enumerate(rows):
    if r and s is None: s = i
    if not r and s is not None: bands.append((s, i - 1)); s = None
y0, y1 = bands[-1]
cols = alpha[y0:y1 + 1].any(0)
segs, s = [], None
for i, c in enumerate(cols):
    if c and s is None: s = i
    if not c and s is not None: segs.append((s, i - 1)); s = None
assert len(segs) == 7, segs  # S T U D I O S
pad = 6
glyphs = [A[y0 - pad:y1 + 1 + pad, a - pad:b + 1 + pad].copy() for a, b in segs[:6]]
left, right = segs[0][0], segs[6][1]
A[y0 - pad:y1 + 1 + pad, :, :] = 0
w0 = segs[0][1] - segs[0][0] + 1; w5 = segs[5][1] - segs[5][0] + 1
c0 = left + (w0 - 1) / 2; c5 = right - (w5 - 1) / 2
base = Image.fromarray(A)
for k, (g, (a, b)) in enumerate(zip(glyphs, segs[:6])):
    c = c0 + k * (c5 - c0) / 5
    x = round(c - (b - a) / 2) - pad
    base.alpha_composite(Image.fromarray(g), (x, y0 - pad))
bb = base.getbbox()
mark = base.crop(bb)
side = round(mark.width / 0.74)
def square(img, bg):
    sq = Image.new('RGBA', (side, side), bg)
    sq.alpha_composite(img, ((side - img.width) // 2, (side - img.height) // 2))
    return sq
dark = mark  # white and red: for dark backgrounds
M = np.array(mark)
red = (M[..., 0].astype(int) - np.maximum(M[..., 1], M[..., 2])) > 60
L = M.copy(); L[~red, :3] = 0  # white parts to black, alpha kept: for light backgrounds
light = Image.fromarray(L)
square(dark, (0, 0, 0, 0)).save(OUT + 'thava-studio-logo-for-dark-backgrounds.png', optimize=True)
square(light, (0, 0, 0, 0)).save(OUT + 'thava-studio-logo-for-light-backgrounds.png', optimize=True)
print('ok', side)

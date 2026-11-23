"""Builds public/press/nivedkrishna-thavarayil-press-kit.zip from the same data the /press/ page uses.
Run it after any change to src/data/presskit.json, src/data/press.json or the files in public/press/.
Usage: python3 tools/press/build_zip.py"""
import json, os, re, zipfile

REPO = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..') + '/'
SITE = 'https://nivedkrishnathavarayil.com'
K = json.load(open(REPO + 'src/data/presskit.json'))
P = json.load(open(REPO + 'src/data/press.json'))
STILLS = {s['src']: s for s in json.load(open(REPO + 'src/data/stills.json'))}
EMAIL = 'nivedkrishnathavarayil@gmail.com'


def plain(t):
    # [text](/path) -> text (https://site/path)
    return re.sub(r'\[([^\]]+)\]\(([^)]+)\)', lambda m: f"{m.group(1)} ({m.group(2) if m.group(2).startswith('http') else SITE + m.group(2)})", t)


lines = ['NIVEDKRISHNA THAVARAYIL, PRESS KIT', f'{SITE}/press/', '']
lines += ['BIOS', '']
for b in K['bios']:
    lines += [f"{b['label']} ({len(b['text'].split())} words)", '', b['text'], '']
lines += ['FAST FACTS', '']
for k, v in K['facts']:
    lines.append(f'{k}: {plain(v)}')
lines += ['', 'PHOTOS AND CREDITS', '']
for p in K['photos']:
    lines.append(f"photos/{os.path.basename(p['src'])}: {p['cap']} Credit: {p['credit']}.")
for s in K['stills']:
    lines.append(f"stills/{s['series']}.jpg: {STILLS[s['src']]['alt']}. Credit: Canvas.")
lines += ['', 'Larger stills on request.', '', 'USING THESE', '',
          'Free to use in editorial coverage of Nivedkrishna Thavarayil, Thava Studio and the Canvas series he directed.',
          'Credit each photo as listed. Please do not crop, recolor or redraw the logos. For commercial use, ask first.', '',
          'COVERAGE', '']
for p in P:
    note = f" ({p['note']})" if p.get('note') else ''
    lines.append(f"{p['outlet']}, {p['date']}: {p['title']}{note}. {p['url']}")
lines += ['', 'CONTACT', '', f'Email: {EMAIL}', 'Book a call: https://calendly.com/nivedkrishnathavarayil/30min',
          'LinkedIn: https://www.linkedin.com/in/nivedkrishna', '']
text = '\n'.join(lines)

out = REPO + 'public' + K['zip']
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    root = 'nivedkrishna-thavarayil-press-kit/'
    z.writestr(root + 'bios-facts-and-credits.txt', text)
    for p in K['photos']:
        z.write(REPO + 'public' + p['src'], root + 'photos/' + os.path.basename(p['src']))
    for s in K['stills']:
        z.write(REPO + 'public' + s['src'], root + 'stills/' + s['series'] + '.jpg')
    for l in K['logos']:
        for kind in ('svg', 'png'):
            if l.get(kind):
                z.write(REPO + 'public' + l[kind], root + 'logos/' + os.path.basename(l[kind]))
print('ok', out, os.path.getsize(out))

"""Turn a post from src/data/posts.json into a read-aloud script for ElevenLabs.
Usage: python3 tools/audio/script.py <slug> [--stats]"""
import json, re, sys
P = json.load(open('src/data/posts.json'))
def plain(t):
    t = re.sub(r'\[([^\]]+)\]\([^)]*\)', r'\1', t)
    t = re.sub(r'[*_`]', '', t)
    return t.replace('&', 'and').strip()
def script(p):
    out = [plain(p['title']), plain(p['dek'])]
    for b in p['body']:
        k, v = b[0], b[1]
        if k in ('p', 'h2'): out.append(plain(v))
        elif k == 'quote': out.append(plain(v))
        elif k == 'ul': out += [plain(x) for x in v]
    return '\n\n'.join(x for x in out if x)
if __name__ == '__main__':
    if '--stats' in sys.argv:
        rows = sorted(((len(script(p)), p['slug'], p['format']) for p in P), reverse=True)
        for n, s, f in rows: print(f'{n:6d}  {f:6s} {s}')
        print('total chars', sum(r[0] for r in rows), 'posts', len(rows))
    else:
        p = [x for x in P if x['slug'] == sys.argv[1]][0]
        print(script(p))

# Site tools (not deployed)

Run from the repo root after `SITE_URL=https://nivedkrishnathavarayil.com npx astro build` and `python3 -m http.server 4321` inside `dist/`.

- `tools/qa/hero_cmp.py`: compares the hero name (#name) size and position between the live build (serve the previous build on port 4322, set OLD) and the new one (PORT, default 4321). Must print `diffs 0`.
- `tools/qa/textclip.py [paths...]`: finds text running off screen at 14 widths (320 to 1920). Must print `total 0`.
- `tools/qa/links.py`: checks every internal link and anchor in dist. Must print `broken: []`.
- `tools/og/gen_pages.py`: renders the share previews for /work/, /work-with-me/ and /podcast/ (public/og/work.jpg, work-with-me.jpg, podcast.jpg) from each page's own heading and stills already on the site.
- `tools/og/gen_posts.py`: renders the share preview (public/og/work-<slug>.jpg) for every article in src/data/posts.json, plus the Brick Lane typographic cover. Needs Playwright and Chrome.

Expected hero values at 1440x900, 1280x800, 430x932, 390x844, 375x812: font-size 110.127, 97.8907, 44.7274, 40.5667, 39.0642px.

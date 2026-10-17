# Stick Picker

A small website that helps parents and new players pick a hockey stick. It asks about the player (age, height, weight, hand, and optionally level, position and shot style) and recommends a size, flex, length, curve and kick point. Every value is explained in plain words, in Finnish and English.

## Run it

```bash
npm install
npm run dev
```

The dev server runs at http://localhost:5173/stick-picker/. `npm test` runs the tests.

`npm run build` writes the static site to `dist/`:

1. `vite build` builds the browser app.
2. `vite build --ssr` builds `src/entry-server.tsx` for Node.
3. `scripts/prerender.mjs` renders every page to static HTML with its own title, meta tags, `hreflang` links and structured data (from `src/seo.ts`). It also writes `404.html`, `sitemap.xml` and the share images (`og-en.png`, `og-fi.png`).

Pages have real URLs: English at `/stick-picker/`, Finnish under `/stick-picker/fi/` (for example `/fi/opas/`). Only the home and guide pages are indexed; quiz and result pages are `noindex`. Old `#/` links still work.

## How it works

- `src/logic/recommend.ts` turns answers into a recommendation. Length targets the chin-to-nose range in shoes. Flex starts from 40–50% of body weight in pounds and is lowered on the label to make up for the stiffness that cutting adds (about 4 flex per inch). The size is the one whose stick, once cut, comes closest to the target flex.
- `src/data/` holds the curve chart and the 2026–27 brand families. Update `brands.ts` when new model years come out.
- `src/copy.ts` holds all text in both languages, including the home page FAQ that also feeds the FAQ structured data.
- `src/router.ts` maps URLs to pages; `src/seo.ts` builds titles, descriptions and structured data per page.

Pushing to `main` deploys to GitHub Pages through `.github/workflows/deploy.yml`.

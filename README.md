# Stick Picker

A small website that helps parents and new players pick a hockey stick. It asks about the player (age, height, weight, hand, and optionally level, position and shot style) and recommends a size, flex, length, curve and kick point. Every value is explained in plain words, in Finnish and English.

## Run it

```bash
npm install
npm run dev
```

`npm test` runs the recommendation tests. `npm run build` writes the static site to `dist/`.

## How it works

- `src/logic/recommend.ts` turns answers into a recommendation. Length targets the chin-to-nose range in shoes. Flex starts from 40–50% of body weight in pounds and is lowered on the label to make up for the stiffness that cutting adds (about 4 flex per inch). The size is the one whose stick, once cut, comes closest to the target flex.
- `src/data/` holds the curve chart and the 2026–27 brand families. Update `brands.ts` when new model years come out.
- `src/copy.ts` holds all text in both languages.

Pushing to `main` deploys to GitHub Pages through `.github/workflows/deploy.yml`.

# Stick Picker: upkeep guide for agents

This file tells an AI agent (or a person) how the site works and how to keep it correct. Read it before changing data, logic or SEO.

## What the site is

A bilingual (English and Finnish) site that helps parents and new players choose a hockey stick. The player answers a short quiz. The result says where to look: size, a flex range, an uncut length range and curves. It then lists real stick models to look for.

- Live: https://nikosalonen.github.io/stick-picker/ (Finnish: `/stick-picker/fi/`)
- Repo: `nikosalonen/stick-picker` (public). Every push to `main` builds and deploys through `.github/workflows/deploy.yml`.
- Stack: Vite, React 19, TypeScript, `motion` for animation, `d3-scale` and `d3-shape` for charts, Vitest.

## Commands

```bash
npm install
npm run dev     # http://localhost:5173/stick-picker/
npm test        # all tests; the exhaustive stock test takes about 10 s
npm run build   # browser build + SSR build + prerender, output in dist/
npm run preview # serve dist/ at /stick-picker/
```

Run `npm test` and `npm run build` before every push. The build fails if `dist/index.html` loses the placeholders the prerender step replaces.

## Map of the code

| File | What it does |
|---|---|
| `src/data/stock.ts` | **Which sticks exist.** Every flex and uncut length pair each brand sells, per size. Also `CURVE_SIZES`: which curves are made in which sizes. |
| `src/data/models.ts` | **Which models exist.** Each model's brand, family, price tier, kick point and flexes per size. |
| `src/data/curves.ts` | The curves shown on the site, their drawing values, names at other brands, and `rateCurve` (recommended, fine or not recommended, with a reason). |
| `src/data/brands.ts` | The brand table on the guide and result pages (families by kick point, current model names). |
| `src/logic/recommend.ts` | Turns answers into a recommendation: target length and flex, then the best real sticks and the range around them. |
| `src/logic/candidates.ts` | Picks the real models to list under "Sticks to look for". |
| `src/copy.ts` | All visible text, in English and Finnish, including the front page FAQ. |
| `src/router.ts` | URLs. English at `/stick-picker/`, Finnish under `/stick-picker/fi/` with Finnish slugs (`opas`, `kysely`, `tulos`). |
| `src/seo.ts` | Page titles, descriptions, canonical and hreflang links, Open Graph tags, JSON-LD, and the Search Console token. |
| `scripts/prerender.mjs` | Runs after the build. Writes every page as static HTML, plus `404.html`, `sitemap.xml`, the share images and the apple-touch-icon. |
| `src/components/art/` | SVG illustrations (stick, player, flex bench, kick-point shot, blades). |
| `src/components/charts/` | The flex-by-weight and size-by-height charts. |
| `src/styles.css` | All styles. Colour tokens are at the top. |

## The one rule: only offer sticks that exist

The site must never suggest a size, flex, length, curve or model that no shop sells. `src/logic/recommend.test.ts` enforces this. The "only real sticks" test runs about 180,000 combinations of answers and favourites. It checks every option in each result against `STOCK_STICKS`, every curve against `CURVE_SIZES`, and every candidate against `MODELS`. The "model catalogue" test checks that every model's flexes exist in `STOCK_STICKS` for that brand and size. If you change the data and a test fails, fix the data. Do not loosen the test.

## Updating the data for a new season

Brands release new models every summer (July to September). Model names change every one or two seasons, while family names (Vapor, JetSpeed, Alpha and so on) stay the same. Do this once a year, in the autumn.

### 1. Research what is sold

For each brand and each size (youth/tyke, junior, intermediate, senior), you need four things:

- the flex and uncut length pairs (flex and length are sold together, for example Junior 40 at 52")
- the curves offered in that size
- the models that come in that size, and their flexes
- each model's price tier

The best sources are the brands' own option lists:

- Bauer: `https://www.bauer.com/collections/hockey-sticks/products.json` (Shopify JSON) and the product pages
- CCM: `https://us.ccmhockey.com/Sticks/Shop-All-Sticks` product pages and their variation data
- Warrior, True and Sherwood: retailer product pages, which list the selectable options
- Retailers that worked in 2026: hockeymonkey.com, icewarehouse.com, thehockeyshop.com (Source For Sports, including the `.js` variant data on product URLs), prohockeylife.com, xxl.fi
- Retailers that blocked bots in 2026: purehockey.com, sportchek.ca, stadium.fi

Check at least one top and one value model per brand and size, because the options differ by model. Shops measure uncut length differently (by up to 2"). Use the brand's own number, or the most common one.

### 2. Update `src/data/stock.ts`

- Add or remove `[flex, lengthIn]` pairs per brand and size.
- List tyke sticks as `youth`.
- Leave out special sticks: "long" seniors (63"–64"), pro stock, and shop-only models.
- Update `CURVE_SIZES` if a curve starts or stops being made in a size. In 2026, youth sticks came only in P92 and P28.
- Update the date and sources in the comment.

### 3. Update `src/data/models.ts`

- Replace last season's model names with the new ones, keeping family, kick point and tier.
- `tier` is `top`, `mid` or `value`. Kids' entry sticks (Bauer Grip, Warrior Rise, Sherwood Playrite) are `value`.
- Flexes per size must exist in `stock.ts` for that brand. The tests check this.
- `familyMadeIn` (used by the brand table) is derived from this file, so a family shows "Not made in YTH" when no model of that family has youth flexes.

### 4. Update `src/data/brands.ts` and the season text

- `BRANDS`: families per kick point and the model names shown in the brand table (top, mid, value). In 2026 the source was Twig Hockey Company's yearly comparison: https://twighockeycompany.com/penaltybox/compare-hockey-sticks-of-the-2026-27-season
- In `src/copy.ts`, update the season and prices:
  - `explain.tiersBody`: the price ranges and the season name
  - `footer`: the season name
  - `explain.brandsUpdated` if needed
- In `src/seo.ts`, update `dateModified` in the guide page's Article JSON-LD.

### 5. Curves

The site lists only common curves that at least two sources describe the same way. In 2026 those were P92, P88, P90TM and P28. Each was sold by several brands under their own names (for example Bauer P92 = CCM P29 = Warrior W03 = True T92 = Sherwood PP92).

- To add a curve, change four places: the `CurveId` type in `recommend.ts`, an entry in `CURVES` in `curves.ts` (with `bendAt` and `depth` for the drawing, location, face, depth, lie and names at other brands), a case in `rateCurve`, and `CURVE_SIZES` in `stock.ts`. Then add it to `curvePreference` in `recommend.ts` if it should ever be suggested.
- Curves that were removed because they are no longer sold: P30, P02 and W71. Curves left out because sources disagree on their shape: P14, PM9 and P91A.
- Curve sources: the CCM curve chart via Ice Warehouse, https://www.stickmeta.com/curves and https://referencehockey.com/hockey-resources/hockey-stick-curve-comparison-chart/

### 6. Check and ship

```bash
npm test
npm run build
npm run preview   # open /stick-picker/result/?age=adult&h=180&w=80&hand=left&level=team&pos=unsure&shot=unsure
```

Look at a few result pages (a 6-year-old, a 140 cm 11-year-old, a 165 cm teen, a 180 cm adult) and check that the candidate list makes sense. Then push to `main`.

## How the recommendation works

All tuning values are constants at the top of `src/logic/recommend.ts`. If you change one, rerun the tests and look at sample results.

- **Target length.** `CHIN_RATIO` (0.84) and `NOSE_RATIO` (0.89) of body height give the chin-to-nose band in shoes. Beginners and forwards aim near the chin; defensemen aim nearer the nose. These ratios match retail sizing charts; they are not exact anatomy.
- **Target flex.** `flexShare`: 40% (new), 45% (team) or 50% (competitive) of body weight in pounds, plus 3 percentage points for defensemen.
- **Cutting.** `FLEX_PER_INCH_CUT` (4): each inch cut off makes the stick about 4 flex points stiffer, so a softer label flex is chosen when a lot is cut.
- **Best stick.** For every real size and flex (`STOCK_GROUPS`), only sticks that reach at least the chin count. The score is the distance from the target flex after cutting, plus a small cost per cm cut, plus `OFF_SIZE_PENALTY` if the size is unusual for the player's height (`SIZE_HEIGHTS`).
- **Range.** Other real sticks within `RANGE_GAP` (10) flex points of the target, in sizes usual for the height. The range can span two sizes, because brands name sizes differently (CCM's 48" "youth" stick fits the same kid as Bauer's 50" "junior" stick).
- **Curves.** `curvePreference` gives the order by player type. Only curves made in every size of the range are kept.
- **Favourites.** Optional favourite flex and curve from the result page. They stay in the URL (`ff`, `fc`). A favourite curve not made in the size is replaced, and the result says so.
- **Tall players.** If even the longest stick is shorter than the chin, the result suggests an extension.

If you change `SIZE_HEIGHTS`, also update the size answer in `copy.faq` and `explain.sizeAges` in `copy.ts`.

## Text and languages

- All text lives in `src/copy.ts` as `{ en, fi }` pairs. Never hard-code text in components.
- Write in plain language for parents who know nothing about hockey gear. Short sentences, no jargon without an explanation.
- In Finnish, the stick hand is "Left" and "Right" (as Finnish players and shops say), while body parts stay Finnish ("vasen käsi alempana").
- The front page FAQ (`copy.faq`) also feeds the FAQPage JSON-LD. Google requires that FAQ markup matches visible text, so keep the FAQ on the page if it stays in `seo.ts`.

## SEO

- Pages have real URLs and are prerendered to static HTML at build time, so crawlers see full content. The browser hydrates the HTML only when `data-path` on `#root` matches the current path (see `src/main.tsx`). Otherwise it renders fresh.
- Only the home and guide pages are indexable. Quiz and result pages are `noindex, follow`. A test checks this, and also that titles are at most 75 characters and descriptions at most 160.
- Each page links to its other-language version with `hreflang`, plus `x-default` pointing to English.
- `sitemap.xml` lists the four indexable pages. The site is a GitHub Pages project page, so it cannot have its own `robots.txt` (that would have to be at `nikosalonen.github.io/robots.txt`). The sitemap is submitted in Google Search Console instead.
- Search Console verification: `GOOGLE_SITE_VERIFICATION` in `src/seo.ts`. Do not remove it, or the site loses its verified status.
- Share images (`og-en.png`, `og-fi.png`) are drawn at build time from the stick SVG with `@resvg/resvg-js`. They use the fonts in `scripts/fonts/` (OFL licence), so the build needs no network.
- Old `#/` links (from before October 2026) are turned into real paths in `src/main.tsx`. Keep `legacyHashToPath` so old shared links keep working.
- Lighthouse in October 2026: SEO 100, accessibility 100, best practices 100, performance 96–97.

## Design and graphics

- Colours are CSS variables at the top of `src/styles.css`. Dark mode values exist twice: in the `prefers-color-scheme: dark` block and in the `[data-theme="dark"]` block. Keep both in sync.
- Chart colours (`--chart-blue`, `--chart-red`) were checked for colour-blind safety in both themes. Red always means "the player's stick" and blue is the general series colour.
- SVG ids must be unique per instance. Use `useId()`, as the existing art does.
- Animations use `motion` and respect reduced motion (`useReducedMotion`).
- Fonts are self-hosted through `@fontsource` packages and preloaded by the prerender step.

## Gotchas

- Vite's `base` is `/stick-picker/`. Vitest serves from `/`, so `vite.config.ts` sets `test.env.BASE_URL` for tests.
- The exhaustive stock test has a 120-second timeout. It normally takes about 10 seconds; if it gets slow, shrink the answer grid rather than raising the timeout.
- `vite preview` falls back to the home page HTML for unknown paths, but GitHub Pages serves `404.html`. The `data-path` check in `main.tsx` handles both.
- Bauer writes the P90TM curve as both "P90T" and "P90TM". CCM's "+" curves (P28+, P29+) are listed as P28 and P92.

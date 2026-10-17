// Runs after `vite build` and the SSR build. Writes every page as static HTML (so search
// engines and link previews see real content), plus the 404 page, sitemap and share images.
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const server = await import(pathToFileURL(join(root, "dist-ssr", "entry-server.js")).href);
const { render, headFor, headHtml, prerenderPaths, absolute, BASE } = server;

const template = await readFile(join(dist, "index.html"), "utf8");
const TITLE_TAG = "<title>Stick Picker</title>";
const ROOT_TAG = '<div id="root"></div>';
if (!template.includes(TITLE_TAG) || !template.includes(ROOT_TAG)) {
  throw new Error("dist/index.html no longer has the title or root placeholder that prerender.mjs replaces.");
}

// Preload the two fonts the first screen needs: headings and body text (Latin subset).
const assets = await readdir(join(dist, "assets"));
const preloadFonts = ["big-shoulders-latin-800-normal", "atkinson-hyperlegible-next-latin-400-normal"]
  .map((name) => assets.find((file) => file.startsWith(name) && file.endsWith(".woff2")))
  .filter(Boolean)
  .map((file) => `<link rel="preload" href="${BASE}assets/${file}" as="font" type="font/woff2" crossorigin />`);

/** The file a site path is written to, for example /stick-picker/fi/opas/ -> dist/fi/opas/index.html. */
const fileFor = (path) => join(dist, path.slice(BASE.length), "index.html");

function page(path) {
  const { html, route, hydrate } = render(path);
  const head = headFor(route);
  const extraHead = [`<link rel="apple-touch-icon" href="${BASE}apple-touch-icon.png" />`, ...preloadFonts].join("\n    ");
  return template
    .replace('<html lang="en">', `<html lang="${head.lang}">`)
    .replace(/\s*<!-- The build replaces this title[^>]*-->/, "")
    .replace(TITLE_TAG, `${headHtml(head)}\n    ${extraHead}`)
    // data-path tells the browser which page this HTML was made for; it only reuses
    // (hydrates) the HTML when that matches the address bar.
    .replace(ROOT_TAG, `<div id="root"${hydrate ? ` data-path="${path}"` : ""}>${html}</div>`);
}

const paths = prerenderPaths();
for (const path of paths) {
  const file = fileFor(path);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, page(path));
}

// GitHub Pages serves 404.html for any path that has no file.
await writeFile(join(dist, "404.html"), page(`${BASE}404/`));

// Sitemap: only pages worth finding in search, each with its other-language version.
const today = new Date().toISOString().slice(0, 10);
const indexable = paths.filter((path) => headFor(render(path).route).indexable);
const urls = indexable.map((path) => {
  const head = headFor(render(path).route);
  const alternates = head.alternates
    .map((alt) => `    <xhtml:link rel="alternate" hreflang="${alt.lang}" href="${alt.href}" />`)
    .join("\n");
  return `  <url>\n    <loc>${absolute(path)}</loc>\n    <lastmod>${today}</lastmod>\n${alternates}\n  </url>`;
});
await writeFile(
  join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>\n`,
);

// Share images. The stick drawing uses CSS variables; resolve them to the light-theme values.
const css = await readFile(join(root, "src", "styles.css"), "utf8");
const rootBlock = css.slice(css.indexOf(":root {"), css.indexOf("}", css.indexOf(":root {")));
const tokens = Object.fromEntries([...rootBlock.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
const resolveVars = (svg) => svg.replace(/var\((--[\w-]+)\)/g, (_, name) => tokens[name] ?? "#000");

const fontFiles = [
  "BigShoulders-ExtraBold.ttf",
  "AtkinsonHyperlegibleNext-Regular.ttf",
  "AtkinsonHyperlegibleNext-Bold.ttf",
].map((name) => join(root, "scripts", "fonts", name));

const toPng = (svg, width) =>
  new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    font: { fontFiles, loadSystemFonts: false, defaultFontFamily: "Atkinson Hyperlegible Next" },
  })
    .render()
    .asPng();

const OG_TEXT = {
  en: { brand: "Stick Picker", lines: ["Which hockey stick", "should we buy?"], sub: "Size, flex and curve, explained in plain words" },
  fi: { brand: "Mailaopas", lines: ["Millaisen mailan", "ostaisimme?"], sub: "Jääkiekkomailan koko, jäykkyys ja lapa selkokielellä" },
};

for (const lang of ["en", "fi"]) {
  const text = OG_TEXT[lang];
  const stick = resolveVars(server.renderStickSvg(lang)).replace(
    '<svg class="stick-art"',
    '<svg x="110" y="378" width="1000" height="244" class="stick-art"',
  );
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <style>
    .stick-art-text { font-family: "Big Shoulders"; font-weight: 800; font-size: 36px; letter-spacing: 1.5px; fill: ${tokens["--shaft-text"]}; }
    .stick-art-hit { fill: transparent; }
  </style>
  <rect width="1200" height="630" fill="${tokens["--ice"]}" />
  <rect x="0" y="0" width="1200" height="10" fill="${tokens["--red"]}" />
  <path d="M66 62 L82 78 L96 78" fill="none" stroke="${tokens["--red"]}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
  <text x="110" y="84" font-family="Big Shoulders" font-weight="800" font-size="40" fill="${tokens["--ink"]}">${text.brand}</text>
  <text x="62" y="200" font-family="Big Shoulders" font-weight="800" font-size="96" fill="${tokens["--ink"]}">${text.lines[0]}</text>
  <text x="62" y="292" font-family="Big Shoulders" font-weight="800" font-size="96" fill="${tokens["--ink"]}">${text.lines[1]}</text>
  <text x="64" y="350" font-family="Atkinson Hyperlegible Next" font-size="32" fill="${tokens["--muted"]}">${text.sub}</text>
  ${stick}
</svg>`;
  await writeFile(join(dist, `og-${lang}.png`), toPng(svg, 1200));
}

// Home screen icon for iPhones, from the favicon.
const favicon = await readFile(join(root, "public", "favicon.svg"), "utf8");
await writeFile(join(dist, "apple-touch-icon.png"), toPng(favicon, 180));

await rm(join(root, "dist-ssr"), { recursive: true, force: true });
console.log(`Prerendered ${paths.length} pages, 404.html, sitemap.xml (${indexable.length} URLs) and share images.`);

import { copy } from "./copy";
import type { Lang, Text } from "./i18n";
import { BASE, pathTo, QUIZ_STEPS, samePageIn, type Route } from "./router";

/** Where the site is published. Absolute URLs (canonical, Open Graph, sitemap) need it. */
export const SITE_ORIGIN = "https://nikosalonen.github.io";

/**
 * Google Search Console ownership token (the content of its google-site-verification
 * meta tag). Empty means no tag is added.
 */
export const GOOGLE_SITE_VERIFICATION = "i1Mk2jXa7MPoiVRPfSOXYzPGMK5eRcesWCo9QQ5UGBc";

const t = (en: string, fi: string): Text => ({ en, fi });

const TITLES = {
  home: t(
    "Which hockey stick to buy? Size, flex and curve guide | Stick Picker",
    "Millainen jääkiekkomaila? Koko, jäykkyys ja lapa | Mailaopas",
  ),
  guide: t(
    "Hockey stick guide: length, flex, curve and sizes explained | Stick Picker",
    "Jääkiekkomailan valinta: pituus, jäykkyys, lapa ja koot | Mailaopas",
  ),
  quiz: t("Find the right hockey stick | Stick Picker", "Etsi sopiva jääkiekkomaila | Mailaopas"),
  result: t("Your hockey stick | Stick Picker", "Sinun jääkiekkomailasi | Mailaopas"),
  notFound: t("Page not found | Stick Picker", "Sivua ei löytynyt | Mailaopas"),
};

const DESCRIPTIONS = {
  home: t(
    "Answer a few questions about the player and get the right hockey stick size, length, flex and curve, explained in plain words for parents and new players.",
    "Vastaa muutamaan kysymykseen pelaajasta ja saat sopivan jääkiekkomailan koon, pituuden, jäykkyyden ja lavan selkokielellä vanhemmille ja aloittelijoille.",
  ),
  guide: t(
    "How long should a hockey stick be? Which flex and curve? Left or right? Size charts, curves and Bauer, CCM, Warrior and True families, explained simply.",
    "Kuinka pitkä jääkiekkomailan pitää olla? Mikä jäykkyys ja lapa? Left vai right? Kokotaulukot, lavat ja merkkien mallisarjat selkokielellä.",
  ),
  quiz: t(
    "Three quick questions about the player give a good all-round hockey stick: size, length, flex and curve.",
    "Kolme nopeaa kysymystä pelaajasta riittää hyvään perusmailaan: koko, pituus, jäykkyys ja lapa.",
  ),
  result: t(
    "A hockey stick recommendation: size, flex, curve, hand and length to show in the shop.",
    "Jääkiekkomailan suositus: koko, jäykkyys, lapa, kätisyys ja pituus kaupassa näytettäväksi.",
  ),
  notFound: t("This page does not exist.", "Tätä sivua ei ole."),
};

export type Head = {
  lang: Lang;
  title: string;
  description: string;
  canonical: string;
  alternates: { lang: Lang | "x-default"; href: string }[];
  /** Only the home and guide pages are worth showing in search results. */
  indexable: boolean;
  image: string;
  imageAlt: string;
  jsonLd: object[];
};

export const absolute = (path: string) => SITE_ORIGIN + path;

export function headFor(route: Route): Head {
  const { lang } = route;
  const tr = (text: Text) => text[lang];
  // The canonical page has no query: results for different players are the same page.
  const canonicalPath = samePageIn(route, lang, "");
  const indexable = route.page === "home" || route.page === "guide";
  const alternates: Head["alternates"] = [
    { lang: "en", href: absolute(samePageIn(route, "en", "")) },
    { lang: "fi", href: absolute(samePageIn(route, "fi", "")) },
    { lang: "x-default", href: absolute(samePageIn(route, "en", "")) },
  ];
  const homeUrl = absolute(pathTo(lang, "home"));

  const jsonLd: object[] = [];
  if (route.page === "home") {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: tr(copy.appName),
      url: homeUrl,
      description: tr(DESCRIPTIONS.home),
      inLanguage: lang,
      applicationCategory: "SportsApplication",
      operatingSystem: "Any",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    });
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: copy.faq.map((item) => ({
        "@type": "Question",
        name: tr(item.question),
        acceptedAnswer: { "@type": "Answer", text: tr(item.answer) },
      })),
    });
  }
  if (route.page === "guide") {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: tr(copy.guide.title),
      description: tr(DESCRIPTIONS.guide),
      inLanguage: lang,
      url: absolute(canonicalPath),
      image: absolute(`${BASE}og-${lang}.png`),
      author: { "@type": "Person", name: "Niko Salonen" },
      dateModified: "2026-10-17",
      isPartOf: { "@type": "WebSite", name: tr(copy.appName), url: homeUrl },
    });
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: tr(copy.appName), item: homeUrl },
        { "@type": "ListItem", position: 2, name: tr(copy.navGuide), item: absolute(canonicalPath) },
      ],
    });
  }

  return {
    lang,
    title: tr(TITLES[route.page]),
    description: tr(DESCRIPTIONS[route.page]),
    canonical: absolute(canonicalPath),
    alternates,
    indexable,
    image: absolute(`${BASE}og-${lang}.png`),
    imageAlt: tr(copy.home.title),
    jsonLd,
  };
}

/** Every page to write as static HTML at build time. */
export function prerenderPaths(): string[] {
  const paths: string[] = [];
  for (const lang of ["en", "fi"] as const) {
    paths.push(pathTo(lang, "home"), pathTo(lang, "guide"), pathTo(lang, "result"));
    for (const step of QUIZ_STEPS) paths.push(pathTo(lang, "quiz", step));
  }
  return paths;
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** The tags that go into <head>, as an HTML string. */
export function headHtml(head: Head): string {
  const e = escapeHtml;
  const ogLocale = head.lang === "fi" ? "fi_FI" : "en_US";
  const ogAlternate = head.lang === "fi" ? "en_US" : "fi_FI";
  const tags = [
    `<title>${e(head.title)}</title>`,
    ...(GOOGLE_SITE_VERIFICATION ? [`<meta name="google-site-verification" content="${e(GOOGLE_SITE_VERIFICATION)}" />`] : []),
    `<meta name="description" content="${e(head.description)}" />`,
    `<meta name="robots" content="${head.indexable ? "index, follow" : "noindex, follow"}" />`,
    `<link rel="canonical" href="${e(head.canonical)}" />`,
    ...head.alternates.map((alt) => `<link rel="alternate" hreflang="${alt.lang}" href="${e(alt.href)}" />`),
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${e(head.lang === "fi" ? "Mailaopas" : "Stick Picker")}" />`,
    `<meta property="og:title" content="${e(head.title)}" />`,
    `<meta property="og:description" content="${e(head.description)}" />`,
    `<meta property="og:url" content="${e(head.canonical)}" />`,
    `<meta property="og:locale" content="${ogLocale}" />`,
    `<meta property="og:locale:alternate" content="${ogAlternate}" />`,
    `<meta property="og:image" content="${e(head.image)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${e(head.imageAlt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${e(head.title)}" />`,
    `<meta name="twitter:description" content="${e(head.description)}" />`,
    `<meta name="twitter:image" content="${e(head.image)}" />`,
    // "<" is escaped so the JSON can never close the script tag early.
    ...head.jsonLd.map((data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`),
  ];
  return tags.join("\n    ");
}

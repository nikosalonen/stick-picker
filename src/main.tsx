import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "./App";
import { savedLang } from "./i18n";
import { BASE, legacyHashToPath } from "./router";
// Fonts are served from this site (no third-party request blocks the first paint).
import "@fontsource/big-shoulders/600.css";
import "@fontsource/big-shoulders/800.css";
import "@fontsource/atkinson-hyperlegible-next/400.css";
import "@fontsource/atkinson-hyperlegible-next/600.css";
import "@fontsource/atkinson-hyperlegible-next/700.css";
import "./styles.css";

const root = document.getElementById("root")!;
const startUrl = window.location.pathname + window.location.search;

// Old shared links used "#/result?..." style routes; move them to the real URL.
const legacy = legacyHashToPath(window.location.hash, savedLang() ?? "en");
if (legacy) window.history.replaceState(null, "", legacy);

// On the English front page, send visitors who chose Finnish (or whose browser is Finnish,
// on a first visit) to the Finnish front page. Deep links are left alone.
const prefersFinnish = (savedLang() ?? (navigator.language.toLowerCase().startsWith("fi") ? "fi" : "en")) === "fi";
if (!legacy && window.location.pathname === BASE && prefersFinnish) {
  window.history.replaceState(null, "", `${BASE}fi/`);
}

const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// Home and guide pages are prerendered with full content; take them over in place. Other
// pages, a changed URL, or HTML served for a different path (a server fallback) render fresh.
const unchanged = window.location.pathname + window.location.search === startUrl;
if (root.dataset.path === window.location.pathname && unchanged) {
  hydrateRoot(root, app);
} else {
  root.replaceChildren();
  createRoot(root).render(app);
}

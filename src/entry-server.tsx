import { StrictMode } from "react";
import { renderToStaticMarkup, renderToString } from "react-dom/server";
import { App } from "./App";
import { StickArt } from "./components/art/StickArt";
import { LangProvider, type Lang } from "./i18n";
import { parseLocation } from "./router";

export { headFor, headHtml, prerenderPaths, absolute, SITE_ORIGIN } from "./seo";
export { BASE } from "./router";

/** Renders one page to HTML at build time. */
export function render(url: string) {
  const [pathname, query = ""] = url.split("?");
  const route = parseLocation(pathname, query ? `?${query}` : "");
  const html = renderToString(
    <StrictMode>
      <App url={url} />
    </StrictMode>,
  );
  return { html, route, hydrate: route.page === "home" || route.page === "guide" };
}

/** The stick drawing on its own, for the share image. */
export function renderStickSvg(lang: Lang) {
  return renderToStaticMarkup(
    <LangProvider lang={lang}>
      <StickArt title="" values={{ size: "JR", flex: "40", curve: "P92", hand: "L", length: '52"' }} />
    </LangProvider>,
  );
}

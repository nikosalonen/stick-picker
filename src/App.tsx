import { useEffect, useState } from "react";
import { copy } from "./copy";
import { LangProvider, saveLang, type Text } from "./i18n";
import { Guide } from "./pages/Guide";
import { Home } from "./pages/Home";
import { Quiz } from "./pages/Quiz";
import { Result } from "./pages/Result";
import { BASE, navigate, onRouteChange, parseLocation, pathTo, samePageIn, type Route } from "./router";
import { headFor } from "./seo";

type Location = { pathname: string; search: string };

const currentLocation = (): Location => ({ pathname: window.location.pathname, search: window.location.search });

function splitUrl(url: string): Location {
  const [pathname, query = ""] = url.split("?");
  return { pathname, search: query ? `?${query}` : "" };
}

/** `url` is set when rendering on the server at build time; in the browser it is read from the address bar. */
export function App({ url }: { url?: string }) {
  const [location, setLocation] = useState<Location>(() => (url ? splitUrl(url) : currentLocation()));
  const route = parseLocation(location.pathname, location.search);

  useEffect(
    () =>
      onRouteChange((fromNavigate) => {
        setLocation(currentLocation());
        if (!fromNavigate) return;
        // Links like /guide/#flex land on that section once the new page has rendered.
        const id = window.location.hash.slice(1);
        if (id) requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
        else window.scrollTo({ top: 0 });
      }),
    [],
  );

  // Links are real URLs (crawlers follow them); inside the app they change page without a reload.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!anchor || anchor.target || anchor.hasAttribute("download")) return;
      const target = new URL(anchor.href);
      if (target.origin !== window.location.origin || !target.pathname.startsWith(BASE)) return;
      const samePage = target.pathname === window.location.pathname && target.search === window.location.search;
      if (samePage && target.hash) return;
      event.preventDefault();
      navigate(target.pathname + target.search + target.hash);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Keep the title and meta tags in step with the page, as the prerendered HTML has them.
  useEffect(() => {
    const head = headFor(route);
    document.title = head.title;
    document.documentElement.lang = head.lang;
    document.querySelector('meta[name="description"]')?.setAttribute("content", head.description);
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", head.canonical);
    document.querySelector('meta[name="robots"]')?.setAttribute("content", head.indexable ? "index, follow" : "noindex, follow");
  }, [location.pathname, location.search]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <LangProvider lang={route.lang}>
      <Shell route={route} search={location.search} />
    </LangProvider>
  );
}

function Shell({ route, search }: { route: Route; search: string }) {
  const { lang } = route;
  const t = (text: Text) => text[lang];
  const otherLang = lang === "fi" ? "en" : "fi";

  return (
    <div className="app" data-page={route.page}>
      <header className="topbar">
        <a href={pathTo(lang, "home")} className="wordmark" aria-label={t(copy.appName)}>
          <svg viewBox="0 0 40 24" aria-hidden="true">
            <path d="M6 2 L22 18 L36 18" />
          </svg>
          {t(copy.appName)}
        </a>
        <nav className="topnav">
          {route.page !== "guide" && <a href={pathTo(lang, "guide")}>{t(copy.navGuide)}</a>}
          {route.page === "guide" && <a href={pathTo(lang, "quiz", "age")}>{t(copy.navFind)}</a>}
          <a
            className="lang"
            href={samePageIn(route, otherLang, search)}
            hrefLang={otherLang}
            lang={otherLang}
            onClick={() => saveLang(otherLang)}
          >
            {t(copy.langSwitch)}
          </a>
        </nav>
      </header>

      {route.page === "home" && <Home />}
      {route.page === "guide" && <Guide />}
      {route.page === "quiz" && <Quiz step={route.step} />}
      {route.page === "result" && <Result answers={route.answers} preferences={route.preferences} />}
      {route.page === "notFound" && (
        <main className="not-found">
          <h1>{t(copy.notFound.title)}</h1>
          <p className="lead">{t(copy.notFound.body)}</p>
          <a className="button button-primary" href={pathTo(lang, "home")}>
            {t(copy.notFound.home)}
          </a>
        </main>
      )}

      {route.page !== "quiz" && (
        <footer className="footer">
          <p>{t(copy.footer)}</p>
        </footer>
      )}
    </div>
  );
}

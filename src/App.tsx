import { useEffect } from "react";
import { copy } from "./copy";
import { useLang } from "./i18n";
import { Guide } from "./pages/Guide";
import { Home } from "./pages/Home";
import { Quiz } from "./pages/Quiz";
import { Result } from "./pages/Result";
import { useRoute } from "./router";

export function App() {
  const { t, lang, setLang } = useLang();
  const route = useRoute();

  useEffect(() => {
    document.title = t(copy.appName);
  }, [t]);

  return (
    <div className="app" data-page={route.page}>
      <header className="topbar">
        <a href="#/" className="wordmark" aria-label={t(copy.appName)}>
          <svg viewBox="0 0 40 24" aria-hidden="true">
            <path d="M6 2 L22 18 L36 18" />
          </svg>
          {t(copy.appName)}
        </a>
        <nav className="topnav">
          {route.page !== "guide" && <a href="#/guide">{t(copy.navGuide)}</a>}
          {route.page === "guide" && <a href="#/quiz/age">{t(copy.navFind)}</a>}
          <button className="lang" onClick={() => setLang(lang === "fi" ? "en" : "fi")} lang={lang === "fi" ? "en" : "fi"}>
            {t(copy.langSwitch)}
          </button>
        </nav>
      </header>

      {route.page === "home" && <Home />}
      {route.page === "guide" && <Guide />}
      {route.page === "quiz" && <Quiz step={route.step} />}
      {route.page === "result" && <Result answers={route.answers} preferences={route.preferences} />}

      {route.page !== "quiz" && (
        <footer className="footer">
          <p>{t(copy.footer)}</p>
        </footer>
      )}
    </div>
  );
}

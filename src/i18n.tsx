import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "fi" | "en";

/** A piece of text in both languages. */
export type Text = { fi: string; en: string };

const LangContext = createContext<{ lang: Lang; setLang: (lang: Lang) => void }>({
  lang: "en",
  setLang: () => {},
});

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem("lang");
    if (saved === "fi" || saved === "en") return saved;
  } catch {
    // Storage can be blocked; fall back to the browser language.
  }
  return navigator.language.toLowerCase().startsWith("fi") ? "fi" : "en";
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem("lang", lang);
    } catch {
      // Not saving the choice is fine.
    }
  }, [lang]);

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  const { lang, setLang } = useContext(LangContext);
  const t = (text: Text) => text[lang];
  return { lang, setLang, t };
}

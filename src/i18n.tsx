import { createContext, useContext, type ReactNode } from "react";

export type Lang = "fi" | "en";

/** A piece of text in both languages. */
export type Text = { fi: string; en: string };

const LangContext = createContext<Lang>("en");

/** The language comes from the URL (/fi/... is Finnish), so every page has one fixed language. */
export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export function useLang() {
  const lang = useContext(LangContext);
  const t = (text: Text) => text[lang];
  return { lang, t };
}

const STORAGE_KEY = "lang";

/** The language the visitor chose before, if any. */
export function savedLang(): Lang | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "fi" || saved === "en" ? saved : null;
  } catch {
    // Storage can be blocked; then there is no saved choice.
    return null;
  }
}

export function saveLang(lang: Lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Not saving the choice is fine.
  }
}

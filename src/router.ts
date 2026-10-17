import { CURVE_ORDER } from "./data/curves";
import type { Lang } from "./i18n";
import {
  FLEX_OPTIONS,
  type AgeGroup,
  type Answers,
  type CurveId,
  type Hand,
  type Level,
  type Position,
  type Preferences,
  type ShotStyle,
} from "./logic/recommend";

/** Where the site lives, for example "/stick-picker/". Set by Vite's `base`. */
export const BASE: string = import.meta.env.BASE_URL;

export const QUIZ_STEPS = ["age", "body", "hand", "checkpoint", "level", "position", "shot"] as const;
export type QuizStep = (typeof QUIZ_STEPS)[number];

export type Route = { lang: Lang } & (
  | { page: "home" }
  | { page: "guide" }
  | { page: "quiz"; step: QuizStep }
  | { page: "result"; answers: Answers | null; preferences: Preferences }
  | { page: "notFound" }
);

export type Page = Route["page"];

// Page slugs per language, so Finnish pages get Finnish URLs.
const SLUGS = {
  guide: { en: "guide", fi: "opas" },
  quiz: { en: "quiz", fi: "kysely" },
  result: { en: "result", fi: "tulos" },
} as const;

export function parseLocation(pathname: string, search: string): Route {
  const rest = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname.replace(/^\//, "");
  const parts = rest.split("/").filter(Boolean);
  let lang: Lang = "en";
  if (parts[0] === "fi") {
    lang = "fi";
    parts.shift();
  }
  const [first, second] = parts;
  if (!first || first === "index.html") return { lang, page: "home" };
  if (first === SLUGS.guide[lang]) return { lang, page: "guide" };
  if (first === SLUGS.quiz[lang]) {
    const step = QUIZ_STEPS.find((s) => s === second) ?? "age";
    return { lang, page: "quiz", step };
  }
  if (first === SLUGS.result[lang]) {
    return { lang, page: "result", answers: answersFromQuery(search), preferences: preferencesFromQuery(search) };
  }
  return { lang, page: "notFound" };
}

/** The path of a page, with the base and a trailing slash, for example "/stick-picker/fi/opas/". */
export function pathTo(lang: Lang, page: Exclude<Page, "notFound">, step?: QuizStep): string {
  const prefix = BASE + (lang === "fi" ? "fi/" : "");
  switch (page) {
    case "home":
      return prefix;
    case "guide":
      return `${prefix}${SLUGS.guide[lang]}/`;
    case "quiz":
      return `${prefix}${SLUGS.quiz[lang]}/${step ?? "age"}/`;
    case "result":
      return `${prefix}${SLUGS.result[lang]}/`;
  }
}

/** The result link. Favourites are kept so a shared link shows the same stick. */
export function resultPath(lang: Lang, answers: Answers, preferences: Preferences = {}): string {
  const params = new URLSearchParams(answersToQuery(answers));
  if (preferences.flex !== undefined) params.set("ff", String(preferences.flex));
  if (preferences.curve) params.set("fc", preferences.curve);
  return `${pathTo(lang, "result")}?${params.toString()}`;
}

/** The same page in another language, keeping the quiz step or the result answers. */
export function samePageIn(route: Route, lang: Lang, search: string): string {
  switch (route.page) {
    case "quiz":
      return pathTo(lang, "quiz", route.step);
    case "result":
      return pathTo(lang, "result") + search;
    case "notFound":
      return pathTo(lang, "home");
    default:
      return pathTo(lang, route.page);
  }
}

/**
 * Old links used hash routes such as "#/result?age=...". Turns one into the new path,
 * or returns null when the hash is not an old route.
 */
export function legacyHashToPath(hash: string, lang: Lang): string | null {
  if (!hash.startsWith("#/")) return null;
  const [path, query = ""] = hash.slice(1).split("?");
  const parts = path.split("/").filter(Boolean);
  if (parts[0] === "guide") return pathTo(lang, "guide");
  if (parts[0] === "quiz") return pathTo(lang, "quiz", QUIZ_STEPS.find((s) => s === parts[1]));
  if (parts[0] === "result") return `${pathTo(lang, "result")}${query ? `?${query}` : ""}`;
  return pathTo(lang, "home");
}

// Client-side navigation: change the URL without a page load and tell the app.
const ROUTE_EVENT = "routechange";

export function navigate(to: string, { replace = false } = {}) {
  if (replace) window.history.replaceState(null, "", to);
  else window.history.pushState(null, "", to);
  window.dispatchEvent(new Event(ROUTE_EVENT));
}

export function onRouteChange(listener: (fromNavigate: boolean) => void): () => void {
  const fromNavigate = () => listener(true);
  const fromHistory = () => listener(false);
  window.addEventListener(ROUTE_EVENT, fromNavigate);
  window.addEventListener("popstate", fromHistory);
  return () => {
    window.removeEventListener(ROUTE_EVENT, fromNavigate);
    window.removeEventListener("popstate", fromHistory);
  };
}

const AGES: AgeGroup[] = ["under7", "7to9", "10to13", "14to17", "adult"];
const HANDS: Hand[] = ["left", "right", "unsure"];
const LEVELS: Level[] = ["new", "team", "competitive"];
const POSITIONS: Position[] = ["forward", "defense", "unsure"];
const SHOTS: ShotStyle[] = ["quick", "power", "unsure"];

function oneOf<T extends string>(values: T[], value: string | null): T | null {
  return values.find((v) => v === value) ?? null;
}

function preferencesFromQuery(query: string): Preferences {
  const params = new URLSearchParams(query);
  const flex = Number(params.get("ff"));
  const curve = CURVE_ORDER.find((id) => id === params.get("fc")) as CurveId | undefined;
  return {
    flex: FLEX_OPTIONS.includes(flex) ? flex : undefined,
    curve,
  };
}

export function answersToQuery(a: Answers): string {
  const params = new URLSearchParams({
    age: a.age,
    h: String(a.heightCm),
    w: String(a.weightKg),
    hand: a.hand,
    level: a.level,
    pos: a.position,
    shot: a.shot,
  });
  return params.toString();
}

function answersFromQuery(query: string): Answers | null {
  const params = new URLSearchParams(query);
  const age = oneOf(AGES, params.get("age"));
  const hand = oneOf(HANDS, params.get("hand"));
  const level = oneOf(LEVELS, params.get("level"));
  const position = oneOf(POSITIONS, params.get("pos"));
  const shot = oneOf(SHOTS, params.get("shot"));
  const heightCm = Number(params.get("h"));
  const weightKg = Number(params.get("w"));
  const sane = heightCm >= 80 && heightCm <= 220 && weightKg >= 10 && weightKg <= 160;
  if (!age || !hand || !level || !position || !shot || !sane) return null;
  return { age, heightCm, weightKg, hand, level, position, shot };
}

import { useEffect, useState } from "react";
import type { AgeGroup, Answers, Hand, Level, Position, ShotStyle } from "./logic/recommend";

export type Route =
  | { page: "home" }
  | { page: "guide" }
  | { page: "quiz"; step: QuizStep }
  | { page: "result"; answers: Answers | null };

export const QUIZ_STEPS = ["age", "body", "hand", "checkpoint", "level", "position", "shot"] as const;
export type QuizStep = (typeof QUIZ_STEPS)[number];

function parse(hash: string): Route {
  const [path, query = ""] = hash.replace(/^#/, "").split("?");
  const parts = path.split("/").filter(Boolean);
  if (parts[0] === "guide") return { page: "guide" };
  if (parts[0] === "quiz") {
    const step = QUIZ_STEPS.find((s) => s === parts[1]) ?? "age";
    return { page: "quiz", step };
  }
  if (parts[0] === "result") return { page: "result", answers: answersFromQuery(query) };
  return { page: "home" };
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parse(window.location.hash));
  useEffect(() => {
    const onChange = () => {
      setRoute(parse(window.location.hash));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

export function go(hash: string) {
  window.location.hash = hash;
}

const AGES: AgeGroup[] = ["under7", "7to9", "10to13", "14to17", "adult"];
const HANDS: Hand[] = ["left", "right", "unsure"];
const LEVELS: Level[] = ["new", "team", "competitive"];
const POSITIONS: Position[] = ["forward", "defense", "unsure"];
const SHOTS: ShotStyle[] = ["quick", "power", "unsure"];

function oneOf<T extends string>(values: T[], value: string | null): T | null {
  return values.find((v) => v === value) ?? null;
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

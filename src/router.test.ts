import { describe, expect, it } from "vitest";
import { legacyHashToPath, parseLocation, pathTo, resultPath, samePageIn } from "./router";
import { headFor, prerenderPaths } from "./seo";

const answers = { age: "adult", heightCm: 180, weightKg: 80, hand: "left", level: "team", position: "unsure", shot: "unsure" } as const;

describe("router", () => {
  it("parses English and Finnish paths", () => {
    expect(parseLocation("/stick-picker/", "")).toEqual({ lang: "en", page: "home" });
    expect(parseLocation("/stick-picker/fi/opas/", "")).toEqual({ lang: "fi", page: "guide" });
    expect(parseLocation("/stick-picker/fi/kysely/hand/", "")).toEqual({ lang: "fi", page: "quiz", step: "hand" });
    expect(parseLocation("/stick-picker/nope/", "").page).toBe("notFound");
    // An English slug under /fi/ is not a Finnish page.
    expect(parseLocation("/stick-picker/fi/guide/", "").page).toBe("notFound");
  });

  it("round-trips every page through pathTo and parseLocation", () => {
    for (const lang of ["en", "fi"] as const) {
      expect(parseLocation(pathTo(lang, "guide"), "")).toEqual({ lang, page: "guide" });
      expect(parseLocation(pathTo(lang, "quiz", "shot"), "")).toEqual({ lang, page: "quiz", step: "shot" });
    }
  });

  it("keeps answers and favourites in result links", () => {
    const path = resultPath("fi", answers, { flex: 75, curve: "P28" });
    const [pathname, query] = path.split("?");
    const route = parseLocation(pathname, `?${query}`);
    expect(route).toMatchObject({ lang: "fi", page: "result", answers, preferences: { flex: 75, curve: "P28" } });
  });

  it("switches language on the same page", () => {
    const route = parseLocation("/stick-picker/quiz/body/", "");
    expect(samePageIn(route, "fi", "")).toBe("/stick-picker/fi/kysely/body/");
  });

  it("turns old hash links into paths", () => {
    expect(legacyHashToPath("#/result?age=adult&h=180", "en")).toBe("/stick-picker/result/?age=adult&h=180");
    expect(legacyHashToPath("#/guide", "fi")).toBe("/stick-picker/fi/opas/");
    expect(legacyHashToPath("#flex", "en")).toBeNull();
  });
});

describe("seo", () => {
  it("lets search engines index only the home and guide pages", () => {
    const indexable = prerenderPaths().filter((path) => headFor(parseLocation(path, "")).indexable);
    expect(indexable).toEqual(["/stick-picker/", "/stick-picker/guide/", "/stick-picker/fi/", "/stick-picker/fi/opas/"]);
  });

  it("links each page to its other-language version", () => {
    const head = headFor(parseLocation("/stick-picker/fi/opas/", ""));
    expect(head.canonical).toBe("https://nikosalonen.github.io/stick-picker/fi/opas/");
    expect(head.alternates).toContainEqual({ lang: "en", href: "https://nikosalonen.github.io/stick-picker/guide/" });
    expect(head.alternates).toContainEqual({ lang: "x-default", href: "https://nikosalonen.github.io/stick-picker/guide/" });
  });

  it("keeps titles and descriptions within search result lengths", () => {
    for (const path of prerenderPaths()) {
      const head = headFor(parseLocation(path, ""));
      expect(head.title.length).toBeLessThanOrEqual(75);
      expect(head.description.length).toBeLessThanOrEqual(160);
    }
  });
});

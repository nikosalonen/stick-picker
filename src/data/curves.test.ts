import { describe, expect, it } from "vitest";
import type { Answers } from "../logic/recommend";
import { CURVE_ORDER, rateCurve } from "./curves";

const base: Answers = { age: "adult", heightCm: 180, weightKg: 80, hand: "left", level: "team", position: "unsure", shot: "unsure" };

describe("rateCurve", () => {
  it("always recommends the two all-round curves", () => {
    for (const answers of [undefined, base, { ...base, level: "new" as const }, { ...base, position: "defense" as const }]) {
      expect(rateCurve("P92", answers).verdict).toBe("recommended");
      expect(rateCurve("P88", answers).verdict).toBe("recommended");
    }
  });

  it("steers beginners away from deep and closed curves", () => {
    const learner = { ...base, age: "7to9" as const, level: "new" as const };
    for (const id of ["P28", "P90TM", "W71", "P30"] as const) {
      expect(rateCurve(id, learner).verdict).toBe("notRecommended");
    }
  });

  it("recommends toe curves to quick-shooting forwards but not to defensemen", () => {
    expect(rateCurve("P28", { ...base, shot: "quick", position: "forward" }).verdict).toBe("recommended");
    expect(rateCurve("P28", { ...base, position: "defense" }).verdict).toBe("notRecommended");
  });

  it("gives every curve a reason in both languages", () => {
    for (const id of CURVE_ORDER) {
      const { reason } = rateCurve(id, base);
      expect(reason.en.length).toBeGreaterThan(10);
      expect(reason.fi.length).toBeGreaterThan(10);
    }
  });
});

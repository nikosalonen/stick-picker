import { describe, expect, it } from "vitest";
import { recommend, pickSizeAndFlex, SIZES, type Answers } from "./recommend";

const adult: Answers = {
  age: "adult",
  heightCm: 180,
  weightKg: 80,
  hand: "left",
  level: "team",
  position: "unsure",
  shot: "unsure",
};

const kid: Answers = {
  age: "10to13",
  heightCm: 140,
  weightKg: 33,
  hand: "right",
  level: "team",
  position: "unsure",
  shot: "unsure",
};

describe("pickSizeAndFlex", () => {
  it("maps typical players to the usual size categories", () => {
    expect(recommend({ ...kid, age: "under7", heightCm: 112, weightKg: 19 }).size).toBe("youth");
    expect(recommend(kid).size).toBe("junior");
    expect(recommend({ ...kid, age: "14to17", heightCm: 165, weightKg: 55 }).size).toBe("intermediate");
    expect(recommend(adult).size).toBe("senior");
  });

  it("gives a short adult beginner an intermediate stick instead of a stiff, heavily cut senior", () => {
    const rec = recommend({ ...adult, heightCm: 170, weightKg: 70, level: "new" });
    expect(rec.size).toBe("intermediate");
    expect(Math.abs(rec.flexAfterCut - 62)).toBeLessThan(8);
  });

  it("never picks a size that is too short for the player", () => {
    const fit = pickSizeAndFlex(150, 40);
    expect(fit.stockLengthIn * 2.54).toBeGreaterThanOrEqual(150 - 2.54);
  });
});

describe("recommend", () => {
  it("gives an average adult a senior hybrid stick around flex 75-80", () => {
    const rec = recommend(adult);
    expect(rec.size).toBe("senior");
    expect(rec.flex).toBeGreaterThanOrEqual(75);
    expect(rec.flex).toBeLessThanOrEqual(80);
    expect(rec.kick).toBe("hybrid");
    expect(rec.curve).toBe("P92");
  });

  it("keeps the length between chin and nose height", () => {
    const rec = recommend(adult);
    expect(rec.lengthCm).toBeGreaterThanOrEqual(rec.lengthRangeCm[0]);
    expect(rec.lengthCm).toBeLessThanOrEqual(rec.lengthRangeCm[1]);
  });

  it("gives a 140 cm child a soft junior stick that needs only a small cut", () => {
    const rec = recommend(kid);
    expect(rec.size).toBe("junior");
    expect(rec.flex).toBeLessThanOrEqual(35);
    expect(rec.cutCm).toBeLessThan(6);
  });

  it("picks a softer label flex when a lot is cut off", () => {
    const longCut = recommend({ ...adult, heightCm: 168, weightKg: 80 });
    expect(longCut.flexAfterCut).toBeGreaterThan(longCut.flex);
  });

  it("only offers flex values the size is sold in", () => {
    for (const heightCm of [100, 120, 135, 150, 160, 175, 195]) {
      for (const weightKg of [15, 30, 50, 70, 100]) {
        const rec = recommend({ ...adult, heightCm, weightKg });
        expect(SIZES[rec.size].flexes).toContain(rec.flex);
      }
    }
  });

  it("matches kick point to shot style for experienced players", () => {
    expect(recommend({ ...adult, shot: "quick" }).kick).toBe("low");
    expect(recommend({ ...adult, shot: "power" }).kick).toBe("mid");
  });

  it("ignores shot style for young beginners and gives them a mild curve", () => {
    const rec = recommend({ ...kid, age: "7to9", heightCm: 128, weightKg: 26, shot: "power" });
    expect(rec.kick).toBe("hybrid");
    expect(rec.kickMatters).toBe(false);
    expect(rec.curve).toBe("P88");
  });

  it("gives defensemen a stiffer and longer stick than forwards", () => {
    const forward = recommend({ ...adult, position: "forward" });
    const defense = recommend({ ...adult, position: "defense" });
    expect(defense.lengthCm).toBeGreaterThan(forward.lengthCm);
    expect(defense.flex).toBeGreaterThanOrEqual(forward.flex);
  });
});

describe("favourites", () => {
  it("keeps a favourite flex and reports how it feels against the target", () => {
    const rec = recommend(adult, { flex: 102 });
    expect(rec.flex).toBe(102);
    expect(rec.favourite.flex).toBe(true);
    expect(rec.suggested.flex).toBeLessThan(102);
    expect(rec.flexFit).toBe("stiffer");
  });

  it("moves to the size that sells the favourite flex", () => {
    const rec = recommend(kid, { flex: 60 });
    expect(rec.suggested.size).toBe("junior");
    expect(rec.size).toBe("intermediate");
    expect(rec.flex).toBe(60);
  });

  it("uses a favourite curve but still lists our pick as an alternative", () => {
    const rec = recommend(adult, { curve: "P28" });
    expect(rec.curve).toBe("P28");
    expect(rec.suggested.curve).toBe("P92");
    expect(rec.curveAlternatives).toContain("P92");
  });

  it("ignores a flex no shop sells", () => {
    const rec = recommend(adult, { flex: 63 });
    expect(rec.favourite.flex).toBe(false);
  });
});

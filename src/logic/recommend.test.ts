import { describe, expect, it } from "vitest";
import { CURVE_ORDER } from "../data/curves";
import { STOCK_STICKS } from "../data/stock";
import { MODELS } from "../data/models";
import { candidatesFor } from "./candidates";
import { curveMadeIn, FLEX_OPTIONS, recommend, SIZES, type Answers, type Preferences, type SizeCategory } from "./recommend";

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

describe("size", () => {
  it("maps typical players to the usual size categories", () => {
    expect(recommend({ ...kid, age: "under7", heightCm: 112, weightKg: 19 }).size).toBe("youth");
    // CCM's 48" "youth" stick and Bauer's 50" "junior" stick both fit a 140 cm child.
    expect(["youth", "junior"]).toContain(recommend(kid).size);
    expect(recommend({ ...kid, age: "14to17", heightCm: 165, weightKg: 55 }).size).toBe("intermediate");
    expect(recommend(adult).size).toBe("senior");
  });

  it("gives a short adult beginner an intermediate stick instead of a stiff, heavily cut senior", () => {
    const rec = recommend({ ...adult, heightCm: 170, weightKg: 70, level: "new" });
    expect(rec.size).toBe("intermediate");
    expect(Math.abs(rec.flexAfterCut - 62)).toBeLessThan(8);
  });

  it("never picks a stick that is too short to reach the chin", () => {
    for (const heightCm of [100, 125, 150, 175, 185]) {
      const rec = recommend({ ...adult, heightCm });
      expect(rec.stockLengthIn * 2.54).toBeGreaterThanOrEqual(rec.lengthRangeCm[0]);
      expect(rec.needsExtension).toBe(false);
    }
  });

  it("suggests an extension when even the longest stick is too short", () => {
    expect(recommend({ ...adult, heightCm: 205, weightKg: 100 }).needsExtension).toBe(true);
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

  it("gives a 140 cm child a soft stick that needs only a small cut", () => {
    const rec = recommend(kid);
    expect(rec.flex).toBeLessThanOrEqual(35);
    expect(rec.cutCm).toBeLessThan(6);
    expect(Math.abs(rec.flexAfterCut - rec.targetFlex)).toBeLessThanOrEqual(7);
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

  it("ignores shot style for young beginners and gives them a mild curve made in their size", () => {
    const youth = recommend({ ...kid, age: "7to9", heightCm: 120, weightKg: 22, level: "new", shot: "power" });
    expect(youth.kick).toBe("hybrid");
    expect(youth.kickMatters).toBe(false);
    expect(youth.size).toBe("youth");
    // P88 is not made in youth sizes, so the mildest youth curve is P92.
    expect(youth.curve).toBe("P92");
    const junior = recommend({ ...kid, heightCm: 152, weightKg: 42, level: "new" });
    expect(junior.sizes).toEqual(["junior"]);
    expect(junior.curve).toBe("P88");
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
    const rec = recommend({ ...adult, weightKg: 70 }, { flex: 95 });
    expect(rec.flex).toBe(95);
    expect(rec.favourite.flex).toBe(true);
    expect(rec.suggested.flex).toBeLessThan(95);
    expect(rec.flexFit).toBe("stiffer");
  });

  it("moves to the size that sells the favourite flex", () => {
    const player = { ...kid, heightCm: 150, weightKg: 40 };
    const rec = recommend(player, { flex: 65 });
    expect(recommend(player).size).toBe("junior");
    expect(rec.size).toBe("intermediate");
    expect(rec.flex).toBe(65);
    expect(rec.flexes).toEqual([65]);
  });

  it("uses a favourite curve but still lists our pick as an alternative", () => {
    const rec = recommend(adult, { curve: "P28" });
    expect(rec.curve).toBe("P28");
    expect(rec.suggested.curve).toBe("P92");
    expect(rec.curveAlternatives).toContain("P92");
  });

  it("ignores a flex no shop sells", () => {
    const rec = recommend(adult, { flex: 61 });
    expect(rec.favourite.flex).toBe(false);
  });

  it("replaces a favourite curve that is not made in the size", () => {
    const rec = recommend({ ...kid, age: "under7", heightCm: 112, weightKg: 19 }, { curve: "P88" });
    expect(rec.size).toBe("youth");
    expect(rec.curve).not.toBe("P88");
    expect(rec.unavailableCurve).toBe("P88");
  });
});

describe("only real sticks", () => {
  // Every combination of answers and favourites must end in a stick a shop actually sells.
  const ages = ["under7", "7to9", "10to13", "14to17", "adult"] as const;
  const levels = ["new", "team", "competitive"] as const;
  const positions = ["forward", "defense", "unsure"] as const;
  const shots = ["quick", "power", "unsure"] as const;
  const favourites: Preferences[] = [
    {},
    ...FLEX_OPTIONS.map((flex) => ({ flex })),
    ...CURVE_ORDER.map((curve) => ({ curve })),
  ];

  it("recommends only size, flex, length and curve combinations that are sold", () => {
    let checked = 0;
    for (const age of ages)
      for (const heightCm of [90, 105, 120, 135, 150, 165, 180, 195, 210])
        for (const weightKg of [15, 30, 50, 75, 100, 130])
          for (const level of levels)
            for (const position of positions)
              for (const shot of shots)
                for (const preferences of favourites) {
                  const rec = recommend({ age, heightCm, weightKg, hand: "left", level, position, shot }, preferences);
                  expect(rec.sellers.length).toBeGreaterThan(0);
                  for (const seller of rec.sellers) {
                    const sold = STOCK_STICKS.some(
                      (s) => s.brand === seller.brand && s.size === rec.size && s.flex === rec.flex && s.lengthIn === seller.lengthIn,
                    );
                    expect(sold, `${seller.brand} ${rec.size} ${rec.flex} @ ${seller.lengthIn}"`).toBe(true);
                  }
                  expect(rec.sellers.map((seller) => seller.lengthIn)).toContain(rec.stockLengthIn);
                  for (const size of rec.sizes) {
                    expect(curveMadeIn(rec.curve, size), `${rec.curve} in ${size}`).toBe(true);
                    for (const curve of rec.curveAlternatives) expect(curveMadeIn(curve, size)).toBe(true);
                  }
                  expect(rec.sizes).toContain(rec.size);
                  expect(rec.flexes).toContain(rec.flex);
                  for (const option of rec.options) {
                    const sold = STOCK_STICKS.some((s) => s.size === option.size && s.flex === option.flex && s.lengthIn === option.lengthIn);
                    expect(sold, `${option.size} ${option.flex} @ ${option.lengthIn}"`).toBe(true);
                  }
                  for (const lengthIn of rec.lengthsIn) {
                    const sold = STOCK_STICKS.some((s) => rec.options.some((o) => o.size === s.size && o.flex === s.flex) && s.lengthIn === lengthIn);
                    expect(sold).toBe(true);
                  }
                  for (const candidate of candidatesFor(rec, { age, heightCm, weightKg, hand: "left", level, position, shot })) {
                    expect(candidate.flexes.length).toBeGreaterThan(0);
                    for (const flex of candidate.flexes) {
                      expect(rec.flexes).toContain(flex);
                      expect(candidate.sizes.some((size) => candidate.model.flexes[size]?.includes(flex))).toBe(true);
                    }
                  }
                  checked++;
                }
    expect(checked).toBeGreaterThan(10000);
  }, 120_000);
});

describe("model catalogue", () => {
  it("lists only flexes that the brand sells in that size", () => {
    for (const model of MODELS) {
      for (const [size, flexes] of Object.entries(model.flexes) as [SizeCategory, number[]][]) {
        for (const flex of flexes) {
          const sold = STOCK_STICKS.some((s) => s.brand === model.brand && s.size === size && s.flex === flex);
          expect(sold, `${model.brand} ${model.name} ${size} ${flex}`).toBe(true);
        }
      }
    }
  });
});

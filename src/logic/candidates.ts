import { MODELS, type StickModel, type Tier } from "../data/models";
import type { Answers, Recommendation, SizeCategory } from "./recommend";

export type Candidate = {
  model: StickModel;
  /** The model's flexes that fall in the recommended range. */
  flexes: number[];
  /** The sizes those flexes come in for this model. */
  sizes: SizeCategory[];
  /** True when the model's family has the recommended kick point. */
  kickMatch: boolean;
};

/** Which price level to show first. Kids and beginners don't need the top models. */
function tierOrder(answers: Answers): Tier[] {
  const kid = answers.age !== "adult" && answers.age !== "14to17";
  if (kid || answers.level === "new") return ["value", "mid", "top"];
  if (answers.level === "competitive") return ["top", "mid", "value"];
  return ["mid", "value", "top"];
}

/**
 * Real models made in the recommended size and sold in a flex from the recommended range.
 * The best matches come first, mixing brands so the list isn't all one brand.
 */
export function candidatesFor(rec: Recommendation, answers: Answers, limit = 6): Candidate[] {
  const tiers = tierOrder(answers);
  const matches = MODELS.flatMap((model) => {
    const hits = rec.options.filter((option) => model.flexes[option.size]?.includes(option.flex));
    if (hits.length === 0) return [];
    const flexes = [...new Set(hits.map((hit) => hit.flex))].sort((a, b) => a - b);
    const sizes = rec.sizes.filter((size) => hits.some((hit) => hit.size === size));
    return [{ model, flexes, sizes, kickMatch: model.kick === rec.kick }];
  });
  const rank = (c: Candidate) => (rec.kickMatters && !c.kickMatch ? 10 : 0) + tiers.indexOf(c.model.tier);
  const sorted = [...matches].sort((a, b) => rank(a) - rank(b));

  // Take the best of each brand in turn, so every brand that fits shows up early.
  const byBrand = new Map<string, Candidate[]>();
  for (const candidate of sorted) {
    byBrand.set(candidate.model.brand, [...(byBrand.get(candidate.model.brand) ?? []), candidate]);
  }
  const picked: Candidate[] = [];
  while (picked.length < limit && [...byBrand.values()].some((list) => list.length > 0)) {
    const round = [...byBrand.values()]
      .map((list) => list.shift())
      .filter((candidate): candidate is Candidate => candidate !== undefined)
      .sort((a, b) => rank(a) - rank(b));
    picked.push(...round.slice(0, limit - picked.length));
  }
  return picked;
}

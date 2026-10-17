import { CURVE_SIZES, STOCK_STICKS, type Brand } from "../data/stock";

export type AgeGroup = "under7" | "7to9" | "10to13" | "14to17" | "adult";
export type Hand = "left" | "right" | "unsure";
export type Level = "new" | "team" | "competitive";
export type Position = "forward" | "defense" | "unsure";
export type ShotStyle = "quick" | "power" | "unsure";

export type Answers = {
  age: AgeGroup;
  heightCm: number;
  weightKg: number;
  hand: Hand;
  level: Level;
  position: Position;
  shot: ShotStyle;
};

export type SizeCategory = "youth" | "junior" | "intermediate" | "senior";
export type KickPoint = "low" | "hybrid" | "mid";
export type CurveId = "P92" | "P88" | "P90TM" | "P28";

/** What the player already knows they like. Both are optional. */
export type Preferences = { flex?: number; curve?: CurveId };

/** Another real stick that would also suit the player. */
export type StickOption = { size: SizeCategory; flex: number; lengthIn: number; flexAfterCut: number };

/** A brand that sells a size and flex, and the uncut length it comes in. */
export type Seller = { brand: Brand; lengthIn: number };

export type Recommendation = {
  size: SizeCategory;
  /** Stick length in cm after cutting, measured in shoes from floor to the end of the stick. */
  lengthCm: number;
  /** Acceptable length: chin height to nose height in shoes. */
  lengthRangeCm: [number, number];
  /** The uncut length to buy, in inches. Always a length that is sold with this flex. */
  stockLengthIn: number;
  /** How much the shop will roughly cut off that stick, in cm (0 if none). */
  cutCm: number;
  /** The flex number to look for on the label. */
  flex: number;
  /**
   * Every real stick that suits the player: the range to look in. It can span two sizes,
   * because brands name sizes differently (one brand's 48" Youth is another's 50" Junior).
   */
  options: StickOption[];
  /** Sizes in the range, smallest first. Includes `size`. */
  sizes: SizeCategory[];
  /** Label flexes in the range, softest first. Includes `flex`. */
  flexes: number[];
  /** Uncut lengths in the range, shortest first. */
  lengthsIn: number[];
  /** True when even the longest stick sold is shorter than the player's chin. */
  needsExtension: boolean;
  /** Roughly how stiff the stick feels after it is cut to length. */
  flexAfterCut: number;
  /** Brands that sell this size and flex, each with its own uncut length. */
  sellers: Seller[];
  kick: KickPoint;
  curve: CurveId;
  curveAlternatives: CurveId[];
  hand: Hand;
  /** True when the player is small or new enough that kick point barely matters. */
  kickMatters: boolean;
  /** The flex the player should feel after cutting, from body weight and level. */
  targetFlex: number;
  /** What we would pick without the player's favourites. */
  suggested: { size: SizeCategory; flex: number; curve: CurveId };
  /** Which values come from the player's favourites instead of our pick. */
  favourite: { flex: boolean; curve: boolean };
  /** A favourite curve that is not made in this size, so it was replaced. */
  unavailableCurve?: CurveId;
  /** How the stick feels compared with the target: much stiffer, much softer or about right. */
  flexFit: "good" | "stiffer" | "softer";
};

export const CM_PER_INCH = 2.54;
const LBS_PER_KG = 2.2046;

export const SIZE_ORDER: SizeCategory[] = ["youth", "junior", "intermediate", "senior"];

/** Typical player heights per size. Brands differ by a few centimetres. */
// CCM's youth sticks go up to 48", so youth reaches 140 cm.
const SIZE_HEIGHTS: Record<SizeCategory, [number, number]> = {
  youth: [90, 140],
  junior: [130, 158],
  intermediate: [150, 172],
  senior: [165, 205],
};

const unique = (values: number[]) => [...new Set(values)].sort((a, b) => a - b);

/** Per size: player heights, and the flexes and uncut lengths that are actually sold. */
export const SIZES: Record<SizeCategory, { heightCm: [number, number]; stockLengthsIn: number[]; flexes: number[] }> =
  Object.fromEntries(
    SIZE_ORDER.map((size) => {
      const sticks = STOCK_STICKS.filter((stick) => stick.size === size);
      return [
        size,
        {
          heightCm: SIZE_HEIGHTS[size],
          stockLengthsIn: unique(sticks.map((stick) => stick.lengthIn)),
          flexes: unique(sticks.map((stick) => stick.flex)),
        },
      ];
    }),
  ) as Record<SizeCategory, { heightCm: [number, number]; stockLengthsIn: number[]; flexes: number[] }>;

/** Flex values a shop sells, across all sizes, softest first. */
export const FLEX_OPTIONS: number[] = unique(STOCK_STICKS.map((stick) => stick.flex));

/** How far (in flex points) the felt flex may be from the target before we warn. */
const FLEX_WARNING_GAP = 12;

/** How close (in flex points) a stick must feel to the target to be part of the range. */
const RANGE_GAP = 10;

/** Extra score for a size that is not usually sold for this height (shops would point elsewhere). */
const OFF_SIZE_PENALTY = 6;

/** Cutting a stick makes it stiffer: roughly 3–5 flex points per inch cut. */
export const FLEX_PER_INCH_CUT = 4;

// In shoes, the end of the stick should land between the chin and the nose.
// These ratios approximate chin and nose height as a share of body height.
const CHIN_RATIO = 0.84;
const NOSE_RATIO = 0.89;

/** Share of body weight (in lbs) used as the target flex. */
function flexShare(answers: Answers): number {
  const byLevel: Record<Level, number> = { new: 0.4, team: 0.45, competitive: 0.5 };
  let share = byLevel[answers.level];
  // Defensemen take more long, hard shots and usually like a slightly stiffer stick.
  if (answers.position === "defense") share += 0.03;
  return share;
}

/** Curves in the order we'd suggest them for this player, before checking what the size is made in. */
function curvePreference(answers: Answers): CurveId[] {
  const young = answers.age === "under7" || answers.age === "7to9";
  if (young || answers.level === "new") return ["P88", "P92"];
  if (answers.shot === "quick" && answers.position !== "defense") return ["P92", "P28", "P90TM", "P88"];
  if (answers.position === "defense") return ["P92", "P88"];
  return ["P92", "P88"];
}

export const curveMadeIn = (curve: CurveId, size: SizeCategory) => CURVE_SIZES[curve].includes(size);

/** All sticks of one size and flex, from every brand that sells them. */
type StockGroup = { size: SizeCategory; flex: number; sellers: Seller[] };

const STOCK_GROUPS: StockGroup[] = Object.values(
  STOCK_STICKS.reduce<Record<string, StockGroup>>((groups, stick) => {
    const key = `${stick.size}-${stick.flex}`;
    groups[key] ??= { size: stick.size, flex: stick.flex, sellers: [] };
    groups[key].sellers.push({ brand: stick.brand, lengthIn: stick.lengthIn });
    return groups;
  }, {}),
);

type StickFit = StickOption & { cutCm: number; lengthCm: number; sellers: Seller[] };

/**
 * How a size and flex works for this player. Only brands whose stick reaches at least the
 * chin count. The length used is the shortest one that still reaches the target, so the
 * least has to be cut off. Returns null if no brand's stick is long enough.
 */
function fitGroup(group: StockGroup, targetLengthCm: number, chinCm: number): StickFit | null {
  const reaching = group.sellers.filter((seller) => seller.lengthIn * CM_PER_INCH >= chinCm);
  if (reaching.length === 0) return null;
  const longEnough = reaching.filter((seller) => seller.lengthIn * CM_PER_INCH >= targetLengthCm);
  const lengthIn =
    longEnough.length > 0
      ? Math.min(...longEnough.map((seller) => seller.lengthIn))
      : Math.max(...reaching.map((seller) => seller.lengthIn));
  const stockCm = lengthIn * CM_PER_INCH;
  const cutCm = Math.max(0, Math.round(stockCm - targetLengthCm));
  return {
    size: group.size,
    flex: group.flex,
    lengthIn,
    cutCm,
    lengthCm: Math.round(Math.min(stockCm, targetLengthCm)),
    flexAfterCut: Math.round(group.flex + (cutCm / CM_PER_INCH) * FLEX_PER_INCH_CUT),
    sellers: [...reaching].sort((a, b) => a.brand.localeCompare(b.brand) || a.lengthIn - b.lengthIn),
  };
}

/** Every real size and flex that suits a player of this height. */
function fits(groups: StockGroup[], targetLengthCm: number, chinCm: number): StickFit[] {
  const reaching = groups.flatMap((group) => fitGroup(group, targetLengthCm, chinCm) ?? []);
  if (reaching.length > 0) return reaching;
  // Taller than every stick: use the longest sticks sold, uncut.
  return groups.flatMap((group) => fitGroup(group, targetLengthCm, 0) ?? []).filter((fit, _, all) =>
    fit.lengthIn === Math.max(...all.map((other) => other.lengthIn)),
  );
}

/** True when the player's height is outside the usual range for the size (5 cm leeway). */
const offSize = (size: SizeCategory, heightCm: number) =>
  heightCm < SIZE_HEIGHTS[size][0] - 5 || heightCm > SIZE_HEIGHTS[size][1] + 5;

/**
 * How well a stick fits: closeness to the target flex first. Less cutting wins ties, and a
 * size that is unusual for the player's height loses.
 */
const score = (fit: StickFit, targetFlex: number, heightCm: number) =>
  Math.abs(fit.flexAfterCut - targetFlex) + fit.cutCm * 0.15 + (offSize(fit.size, heightCm) ? OFF_SIZE_PENALTY : 0);

const best = (candidates: StickFit[], targetFlex: number, heightCm: number) =>
  candidates.reduce((a, b) => (score(b, targetFlex, heightCm) < score(a, targetFlex, heightCm) ? b : a));

export function recommend(answers: Answers, preferences: Preferences = {}): Recommendation {
  const chin = answers.heightCm * CHIN_RATIO;
  const nose = answers.heightCm * NOSE_RATIO;
  // Shorter is easier to control, so beginners and forwards aim near the chin.
  // Defensemen like a bit more reach.
  const towardNose = answers.position === "defense" ? 0.6 : answers.level === "new" ? 0.1 : 0.3;
  const targetLengthCm = chin + (nose - chin) * towardNose;
  const targetFlex = answers.weightKg * LBS_PER_KG * flexShare(answers);

  const { heightCm } = answers;
  const suggestedFit = best(fits(STOCK_GROUPS, targetLengthCm, chin), targetFlex, heightCm);
  const favouriteFlex = preferences.flex !== undefined && FLEX_OPTIONS.includes(preferences.flex) ? preferences.flex : undefined;
  // A favourite flex can be sold in more than one size; take the size that fits best.
  const fit =
    favouriteFlex === undefined
      ? suggestedFit
      : best(fits(STOCK_GROUPS.filter((group) => group.flex === favouriteFlex), targetLengthCm, chin), targetFlex, heightCm);
  const gap = fit.flexAfterCut - targetFlex;
  const flexFit = gap > FLEX_WARNING_GAP ? "stiffer" : gap < -FLEX_WARNING_GAP ? "softer" : "good";

  // The range to look in: other real sticks, in any size usual for this height, that feel
  // about as good once cut. A favourite flex keeps the range to that flex.
  const pool =
    favouriteFlex !== undefined ? STOCK_GROUPS.filter((group) => group.flex === favouriteFlex) : STOCK_GROUPS;
  const inRange = [
    fit,
    ...fits(pool, targetLengthCm, chin).filter(
      (other) =>
        !(other.size === fit.size && other.flex === fit.flex) &&
        !offSize(other.size, heightCm) &&
        Math.abs(other.flexAfterCut - targetFlex) <= Math.max(RANGE_GAP, Math.abs(fit.flexAfterCut - targetFlex)),
    ),
  ];
  const options = inRange
    .map(({ size, flex, lengthIn, flexAfterCut }) => ({ size, flex, lengthIn, flexAfterCut }))
    .sort((a, b) => SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size) || a.flex - b.flex);
  const sizes = SIZE_ORDER.filter((size) => options.some((option) => option.size === size));
  const flexes = [...new Set(options.map((option) => option.flex))].sort((a, b) => a - b);
  const lengthsIn = [...new Set(inRange.flatMap((other) => other.sellers.map((seller) => seller.lengthIn)))].sort((a, b) => a - b);
  const longestCm = Math.max(...lengthsIn) * CM_PER_INCH;

  const kickMatters = !(answers.age === "under7" || answers.age === "7to9" || answers.level === "new");
  const kick: KickPoint = !kickMatters
    ? "hybrid"
    : answers.shot === "quick"
      ? "low"
      : answers.shot === "power"
        ? "mid"
        : "hybrid";

  // Only curves made in every size of the range; P92 is made in all of them.
  const curvesHere = curvePreference(answers).filter((id) => sizes.every((size) => curveMadeIn(id, size)));
  const suggestedCurves = curvesHere.length > 0 ? curvesHere : (["P92"] as CurveId[]);
  const favouriteCurveOk = preferences.curve !== undefined && sizes.every((size) => curveMadeIn(preferences.curve!, size));
  const curve = favouriteCurveOk ? preferences.curve! : suggestedCurves[0];
  const curveAlternatives = suggestedCurves.filter((id) => id !== curve).slice(0, 2);

  return {
    size: fit.size,
    flex: fit.flex,
    stockLengthIn: fit.lengthIn,
    cutCm: fit.cutCm,
    flexAfterCut: fit.flexAfterCut,
    sellers: fit.sellers,
    // The length to cut to; a stick shorter than that is used uncut.
    lengthCm: Math.round(Math.min(targetLengthCm, longestCm)),
    needsExtension: longestCm < chin,
    options,
    sizes,
    flexes,
    lengthsIn,
    lengthRangeCm: [Math.round(chin), Math.round(nose)],
    targetFlex: Math.round(targetFlex),
    suggested: { size: suggestedFit.size, flex: suggestedFit.flex, curve: suggestedCurves[0] },
    favourite: { flex: favouriteFlex !== undefined, curve: favouriteCurveOk },
    unavailableCurve: preferences.curve !== undefined && !favouriteCurveOk ? preferences.curve : undefined,
    flexFit,
    kick,
    curve,
    curveAlternatives,
    hand: answers.hand,
    kickMatters,
  };
}

/** A starting weight guess so the weight slider opens near a sensible value. */
export function typicalWeightKg(heightCm: number): number {
  const heightM = heightCm / 100;
  // Children have a lower BMI than adults.
  const bmi = heightCm < 150 ? 16.5 : heightCm < 170 ? 20 : 24;
  return Math.round(bmi * heightM * heightM);
}

export function typicalHeightCm(age: AgeGroup): number {
  return { under7: 115, "7to9": 130, "10to13": 150, "14to17": 172, adult: 178 }[age];
}

export const toInches = (cm: number) => Math.round(cm / CM_PER_INCH);
export const toLbs = (kg: number) => Math.round(kg * LBS_PER_KG);

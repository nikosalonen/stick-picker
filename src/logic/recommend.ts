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
export type CurveId = "P92" | "P88" | "P28" | "P14";

export type Recommendation = {
  size: SizeCategory;
  /** Target stick length in cm, measured in shoes from floor to the end of the stick. */
  lengthCm: number;
  /** Acceptable length: chin height to nose height in shoes. */
  lengthRangeCm: [number, number];
  /** The uncut length to buy, in inches. */
  stockLengthIn: number;
  /** How much the shop will roughly cut off that stick, in cm (0 if none). */
  cutCm: number;
  /** The flex number to look for on the label. */
  flex: number;
  /** Label flex values that are also fine. */
  flexRange: [number, number];
  /** Roughly how stiff the stick feels after it is cut to length. */
  flexAfterCut: number;
  kick: KickPoint;
  curve: CurveId;
  curveAlternatives: CurveId[];
  hand: Hand;
  /** True when the player is small or new enough that kick point barely matters. */
  kickMatters: boolean;
};

export const CM_PER_INCH = 2.54;
const LBS_PER_KG = 2.2046;

/**
 * Size categories as most brands sell them. Heights and lengths are typical, not exact:
 * brands differ by a few centimetres. `stockLengthsIn` are common uncut lengths.
 */
export const SIZES: Record<SizeCategory, { heightCm: [number, number]; stockLengthsIn: number[]; flexes: number[] }> = {
  youth: { heightCm: [90, 130], stockLengthsIn: [38, 40, 42, 44, 46], flexes: [10, 20, 25, 30, 35] },
  junior: { heightCm: [130, 155], stockLengthsIn: [46, 48, 50, 52, 54], flexes: [30, 35, 40, 50] },
  intermediate: { heightCm: [150, 170], stockLengthsIn: [54, 57], flexes: [55, 60, 65] },
  senior: { heightCm: [165, 205], stockLengthsIn: [60, 62], flexes: [70, 75, 77, 80, 85, 87, 95, 102] },
};

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

function nearest(values: number[], target: number): number {
  return values.reduce((best, v) => (Math.abs(v - target) < Math.abs(best - target) ? v : best), values[0]);
}

function pickCurve(answers: Answers): { curve: CurveId; alternatives: CurveId[] } {
  const young = answers.age === "under7" || answers.age === "7to9";
  if (young || answers.level === "new") return { curve: "P88", alternatives: ["P92"] };
  if (answers.shot === "quick" && answers.position !== "defense") return { curve: "P92", alternatives: ["P28", "P88"] };
  if (answers.position === "defense") return { curve: "P92", alternatives: ["P88", "P14"] };
  return { curve: "P92", alternatives: ["P88"] };
}

type SizeFit = { size: SizeCategory; stockLengthIn: number; cutCm: number; flex: number; flexAfterCut: number };

function fitSize(size: SizeCategory, lengthCm: number, targetFlex: number): SizeFit {
  const { stockLengthsIn, flexes } = SIZES[size];
  // Buy the shortest stock length that is still long enough; the shop cuts the rest.
  const lengthIn = lengthCm / CM_PER_INCH;
  const stockLengthIn = stockLengthsIn.find((l) => l >= lengthIn) ?? stockLengthsIn[stockLengthsIn.length - 1];
  const cutCm = Math.max(0, Math.round(stockLengthIn * CM_PER_INCH - lengthCm));
  const flexAdded = (cutCm / CM_PER_INCH) * FLEX_PER_INCH_CUT;
  // The label flex is measured on the uncut stick, so pick a softer label to make up for the cut.
  const flex = nearest(flexes, targetFlex - flexAdded);
  return { size, stockLengthIn, cutCm, flex, flexAfterCut: Math.round(flex + flexAdded) };
}

/**
 * Picks the size whose stick, once cut to length, comes closest to the target flex.
 * Only sizes sold long enough for the player are considered.
 */
export function pickSizeAndFlex(lengthCm: number, targetFlex: number): SizeFit {
  const lengthIn = lengthCm / CM_PER_INCH;
  const sizes = Object.keys(SIZES) as SizeCategory[];
  const longEnough = sizes.filter((size) => Math.max(...SIZES[size].stockLengthsIn) >= lengthIn - 1);
  const candidates = (longEnough.length > 0 ? longEnough : ["senior" as const]).map((size) =>
    fitSize(size, lengthCm, targetFlex),
  );
  return candidates.reduce((best, fit) =>
    Math.abs(fit.flexAfterCut - targetFlex) < Math.abs(best.flexAfterCut - targetFlex) ? fit : best,
  );
}

export function recommend(answers: Answers): Recommendation {
  const chin = answers.heightCm * CHIN_RATIO;
  const nose = answers.heightCm * NOSE_RATIO;
  // Shorter is easier to control, so beginners and forwards aim near the chin.
  // Defensemen like a bit more reach.
  const towardNose = answers.position === "defense" ? 0.6 : answers.level === "new" ? 0.1 : 0.3;
  const lengthCm = Math.round(chin + (nose - chin) * towardNose);
  const targetFlex = answers.weightKg * LBS_PER_KG * flexShare(answers);
  const fit = pickSizeAndFlex(lengthCm, targetFlex);

  const index = SIZES[fit.size].flexes.indexOf(fit.flex);
  const flexRange: [number, number] = [SIZES[fit.size].flexes[Math.max(0, index - 1)], fit.flex];

  const kickMatters = !(answers.age === "under7" || answers.age === "7to9" || answers.level === "new");
  const kick: KickPoint = !kickMatters
    ? "hybrid"
    : answers.shot === "quick"
      ? "low"
      : answers.shot === "power"
        ? "mid"
        : "hybrid";

  const { curve, alternatives } = pickCurve(answers);

  return {
    ...fit,
    lengthCm,
    lengthRangeCm: [Math.round(chin), Math.round(nose)],
    flexRange,
    kick,
    curve,
    curveAlternatives: alternatives,
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

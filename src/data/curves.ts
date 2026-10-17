import type { Text } from "../i18n";
import type { Answers, CurveId } from "../logic/recommend";

export type Curve = {
  id: CurveId;
  /** Where along the blade the bend is, 0 = heel, 1 = toe. Used by the drawing. */
  bendAt: number;
  /** How deep the curve is, 0–1. Used by the drawing. */
  depth: number;
  location: Text;
  face: Text;
  faceKind: "open" | "slightlyOpen" | "closed";
  depthLabel: Text;
  lie: string;
  /** Names for the same curve at every brand. */
  sameAs: string;
  /** Only the names that differ from the id, for short lists. */
  otherNames: string;
  summary: Text;
  beginnerFriendly: boolean;
};

const t = (en: string, fi: string): Text => ({ en, fi });

// Sources: CCM's curve chart (via Ice Warehouse), and the StickMeta and Reference Hockey
// cross-brand charts, October 2026. They disagree on some details, so only details that at
// least two of them share are listed. Curves they disagree on (P14, PM9, P91A) are left out,
// and so are curves no big brand sells as a stock stick any more (P30, P02, W71).
export const CURVES: Record<CurveId, Curve> = {
  P92: {
    id: "P92",
    bendAt: 0.58,
    depth: 0.55,
    location: t("Mid-toe", "Keskeltä kärkeen"),
    face: t("Open", "Avoin"),
    faceKind: "open",
    depthLabel: t("Medium", "Keskisyvä"),
    lie: "6",
    sameAs: "Bauer P92, CCM P29, Warrior W03, True T92, Sherwood PP92",
    otherNames: "CCM P29, Warrior W03, True T92",
    summary: t(
      "The most popular curve. Works for passing, shooting and lifting the puck. A safe choice for almost anyone.",
      "Suosituin lapa. Toimii syötöissä, laukauksissa ja kiekon nostamisessa. Turvallinen valinta melkein kenelle tahansa.",
    ),
    beginnerFriendly: true,
  },
  P88: {
    id: "P88",
    bendAt: 0.5,
    depth: 0.36,
    location: t("Mid", "Keskellä"),
    face: t("Slightly open", "Hieman avoin"),
    faceKind: "slightlyOpen",
    depthLabel: t("Mild", "Loiva"),
    lie: "5–6",
    sameAs: "Bauer P88, CCM P88, Warrior W88, True T88, Sherwood PP88",
    otherNames: "Warrior W88, True T88",
    summary: t(
      "A mild, forgiving curve. Passes and backhands stay accurate, so it is the easiest to learn with.",
      "Loiva ja anteeksiantava lapa. Syötöt ja rystyt pysyvät tarkkoina, joten sillä on helpoin oppia.",
    ),
    beginnerFriendly: true,
  },
  P90TM: {
    id: "P90TM",
    bendAt: 0.68,
    depth: 0.64,
    location: t("Mid-toe", "Keskeltä kärkeen"),
    face: t("Open", "Avoin"),
    faceKind: "open",
    depthLabel: t("Medium", "Keskisyvä"),
    lie: "5–6",
    sameAs: "Bauer P90T, CCM P90TM, Warrior W90TM, True T90T, Sherwood PP90MX",
    otherNames: "Warrior W90TM, True T90T",
    summary: t(
      "In between P92 and P28. Lifts the puck easily and releases it quickly.",
      "P92:n ja P28:n välimuoto. Nostaa kiekon helposti, ja laukaus lähtee nopeasti.",
    ),
    beginnerFriendly: false,
  },
  P28: {
    id: "P28",
    bendAt: 0.8,
    depth: 0.86,
    location: t("Toe", "Kärjessä"),
    face: t("Open", "Avoin"),
    faceKind: "open",
    depthLabel: t("Deep", "Syvä"),
    lie: "5",
    sameAs: "Bauer P28, CCM P28, Warrior W28, True T28, Sherwood PP28",
    otherNames: "Warrior W28, True T28",
    summary: t(
      "A big curve at the tip of the blade. Great for quick shots and tricks with the puck.",
      "Iso kaarre lavan kärjessä. Hyvä nopeisiin laukauksiin ja kiekkotemppuihin.",
    ),
    beginnerFriendly: false,
  },
};

export const CURVE_ORDER: CurveId[] = ["P92", "P88", "P90TM", "P28"];

export type Verdict = "recommended" | "fine" | "notRecommended";

const REASONS = {
  allRound: t(
    "Works for every kind of shot and pass, and every shop has it.",
    "Toimii kaikissa laukauksissa ja syötöissä, ja sitä löytyy joka kaupasta.",
  ),
  mild: t(
    "Mild and forgiving, so passes and backhands stay accurate.",
    "Loiva ja anteeksiantava, joten syötöt ja rystyt pysyvät tarkkoina.",
  ),
  quickShooter: t(
    "Suits a forward who shoots quickly near the goal.",
    "Sopii hyökkääjälle, joka laukoo nopeasti maalin edestä.",
  ),
  deepForLearner: t(
    "The deep curve makes backhands and passes hard while learning. Better after a few seasons.",
    "Syvä kaarre vaikeuttaa rystyjä ja syöttöjä oppimisvaiheessa. Parempi parin kauden jälkeen.",
  ),
  deepForDefense: t(
    "A deep toe curve makes slapshots and long passes from the blue line harder to control.",
    "Syvä kärkikaarre vaikeuttaa lämäreiden ja pitkien syöttöjen hallintaa siniviivalta.",
  ),
  fineOnceSkilled: t(
    "Works for a player who can already lift the puck and likes the feel.",
    "Sopii pelaajalle, joka osaa jo nostaa kiekon ja pitää tuntumasta.",
  ),
};

/**
 * Rates a curve for a player. Without answers (the guide page), rates it for a typical
 * player who wants an all-rounder.
 */
export function rateCurve(id: CurveId, answers?: Answers): { verdict: Verdict; reason: Text } {
  const young = answers ? answers.age === "under7" || answers.age === "7to9" : false;
  const learner = young || answers?.level === "new";
  const defense = answers?.position === "defense";
  const quickForward = Boolean(answers && !learner && !defense && answers.shot === "quick");

  switch (id) {
    case "P92":
      return { verdict: "recommended", reason: REASONS.allRound };
    case "P88":
      return { verdict: "recommended", reason: REASONS.mild };
    case "P90TM":
      if (learner) return { verdict: "notRecommended", reason: REASONS.deepForLearner };
      if (quickForward) return { verdict: "recommended", reason: REASONS.quickShooter };
      return { verdict: "fine", reason: REASONS.fineOnceSkilled };
    case "P28":
      if (learner) return { verdict: "notRecommended", reason: REASONS.deepForLearner };
      if (defense) return { verdict: "notRecommended", reason: REASONS.deepForDefense };
      if (quickForward) return { verdict: "recommended", reason: REASONS.quickShooter };
      return { verdict: "fine", reason: REASONS.fineOnceSkilled };
  }
}

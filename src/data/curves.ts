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
// least two of them share are listed. Curves they disagree on (P14, PM9, P91A) are left out.
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
    sameAs: "Bauer P92, CCM P29, Warrior W03, True TC2 / T92, Sherwood PP92",
    otherNames: "CCM P29, Warrior W03, True TC2",
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
    sameAs: "Bauer P90TM, CCM P90TM, True T90T",
    otherNames: "True T90T",
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
    sameAs: "Bauer P28, CCM P28, Warrior W28, True TC4 / T28, Sherwood PP28",
    otherNames: "Warrior W28, True TC4",
    summary: t(
      "A big curve at the tip of the blade. Great for quick shots and tricks with the puck.",
      "Iso kaarre lavan kärjessä. Hyvä nopeisiin laukauksiin ja kiekkotemppuihin.",
    ),
    beginnerFriendly: false,
  },
  W71: {
    id: "W71",
    bendAt: 0.52,
    depth: 0.78,
    location: t("Mid", "Keskellä"),
    face: t("Open", "Avoin"),
    faceKind: "open",
    depthLabel: t("Deep", "Syvä"),
    lie: "5",
    sameAs: "Warrior W71 (Warrior only)",
    otherNames: "Warrior only",
    summary: t(
      "A deep curve in the middle with an open face. Lifts the puck very easily.",
      "Syvä kaarre keskellä ja avoin lapa. Nostaa kiekon todella helposti.",
    ),
    beginnerFriendly: false,
  },
  P30: {
    id: "P30",
    bendAt: 0.55,
    depth: 0.42,
    location: t("Mid", "Keskellä"),
    face: t("Closed", "Suljettu"),
    faceKind: "closed",
    depthLabel: t("Mild", "Loiva"),
    lie: "5.5–6",
    sameAs: "CCM P30 (mostly CCM)",
    otherNames: "mostly CCM",
    summary: t(
      "A closed face keeps shots low and helps when handling the puck.",
      "Suljettu lapa pitää laukaukset matalina ja auttaa kiekonkäsittelyssä.",
    ),
    beginnerFriendly: false,
  },
  P02: {
    id: "P02",
    bendAt: 0.26,
    depth: 0.34,
    location: t("Heel", "Kannassa"),
    face: t("Slightly open", "Hieman avoin"),
    faceKind: "slightlyOpen",
    depthLabel: t("Mild", "Loiva"),
    lie: "6",
    sameAs: "Bauer P02, Warrior W02",
    otherNames: "Warrior W02",
    summary: t(
      "A mild curve near the heel, for hard, flat slapshots from the blue line.",
      "Loiva kaarre lähellä kantaa koviin, matalina pysyviin lämäreihin siniviivalta.",
    ),
    beginnerFriendly: false,
  },
};

export const CURVE_ORDER: CurveId[] = ["P92", "P88", "P90TM", "P28", "W71", "P30", "P02"];

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
  closedForLearner: t(
    "The closed face makes it harder to lift the puck, and that is already hard for beginners.",
    "Suljettu lapa vaikeuttaa kiekon nostamista, mikä on aloittelijalle valmiiksi vaikeaa.",
  ),
  closedForDefense: t(
    "Keeps shots from the blue line low, where teammates can tip them in.",
    "Pitää laukaukset siniviivalta matalina, jolloin kaverit voivat ohjata niitä.",
  ),
  heelForDefense: t(
    "Made for hard, flat slapshots from the point, but can be hard to find in shops.",
    "Tehty koviin, matalina pysyviin lämäreihin siniviivalta, mutta voi olla vaikea löytää kaupoista.",
  ),
  rare: t(
    "Hard to find in shops, especially in junior sizes, and suits few players.",
    "Vaikea löytää kaupoista, etenkin juniorikokoina, ja sopii harvoille.",
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
    case "W71":
      if (learner) return { verdict: "notRecommended", reason: REASONS.deepForLearner };
      return { verdict: "fine", reason: REASONS.fineOnceSkilled };
    case "P30":
      if (learner) return { verdict: "notRecommended", reason: REASONS.closedForLearner };
      if (defense) return { verdict: "fine", reason: REASONS.closedForDefense };
      return { verdict: "fine", reason: REASONS.fineOnceSkilled };
    case "P02":
      if (defense && !learner) return { verdict: "fine", reason: REASONS.heelForDefense };
      return { verdict: "notRecommended", reason: REASONS.rare };
  }
}

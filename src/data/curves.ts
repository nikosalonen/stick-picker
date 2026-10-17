import type { Text } from "../i18n";
import type { CurveId } from "../logic/recommend";

export type Curve = {
  id: CurveId;
  /** Where along the blade the bend is, 0 = heel, 1 = toe. Used by the drawing. */
  bendAt: number;
  /** How deep the curve is, 0–1. Used by the drawing. */
  depth: number;
  location: Text;
  face: Text;
  faceKind: "open" | "slightlyOpen" | "closed";
  lie: string;
  /** Names for the same curve at every brand. */
  sameAs: string;
  /** Only the names that differ from the id, for short lists. */
  otherNames: string;
  summary: Text;
  beginnerFriendly: boolean;
};

// Sources: CCM, Warrior and True curve charts as published by Ice Warehouse.
export const CURVES: Record<CurveId, Curve> = {
  P92: {
    id: "P92",
    bendAt: 0.55,
    depth: 0.55,
    location: { en: "Mid", fi: "Keskellä" },
    face: { en: "Slightly open", fi: "Hieman avoin" },
    faceKind: "slightlyOpen",
    lie: "6",
    sameAs: "Bauer P92, CCM P29, Warrior W03, True T92",
    otherNames: "CCM P29, Warrior W03, True T92",
    summary: {
      en: "The most popular curve. Works for passing, shooting and lifting the puck. A safe choice for almost anyone.",
      fi: "Suosituin lapa. Toimii syötöissä, laukauksissa ja kiekon nostamisessa. Turvallinen valinta melkein kenelle tahansa.",
    },
    beginnerFriendly: true,
  },
  P88: {
    id: "P88",
    bendAt: 0.5,
    depth: 0.35,
    location: { en: "Mid", fi: "Keskellä" },
    face: { en: "Slightly open", fi: "Hieman avoin" },
    faceKind: "slightlyOpen",
    lie: "6",
    sameAs: "Bauer P88, CCM P88, Warrior W88, True T88",
    otherNames: "Warrior W88, True T88",
    summary: {
      en: "A mild curve. The easiest to learn with: passes and backhand shots stay accurate. Great first stick.",
      fi: "Loiva lapa. Helpoin oppia: syötöt ja rystylaukaukset pysyvät tarkkoina. Hyvä ensimmäinen maila.",
    },
    beginnerFriendly: true,
  },
  P28: {
    id: "P28",
    bendAt: 0.8,
    depth: 0.85,
    location: { en: "Toe", fi: "Kärjessä" },
    face: { en: "Open", fi: "Avoin" },
    faceKind: "open",
    lie: "5",
    sameAs: "Bauer P28, CCM P28, Warrior W28, True T28",
    otherNames: "Warrior W28, True T28",
    summary: {
      en: "A big curve at the tip of the blade. Great for quick shots and tricks with the puck. Harder for passing and backhands, so not for beginners.",
      fi: "Iso kaarre lavan kärjessä. Hyvä nopeisiin laukauksiin ja kiekon kuljettamiseen. Syötöt ja rystyt ovat vaikeampia, joten ei aloittelijalle.",
    },
    beginnerFriendly: false,
  },
  P14: {
    id: "P14",
    bendAt: 0.5,
    depth: 0.5,
    location: { en: "Mid", fi: "Keskellä" },
    face: { en: "Closed", fi: "Suljettu" },
    faceKind: "closed",
    lie: "5.5",
    sameAs: "Bauer P14, CCM P30, Warrior W14",
    otherNames: "CCM P30, Warrior W14",
    summary: {
      en: "A closed blade face keeps shots low and helps when handling the puck. Some defensemen like it.",
      fi: "Suljettu lapa pitää laukaukset matalina ja auttaa kiekonkäsittelyssä. Osa puolustajista pitää siitä.",
    },
    beginnerFriendly: false,
  },
};

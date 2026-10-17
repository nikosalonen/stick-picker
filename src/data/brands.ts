import type { Text } from "../i18n";
import type { KickPoint } from "../logic/recommend";

export type Family = {
  name: string;
  /** Models from the most to the least expensive tier. */
  models: string[];
};

export type Brand = {
  name: string;
  families: Partial<Record<KickPoint, Family>>;
  note?: Text;
};

// 2026–27 season lineups. Source: Twig Hockey Company's stick comparison (October 2026)
// and retailer family guides. Model names change every year or two; families stay.
export const BRANDS: Brand[] = [
  {
    name: "CCM",
    families: {
      low: { name: "Ribcor", models: ["Trigger Unleashed Pro", "Trigger Unleashed", "Trigger 80"] },
      hybrid: { name: "JetSpeed", models: ["FT9 Pro", "FT8", "FT880"] },
      mid: { name: "Tacks", models: ["XF Ghost"] },
    },
  },
  {
    name: "Bauer",
    families: {
      low: { name: "Vapor", models: ["FlyLite", "FlyPro", "Fly40"] },
      mid: { name: "Supreme", models: ["Fuse", "F50 Pro", "F40"] },
    },
    note: {
      en: "Bauer has no all-round family this season. Last season's Nexus sticks were the balanced option and are often on sale.",
      fi: "Bauerilla ei tällä kaudella ole monipuolista mallisarjaa. Viime kauden Nexus-mailat olivat tasapainoinen vaihtoehto, ja niitä saa usein alennuksesta.",
    },
  },
  {
    name: "Warrior",
    families: {
      low: { name: "Covert", models: ["QR7 Pro", "QR7", "QR7 Team"] },
      hybrid: { name: "Alpha", models: ["LX3 Pro", "LX3", "LX3 Team"] },
      mid: { name: "Novium", models: ["3 Pro", "3", "3 SP"] },
    },
  },
  {
    name: "True",
    families: {
      low: { name: "HZRDUS", models: ["Smoke", "7X5", "5X5"] },
      hybrid: { name: "Catalyst", models: ["Nitro", "7x6", "5x6"] },
    },
  },
  {
    name: "Sherwood",
    families: {
      low: { name: "Rekker", models: ["Morph Pro", "Morph 1", "Morph 2"] },
      hybrid: { name: "Code", models: ["Photon Pro", "Photon 1", "Photon 2"] },
    },
  },
];

export const KICK_ORDER: KickPoint[] = ["low", "hybrid", "mid"];

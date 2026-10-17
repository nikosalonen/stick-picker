import type { KickPoint, SizeCategory } from "../logic/recommend";
import type { Brand } from "./stock";

export type Tier = "top" | "mid" | "value";

/** A stick model and the flexes it is sold in, per size. */
export type StickModel = {
  brand: Brand;
  family: string;
  name: string;
  tier: Tier;
  kick: KickPoint;
  flexes: Partial<Record<SizeCategory, number[]>>;
};

// Common flex sets, to keep the table readable.
const BAUER_JR = [30, 40, 50];
const BAUER_JR_NO_30 = [40, 50];
const BAUER_INT = [55, 65];
const BAUER_SR_TOP = [65, 70, 77, 87];
const BAUER_SR = [70, 77, 87];
const CCM_YTH = [20, 30];
const CCM_JR = [40, 50];
const CCM_INT = [55, 65];
const CCM_SR_TOP = [65, 70, 75, 80, 85, 95];
const CCM_SR_VALUE = [75, 85];
const JR = [30, 40, 50];
const JR_NO_30 = [40, 50];
const WARRIOR_INT = [55, 65];
const WARRIOR_SR = [65, 70, 75, 85];
const TRUE_INT = [55, 65];
const HZRDUS_INT = [50, 60];
const TRUE_SR = [70, 75, 85];
const HZRDUS_SR = [65, 75, 85, 95];
const SHERWOOD_SR = [68, 75, 85];

/**
 * Current models (2025–26 and 2026–27), October 2026: Bauer and CCM from their own option
 * lists, Warrior, True and Sherwood from retailer product pages. Last season's models are
 * often still in shops and just as good.
 */
export const MODELS: StickModel[] = [
  // Bauer Vapor: low kick
  { brand: "Bauer", family: "Vapor", name: "FlyLite", tier: "top", kick: "low", flexes: { youth: [20], junior: BAUER_JR, intermediate: BAUER_INT, senior: BAUER_SR_TOP } },
  { brand: "Bauer", family: "Vapor", name: "FlyPro", tier: "mid", kick: "low", flexes: { junior: BAUER_JR_NO_30, intermediate: BAUER_INT, senior: BAUER_SR } },
  { brand: "Bauer", family: "Vapor", name: "Fly40", tier: "value", kick: "low", flexes: { intermediate: BAUER_INT, senior: BAUER_SR } },
  { brand: "Bauer", family: "Vapor", name: "Youth / Junior Grip", tier: "value", kick: "low", flexes: { youth: [10, 20], junior: [30] } },
  // Bauer Supreme: mid kick
  { brand: "Bauer", family: "Supreme", name: "Fuse", tier: "top", kick: "mid", flexes: { youth: [20], junior: BAUER_JR, intermediate: BAUER_INT, senior: BAUER_SR_TOP } },
  { brand: "Bauer", family: "Supreme", name: "F50 Pro", tier: "mid", kick: "mid", flexes: { junior: BAUER_JR_NO_30, intermediate: BAUER_INT, senior: BAUER_SR } },
  { brand: "Bauer", family: "Supreme", name: "F40", tier: "value", kick: "mid", flexes: { intermediate: BAUER_INT, senior: BAUER_SR } },
  { brand: "Bauer", family: "Supreme", name: "Supreme Pro", tier: "mid", kick: "mid", flexes: { intermediate: [65], senior: [95] } },
  { brand: "Bauer", family: "Supreme", name: "Junior Series", tier: "value", kick: "mid", flexes: { youth: [10, 20], junior: BAUER_JR } },
  // CCM JetSpeed: hybrid kick
  { brand: "CCM", family: "JetSpeed", name: "FT9 Pro", tier: "top", kick: "hybrid", flexes: { youth: CCM_YTH, junior: CCM_JR, intermediate: CCM_INT, senior: CCM_SR_TOP } },
  { brand: "CCM", family: "JetSpeed", name: "FT8", tier: "mid", kick: "hybrid", flexes: { junior: CCM_JR, intermediate: CCM_INT, senior: [70, 75, 85] } },
  { brand: "CCM", family: "JetSpeed", name: "FT880", tier: "value", kick: "hybrid", flexes: { junior: CCM_JR, intermediate: CCM_INT, senior: CCM_SR_VALUE } },
  { brand: "CCM", family: "JetSpeed", name: "FT Youth", tier: "value", kick: "hybrid", flexes: { youth: [10, 20, 30, 40] } },
  // CCM Ribcor: low kick
  { brand: "CCM", family: "Ribcor", name: "Trigger Unleashed Pro", tier: "top", kick: "low", flexes: { youth: CCM_YTH, junior: CCM_JR, intermediate: CCM_INT, senior: CCM_SR_TOP } },
  { brand: "CCM", family: "Ribcor", name: "Trigger Unleashed", tier: "mid", kick: "low", flexes: { junior: CCM_JR, intermediate: CCM_INT, senior: [70, 75, 80, 85] } },
  { brand: "CCM", family: "Ribcor", name: "TR 80", tier: "value", kick: "low", flexes: { junior: CCM_JR, intermediate: CCM_INT, senior: CCM_SR_VALUE } },
  // CCM Tacks: mid kick
  { brand: "CCM", family: "Tacks", name: "XF Ghost", tier: "top", kick: "mid", flexes: { youth: CCM_YTH, junior: CCM_JR, intermediate: CCM_INT, senior: CCM_SR_TOP } },
  // Warrior Covert: low kick
  { brand: "Warrior", family: "Covert", name: "QR7 Pro", tier: "top", kick: "low", flexes: { youth: [20], junior: JR, intermediate: WARRIOR_INT, senior: WARRIOR_SR } },
  { brand: "Warrior", family: "Covert", name: "QR7", tier: "mid", kick: "low", flexes: { intermediate: WARRIOR_INT, senior: WARRIOR_SR } },
  { brand: "Warrior", family: "Covert", name: "QR7 Rev", tier: "value", kick: "low", flexes: { junior: JR, intermediate: WARRIOR_INT, senior: [75, 85] } },
  { brand: "Warrior", family: "Covert", name: "QR7 Team", tier: "value", kick: "low", flexes: { senior: [70, 75, 85, 95] } },
  // Warrior Alpha: hybrid kick
  { brand: "Warrior", family: "Alpha", name: "LX3 Pro", tier: "top", kick: "hybrid", flexes: { youth: [20], junior: JR, intermediate: WARRIOR_INT, senior: [70, 75, 85] } },
  { brand: "Warrior", family: "Alpha", name: "LX3", tier: "mid", kick: "hybrid", flexes: { junior: JR_NO_30, intermediate: WARRIOR_INT, senior: WARRIOR_SR } },
  { brand: "Warrior", family: "Alpha", name: "LX3 Comp", tier: "value", kick: "hybrid", flexes: { junior: JR_NO_30, intermediate: WARRIOR_INT, senior: [75, 85] } },
  // Warrior Novium: mid kick
  { brand: "Warrior", family: "Novium", name: "Novium 3 Pro", tier: "top", kick: "mid", flexes: { youth: [20], junior: JR, intermediate: WARRIOR_INT, senior: WARRIOR_SR } },
  { brand: "Warrior", family: "Novium", name: "Novium 3", tier: "mid", kick: "mid", flexes: { intermediate: WARRIOR_INT, senior: WARRIOR_SR } },
  { brand: "Warrior", family: "Novium", name: "Novium 3 SP", tier: "value", kick: "mid", flexes: { youth: [20], junior: JR, intermediate: WARRIOR_INT, senior: [75, 85] } },
  // Warrior's entry youth stick
  { brand: "Warrior", family: "Rise", name: "Rise", tier: "value", kick: "hybrid", flexes: { youth: [10, 20] } },
  // True Catalyst: hybrid (adaptive) kick
  { brand: "True", family: "Catalyst", name: "Catalyst Nitro", tier: "top", kick: "hybrid", flexes: { youth: [15], junior: [20, 30, 40, 50], intermediate: [45, 55, 65], senior: TRUE_SR } },
  { brand: "True", family: "Catalyst", name: "Catalyst 7X6", tier: "mid", kick: "hybrid", flexes: { intermediate: TRUE_INT, senior: TRUE_SR } },
  { brand: "True", family: "Catalyst", name: "Catalyst 5X6", tier: "value", kick: "hybrid", flexes: { youth: [15], junior: JR, intermediate: TRUE_INT, senior: TRUE_SR } },
  // True HZRDUS: low kick
  { brand: "True", family: "HZRDUS", name: "HZRDUS Smoke", tier: "top", kick: "low", flexes: { youth: [15], junior: JR, intermediate: HZRDUS_INT, senior: HZRDUS_SR } },
  { brand: "True", family: "HZRDUS", name: "HZRDUS 7X5", tier: "mid", kick: "low", flexes: { intermediate: HZRDUS_INT, senior: HZRDUS_SR } },
  { brand: "True", family: "HZRDUS", name: "HZRDUS 5X5", tier: "value", kick: "low", flexes: { senior: HZRDUS_SR } },
  { brand: "True", family: "HZRDUS", name: "HZRDUS 3X5", tier: "value", kick: "low", flexes: { junior: JR } },
  // Sherwood Rekker: low kick
  { brand: "Sherwood", family: "Rekker", name: "Morph Pro", tier: "top", kick: "low", flexes: { youth: [10, 20], junior: JR, intermediate: [55, 65], senior: SHERWOOD_SR } },
  { brand: "Sherwood", family: "Rekker", name: "Morph 1", tier: "mid", kick: "low", flexes: { junior: JR_NO_30, intermediate: [55, 65], senior: SHERWOOD_SR } },
  { brand: "Sherwood", family: "Rekker", name: "Morph 3", tier: "value", kick: "low", flexes: { intermediate: [55], senior: [75, 85] } },
  // Sherwood Code: hybrid kick
  { brand: "Sherwood", family: "Code", name: "Photon Pro", tier: "top", kick: "hybrid", flexes: { youth: [10, 20], junior: JR, intermediate: [45, 55, 65], senior: SHERWOOD_SR } },
  { brand: "Sherwood", family: "Code", name: "Photon 1", tier: "mid", kick: "hybrid", flexes: { junior: JR_NO_30, intermediate: [45, 55, 65], senior: SHERWOOD_SR } },
  { brand: "Sherwood", family: "Code", name: "Photon 3", tier: "value", kick: "hybrid", flexes: { intermediate: [55], senior: [75, 85] } },
  // Sherwood's entry kids' stick
  { brand: "Sherwood", family: "Playrite", name: "Playrite", tier: "value", kick: "hybrid", flexes: { youth: [10, 20], junior: [30, 40] } },
];

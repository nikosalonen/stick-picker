import type { CurveId, SizeCategory } from "../logic/recommend";
import { MODELS } from "./models";

export type Brand = "Bauer" | "CCM" | "Warrior" | "True" | "Sherwood";

/** A stick you can buy: brands sell flex and uncut length as a pair, not separately. */
export type StockStick = { brand: Brand; size: SizeCategory; flex: number; lengthIn: number };

const sticks = (brand: Brand, size: SizeCategory, pairs: [flex: number, lengthIn: number][]): StockStick[] =>
  pairs.map(([flex, lengthIn]) => ({ brand, size, flex, lengthIn }));

/**
 * Flex and length pairs sold as stock sticks, 2025–26 and 2026–27 models, October 2026.
 * Bauer and CCM: read from bauer.com and ccmhockey.com option lists, checked against Hockey
 * Monkey, Source For Sports, Pro Hockey Life and XXL.fi. Warrior, True and Sherwood: read from
 * Hockey Monkey, Ice Warehouse, Source For Sports and Pro Hockey Life product pages. Shops
 * measure length slightly differently (up to 2"), so the most common value is used.
 * Tyke sticks are listed as youth. Special "long" senior sticks (63–64") are left out.
 */
export const STOCK_STICKS: StockStick[] = [
  ...sticks("Bauer", "youth", [
    [10, 42],
    [20, 46],
  ]),
  ...sticks("Bauer", "junior", [
    [30, 50],
    [40, 52],
    [50, 54],
  ]),
  ...sticks("Bauer", "intermediate", [
    [55, 57],
    [55, 58],
    [65, 57],
    [65, 58],
  ]),
  ...sticks("Bauer", "senior", [
    [65, 60],
    [70, 60],
    [77, 60],
    [77, 62],
    [87, 60],
    [87, 62],
    [95, 62],
  ]),
  ...sticks("CCM", "youth", [
    [10, 42],
    [20, 45],
    [30, 48],
    [40, 51],
  ]),
  ...sticks("CCM", "junior", [
    [40, 51],
    [50, 54],
  ]),
  ...sticks("CCM", "intermediate", [
    [55, 55],
    [65, 57],
  ]),
  ...sticks("CCM", "senior", [
    [65, 60],
    [70, 60],
    [75, 60],
    [80, 60],
    [85, 60],
    [95, 62],
  ]),
  ...sticks("Warrior", "youth", [
    [10, 42],
    [20, 46],
  ]),
  ...sticks("Warrior", "junior", [
    [30, 50],
    [40, 52],
    [50, 54],
  ]),
  ...sticks("Warrior", "intermediate", [
    [55, 57],
    [65, 58],
  ]),
  ...sticks("Warrior", "senior", [
    [65, 62],
    [70, 60],
    [70, 62],
    [75, 60],
    [75, 62],
    [85, 60],
    [85, 62],
    [95, 62],
  ]),
  ...sticks("True", "youth", [[15, 45]]),
  ...sticks("True", "junior", [
    [20, 47],
    [30, 50],
    [40, 52],
    [50, 54],
  ]),
  ...sticks("True", "intermediate", [
    [45, 56],
    [50, 56],
    [55, 58],
    [60, 57],
    [65, 58],
  ]),
  ...sticks("True", "senior", [
    [65, 60],
    [70, 60],
    [75, 60],
    [85, 62],
    [95, 62],
  ]),
  ...sticks("Sherwood", "youth", [
    [10, 44],
    [20, 46],
  ]),
  ...sticks("Sherwood", "junior", [
    [30, 50],
    [40, 52],
    [50, 54],
  ]),
  ...sticks("Sherwood", "intermediate", [
    [45, 56],
    [55, 57],
    [65, 58],
  ]),
  ...sticks("Sherwood", "senior", [
    [68, 60],
    [75, 60],
    [85, 60],
  ]),
];

/**
 * Sizes each curve is made in, by at least one big brand. Youth sticks come only in P92 and
 * P28 (and their twins: CCM P29, Warrior W03/W28, True T92, Sherwood PP92/PP28).
 */
export const CURVE_SIZES: Record<CurveId, SizeCategory[]> = {
  P92: ["youth", "junior", "intermediate", "senior"],
  P28: ["youth", "junior", "intermediate", "senior"],
  P88: ["junior", "intermediate", "senior"],
  P90TM: ["junior", "intermediate", "senior"],
};

/** True when the family has at least one model made in the size. */
export function familyMadeIn(brand: string, family: string, size: SizeCategory): boolean {
  return MODELS.some((model) => model.brand === brand && model.family === family && (model.flexes[size]?.length ?? 0) > 0);
}

import type { PickerPayoutBracket } from "./types";

export type InventoryStatus =
  | "in_stock"
  | "low_stock"
  | "out_of_stock"
  | "urgent_reorder";

export interface SafetyStockInput {
  averageDailySales: number;
  averageLeadTimeDays: number;
  maxDailySales: number;
  maxLeadTimeDays: number;
}

export interface ReorderPointInput {
  averageDailySales: number;
  leadTimeDays: number;
  safetyStock?: number;
}

export interface InventoryProfile extends ReorderPointInput {
  onHand: number;
  incoming?: number;
  safetyStock?: number;
}

export interface InventoryAssessment extends InventoryProfile {
  daysOfCover?: number | null;
  status: InventoryStatus;
  reorderPoint: number;
  safetyStock: number;
  recommendedOrderQuantity: number;
  pieceCount: number | null;
  isBundle: boolean;
}

export interface PickerPayoutOptions {
  brackets?: PickerPayoutBracket[];
  rushBonus?: number;
  rushThreshold?: number;
}

const DEFAULT_PICKER_BRACKETS: PickerPayoutBracket[] = [
  { min: 1, max: 4, rate: 2 },
  { min: 5, max: 10, rate: 4 },
  { min: 11, max: Infinity, rate: 7 },
];

function roundToTwo(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateSafetyStock({
  averageDailySales,
  averageLeadTimeDays,
  maxDailySales,
  maxLeadTimeDays,
}: SafetyStockInput): number {
  if (
    averageDailySales <= 0 ||
    averageLeadTimeDays < 0 ||
    maxDailySales <= 0 ||
    maxLeadTimeDays <= 0
  ) {
    return 0;
  }

  const safety =
    maxDailySales * maxLeadTimeDays - averageDailySales * averageLeadTimeDays;

  return Math.max(0, Math.floor(safety));
}

export function calculateReorderPoint({
  averageDailySales,
  leadTimeDays,
  safetyStock = 0,
}: ReorderPointInput): number {
  if (averageDailySales <= 0 || leadTimeDays <= 0) {
    return Math.max(0, Math.floor(safetyStock));
  }

  const demandDuringLead = averageDailySales * leadTimeDays;
  return Math.max(0, Math.floor(demandDuringLead + safetyStock));
}

export function evaluateInventoryStatus(
  onHand: number,
  reorderPoint: number,
  safetyStock: number,
): InventoryStatus {
  if (onHand <= 0) {
    return "out_of_stock";
  }

  if (onHand <= safetyStock) {
    return "urgent_reorder";
  }

  if (onHand <= reorderPoint) {
    return "low_stock";
  }

  return "in_stock";
}

export function calculateDaysOfCover(
  onHand: number,
  averageDailySales: number,
): number | null {
  if (averageDailySales <= 0) return null;
  return roundToTwo(onHand / averageDailySales);
}

export function parsePieceCount(tags: string[] = []): number | null {
  const packTag = tags.find((tag) => tag.toUpperCase().startsWith("PACK:"));
  if (!packTag) return null;

  const [, rawCount] = packTag.split(":");
  const count = Number(rawCount);
  if (!Number.isFinite(count) || count <= 0) {
    return null;
  }

  return Math.floor(count);
}

export function isBundle(tags: string[] = []): boolean {
  return tags.some((tag) => tag.toUpperCase() === "BUNDLE:TRUE");
}

export function calculatePickerPayout(
  pieces: number,
  options: PickerPayoutOptions = {},
): number {
  if (!Number.isFinite(pieces) || pieces <= 0) return 0;

  const brackets = options.brackets ?? DEFAULT_PICKER_BRACKETS;
  const rushThreshold = options.rushThreshold ?? 35;
  const rushBonus = options.rushBonus ?? 0;

  const bracket = brackets.find(
    ({ min, max }) => pieces >= min && pieces <= max,
  );

  if (!bracket) return 0;

  const base = bracket.rate;
  const bonus = pieces >= rushThreshold ? rushBonus : 0;

  return roundToTwo(base + bonus);
}

export function recommendOrderQuantity({
  onHand,
  incoming = 0,
  reorderPoint,
  safetyStock,
}: {
  onHand: number;
  incoming?: number;
  reorderPoint: number;
  safetyStock: number;
}): number {
  const projected = onHand + incoming;
  const target = reorderPoint + safetyStock;
  return Math.max(0, Math.floor(target - projected));
}

export function assessInventory({
  averageDailySales,
  leadTimeDays,
  safetyStock: providedSafety,
  maxDailySales,
  maxLeadTimeDays,
  averageLeadTimeDays,
  onHand,
  incoming = 0,
  tags = [],
}: {
  averageDailySales: number;
  leadTimeDays: number;
  safetyStock?: number;
  maxDailySales?: number;
  maxLeadTimeDays?: number;
  averageLeadTimeDays?: number;
  onHand: number;
  incoming?: number;
  tags?: string[];
}): InventoryAssessment {
  const safetyStock =
    providedSafety ??
    (maxDailySales && maxLeadTimeDays && averageLeadTimeDays
      ? calculateSafetyStock({
          averageDailySales,
          averageLeadTimeDays,
          maxDailySales,
          maxLeadTimeDays,
        })
      : 0);

  const reorderPoint = calculateReorderPoint({
    averageDailySales,
    leadTimeDays,
    safetyStock,
  });

  const status = evaluateInventoryStatus(onHand, reorderPoint, safetyStock);
  const recommendedOrderQuantity = recommendOrderQuantity({
    onHand,
    incoming,
    reorderPoint,
    safetyStock,
  });

  const daysOfCover = calculateDaysOfCover(onHand, averageDailySales);
  const pieceCount = parsePieceCount(tags);
  const bundle = isBundle(tags);

  return {
    onHand,
    incoming,
    averageDailySales,
    leadTimeDays,
    safetyStock,
    reorderPoint,
    status,
    recommendedOrderQuantity,
    daysOfCover,
    pieceCount,
    isBundle: bundle,
  };
}

export type { PickerPayoutBracket } from "./types";

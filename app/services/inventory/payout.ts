/**
 * Picker Payout Calculation Service
 *
 * Calculates payout amounts for warehouse pickers based on piece count,
 * with support for bundles (BUNDLE:TRUE) and pack quantities (PACK:X).
 */

export interface PickerPayoutBracket {
  min: number;
  max: number;
  rate: number;
}

export interface PickerPayoutOptions {
  brackets?: PickerPayoutBracket[];
  rushBonus?: number;
  rushThreshold?: number;
}

/**
 * Default payout brackets based on Hot Rod AN picker compensation model
 * - 1-4 pieces: $2.00
 * - 5-10 pieces: $4.00
 * - 11+ pieces: $7.00
 */
export const DEFAULT_PICKER_BRACKETS: PickerPayoutBracket[] = [
  { min: 1, max: 4, rate: 2.0 },
  { min: 5, max: 10, rate: 4.0 },
  { min: 11, max: Infinity, rate: 7.0 },
];

/**
 * Calculate picker payout based on piece count
 *
 * @param pieces - Total number of pieces in the order
 * @param options - Optional payout configuration (brackets, rush bonus)
 * @returns Payout amount in dollars (rounded to 2 decimals)
 *
 * @example
 * ```typescript
 * // Small order (3 pieces)
 * const payout1 = calculatePickerPayout(3);
 * // Returns: 2.00
 *
 * // Medium order (8 pieces)
 * const payout2 = calculatePickerPayout(8);
 * // Returns: 4.00
 *
 * // Large order (15 pieces)
 * const payout3 = calculatePickerPayout(15);
 * // Returns: 7.00
 *
 * // Rush order (40 pieces with rush bonus)
 * const payout4 = calculatePickerPayout(40, {
 *   rushBonus: 2.50,
 *   rushThreshold: 35
 * });
 * // Returns: 9.50 (7.00 + 2.50)
 * ```
 */
export function calculatePickerPayout(
  pieces: number,
  options: PickerPayoutOptions = {},
): number {
  // Input validation
  if (!Number.isFinite(pieces) || pieces <= 0) {
    return 0;
  }

  const brackets = options.brackets ?? DEFAULT_PICKER_BRACKETS;
  const rushThreshold = options.rushThreshold ?? 35;
  const rushBonus = options.rushBonus ?? 0;

  // Find matching bracket
  const bracket = brackets.find(
    ({ min, max }) => pieces >= min && pieces <= max,
  );

  if (!bracket) {
    return 0;
  }

  // Calculate base payout
  const basePayout = bracket.rate;

  // Add rush bonus if applicable
  const bonus = pieces >= rushThreshold ? rushBonus : 0;

  return roundToTwo(basePayout + bonus);
}

/**
 * Parse piece count from Shopify product tags
 *
 * Looks for PACK:X tag (e.g., "PACK:6" means 6 pieces per unit)
 *
 * @param tags - Array of Shopify product tags
 * @returns Piece count or null if no PACK tag found
 *
 * @example
 * ```typescript
 * parsePieceCount(["BUNDLE:TRUE", "PACK:12"]);
 * // Returns: 12
 *
 * parsePieceCount(["seasonal", "hot-sauce"]);
 * // Returns: null
 * ```
 */
export function parsePieceCount(tags: string[] = []): number | null {
  const packTag = tags.find((tag) => tag.toUpperCase().startsWith("PACK:"));

  if (!packTag) {
    return null;
  }

  const [, rawCount] = packTag.split(":");
  const count = Number(rawCount);

  if (!Number.isFinite(count) || count <= 0) {
    return null;
  }

  return Math.floor(count);
}

/**
 * Check if product is a bundle (contains multiple SKUs)
 *
 * @param tags - Array of Shopify product tags
 * @returns True if BUNDLE:TRUE tag present
 *
 * @example
 * ```typescript
 * isBundle(["BUNDLE:TRUE", "3-pack"]);
 * // Returns: true
 *
 * isBundle(["hot-sauce", "seasonal"]);
 * // Returns: false
 * ```
 */
export function isBundle(tags: string[] = []): boolean {
  return tags.some((tag) => tag.toUpperCase() === "BUNDLE:TRUE");
}

/**
 * Calculate total pieces for an order line item
 *
 * Handles bundles and pack quantities automatically
 *
 * @param quantity - Number of units ordered
 * @param tags - Product tags (for PACK:X and BUNDLE:TRUE)
 * @returns Total piece count for payout calculation
 *
 * @example
 * ```typescript
 * // Single jar, no pack tag
 * calculateTotalPieces(5, []);
 * // Returns: 5
 *
 * // 3 units of 6-pack
 * calculateTotalPieces(3, ["PACK:6"]);
 * // Returns: 18
 *
 * // 2 units of bundle
 * calculateTotalPieces(2, ["BUNDLE:TRUE", "PACK:3"]);
 * // Returns: 6
 * ```
 */
export function calculateTotalPieces(
  quantity: number,
  tags: string[] = [],
): number {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return 0;
  }

  const pieceCount = parsePieceCount(tags);

  // If no PACK tag, each unit = 1 piece
  const piecesPerUnit = pieceCount ?? 1;

  return Math.floor(quantity * piecesPerUnit);
}

/**
 * Calculate payout for complete order (all line items)
 *
 * @param lineItems - Array of order line items with quantity and tags
 * @param options - Optional payout configuration
 * @returns Total payout amount in dollars
 *
 * @example
 * ```typescript
 * const payout = calculateOrderPayout([
 *   { quantity: 2, tags: ["PACK:6"] },
 *   { quantity: 1, tags: [] },
 *   { quantity: 3, tags: ["BUNDLE:TRUE", "PACK:2"] }
 * ]);
 * // 2*6 + 1*1 + 3*2 = 12 + 1 + 6 = 19 pieces → $7.00
 * ```
 */
export function calculateOrderPayout(
  lineItems: Array<{ quantity: number; tags?: string[] }>,
  options: PickerPayoutOptions = {},
): number {
  const totalPieces = lineItems.reduce((sum, item) => {
    return sum + calculateTotalPieces(item.quantity, item.tags);
  }, 0);

  return calculatePickerPayout(totalPieces, options);
}

/**
 * Round number to 2 decimal places (for currency)
 */
function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

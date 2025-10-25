/**
 * Picker Payout Calculation Service
 *
 * Calculates picker compensation based on piece counts from orders.
 *
 * Payout Brackets:
 * - 1-4 pieces: $2.00
 * - 5-10 pieces: $4.00
 * - 11+ pieces: $7.00
 *
 * Piece counts are derived from:
 * - PACK:X tags on products (e.g., PACK:6 = 6 pieces per item)
 * - Default: 1 piece per item if no PACK tag
 */
export interface PayoutItem {
    productId: string;
    quantity: number;
    packSize?: number;
    tags?: string[];
}
export interface PayoutResult {
    totalPieces: number;
    payoutAmount: number;
    bracket: "1-4" | "5-10" | "11+";
    items: Array<{
        productId: string;
        quantity: number;
        packSize: number;
        pieces: number;
    }>;
}
/**
 * Extract pack size from product tags
 * Looks for PACK:X tag (e.g., PACK:6, PACK:12)
 *
 * @param tags - Product tags array
 * @returns Pack size or 1 if no PACK tag found
 */
export declare function extractPackSize(tags?: string[]): number;
/**
 * Determine payout amount based on total pieces
 *
 * @param totalPieces - Total number of pieces to pick
 * @returns Payout amount in dollars
 */
export declare function calculatePayoutAmount(totalPieces: number): number;
/**
 * Determine payout bracket based on total pieces
 *
 * @param totalPieces - Total number of pieces
 * @returns Payout bracket
 */
export declare function getPayoutBracket(totalPieces: number): "1-4" | "5-10" | "11+";
/**
 * Calculate picker payout for an order
 *
 * @param items - Order items with product tags and quantities
 * @returns Payout calculation result
 */
export declare function calculatePickerPayout(items: PayoutItem[]): PayoutResult;
/**
 * Calculate payouts for multiple orders
 *
 * @param orders - Array of orders with items
 * @returns Array of payout results
 */
export declare function calculateMultipleOrderPayouts(orders: Array<{
    orderId: string;
    items: PayoutItem[];
}>): Array<{
    orderId: string;
    payout: PayoutResult;
}>;
/**
 * Calculate aggregate payout for a picker across multiple orders
 *
 * @param orders - Array of orders with items
 * @returns Aggregate payout result
 */
export declare function calculateAggregatePickerPayout(orders: Array<{
    orderId: string;
    items: PayoutItem[];
}>): {
    totalOrders: number;
    totalPayout: number;
    orders: Array<{
        orderId: string;
        payout: PayoutResult;
    }>;
};
//# sourceMappingURL=payout.d.ts.map
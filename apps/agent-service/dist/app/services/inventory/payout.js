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
/**
 * Extract pack size from product tags
 * Looks for PACK:X tag (e.g., PACK:6, PACK:12)
 *
 * @param tags - Product tags array
 * @returns Pack size or 1 if no PACK tag found
 */
export function extractPackSize(tags) {
    if (!tags || tags.length === 0) {
        return 1;
    }
    const packTag = tags.find((tag) => tag.toUpperCase().startsWith("PACK:"));
    if (!packTag) {
        return 1;
    }
    const match = packTag.match(/PACK:(\d+)/i);
    if (!match || !match[1]) {
        return 1;
    }
    const packSize = parseInt(match[1], 10);
    return packSize > 0 ? packSize : 1;
}
/**
 * Determine payout amount based on total pieces
 *
 * @param totalPieces - Total number of pieces to pick
 * @returns Payout amount in dollars
 */
export function calculatePayoutAmount(totalPieces) {
    if (totalPieces <= 0) {
        return 0;
    }
    if (totalPieces <= 4) {
        return 2.0;
    }
    if (totalPieces <= 10) {
        return 4.0;
    }
    return 7.0;
}
/**
 * Determine payout bracket based on total pieces
 *
 * @param totalPieces - Total number of pieces
 * @returns Payout bracket
 */
export function getPayoutBracket(totalPieces) {
    if (totalPieces <= 4) {
        return "1-4";
    }
    if (totalPieces <= 10) {
        return "5-10";
    }
    return "11+";
}
/**
 * Calculate picker payout for an order
 *
 * @param items - Order items with product tags and quantities
 * @returns Payout calculation result
 */
export function calculatePickerPayout(items) {
    if (!items || items.length === 0) {
        return {
            totalPieces: 0,
            payoutAmount: 0,
            bracket: "1-4",
            items: [],
        };
    }
    // Calculate pieces for each item
    const processedItems = items.map((item) => {
        const packSize = item.packSize !== undefined ? item.packSize : extractPackSize(item.tags);
        const pieces = item.quantity * packSize;
        return {
            productId: item.productId,
            quantity: item.quantity,
            packSize,
            pieces,
        };
    });
    // Calculate total pieces
    const totalPieces = processedItems.reduce((sum, item) => sum + item.pieces, 0);
    // Determine payout
    const payoutAmount = calculatePayoutAmount(totalPieces);
    const bracket = getPayoutBracket(totalPieces);
    return {
        totalPieces,
        payoutAmount,
        bracket,
        items: processedItems,
    };
}
/**
 * Calculate payouts for multiple orders
 *
 * @param orders - Array of orders with items
 * @returns Array of payout results
 */
export function calculateMultipleOrderPayouts(orders) {
    return orders.map((order) => ({
        orderId: order.orderId,
        payout: calculatePickerPayout(order.items),
    }));
}
/**
 * Calculate aggregate payout for a picker across multiple orders
 *
 * @param orders - Array of orders with items
 * @returns Aggregate payout result
 */
export function calculateAggregatePickerPayout(orders) {
    const orderPayouts = calculateMultipleOrderPayouts(orders);
    const totalPayout = orderPayouts.reduce((sum, order) => sum + order.payout.payoutAmount, 0);
    return {
        totalOrders: orderPayouts.length,
        totalPayout,
        orders: orderPayouts,
    };
}
//# sourceMappingURL=payout.js.map
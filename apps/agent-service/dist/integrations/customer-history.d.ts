/**
 * Customer History Integration
 *
 * Fetches and aggregates customer history from Shopify and other sources.
 * Provides context about customer's past orders, interactions, and preferences.
 */
export interface CustomerHistory {
    email: string;
    name?: string;
    totalOrders: number;
    totalSpent: string;
    currency: string;
    orders: OrderSummary[];
    lastOrderDate?: Date;
    lifetimeValue: number;
    tags: string[];
    acceptsMarketing: boolean;
}
export interface OrderSummary {
    id: string;
    name: string;
    date: Date;
    total: string;
    currency: string;
    status: string;
    fulfillmentStatus: string;
    items: string[];
    trackingNumber?: string;
}
/**
 * Fetch customer history from Shopify
 */
export declare function fetchCustomerHistory(email: string): Promise<CustomerHistory | null>;
/**
 * Get customer segment based on history
 */
export declare function getCustomerSegment(history: CustomerHistory): string;
/**
 * Get customer priority level
 */
export declare function getCustomerPriority(history: CustomerHistory): 'low' | 'medium' | 'high';
/**
 * Generate customer context summary
 */
export declare function generateCustomerSummary(history: CustomerHistory): string;
/**
 * Get recent order for context
 */
export declare function getRecentOrder(history: CustomerHistory): OrderSummary | null;
/**
 * Check if customer has specific product
 */
export declare function hasPurchasedProduct(history: CustomerHistory, productTitle: string): boolean;
//# sourceMappingURL=customer-history.d.ts.map
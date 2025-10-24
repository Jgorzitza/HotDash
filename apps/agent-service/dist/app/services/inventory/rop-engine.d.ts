/**
 * ROP Calculation Engine (INVENTORY-100)
 *
 * Enhanced ROP calculation engine with:
 * - Daily velocity calculation from order history
 * - Lead time demand = velocity × vendor days
 * - Safety stock = Z-score × demand variance
 * - ROP suggestions stored in reorder_suggestions table
 * - Seasonal trends and promotional uplift handling
 * - Vendor + qty + ETA + cost impact recommendations
 *
 * Context7: /microsoft/typescript - advanced type patterns
 * Context7: /websites/reactrouter - API patterns
 */
export interface ROPEngineParams {
    productId: string;
    variantId: string;
    shopDomain: string;
    calculationMethod?: 'standard' | 'seasonal' | 'promotional' | 'emergency';
    promotionalUplift?: number;
    seasonalAdjustment?: number;
    historicalDays?: number;
}
export interface ROPEngineResult {
    suggestionId: string;
    productInfo: {
        productId: string;
        variantId: string;
        productName: string;
        variantTitle: string;
        currentStock: number;
    };
    ropCalculation: {
        reorderPoint: number;
        safetyStock: number;
        leadTimeDemand: number;
        dailyVelocity: number;
        adjustedDailyVelocity: number;
        seasonalityFactor: number;
        confidenceScore: number;
    };
    vendorRecommendation: {
        vendorId: string;
        vendorName: string;
        recommendedQuantity: number;
        estimatedCost: number;
        estimatedEtaDays: number;
        costImpact: number;
    };
    calculationMetadata: {
        calculationDate: string;
        calculationMethod: string;
        promotionalUplift: number;
        seasonalAdjustment: number;
        demandVolatility: number;
        historicalDays: number;
        orderCount: number;
        totalQuantitySold: number;
    };
}
/**
 * Calculate daily velocity from order history
 */
export declare function calculateDailyVelocity(productId: string, variantId: string, historicalDays?: number): Promise<{
    dailyVelocity: number;
    orderCount: number;
    totalQuantitySold: number;
    demandVariance: number;
    confidenceScore: number;
}>;
/**
 * Calculate lead time demand = velocity × vendor days
 */
export declare function calculateLeadTimeDemand(dailyVelocity: number, vendorId: string): Promise<{
    leadTimeDays: number;
    leadTimeDemand: number;
    vendorReliability: number;
}>;
/**
 * Calculate safety stock = Z-score × demand variance
 */
export declare function calculateSafetyStock(dailyVelocity: number, leadTimeDays: number, demandVariance: number, serviceLevel?: number): number;
/**
 * Get vendor recommendation with cost and ETA
 */
export declare function getVendorRecommendation(productId: string, recommendedQuantity: number, preferredVendorId?: string): Promise<{
    vendorId: string;
    vendorName: string;
    estimatedCost: number;
    estimatedEtaDays: number;
    costImpact: number;
}>;
/**
 * Store ROP suggestion in database
 */
export declare function storeROPSuggestion(params: ROPEngineParams, result: ROPEngineResult): Promise<string>;
/**
 * Main ROP calculation engine
 */
export declare function calculateROPEngine(params: ROPEngineParams): Promise<ROPEngineResult>;
/**
 * Batch calculate ROP for multiple products
 */
export declare function batchCalculateROP(productIds: string[], shopDomain: string, calculationMethod?: 'standard' | 'seasonal' | 'promotional' | 'emergency'): Promise<ROPEngineResult[]>;
/**
 * Get ROP suggestions for a product
 */
export declare function getROPSuggestions(productId: string, shopDomain: string, status?: 'pending' | 'approved' | 'rejected' | 'ordered' | 'cancelled'): Promise<ROPEngineResult[]>;
/**
 * Update ROP suggestion status
 */
export declare function updateROPSuggestionStatus(suggestionId: string, status: 'pending' | 'approved' | 'rejected' | 'ordered' | 'cancelled', approvedBy?: string, notes?: string): Promise<boolean>;
//# sourceMappingURL=rop-engine.d.ts.map
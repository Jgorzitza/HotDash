/**
 * Growth Engine Inventory Optimization Service (INVENTORY-104)
 *
 * Advanced inventory optimization for Growth Engine phases 9-12:
 * - Advanced ROP calculations with seasonal adjustments
 * - Emergency sourcing with opportunity-cost logic
 * - Virtual bundle stock management
 * - Vendor reliability scoring
 * - Performance optimizations
 *
 * Context7: /microsoft/typescript - advanced type patterns
 * Context7: /websites/reactrouter - API patterns
 */
export interface GrowthEngineInventoryOptimization {
    advancedROP: {
        productId: string;
        currentROP: number;
        optimizedROP: number;
        seasonalAdjustment: number;
        safetyStockOptimized: number;
        leadTimeOptimized: number;
        confidenceScore: number;
    };
    emergencySourcing: {
        blockedBundles: Array<{
            bundleId: string;
            bundleName: string;
            expectedLostProfit: number;
            blockingComponent: string;
            emergencyOptions: Array<{
                vendorId: string;
                vendorName: string;
                cost: number;
                leadTime: number;
                incrementalCost: number;
                netBenefit: number;
                recommended: boolean;
            }>;
        }>;
    };
    virtualBundleStock: {
        bundleId: string;
        currentVirtualStock: number;
        optimizedVirtualStock: number;
        limitingComponents: Array<{
            componentId: string;
            available: number;
            required: number;
            bottleneck: boolean;
        }>;
        stockOptimization: {
            canIncrease: boolean;
            maxPossibleStock: number;
            requiredComponentOrders: Array<{
                componentId: string;
                orderQuantity: number;
                vendorId: string;
                estimatedCost: number;
            }>;
        };
    };
    vendorPerformance: {
        vendorId: string;
        reliabilityScore: number;
        averageLeadTime: number;
        onTimeDeliveryRate: number;
        qualityScore: number;
        costCompetitiveness: number;
        recommendations: Array<{
            type: 'improve_leadtime' | 'increase_reliability' | 'cost_optimization';
            description: string;
            impact: number;
        }>;
    };
    performanceMetrics: {
        optimizationScore: number;
        costSavings: number;
        stockoutRiskReduction: number;
        inventoryTurnoverImprovement: number;
        lastOptimized: string;
    };
}
/**
 * Calculate advanced ROP with seasonal adjustments and optimization
 */
export declare function calculateAdvancedROP(productId: string, params: {
    avgDailySales: number;
    leadTimeDays: number;
    maxDailySales: number;
    maxLeadDays: number;
    category?: string;
    currentMonth?: number;
    seasonalFactors?: Record<number, number>;
    demandVolatility?: number;
}): Promise<GrowthEngineInventoryOptimization['advancedROP']>;
/**
 * Calculate emergency sourcing recommendations with opportunity-cost logic
 */
export declare function calculateEmergencySourcing(blockedBundles: Array<{
    bundleId: string;
    bundleName: string;
    unitMargin: number;
    dailyVelocity: number;
    blockingComponent: string;
}>): Promise<GrowthEngineInventoryOptimization['emergencySourcing']>;
/**
 * Optimize virtual bundle stock across components
 */
export declare function optimizeVirtualBundleStock(bundleId: string): Promise<GrowthEngineInventoryOptimization['virtualBundleStock']>;
/**
 * Analyze vendor performance and provide optimization recommendations
 */
export declare function analyzeVendorPerformance(vendorId: string): Promise<GrowthEngineInventoryOptimization['vendorPerformance']>;
/**
 * Get comprehensive growth engine inventory optimization
 */
export declare function getGrowthEngineInventoryOptimization(productIds: string[]): Promise<GrowthEngineInventoryOptimization>;
//# sourceMappingURL=growth-engine-optimization.d.ts.map
/**
 * Inventory Analytics Service (INVENTORY-010)
 *
 * Provides comprehensive inventory analytics including:
 * - Turnover rate calculation (annual)
 * - Aging analysis (fresh/aging/stale/dead stock)
 * - ABC analysis (80/15/5 Pareto rule)
 * - Optimization recommendations
 *
 * Context7: /microsoft/typescript - type safety, algorithms
 * Context7: /prisma/docs - aggregations, analytics queries
 */
export type StockAge = "fresh" | "aging" | "stale" | "dead";
export type ABCClass = "A" | "B" | "C";
export interface InventoryTurnoverMetrics {
    productId: string;
    productName: string;
    averageInventory: number;
    costOfGoodsSold: number;
    turnoverRate: number;
    daysInventoryOutstanding: number;
    classification: "fast" | "normal" | "slow" | "very_slow";
}
export interface AgingAnalysis {
    productId: string;
    productName: string;
    currentStock: number;
    lastSaleDate: Date | null;
    daysSinceLastSale: number;
    ageClassification: StockAge;
    estimatedValue: number;
}
export interface ABCAnalysisItem {
    productId: string;
    productName: string;
    annualRevenue: number;
    percentageOfTotalRevenue: number;
    cumulativePercentage: number;
    abcClass: ABCClass;
    recommendedStrategy: string;
}
export interface InventoryAnalyticsSummary {
    turnoverMetrics: {
        overallTurnoverRate: number;
        overallDIO: number;
        fastMoversCount: number;
        slowMoversCount: number;
        products: InventoryTurnoverMetrics[];
    };
    agingAnalysis: {
        freshCount: number;
        agingCount: number;
        staleCount: number;
        deadCount: number;
        totalValue: number;
        deadStockValue: number;
        products: AgingAnalysis[];
    };
    abcAnalysis: {
        classACount: number;
        classBCount: number;
        classCCount: number;
        products: ABCAnalysisItem[];
    };
    generatedAt: string;
}
/**
 * Calculate inventory turnover rate
 *
 * Turnover Rate = Cost of Goods Sold (COGS) / Average Inventory Value
 * DIO (Days Inventory Outstanding) = 365 / Turnover Rate
 *
 * Industry benchmarks:
 * - Fast moving: Turnover > 12 (< 30 days DIO)
 * - Normal: Turnover 6-12 (30-60 days DIO)
 * - Slow: Turnover 3-6 (60-120 days DIO)
 * - Very slow: Turnover < 3 (> 120 days DIO)
 *
 * @param averageInventory - Average inventory value during period
 * @param costOfGoodsSold - COGS for the period (typically annual)
 * @returns Turnover metrics
 */
export declare function calculateTurnoverRate(averageInventory: number, costOfGoodsSold: number): {
    turnoverRate: number;
    daysInventoryOutstanding: number;
    classification: "fast" | "normal" | "slow" | "very_slow";
};
/**
 * Classify stock age based on days since last sale
 *
 * Age Classifications:
 * - Fresh: 0-30 days since last sale
 * - Aging: 31-90 days since last sale
 * - Stale: 91-180 days since last sale
 * - Dead: > 180 days since last sale (or never sold)
 *
 * @param daysSinceLastSale - Days since last sale (null = never sold)
 * @returns Stock age classification
 */
export declare function classifyStockAge(daysSinceLastSale: number | null): StockAge;
/**
 * Perform ABC analysis (Pareto 80/15/5 rule)
 *
 * ABC Analysis classifies inventory by revenue contribution:
 * - Class A: Top ~20% of SKUs contributing ~80% of revenue (high priority)
 * - Class B: Next ~30% of SKUs contributing ~15% of revenue (medium priority)
 * - Class C: Bottom ~50% of SKUs contributing ~5% of revenue (low priority)
 *
 * @param products - Array of products with annual revenue
 * @returns ABC analysis results sorted by revenue (descending)
 */
export declare function performABCAnalysis(products: Array<{
    productId: string;
    productName: string;
    annualRevenue: number;
}>): ABCAnalysisItem[];
/**
 * Generate complete inventory analytics
 *
 * INVENTORY-010: Inventory Analytics Service
 *
 * @param products - Array of products with sales and inventory data
 * @returns Promise resolving to comprehensive analytics summary
 */
export declare function generateInventoryAnalytics(products: Array<{
    productId: string;
    productName: string;
    currentStock: number;
    avgInventory: number;
    costPerUnit: number;
    annualCOGS: number;
    annualRevenue: number;
    lastSaleDate: Date | null;
}>): Promise<InventoryAnalyticsSummary>;
//# sourceMappingURL=analytics.d.ts.map
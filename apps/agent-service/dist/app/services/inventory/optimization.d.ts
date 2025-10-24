/**
 * Inventory Optimization Service (INVENTORY-012)
 *
 * Provides optimization recommendations:
 * - Dead stock identification (0 sales in 90 days)
 * - Overstock detection (>180 days supply)
 * - ABC classification with strategies
 *
 * Context7: /microsoft/typescript - type safety
 * Context7: /prisma/docs - inventory queries
 */
import type { ABCClass } from "./analytics";
export interface DeadStockItem {
    productId: string;
    productName: string;
    currentStock: number;
    daysSinceLastSale: number;
    estimatedValue: number;
    recommendation: string;
}
export interface OverstockItem {
    productId: string;
    productName: string;
    currentStock: number;
    daysOfSupply: number;
    excessUnits: number;
    tiedUpCapital: number;
    recommendation: string;
}
export interface OptimizationRecommendation {
    productId: string;
    productName: string;
    abcClass: ABCClass;
    currentIssue: string;
    recommendedAction: string;
    estimatedImpact: string;
    priority: "high" | "medium" | "low";
}
export interface OptimizationSummary {
    deadStock: {
        count: number;
        totalValue: number;
        items: DeadStockItem[];
    };
    overstock: {
        count: number;
        tiedUpCapital: number;
        items: OverstockItem[];
    };
    recommendations: OptimizationRecommendation[];
    generatedAt: string;
}
export declare function generateOptimizationReport(products: Array<{
    productId: string;
    productName: string;
    currentStock: number;
    avgDailySales: number;
    lastSaleDate: Date | null;
    costPerUnit: number;
    abcClass?: ABCClass;
}>): Promise<OptimizationSummary>;
//# sourceMappingURL=optimization.d.ts.map
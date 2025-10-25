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
export function calculateTurnoverRate(averageInventory, costOfGoodsSold) {
    if (averageInventory === 0) {
        return {
            turnoverRate: 0,
            daysInventoryOutstanding: 0,
            classification: "very_slow",
        };
    }
    const turnoverRate = costOfGoodsSold / averageInventory;
    const daysInventoryOutstanding = 365 / turnoverRate;
    // Classify based on turnover rate
    let classification;
    if (turnoverRate > 12) {
        classification = "fast";
    }
    else if (turnoverRate >= 6) {
        classification = "normal";
    }
    else if (turnoverRate >= 3) {
        classification = "slow";
    }
    else {
        classification = "very_slow";
    }
    return {
        turnoverRate: Math.round(turnoverRate * 100) / 100,
        daysInventoryOutstanding: Math.round(daysInventoryOutstanding),
        classification,
    };
}
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
export function classifyStockAge(daysSinceLastSale) {
    if (daysSinceLastSale === null || daysSinceLastSale > 180) {
        return "dead";
    }
    if (daysSinceLastSale > 90) {
        return "stale";
    }
    if (daysSinceLastSale > 30) {
        return "aging";
    }
    return "fresh";
}
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
export function performABCAnalysis(products) {
    if (products.length === 0) {
        return [];
    }
    // Sort by revenue (descending)
    const sortedProducts = [...products].sort((a, b) => b.annualRevenue - a.annualRevenue);
    // Calculate total revenue
    const totalRevenue = sortedProducts.reduce((sum, p) => sum + p.annualRevenue, 0);
    // Calculate cumulative percentages and classify
    let cumulativeRevenue = 0;
    const results = sortedProducts.map((product) => {
        cumulativeRevenue += product.annualRevenue;
        const percentageOfTotal = (product.annualRevenue / totalRevenue) * 100;
        const cumulativePercentage = (cumulativeRevenue / totalRevenue) * 100;
        // Classify based on cumulative percentage
        let abcClass;
        let recommendedStrategy;
        if (cumulativePercentage <= 80) {
            abcClass = "A";
            recommendedStrategy =
                "High priority: Tight inventory control, frequent reviews, excellent supplier relations";
        }
        else if (cumulativePercentage <= 95) {
            abcClass = "B";
            recommendedStrategy =
                "Medium priority: Standard inventory controls, periodic reviews";
        }
        else {
            abcClass = "C";
            recommendedStrategy =
                "Low priority: Simple controls, minimal safety stock, consider discontinuation";
        }
        return {
            productId: product.productId,
            productName: product.productName,
            annualRevenue: product.annualRevenue,
            percentageOfTotalRevenue: Math.round(percentageOfTotal * 100) / 100,
            cumulativePercentage: Math.round(cumulativePercentage * 100) / 100,
            abcClass,
            recommendedStrategy,
        };
    });
    return results;
}
/**
 * Generate complete inventory analytics
 *
 * INVENTORY-010: Inventory Analytics Service
 *
 * @param products - Array of products with sales and inventory data
 * @returns Promise resolving to comprehensive analytics summary
 */
export async function generateInventoryAnalytics(products) {
    // Turnover Analysis
    const turnoverProducts = products.map((p) => {
        const turnoverMetrics = calculateTurnoverRate(p.avgInventory, p.annualCOGS);
        return {
            productId: p.productId,
            productName: p.productName,
            averageInventory: p.avgInventory,
            costOfGoodsSold: p.annualCOGS,
            turnoverRate: turnoverMetrics.turnoverRate,
            daysInventoryOutstanding: turnoverMetrics.daysInventoryOutstanding,
            classification: turnoverMetrics.classification,
        };
    });
    // Overall turnover metrics
    const totalAvgInventory = products.reduce((sum, p) => sum + p.avgInventory, 0);
    const totalCOGS = products.reduce((sum, p) => sum + p.annualCOGS, 0);
    const overallTurnover = calculateTurnoverRate(totalAvgInventory, totalCOGS);
    const fastMoversCount = turnoverProducts.filter((p) => p.classification === "fast").length;
    const slowMoversCount = turnoverProducts.filter((p) => p.classification === "slow" || p.classification === "very_slow").length;
    // Aging Analysis
    const today = new Date();
    const agingProducts = products.map((p) => {
        const daysSinceLastSale = p.lastSaleDate
            ? Math.floor((today.getTime() - p.lastSaleDate.getTime()) / (1000 * 60 * 60 * 24))
            : null;
        const ageClassification = classifyStockAge(daysSinceLastSale);
        const estimatedValue = p.currentStock * p.costPerUnit;
        return {
            productId: p.productId,
            productName: p.productName,
            currentStock: p.currentStock,
            lastSaleDate: p.lastSaleDate,
            daysSinceLastSale: daysSinceLastSale || 999,
            ageClassification,
            estimatedValue,
        };
    });
    const freshCount = agingProducts.filter((p) => p.ageClassification === "fresh").length;
    const agingCount = agingProducts.filter((p) => p.ageClassification === "aging").length;
    const staleCount = agingProducts.filter((p) => p.ageClassification === "stale").length;
    const deadCount = agingProducts.filter((p) => p.ageClassification === "dead").length;
    const totalValue = agingProducts.reduce((sum, p) => sum + p.estimatedValue, 0);
    const deadStockValue = agingProducts
        .filter((p) => p.ageClassification === "dead")
        .reduce((sum, p) => sum + p.estimatedValue, 0);
    // ABC Analysis
    const abcProducts = performABCAnalysis(products.map((p) => ({
        productId: p.productId,
        productName: p.productName,
        annualRevenue: p.annualRevenue,
    })));
    const classACount = abcProducts.filter((p) => p.abcClass === "A").length;
    const classBCount = abcProducts.filter((p) => p.abcClass === "B").length;
    const classCCount = abcProducts.filter((p) => p.abcClass === "C").length;
    return {
        turnoverMetrics: {
            overallTurnoverRate: overallTurnover.turnoverRate,
            overallDIO: overallTurnover.daysInventoryOutstanding,
            fastMoversCount,
            slowMoversCount,
            products: turnoverProducts,
        },
        agingAnalysis: {
            freshCount,
            agingCount,
            staleCount,
            deadCount,
            totalValue,
            deadStockValue,
            products: agingProducts,
        },
        abcAnalysis: {
            classACount,
            classBCount,
            classCCount,
            products: abcProducts,
        },
        generatedAt: new Date().toISOString(),
    };
}
//# sourceMappingURL=analytics.js.map
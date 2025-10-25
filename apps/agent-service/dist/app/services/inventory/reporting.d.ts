/**
 * Inventory Reporting Service (INVENTORY-013)
 *
 * Generates daily/weekly/monthly inventory reports
 *
 * Context7: /microsoft/typescript - type safety
 * Context7: /prisma/docs - aggregations
 */
export type ReportPeriod = "daily" | "weekly" | "monthly";
export interface InventoryReport {
    period: ReportPeriod;
    startDate: string;
    endDate: string;
    summary: {
        totalSKUs: number;
        totalStockValue: number;
        lowStockCount: number;
        outOfStockCount: number;
        alertsGenerated: number;
    };
    topMovers: Array<{
        productId: string;
        productName: string;
        unitsSold: number;
    }>;
    bottomMovers: Array<{
        productId: string;
        productName: string;
        daysSinceLastSale: number;
    }>;
    generatedAt: string;
}
export declare function generateInventoryReport(period: ReportPeriod): Promise<InventoryReport>;
//# sourceMappingURL=reporting.d.ts.map
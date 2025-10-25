/**
 * Data Validation Service
 *
 * Validates analytics data integrity
 * Detects missing data, outliers, and inconsistencies
 * Calculates data quality score (0-100)
 */
export interface ValidationIssue {
    type: "missing_data" | "outlier" | "inconsistency" | "stale_data";
    severity: "critical" | "warning" | "info";
    metric: string;
    description: string;
    affectedDates: Date[];
    impact: number;
}
export interface DataQualityReport {
    shopDomain: string;
    validatedAt: Date;
    qualityScore: number;
    grade: "A" | "B" | "C" | "D" | "F";
    issues: ValidationIssue[];
    summary: {
        totalRecords: number;
        validRecords: number;
        missingDataDays: number;
        outlierCount: number;
        inconsistencyCount: number;
    };
    recommendations: string[];
}
/**
 * Validate analytics data quality
 */
export declare function validateDataQuality(shopDomain?: string, days?: number): Promise<DataQualityReport>;
//# sourceMappingURL=data-validation.d.ts.map
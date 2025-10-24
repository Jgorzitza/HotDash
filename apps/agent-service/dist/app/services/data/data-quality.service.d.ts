/**
 * Data Quality Service
 *
 * Task: DATA-023
 *
 * Provides comprehensive data quality monitoring and validation:
 * - Data validation rules
 * - Anomaly detection
 * - Freshness checks
 * - Quality metrics calculation
 * - Alert generation
 */
export interface ValidationRule {
    ruleName: string;
    ruleType: 'schema' | 'range' | 'format' | 'reference' | 'business' | 'custom';
    dataSource: string;
    tableName: string;
    columnName?: string;
    ruleDefinition: any;
    validationQuery?: string;
    severity: 'info' | 'warning' | 'critical';
}
export interface QualityMetric {
    metricName: string;
    metricType: 'completeness' | 'accuracy' | 'consistency' | 'timeliness' | 'validity' | 'uniqueness';
    dataSource: string;
    tableName?: string;
    columnName?: string;
    totalRecords: number;
    validRecords: number;
    invalidRecords: number;
    nullRecords: number;
    duplicateRecords: number;
    qualityScore: number;
}
export interface Anomaly {
    anomalyType: 'spike' | 'drop' | 'missing' | 'duplicate' | 'outlier' | 'pattern';
    dataSource: string;
    tableName?: string;
    columnName?: string;
    expectedValue?: number;
    actualValue?: number;
    deviationPct?: number;
    severity: 'info' | 'warning' | 'critical';
    affectedRecords?: number;
}
export declare class DataQualityService {
    /**
     * Run all validation rules
     */
    static runValidationRules(): Promise<{
        totalRules: number;
        passed: number;
        failed: number;
        results: any[];
    }>;
    /**
     * Execute a single validation rule
     */
    private static executeValidationRule;
    /**
     * Calculate quality metrics for a data source
     */
    static calculateQualityMetrics(dataSource: string, tableName?: string): Promise<QualityMetric[]>;
    /**
     * Detect anomalies in data
     */
    static detectAnomalies(dataSource: string, tableName?: string): Promise<Anomaly[]>;
    /**
     * Check data freshness
     */
    static checkFreshness(): Promise<{
        totalChecks: number;
        healthy: number;
        stale: number;
        results: any[];
    }>;
}
//# sourceMappingURL=data-quality.service.d.ts.map
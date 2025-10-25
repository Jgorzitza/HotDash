/**
 * Alert & Anomaly Detection Service
 *
 * Detects unusual patterns using Z-score analysis
 * Alerts on revenue drops, CTR spikes, conversion anomalies
 * Statistical significance threshold: Z-score > 2.5
 * Provides recommendations for detected anomalies
 */
export interface Anomaly {
    type: "spike" | "drop" | "unusual";
    metric: string;
    currentValue: number;
    expectedValue: number;
    zScore: number;
    significance: "critical" | "moderate" | "low";
    detectedAt: Date;
    recommendation: string;
    severity: number;
}
export interface AnomalyAlert {
    alertId: string;
    shopDomain: string;
    anomalies: Anomaly[];
    summary: string;
    actionRequired: boolean;
}
export type AnomalyMetric = "revenue" | "ctr" | "conversions" | "impressions" | "clicks";
/**
 * Detect anomalies in metric using Z-score analysis
 * Z-score threshold: 2.5 (statistically significant)
 */
export declare function detectAnomalies(metric: AnomalyMetric, shopDomain?: string, days?: number): Promise<Anomaly[]>;
/**
 * Detect multiple types of anomalies simultaneously
 */
export declare function detectAllAnomalies(shopDomain?: string, days?: number): Promise<AnomalyAlert>;
//# sourceMappingURL=anomaly-detection.d.ts.map
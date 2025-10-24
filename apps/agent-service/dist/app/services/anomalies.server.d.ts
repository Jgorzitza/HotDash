import { Prisma } from "@prisma/client";
/**
 * Anomaly detection and forecasting utilities for Memory service integration.
 * Implements threshold-based anomaly detection and simple forecasting for KPIs.
 */
export interface AnomalyThreshold {
    warning: number;
    critical: number;
}
export interface AnomalyDetectionConfig {
    factType: string;
    metric: string;
    thresholds: {
        percentChange?: AnomalyThreshold;
        absoluteValue?: AnomalyThreshold;
    };
    windowDays?: number;
}
export interface AnomalyResult {
    isAnomaly: boolean;
    severity: "none" | "warning" | "critical";
    currentValue: number;
    baselineValue?: number;
    delta?: number;
    percentChange?: number;
    threshold: number;
    message: string;
}
export interface ForecastParams {
    method: "simple_average" | "exponential_smoothing";
    windowDays: number;
    alpha?: number;
}
export interface ForecastResult {
    predictedValue: number;
    confidence?: number;
    predictionInterval?: {
        lower: number;
        upper: number;
    };
    assumptions: string[];
}
/**
 * Pre-configured anomaly detection profiles for standard KPIs
 */
export declare const ANOMALY_CONFIGS: Record<string, AnomalyDetectionConfig>;
/**
 * Detect anomaly based on threshold configuration
 */
export declare function detectAnomaly(currentValue: number, config: AnomalyDetectionConfig, baselineValue?: number): AnomalyResult;
/**
 * Calculate baseline from historical facts
 */
export declare function calculateBaseline(shopDomain: string, factType: string, metricPath: string, // e.g., "totalRevenue" or nested "metadata.breachRate"
windowDays?: number): Promise<number | undefined>;
/**
 * Simple forecasting implementation
 */
export declare function forecast(shopDomain: string, factType: string, metricPath: string, params: ForecastParams): Promise<ForecastResult>;
/**
 * Store anomaly detection result as a fact with metadata
 */
export declare function recordAnomalyDetection(shopDomain: string, anomalyType: string, anomalyResult: AnomalyResult, additionalMetadata?: Prisma.InputJsonValue): Promise<any>;
//# sourceMappingURL=anomalies.server.d.ts.map
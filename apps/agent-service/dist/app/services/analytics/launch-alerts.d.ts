/**
 * Launch Metrics Alert Service
 *
 * Task: ANALYTICS-LAUNCH-001
 *
 * Monitors launch metrics and generates alerts for anomalies.
 * Integrates with SSE for real-time alert delivery.
 */
import { type LaunchMetrics } from "~/services/metrics/launch-metrics";
export interface LaunchAlert {
    id: string;
    type: 'user_engagement' | 'feature_adoption' | 'performance' | 'agent_performance' | 'business';
    severity: 'info' | 'warning' | 'critical';
    metric: string;
    message: string;
    currentValue: number;
    threshold: number;
    timestamp: string;
}
export interface AlertThresholds {
    dauMauRatio: {
        warning: number;
        critical: number;
    };
    signupTarget: {
        warning: number;
        critical: number;
    };
    activationRate: {
        warning: number;
        critical: number;
    };
    ttfvMedian: {
        warning: number;
        critical: number;
    };
    npsScore: {
        warning: number;
        critical: number;
    };
    csatAverage: {
        warning: number;
        critical: number;
    };
    sentimentPositive: {
        warning: number;
        critical: number;
    };
    loadTimeP95: {
        warning: number;
        critical: number;
    };
    errorRate: {
        warning: number;
        critical: number;
    };
}
export declare class LaunchAlertsService {
    private thresholds;
    constructor(thresholds?: Partial<AlertThresholds>);
    /**
     * Check metrics and generate alerts
     */
    checkMetrics(metrics: LaunchMetrics): Promise<LaunchAlert[]>;
    private checkUserEngagement;
    private checkFeatureAdoption;
    private checkSatisfaction;
    private logAlerts;
}
export declare const launchAlertsService: LaunchAlertsService;
//# sourceMappingURL=launch-alerts.d.ts.map
/**
 * Production Analytics Monitoring Service
 *
 * ANALYTICS-004: Real-time metric tracking, anomaly detection, and conversion funnel monitoring
 * Integrates with existing anomaly detection, alert management, and performance monitoring
 */
import { type AnomalyAlert } from './anomaly-detection';
import { type Alert } from '~/lib/monitoring/alert-manager';
export interface ProductionMetrics {
    timestamp: string;
    analytics: {
        pageViews: number;
        sessions: number;
        conversions: number;
        revenue: number;
        conversionRate: number;
    };
    performance: {
        avgResponseTime: number;
        errorRate: number;
        uptime: number;
        throughput: number;
    };
    funnel: {
        landingPageViews: number;
        productViews: number;
        addToCarts: number;
        checkouts: number;
        purchases: number;
        dropoffRates: {
            landingToProduct: number;
            productToCart: number;
            cartToCheckout: number;
            checkoutToPurchase: number;
        };
    };
    health: {
        status: 'healthy' | 'degraded' | 'critical';
        issues: string[];
        score: number;
    };
}
export interface MonitoringAlert extends Alert {
    category: 'analytics' | 'performance' | 'funnel' | 'anomaly';
    metric: string;
    threshold: number;
    currentValue: number;
}
export interface AnalyticsHealthReport {
    overall: {
        status: 'healthy' | 'degraded' | 'critical';
        score: number;
        timestamp: string;
    };
    metrics: ProductionMetrics;
    anomalies: AnomalyAlert;
    alerts: MonitoringAlert[];
    recommendations: {
        priority: 'high' | 'medium' | 'low';
        category: string;
        action: string;
        impact: string;
    }[];
}
export declare class ProductionMonitoringService {
    private alertManager;
    private performanceService;
    private monitoringInterval?;
    private metricsHistory;
    constructor();
    /**
     * Start production monitoring
     */
    startMonitoring(intervalMs?: number): Promise<void>;
    /**
     * Stop production monitoring
     */
    stopMonitoring(): void;
    /**
     * Collect production metrics
     */
    private collectProductionMetrics;
    /**
     * Aggregate analytics metrics
     */
    private aggregateAnalyticsMetrics;
    /**
     * Aggregate funnel metrics
     */
    private aggregateFunnelMetrics;
    /**
     * Get performance metrics
     */
    private getPerformanceMetrics;
    /**
     * Calculate health status
     */
    private calculateHealthStatus;
    /**
     * Check health and create alerts
     */
    private checkHealthAndAlerts;
    /**
     * Generate comprehensive health report
     */
    generateHealthReport(): Promise<AnalyticsHealthReport>;
    /**
     * Generate recommendations
     */
    private generateRecommendations;
    /**
     * Get metrics history
     */
    getMetricsHistory(): ProductionMetrics[];
}
/**
 * Default configuration
 */
export declare const defaultMonitoringConfig: {
    monitoringInterval: number;
    metricsRetention: number;
    alertThresholds: {
        errorRate: number;
        responseTime: number;
        conversionRate: number;
        checkoutAbandonmentRate: number;
    };
};
//# sourceMappingURL=production-monitoring.d.ts.map
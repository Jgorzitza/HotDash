/**
 * Advanced DevOps Monitoring Infrastructure
 *
 * Implements advanced monitoring capabilities for DevOps Growth Engine
 * Provides real-time monitoring, alerting, and predictive analytics
 */
import { GrowthEngineSupportFramework } from '../services/growth-engine-support.server';
export interface AdvancedMetrics {
    timestamp: string;
    systemHealth: {
        overall: 'healthy' | 'degraded' | 'critical';
        components: {
            database: 'healthy' | 'degraded' | 'critical';
            api: 'healthy' | 'degraded' | 'critical';
            frontend: 'healthy' | 'degraded' | 'critical';
            infrastructure: 'healthy' | 'degraded' | 'critical';
        };
    };
    performance: {
        responseTime: number;
        throughput: number;
        errorRate: number;
        availability: number;
    };
    business: {
        activeUsers: number;
        revenue: number;
        conversions: number;
        customerSatisfaction: number;
    };
    infrastructure: {
        cpuUsage: number;
        memoryUsage: number;
        diskUsage: number;
        networkLatency: number;
        databaseConnections: number;
    };
}
export interface AlertRule {
    id: string;
    name: string;
    description: string;
    metric: string;
    threshold: number;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    severity: 'low' | 'medium' | 'high' | 'critical';
    enabled: boolean;
    cooldown: number;
    lastTriggered?: string;
}
export interface Alert {
    id: string;
    ruleId: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    metric: string;
    value: number;
    threshold: number;
    timestamp: string;
    status: 'active' | 'acknowledged' | 'resolved';
    acknowledgedBy?: string;
    resolvedAt?: string;
}
export interface PredictiveInsight {
    id: string;
    type: 'capacity' | 'performance' | 'security' | 'cost';
    title: string;
    description: string;
    confidence: number;
    timeframe: string;
    impact: 'low' | 'medium' | 'high' | 'critical';
    recommendations: string[];
    evidence: {
        metrics: string[];
        trends: string[];
        patterns: string[];
    };
}
export declare class AdvancedMonitoringEngine {
    private framework;
    private monitoringInterval?;
    private alertRules;
    private activeAlerts;
    private metricsHistory;
    constructor(framework: GrowthEngineSupportFramework);
    /**
     * Initialize advanced monitoring engine
     */
    initialize(): Promise<void>;
    /**
     * Initialize alert rules
     */
    private initializeAlertRules;
    /**
     * Start advanced monitoring
     */
    startAdvancedMonitoring(): Promise<void>;
    /**
     * Collect advanced metrics
     */
    collectAdvancedMetrics(): Promise<AdvancedMetrics>;
    /**
     * Check alerts against metrics
     */
    checkAlerts(metrics: AdvancedMetrics): Promise<void>;
    /**
     * Get metric value from metrics object
     */
    private getMetricValue;
    /**
     * Evaluate threshold condition
     */
    private evaluateThreshold;
    /**
     * Generate predictive insights
     */
    generatePredictiveInsights(): Promise<PredictiveInsight[]>;
    /**
     * Calculate trend from array of values
     */
    private calculateTrend;
    /**
     * Get current metrics
     */
    getCurrentMetrics(): AdvancedMetrics | null;
    /**
     * Get active alerts
     */
    getActiveAlerts(): Alert[];
    /**
     * Get alert rules
     */
    getAlertRules(): AlertRule[];
    /**
     * Update alert rule
     */
    updateAlertRule(ruleId: string, updates: Partial<AlertRule>): void;
    /**
     * Acknowledge alert
     */
    acknowledgeAlert(alertId: string, acknowledgedBy: string): void;
    /**
     * Resolve alert
     */
    resolveAlert(alertId: string): void;
    /**
     * Get metrics history
     */
    getMetricsHistory(limit?: number): AdvancedMetrics[];
    /**
     * Cleanup resources
     */
    cleanup(): Promise<void>;
}
/**
 * Factory function to create Advanced Monitoring Engine
 */
export declare function createAdvancedMonitoringEngine(framework: GrowthEngineSupportFramework): AdvancedMonitoringEngine;
//# sourceMappingURL=advanced-monitoring.d.ts.map
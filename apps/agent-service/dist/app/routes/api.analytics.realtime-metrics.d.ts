/**
 * Real-Time Analytics Metrics API
 *
 * Task: DATA-022
 *
 * GET /api/analytics/realtime-metrics
 *
 * Returns comprehensive real-time metrics for the analytics dashboard.
 *
 * Features:
 * - Growth Engine metrics (active actions, approvals, ROI)
 * - System performance metrics (response time, error rate, uptime)
 * - Business KPIs (revenue, conversion rate, sessions)
 * - System health status and alerts
 * - Cached for 30 seconds to reduce load
 */
import { type LoaderFunctionArgs } from "react-router";
export interface RealtimeMetrics {
    growthEngine: {
        activeActions: number;
        pendingApprovals: number;
        completedToday: number;
        avgROI: number;
        successRate: number;
    };
    performance: {
        responseTimeP95: number;
        errorRate: number;
        uptime: number;
        throughput: number;
    };
    kpis: {
        revenue24h: number;
        conversionRate: number;
        avgOrderValue: number;
        sessions24h: number;
    };
    health: {
        status: 'healthy' | 'degraded' | 'critical';
        activeAlerts: number;
        lastCheck: string;
    };
    timestamp: string;
}
export interface Alert {
    id: string;
    type: 'critical' | 'warning' | 'info';
    metric: string;
    message: string;
    value: number;
    threshold: number;
    timestamp: string;
}
/**
 * Loader function
 */
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.analytics.realtime-metrics.d.ts.map
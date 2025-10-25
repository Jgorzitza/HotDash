/**
 * Real-Time Analytics Dashboard
 *
 * Task: DATA-022
 *
 * Comprehensive real-time analytics dashboard with live metrics, KPI tracking,
 * performance monitoring, and alert system.
 *
 * Features:
 * - Server-Sent Events (SSE) for real-time updates
 * - Live KPI tracking with trend indicators
 * - Performance monitoring integration
 * - Alert system for critical metrics
 * - Auto-refresh with connection quality indicator
 * - Multiple view modes (overview, detailed, alerts)
 */
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
export declare function RealtimeAnalyticsDashboard(): React.JSX.Element;
//# sourceMappingURL=RealtimeAnalyticsDashboard.d.ts.map
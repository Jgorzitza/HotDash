/**
 * Production Ad Campaign Monitoring Service
 *
 * ADS-006: Real-time campaign monitoring with automated alerts and optimization
 * Integrates ROAS tracking, budget alerts, and automated bid adjustments
 */
import { type AlertThresholds } from './budget-alerts';
import { type AutomationThresholds } from './campaign-automation';
import type { Campaign, CampaignPerformance, BudgetAlert } from './types';
import type { AutomationAction } from './campaign-automation';
/**
 * Real-time Monitoring Configuration
 */
export interface MonitoringConfig {
    refreshIntervalMs: number;
    roasThreshold: number;
    budgetAlertThresholds: AlertThresholds;
    automationThresholds: AutomationThresholds;
    enableAutomatedActions: boolean;
    enableRealTimeAlerts: boolean;
}
/**
 * Default monitoring configuration
 */
export declare const DEFAULT_MONITORING_CONFIG: MonitoringConfig;
/**
 * Campaign Monitoring Status
 */
export interface CampaignMonitoringStatus {
    campaignId: string;
    campaignName: string;
    status: 'healthy' | 'warning' | 'critical' | 'paused';
    currentROAS: number | null;
    targetROAS: number;
    alerts: BudgetAlert[];
    recommendations: AutomationAction[];
    lastChecked: string;
    metrics: {
        spend: number;
        revenue: number;
        conversions: number;
        ctr: number;
        cpc: number;
    };
}
/**
 * Monitoring Dashboard Data
 */
export interface MonitoringDashboard {
    summary: {
        totalCampaigns: number;
        healthyCampaigns: number;
        warningCampaigns: number;
        criticalCampaigns: number;
        pausedCampaigns: number;
        totalSpend: number;
        totalRevenue: number;
        overallROAS: number;
        activeAlerts: number;
        pendingRecommendations: number;
    };
    campaigns: CampaignMonitoringStatus[];
    recentAlerts: BudgetAlert[];
    topRecommendations: AutomationAction[];
    lastUpdated: string;
}
/**
 * Monitor campaign performance in real-time
 *
 * @param campaigns - Active campaigns to monitor
 * @param performances - Current performance data
 * @param config - Monitoring configuration
 * @returns Monitoring status for each campaign
 */
export declare function monitorCampaignPerformance(campaigns: Campaign[], performances: CampaignPerformance[], config?: MonitoringConfig): CampaignMonitoringStatus[];
/**
 * Generate monitoring dashboard data
 *
 * @param campaigns - All campaigns
 * @param performances - Performance data
 * @param config - Monitoring configuration
 * @returns Complete dashboard data
 */
export declare function generateMonitoringDashboard(campaigns: Campaign[], performances: CampaignPerformance[], config?: MonitoringConfig): MonitoringDashboard;
/**
 * Check if automated action should be executed
 *
 * @param action - Automation action to evaluate
 * @param config - Monitoring configuration
 * @returns Whether action should be auto-executed
 */
export declare function shouldAutoExecuteAction(action: AutomationAction, config?: MonitoringConfig): boolean;
/**
 * Format alert for notification
 *
 * @param alert - Budget alert
 * @returns Formatted notification message
 */
export declare function formatAlertNotification(alert: BudgetAlert): string;
/**
 * Get campaign health score (0-100)
 *
 * @param status - Campaign monitoring status
 * @returns Health score
 */
export declare function getCampaignHealthScore(status: CampaignMonitoringStatus): number;
//# sourceMappingURL=production-monitoring.d.ts.map
/**
 * Production Ad Campaign Monitoring Service
 *
 * ADS-006: Real-time campaign monitoring with automated alerts and optimization
 * Integrates ROAS tracking, budget alerts, and automated bid adjustments
 */
import { calculateROAS, calculateCTR, calculateCPC } from '~/lib/ads/metrics';
import { generateAllAlerts, DEFAULT_THRESHOLDS } from './budget-alerts';
import { generateAutomationRecommendations, DEFAULT_AUTOMATION_THRESHOLDS } from './campaign-automation';
/**
 * Default monitoring configuration
 */
export const DEFAULT_MONITORING_CONFIG = {
    refreshIntervalMs: 300000, // 5 minutes
    roasThreshold: 2.0,
    budgetAlertThresholds: DEFAULT_THRESHOLDS,
    automationThresholds: DEFAULT_AUTOMATION_THRESHOLDS,
    enableAutomatedActions: false, // Require manual approval by default
    enableRealTimeAlerts: true,
};
/**
 * Monitor campaign performance in real-time
 *
 * @param campaigns - Active campaigns to monitor
 * @param performances - Current performance data
 * @param config - Monitoring configuration
 * @returns Monitoring status for each campaign
 */
export function monitorCampaignPerformance(campaigns, performances, config = DEFAULT_MONITORING_CONFIG) {
    const statuses = [];
    for (const campaign of campaigns) {
        const performance = performances.find(p => p.campaignId === campaign.id);
        if (!performance)
            continue;
        // Calculate current metrics
        const currentROAS = calculateROAS(performance.revenueCents, performance.costCents);
        const ctr = calculateCTR(performance.clicks, performance.impressions) || 0;
        const cpc = calculateCPC(performance.costCents, performance.clicks) || 0;
        // Generate alerts for this campaign
        const campaignAlerts = generateAllAlerts([campaign], [performance], undefined, undefined, config.budgetAlertThresholds);
        // Generate automation recommendations
        const campaignSummary = {
            id: campaign.id,
            name: campaign.name,
            status: campaign.status,
            impressions: performance.impressions,
            clicks: performance.clicks,
            ctr,
            costCents: performance.costCents,
            conversions: performance.conversions,
            roas: currentROAS,
        };
        const recommendations = generateAutomationRecommendations([campaignSummary], [], config.automationThresholds);
        // Determine campaign status
        let status = 'healthy';
        if (campaign.status === 'PAUSED') {
            status = 'paused';
        }
        else if (campaignAlerts.some(a => a.severity === 'high')) {
            status = 'critical';
        }
        else if (currentROAS !== null && currentROAS < config.roasThreshold) {
            status = 'warning';
        }
        else if (campaignAlerts.length > 0) {
            status = 'warning';
        }
        statuses.push({
            campaignId: campaign.id,
            campaignName: campaign.name,
            status,
            currentROAS,
            targetROAS: config.roasThreshold,
            alerts: campaignAlerts,
            recommendations,
            lastChecked: new Date().toISOString(),
            metrics: {
                spend: performance.costCents / 100,
                revenue: performance.revenueCents / 100,
                conversions: performance.conversions,
                ctr,
                cpc: cpc / 100,
            },
        });
    }
    return statuses;
}
/**
 * Generate monitoring dashboard data
 *
 * @param campaigns - All campaigns
 * @param performances - Performance data
 * @param config - Monitoring configuration
 * @returns Complete dashboard data
 */
export function generateMonitoringDashboard(campaigns, performances, config = DEFAULT_MONITORING_CONFIG) {
    // Get monitoring status for all campaigns
    const campaignStatuses = monitorCampaignPerformance(campaigns, performances, config);
    // Calculate summary metrics
    const totalSpend = performances.reduce((sum, p) => sum + p.costCents, 0);
    const totalRevenue = performances.reduce((sum, p) => sum + p.revenueCents, 0);
    const overallROAS = calculateROAS(totalRevenue, totalSpend) || 0;
    const healthyCampaigns = campaignStatuses.filter(s => s.status === 'healthy').length;
    const warningCampaigns = campaignStatuses.filter(s => s.status === 'warning').length;
    const criticalCampaigns = campaignStatuses.filter(s => s.status === 'critical').length;
    const pausedCampaigns = campaignStatuses.filter(s => s.status === 'paused').length;
    // Collect all alerts and recommendations
    const allAlerts = campaignStatuses.flatMap(s => s.alerts);
    const allRecommendations = campaignStatuses.flatMap(s => s.recommendations);
    // Get recent high-priority alerts
    const recentAlerts = allAlerts
        .filter(a => a.severity === 'high' || a.severity === 'critical')
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);
    // Get top recommendations by confidence/severity
    const topRecommendations = allRecommendations
        .sort((a, b) => {
        const severityOrder = { high: 0, medium: 1, low: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
    })
        .slice(0, 10);
    return {
        summary: {
            totalCampaigns: campaigns.length,
            healthyCampaigns,
            warningCampaigns,
            criticalCampaigns,
            pausedCampaigns,
            totalSpend: totalSpend / 100,
            totalRevenue: totalRevenue / 100,
            overallROAS,
            activeAlerts: allAlerts.length,
            pendingRecommendations: allRecommendations.length,
        },
        campaigns: campaignStatuses,
        recentAlerts,
        topRecommendations,
        lastUpdated: new Date().toISOString(),
    };
}
/**
 * Check if automated action should be executed
 *
 * @param action - Automation action to evaluate
 * @param config - Monitoring configuration
 * @returns Whether action should be auto-executed
 */
export function shouldAutoExecuteAction(action, config = DEFAULT_MONITORING_CONFIG) {
    if (!config.enableAutomatedActions) {
        return false;
    }
    // Only auto-execute low-severity actions
    if (action.severity !== 'low') {
        return false;
    }
    // Require approval for budget changes above threshold
    if (action.type === 'increase_budget' || action.type === 'decrease_budget') {
        return false; // Always require approval for budget changes
    }
    // Auto-execute pause actions for critically underperforming campaigns
    if (action.type === 'pause_campaign' && action.severity === 'high') {
        return true;
    }
    return false;
}
/**
 * Format alert for notification
 *
 * @param alert - Budget alert
 * @returns Formatted notification message
 */
export function formatAlertNotification(alert) {
    const emoji = alert.severity === 'high' ? '🚨' : alert.severity === 'medium' ? '⚠️' : 'ℹ️';
    return `${emoji} ${alert.campaignName}: ${alert.message}`;
}
/**
 * Get campaign health score (0-100)
 *
 * @param status - Campaign monitoring status
 * @returns Health score
 */
export function getCampaignHealthScore(status) {
    let score = 100;
    // Deduct points for low ROAS
    if (status.currentROAS !== null) {
        if (status.currentROAS < status.targetROAS) {
            const roasDeficit = (status.targetROAS - status.currentROAS) / status.targetROAS;
            score -= roasDeficit * 40; // Up to 40 points for ROAS
        }
    }
    else {
        score -= 20; // No ROAS data
    }
    // Deduct points for alerts
    score -= status.alerts.filter(a => a.severity === 'high').length * 15;
    score -= status.alerts.filter(a => a.severity === 'medium').length * 10;
    score -= status.alerts.filter(a => a.severity === 'low').length * 5;
    // Deduct points for low CTR
    if (status.metrics.ctr < 0.01) {
        score -= 10;
    }
    return Math.max(0, Math.min(100, score));
}
//# sourceMappingURL=production-monitoring.js.map
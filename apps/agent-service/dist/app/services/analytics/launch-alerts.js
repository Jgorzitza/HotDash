/**
 * Launch Metrics Alert Service
 *
 * Task: ANALYTICS-LAUNCH-001
 *
 * Monitors launch metrics and generates alerts for anomalies.
 * Integrates with SSE for real-time alert delivery.
 */
import { logDecision } from "~/services/decisions.server";
const DEFAULT_THRESHOLDS = {
    // User Engagement
    dauMauRatio: { warning: 0.2, critical: 0.1 },
    signupTarget: { warning: 0.7, critical: 0.5 },
    // Feature Adoption
    activationRate: { warning: 50, critical: 30 },
    ttfvMedian: { warning: 45, critical: 60 },
    // Satisfaction
    npsScore: { warning: 30, critical: 10 },
    csatAverage: { warning: 3.5, critical: 3.0 },
    sentimentPositive: { warning: 0.6, critical: 0.4 },
    // Performance
    loadTimeP95: { warning: 3000, critical: 5000 },
    errorRate: { warning: 0.05, critical: 0.1 },
};
export class LaunchAlertsService {
    thresholds;
    constructor(thresholds) {
        this.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
    }
    /**
     * Check metrics and generate alerts
     */
    async checkMetrics(metrics) {
        const alerts = [];
        // User Engagement Alerts
        alerts.push(...this.checkUserEngagement(metrics));
        // Feature Adoption Alerts
        alerts.push(...this.checkFeatureAdoption(metrics));
        // Satisfaction Alerts
        alerts.push(...this.checkSatisfaction(metrics));
        // Log alerts to database
        if (alerts.length > 0) {
            await this.logAlerts(alerts);
        }
        return alerts;
    }
    checkUserEngagement(metrics) {
        const alerts = [];
        // DAU/MAU Ratio
        const dauMauRatio = metrics.adoption.dauMau.ratio;
        if (dauMauRatio < this.thresholds.dauMauRatio.critical) {
            alerts.push({
                id: `alert-${Date.now()}-daumau-critical`,
                type: 'user_engagement',
                severity: 'critical',
                metric: 'DAU/MAU Ratio',
                message: `Critical: DAU/MAU ratio is ${(dauMauRatio * 100).toFixed(1)}% (threshold: ${(this.thresholds.dauMauRatio.critical * 100).toFixed(0)}%)`,
                currentValue: dauMauRatio,
                threshold: this.thresholds.dauMauRatio.critical,
                timestamp: new Date().toISOString(),
            });
        }
        else if (dauMauRatio < this.thresholds.dauMauRatio.warning) {
            alerts.push({
                id: `alert-${Date.now()}-daumau-warning`,
                type: 'user_engagement',
                severity: 'warning',
                metric: 'DAU/MAU Ratio',
                message: `Warning: DAU/MAU ratio is ${(dauMauRatio * 100).toFixed(1)}% (threshold: ${(this.thresholds.dauMauRatio.warning * 100).toFixed(0)}%)`,
                currentValue: dauMauRatio,
                threshold: this.thresholds.dauMauRatio.warning,
                timestamp: new Date().toISOString(),
            });
        }
        // Signup Target
        const signupPercent = metrics.adoption.signups.percentOfTarget / 100;
        if (signupPercent < this.thresholds.signupTarget.critical) {
            alerts.push({
                id: `alert-${Date.now()}-signup-critical`,
                type: 'user_engagement',
                severity: 'critical',
                metric: 'Signup Target',
                message: `Critical: Only ${metrics.adoption.signups.percentOfTarget}% of signup target reached`,
                currentValue: signupPercent,
                threshold: this.thresholds.signupTarget.critical,
                timestamp: new Date().toISOString(),
            });
        }
        else if (signupPercent < this.thresholds.signupTarget.warning) {
            alerts.push({
                id: `alert-${Date.now()}-signup-warning`,
                type: 'user_engagement',
                severity: 'warning',
                metric: 'Signup Target',
                message: `Warning: ${metrics.adoption.signups.percentOfTarget}% of signup target reached`,
                currentValue: signupPercent,
                threshold: this.thresholds.signupTarget.warning,
                timestamp: new Date().toISOString(),
            });
        }
        return alerts;
    }
    checkFeatureAdoption(metrics) {
        const alerts = [];
        // Activation Rate
        const activationRate = metrics.adoption.activation.activationRate;
        if (activationRate < this.thresholds.activationRate.critical) {
            alerts.push({
                id: `alert-${Date.now()}-activation-critical`,
                type: 'feature_adoption',
                severity: 'critical',
                metric: 'Activation Rate',
                message: `Critical: Activation rate is ${activationRate}% (threshold: ${this.thresholds.activationRate.critical}%)`,
                currentValue: activationRate,
                threshold: this.thresholds.activationRate.critical,
                timestamp: new Date().toISOString(),
            });
        }
        else if (activationRate < this.thresholds.activationRate.warning) {
            alerts.push({
                id: `alert-${Date.now()}-activation-warning`,
                type: 'feature_adoption',
                severity: 'warning',
                metric: 'Activation Rate',
                message: `Warning: Activation rate is ${activationRate}% (threshold: ${this.thresholds.activationRate.warning}%)`,
                currentValue: activationRate,
                threshold: this.thresholds.activationRate.warning,
                timestamp: new Date().toISOString(),
            });
        }
        // Time to First Value
        const ttfv = metrics.adoption.ttfv.median;
        if (ttfv > this.thresholds.ttfvMedian.critical) {
            alerts.push({
                id: `alert-${Date.now()}-ttfv-critical`,
                type: 'feature_adoption',
                severity: 'critical',
                metric: 'Time to First Value',
                message: `Critical: TTFV is ${ttfv} minutes (threshold: ${this.thresholds.ttfvMedian.critical} min)`,
                currentValue: ttfv,
                threshold: this.thresholds.ttfvMedian.critical,
                timestamp: new Date().toISOString(),
            });
        }
        else if (ttfv > this.thresholds.ttfvMedian.warning) {
            alerts.push({
                id: `alert-${Date.now()}-ttfv-warning`,
                type: 'feature_adoption',
                severity: 'warning',
                metric: 'Time to First Value',
                message: `Warning: TTFV is ${ttfv} minutes (threshold: ${this.thresholds.ttfvMedian.warning} min)`,
                currentValue: ttfv,
                threshold: this.thresholds.ttfvMedian.warning,
                timestamp: new Date().toISOString(),
            });
        }
        return alerts;
    }
    checkSatisfaction(metrics) {
        const alerts = [];
        // NPS Score
        const npsScore = metrics.satisfaction.nps.npsScore;
        if (npsScore < this.thresholds.npsScore.critical) {
            alerts.push({
                id: `alert-${Date.now()}-nps-critical`,
                type: 'business',
                severity: 'critical',
                metric: 'NPS Score',
                message: `Critical: NPS score is ${npsScore} (threshold: ${this.thresholds.npsScore.critical})`,
                currentValue: npsScore,
                threshold: this.thresholds.npsScore.critical,
                timestamp: new Date().toISOString(),
            });
        }
        else if (npsScore < this.thresholds.npsScore.warning) {
            alerts.push({
                id: `alert-${Date.now()}-nps-warning`,
                type: 'business',
                severity: 'warning',
                metric: 'NPS Score',
                message: `Warning: NPS score is ${npsScore} (threshold: ${this.thresholds.npsScore.warning})`,
                currentValue: npsScore,
                threshold: this.thresholds.npsScore.warning,
                timestamp: new Date().toISOString(),
            });
        }
        // CSAT Average
        const csatAvg = metrics.satisfaction.csat[0]?.averageRating || 0;
        if (csatAvg > 0 && csatAvg < this.thresholds.csatAverage.critical) {
            alerts.push({
                id: `alert-${Date.now()}-csat-critical`,
                type: 'business',
                severity: 'critical',
                metric: 'CSAT Average',
                message: `Critical: CSAT average is ${csatAvg.toFixed(1)} (threshold: ${this.thresholds.csatAverage.critical})`,
                currentValue: csatAvg,
                threshold: this.thresholds.csatAverage.critical,
                timestamp: new Date().toISOString(),
            });
        }
        else if (csatAvg > 0 && csatAvg < this.thresholds.csatAverage.warning) {
            alerts.push({
                id: `alert-${Date.now()}-csat-warning`,
                type: 'business',
                severity: 'warning',
                metric: 'CSAT Average',
                message: `Warning: CSAT average is ${csatAvg.toFixed(1)} (threshold: ${this.thresholds.csatAverage.warning})`,
                currentValue: csatAvg,
                threshold: this.thresholds.csatAverage.warning,
                timestamp: new Date().toISOString(),
            });
        }
        // Sentiment
        const sentimentPositive = metrics.satisfaction.sentiment.positiveRate;
        if (sentimentPositive < this.thresholds.sentimentPositive.critical) {
            alerts.push({
                id: `alert-${Date.now()}-sentiment-critical`,
                type: 'business',
                severity: 'critical',
                metric: 'Positive Sentiment',
                message: `Critical: Positive sentiment is ${(sentimentPositive * 100).toFixed(0)}% (threshold: ${(this.thresholds.sentimentPositive.critical * 100).toFixed(0)}%)`,
                currentValue: sentimentPositive,
                threshold: this.thresholds.sentimentPositive.critical,
                timestamp: new Date().toISOString(),
            });
        }
        else if (sentimentPositive < this.thresholds.sentimentPositive.warning) {
            alerts.push({
                id: `alert-${Date.now()}-sentiment-warning`,
                type: 'business',
                severity: 'warning',
                metric: 'Positive Sentiment',
                message: `Warning: Positive sentiment is ${(sentimentPositive * 100).toFixed(0)}% (threshold: ${(this.thresholds.sentimentPositive.warning * 100).toFixed(0)}%)`,
                currentValue: sentimentPositive,
                threshold: this.thresholds.sentimentPositive.warning,
                timestamp: new Date().toISOString(),
            });
        }
        return alerts;
    }
    async logAlerts(alerts) {
        await logDecision({
            scope: 'build',
            actor: 'analytics',
            action: 'launch_metrics_alerts_generated',
            rationale: `Generated ${alerts.length} launch metric alert(s)`,
            evidenceUrl: 'app/services/analytics/launch-alerts.ts',
            payload: {
                alertCount: alerts.length,
                criticalCount: alerts.filter(a => a.severity === 'critical').length,
                warningCount: alerts.filter(a => a.severity === 'warning').length,
                alerts: alerts.map(a => ({
                    type: a.type,
                    severity: a.severity,
                    metric: a.metric,
                    currentValue: a.currentValue,
                    threshold: a.threshold,
                })),
            },
        });
    }
}
export const launchAlertsService = new LaunchAlertsService();
//# sourceMappingURL=launch-alerts.js.map
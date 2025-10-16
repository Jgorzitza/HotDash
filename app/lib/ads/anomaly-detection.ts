/**
 * Anomaly Detection for Ads
 * 
 * Purpose: Detect anomalies in ad performance metrics (read-only alerts)
 * Owner: ads agent
 * Date: 2025-10-15
 * 
 * Features:
 * - Statistical anomaly detection
 * - Threshold-based alerts
 * - Trend anomalies
 * - Performance degradation detection
 */

import type { AdPlatform } from './tracking';

/**
 * Anomaly severity
 */
export type AnomalySeverity = 'critical' | 'warning' | 'info';

/**
 * Anomaly type
 */
export type AnomalyType = 
  | 'spend_spike'
  | 'spend_drop'
  | 'roas_drop'
  | 'ctr_drop'
  | 'conversion_drop'
  | 'cpa_spike'
  | 'budget_depleted'
  | 'performance_degradation';

/**
 * Anomaly alert
 */
export interface AnomalyAlert {
  alertId: string;
  type: AnomalyType;
  severity: AnomalySeverity;
  campaignId: string;
  campaignName: string;
  platform: AdPlatform;
  metric: string;
  currentValue: number;
  expectedValue: number;
  deviation: number;
  deviationPercent: number;
  message: string;
  recommendation: string;
  detectedAt: string;
}

/**
 * Time series data point
 */
export interface TimeSeriesPoint {
  date: string;
  value: number;
}

/**
 * Detect spend anomalies
 * 
 * @param currentSpend - Current daily spend
 * @param historicalSpend - Historical daily spend values
 * @param threshold - Standard deviations for anomaly (default: 2)
 * @returns Anomaly alert if detected
 */
export function detectSpendAnomaly(
  currentSpend: number,
  historicalSpend: number[],
  threshold: number = 2
): AnomalyAlert | null {
  if (historicalSpend.length < 7) return null; // Need at least 7 days

  const mean = historicalSpend.reduce((sum, v) => sum + v, 0) / historicalSpend.length;
  const variance = historicalSpend.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / historicalSpend.length;
  const stdDev = Math.sqrt(variance);

  const deviation = currentSpend - mean;
  const deviationPercent = (deviation / mean) * 100;
  const zScore = stdDev > 0 ? deviation / stdDev : 0;

  if (Math.abs(zScore) >= threshold) {
    const type: AnomalyType = deviation > 0 ? 'spend_spike' : 'spend_drop';
    const severity: AnomalySeverity = Math.abs(zScore) >= 3 ? 'critical' : 'warning';

    return {
      alertId: `anomaly_${Date.now()}`,
      type,
      severity,
      campaignId: '',
      campaignName: '',
      platform: 'meta',
      metric: 'daily_spend',
      currentValue: currentSpend,
      expectedValue: mean,
      deviation,
      deviationPercent,
      message: `Daily spend ${deviation > 0 ? 'increased' : 'decreased'} by ${Math.abs(deviationPercent).toFixed(1)}% ` +
        `(${Math.abs(zScore).toFixed(1)} standard deviations)`,
      recommendation: deviation > 0
        ? 'Check for budget cap issues or bidding changes'
        : 'Investigate delivery issues or targeting problems',
      detectedAt: new Date().toISOString(),
    };
  }

  return null;
}

/**
 * Detect ROAS drop
 * 
 * @param currentRoas - Current ROAS
 * @param historicalRoas - Historical ROAS values
 * @param dropThreshold - Minimum % drop to trigger alert (default: 20%)
 * @returns Anomaly alert if detected
 */
export function detectRoasDropAnomaly(
  currentRoas: number,
  historicalRoas: number[],
  dropThreshold: number = 20
): AnomalyAlert | null {
  if (historicalRoas.length < 7) return null;

  const avgRoas = historicalRoas.reduce((sum, v) => sum + v, 0) / historicalRoas.length;
  const dropPercent = ((avgRoas - currentRoas) / avgRoas) * 100;

  if (dropPercent >= dropThreshold) {
    const severity: AnomalySeverity = dropPercent >= 40 ? 'critical' : dropPercent >= 30 ? 'warning' : 'info';

    return {
      alertId: `anomaly_${Date.now()}`,
      type: 'roas_drop',
      severity,
      campaignId: '',
      campaignName: '',
      platform: 'meta',
      metric: 'roas',
      currentValue: currentRoas,
      expectedValue: avgRoas,
      deviation: currentRoas - avgRoas,
      deviationPercent: -dropPercent,
      message: `ROAS dropped ${dropPercent.toFixed(1)}% from ${avgRoas.toFixed(2)}x to ${currentRoas.toFixed(2)}x`,
      recommendation: 'Review recent changes to targeting, creative, or bidding. Check for increased competition.',
      detectedAt: new Date().toISOString(),
    };
  }

  return null;
}

/**
 * Detect CTR drop
 * 
 * @param currentCtr - Current CTR
 * @param historicalCtr - Historical CTR values
 * @param dropThreshold - Minimum % drop to trigger alert (default: 25%)
 * @returns Anomaly alert if detected
 */
export function detectCtrDropAnomaly(
  currentCtr: number,
  historicalCtr: number[],
  dropThreshold: number = 25
): AnomalyAlert | null {
  if (historicalCtr.length < 7) return null;

  const avgCtr = historicalCtr.reduce((sum, v) => sum + v, 0) / historicalCtr.length;
  const dropPercent = ((avgCtr - currentCtr) / avgCtr) * 100;

  if (dropPercent >= dropThreshold) {
    return {
      alertId: `anomaly_${Date.now()}`,
      type: 'ctr_drop',
      severity: 'warning',
      campaignId: '',
      campaignName: '',
      platform: 'meta',
      metric: 'ctr',
      currentValue: currentCtr,
      expectedValue: avgCtr,
      deviation: currentCtr - avgCtr,
      deviationPercent: -dropPercent,
      message: `CTR dropped ${dropPercent.toFixed(1)}% from ${avgCtr.toFixed(2)}% to ${currentCtr.toFixed(2)}%`,
      recommendation: 'Creative may be fatigued. Consider refreshing ad creative or testing new variations.',
      detectedAt: new Date().toISOString(),
    };
  }

  return null;
}

/**
 * Detect conversion rate drop
 * 
 * @param currentConversionRate - Current conversion rate
 * @param historicalConversionRate - Historical conversion rate values
 * @param dropThreshold - Minimum % drop to trigger alert (default: 30%)
 * @returns Anomaly alert if detected
 */
export function detectConversionDropAnomaly(
  currentConversionRate: number,
  historicalConversionRate: number[],
  dropThreshold: number = 30
): AnomalyAlert | null {
  if (historicalConversionRate.length < 7) return null;

  const avgRate = historicalConversionRate.reduce((sum, v) => sum + v, 0) / historicalConversionRate.length;
  const dropPercent = ((avgRate - currentConversionRate) / avgRate) * 100;

  if (dropPercent >= dropThreshold) {
    return {
      alertId: `anomaly_${Date.now()}`,
      type: 'conversion_drop',
      severity: 'critical',
      campaignId: '',
      campaignName: '',
      platform: 'meta',
      metric: 'conversion_rate',
      currentValue: currentConversionRate,
      expectedValue: avgRate,
      deviation: currentConversionRate - avgRate,
      deviationPercent: -dropPercent,
      message: `Conversion rate dropped ${dropPercent.toFixed(1)}% from ${avgRate.toFixed(2)}% to ${currentConversionRate.toFixed(2)}%`,
      recommendation: 'Check landing page, checkout flow, or product availability. May indicate technical issues.',
      detectedAt: new Date().toISOString(),
    };
  }

  return null;
}

/**
 * Detect CPA spike
 * 
 * @param currentCpa - Current CPA
 * @param historicalCpa - Historical CPA values
 * @param spikeThreshold - Minimum % increase to trigger alert (default: 30%)
 * @returns Anomaly alert if detected
 */
export function detectCpaSpikeAnomaly(
  currentCpa: number,
  historicalCpa: number[],
  spikeThreshold: number = 30
): AnomalyAlert | null {
  if (historicalCpa.length < 7) return null;

  const avgCpa = historicalCpa.reduce((sum, v) => sum + v, 0) / historicalCpa.length;
  const spikePercent = ((currentCpa - avgCpa) / avgCpa) * 100;

  if (spikePercent >= spikeThreshold) {
    return {
      alertId: `anomaly_${Date.now()}`,
      type: 'cpa_spike',
      severity: 'warning',
      campaignId: '',
      campaignName: '',
      platform: 'meta',
      metric: 'cpa',
      currentValue: currentCpa,
      expectedValue: avgCpa,
      deviation: currentCpa - avgCpa,
      deviationPercent: spikePercent,
      message: `CPA increased ${spikePercent.toFixed(1)}% from $${avgCpa.toFixed(2)} to $${currentCpa.toFixed(2)}`,
      recommendation: 'Review targeting and bidding strategy. Consider pausing low-performing ad sets.',
      detectedAt: new Date().toISOString(),
    };
  }

  return null;
}

/**
 * Detect all anomalies for a campaign
 * 
 * @param current - Current metrics
 * @param historical - Historical time series data
 * @returns Array of detected anomalies
 */
export function detectAllAnomalies(
  current: {
    spend: number;
    roas: number;
    ctr: number;
    conversionRate: number;
    cpa: number;
  },
  historical: {
    spend: number[];
    roas: number[];
    ctr: number[];
    conversionRate: number[];
    cpa: number[];
  }
): AnomalyAlert[] {
  const anomalies: AnomalyAlert[] = [];

  const spendAnomaly = detectSpendAnomaly(current.spend, historical.spend);
  if (spendAnomaly) anomalies.push(spendAnomaly);

  const roasAnomaly = detectRoasDropAnomaly(current.roas, historical.roas);
  if (roasAnomaly) anomalies.push(roasAnomaly);

  const ctrAnomaly = detectCtrDropAnomaly(current.ctr, historical.ctr);
  if (ctrAnomaly) anomalies.push(ctrAnomaly);

  const conversionAnomaly = detectConversionDropAnomaly(current.conversionRate, historical.conversionRate);
  if (conversionAnomaly) anomalies.push(conversionAnomaly);

  const cpaAnomaly = detectCpaSpikeAnomaly(current.cpa, historical.cpa);
  if (cpaAnomaly) anomalies.push(cpaAnomaly);

  return anomalies.sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}


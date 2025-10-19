/**
 * Anomaly Detection
 *
 * Detect performance anomalies in campaign metrics
 *
 * @module app/lib/ads/anomaly-detection
 */

import type { Campaign, CampaignDailySnapshot } from "./types";

export interface Anomaly {
  campaignId: string;
  campaignName: string;
  metric: string;
  type: "spike" | "drop" | "trend";
  severity: "info" | "warning" | "critical";
  currentValue: number;
  expectedValue: number;
  deviation: number;
  message: string;
  detectedAt: string;
}

/**
 * Detect anomalies in campaign performance
 *
 * @param current - Current campaign state
 * @param historical - Historical snapshots
 * @returns Detected anomalies
 */
export function detectAnomalies(
  current: Campaign,
  historical: CampaignDailySnapshot[],
): Anomaly[] {
  const anomalies: Anomaly[] = [];
  const now = new Date().toISOString();

  if (historical.length < 3) {
    // Need at least 3 days of history for detection
    return anomalies;
  }

  // Calculate historical averages
  const avgROAS =
    historical.reduce((sum, s) => sum + s.metrics.roas, 0) / historical.length;
  const avgCPC =
    historical.reduce((sum, s) => sum + s.metrics.cpc, 0) / historical.length;
  const avgCTR =
    historical.reduce((sum, s) => sum + s.metrics.ctr, 0) / historical.length;

  // Check ROAS deviation
  const roasDeviation = ((current.metrics.roas - avgROAS) / avgROAS) * 100;
  if (Math.abs(roasDeviation) > 30) {
    anomalies.push({
      campaignId: current.id,
      campaignName: current.name,
      metric: "ROAS",
      type: roasDeviation > 0 ? "spike" : "drop",
      severity: Math.abs(roasDeviation) > 50 ? "critical" : "warning",
      currentValue: current.metrics.roas,
      expectedValue: avgROAS,
      deviation: roasDeviation,
      message: `ROAS ${roasDeviation > 0 ? "increased" : "decreased"} ${Math.abs(roasDeviation).toFixed(0)}% from ${avgROAS.toFixed(2)}x to ${current.metrics.roas.toFixed(2)}x`,
      detectedAt: now,
    });
  }

  // Check CPC deviation
  const cpcDeviation = ((current.metrics.cpc - avgCPC) / avgCPC) * 100;
  if (Math.abs(cpcDeviation) > 40) {
    anomalies.push({
      campaignId: current.id,
      campaignName: current.name,
      metric: "CPC",
      type: cpcDeviation > 0 ? "spike" : "drop",
      severity: cpcDeviation > 0 ? "warning" : "info",
      currentValue: current.metrics.cpc,
      expectedValue: avgCPC,
      deviation: cpcDeviation,
      message: `CPC ${cpcDeviation > 0 ? "increased" : "decreased"} ${Math.abs(cpcDeviation).toFixed(0)}% from $${avgCPC.toFixed(2)} to $${current.metrics.cpc.toFixed(2)}`,
      detectedAt: now,
    });
  }

  // Check CTR deviation
  const ctrDeviation = ((current.metrics.ctr - avgCTR) / avgCTR) * 100;
  if (Math.abs(ctrDeviation) > 50) {
    anomalies.push({
      campaignId: current.id,
      campaignName: current.name,
      metric: "CTR",
      type: ctrDeviation > 0 ? "spike" : "drop",
      severity: ctrDeviation < 0 ? "warning" : "info",
      currentValue: current.metrics.ctr,
      expectedValue: avgCTR,
      deviation: ctrDeviation,
      message: `CTR ${ctrDeviation > 0 ? "increased" : "decreased"} ${Math.abs(ctrDeviation).toFixed(0)}% from ${avgCTR.toFixed(2)}% to ${current.metrics.ctr.toFixed(2)}%`,
      detectedAt: now,
    });
  }

  return anomalies;
}

/**
 * Anomaly Detection
 * 
 * Detect traffic and conversion anomalies using Z-score analysis.
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { getGaConfig } from '../../config/ga.server.ts';
import { appMetrics } from '../../utils/metrics.server.ts';

export interface Anomaly {
  date: string;
  metric: string;
  value: number;
  expected: number;
  zScore: number;
  severity: 'critical' | 'warning' | 'info';
  description: string;
}

export async function detectAnomalies(days: number = 30): Promise<Anomaly[]> {
  const startTime = Date.now();
  
  try {
    const config = getGaConfig();
    const client = new BetaAnalyticsDataClient();

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - days);

    const [response] = await client.runReport({
      property: `properties/${config.propertyId}`,
      dateRanges: [{ 
        startDate: startDate.toISOString().split('T')[0], 
        endDate: today.toISOString().split('T')[0] 
      }],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'sessions' },
        { name: 'conversions' },
        { name: 'totalRevenue' },
      ],
      orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }],
    });

    const dataPoints = (response.rows || []).map((row) => ({
      date: formatDate(row.dimensionValues?.[0]?.value || ''),
      sessions: parseInt(row.metricValues?.[0]?.value || '0', 10),
      conversions: parseInt(row.metricValues?.[1]?.value || '0', 10),
      revenue: parseFloat(row.metricValues?.[2]?.value || '0'),
    }));

    const anomalies: Anomaly[] = [];

    // Detect session anomalies
    const sessionAnomalies = detectMetricAnomalies(
      dataPoints.map(d => ({ date: d.date, value: d.sessions })),
      'sessions'
    );
    anomalies.push(...sessionAnomalies);

    // Detect conversion anomalies
    const conversionAnomalies = detectMetricAnomalies(
      dataPoints.map(d => ({ date: d.date, value: d.conversions })),
      'conversions'
    );
    anomalies.push(...conversionAnomalies);

    // Detect revenue anomalies
    const revenueAnomalies = detectMetricAnomalies(
      dataPoints.map(d => ({ date: d.date, value: d.revenue })),
      'revenue'
    );
    anomalies.push(...revenueAnomalies);

    const duration = Date.now() - startTime;
    appMetrics.gaApiCall('detectAnomalies', true, duration);

    return anomalies.sort((a, b) => Math.abs(b.zScore) - Math.abs(a.zScore));
  } catch (error: any) {
    const duration = Date.now() - startTime;
    appMetrics.gaApiCall('detectAnomalies', false, duration);
    throw error;
  }
}

function detectMetricAnomalies(
  data: Array<{ date: string; value: number }>,
  metricName: string
): Anomaly[] {
  const values = data.map(d => d.value);
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  const anomalies: Anomaly[] = [];

  data.forEach((point) => {
    const zScore = stdDev > 0 ? (point.value - mean) / stdDev : 0;
    
    if (Math.abs(zScore) > 2) {
      const severity = Math.abs(zScore) > 3 ? 'critical' : 'warning';
      const direction = zScore > 0 ? 'spike' : 'drop';
      
      anomalies.push({
        date: point.date,
        metric: metricName,
        value: point.value,
        expected: mean,
        zScore,
        severity,
        description: `${metricName} ${direction}: ${point.value.toFixed(2)} (expected ${mean.toFixed(2)}, z-score: ${zScore.toFixed(2)})`,
      });
    }
  });

  return anomalies;
}

function formatDate(dateStr: string): string {
  if (dateStr.length === 8) {
    return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
  }
  return dateStr;
}


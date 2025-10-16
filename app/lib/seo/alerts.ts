/**
 * SEO Alerts (Read-Only)
 * @module lib/seo/alerts
 */

import type { SEOAnomaly } from './anomalies';

export interface SEOAlert {
  id: string;
  anomaly: SEOAnomaly;
  createdAt: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

export function createAlerts(anomalies: SEOAnomaly[]): SEOAlert[] {
  return anomalies
    .filter(a => a.severity === 'critical')
    .map(anomaly => ({
      id: `alert-${anomaly.id}-${Date.now()}`,
      anomaly,
      createdAt: new Date().toISOString(),
      acknowledged: false,
    }));
}

export function filterUnacknowledged(alerts: SEOAlert[]): SEOAlert[] {
  return alerts.filter(a => !a.acknowledged);
}

export function sortAlertsByPriority(alerts: SEOAlert[]): SEOAlert[] {
  return alerts.sort((a, b) => {
    if (a.anomaly.severity !== b.anomaly.severity) {
      return a.anomaly.severity === 'critical' ? -1 : 1;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

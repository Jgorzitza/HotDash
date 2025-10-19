/**
 * Real-time SEO Anomaly Detection
 *
 * Monitors SEO metrics and detects anomalies using threshold-based rules
 */

export interface AnomalyDetectionConfig {
  trafficDropThreshold: number; // -0.4 = 40% drop
  rankingDropThreshold: number; // 10 position drop
  vitalsThresholds: {
    LCP: number;
    FID: number;
    CLS: number;
  };
}

export interface DetectedAnomaly {
  id: string;
  type: "traffic" | "ranking" | "vitals" | "crawl";
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  affectedUrl: string;
  metric: {
    current: number;
    previous?: number;
    change?: number;
    changePercent?: number;
  };
  detectedAt: string;
}

const DEFAULT_CONFIG: AnomalyDetectionConfig = {
  trafficDropThreshold: -0.4,
  rankingDropThreshold: 10,
  vitalsThresholds: {
    LCP: 4000,
    FID: 300,
    CLS: 0.25,
  },
};

/**
 * Detects traffic anomalies by comparing current vs previous sessions
 */
export function detectTrafficAnomalies(
  currentSessions: number,
  previousSessions: number,
  url: string,
  config: AnomalyDetectionConfig = DEFAULT_CONFIG,
): DetectedAnomaly | null {
  if (previousSessions === 0) return null;

  const change = currentSessions - previousSessions;
  const changePercent = change / previousSessions;

  if (changePercent <= config.trafficDropThreshold) {
    return {
      id: `traffic-${url}-${Date.now()}`,
      type: "traffic",
      severity: changePercent <= -0.4 ? "critical" : "warning",
      title: `Traffic drop on ${url}`,
      description: `Sessions dropped ${Math.abs(changePercent * 100).toFixed(0)}% WoW`,
      affectedUrl: url,
      metric: {
        current: currentSessions,
        previous: previousSessions,
        change,
        changePercent,
      },
      detectedAt: new Date().toISOString(),
    };
  }

  return null;
}

/**
 * Scans multiple URLs for anomalies
 */
export function scanForAnomalies(
  urlMetrics: Array<{ url: string; current: number; previous: number }>,
  config?: AnomalyDetectionConfig,
): DetectedAnomaly[] {
  const anomalies: DetectedAnomaly[] = [];

  for (const { url, current, previous } of urlMetrics) {
    const anomaly = detectTrafficAnomalies(current, previous, url, config);
    if (anomaly) {
      anomalies.push(anomaly);
    }
  }

  return anomalies.sort((a, b) => {
    if (a.severity === "critical" && b.severity !== "critical") return -1;
    if (a.severity !== "critical" && b.severity === "critical") return 1;
    return 0;
  });
}

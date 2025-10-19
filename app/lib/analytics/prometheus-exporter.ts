/**
 * Prometheus Metrics Exporter
 *
 * Exports analytics metrics in Prometheus format.
 * Endpoint: GET /api/analytics/metrics (Prometheus format)
 */

export interface PrometheusMetric {
  name: string;
  type: "counter" | "gauge" | "histogram" | "summary";
  help: string;
  value: number;
  labels?: Record<string, string>;
}

/**
 * Format metric in Prometheus exposition format
 */
export function formatPrometheusMetric(metric: PrometheusMetric): string {
  const lines: string[] = [];

  // HELP line
  lines.push(`# HELP ${metric.name} ${metric.help}`);

  // TYPE line
  lines.push(`# TYPE ${metric.name} ${metric.type}`);

  // Metric line
  let metricLine = metric.name;
  if (metric.labels) {
    const labelPairs = Object.entries(metric.labels)
      .map(([k, v]) => `${k}="${v}"`)
      .join(",");
    metricLine += `{${labelPairs}}`;
  }
  metricLine += ` ${metric.value}`;

  lines.push(metricLine);

  return lines.join("\n");
}

/**
 * Export analytics metrics for Prometheus
 */
export function exportPrometheusMetrics(metrics: {
  revenue: number;
  conversionRate: number;
  sessions: number;
  cacheHits: number;
  cacheMisses: number;
}): string {
  const prometheusMetrics: PrometheusMetric[] = [
    {
      name: "analytics_revenue_total",
      type: "gauge",
      help: "Total revenue in USD (last 30 days)",
      value: metrics.revenue,
      labels: { currency: "USD", period: "30d" },
    },
    {
      name: "analytics_conversion_rate",
      type: "gauge",
      help: "Conversion rate percentage",
      value: metrics.conversionRate,
      labels: { period: "30d" },
    },
    {
      name: "analytics_sessions_total",
      type: "gauge",
      help: "Total sessions (last 30 days)",
      value: metrics.sessions,
      labels: { period: "30d" },
    },
    {
      name: "analytics_cache_hits_total",
      type: "counter",
      help: "Total cache hits",
      value: metrics.cacheHits,
    },
    {
      name: "analytics_cache_misses_total",
      type: "counter",
      help: "Total cache misses",
      value: metrics.cacheMisses,
    },
  ];

  return prometheusMetrics.map(formatPrometheusMetric).join("\n\n") + "\n";
}

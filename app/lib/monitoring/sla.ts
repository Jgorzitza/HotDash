/**
 * SLA Monitors per Adapter
 * Owner: integrations agent
 * Date: 2025-10-15
 */

import { logger } from "../../utils/logger.server";

export interface SLAConfig {
  name: string;
  p95LatencyMs: number;
  errorRatePercent: number;
  availabilityPercent: number;
}

export interface SLAMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  latencies: number[];
  violations: string[];
}

const SLA_CONFIGS: Record<string, SLAConfig> = {
  shopify: {
    name: "Shopify Admin GraphQL",
    p95LatencyMs: 500,
    errorRatePercent: 0.5,
    availabilityPercent: 99.9,
  },
  supabase: {
    name: "Supabase RPC",
    p95LatencyMs: 200,
    errorRatePercent: 0.5,
    availabilityPercent: 99.9,
  },
  chatwoot: {
    name: "Chatwoot API",
    p95LatencyMs: 500,
    errorRatePercent: 1.0,
    availabilityPercent: 99.5,
  },
  ga4: {
    name: "Google Analytics 4",
    p95LatencyMs: 1000,
    errorRatePercent: 1.0,
    availabilityPercent: 99.0,
  },
};

const metrics = new Map<string, SLAMetrics>();

export function recordSLAMetric(service: string, latencyMs: number, success: boolean): void {
  if (!metrics.has(service)) {
    metrics.set(service, {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      latencies: [],
      violations: [],
    });
  }

  const metric = metrics.get(service)!;
  metric.totalRequests++;
  metric.latencies.push(latencyMs);

  if (success) {
    metric.successfulRequests++;
  } else {
    metric.failedRequests++;
  }

  if (metric.latencies.length > 1000) {
    metric.latencies.shift();
  }
}

export function calculateP95Latency(latencies: number[]): number {
  if (latencies.length === 0) return 0;
  const sorted = [...latencies].sort((a, b) => a - b);
  const index = Math.ceil(sorted.length * 0.95) - 1;
  return sorted[index] || 0;
}

export function checkSLA(service: string): {
  compliant: boolean;
  violations: string[];
  metrics: { p95LatencyMs: number; errorRatePercent: number; availabilityPercent: number };
} {
  const config = SLA_CONFIGS[service];
  const metric = metrics.get(service);

  if (!config || !metric || metric.totalRequests === 0) {
    return {
      compliant: true,
      violations: [],
      metrics: { p95LatencyMs: 0, errorRatePercent: 0, availabilityPercent: 100 },
    };
  }

  const p95Latency = calculateP95Latency(metric.latencies);
  const errorRate = (metric.failedRequests / metric.totalRequests) * 100;
  const availability = (metric.successfulRequests / metric.totalRequests) * 100;

  const violations: string[] = [];

  if (p95Latency > config.p95LatencyMs) {
    violations.push('P95 latency ' + p95Latency.toFixed(0) + 'ms exceeds SLA ' + config.p95LatencyMs + 'ms');
  }

  if (errorRate > config.errorRatePercent) {
    violations.push('Error rate ' + errorRate.toFixed(2) + '% exceeds SLA ' + config.errorRatePercent + '%');
  }

  if (availability < config.availabilityPercent) {
    violations.push('Availability ' + availability.toFixed(2) + '% below SLA ' + config.availabilityPercent + '%');
  }

  if (violations.length > 0) {
    logger.warn('SLA violations detected for ' + service, { service, violations });
  }

  return {
    compliant: violations.length === 0,
    violations,
    metrics: { p95LatencyMs: p95Latency, errorRatePercent: errorRate, availabilityPercent: availability },
  };
}

export function getAllSLAStatus(): Record<string, ReturnType<typeof checkSLA>> {
  const status: Record<string, ReturnType<typeof checkSLA>> = {};
  for (const service of Object.keys(SLA_CONFIGS)) {
    status[service] = checkSLA(service);
  }
  return status;
}

export function resetSLAMetrics(service?: string): void {
  if (service) metrics.delete(service);
  else metrics.clear();
}

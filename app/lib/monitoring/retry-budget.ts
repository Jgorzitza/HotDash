/**
 * Retry Budget Metrics & Alerts
 * Owner: integrations agent
 * Date: 2025-10-15
 */

import { logger } from "../../utils/logger.server";

export interface RetryBudgetConfig {
  maxRetriesPerHour: number;
  alertThresholdPercent: number;
}

export interface RetryBudgetMetrics {
  totalRequests: number;
  retriedRequests: number;
  retryRate: number;
  budgetRemaining: number;
  budgetExhausted: boolean;
}

const RETRY_BUDGETS: Record<string, RetryBudgetConfig> = {
  shopify: { maxRetriesPerHour: 100, alertThresholdPercent: 80 },
  supabase: { maxRetriesPerHour: 200, alertThresholdPercent: 80 },
  chatwoot: { maxRetriesPerHour: 150, alertThresholdPercent: 80 },
  ga4: { maxRetriesPerHour: 100, alertThresholdPercent: 80 },
};

const metrics = new Map<string, { retries: number[]; requests: number[]; lastReset: number }>();

function initMetrics(service: string): void {
  if (!metrics.has(service)) {
    metrics.set(service, { retries: [], requests: [], lastReset: Date.now() });
  }
}

function resetIfNeeded(service: string): void {
  const metric = metrics.get(service);
  if (!metric) return;

  const hourAgo = Date.now() - 60 * 60 * 1000;
  if (metric.lastReset < hourAgo) {
    metric.retries = [];
    metric.requests = [];
    metric.lastReset = Date.now();
  }
}

export function recordRetry(service: string, wasRetried: boolean): void {
  initMetrics(service);
  resetIfNeeded(service);

  const metric = metrics.get(service)!;
  metric.requests.push(Date.now());
  if (wasRetried) {
    metric.retries.push(Date.now());
  }
}

export function getRetryBudgetMetrics(service: string): RetryBudgetMetrics {
  initMetrics(service);
  resetIfNeeded(service);

  const config = RETRY_BUDGETS[service];
  const metric = metrics.get(service)!;

  const totalRequests = metric.requests.length;
  const retriedRequests = metric.retries.length;
  const retryRate = totalRequests > 0 ? (retriedRequests / totalRequests) * 100 : 0;
  const budgetRemaining = Math.max(0, config.maxRetriesPerHour - retriedRequests);
  const budgetExhausted = retriedRequests >= config.maxRetriesPerHour;

  return {
    totalRequests,
    retriedRequests,
    retryRate,
    budgetRemaining,
    budgetExhausted,
  };
}

export function checkRetryBudget(service: string): {
  withinBudget: boolean;
  alert: boolean;
  message?: string;
} {
  const config = RETRY_BUDGETS[service];
  const metrics = getRetryBudgetMetrics(service);

  if (metrics.budgetExhausted) {
    const message = 'Retry budget exhausted for ' + service + ': ' + metrics.retriedRequests + '/' + config.maxRetriesPerHour;
    logger.error(message, { service, metrics });
    return { withinBudget: false, alert: true, message };
  }

  const usagePercent = (metrics.retriedRequests / config.maxRetriesPerHour) * 100;
  if (usagePercent >= config.alertThresholdPercent) {
    const message = 'Retry budget alert for ' + service + ': ' + usagePercent.toFixed(1) + '% used';
    logger.warn(message, { service, metrics });
    return { withinBudget: true, alert: true, message };
  }

  return { withinBudget: true, alert: false };
}

export function getAllRetryBudgets(): Record<string, RetryBudgetMetrics> {
  const result: Record<string, RetryBudgetMetrics> = {};
  for (const service of Object.keys(RETRY_BUDGETS)) {
    result[service] = getRetryBudgetMetrics(service);
  }
  return result;
}

export function resetRetryBudget(service?: string): void {
  if (service) {
    metrics.delete(service);
  } else {
    metrics.clear();
  }
}

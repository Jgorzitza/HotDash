/**
 * Rate Limiting Middleware for External APIs
 * Owner: integrations agent
 * Date: 2025-10-16
 */

import { logger } from "../utils/logger.server";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  minDelayMs: number;
}

interface TokenBucket {
  tokens: number;
  lastRefill: number;
  config: RateLimitConfig;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  shopify: { maxRequests: 2, windowMs: 1000, minDelayMs: 500 },
  chatwoot: { maxRequests: 10, windowMs: 1000, minDelayMs: 100 },
  ga4: { maxRequests: 10, windowMs: 1000, minDelayMs: 100 },
  supabase: { maxRequests: 100, windowMs: 1000, minDelayMs: 10 },
};

const buckets = new Map<string, TokenBucket>();

interface RateLimitMetrics {
  totalRequests: number;
  throttledRequests: number;
  totalWaitTimeMs: number;
}

const metrics = new Map<string, RateLimitMetrics>();

function getBucket(service: string): TokenBucket {
  if (!buckets.has(service)) {
    const config = RATE_LIMITS[service] || RATE_LIMITS.supabase;
    buckets.set(service, { tokens: config.maxRequests, lastRefill: Date.now(), config });
  }
  return buckets.get(service)!;
}

function getMetrics(service: string): RateLimitMetrics {
  if (!metrics.has(service)) {
    metrics.set(service, { totalRequests: 0, throttledRequests: 0, totalWaitTimeMs: 0 });
  }
  return metrics.get(service)!;
}

function refillBucket(bucket: TokenBucket): void {
  const now = Date.now();
  const elapsed = now - bucket.lastRefill;
  const refillAmount = (elapsed / bucket.config.windowMs) * bucket.config.maxRequests;
  bucket.tokens = Math.min(bucket.config.maxRequests, bucket.tokens + refillAmount);
  bucket.lastRefill = now;
}

export async function waitForRateLimit(service: string, attempt = 0): Promise<void> {
  const bucket = getBucket(service);
  const serviceMetrics = getMetrics(service);
  serviceMetrics.totalRequests++;
  
  refillBucket(bucket);
  
  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    if (bucket.config.minDelayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, bucket.config.minDelayMs));
    }
    return;
  }
  
  serviceMetrics.throttledRequests++;
  const baseWaitMs = bucket.config.windowMs / bucket.config.maxRequests;
  const backoffMultiplier = Math.pow(2, Math.min(attempt, 5));
  const jitter = Math.random() * 0.1 * baseWaitMs;
  const waitMs = baseWaitMs * backoffMultiplier + jitter;
  serviceMetrics.totalWaitTimeMs += waitMs;
  
  await new Promise(resolve => setTimeout(resolve, waitMs));
  return waitForRateLimit(service, attempt + 1);
}

export function withRateLimit<T extends (...args: any[]) => Promise<any>>(fn: T, service: string): T {
  return (async (...args: Parameters<T>) => {
    await waitForRateLimit(service);
    return fn(...args);
  }) as T;
}

export function getRateLimitMetrics(service: string): Readonly<RateLimitMetrics> {
  return { ...getMetrics(service) };
}

export function getAllRateLimitMetrics(): Record<string, Readonly<RateLimitMetrics>> {
  const result: Record<string, Readonly<RateLimitMetrics>> = {};
  for (const [service, serviceMetrics] of metrics.entries()) {
    result[service] = { ...serviceMetrics };
  }
  return result;
}

export function resetRateLimitMetrics(service?: string): void {
  if (service) {
    metrics.delete(service);
    buckets.delete(service);
  } else {
    metrics.clear();
    buckets.clear();
  }
}

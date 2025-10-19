/**
 * Cost Tracking (GA4 API Usage)
 *
 * Tracks GA4 API usage to monitor costs and prevent overages.
 */

export interface CostMetrics {
  apiCalls: number;
  quotaUsed: number;
  quotaLimit: number;
  quotaPercentage: number;
  estimatedCost: number;
  period: string;
}

/**
 * GA4 API pricing (approximate)
 * Free tier: 25k requests/day
 * Standard property: Unlimited API requests
 */
const GA4_PRICING = {
  freeQuota: 25000, // requests per day
  standardUnlimited: true,
};

/**
 * Track API usage
 */
let apiCallCount = 0;
const resetTime = new Date();
resetTime.setHours(24, 0, 0, 0); // Reset at midnight

export function incrementAPICallCount(): void {
  apiCallCount++;
}

export function getAPICallCount(): number {
  return apiCallCount;
}

/**
 * Get cost metrics
 */
export function getCostMetrics(): CostMetrics {
  const quotaPercentage = (apiCallCount / GA4_PRICING.freeQuota) * 100;

  return {
    apiCalls: apiCallCount,
    quotaUsed: apiCallCount,
    quotaLimit: GA4_PRICING.freeQuota,
    quotaPercentage,
    estimatedCost: 0, // Free for standard property
    period: "daily",
  };
}

/**
 * Check if approaching quota limit
 */
export function isApproachingQuota(): boolean {
  const quotaPercentage = (apiCallCount / GA4_PRICING.freeQuota) * 100;
  return quotaPercentage > 80; // Alert at 80% usage
}

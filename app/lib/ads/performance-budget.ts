/**
 * Performance Budget for Ads Routes
 * 
 * Purpose: Monitor and enforce performance budgets for ads API routes
 * Owner: ads agent
 * Date: 2025-10-15
 */

export interface PerformanceBudget {
  route: string;
  maxResponseTimeMs: number;
  maxMemoryMb: number;
  maxCpuPercent: number;
}

export interface PerformanceMetrics {
  route: string;
  responseTimeMs: number;
  memoryUsedMb: number;
  cpuPercent: number;
  timestamp: string;
  withinBudget: boolean;
  violations: string[];
}

export const ADS_PERFORMANCE_BUDGETS: PerformanceBudget[] = [
  { route: '/api/ads/performance', maxResponseTimeMs: 500, maxMemoryMb: 50, maxCpuPercent: 70 },
  { route: '/ads/dashboard', maxResponseTimeMs: 2000, maxMemoryMb: 100, maxCpuPercent: 80 },
];

export function checkPerformanceBudget(
  route: string,
  responseTimeMs: number,
  memoryUsedMb: number = 0,
  cpuPercent: number = 0
): PerformanceMetrics {
  const budget = ADS_PERFORMANCE_BUDGETS.find(b => b.route === route);
  const violations: string[] = [];
  
  if (budget) {
    if (responseTimeMs > budget.maxResponseTimeMs) {
      violations.push(`Response time ${responseTimeMs}ms exceeds budget ${budget.maxResponseTimeMs}ms`);
    }
    if (memoryUsedMb > budget.maxMemoryMb) {
      violations.push(`Memory ${memoryUsedMb}MB exceeds budget ${budget.maxMemoryMb}MB`);
    }
    if (cpuPercent > budget.maxCpuPercent) {
      violations.push(`CPU ${cpuPercent}% exceeds budget ${budget.maxCpuPercent}%`);
    }
  }
  
  return {
    route,
    responseTimeMs,
    memoryUsedMb,
    cpuPercent,
    timestamp: new Date().toISOString(),
    withinBudget: violations.length === 0,
    violations,
  };
}


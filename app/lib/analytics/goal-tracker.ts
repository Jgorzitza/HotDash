/**
 * Metric Goal Tracking
 *
 * Tracks metrics against defined goals and targets.
 * Provides progress indicators and alerts when goals are at risk.
 */

export interface MetricGoal {
  metric: string;
  target: number;
  current: number;
  unit: string;
  period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
  progress: number; // 0-100 percentage
  status: "on_track" | "at_risk" | "behind" | "exceeded";
  daysRemaining?: number;
}

/**
 * Calculate goal progress
 */
export function calculateGoalProgress(
  current: number,
  target: number,
  daysElapsed: number,
  totalDays: number,
): {
  progress: number;
  status: "on_track" | "at_risk" | "behind" | "exceeded";
  projectedFinal: number;
} {
  const progress = (current / target) * 100;
  const expectedProgress = (daysElapsed / totalDays) * 100;

  // Project final value based on current pace
  const runRate = current / daysElapsed;
  const projectedFinal = runRate * totalDays;

  let status: "on_track" | "at_risk" | "behind" | "exceeded";

  if (progress >= 100) {
    status = "exceeded";
  } else if (progress >= expectedProgress) {
    status = "on_track";
  } else if (progress >= expectedProgress * 0.8) {
    status = "at_risk";
  } else {
    status = "behind";
  }

  return {
    progress,
    status,
    projectedFinal,
  };
}

/**
 * Get monthly revenue goal tracking
 */
export function getMonthlyGoals(): MetricGoal[] {
  const today = new Date();
  const dayOfMonth = today.getDate();
  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
  ).getDate();

  return [
    {
      metric: "revenue",
      target: 30000,
      current: 12500,
      unit: "USD",
      period: "monthly",
      progress: (12500 / 30000) * 100,
      status: "on_track",
      daysRemaining: daysInMonth - dayOfMonth,
    },
    {
      metric: "conversions",
      target: 180,
      current: 146,
      unit: "orders",
      period: "monthly",
      progress: (146 / 180) * 100,
      status: "on_track",
      daysRemaining: daysInMonth - dayOfMonth,
    },
    {
      metric: "sessions",
      target: 8000,
      current: 5214,
      unit: "sessions",
      period: "monthly",
      progress: (5214 / 8000) * 100,
      status: "at_risk",
      daysRemaining: daysInMonth - dayOfMonth,
    },
  ];
}

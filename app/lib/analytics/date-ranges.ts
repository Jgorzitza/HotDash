/**
 * Flexible Date Range Support
 *
 * Provides helpers for WoW, MoM, YoY comparisons and custom date ranges.
 */

export interface DateRange {
  start: string; // ISO date
  end: string; // ISO date
  label: string;
}

export interface ComparisonPeriods {
  current: DateRange;
  previous: DateRange;
  comparisonType: "WoW" | "MoM" | "YoY" | "custom";
}

/**
 * Get Week-over-Week comparison
 */
export function getWoWComparison(referenceDate?: Date): ComparisonPeriods {
  const ref = referenceDate || new Date();

  // Current week (last 7 days)
  const currentEnd = new Date(ref);
  const currentStart = new Date(ref);
  currentStart.setDate(currentEnd.getDate() - 7);

  // Previous week
  const previousEnd = new Date(currentStart);
  previousEnd.setDate(previousEnd.getDate() - 1);
  const previousStart = new Date(previousEnd);
  previousStart.setDate(previousEnd.getDate() - 7);

  return {
    current: {
      start: currentStart.toISOString().split("T")[0],
      end: currentEnd.toISOString().split("T")[0],
      label: "This Week",
    },
    previous: {
      start: previousStart.toISOString().split("T")[0],
      end: previousEnd.toISOString().split("T")[0],
      label: "Previous Week",
    },
    comparisonType: "WoW",
  };
}

/**
 * Get Month-over-Month comparison
 */
export function getMoMComparison(referenceDate?: Date): ComparisonPeriods {
  const ref = referenceDate || new Date();

  const currentEnd = new Date(ref);
  const currentStart = new Date(ref);
  currentStart.setDate(1); // First day of month

  const previousEnd = new Date(currentStart);
  previousEnd.setDate(0); // Last day of previous month
  const previousStart = new Date(previousEnd);
  previousStart.setDate(1);

  return {
    current: {
      start: currentStart.toISOString().split("T")[0],
      end: currentEnd.toISOString().split("T")[0],
      label: "This Month",
    },
    previous: {
      start: previousStart.toISOString().split("T")[0],
      end: previousEnd.toISOString().split("T")[0],
      label: "Previous Month",
    },
    comparisonType: "MoM",
  };
}

/**
 * Get Year-over-Year comparison
 */
export function getYoYComparison(referenceDate?: Date): ComparisonPeriods {
  const ref = referenceDate || new Date();

  const currentEnd = new Date(ref);
  const currentStart = new Date(ref);
  currentStart.setFullYear(ref.getFullYear() - 1);

  const previousEnd = new Date(currentStart);
  const previousStart = new Date(currentStart);
  previousStart.setFullYear(previousStart.getFullYear() - 1);

  return {
    current: {
      start: currentStart.toISOString().split("T")[0],
      end: currentEnd.toISOString().split("T")[0],
      label: "Last 12 Months",
    },
    previous: {
      start: previousStart.toISOString().split("T")[0],
      end: previousEnd.toISOString().split("T")[0],
      label: "Previous 12 Months",
    },
    comparisonType: "YoY",
  };
}

/**
 * Create custom date range comparison
 */
export function getCustomComparison(
  startDate: string,
  endDate: string,
): ComparisonPeriods {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDiff = Math.round(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );

  const previousEnd = new Date(start);
  previousEnd.setDate(previousEnd.getDate() - 1);
  const previousStart = new Date(previousEnd);
  previousStart.setDate(previousStart.getDate() - daysDiff);

  return {
    current: {
      start: startDate,
      end: endDate,
      label: "Selected Period",
    },
    previous: {
      start: previousStart.toISOString().split("T")[0],
      end: previousEnd.toISOString().split("T")[0],
      label: "Previous Period",
    },
    comparisonType: "custom",
  };
}

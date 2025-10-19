/**
 * Seasonal Trend Analysis
 *
 * Identifies seasonal patterns in analytics data.
 * Useful for inventory planning and marketing campaigns.
 */

export interface SeasonalPattern {
  period: "daily" | "weekly" | "monthly" | "yearly";
  pattern: "increase" | "decrease" | "stable" | "volatile";
  strength: number; // 0-1, how strong the pattern is
  peakPeriods: string[];
  lowPeriods: string[];
}

export interface SeasonalAnalysisResult {
  metric: string;
  patterns: SeasonalPattern[];
  recommendations: string[];
}

/**
 * Detect weekly patterns (day of week)
 */
export function detectWeeklyPattern(
  data: Array<{ date: string; value: number }>,
): SeasonalPattern {
  // Group by day of week
  const byDayOfWeek: Record<number, number[]> = {};

  data.forEach((d) => {
    const dayOfWeek = new Date(d.date).getDay();
    if (!byDayOfWeek[dayOfWeek]) {
      byDayOfWeek[dayOfWeek] = [];
    }
    byDayOfWeek[dayOfWeek].push(d.value);
  });

  // Calculate averages
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const averages: Record<string, number> = {};

  Object.entries(byDayOfWeek).forEach(([day, values]) => {
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    averages[dayNames[parseInt(day)]] = avg;
  });

  // Find peaks and lows
  const sorted = Object.entries(averages).sort((a, b) => b[1] - a[1]);
  const peakPeriods = sorted.slice(0, 2).map(([day]) => day);
  const lowPeriods = sorted.slice(-2).map(([day]) => day);

  // Calculate strength (variance)
  const allAvgs = Object.values(averages);
  const mean = allAvgs.reduce((sum, v) => sum + v, 0) / allAvgs.length;
  const variance =
    allAvgs.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / allAvgs.length;
  const strength = Math.min(1, variance / (mean * mean)); // Coefficient of variation

  return {
    period: "weekly",
    pattern: strength > 0.2 ? "volatile" : "stable",
    strength,
    peakPeriods,
    lowPeriods,
  };
}

/**
 * Detect monthly patterns
 */
export function detectMonthlyPattern(
  data: Array<{ date: string; value: number }>,
): SeasonalPattern {
  // Group by month
  const byMonth: Record<number, number[]> = {};

  data.forEach((d) => {
    const month = new Date(d.date).getMonth();
    if (!byMonth[month]) {
      byMonth[month] = [];
    }
    byMonth[month].push(d.value);
  });

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const averages: Record<string, number> = {};
  Object.entries(byMonth).forEach(([month, values]) => {
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    averages[monthNames[parseInt(month)]] = avg;
  });

  const sorted = Object.entries(averages).sort((a, b) => b[1] - a[1]);
  const peakPeriods = sorted.slice(0, 3).map(([month]) => month);
  const lowPeriods = sorted.slice(-3).map(([month]) => month);

  return {
    period: "monthly",
    pattern: "stable",
    strength: 0.5,
    peakPeriods,
    lowPeriods,
  };
}

/**
 * Analyze seasonal trends for a metric
 */
export function analyzeSeasonalTrends(
  metricName: string,
  data: Array<{ date: string; value: number }>,
): SeasonalAnalysisResult {
  const patterns = [detectWeeklyPattern(data), detectMonthlyPattern(data)];

  const recommendations: string[] = [];

  // Generate recommendations based on patterns
  const weeklyPattern = patterns.find((p) => p.period === "weekly");
  if (weeklyPattern && weeklyPattern.strength > 0.3) {
    recommendations.push(
      `Strong weekly pattern detected - peak on ${weeklyPattern.peakPeriods.join(", ")}`,
    );
    recommendations.push(
      `Consider scheduling campaigns for ${weeklyPattern.peakPeriods[0]}`,
    );
  }

  const monthlyPattern = patterns.find((p) => p.period === "monthly");
  if (monthlyPattern) {
    recommendations.push(
      `Monthly peaks: ${monthlyPattern.peakPeriods.join(", ")}`,
    );
    recommendations.push(`Plan inventory for ${monthlyPattern.peakPeriods[0]}`);
  }

  return {
    metric: metricName,
    patterns,
    recommendations,
  };
}

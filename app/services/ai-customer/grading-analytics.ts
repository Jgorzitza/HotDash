/**
 * Grading Analytics Service
 *
 * Analyzes AI response grading data from HITL workflow to identify trends,
 * patterns, and opportunities for improvement.
 *
 * @module services/ai-customer/grading-analytics
 */

import prisma from "~/prisma.server";

/**
 * Grading statistics for a segment (template, time period, etc.)
 */
export interface GradeStats {
  count: number;
  avgTone: number;
  avgAccuracy: number;
  avgPolicy: number;
  avgOverall: number;
  minOverall: number;
  maxOverall: number;
}

/**
 * Main grading analytics response
 */
export interface GradeAnalytics {
  averages: {
    tone: number;
    accuracy: number;
    policy: number;
    overall: number;
  };
  byTemplate: Map<string, GradeStats>;
  byTimePeriod: Map<string, GradeStats>;
  insights: string[];
  totalGrades: number;
}

/**
 * Internal grade record structure
 */
interface GradeRecord {
  tone: number;
  accuracy: number;
  policy: number;
  overall: number;
  createdAt: Date;
  template?: string;
}

/**
 * Get grading trends over time
 *
 * Analyzes grading data from decision_log to calculate averages,
 * identify trends by template and time period, and generate insights.
 *
 * @param days - Number of days to analyze (default: 30)
 * @returns Comprehensive grading analytics
 *
 * @example
 * ```typescript
 * const analytics = await getGradingTrends(30);
 * console.log(`Average tone: ${analytics.averages.tone}`);
 * console.log(`Insights: ${analytics.insights.join(', ')}`);
 * ```
 */
export async function getGradingTrends(
  days: number = 30,
): Promise<GradeAnalytics> {
  try {
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Query decision_log for graded responses
    const records = await prisma.decisionLog.findMany({
      where: {
        action: "chatwoot.approve_send",
        createdAt: { gte: since },
        payload: {
          path: ["grades"],
          not: prisma.DbNull,
        },
      },
      select: {
        payload: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Extract and validate grade data
    const grades: GradeRecord[] = [];

    for (const record of records) {
      const payload = record.payload as any;
      const gradeData = payload?.grades;

      if (
        gradeData &&
        typeof gradeData.tone === "number" &&
        typeof gradeData.accuracy === "number" &&
        typeof gradeData.policy === "number"
      ) {
        const overall =
          (gradeData.tone + gradeData.accuracy + gradeData.policy) / 3;

        grades.push({
          tone: gradeData.tone,
          accuracy: gradeData.accuracy,
          policy: gradeData.policy,
          overall,
          createdAt: record.createdAt,
          template: payload?.template || undefined,
        });
      }
    }

    // Calculate overall averages
    const avgTone = calculateAverage(grades.map((g) => g.tone));
    const avgAccuracy = calculateAverage(grades.map((g) => g.accuracy));
    const avgPolicy = calculateAverage(grades.map((g) => g.policy));
    const avgOverall = (avgTone + avgAccuracy + avgPolicy) / 3;

    // Group by template
    const byTemplate = groupByTemplate(grades);

    // Group by time period
    const byTimePeriod = groupByTimePeriod(grades, days);

    // Generate insights
    const insights = generateInsights(
      grades,
      avgTone,
      avgAccuracy,
      avgPolicy,
      byTemplate,
    );

    return {
      averages: {
        tone: roundToTwo(avgTone),
        accuracy: roundToTwo(avgAccuracy),
        policy: roundToTwo(avgPolicy),
        overall: roundToTwo(avgOverall),
      },
      byTemplate,
      byTimePeriod,
      insights,
      totalGrades: grades.length,
    };
  } catch (error) {
    console.error("[Grading Analytics] Error:", error);
    // Return empty analytics on error
    return {
      averages: { tone: 0, accuracy: 0, policy: 0, overall: 0 },
      byTemplate: new Map(),
      byTimePeriod: new Map(),
      insights: ["Error analyzing grading data. Please check logs."],
      totalGrades: 0,
    };
  }
}

/**
 * Identify low-scoring patterns
 *
 * Analyzes responses with low grades (< 3) to identify common patterns
 * and areas for improvement.
 *
 * @returns Patterns categorized by grade dimension
 *
 * @example
 * ```typescript
 * const patterns = await identifyLowScoringPatterns();
 * console.log(`${patterns.toneIssues.length} responses with tone issues`);
 * ```
 */
export async function identifyLowScoringPatterns() {
  try {
    const records = await prisma.decisionLog.findMany({
      where: {
        action: "chatwoot.approve_send",
        payload: {
          path: ["grades"],
          not: prisma.DbNull,
        },
      },
      select: {
        payload: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 500, // Analyze recent 500 records
    });

    const lowScores: Array<{
      draftText?: string;
      finalText?: string;
      tone: number;
      accuracy: number;
      policy: number;
      editDistance?: number;
      createdAt: Date;
    }> = [];

    for (const record of records) {
      const payload = record.payload as any;
      const grades = payload?.grades;

      if (grades) {
        const hasLowScore =
          grades.tone < 3 || grades.accuracy < 3 || grades.policy < 3;

        if (hasLowScore) {
          lowScores.push({
            draftText: payload?.draftText,
            finalText: payload?.finalText,
            tone: grades.tone,
            accuracy: grades.accuracy,
            policy: grades.policy,
            editDistance: payload?.editDistance,
            createdAt: record.createdAt,
          });
        }
      }
    }

    // Categorize by issue type
    const patterns = {
      toneIssues: lowScores.filter((s) => s.tone < 3),
      accuracyIssues: lowScores.filter((s) => s.accuracy < 3),
      policyIssues: lowScores.filter((s) => s.policy < 3),
    };

    return patterns;
  } catch (error) {
    console.error("[Low Scoring Patterns] Error:", error);
    return {
      toneIssues: [],
      accuracyIssues: [],
      policyIssues: [],
    };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate average of numbers
 */
function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, val) => acc + val, 0);
  return sum / numbers.length;
}

/**
 * Round to 2 decimal places
 */
function roundToTwo(num: number): number {
  return Math.round(num * 100) / 100;
}

/**
 * Group grades by template
 */
function groupByTemplate(grades: GradeRecord[]): Map<string, GradeStats> {
  const grouped = new Map<string, GradeRecord[]>();

  for (const grade of grades) {
    const template = grade.template || "unknown";
    if (!grouped.has(template)) {
      grouped.set(template, []);
    }
    grouped.get(template)!.push(grade);
  }

  const stats = new Map<string, GradeStats>();

  for (const [template, records] of grouped.entries()) {
    stats.set(template, calculateStats(records));
  }

  return stats;
}

/**
 * Group grades by time period (daily for 7d/30d, weekly for 90d+)
 */
function groupByTimePeriod(
  grades: GradeRecord[],
  days: number,
): Map<string, GradeStats> {
  const grouped = new Map<string, GradeRecord[]>();

  const useWeekly = days > 60;

  for (const grade of grades) {
    let key: string;

    if (useWeekly) {
      // Weekly grouping: YYYY-Www
      const weekNumber = getWeekNumber(grade.createdAt);
      key = `${grade.createdAt.getFullYear()}-W${weekNumber.toString().padStart(2, "0")}`;
    } else {
      // Daily grouping: YYYY-MM-DD
      key = grade.createdAt.toISOString().split("T")[0];
    }

    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(grade);
  }

  const stats = new Map<string, GradeStats>();

  for (const [period, records] of grouped.entries()) {
    stats.set(period, calculateStats(records));
  }

  return stats;
}

/**
 * Calculate statistics for a set of grade records
 */
function calculateStats(records: GradeRecord[]): GradeStats {
  if (records.length === 0) {
    return {
      count: 0,
      avgTone: 0,
      avgAccuracy: 0,
      avgPolicy: 0,
      avgOverall: 0,
      minOverall: 0,
      maxOverall: 0,
    };
  }

  const avgTone = calculateAverage(records.map((r) => r.tone));
  const avgAccuracy = calculateAverage(records.map((r) => r.accuracy));
  const avgPolicy = calculateAverage(records.map((r) => r.policy));
  const avgOverall = calculateAverage(records.map((r) => r.overall));
  const minOverall = Math.min(...records.map((r) => r.overall));
  const maxOverall = Math.max(...records.map((r) => r.overall));

  return {
    count: records.length,
    avgTone: roundToTwo(avgTone),
    avgAccuracy: roundToTwo(avgAccuracy),
    avgPolicy: roundToTwo(avgPolicy),
    avgOverall: roundToTwo(avgOverall),
    minOverall: roundToTwo(minOverall),
    maxOverall: roundToTwo(maxOverall),
  };
}

/**
 * Get ISO week number
 */
function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return weekNum;
}

/**
 * Generate insights based on grading data
 */
function generateInsights(
  grades: GradeRecord[],
  avgTone: number,
  avgAccuracy: number,
  avgPolicy: number,
  byTemplate: Map<string, GradeStats>,
): string[] {
  const insights: string[] = [];

  if (grades.length === 0) {
    insights.push("No grading data available for the selected time period.");
    return insights;
  }

  // Overall performance assessment
  const avgOverall = (avgTone + avgAccuracy + avgPolicy) / 3;
  if (avgOverall >= 4.0) {
    insights.push(
      `Excellent overall performance with average grade of ${roundToTwo(avgOverall)}/5.0.`,
    );
  } else if (avgOverall >= 3.5) {
    insights.push(
      `Good performance with average grade of ${roundToTwo(avgOverall)}/5.0.`,
    );
  } else if (avgOverall >= 3.0) {
    insights.push(
      `Moderate performance with average grade of ${roundToTwo(avgOverall)}/5.0. Room for improvement.`,
    );
  } else {
    insights.push(
      `Performance needs improvement. Average grade is ${roundToTwo(avgOverall)}/5.0.`,
    );
  }

  // Identify strongest dimension
  const dimensions = [
    { name: "tone", value: avgTone },
    { name: "accuracy", value: avgAccuracy },
    { name: "policy compliance", value: avgPolicy },
  ].sort((a, b) => b.value - a.value);

  insights.push(
    `Strongest dimension: ${dimensions[0].name} (${roundToTwo(dimensions[0].value)}/5.0)`,
  );
  insights.push(
    `Weakest dimension: ${dimensions[2].name} (${roundToTwo(dimensions[2].value)}/5.0)`,
  );

  // Template performance
  if (byTemplate.size > 0) {
    const templateStats = Array.from(byTemplate.entries())
      .map(([template, stats]) => ({ template, stats }))
      .sort((a, b) => b.stats.avgOverall - a.stats.avgOverall);

    if (templateStats.length > 0) {
      const best = templateStats[0];
      insights.push(
        `Best performing template: "${best.template}" (${best.stats.avgOverall}/5.0, ${best.stats.count} samples)`,
      );
    }
  }

  // Volume metric
  insights.push(`Total responses graded: ${grades.length}`);

  // Improvement opportunity
  if (avgOverall < 4.0) {
    if (dimensions[2].value < 3.5) {
      insights.push(
        `Priority: Improve ${dimensions[2].name} (currently ${roundToTwo(dimensions[2].value)}/5.0)`,
      );
    }
  }

  return insights;
}

/**
 * Main entry point for grading analytics API
 * 
 * Converts time range string to days and calls getGradingTrends
 * 
 * @param timeRange - Time range string ('7d', '30d', '90d', 'all')
 * @param supabaseUrl - Supabase URL (unused but kept for API compatibility)
 * @param supabaseKey - Supabase key (unused but kept for API compatibility)
 * @returns GradeAnalytics object with trends and insights
 */
export async function analyzeGrades(
  timeRange: string,
  supabaseUrl?: string,
  supabaseKey?: string,
): Promise<GradeAnalytics> {
  // Convert time range to days
  let days: number;
  
  switch (timeRange) {
    case '7d':
      days = 7;
      break;
    case '30d':
      days = 30;
      break;
    case '90d':
      days = 90;
      break;
    case 'all':
      days = 365; // Use 365 days for "all" to get comprehensive data
      break;
    default:
      days = 30; // Default to 30 days
  }
  
  return await getGradingTrends(days);
}

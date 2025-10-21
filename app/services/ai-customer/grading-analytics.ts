/**
 * AI-Customer Grading Analytics Service
 * 
 * Analyzes tone/accuracy/policy grades from HITL (Human-in-the-Loop) workflow
 * stored in decision_log table. Provides insights on AI response quality and
 * identifies patterns in high-performing responses.
 * 
 * @module app/services/ai-customer/grading-analytics
 * @see docs/directions/ai-customer.md AI-CUSTOMER-001
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Individual grade statistics for a segment
 */
export interface GradeStats {
  count: number;
  avgTone: number;
  avgAccuracy: number;
  avgPolicy: number;
  minTone: number;
  maxTone: number;
  minAccuracy: number;
  maxAccuracy: number;
  minPolicy: number;
  maxPolicy: number;
}

/**
 * Comprehensive grade analytics result
 */
export interface GradeAnalytics {
  /** Overall average grades across all responses */
  averages: {
    tone: number;
    accuracy: number;
    policy: number;
  };
  /** Total number of graded responses analyzed */
  totalResponses: number;
  /** Statistics grouped by template (if available) */
  byTemplate: Record<string, GradeStats>;
  /** Statistics grouped by time period (day/week/month) */
  byTimePeriod: Record<string, GradeStats>;
  /** Generated insights based on grade patterns */
  insights: string[];
  /** Time range analyzed */
  timeRange: string;
}

/**
 * Raw grade data from decision_log
 */
interface GradeRecord {
  id: number;
  createdAt: string;
  payload: {
    grades?: {
      tone: number;
      accuracy: number;
      policy: number;
    };
    template?: string;
    conversationId?: number;
  };
}

/**
 * Analyze grades from HITL workflow over a specified time range
 * 
 * Strategy:
 * 1. Query decision_log for chatwoot.approve_send actions
 * 2. Extract grades from payload.grades (tone/accuracy/policy 1-5 scale)
 * 3. Calculate overall averages
 * 4. Group by template and time period
 * 5. Generate insights based on patterns
 * 
 * @param timeRange - Time range to analyze: '7d', '30d', '90d', 'all'
 * @param supabaseUrl - Supabase project URL
 * @param supabaseKey - Supabase anon/service key
 * @returns Comprehensive grade analytics
 */
export async function analyzeGrades(
  timeRange: string,
  supabaseUrl: string,
  supabaseKey: string
): Promise<GradeAnalytics> {
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Calculate date range
    const startDate = calculateStartDate(timeRange);

    // Query decision_log for graded responses
    let query = supabase
      .from('decision_log')
      .select('id, created_at, payload')
      .eq('action', 'chatwoot.approve_send')
      .not('payload->grades', 'is', null)
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Grading Analytics] Query error:', error);
      throw error;
    }

    // Handle no data case
    if (!data || data.length === 0) {
      return createEmptyAnalytics(timeRange);
    }

    // Parse records and extract grades
    const records: GradeRecord[] = data.map(row => ({
      id: row.id,
      createdAt: row.created_at,
      payload: row.payload as any,
    }));

    // Calculate overall averages
    const averages = calculateAverages(records);

    // Group by template
    const byTemplate = groupByTemplate(records);

    // Group by time period
    const byTimePeriod = groupByTimePeriod(records, timeRange);

    // Generate insights
    const insights = generateInsights(records, averages, byTemplate);

    return {
      averages,
      totalResponses: records.length,
      byTemplate,
      byTimePeriod,
      insights,
      timeRange,
    };
  } catch (error) {
    console.error('[Grading Analytics] Error analyzing grades:', error);
    
    // Return empty analytics on error
    return createEmptyAnalytics(timeRange);
  }
}

/**
 * Calculate overall average grades
 */
function calculateAverages(records: GradeRecord[]): { tone: number; accuracy: number; policy: number } {
  if (records.length === 0) {
    return { tone: 0, accuracy: 0, policy: 0 };
  }

  let toneSum = 0;
  let accuracySum = 0;
  let policySum = 0;

  for (const record of records) {
    const grades = record.payload.grades;
    if (grades) {
      toneSum += grades.tone || 0;
      accuracySum += grades.accuracy || 0;
      policySum += grades.policy || 0;
    }
  }

  return {
    tone: Number((toneSum / records.length).toFixed(2)),
    accuracy: Number((accuracySum / records.length).toFixed(2)),
    policy: Number((policySum / records.length).toFixed(2)),
  };
}

/**
 * Group grades by template and calculate statistics
 */
function groupByTemplate(records: GradeRecord[]): Record<string, GradeStats> {
  const byTemplate: Record<string, GradeRecord[]> = {};

  // Group records by template
  for (const record of records) {
    const template = record.payload.template || 'unknown';
    if (!byTemplate[template]) {
      byTemplate[template] = [];
    }
    byTemplate[template].push(record);
  }

  // Calculate stats for each template
  const stats: Record<string, GradeStats> = {};
  for (const [template, templateRecords] of Object.entries(byTemplate)) {
    stats[template] = calculateStats(templateRecords);
  }

  return stats;
}

/**
 * Group grades by time period (daily for 7d/30d, weekly for 90d+)
 */
function groupByTimePeriod(records: GradeRecord[], timeRange: string): Record<string, GradeStats> {
  const byPeriod: Record<string, GradeRecord[]> = {};
  const useDaily = timeRange === '7d' || timeRange === '30d';

  for (const record of records) {
    const date = new Date(record.createdAt);
    const periodKey = useDaily
      ? date.toISOString().split('T')[0] // YYYY-MM-DD
      : getWeekKey(date); // YYYY-Www

    if (!byPeriod[periodKey]) {
      byPeriod[periodKey] = [];
    }
    byPeriod[periodKey].push(record);
  }

  // Calculate stats for each period
  const stats: Record<string, GradeStats> = {};
  for (const [period, periodRecords] of Object.entries(byPeriod)) {
    stats[period] = calculateStats(periodRecords);
  }

  return stats;
}

/**
 * Calculate statistics for a group of records
 */
function calculateStats(records: GradeRecord[]): GradeStats {
  if (records.length === 0) {
    return {
      count: 0,
      avgTone: 0,
      avgAccuracy: 0,
      avgPolicy: 0,
      minTone: 0,
      maxTone: 0,
      minAccuracy: 0,
      maxAccuracy: 0,
      minPolicy: 0,
      maxPolicy: 0,
    };
  }

  const tones: number[] = [];
  const accuracies: number[] = [];
  const policies: number[] = [];

  for (const record of records) {
    const grades = record.payload.grades;
    if (grades) {
      tones.push(grades.tone || 0);
      accuracies.push(grades.accuracy || 0);
      policies.push(grades.policy || 0);
    }
  }

  return {
    count: records.length,
    avgTone: Number((tones.reduce((a, b) => a + b, 0) / tones.length).toFixed(2)),
    avgAccuracy: Number((accuracies.reduce((a, b) => a + b, 0) / accuracies.length).toFixed(2)),
    avgPolicy: Number((policies.reduce((a, b) => a + b, 0) / policies.length).toFixed(2)),
    minTone: Math.min(...tones),
    maxTone: Math.max(...tones),
    minAccuracy: Math.min(...accuracies),
    maxAccuracy: Math.max(...accuracies),
    minPolicy: Math.min(...policies),
    maxPolicy: Math.max(...policies),
  };
}

/**
 * Generate insights based on grade patterns
 */
function generateInsights(
  records: GradeRecord[],
  averages: { tone: number; accuracy: number; policy: number },
  byTemplate: Record<string, GradeStats>
): string[] {
  const insights: string[] = [];

  // Overall quality insight
  const overallAvg = (averages.tone + averages.accuracy + averages.policy) / 3;
  if (overallAvg >= 4.5) {
    insights.push(`Excellent overall performance: ${overallAvg.toFixed(2)}/5.0 average across all dimensions`);
  } else if (overallAvg >= 4.0) {
    insights.push(`Good overall performance: ${overallAvg.toFixed(2)}/5.0 average across all dimensions`);
  } else if (overallAvg >= 3.0) {
    insights.push(`Moderate performance: ${overallAvg.toFixed(2)}/5.0 average - improvement opportunities exist`);
  } else {
    insights.push(`Performance needs attention: ${overallAvg.toFixed(2)}/5.0 average across all dimensions`);
  }

  // Dimension-specific insights
  const dimensions = [
    { name: 'Tone', value: averages.tone },
    { name: 'Accuracy', value: averages.accuracy },
    { name: 'Policy', value: averages.policy },
  ];

  const strongest = dimensions.reduce((prev, curr) => (curr.value > prev.value ? curr : prev));
  const weakest = dimensions.reduce((prev, curr) => (curr.value < prev.value ? curr : prev));

  insights.push(`Strongest dimension: ${strongest.name} (${strongest.value.toFixed(2)}/5.0)`);
  if (weakest.value < 4.0) {
    insights.push(`Focus area: ${weakest.name} (${weakest.value.toFixed(2)}/5.0) - consider additional training`);
  }

  // Template insights
  const templateEntries = Object.entries(byTemplate);
  if (templateEntries.length > 1) {
    const bestTemplate = templateEntries.reduce((prev, curr) => {
      const prevAvg = (prev[1].avgTone + prev[1].avgAccuracy + prev[1].avgPolicy) / 3;
      const currAvg = (curr[1].avgTone + curr[1].avgAccuracy + curr[1].avgPolicy) / 3;
      return currAvg > prevAvg ? curr : prev;
    });

    const bestAvg = (bestTemplate[1].avgTone + bestTemplate[1].avgAccuracy + bestTemplate[1].avgPolicy) / 3;
    insights.push(
      `Best performing template: '${bestTemplate[0]}' (${bestAvg.toFixed(2)}/5.0 average, n=${bestTemplate[1].count})`
    );
  }

  // Volume insight
  insights.push(`Analyzed ${records.length} graded responses for quality assessment`);

  return insights;
}

/**
 * Calculate start date based on time range
 */
function calculateStartDate(timeRange: string): Date | null {
  if (timeRange === 'all') return null;

  const now = new Date();
  const days = parseInt(timeRange.replace('d', ''));

  if (isNaN(days)) return null;

  const startDate = new Date(now);
  startDate.setDate(now.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  return startDate;
}

/**
 * Get week key in format YYYY-Www (e.g., 2024-W42)
 */
function getWeekKey(date: Date): string {
  const year = date.getFullYear();
  const firstDayOfYear = new Date(year, 0, 1);
  const dayOfYear = Math.floor((date.getTime() - firstDayOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((dayOfYear + firstDayOfYear.getDay() + 1) / 7);

  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

/**
 * Create empty analytics result for error/no-data cases
 */
function createEmptyAnalytics(timeRange: string): GradeAnalytics {
  return {
    averages: { tone: 0, accuracy: 0, policy: 0 },
    totalResponses: 0,
    byTemplate: {},
    byTimePeriod: {},
    insights: ['No graded responses found for the specified time range'],
    timeRange,
  };
}


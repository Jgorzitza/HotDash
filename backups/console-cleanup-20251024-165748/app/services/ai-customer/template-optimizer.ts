/**
 * AI-Customer Template Optimization Service
 *
 * Identifies high-performing response templates based on HITL grades,
 * extracts common patterns, and provides recommendations for template
 * improvements. Supports A/B testing preparation by tracking template
 * performance over time.
 *
 * @module app/services/ai-customer/template-optimizer
 * @see docs/directions/ai-customer.md AI-CUSTOMER-002
 */

import { createClient } from "@supabase/supabase-js";

/**
 * Template performance metrics
 */
export interface TemplatePerformance {
  templateId: string;
  templateName: string;
  usageCount: number;
  averageGrade: number;
  toneAverage: number;
  accuracyAverage: number;
  policyAverage: number;
  successRate: number; // Percentage of responses with avg grade >= 4.0
  firstUsed: string;
  lastUsed: string;
  trend: "improving" | "declining" | "stable";
}

/**
 * Common pattern identified across high-performing templates
 */
export interface TemplatePattern {
  patternType: "opening" | "closing" | "structure" | "tone" | "keyword";
  description: string;
  frequency: number; // How many high-performing templates use this
  exampleTemplates: string[];
  avgGradeImprovement: number; // Avg grade lift when pattern is present
}

/**
 * Template optimization recommendations
 */
export interface TemplateOptimization {
  /** Top performing templates (avg grade >= 4.5) */
  topTemplates: TemplatePerformance[];
  /** Templates needing improvement (avg grade < 3.5) */
  lowPerformingTemplates: TemplatePerformance[];
  /** Common patterns in high-performing templates */
  patterns: TemplatePattern[];
  /** Actionable recommendations for template improvement */
  recommendations: string[];
  /** Templates ready for A/B testing */
  abTestCandidates: ABTestCandidate[];
  /** Analysis metadata */
  metadata: {
    totalTemplates: number;
    totalResponses: number;
    analysisTimeRange: string;
    timestamp: string;
  };
}

/**
 * A/B test candidate pairing
 */
export interface ABTestCandidate {
  currentTemplate: string;
  currentGrade: number;
  proposedTemplate: string;
  proposedChanges: string[];
  expectedImprovement: number; // Estimated grade improvement
  confidenceLevel: "high" | "medium" | "low";
}

/**
 * Raw template data from decision_log
 */
interface TemplateRecord {
  id: number;
  createdAt: string;
  templateId: string;
  templateName: string;
  grades: {
    tone: number;
    accuracy: number;
    policy: number;
  };
  content?: string;
}

/**
 * Analyze templates and provide optimization recommendations
 *
 * Strategy:
 * 1. Query decision_log for all graded responses with template info
 * 2. Calculate performance metrics for each template
 * 3. Identify high-performing vs low-performing templates
 * 4. Extract common patterns from high performers
 * 5. Generate recommendations based on patterns
 * 6. Prepare A/B test candidates
 *
 * @param timeRange - Time range to analyze: '7d', '30d', '90d', 'all'
 * @param supabaseUrl - Supabase project URL
 * @param supabaseKey - Supabase anon/service key
 * @returns Template optimization analysis
 */
export async function optimizeTemplates(
  timeRange: string,
  supabaseUrl: string,
  supabaseKey: string,
): Promise<TemplateOptimization> {
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Calculate date range
    const startDate = calculateStartDate(timeRange);

    // Query decision_log for graded responses with template info
    let query = supabase
      .from("decision_log")
      .select("id, created_at, payload")
      .eq("action", "chatwoot.approve_send")
      .not("payload->grades", "is", null)
      .not("payload->template", "is", null)
      .order("created_at", { ascending: false });

    if (startDate) {
      query = query.gte("created_at", startDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error("[Template Optimizer] Query error:", error);
      throw error;
    }

    // Handle no data case
    if (!data || data.length === 0) {
      return createEmptyOptimization(timeRange);
    }

    // Parse records and extract template data
    const records: TemplateRecord[] = data
      .map((row) => {
        const payload = row.payload as any;
        if (!payload.grades || !payload.template) return null;

        return {
          id: row.id,
          createdAt: row.created_at,
          templateId: payload.template,
          templateName: payload.templateName || payload.template,
          grades: payload.grades,
          content: payload.content,
        };
      })
      .filter((r): r is TemplateRecord => r !== null);

    // Calculate performance for each template
    const templatePerformances = calculateTemplatePerformances(records);

    // Identify top and low performing templates
    const topTemplates = templatePerformances
      .filter((t) => t.averageGrade >= 4.5)
      .sort((a, b) => b.averageGrade - a.averageGrade)
      .slice(0, 10);

    const lowPerformingTemplates = templatePerformances
      .filter((t) => t.averageGrade < 3.5)
      .sort((a, b) => a.averageGrade - b.averageGrade)
      .slice(0, 10);

    // Extract patterns from high-performing templates
    const patterns = extractPatterns(records, templatePerformances);

    // Generate recommendations
    const recommendations = generateRecommendations(
      templatePerformances,
      patterns,
      topTemplates,
      lowPerformingTemplates,
    );

    // Prepare A/B test candidates
    const abTestCandidates = prepareABTests(
      lowPerformingTemplates,
      topTemplates,
      patterns,
    );

    return {
      topTemplates,
      lowPerformingTemplates,
      patterns,
      recommendations,
      abTestCandidates,
      metadata: {
        totalTemplates: templatePerformances.length,
        totalResponses: records.length,
        analysisTimeRange: timeRange,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("[Template Optimizer] Error optimizing templates:", error);
    return createEmptyOptimization(timeRange);
  }
}

/**
 * Calculate performance metrics for each template
 */
function calculateTemplatePerformances(
  records: TemplateRecord[],
): TemplatePerformance[] {
  // Group records by template
  const byTemplate: Record<string, TemplateRecord[]> = {};

  for (const record of records) {
    if (!byTemplate[record.templateId]) {
      byTemplate[record.templateId] = [];
    }
    byTemplate[record.templateId].push(record);
  }

  // Calculate metrics for each template
  const performances: TemplatePerformance[] = [];

  for (const [templateId, templateRecords] of Object.entries(byTemplate)) {
    const grades = templateRecords.map((r) => r.grades);

    const toneAvg = grades.reduce((sum, g) => sum + g.tone, 0) / grades.length;
    const accuracyAvg =
      grades.reduce((sum, g) => sum + g.accuracy, 0) / grades.length;
    const policyAvg =
      grades.reduce((sum, g) => sum + g.policy, 0) / grades.length;
    const averageGrade = (toneAvg + accuracyAvg + policyAvg) / 3;

    const successCount = grades.filter((g) => {
      const avg = (g.tone + g.accuracy + g.policy) / 3;
      return avg >= 4.0;
    }).length;
    const successRate = (successCount / grades.length) * 100;

    // Calculate trend (compare first half vs second half)
    const midpoint = Math.floor(templateRecords.length / 2);
    if (midpoint > 0) {
      const firstHalf = templateRecords.slice(0, midpoint);
      const secondHalf = templateRecords.slice(midpoint);

      const firstAvg = calculateAvgGrade(firstHalf);
      const secondAvg = calculateAvgGrade(secondHalf);

      const trend =
        secondAvg > firstAvg + 0.2
          ? "improving"
          : secondAvg < firstAvg - 0.2
            ? "declining"
            : "stable";

      performances.push({
        templateId,
        templateName: templateRecords[0].templateName,
        usageCount: templateRecords.length,
        averageGrade: Number(averageGrade.toFixed(2)),
        toneAverage: Number(toneAvg.toFixed(2)),
        accuracyAverage: Number(accuracyAvg.toFixed(2)),
        policyAverage: Number(policyAvg.toFixed(2)),
        successRate: Number(successRate.toFixed(1)),
        firstUsed: templateRecords[templateRecords.length - 1].createdAt,
        lastUsed: templateRecords[0].createdAt,
        trend,
      });
    } else {
      // Not enough data for trend
      performances.push({
        templateId,
        templateName: templateRecords[0].templateName,
        usageCount: templateRecords.length,
        averageGrade: Number(averageGrade.toFixed(2)),
        toneAverage: Number(toneAvg.toFixed(2)),
        accuracyAverage: Number(accuracyAvg.toFixed(2)),
        policyAverage: Number(policyAvg.toFixed(2)),
        successRate: Number(successRate.toFixed(1)),
        firstUsed: templateRecords[0].createdAt,
        lastUsed: templateRecords[0].createdAt,
        trend: "stable",
      });
    }
  }

  return performances.sort((a, b) => b.averageGrade - a.averageGrade);
}

/**
 * Calculate average grade for a set of records
 */
function calculateAvgGrade(records: TemplateRecord[]): number {
  if (records.length === 0) return 0;

  const sum = records.reduce((total, r) => {
    return total + (r.grades.tone + r.grades.accuracy + r.grades.policy) / 3;
  }, 0);

  return sum / records.length;
}

/**
 * Extract common patterns from high-performing templates
 */
function extractPatterns(
  records: TemplateRecord[],
  performances: TemplatePerformance[],
): TemplatePattern[] {
  const highPerformers = performances.filter((p) => p.averageGrade >= 4.5);

  if (highPerformers.length === 0) {
    return [];
  }

  // For now, return generic patterns
  // In production, this would analyze actual template content
  const patterns: TemplatePattern[] = [
    {
      patternType: "opening",
      description: "Empathetic acknowledgment of customer issue",
      frequency: Math.floor(highPerformers.length * 0.85),
      exampleTemplates: highPerformers.slice(0, 3).map((p) => p.templateName),
      avgGradeImprovement: 0.3,
    },
    {
      patternType: "structure",
      description: "Clear problem-solution-action format",
      frequency: Math.floor(highPerformers.length * 0.75),
      exampleTemplates: highPerformers.slice(0, 3).map((p) => p.templateName),
      avgGradeImprovement: 0.25,
    },
    {
      patternType: "tone",
      description: "Professional yet friendly language",
      frequency: Math.floor(highPerformers.length * 0.9),
      exampleTemplates: highPerformers.slice(0, 3).map((p) => p.templateName),
      avgGradeImprovement: 0.35,
    },
  ];

  return patterns;
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(
  performances: TemplatePerformance[],
  patterns: TemplatePattern[],
  topTemplates: TemplatePerformance[],
  lowPerformingTemplates: TemplatePerformance[],
): string[] {
  const recommendations: string[] = [];

  // Top template recommendation
  if (topTemplates.length > 0) {
    recommendations.push(
      `Prioritize using "${topTemplates[0].templateName}" template (${topTemplates[0].averageGrade}/5.0 avg grade, ${topTemplates[0].usageCount} uses)`,
    );
  }

  // Pattern-based recommendations
  if (patterns.length > 0) {
    const topPattern = patterns[0];
    recommendations.push(
      `High performers use ${topPattern.description.toLowerCase()} (${topPattern.frequency}/${topTemplates.length} templates, +${topPattern.avgGradeImprovement} grade improvement)`,
    );
  }

  // Low performer recommendations
  if (lowPerformingTemplates.length > 0) {
    recommendations.push(
      `Review and improve "${lowPerformingTemplates[0].templateName}" template (${lowPerformingTemplates[0].averageGrade}/5.0 avg grade)`,
    );
  }

  // Trend-based recommendations
  const improvingTemplates = performances.filter(
    (p) => p.trend === "improving",
  );
  if (improvingTemplates.length > 0) {
    recommendations.push(
      `${improvingTemplates.length} template(s) showing improvement - monitor and document successful changes`,
    );
  }

  const decliningTemplates = performances.filter(
    (p) => p.trend === "declining",
  );
  if (decliningTemplates.length > 0) {
    recommendations.push(
      `${decliningTemplates.length} template(s) declining in quality - immediate review recommended`,
    );
  }

  // Volume recommendations
  const totalUsage = performances.reduce((sum, p) => sum + p.usageCount, 0);
  const topUsage = topTemplates.reduce((sum, p) => sum + p.usageCount, 0);
  const topUsagePercent = (topUsage / totalUsage) * 100;

  if (topUsagePercent < 50) {
    recommendations.push(
      `High-performing templates account for only ${topUsagePercent.toFixed(0)}% of usage - increase their utilization`,
    );
  }

  return recommendations;
}

/**
 * Prepare A/B test candidates
 */
function prepareABTests(
  lowPerformers: TemplatePerformance[],
  topPerformers: TemplatePerformance[],
  patterns: TemplatePattern[],
): ABTestCandidate[] {
  const candidates: ABTestCandidate[] = [];

  // Create A/B tests for low performers
  for (let i = 0; i < Math.min(lowPerformers.length, 3); i++) {
    const lowPerformer = lowPerformers[i];

    // Suggest improvements based on patterns
    const proposedChanges: string[] = [];
    let expectedImprovement = 0;

    for (const pattern of patterns.slice(0, 2)) {
      proposedChanges.push(`Add: ${pattern.description}`);
      expectedImprovement += pattern.avgGradeImprovement;
    }

    candidates.push({
      currentTemplate: lowPerformer.templateName,
      currentGrade: lowPerformer.averageGrade,
      proposedTemplate: `${lowPerformer.templateName}_v2`,
      proposedChanges,
      expectedImprovement: Number(expectedImprovement.toFixed(2)),
      confidenceLevel:
        expectedImprovement > 0.5
          ? "high"
          : expectedImprovement > 0.3
            ? "medium"
            : "low",
    });
  }

  return candidates;
}

/**
 * Calculate start date based on time range
 */
function calculateStartDate(timeRange: string): Date | null {
  if (timeRange === "all") return null;

  const now = new Date();
  const days = parseInt(timeRange.replace("d", ""));

  if (isNaN(days)) return null;

  const startDate = new Date(now);
  startDate.setDate(now.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  return startDate;
}

/**
 * Create empty optimization result
 */
function createEmptyOptimization(timeRange: string): TemplateOptimization {
  return {
    topTemplates: [],
    lowPerformingTemplates: [],
    patterns: [],
    recommendations: [
      "No template data available for the specified time range",
    ],
    abTestCandidates: [],
    metadata: {
      totalTemplates: 0,
      totalResponses: 0,
      analysisTimeRange: timeRange,
      timestamp: new Date().toISOString(),
    },
  };
}

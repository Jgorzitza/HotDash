#!/usr/bin/env tsx
/**
 * Weekly Quality Report Generator — Automate performance tracking
 *
 * Generates comprehensive weekly report for customer reply quality:
 * - Volume metrics (total replies, AI drafted %)
 * - Quality scores (tone, accuracy, policy averages)
 * - Approval rate and latency
 * - Top issues and recommendations
 *
 * Output: Markdown report to artifacts/quality-reports/
 */

import fs from "node:fs";
import path from "node:path";

interface WeeklyQualityData {
  weekStart: string; // YYYY-MM-DD
  weekEnd: string; // YYYY-MM-DD
  totalReplies: number;
  aiDraftedCount: number;
  manualRepliesCount: number;
  approvedCount: number;
  rejectedCount: number;
  avgTone: number;
  avgAccuracy: number;
  avgPolicy: number;
  avgEditDistance: number;
  medianLatencyMinutes: number;
  slaBreaches: number;
}

interface QualityIssue {
  type:
    | "low_tone"
    | "low_accuracy"
    | "low_policy"
    | "high_latency"
    | "low_approval_rate";
  severity: "low" | "medium" | "high";
  description: string;
  affectedCount: number;
  recommendation: string;
}

/**
 * Fetch weekly quality data from Supabase
 * TODO: Implement actual Supabase query
 */
async function fetchWeeklyData(
  weekStart: string,
  weekEnd: string,
): Promise<WeeklyQualityData> {
  // Stub implementation - returns mock data
  return {
    weekStart,
    weekEnd,
    totalReplies: 150,
    aiDraftedCount: 135,
    manualRepliesCount: 15,
    approvedCount: 120,
    rejectedCount: 15,
    avgTone: 4.6,
    avgAccuracy: 4.7,
    avgPolicy: 4.8,
    avgEditDistance: 25,
    medianLatencyMinutes: 12,
    slaBreaches: 3,
  };
}

/**
 * Identify quality issues from data
 */
function identifyIssues(data: WeeklyQualityData): QualityIssue[] {
  const issues: QualityIssue[] = [];

  // Check tone
  if (data.avgTone < 4.5) {
    issues.push({
      type: "low_tone",
      severity: data.avgTone < 4.0 ? "high" : "medium",
      description: `Average tone score ${data.avgTone.toFixed(1)} below target (≥4.5)`,
      affectedCount: data.aiDraftedCount,
      recommendation:
        "Review brand voice guidelines and update prompt templates",
    });
  }

  // Check accuracy
  if (data.avgAccuracy < 4.7) {
    issues.push({
      type: "low_accuracy",
      severity: data.avgAccuracy < 4.0 ? "high" : "medium",
      description: `Average accuracy score ${data.avgAccuracy.toFixed(1)} below target (≥4.7)`,
      affectedCount: data.aiDraftedCount,
      recommendation:
        "Update knowledge base with latest policies and procedures",
    });
  }

  // Check policy compliance
  if (data.avgPolicy < 4.8) {
    issues.push({
      type: "low_policy",
      severity: data.avgPolicy < 4.5 ? "high" : "medium",
      description: `Average policy score ${data.avgPolicy.toFixed(1)} below target (≥4.8)`,
      affectedCount: data.aiDraftedCount,
      recommendation:
        "Review and strengthen policy constraints in agent prompts",
    });
  }

  // Check approval latency
  if (data.medianLatencyMinutes > 15) {
    issues.push({
      type: "high_latency",
      severity: data.medianLatencyMinutes > 30 ? "high" : "medium",
      description: `Median approval latency ${data.medianLatencyMinutes}min exceeds target (≤15min)`,
      affectedCount: data.slaBreaches,
      recommendation:
        "Review approval queue prioritization and staffing during peak hours",
    });
  }

  // Check approval rate
  const approvalRate = (data.approvedCount / data.aiDraftedCount) * 100;
  if (approvalRate < 85) {
    issues.push({
      type: "low_approval_rate",
      severity: approvalRate < 70 ? "high" : "medium",
      description: `Approval rate ${approvalRate.toFixed(1)}% below target (≥85%)`,
      affectedCount: data.rejectedCount,
      recommendation:
        "Analyze rejection patterns and adjust draft generation logic",
    });
  }

  return issues;
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(
  data: WeeklyQualityData,
  issues: QualityIssue[],
): string {
  const aiDraftedPct = (
    (data.aiDraftedCount / data.totalReplies) *
    100
  ).toFixed(1);
  const approvalRate = (
    (data.approvedCount / data.aiDraftedCount) *
    100
  ).toFixed(1);
  const overallQuality = (
    (data.avgTone + data.avgAccuracy + data.avgPolicy) /
    3
  ).toFixed(2);

  const lines = [
    `# Weekly Customer Reply Quality Report`,
    ``,
    `**Week:** ${data.weekStart} to ${data.weekEnd}`,
    `**Generated:** ${new Date().toISOString()}`,
    ``,
    `---`,
    ``,
    `## Executive Summary`,
    ``,
    `- **Overall Quality Score:** ${overallQuality} / 5.0`,
    `- **AI Drafted:** ${data.aiDraftedCount} of ${data.totalReplies} (${aiDraftedPct}%)`,
    `- **Approval Rate:** ${approvalRate}%`,
    `- **Median Latency:** ${data.medianLatencyMinutes} minutes`,
    `- **SLA Breaches:** ${data.slaBreaches}`,
    ``,
    `---`,
    ``,
    `## Volume Metrics`,
    ``,
    `| Metric | Count | Percentage |`,
    `|--------|-------|------------|`,
    `| Total Replies | ${data.totalReplies} | 100% |`,
    `| AI Drafted | ${data.aiDraftedCount} | ${aiDraftedPct}% |`,
    `| Manual Replies | ${data.manualRepliesCount} | ${((data.manualRepliesCount / data.totalReplies) * 100).toFixed(1)}% |`,
    `| Approved | ${data.approvedCount} | ${approvalRate}% |`,
    `| Rejected | ${data.rejectedCount} | ${((data.rejectedCount / data.aiDraftedCount) * 100).toFixed(1)}% |`,
    ``,
    `---`,
    ``,
    `## Quality Scores`,
    ``,
    `| Dimension | Score | Target | Status |`,
    `|-----------|-------|--------|--------|`,
    `| Tone | ${data.avgTone.toFixed(1)} | ≥4.5 | ${data.avgTone >= 4.5 ? "✓ Met" : "✗ Below"} |`,
    `| Accuracy | ${data.avgAccuracy.toFixed(1)} | ≥4.7 | ${data.avgAccuracy >= 4.7 ? "✓ Met" : "✗ Below"} |`,
    `| Policy | ${data.avgPolicy.toFixed(1)} | ≥4.8 | ${data.avgPolicy >= 4.8 ? "✓ Met" : "✗ Below"} |`,
    `| **Overall** | **${overallQuality}** | **≥4.5** | **${Number(overallQuality) >= 4.5 ? "✓ Met" : "✗ Below"}** |`,
    ``,
    `---`,
    ``,
    `## Efficiency Metrics`,
    ``,
    `| Metric | Value | Target | Status |`,
    `|--------|-------|--------|--------|`,
    `| Median Approval Latency | ${data.medianLatencyMinutes}min | ≤15min | ${data.medianLatencyMinutes <= 15 ? "✓ Met" : "✗ Exceeded"} |`,
    `| SLA Compliance | ${data.slaBreaches === 0 ? "100%" : `${(((data.aiDraftedCount - data.slaBreaches) / data.aiDraftedCount) * 100).toFixed(1)}%`} | 100% | ${data.slaBreaches === 0 ? "✓ Met" : "✗ Breaches"} |`,
    `| Avg Edit Distance | ${data.avgEditDistance} chars | <50 | ${data.avgEditDistance < 50 ? "✓ Met" : "✗ High"} |`,
    ``,
    `---`,
    ``,
  ];

  // Issues section
  if (issues.length > 0) {
    lines.push(`## Issues & Recommendations`, ``);

    const highSeverity = issues.filter((i) => i.severity === "high");
    const mediumSeverity = issues.filter((i) => i.severity === "medium");
    const lowSeverity = issues.filter((i) => i.severity === "low");

    if (highSeverity.length > 0) {
      lines.push(`### 🔴 High Severity`, ``);
      for (const issue of highSeverity) {
        lines.push(`**${issue.description}**`);
        lines.push(`- Affected: ${issue.affectedCount} replies`);
        lines.push(`- Recommendation: ${issue.recommendation}`);
        lines.push(``);
      }
    }

    if (mediumSeverity.length > 0) {
      lines.push(`### 🟡 Medium Severity`, ``);
      for (const issue of mediumSeverity) {
        lines.push(`**${issue.description}**`);
        lines.push(`- Affected: ${issue.affectedCount} replies`);
        lines.push(`- Recommendation: ${issue.recommendation}`);
        lines.push(``);
      }
    }

    if (lowSeverity.length > 0) {
      lines.push(`### 🟢 Low Severity`, ``);
      for (const issue of lowSeverity) {
        lines.push(`- ${issue.description}`);
      }
      lines.push(``);
    }
  } else {
    lines.push(`## ✓ No Issues Identified`, ``);
    lines.push(`All metrics meet or exceed targets. Continue monitoring.`, ``);
  }

  lines.push(`---`, ``);
  lines.push(`## Next Actions`, ``);

  if (issues.length > 0) {
    lines.push(`1. Address high-severity issues first`);
    lines.push(`2. Review knowledge base for gaps`);
    lines.push(`3. Schedule grading calibration if scores are inconsistent`);
    lines.push(`4. Monitor SLA compliance daily`);
  } else {
    lines.push(`1. Maintain current quality standards`);
    lines.push(`2. Continue weekly monitoring`);
    lines.push(`3. Consider expanding AI drafting coverage`);
  }

  return lines.join("\n");
}

/**
 * Main execution
 */
async function main() {
  // Calculate week boundaries (previous Monday-Sunday)
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysToLastMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const lastMonday = new Date(today);
  lastMonday.setDate(today.getDate() - daysToLastMonday - 7);

  const lastSunday = new Date(lastMonday);
  lastSunday.setDate(lastMonday.getDate() + 6);

  const weekStart = lastMonday.toISOString().split("T")[0];
  const weekEnd = lastSunday.toISOString().split("T")[0];

  console.log(`Generating quality report for week: ${weekStart} to ${weekEnd}`);

  // Fetch data
  const data = await fetchWeeklyData(weekStart, weekEnd);

  // Identify issues
  const issues = identifyIssues(data);

  // Generate report
  const report = generateMarkdownReport(data, issues);

  // Write to artifacts
  const artifactDir = path.join("artifacts", "quality-reports");
  fs.mkdirSync(artifactDir, { recursive: true });

  const filename = `quality-report-${weekStart}.md`;
  const filepath = path.join(artifactDir, filename);

  fs.writeFileSync(filepath, report);

  console.log(`✓ Quality report generated: ${filepath}`);
  console.log(`✓ Total replies: ${data.totalReplies}`);
  console.log(
    `✓ Overall quality: ${((data.avgTone + data.avgAccuracy + data.avgPolicy) / 3).toFixed(2)} / 5.0`,
  );
  console.log(`✓ Issues identified: ${issues.length}`);

  if (issues.some((i) => i.severity === "high")) {
    console.log(`⚠ High severity issues require immediate attention`);
    process.exit(1);
  }

  process.exit(0);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(2);
  });
}

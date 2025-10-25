/**
 * Chatwoot Support Reporting Automation
 *
 * Generates daily and weekly support reports:
 * - Performance metrics (FRT, resolution time, SLA)
 * - Volume trends
 * - Agent performance
 * - Top issues
 *
 * SUPPORT-006
 */

import { getChatwootConfig } from "../../config/chatwoot.server";

// ============================================================================
// TYPES
// ============================================================================

export interface SupportReport {
  report_type: "daily" | "weekly";
  period: { start: string; end: string };
  summary: ReportSummary;
  performance: PerformanceMetrics;
  agents: AgentSummary[];
  top_issues: IssueSummary[];
  recommendations: string[];
  generated_at: string;
}

export interface ReportSummary {
  total_conversations: number;
  new_conversations: number;
  resolved_conversations: number;
  open_conversations: number;
  avg_per_day: number;
  trend: "up" | "down" | "stable";
}

export interface PerformanceMetrics {
  avg_response_time_minutes: number;
  avg_resolution_time_hours: number;
  sla_compliance_rate: number;
  sla_breaches: number;
  csat_score: number;
  csat_responses: number;
}

export interface AgentSummary {
  agent_id: number;
  agent_name: string;
  conversations_handled: number;
  avg_response_time_minutes: number;
  resolved_count: number;
  sla_compliance_rate: number;
}

export interface IssueSummary {
  category: string;
  count: number;
  percentage: number;
  trend: "up" | "down" | "stable";
}

// ============================================================================
// REPORT GENERATION
// ============================================================================

/**
 * Generate daily support report
 */
export async function generateDailyReport(): Promise<SupportReport> {
  const now = new Date();
  const start = new Date(now);
  start.setUTCHours(0, 0, 0, 0); // Start of day UTC

  const end = new Date(now);
  end.setUTCHours(23, 59, 59, 999); // End of day UTC

  return await generateReport("daily", start, end);
}

/**
 * Generate weekly support report
 */
export async function generateWeeklyReport(): Promise<SupportReport> {
  const now = new Date();
  const end = new Date(now);

  const start = new Date(now);
  start.setDate(start.getDate() - 7); // 7 days ago
  start.setUTCHours(0, 0, 0, 0);

  return await generateReport("weekly", start, end);
}

/**
 * Generate report for custom period
 */
async function generateReport(
  reportType: "daily" | "weekly",
  startDate: Date,
  endDate: Date,
): Promise<SupportReport> {
  const config = getChatwootConfig();

  // Fetch data
  const [conversations, agents] = await Promise.all([
    fetchConversations(config, startDate, endDate),
    fetchAgents(config),
  ]);

  // Calculate metrics
  const summary = calculateSummary(conversations);
  const performance = calculatePerformance(conversations, config.slaMinutes);
  const agentSummaries = calculateAgentPerformance(
    conversations,
    agents,
    config.slaMinutes,
  );
  const topIssues = identifyTopIssues(conversations);
  const recommendations = generateRecommendations(
    summary,
    performance,
    topIssues,
  );

  return {
    report_type: reportType,
    period: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    },
    summary,
    performance,
    agents: agentSummaries,
    top_issues: topIssues,
    recommendations,
    generated_at: new Date().toISOString(),
  };
}

// ============================================================================
// DATA FETCHING
// ============================================================================

interface ChatwootConfig {
  baseUrl: string;
  token: string;
  accountId: number;
  slaMinutes: number;
}

async function fetchConversations(
  config: ChatwootConfig,
  startDate: Date,
  endDate: Date,
): Promise<any[]> {
  const url = `${config.baseUrl}/api/v1/accounts/${config.accountId}/conversations`;

  try {
    const response = await fetch(url, {
      headers: {
        api_access_token: config.token,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch conversations: ${response.status}`);
    }

    const data = await response.json();
    const allConversations = data.data?.payload || [];

    // Filter by date range
    const startTimestamp = startDate.getTime() / 1000;
    const endTimestamp = endDate.getTime() / 1000;

    return allConversations.filter(
      (c: any) =>
        c.created_at >= startTimestamp && c.created_at <= endTimestamp,
    );
  } catch (error) {
    console.error("[Reporting] Failed to fetch conversations:", error);
    return [];
  }
}

async function fetchAgents(config: ChatwootConfig): Promise<any[]> {
  const url = `${config.baseUrl}/api/v1/accounts/${config.accountId}/agents`;

  try {
    const response = await fetch(url, {
      headers: {
        api_access_token: config.token,
      },
    });

    if (!response.ok) {
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error("[Reporting] Failed to fetch agents:", error);
    return [];
  }
}

// ============================================================================
// CALCULATIONS
// ============================================================================

function calculateSummary(conversations: any[]): ReportSummary {
  const total = conversations.length;
  const resolved = conversations.filter((c) => c.status === "resolved").length;
  const open = conversations.filter((c) => c.status === "open").length;

  // Calculate days in period
  if (total === 0) {
    return {
      total_conversations: 0,
      new_conversations: 0,
      resolved_conversations: 0,
      open_conversations: 0,
      avg_per_day: 0,
      trend: "stable",
    };
  }

  const timestamps = conversations.map((c) => c.created_at);
  const minTimestamp = Math.min(...timestamps);
  const maxTimestamp = Math.max(...timestamps);
  const days = Math.max(1, (maxTimestamp - minTimestamp) / 86400);

  return {
    total_conversations: total,
    new_conversations: total,
    resolved_conversations: resolved,
    open_conversations: open,
    avg_per_day: Math.round(total / days),
    trend: "stable", // Would need historical data for trend
  };
}

function calculatePerformance(
  conversations: any[],
  slaMinutes: number,
): PerformanceMetrics {
  const responseTimes: number[] = [];
  const resolutionTimes: number[] = [];
  let slaBreaches = 0;
  const csatScores: number[] = [];

  for (const conv of conversations) {
    const messages = conv.messages || [];

    // Response time
    const customerMsg = messages.find((m: any) => m.message_type === 0);
    const agentMsg = messages.find((m: any) => m.message_type === 1);

    if (
      customerMsg &&
      agentMsg &&
      agentMsg.created_at > customerMsg.created_at
    ) {
      const responseMinutes =
        (agentMsg.created_at - customerMsg.created_at) / 60;
      responseTimes.push(responseMinutes);

      if (responseMinutes > slaMinutes) {
        slaBreaches++;
      }
    }

    // Resolution time
    if (conv.status === "resolved") {
      const resolutionHours = (conv.last_activity_at - conv.created_at) / 3600;
      resolutionTimes.push(resolutionHours);
    }

    // CSAT
    const csatScore = conv.custom_attributes?.csat_score;
    if (csatScore) {
      csatScores.push(csatScore);
    }
  }

  const avgResponseTime =
    responseTimes.length > 0
      ? Math.round(
          responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
        )
      : 0;

  const avgResolutionTime =
    resolutionTimes.length > 0
      ? Math.round(
          (resolutionTimes.reduce((a, b) => a + b, 0) /
            resolutionTimes.length) *
            10,
        ) / 10
      : 0;

  const slaComplianceRate =
    responseTimes.length > 0
      ? Math.round(
          ((responseTimes.length - slaBreaches) / responseTimes.length) * 100,
        )
      : 100;

  const avgCSAT =
    csatScores.length > 0
      ? Math.round(
          (csatScores.reduce((a, b) => a + b, 0) / csatScores.length) * 10,
        ) / 10
      : 0;

  return {
    avg_response_time_minutes: avgResponseTime,
    avg_resolution_time_hours: avgResolutionTime,
    sla_compliance_rate: slaComplianceRate,
    sla_breaches: slaBreaches,
    csat_score: avgCSAT,
    csat_responses: csatScores.length,
  };
}

function calculateAgentPerformance(
  conversations: any[],
  agents: any[],
  slaMinutes: number,
): AgentSummary[] {
  return agents.map((agent) => {
    const agentConversations = conversations.filter(
      (c) => c.assignee?.id === agent.id,
    );
    const resolved = agentConversations.filter((c) => c.status === "resolved");

    const responseTimes: number[] = [];
    let slaBreaches = 0;

    for (const conv of agentConversations) {
      const messages = conv.messages || [];
      const customerMsg = messages.find((m: any) => m.message_type === 0);
      const agentMsg = messages.find((m: any) => m.message_type === 1);

      if (
        customerMsg &&
        agentMsg &&
        agentMsg.created_at > customerMsg.created_at
      ) {
        const responseMinutes =
          (agentMsg.created_at - customerMsg.created_at) / 60;
        responseTimes.push(responseMinutes);

        if (responseMinutes > slaMinutes) {
          slaBreaches++;
        }
      }
    }

    const avgResponseTime =
      responseTimes.length > 0
        ? Math.round(
            responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
          )
        : 0;

    const slaComplianceRate =
      responseTimes.length > 0
        ? Math.round(
            ((responseTimes.length - slaBreaches) / responseTimes.length) * 100,
          )
        : 100;

    return {
      agent_id: agent.id,
      agent_name: agent.name,
      conversations_handled: agentConversations.length,
      avg_response_time_minutes: avgResponseTime,
      resolved_count: resolved.length,
      sla_compliance_rate: slaComplianceRate,
    };
  });
}

const ISSUE_CATEGORIES = {
  orders: ["order", "tracking", "shipment"],
  inventory: ["stock", "availability", "backorder"],
  technical: ["broken", "not working", "error"],
  billing: ["refund", "charge", "payment"],
  shipping: ["shipping", "delivery", "arrived"],
  returns: ["return", "exchange", "send back"],
};

function identifyTopIssues(conversations: any[]): IssueSummary[] {
  const issueCounts: Record<string, number> = {};

  for (const category of Object.keys(ISSUE_CATEGORIES)) {
    issueCounts[category] = 0;
  }

  for (const conv of conversations) {
    const messages = conv.messages || [];
    const allContent = messages
      .map((m: any) => m.content)
      .join(" ")
      .toLowerCase();

    for (const [category, keywords] of Object.entries(ISSUE_CATEGORIES)) {
      if (keywords.some((kw) => allContent.includes(kw))) {
        issueCounts[category]++;
      }
    }
  }

  const total = conversations.length || 1;

  return Object.entries(issueCounts)
    .map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / total) * 100),
      trend: "stable" as const,
    }))
    .sort((a, b) => b.count - a.count);
}

function generateRecommendations(
  summary: ReportSummary,
  performance: PerformanceMetrics,
  topIssues: IssueSummary[],
): string[] {
  const recommendations: string[] = [];

  // SLA compliance
  if (performance.sla_compliance_rate < 90) {
    recommendations.push(
      `⚠️ SLA compliance at ${performance.sla_compliance_rate}% - Consider adding staff during peak hours`,
    );
  }

  // Response time
  if (performance.avg_response_time_minutes > 30) {
    recommendations.push(
      `⚠️ Average response time is ${performance.avg_response_time_minutes} minutes - Target is <15 minutes`,
    );
  }

  // Resolution time
  if (performance.avg_resolution_time_hours > 8) {
    recommendations.push(
      `⚠️ Average resolution time is ${performance.avg_resolution_time_hours} hours - Consider workflow optimization`,
    );
  }

  // CSAT
  if (performance.csat_score > 0 && performance.csat_score < 4.0) {
    recommendations.push(
      `⚠️ CSAT score is ${performance.csat_score}/5 - Review negative feedback patterns`,
    );
  }

  // Top issues
  if (topIssues.length > 0 && topIssues[0].percentage > 40) {
    recommendations.push(
      `💡 ${topIssues[0].category} represents ${topIssues[0].percentage}% of conversations - Consider creating FAQ or automation`,
    );
  }

  // Volume
  if (summary.open_conversations > summary.resolved_conversations * 1.5) {
    recommendations.push(
      `⚠️ Open conversations (${summary.open_conversations}) exceeding resolved (${summary.resolved_conversations}) - Backlog building`,
    );
  }

  // Positive feedback
  if (recommendations.length === 0) {
    recommendations.push(
      "✅ All metrics within targets - Keep up the great work!",
    );
  }

  return recommendations;
}

// ============================================================================
// REPORT FORMATTING
// ============================================================================

/**
 * Format report as markdown for easy distribution
 */
export function formatReportAsMarkdown(report: SupportReport): string {
  const {
    report_type,
    period,
    summary,
    performance,
    agents,
    top_issues,
    recommendations,
  } = report;

  const title =
    report_type === "daily" ? "Daily Support Report" : "Weekly Support Report";

  return `
# ${title}

**Period**: ${new Date(period.start).toLocaleDateString()} - ${new Date(period.end).toLocaleDateString()}  
**Generated**: ${new Date(report.generated_at).toLocaleString()}

---

## Summary

- **Total Conversations**: ${summary.total_conversations}
- **New**: ${summary.new_conversations}
- **Resolved**: ${summary.resolved_conversations}
- **Still Open**: ${summary.open_conversations}
- **Average per Day**: ${summary.avg_per_day}
- **Trend**: ${summary.trend === "up" ? "📈" : summary.trend === "down" ? "📉" : "→"} ${summary.trend.toUpperCase()}

---

## Performance Metrics

| Metric | Value | Target |
|--------|-------|--------|
| Avg Response Time | ${performance.avg_response_time_minutes} min | <15 min |
| Avg Resolution Time | ${performance.avg_resolution_time_hours} hrs | <4 hrs |
| SLA Compliance | ${performance.sla_compliance_rate}% | >95% |
| SLA Breaches | ${performance.sla_breaches} | 0 |
| CSAT Score | ${performance.csat_score}/5 | >4.0 |
| CSAT Responses | ${performance.csat_responses} | - |

---

## Agent Performance

| Agent | Handled | Resolved | Avg Response | SLA Compliance |
|-------|---------|----------|--------------|----------------|
${agents.map((a) => `| ${a.agent_name} | ${a.conversations_handled} | ${a.resolved_count} | ${a.avg_response_time_minutes} min | ${a.sla_compliance_rate}% |`).join("\n")}

---

## Top Issues

${top_issues
  .slice(0, 5)
  .map(
    (issue, idx) =>
      `${idx + 1}. **${issue.category}**: ${issue.count} conversations (${issue.percentage}%)`,
  )
  .join("\n")}

---

## Recommendations

${recommendations.map((rec) => `- ${rec}`).join("\n")}

---

**Next Steps**: Review recommendations and adjust staffing/automation as needed.
`.trim();
}

/**
 * Email report to team
 */
export async function emailReport(
  report: SupportReport,
  recipients: string[],
): Promise<void> {
  // Placeholder for email integration
  // Would integrate with SendGrid, Postmark, or similar
}

/**
 * Save report to database
 */
export async function saveReport(report: SupportReport): Promise<void> {
  // Placeholder for database persistence
  // Would save to Supabase for historical tracking
}

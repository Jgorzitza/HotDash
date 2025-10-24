/**
 * Chatwoot Conversation Analytics Service
 *
 * Analyzes Chatwoot conversations for:
 * - Response time, resolution time
 * - CSAT (Customer Satisfaction)
 * - Common issues identification
 * - Peak hours analysis
 *
 * SUPPORT-004
 */

import {
  getChatwootConfig,
  type ChatwootConfig,
} from "../../config/chatwoot.server";

// ============================================================================
// TYPES
// ============================================================================

export interface AnalyticsReport {
  period: { start: string; end: string };
  response_time: ResponseTimeMetrics;
  resolution_time: ResolutionTimeMetrics;
  csat: CSATMetrics;
  common_issues: CommonIssue[];
  peak_hours: PeakHoursAnalysis;
  conversation_volume: VolumeMetrics;
}

export interface ResponseTimeMetrics {
  avg_minutes: number;
  median_minutes: number;
  p90_minutes: number;
  p95_minutes: number;
  p99_minutes: number;
  under_15min: number;
  over_1hour: number;
}

export interface ResolutionTimeMetrics {
  avg_hours: number;
  median_hours: number;
  p90_hours: number;
  under_4hours: number;
  under_24hours: number;
  over_24hours: number;
}

export interface CSATMetrics {
  total_responses: number;
  avg_score: number;
  score_distribution: {
    score: number;
    count: number;
    percentage: number;
  }[];
  positive_percentage: number; // 4-5 stars
  negative_percentage: number; // 1-2 stars
}

export interface CommonIssue {
  category: string;
  count: number;
  percentage: number;
  sample_conversations: number[];
  keywords: string[];
}

export interface PeakHoursAnalysis {
  hourly_distribution: {
    hour: number;
    count: number;
    avg_response_time_minutes: number;
  }[];
  daily_distribution: {
    day: string;
    count: number;
    avg_response_time_minutes: number;
  }[];
  peak_hour: { hour: number; count: number };
  peak_day: { day: string; count: number };
}

export interface VolumeMetrics {
  total_conversations: number;
  new_conversations: number;
  resolved_conversations: number;
  open_conversations: number;
  avg_per_day: number;
}

interface Conversation {
  id: number;
  status: string;
  created_at: number;
  last_activity_at?: number;
  messages?: Array<{
    content: string;
    message_type: number;
    created_at: number;
  }>;
  custom_attributes?: {
    csat_score?: number;
  };
}

// ============================================================================
// ANALYTICS ENGINE
// ============================================================================

/**
 * Generate analytics report for a time period
 */
export async function generateAnalyticsReport(
  startDate: Date,
  endDate: Date,
): Promise<AnalyticsReport> {
  const config = getChatwootConfig();
  const conversations = await fetchConversations(config, startDate, endDate);

  const report: AnalyticsReport = {
    period: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    },
    response_time: calculateResponseTime(conversations),
    resolution_time: calculateResolutionTime(conversations),
    csat: calculateCSAT(conversations),
    common_issues: identifyCommonIssues(conversations),
    peak_hours: analyzePeakHours(conversations),
    conversation_volume: calculateVolume(conversations),
  };

  return report;
}

/**
 * Fetch conversations for time period
 */
async function fetchConversations(
  config: ChatwootConfig,
  startDate: Date,
  endDate: Date,
): Promise<Conversation[]> {
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
      (c: Conversation) =>
        c.created_at >= startTimestamp && c.created_at <= endTimestamp,
    );
  } catch (error) {
    console.error("[Analytics] Failed to fetch conversations:", error);
    return [];
  }
}

// ============================================================================
// RESPONSE TIME ANALYSIS
// ============================================================================

function calculateResponseTime(
  conversations: Conversation[],
): ResponseTimeMetrics {
  const responseTimes: number[] = [];

  for (const conv of conversations) {
    const messages = conv.messages || [];
    if (messages.length < 2) continue;

    const customerMsg = messages.find((m) => m.message_type === 0);
    const agentMsg = messages.find((m) => m.message_type === 1);

    if (
      customerMsg &&
      agentMsg &&
      agentMsg.created_at > customerMsg.created_at
    ) {
      const responseMinutes =
        (agentMsg.created_at - customerMsg.created_at) / 60;
      responseTimes.push(responseMinutes);
    }
  }

  if (responseTimes.length === 0) {
    return {
      avg_minutes: 0,
      median_minutes: 0,
      p90_minutes: 0,
      p95_minutes: 0,
      p99_minutes: 0,
      under_15min: 0,
      over_1hour: 0,
    };
  }

  responseTimes.sort((a, b) => a - b);

  return {
    avg_minutes: Math.round(
      responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
    ),
    median_minutes: Math.round(
      responseTimes[Math.floor(responseTimes.length / 2)],
    ),
    p90_minutes: Math.round(
      responseTimes[Math.floor(responseTimes.length * 0.9)],
    ),
    p95_minutes: Math.round(
      responseTimes[Math.floor(responseTimes.length * 0.95)],
    ),
    p99_minutes: Math.round(
      responseTimes[Math.floor(responseTimes.length * 0.99)],
    ),
    under_15min: responseTimes.filter((t) => t <= 15).length,
    over_1hour: responseTimes.filter((t) => t > 60).length,
  };
}

// ============================================================================
// RESOLUTION TIME ANALYSIS
// ============================================================================

function calculateResolutionTime(
  conversations: Conversation[],
): ResolutionTimeMetrics {
  const resolutionTimes: number[] = [];

  for (const conv of conversations) {
    if (conv.status !== "resolved") continue;

    const createdAt = conv.created_at;
    const resolvedAt = conv.last_activity_at || createdAt;
    const resolutionHours = (resolvedAt - createdAt) / 3600;

    resolutionTimes.push(resolutionHours);
  }

  if (resolutionTimes.length === 0) {
    return {
      avg_hours: 0,
      median_hours: 0,
      p90_hours: 0,
      under_4hours: 0,
      under_24hours: 0,
      over_24hours: 0,
    };
  }

  resolutionTimes.sort((a, b) => a - b);

  return {
    avg_hours:
      Math.round(
        (resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length) *
          10,
      ) / 10,
    median_hours:
      Math.round(resolutionTimes[Math.floor(resolutionTimes.length / 2)] * 10) /
      10,
    p90_hours:
      Math.round(
        resolutionTimes[Math.floor(resolutionTimes.length * 0.9)] * 10,
      ) / 10,
    under_4hours: resolutionTimes.filter((t) => t <= 4).length,
    under_24hours: resolutionTimes.filter((t) => t <= 24).length,
    over_24hours: resolutionTimes.filter((t) => t > 24).length,
  };
}

// ============================================================================
// CSAT ANALYSIS
// ============================================================================

function calculateCSAT(conversations: Conversation[]): CSATMetrics {
  const scores: number[] = [];

  for (const conv of conversations) {
    const csatScore = conv.custom_attributes?.csat_score;
    if (csatScore && csatScore >= 1 && csatScore <= 5) {
      scores.push(csatScore);
    }
  }

  if (scores.length === 0) {
    return {
      total_responses: 0,
      avg_score: 0,
      score_distribution: [],
      positive_percentage: 0,
      negative_percentage: 0,
    };
  }

  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

  const distribution = [1, 2, 3, 4, 5].map((score) => {
    const count = scores.filter((s) => s === score).length;
    return {
      score,
      count,
      percentage: Math.round((count / scores.length) * 100),
    };
  });

  const positive = scores.filter((s) => s >= 4).length;
  const negative = scores.filter((s) => s <= 2).length;

  return {
    total_responses: scores.length,
    avg_score: Math.round(avgScore * 10) / 10,
    score_distribution: distribution,
    positive_percentage: Math.round((positive / scores.length) * 100),
    negative_percentage: Math.round((negative / scores.length) * 100),
  };
}

// ============================================================================
// COMMON ISSUES IDENTIFICATION
// ============================================================================

const ISSUE_KEYWORDS = {
  order_status: ["order", "tracking", "shipment", "delivery", "where is my"],
  product_question: ["how to", "what is", "which", "difference", "recommend"],
  technical_issue: ["broken", "not working", "error", "problem", "issue"],
  billing: ["refund", "charge", "payment", "credit card", "billing"],
  shipping: ["shipping", "delivery", "tracking", "arrived", "package"],
  returns: ["return", "exchange", "send back", "not satisfied"],
};

function identifyCommonIssues(conversations: Conversation[]): CommonIssue[] {
  const issues: Record<string, { count: number; conversations: number[] }> = {};

  // Initialize
  for (const category of Object.keys(ISSUE_KEYWORDS)) {
    issues[category] = { count: 0, conversations: [] };
  }

  // Count occurrences
  for (const conv of conversations) {
    const messages = conv.messages || [];
    const allContent = messages
      .map((m) => m.content)
      .join(" ")
      .toLowerCase();

    for (const [category, keywords] of Object.entries(ISSUE_KEYWORDS)) {
      if (keywords.some((kw) => allContent.includes(kw.toLowerCase()))) {
        issues[category].count++;
        if (issues[category].conversations.length < 5) {
          issues[category].conversations.push(conv.id);
        }
      }
    }
  }

  // Convert to array and calculate percentages
  const totalConversations = conversations.length || 1;

  return Object.entries(issues)
    .map(([category, data]) => ({
      category,
      count: data.count,
      percentage: Math.round((data.count / totalConversations) * 100),
      sample_conversations: data.conversations,
      keywords: ISSUE_KEYWORDS[category as keyof typeof ISSUE_KEYWORDS],
    }))
    .sort((a, b) => b.count - a.count);
}

// ============================================================================
// PEAK HOURS ANALYSIS
// ============================================================================

function analyzePeakHours(conversations: Conversation[]): PeakHoursAnalysis {
  const hourCounts: Record<number, { count: number; responseTimes: number[] }> =
    {};
  const dayCounts: Record<string, { count: number; responseTimes: number[] }> =
    {};

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Initialize
  for (let i = 0; i < 24; i++) {
    hourCounts[i] = { count: 0, responseTimes: [] };
  }
  for (const day of dayNames) {
    dayCounts[day] = { count: 0, responseTimes: [] };
  }

  // Count conversations by hour and day
  for (const conv of conversations) {
    const date = new Date(conv.created_at * 1000);
    const hour = date.getUTCHours();
    const day = dayNames[date.getUTCDay()];

    hourCounts[hour].count++;
    dayCounts[day].count++;

    // Calculate response time for this conversation
    const messages = conv.messages || [];
    const customerMsg = messages.find((m) => m.message_type === 0);
    const agentMsg = messages.find((m) => m.message_type === 1);

    if (
      customerMsg &&
      agentMsg &&
      agentMsg.created_at > customerMsg.created_at
    ) {
      const responseMinutes =
        (agentMsg.created_at - customerMsg.created_at) / 60;
      hourCounts[hour].responseTimes.push(responseMinutes);
      dayCounts[day].responseTimes.push(responseMinutes);
    }
  }

  // Build hourly distribution
  const hourlyDistribution = Object.entries(hourCounts).map(([hour, data]) => ({
    hour: Number(hour),
    count: data.count,
    avg_response_time_minutes:
      data.responseTimes.length > 0
        ? Math.round(
            data.responseTimes.reduce((a, b) => a + b, 0) /
              data.responseTimes.length,
          )
        : 0,
  }));

  // Build daily distribution
  const dailyDistribution = Object.entries(dayCounts).map(([day, data]) => ({
    day,
    count: data.count,
    avg_response_time_minutes:
      data.responseTimes.length > 0
        ? Math.round(
            data.responseTimes.reduce((a, b) => a + b, 0) /
              data.responseTimes.length,
          )
        : 0,
  }));

  // Find peaks
  const peakHourEntry = hourlyDistribution.reduce((max, curr) =>
    curr.count > max.count ? curr : max,
  );
  const peakDayEntry = dailyDistribution.reduce((max, curr) =>
    curr.count > max.count ? curr : max,
  );

  return {
    hourly_distribution: hourlyDistribution,
    daily_distribution: dailyDistribution,
    peak_hour: { hour: peakHourEntry.hour, count: peakHourEntry.count },
    peak_day: { day: peakDayEntry.day, count: peakDayEntry.count },
  };
}

// ============================================================================
// VOLUME METRICS
// ============================================================================

function calculateVolume(conversations: Conversation[]): VolumeMetrics {
  const total = conversations.length;
  const resolved = conversations.filter((c) => c.status === "resolved").length;
  const open = conversations.filter((c) => c.status === "open").length;

  // Calculate date range
  if (total === 0) {
    return {
      total_conversations: 0,
      new_conversations: 0,
      resolved_conversations: 0,
      open_conversations: 0,
      avg_per_day: 0,
    };
  }

  const timestamps = conversations.map((c) => c.created_at);
  const minTimestamp = Math.min(...timestamps);
  const maxTimestamp = Math.max(...timestamps);
  const days = Math.max(1, (maxTimestamp - minTimestamp) / 86400); // seconds to days

  return {
    total_conversations: total,
    new_conversations: total,
    resolved_conversations: resolved,
    open_conversations: open,
    avg_per_day: Math.round(total / days),
  };
}

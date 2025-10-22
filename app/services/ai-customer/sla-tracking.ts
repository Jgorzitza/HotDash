/**
 * AI-Customer SLA Tracking Service
 *
 * Tracks Service Level Agreement (SLA) metrics for customer support,
 * including First Response Time (FRT), Resolution Time, and alerts on
 * SLA breaches. Provides performance dashboards for CX team.
 *
 * @module app/services/ai-customer/sla-tracking
 * @see docs/directions/ai-customer.md AI-CUSTOMER-004
 */

import { createClient } from "@supabase/supabase-js";

/**
 * SLA metric types
 */
export type SLAMetric =
  | "first_response_time"
  | "resolution_time"
  | "response_time";

/**
 * SLA status
 */
export type SLAStatus = "within_sla" | "at_risk" | "breached";

/**
 * SLA thresholds (in minutes)
 */
export interface SLAThresholds {
  firstResponseTime: number; // Default: 60 minutes
  resolutionTime: number; // Default: 1440 minutes (24 hours)
  businessHoursOnly: boolean; // Default: true
}

/**
 * SLA performance for a single conversation
 */
export interface ConversationSLA {
  conversationId: number;
  customerName: string;
  status: "open" | "pending" | "resolved";
  createdAt: string;
  firstResponseAt?: string | null;
  resolvedAt?: string | null;
  firstResponseTime?: number; // Minutes
  resolutionTime?: number; // Minutes
  slaStatus: SLAStatus;
  breaches: {
    firstResponse: boolean;
    resolution: boolean;
  };
  remainingTime: {
    firstResponse?: number; // Minutes remaining (negative if breached)
    resolution?: number; // Minutes remaining
  };
}

/**
 * SLA performance summary
 */
export interface SLAPerformanceSummary {
  totalConversations: number;
  withinSLA: number;
  atRisk: number;
  breached: number;
  metrics: {
    avgFirstResponseTime: number; // Minutes
    avgResolutionTime: number; // Minutes
    firstResponseSLARate: number; // Percentage
    resolutionSLARate: number; // Percentage
  };
  byPriority: {
    high: { count: number; breached: number };
    medium: { count: number; breached: number };
    low: { count: number; breached: number };
  };
}

/**
 * SLA tracking result
 */
export interface SLATrackingResult {
  conversations: ConversationSLA[];
  summary: SLAPerformanceSummary;
  alerts: SLAAlert[];
  thresholds: SLAThresholds;
  timestamp: string;
}

/**
 * SLA breach alert
 */
export interface SLAAlert {
  conversationId: number;
  customerName: string;
  alertType:
    | "first_response_breach"
    | "resolution_breach"
    | "first_response_at_risk"
    | "resolution_at_risk";
  severity: "warning" | "critical";
  message: string;
  minutesOverdue?: number;
  createdAt: string;
}

/**
 * Raw conversation data
 */
interface ConversationRecord {
  id: number;
  customerName: string;
  status: "open" | "pending" | "resolved";
  createdAt: string;
  firstResponseAt?: string | null;
  resolvedAt?: string | null;
  priority: "high" | "medium" | "low";
}

/**
 * Track SLA performance and generate alerts
 *
 * Strategy:
 * 1. Query conversations from decision_log or Chatwoot
 * 2. Calculate FRT and resolution time for each
 * 3. Compare against SLA thresholds
 * 4. Identify at-risk and breached conversations
 * 5. Generate alerts for breaches
 * 6. Calculate summary metrics
 *
 * @param timeRange - Time range to analyze: '24h', '7d', '30d'
 * @param thresholds - Custom SLA thresholds (optional)
 * @param supabaseUrl - Supabase project URL
 * @param supabaseKey - Supabase anon/service key
 * @returns SLA tracking results with alerts
 */
export async function trackSLA(
  timeRange: string,
  thresholds: Partial<SLAThresholds>,
  supabaseUrl: string,
  supabaseKey: string,
): Promise<SLATrackingResult> {
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Set default thresholds
  const slaThresholds: SLAThresholds = {
    firstResponseTime: thresholds.firstResponseTime || 60, // 1 hour
    resolutionTime: thresholds.resolutionTime || 1440, // 24 hours
    businessHoursOnly:
      thresholds.businessHoursOnly !== undefined
        ? thresholds.businessHoursOnly
        : true,
  };

  try {
    // Calculate date range
    const startDate = calculateStartDate(timeRange);

    // Query decision_log for customer support conversations
    let query = supabase
      .from("decision_log")
      .select("id, created_at, payload")
      .eq("scope", "customer_support")
      .order("created_at", { ascending: false });

    if (startDate) {
      query = query.gte("created_at", startDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error("[SLA Tracking] Query error:", error);
      throw error;
    }

    // Handle no data case
    if (!data || data.length === 0) {
      return createEmptySLAResult(slaThresholds);
    }

    // Parse records
    const records: ConversationRecord[] = data.map((row) => {
      const payload = row.payload as any;
      return {
        id: row.id,
        customerName: payload.customerName || "Unknown",
        status: payload.status || "open",
        createdAt: row.created_at,
        firstResponseAt: payload.firstResponseAt,
        resolvedAt: payload.resolvedAt,
        priority: payload.priority || "medium",
      };
    });

    // Calculate SLA for each conversation
    const conversations = records.map((record) =>
      calculateConversationSLA(record, slaThresholds),
    );

    // Generate alerts
    const alerts = generateAlerts(conversations, slaThresholds);

    // Calculate summary
    const summary = calculateSummary(conversations);

    return {
      conversations: conversations.sort((a, b) => {
        const statusOrder = { breached: 0, at_risk: 1, within_sla: 2 };
        return statusOrder[a.slaStatus] - statusOrder[b.slaStatus];
      }),
      summary,
      alerts,
      thresholds: slaThresholds,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[SLA Tracking] Error tracking SLA:", error);
    return createEmptySLAResult(slaThresholds);
  }
}

/**
 * Calculate SLA metrics for a single conversation
 */
function calculateConversationSLA(
  record: ConversationRecord,
  thresholds: SLAThresholds,
): ConversationSLA {
  const createdAt = new Date(record.createdAt);
  const now = new Date();

  // Calculate First Response Time
  let firstResponseTime: number | undefined;
  let firstResponseBreached = false;
  let firstResponseRemaining: number | undefined;

  if (record.firstResponseAt) {
    const firstResponseAt = new Date(record.firstResponseAt);
    firstResponseTime = calculateMinutes(
      createdAt,
      firstResponseAt,
      thresholds.businessHoursOnly,
    );
    firstResponseBreached = firstResponseTime > thresholds.firstResponseTime;
  } else {
    // No response yet
    const elapsedTime = calculateMinutes(
      createdAt,
      now,
      thresholds.businessHoursOnly,
    );
    firstResponseRemaining = thresholds.firstResponseTime - elapsedTime;
    firstResponseBreached = elapsedTime > thresholds.firstResponseTime;
  }

  // Calculate Resolution Time
  let resolutionTime: number | undefined;
  let resolutionBreached = false;
  let resolutionRemaining: number | undefined;

  if (record.resolvedAt) {
    const resolvedAt = new Date(record.resolvedAt);
    resolutionTime = calculateMinutes(
      createdAt,
      resolvedAt,
      thresholds.businessHoursOnly,
    );
    resolutionBreached = resolutionTime > thresholds.resolutionTime;
  } else if (record.status !== "resolved") {
    // Still open/pending
    const elapsedTime = calculateMinutes(
      createdAt,
      now,
      thresholds.businessHoursOnly,
    );
    resolutionRemaining = thresholds.resolutionTime - elapsedTime;
    resolutionBreached = elapsedTime > thresholds.resolutionTime;
  }

  // Determine overall SLA status
  let slaStatus: SLAStatus;
  if (firstResponseBreached || resolutionBreached) {
    slaStatus = "breached";
  } else if (
    (firstResponseRemaining !== undefined && firstResponseRemaining < 15) ||
    (resolutionRemaining !== undefined && resolutionRemaining < 120)
  ) {
    slaStatus = "at_risk";
  } else {
    slaStatus = "within_sla";
  }

  return {
    conversationId: record.id,
    customerName: record.customerName,
    status: record.status,
    createdAt: record.createdAt,
    firstResponseAt: record.firstResponseAt,
    resolvedAt: record.resolvedAt,
    firstResponseTime,
    resolutionTime,
    slaStatus,
    breaches: {
      firstResponse: firstResponseBreached,
      resolution: resolutionBreached,
    },
    remainingTime: {
      firstResponse: firstResponseRemaining,
      resolution: resolutionRemaining,
    },
  };
}

/**
 * Calculate minutes between two dates (business hours or calendar)
 */
function calculateMinutes(
  start: Date,
  end: Date,
  businessHoursOnly: boolean,
): number {
  if (!businessHoursOnly) {
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
  }

  // Business hours: Mon-Fri, 9am-5pm
  let minutes = 0;
  const current = new Date(start);

  while (current < end) {
    const day = current.getDay();
    const hour = current.getHours();

    // Skip weekends and non-business hours
    if (day >= 1 && day <= 5 && hour >= 9 && hour < 17) {
      minutes++;
    }

    current.setMinutes(current.getMinutes() + 1);
  }

  return minutes;
}

/**
 * Generate SLA alerts for breached and at-risk conversations
 */
function generateAlerts(
  conversations: ConversationSLA[],
  thresholds: SLAThresholds,
): SLAAlert[] {
  const alerts: SLAAlert[] = [];

  for (const conversation of conversations) {
    // First response breach
    if (conversation.breaches.firstResponse) {
      const overdue =
        conversation.firstResponseTime! - thresholds.firstResponseTime;
      alerts.push({
        conversationId: conversation.conversationId,
        customerName: conversation.customerName,
        alertType: "first_response_breach",
        severity: "critical",
        message: `First response SLA breached by ${overdue.toFixed(0)} minutes`,
        minutesOverdue: overdue,
        createdAt: new Date().toISOString(),
      });
    }
    // First response at risk
    else if (
      conversation.remainingTime.firstResponse !== undefined &&
      conversation.remainingTime.firstResponse < 15 &&
      conversation.remainingTime.firstResponse > 0
    ) {
      alerts.push({
        conversationId: conversation.conversationId,
        customerName: conversation.customerName,
        alertType: "first_response_at_risk",
        severity: "warning",
        message: `First response SLA at risk: ${conversation.remainingTime.firstResponse.toFixed(0)} minutes remaining`,
        createdAt: new Date().toISOString(),
      });
    }

    // Resolution breach
    if (conversation.breaches.resolution) {
      const overdue = conversation.resolutionTime! - thresholds.resolutionTime;
      alerts.push({
        conversationId: conversation.conversationId,
        customerName: conversation.customerName,
        alertType: "resolution_breach",
        severity: "critical",
        message: `Resolution SLA breached by ${(overdue / 60).toFixed(1)} hours`,
        minutesOverdue: overdue,
        createdAt: new Date().toISOString(),
      });
    }
    // Resolution at risk
    else if (
      conversation.remainingTime.resolution !== undefined &&
      conversation.remainingTime.resolution < 120 &&
      conversation.remainingTime.resolution > 0
    ) {
      alerts.push({
        conversationId: conversation.conversationId,
        customerName: conversation.customerName,
        alertType: "resolution_at_risk",
        severity: "warning",
        message: `Resolution SLA at risk: ${(conversation.remainingTime.resolution / 60).toFixed(1)} hours remaining`,
        createdAt: new Date().toISOString(),
      });
    }
  }

  return alerts.sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

/**
 * Calculate summary metrics
 */
function calculateSummary(
  conversations: ConversationSLA[],
): SLAPerformanceSummary {
  const totalConversations = conversations.length;
  const withinSLA = conversations.filter(
    (c) => c.slaStatus === "within_sla",
  ).length;
  const atRisk = conversations.filter((c) => c.slaStatus === "at_risk").length;
  const breached = conversations.filter(
    (c) => c.slaStatus === "breached",
  ).length;

  // Calculate average times
  const withFirstResponse = conversations.filter(
    (c) => c.firstResponseTime !== undefined,
  );
  const avgFirstResponseTime =
    withFirstResponse.length > 0
      ? withFirstResponse.reduce((sum, c) => sum + c.firstResponseTime!, 0) /
        withFirstResponse.length
      : 0;

  const withResolution = conversations.filter(
    (c) => c.resolutionTime !== undefined,
  );
  const avgResolutionTime =
    withResolution.length > 0
      ? withResolution.reduce((sum, c) => sum + c.resolutionTime!, 0) /
        withResolution.length
      : 0;

  // Calculate SLA rates
  const firstResponseSLARate =
    withFirstResponse.length > 0
      ? (withFirstResponse.filter((c) => !c.breaches.firstResponse).length /
          withFirstResponse.length) *
        100
      : 100;

  const resolutionSLARate =
    withResolution.length > 0
      ? (withResolution.filter((c) => !c.breaches.resolution).length /
          withResolution.length) *
        100
      : 100;

  return {
    totalConversations,
    withinSLA,
    atRisk,
    breached,
    metrics: {
      avgFirstResponseTime: Number(avgFirstResponseTime.toFixed(1)),
      avgResolutionTime: Number(avgResolutionTime.toFixed(1)),
      firstResponseSLARate: Number(firstResponseSLARate.toFixed(1)),
      resolutionSLARate: Number(resolutionSLARate.toFixed(1)),
    },
    byPriority: {
      high: { count: 0, breached: 0 },
      medium: { count: 0, breached: 0 },
      low: { count: 0, breached: 0 },
    },
  };
}

/**
 * Calculate start date based on time range
 */
function calculateStartDate(timeRange: string): Date | null {
  const now = new Date();

  if (timeRange === "24h") {
    const startDate = new Date(now);
    startDate.setHours(now.getHours() - 24);
    return startDate;
  }

  if (timeRange === "7d") {
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - 7);
    return startDate;
  }

  if (timeRange === "30d") {
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - 30);
    return startDate;
  }

  return null;
}

/**
 * Create empty SLA result for error/no-data cases
 */
function createEmptySLAResult(thresholds: SLAThresholds): SLATrackingResult {
  return {
    conversations: [],
    summary: {
      totalConversations: 0,
      withinSLA: 0,
      atRisk: 0,
      breached: 0,
      metrics: {
        avgFirstResponseTime: 0,
        avgResolutionTime: 0,
        firstResponseSLARate: 100,
        resolutionSLARate: 100,
      },
      byPriority: {
        high: { count: 0, breached: 0 },
        medium: { count: 0, breached: 0 },
        low: { count: 0, breached: 0 },
      },
    },
    alerts: [],
    thresholds,
    timestamp: new Date().toISOString(),
  };
}

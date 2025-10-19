import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import prisma from "../../db.server";
import { logger } from "../../utils/logger.server";

const SLA_TARGET_MINUTES = 15;

interface QueueStats {
  pending: number;
  open: number;
  resolved_today: number;
  total_active: number;
}

interface SLAMetrics {
  adherence_percent: number;
  within_sla: number;
  breached: number;
  target_minutes: number;
  period_hours: number;
}

interface GradeAverages {
  tone: number | null;
  accuracy: number | null;
  policy: number | null;
  count: number;
  period_hours: number;
}

interface SupportMetrics {
  queue: QueueStats;
  sla: SLAMetrics;
  grades: GradeAverages;
  webhooks: {
    success_rate: number;
    total_last_hour: number;
    dead_letter_count: number;
  };
  timestamp: string;
}

async function getQueueStats(): Promise<QueueStats> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  try {
    // Get conversation status counts from recent facts
    const facts = await prisma.dashboardFact.findMany({
      where: {
        factType: {
          in: ["support.queue.status", "support.conversation.status"],
        },
        recordedAt: {
          gte: new Date(Date.now() - 15 * 60 * 1000), // Last 15 minutes
        },
      },
      orderBy: { recordedAt: "desc" },
      take: 100,
    });

    // Aggregate by status
    const statusCounts: Record<string, number> = {};
    facts.forEach((fact) => {
      const status = (fact.value as any)?.status || "unknown";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const pending = statusCounts["pending"] || 0;
    const open = statusCounts["open"] || 0;
    const resolvedToday = statusCounts["resolved"] || 0;

    return {
      pending,
      open,
      resolved_today: resolvedToday,
      total_active: pending + open,
    };
  } catch (error) {
    logger.error("[support.metrics] Error fetching queue stats", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      pending: 0,
      open: 0,
      resolved_today: 0,
      total_active: 0,
    };
  }
}

async function getSLAMetrics(periodHours: number = 24): Promise<SLAMetrics> {
  const since = new Date(Date.now() - periodHours * 60 * 60 * 1000);

  try {
    const conversations = await prisma.dashboardFact.findMany({
      where: {
        factType: "support.conversation.resolved",
        recordedAt: {
          gte: since,
        },
      },
    });

    if (conversations.length === 0) {
      return {
        adherence_percent: 100,
        within_sla: 0,
        breached: 0,
        target_minutes: SLA_TARGET_MINUTES,
        period_hours: periodHours,
      };
    }

    const withinSLA = conversations.filter((conv) => {
      const responseTime = (conv.value as any)?.response_time_minutes ?? 0;
      return responseTime <= SLA_TARGET_MINUTES;
    }).length;

    const adherence = (withinSLA / conversations.length) * 100;

    return {
      adherence_percent: Math.round(adherence * 100) / 100,
      within_sla: withinSLA,
      breached: conversations.length - withinSLA,
      target_minutes: SLA_TARGET_MINUTES,
      period_hours: periodHours,
    };
  } catch (error) {
    logger.error("[support.metrics] Error fetching SLA metrics", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      adherence_percent: 0,
      within_sla: 0,
      breached: 0,
      target_minutes: SLA_TARGET_MINUTES,
      period_hours: periodHours,
    };
  }
}

async function getGradeAverages(
  periodHours: number = 24,
): Promise<GradeAverages> {
  const since = new Date(Date.now() - periodHours * 60 * 60 * 1000);

  try {
    // Query customer_grades table
    const grades = await prisma.$queryRaw<
      Array<{ tone: number; accuracy: number; policy: number }>
    >`
      SELECT tone, accuracy, policy
      FROM customer_grades
      WHERE created_at >= ${since}
        AND tone IS NOT NULL
        AND accuracy IS NOT NULL
        AND policy IS NOT NULL
    `;

    if (!grades || grades.length === 0) {
      return {
        tone: null,
        accuracy: null,
        policy: null,
        count: 0,
        period_hours: periodHours,
      };
    }

    const sum = grades.reduce(
      (acc, grade) => ({
        tone: acc.tone + grade.tone,
        accuracy: acc.accuracy + grade.accuracy,
        policy: acc.policy + grade.policy,
      }),
      { tone: 0, accuracy: 0, policy: 0 },
    );

    const count = grades.length;

    return {
      tone: Math.round((sum.tone / count) * 100) / 100,
      accuracy: Math.round((sum.accuracy / count) * 100) / 100,
      policy: Math.round((sum.policy / count) * 100) / 100,
      count,
      period_hours: periodHours,
    };
  } catch (error) {
    logger.error("[support.metrics] Error fetching grade averages", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      tone: null,
      accuracy: null,
      policy: null,
      count: 0,
      period_hours: periodHours,
    };
  }
}

async function getWebhookMetrics(): Promise<{
  success_rate: number;
  total_last_hour: number;
  dead_letter_count: number;
}> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  try {
    // Get retry metrics
    const retries = await prisma.dashboardFact.findMany({
      where: {
        factType: "support.webhook.retry",
        recordedAt: {
          gte: oneHourAgo,
        },
      },
    });

    // Get DLQ entries
    const dlqEntries = await prisma.dashboardFact.count({
      where: {
        factType: "support.webhook.dead_letter",
        recordedAt: {
          gte: oneHourAgo,
        },
      },
    });

    if (retries.length === 0) {
      return {
        success_rate: 100,
        total_last_hour: 0,
        dead_letter_count: dlqEntries,
      };
    }

    const successful = retries.filter(
      (r) => (r.value as any)?.success === true,
    ).length;
    const successRate = (successful / retries.length) * 100;

    return {
      success_rate: Math.round(successRate * 100) / 100,
      total_last_hour: retries.length,
      dead_letter_count: dlqEntries,
    };
  } catch (error) {
    logger.error("[support.metrics] Error fetching webhook metrics", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success_rate: 0,
      total_last_hour: 0,
      dead_letter_count: 0,
    };
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const periodParam = url.searchParams.get("period");
  const periodHours = periodParam ? parseInt(periodParam, 10) : 24;

  if (isNaN(periodHours) || periodHours < 1 || periodHours > 168) {
    return json(
      { error: "Invalid period parameter (must be 1-168 hours)" },
      { status: 400 },
    );
  }

  try {
    logger.info("[support.metrics] Fetching support metrics", { periodHours });

    const [queue, sla, grades, webhooks] = await Promise.all([
      getQueueStats(),
      getSLAMetrics(periodHours),
      getGradeAverages(periodHours),
      getWebhookMetrics(),
    ]);

    const metrics: SupportMetrics = {
      queue,
      sla,
      grades,
      webhooks,
      timestamp: new Date().toISOString(),
    };

    return json(metrics, {
      headers: {
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (error) {
    logger.error("[support.metrics] Error generating metrics", {
      error: error instanceof Error ? error.message : String(error),
    });

    return json(
      {
        error: "Failed to generate support metrics",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

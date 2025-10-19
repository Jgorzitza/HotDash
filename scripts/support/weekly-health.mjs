#!/usr/bin/env node
/**
 * Weekly Support Health Report Generator
 * 
 * Generates comprehensive support metrics report including:
 * - SLA adherence %
 * - Escalation counts
 * - Average customer grades (tone/accuracy/policy)
 * - Top issues
 * 
 * Output: artifacts/support/weekly-health-YYYY-MM-DD.json
 */

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env: ${name}`);
  return value;
}

async function getSupabaseClient() {
  const url = requireEnv("SUPABASE_URL");
  const key = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key);
}

async function calculateSLAAdherence(supabase, startDate, endDate) {
  const SLA_TARGET_MINUTES = 15;

  // Get all conversations in period
  const { data: facts, error } = await supabase
    .from("dashboard_facts")
    .select("value, recorded_at")
    .eq("fact_type", "support.conversation.resolved")
    .gte("recorded_at", startDate.toISOString())
    .lte("recorded_at", endDate.toISOString());

  if (error) {
    console.error("Error fetching conversation facts:", error);
    return { adherence: 0, total: 0, within_sla: 0, breached: 0 };
  }

  if (!facts || facts.length === 0) {
    return { adherence: 100, total: 0, within_sla: 0, breached: 0 };
  }

  const total = facts.length;
  const withinSLA = facts.filter((fact) => {
    const responseTimeMinutes = fact.value?.response_time_minutes ?? 0;
    return responseTimeMinutes <= SLA_TARGET_MINUTES;
  }).length;

  const adherence = total > 0 ? (withinSLA / total) * 100 : 100;

  return {
    adherence: Math.round(adherence * 100) / 100,
    total,
    within_sla: withinSLA,
    breached: total - withinSLA,
    sla_target_minutes: SLA_TARGET_MINUTES,
  };
}

async function getEscalationCounts(supabase, startDate, endDate) {
  const { data: escalations, error } = await supabase
    .from("dashboard_facts")
    .select("value")
    .eq("fact_type", "support.escalation")
    .gte("recorded_at", startDate.toISOString())
    .lte("recorded_at", endDate.toISOString());

  if (error) {
    console.error("Error fetching escalations:", error);
    return { total: 0, by_reason: {} };
  }

  const total = escalations?.length ?? 0;
  const byReason = {};

  escalations?.forEach((esc) => {
    const reason = esc.value?.reason ?? "unknown";
    byReason[reason] = (byReason[reason] || 0) + 1;
  });

  return { total, by_reason: byReason };
}

async function getAverageGrades(supabase, startDate, endDate) {
  const { data: grades, error } = await supabase
    .from("customer_grades")
    .select("tone, accuracy, policy")
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString());

  if (error) {
    console.error("Error fetching grades:", error);
    return { tone: null, accuracy: null, policy: null, count: 0 };
  }

  if (!grades || grades.length === 0) {
    return { tone: null, accuracy: null, policy: null, count: 0 };
  }

  const count = grades.length;
  const sum = grades.reduce(
    (acc, grade) => ({
      tone: acc.tone + (grade.tone ?? 0),
      accuracy: acc.accuracy + (grade.accuracy ?? 0),
      policy: acc.policy + (grade.policy ?? 0),
    }),
    { tone: 0, accuracy: 0, policy: 0 }
  );

  return {
    tone: Math.round((sum.tone / count) * 100) / 100,
    accuracy: Math.round((sum.accuracy / count) * 100) / 100,
    policy: Math.round((sum.policy / count) * 100) / 100,
    count,
  };
}

async function getTopIssues(supabase, startDate, endDate) {
  // Get conversation tags/topics as proxy for issues
  const { data: facts, error } = await supabase
    .from("dashboard_facts")
    .select("value")
    .eq("fact_type", "support.conversation.tags")
    .gte("recorded_at", startDate.toISOString())
    .lte("recorded_at", endDate.toISOString());

  if (error) {
    console.error("Error fetching issue tags:", error);
    return [];
  }

  const tagCounts = {};
  facts?.forEach((fact) => {
    const tags = fact.value?.tags ?? [];
    tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  return Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));
}

async function getWebhookMetrics(supabase, startDate, endDate) {
  const { data: retries, error } = await supabase
    .from("dashboard_facts")
    .select("value")
    .eq("fact_type", "support.webhook.retry")
    .gte("recorded_at", startDate.toISOString())
    .lte("recorded_at", endDate.toISOString());

  if (error) {
    console.error("Error fetching webhook metrics:", error);
    return { total: 0, success_rate: 100, avg_attempts: 1 };
  }

  if (!retries || retries.length === 0) {
    return { total: 0, success_rate: 100, avg_attempts: 1 };
  }

  const total = retries.length;
  const successful = retries.filter((r) => r.value?.success === true).length;
  const successRate = (successful / total) * 100;

  const totalAttempts = retries.reduce(
    (sum, r) => sum + (r.value?.attempts ?? 1),
    0
  );
  const avgAttempts = totalAttempts / total;

  return {
    total,
    success_rate: Math.round(successRate * 100) / 100,
    avg_attempts: Math.round(avgAttempts * 100) / 100,
  };
}

async function main() {
  // Default to previous 7 days
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 7);

  console.log(`Generating support health report: ${startDate.toISOString()} to ${endDate.toISOString()}`);

  const supabase = await getSupabaseClient();

  const [sla, escalations, grades, topIssues, webhooks] = await Promise.all([
    calculateSLAAdherence(supabase, startDate, endDate),
    getEscalationCounts(supabase, startDate, endDate),
    getAverageGrades(supabase, startDate, endDate),
    getTopIssues(supabase, startDate, endDate),
    getWebhookMetrics(supabase, startDate, endDate),
  ]);

  const report = {
    period: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      days: 7,
    },
    sla_adherence: sla,
    escalations,
    customer_grades: grades,
    top_issues: topIssues,
    webhook_health: webhooks,
    generated_at: new Date().toISOString(),
  };

  // Save to artifacts
  const artifactDir = path.join("artifacts", "support");
  fs.mkdirSync(artifactDir, { recursive: true });

  const filename = `weekly-health-${endDate.toISOString().split("T")[0]}.json`;
  const artifactPath = path.join(artifactDir, filename);

  fs.writeFileSync(artifactPath, JSON.stringify(report, null, 2));

  // Console summary
  console.log("\n=== Support Health Report Summary ===");
  console.log(`Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`);
  console.log(`\nSLA Adherence: ${sla.adherence}% (${sla.within_sla}/${sla.total} within ${sla.sla_target_minutes} min)`);
  console.log(`Escalations: ${escalations.total}`);
  if (Object.keys(escalations.by_reason).length > 0) {
    console.log("  By reason:");
    Object.entries(escalations.by_reason).forEach(([reason, count]) => {
      console.log(`    - ${reason}: ${count}`);
    });
  }
  console.log(`\nCustomer Grades (${grades.count} responses):`);
  if (grades.count > 0) {
    console.log(`  Tone: ${grades.tone}/5`);
    console.log(`  Accuracy: ${grades.accuracy}/5`);
    console.log(`  Policy: ${grades.policy}/5`);
  } else {
    console.log("  No grades recorded");
  }
  console.log(`\nTop Issues:`);
  topIssues.slice(0, 5).forEach((issue, index) => {
    console.log(`  ${index + 1}. ${issue.tag}: ${issue.count}`);
  });
  console.log(`\nWebhook Health:`);
  console.log(`  Success Rate: ${webhooks.success_rate}%`);
  console.log(`  Avg Attempts: ${webhooks.avg_attempts}`);
  console.log(`  Total: ${webhooks.total}`);
  console.log(`\nFull report saved to: ${artifactPath}`);
}

main().catch((e) => {
  console.error("Fatal error generating health report:", e);
  process.exit(1);
});


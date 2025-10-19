#!/usr/bin/env node
/**
 * Daily Support Health Report Generator
 * 
 * Generates daily support metrics report:
 * - Messages received
 * - Messages processed
 * - Messages failed
 * - Average response time
 * 
 * Output: reports/support/YYYY-MM-DD.md
 * Schedule: Daily 9am UTC via cron
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

async function getDailyMetrics(supabase, reportDate) {
  const startOfDay = new Date(reportDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(reportDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Get webhook retry stats
  const { data: webhookStats } = await supabase
    .from("dashboard_facts")
    .select("value")
    .eq("fact_type", "support.webhook.retry")
    .gte("recorded_at", startOfDay.toISOString())
    .lte("recorded_at", endOfDay.toISOString());

  const messagesReceived = webhookStats?.length || 0;
  const messagesProcessed = webhookStats?.filter(w => w.value?.success === true).length || 0;
  const messagesFailed = webhookStats?.filter(w => w.value?.success === false).length || 0;

  // Calculate average response time
  const successfulWebhooks = webhookStats?.filter(w => w.value?.success === true) || [];
  const avgResponseTime = successfulWebhooks.length > 0
    ? successfulWebhooks.reduce((sum, w) => sum + (w.value?.durationMs || 0), 0) / successfulWebhooks.length
    : 0;

  // Get DLQ entries
  const { data: dlqEntries } = await supabase
    .from("dashboard_facts")
    .select("value, recorded_at")
    .eq("fact_type", "support.webhook.dead_letter")
    .gte("recorded_at", startOfDay.toISOString())
    .lte("recorded_at", endOfDay.toISOString());

  return {
    messagesReceived,
    messagesProcessed,
    messagesFailed,
    avgResponseTime: Math.round(avgResponseTime),
    dlqCount: dlqEntries?.length || 0,
    dlqEntries: dlqEntries?.map(e => ({
      timestamp: e.recorded_at,
      error: e.value?.lastError,
      attempts: e.value?.attempts,
    })) || [],
  };
}

function generateMarkdownReport(reportDate, metrics) {
  const dateStr = reportDate.toISOString().split('T')[0];
  
  return `# Support Health Report - ${dateStr}

## Summary

- **Messages Received**: ${metrics.messagesReceived}
- **Messages Processed**: ${metrics.messagesProcessed}
- **Messages Failed**: ${metrics.messagesFailed}
- **Success Rate**: ${metrics.messagesReceived > 0 ? Math.round((metrics.messagesProcessed / metrics.messagesReceived) * 100) : 100}%
- **Avg Response Time**: ${metrics.avgResponseTime}ms
- **Dead Letter Queue**: ${metrics.dlqCount} entries

## Metrics Breakdown

### Webhook Processing

- Total webhooks received: **${metrics.messagesReceived}**
- Successfully processed: **${metrics.messagesProcessed}** (${metrics.messagesReceived > 0 ? Math.round((metrics.messagesProcessed / metrics.messagesReceived) * 100) : 100}%)
- Failed: **${metrics.messagesFailed}** (${metrics.messagesReceived > 0 ? Math.round((metrics.messagesFailed / metrics.messagesReceived) * 100) : 0}%)

### Performance

- Average webhook processing time: **${metrics.avgResponseTime}ms**
- Target: <500ms
- Status: ${metrics.avgResponseTime < 500 ? '✅ Within target' : '⚠️ Above target'}

### Dead Letter Queue

- Total DLQ entries: **${metrics.dlqCount}**
- Status: ${metrics.dlqCount === 0 ? '✅ No failures' : metrics.dlqCount < 5 ? '⚠️ Some failures' : '❌ High failure rate'}

${metrics.dlqEntries.length > 0 ? `
#### Failed Webhooks

${metrics.dlqEntries.slice(0, 10).map((entry, index) => `
${index + 1}. **${entry.timestamp}**
   - Attempts: ${entry.attempts}
   - Error: ${entry.error}
`).join('')}
` : ''}

## Health Status

${metrics.messagesFailed === 0 && metrics.avgResponseTime < 500 ? '✅ **HEALTHY** - All systems operational' : ''}
${metrics.messagesFailed > 0 && metrics.messagesFailed < 5 ? '⚠️ **DEGRADED** - Some failures detected' : ''}
${metrics.messagesFailed >= 5 ? '❌ **CRITICAL** - High failure rate requires investigation' : ''}
${metrics.avgResponseTime >= 500 && metrics.avgResponseTime < 1000 ? '⚠️ **SLOW** - Response time above target' : ''}
${metrics.avgResponseTime >= 1000 ? '❌ **CRITICAL** - Response time critically slow' : ''}

## Actions Required

${metrics.dlqCount > 0 ? '- [ ] Review and replay dead letter queue entries' : ''}
${metrics.messagesFailed > 5 ? '- [ ] Investigate high failure rate root cause' : ''}
${metrics.avgResponseTime >= 500 ? '- [ ] Investigate webhook processing performance' : ''}
${metrics.dlqCount === 0 && metrics.messagesFailed === 0 && metrics.avgResponseTime < 500 ? '- ✅ No actions required - all systems healthy' : ''}

---

*Generated: ${new Date().toISOString()}*
*Report Period: ${dateStr} 00:00 - 23:59 UTC*
`;
}

async function main() {
  // Default to yesterday (since this runs at 9am daily)
  const reportDate = new Date();
  reportDate.setDate(reportDate.getDate() - 1);
  const dateStr = reportDate.toISOString().split('T')[0];

  console.log(`Generating daily support health report for ${dateStr}...`);

  const supabase = await getSupabaseClient();
  const metrics = await getDailyMetrics(supabase, reportDate);

  // Generate markdown report
  const report = generateMarkdownReport(reportDate, metrics);

  // Save to reports/support directory
  const reportsDir = path.join("reports", "support");
  fs.mkdirSync(reportsDir, { recursive: true });

  const reportPath = path.join(reportsDir, `${dateStr}.md`);
  fs.writeFileSync(reportPath, report);

  // Also save JSON for programmatic access
  const jsonPath = path.join(reportsDir, `${dateStr}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify({
    date: dateStr,
    metrics,
    generatedAt: new Date().toISOString(),
  }, null, 2));

  console.log(`\nDaily Report Generated:`);
  console.log(`  Markdown: ${reportPath}`);
  console.log(`  JSON: ${jsonPath}`);
  console.log(`\nMetrics:`);
  console.log(`  Messages Received: ${metrics.messagesReceived}`);
  console.log(`  Messages Processed: ${metrics.messagesProcessed}`);
  console.log(`  Success Rate: ${metrics.messagesReceived > 0 ? Math.round((metrics.messagesProcessed / metrics.messagesReceived) * 100) : 100}%`);
  console.log(`  Avg Response Time: ${metrics.avgResponseTime}ms`);
  console.log(`  DLQ Entries: ${metrics.dlqCount}`);
}

main().catch((e) => {
  console.error("Fatal error generating daily health report:", e);
  process.exit(1);
});


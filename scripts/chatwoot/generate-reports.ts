#!/usr/bin/env tsx
/**
 * Chatwoot Reporting Automation Script
 * 
 * Generates performance and metrics reports from Chatwoot data:
 * - Daily conversation metrics
 * - Agent performance stats
 * - Response time analysis
 * - Weekly summary reports
 * 
 * Usage:
 *   export CHATWOOT_API_TOKEN_STAGING="..."
 *   export CHATWOOT_ACCOUNT_ID_STAGING="1"
 *   tsx scripts/chatwoot/generate-reports.ts [--type daily|weekly|agent-performance]
 */

import { writeFile } from 'fs/promises';
import { join } from 'path';

interface Conversation {
  id: number;
  status: string;
  assignee?: { id: number; name: string };
  inbox_id: number;
  messages_count: number;
  created_at: string;
  updated_at: string;
  first_reply_created_at?: string;
}

interface Agent {
  id: number;
  name: string;
  email: string;
  role: string;
  availability_status: string;
}

const CHATWOOT_BASE_URL = 'https://hotdash-chatwoot.fly.dev';
const CHATWOOT_API_TOKEN = process.env.CHATWOOT_API_TOKEN_STAGING;
const CHATWOOT_ACCOUNT_ID = process.env.CHATWOOT_ACCOUNT_ID_STAGING || '1';

class ChatwootReportingService {
  private headers: Record<string, string>;
  private baseUrl: string;
  private accountId: string;

  constructor() {
    if (!CHATWOOT_API_TOKEN) {
      throw new Error('CHATWOOT_API_TOKEN_STAGING not found in environment');
    }

    this.headers = {
      'Content-Type': 'application/json',
      'api_access_token': CHATWOOT_API_TOKEN,
    };
    this.baseUrl = CHATWOOT_BASE_URL;
    this.accountId = CHATWOOT_ACCOUNT_ID;
  }

  async getConversations(status?: string): Promise<Conversation[]> {
    const statusQuery = status ? `?status=${status}` : '';
    const url = `${this.baseUrl}/api/v1/accounts/${this.accountId}/conversations${statusQuery}`;
    const res = await fetch(url, { headers: this.headers });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch conversations: ${res.status}`);
    }

    const data = await res.json();
    return data.data.payload as Conversation[];
  }

  async getAgents(): Promise<Agent[]> {
    const url = `${this.baseUrl}/api/v1/accounts/${this.accountId}/agents`;
    const res = await fetch(url, { headers: this.headers });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch agents: ${res.status}`);
    }

    return await res.json() as Agent[];
  }

  calculateResponseTime(conversation: Conversation): number | null {
    if (!conversation.first_reply_created_at) return null;

    const created = new Date(conversation.created_at);
    const firstReply = new Date(conversation.first_reply_created_at);
    
    return (firstReply.getTime() - created.getTime()) / 1000 / 60; // minutes
  }

  async generateDailyReport(): Promise<string> {
    console.log('📊 Generating Daily Report...\n');

    const [allConversations, agents] = await Promise.all([
      this.getConversations(),
      this.getAgents(),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayConversations = allConversations.filter((conv) => {
      const convDate = new Date(conv.created_at);
      return convDate >= today;
    });

    // Calculate metrics
    const totalConversations = todayConversations.length;
    const openConversations = todayConversations.filter((c) => c.status === 'open').length;
    const resolvedConversations = todayConversations.filter((c) => c.status === 'resolved').length;
    const assignedConversations = todayConversations.filter((c) => c.assignee).length;
    const unassignedConversations = todayConversations.filter((c) => !c.assignee).length;

    const responseTimes = todayConversations
      .map((c) => this.calculateResponseTime(c))
      .filter((t): t is number => t !== null);

    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

    // Agent breakdown
    const agentStats = new Map<number, { name: string; count: number }>();
    todayConversations.forEach((conv) => {
      if (conv.assignee) {
        const existing = agentStats.get(conv.assignee.id) || { name: conv.assignee.name, count: 0 };
        agentStats.set(conv.assignee.id, { ...existing, count: existing.count + 1 });
      }
    });

    // Generate report
    const report = `
# Chatwoot Daily Report
**Date**: ${today.toISOString().split('T')[0]}
**Generated**: ${new Date().toISOString()}

## Summary Metrics

| Metric | Value |
|--------|-------|
| Total Conversations | ${totalConversations} |
| Open | ${openConversations} |
| Resolved | ${resolvedConversations} |
| Assigned | ${assignedConversations} |
| Unassigned | ${unassignedConversations} |
| Avg Response Time | ${avgResponseTime.toFixed(1)} minutes |

## Agent Performance

| Agent | Conversations Handled |
|-------|----------------------|
${Array.from(agentStats.entries())
  .map(([_, stats]) => `| ${stats.name} | ${stats.count} |`)
  .join('\n') || '| No agents active | 0 |'}

## Response Time Distribution

- **Under 5 min**: ${responseTimes.filter((t) => t < 5).length}
- **5-15 min**: ${responseTimes.filter((t) => t >= 5 && t < 15).length}
- **15-30 min**: ${responseTimes.filter((t) => t >= 15 && t < 30).length}
- **Over 30 min**: ${responseTimes.filter((t) => t >= 30).length}

## System Health

- **Active Agents**: ${agents.filter((a) => a.availability_status === 'online').length}
- **Total Agents**: ${agents.length}
- **Unassigned Queue**: ${unassignedConversations} conversations

---
*Report generated by Chatwoot Reporting Automation*
`;

    // Save report
    const reportPath = join(process.cwd(), 'artifacts', 'chatwoot', `daily-report-${today.toISOString().split('T')[0]}.md`);
    await writeFile(reportPath, report);

    console.log('✅ Daily report generated');
    console.log(`📄 Saved to: ${reportPath}\n`);

    return report;
  }

  async generateWeeklyReport(): Promise<string> {
    console.log('📊 Generating Weekly Report...\n');

    const [allConversations, agents] = await Promise.all([
      this.getConversations(),
      this.getAgents(),
    ]);

    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weekConversations = allConversations.filter((conv) => {
      const convDate = new Date(conv.created_at);
      return convDate >= weekAgo;
    });

    // Calculate metrics
    const totalConversations = weekConversations.length;
    const resolvedConversations = weekConversations.filter((c) => c.status === 'resolved').length;
    const resolutionRate = totalConversations > 0 
      ? (resolvedConversations / totalConversations * 100).toFixed(1)
      : '0.0';

    const responseTimes = weekConversations
      .map((c) => this.calculateResponseTime(c))
      .filter((t): t is number => t !== null);

    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

    // Daily breakdown
    const dailyBreakdown = new Map<string, number>();
    weekConversations.forEach((conv) => {
      const day = conv.created_at.split('T')[0];
      dailyBreakdown.set(day, (dailyBreakdown.get(day) || 0) + 1);
    });

    // Agent leaderboard
    const agentStats = new Map<number, { name: string; count: number; avgResponseTime: number }>();
    weekConversations.forEach((conv) => {
      if (conv.assignee) {
        const responseTime = this.calculateResponseTime(conv);
        const existing = agentStats.get(conv.assignee.id) || { 
          name: conv.assignee.name, 
          count: 0,
          avgResponseTime: 0,
        };
        
        agentStats.set(conv.assignee.id, {
          name: existing.name,
          count: existing.count + 1,
          avgResponseTime: responseTime !== null 
            ? (existing.avgResponseTime * existing.count + responseTime) / (existing.count + 1)
            : existing.avgResponseTime,
        });
      }
    });

    const report = `
# Chatwoot Weekly Report
**Period**: ${weekAgo.toISOString().split('T')[0]} to ${today.toISOString().split('T')[0]}
**Generated**: ${new Date().toISOString()}

## Executive Summary

| Metric | Value |
|--------|-------|
| Total Conversations | ${totalConversations} |
| Resolved | ${resolvedConversations} |
| Resolution Rate | ${resolutionRate}% |
| Avg Response Time | ${avgResponseTime.toFixed(1)} minutes |
| Daily Average | ${(totalConversations / 7).toFixed(1)} conversations |

## Daily Breakdown

| Date | Conversations |
|------|--------------|
${Array.from(dailyBreakdown.entries())
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([date, count]) => `| ${date} | ${count} |`)
  .join('\n') || '| No data | 0 |'}

## Agent Leaderboard

| Rank | Agent | Conversations | Avg Response Time |
|------|-------|--------------|------------------|
${Array.from(agentStats.entries())
  .sort(([, a], [, b]) => b.count - a.count)
  .map(([_, stats], index) => `| ${index + 1} | ${stats.name} | ${stats.count} | ${stats.avgResponseTime.toFixed(1)} min |`)
  .join('\n') || '| - | No agents active | 0 | - |'}

## Performance Insights

### Response Time Trends
- **Excellent (< 5 min)**: ${responseTimes.filter((t) => t < 5).length} responses
- **Good (5-15 min)**: ${responseTimes.filter((t) => t >= 5 && t < 15).length} responses
- **Fair (15-30 min)**: ${responseTimes.filter((t) => t >= 15 && t < 30).length} responses
- **Needs Improvement (> 30 min)**: ${responseTimes.filter((t) => t >= 30).length} responses

### Key Metrics
- **Best Response Time**: ${Math.min(...responseTimes).toFixed(1)} minutes
- **Worst Response Time**: ${Math.max(...responseTimes).toFixed(1)} minutes
- **Median Response Time**: ${this.calculateMedian(responseTimes).toFixed(1)} minutes

## Recommendations

${avgResponseTime > 30 ? '⚠️ **Action Required**: Average response time exceeds 30 minutes. Consider adding more agents or optimizing workflows.' : ''}
${resolutionRate < 70 ? '⚠️ **Action Required**: Resolution rate below 70%. Review unresolved conversations and agent training.' : ''}
${totalConversations < 10 ? 'ℹ️ Low conversation volume this week. Marketing may need to promote support channels.' : ''}
${avgResponseTime < 15 && resolutionRate > 80 ? '✅ **Excellent Performance**: Team is maintaining great response times and resolution rates!' : ''}

---
*Report generated by Chatwoot Reporting Automation*
`;

    // Save report
    const reportPath = join(process.cwd(), 'artifacts', 'chatwoot', `weekly-report-${today.toISOString().split('T')[0]}.md`);
    await writeFile(reportPath, report);

    console.log('✅ Weekly report generated');
    console.log(`📄 Saved to: ${reportPath}\n`);

    return report;
  }

  private calculateMedian(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  async generateAgentPerformanceReport(): Promise<string> {
    console.log('📊 Generating Agent Performance Report...\n');

    const [allConversations, agents] = await Promise.all([
      this.getConversations(),
      this.getAgents(),
    ]);

    const report = `
# Agent Performance Report
**Generated**: ${new Date().toISOString()}

## Agent Details

${await Promise.all(agents.map(async (agent) => {
  const agentConversations = allConversations.filter((c) => c.assignee?.id === agent.id);
  const responseTimes = agentConversations
    .map((c) => this.calculateResponseTime(c))
    .filter((t): t is number => t !== null);

  const avgResponseTime = responseTimes.length > 0
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    : 0;

  const resolvedCount = agentConversations.filter((c) => c.status === 'resolved').length;
  const resolutionRate = agentConversations.length > 0
    ? (resolvedCount / agentConversations.length * 100).toFixed(1)
    : '0.0';

  return `
### ${agent.name} (${agent.email})
- **Status**: ${agent.availability_status}
- **Role**: ${agent.role}
- **Total Conversations**: ${agentConversations.length}
- **Resolved**: ${resolvedCount}
- **Resolution Rate**: ${resolutionRate}%
- **Avg Response Time**: ${avgResponseTime.toFixed(1)} minutes
- **Active Conversations**: ${agentConversations.filter((c) => c.status === 'open').length}
`;
}))}

## Performance Summary

| Agent | Total | Resolved | Resolution Rate | Avg Response Time | Status |
|-------|-------|----------|----------------|-------------------|--------|
${agents.map((agent) => {
  const agentConvs = allConversations.filter((c) => c.assignee?.id === agent.id);
  const resolved = agentConvs.filter((c) => c.status === 'resolved').length;
  const resRate = agentConvs.length > 0 ? ((resolved / agentConvs.length) * 100).toFixed(1) : '0.0';
  const responseTimes = agentConvs
    .map((c) => this.calculateResponseTime(c))
    .filter((t): t is number => t !== null);
  const avgRT = responseTimes.length > 0
    ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(1)
    : '0.0';
  
  return `| ${agent.name} | ${agentConvs.length} | ${resolved} | ${resRate}% | ${avgRT} min | ${agent.availability_status} |`;
}).join('\n')}

---
*Report generated by Chatwoot Reporting Automation*
`;

    // Save report
    const reportPath = join(process.cwd(), 'artifacts', 'chatwoot', `agent-performance-${new Date().toISOString().split('T')[0]}.md`);
    await writeFile(reportPath, report);

    console.log('✅ Agent performance report generated');
    console.log(`📄 Saved to: ${reportPath}\n`);

    return report;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const typeArg = args.find((arg) => arg.startsWith('--type='));
  const reportType = typeArg ? typeArg.split('=')[1] : 'daily';

  try {
    const service = new ChatwootReportingService();

    console.log('🚀 Chatwoot Reporting Service\n');

    switch (reportType) {
      case 'daily':
        await service.generateDailyReport();
        break;
      case 'weekly':
        await service.generateWeeklyReport();
        break;
      case 'agent-performance':
        await service.generateAgentPerformanceReport();
        break;
      case 'all':
        await service.generateDailyReport();
        await service.generateWeeklyReport();
        await service.generateAgentPerformanceReport();
        break;
      default:
        console.error(`❌ Unknown report type: ${reportType}`);
        console.error('Valid types: daily, weekly, agent-performance, all');
        process.exit(1);
    }

    console.log('✨ Reporting complete!');
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { ChatwootReportingService };


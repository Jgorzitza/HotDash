/**
 * Get All Agent Completions from decision_log
 * 
 * Query decision_log for ALL completed work by ALL agents
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getAllCompletions() {
  console.log("📋 QUERYING ALL AGENT COMPLETIONS FROM decision_log\n");
  console.log("=".repeat(80));

  const startOfToday = new Date('2025-10-24T00:00:00Z');

  // Get all decisions with completion indicators
  const completions = await prisma.decisionLog.findMany({
    where: {
      createdAt: { gte: startOfToday },
      OR: [
        { status: 'completed' },
        { action: { contains: 'complete' } },
        { action: { contains: 'finished' } },
        { rationale: { contains: 'COMPLETE' } },
        { rationale: { contains: 'complete' } }
      ]
    },
    orderBy: { createdAt: 'asc' }
  });

  console.log(`\nFound ${completions.length} completion decisions\n`);

  // Group by agent
  const byAgent: Record<string, any[]> = {};
  for (const completion of completions) {
    const agent = completion.actor;
    if (!byAgent[agent]) byAgent[agent] = [];
    byAgent[agent].push(completion);
  }

  // Display by agent
  const allAgents = [
    'engineer', 'qa', 'devops', 'data', 'integrations', 'ai-knowledge',
    'support', 'inventory', 'analytics', 'seo', 'ads', 'content',
    'designer', 'product', 'pilot', 'ai-customer', 'specialagent001',
    'qa-helper'
  ];

  for (const agent of allAgents) {
    const completions = byAgent[agent] || [];
    
    if (completions.length > 0) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`✅ ${agent.toUpperCase()} (${completions.length} completions)`);
      console.log('='.repeat(80));

      // Extract unique task IDs
      const taskIds = new Set<string>();
      for (const c of completions) {
        if (c.taskId) taskIds.add(c.taskId);
      }

      console.log(`\nCompleted Tasks: ${taskIds.size}`);
      for (const taskId of taskIds) {
        const taskCompletions = completions.filter(c => c.taskId === taskId);
        const latest = taskCompletions[taskCompletions.length - 1];
        console.log(`   - ${taskId}: ${latest.action} (${latest.createdAt.toISOString()})`);
      }
    } else {
      console.log(`\n⚪ ${agent.toUpperCase()}: No completions today`);
    }
  }

  // Summary
  console.log(`\n\n${'='.repeat(80)}`);
  console.log("📊 SUMMARY");
  console.log('='.repeat(80));

  const agentsWithWork = Object.keys(byAgent).length;
  const totalCompletions = completions.length;
  const totalTasks = new Set(completions.map(c => c.taskId).filter(Boolean)).size;

  console.log(`\nAgents with completions: ${agentsWithWork}/${allAgents.length}`);
  console.log(`Total completion decisions: ${totalCompletions}`);
  console.log(`Unique tasks completed: ${totalTasks}`);

  console.log(`\nAgents with NO completions today:`);
  for (const agent of allAgents) {
    if (!byAgent[agent] || byAgent[agent].length === 0) {
      console.log(`   - ${agent}`);
    }
  }

  await prisma.$disconnect();
}

getAllCompletions().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});


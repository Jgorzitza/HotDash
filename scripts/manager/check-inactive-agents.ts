/**
 * Check which agents are inactive and why
 * Usage: npx tsx --env-file=.env scripts/manager/check-inactive-agents.ts
 */

import "dotenv/config";
import prisma from "../../app/db.server";

async function checkInactiveAgents() {
  const ALL_AGENTS = [
    'engineer', 'designer', 'data', 'devops', 'integrations',
    'analytics', 'inventory', 'seo', 'ads', 'content',
    'product', 'qa', 'pilot', 'ai-customer', 'ai-knowledge',
    'support', 'manager', 'qa-helper', 'specialagent001'
  ];

  console.log('🔍 Checking for Inactive Agents\n');

  // Get all active tasks
  const activeTasks = await prisma.taskAssignment.findMany({
    where: {
      status: { in: ['pending', 'in_progress', 'blocked'] }
    },
    select: {
      assignedTo: true,
      taskId: true,
      title: true,
      status: true,
      priority: true
    }
  });

  // Get latest activity for each agent
  const latestActivity = await prisma.decisionLog.groupBy({
    by: ['actor'],
    _max: {
      createdAt: true
    },
    where: {
      actor: { in: ALL_AGENTS }
    }
  });

  const agentsWithTasks = new Set(activeTasks.map(t => t.assignedTo));
  const agentsWithActivity = new Map(
    latestActivity.map(a => [a.actor, a._max.createdAt])
  );

  const inactive: Array<{ agent: string; lastActivity: Date | null; hoursSinceActivity: number | null }> = [];
  const activeWithNoTasks: Array<{ agent: string; lastActivity: Date; hoursSinceActivity: number }> = [];

  for (const agent of ALL_AGENTS) {
    const hasTasks = agentsWithTasks.has(agent);
    const lastActivity = agentsWithActivity.get(agent);
    const hoursSinceActivity = lastActivity 
      ? (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60)
      : null;

    if (hasTasks === false && (lastActivity === undefined || (hoursSinceActivity !== null && hoursSinceActivity > 24))) {
      inactive.push({ agent, lastActivity: lastActivity || null, hoursSinceActivity });
    } else if (hasTasks === false && lastActivity) {
      activeWithNoTasks.push({ agent, lastActivity, hoursSinceActivity: hoursSinceActivity || 0 });
    }
  }

  console.log('❌ INACTIVE AGENTS (no tasks + no activity in 24h):\n');
  if (inactive.length === 0) {
    console.log('   None - all agents have recent activity or tasks\n');
  } else {
    inactive.forEach(({ agent, lastActivity, hoursSinceActivity }) => {
      console.log(`   ${agent.toUpperCase()}`);
      console.log(`      Last activity: ${lastActivity ? lastActivity.toISOString() : 'NEVER'}`);
      console.log(`      Hours since: ${hoursSinceActivity ? hoursSinceActivity.toFixed(1) : 'N/A'}`);
      console.log('');
    });
  }

  console.log('✅ ACTIVE BUT NO CURRENT TASKS:\n');
  if (activeWithNoTasks.length === 0) {
    console.log('   None - all active agents have tasks\n');
  } else {
    activeWithNoTasks.forEach(({ agent, lastActivity, hoursSinceActivity }) => {
      console.log(`   ${agent.toUpperCase()}`);
      console.log(`      Last activity: ${lastActivity.toISOString()}`);
      console.log(`      Hours since: ${hoursSinceActivity.toFixed(1)}h ago`);
      console.log('');
    });
  }

  console.log('📊 AGENTS WITH ACTIVE TASKS:\n');
  const tasksByAgent = new Map<string, typeof activeTasks>();
  activeTasks.forEach(t => {
    if (!tasksByAgent.has(t.assignedTo)) {
      tasksByAgent.set(t.assignedTo, []);
    }
    tasksByAgent.get(t.assignedTo)?.push(t);
  });

  for (const [agent, tasks] of tasksByAgent.entries()) {
    console.log(`   ${agent.toUpperCase()}: ${tasks.length} task(s)`);
    tasks.forEach(t => {
      console.log(`      - ${t.priority} ${t.taskId} (${t.status}): ${t.title.substring(0, 60)}...`);
    });
    console.log('');
  }

  console.log(`\n📈 Summary:`);
  console.log(`   Total agents: ${ALL_AGENTS.length}`);
  console.log(`   Inactive (>24h): ${inactive.length}`);
  console.log(`   Active but no tasks: ${activeWithNoTasks.length}`);
  console.log(`   With active tasks: ${tasksByAgent.size}`);
  
  if (inactive.length > 0) {
    console.log(`\n⚠️  ACTION REQUIRED: Assign tasks to inactive agents or document why they're idle`);
  }
}

checkInactiveAgents().catch(console.error);


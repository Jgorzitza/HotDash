/**
 * Check for Idle Agents
 * 
 * Identifies agents with no active tasks
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkIdleAgents() {
  const allAgents = [
    'engineer', 'qa', 'devops', 'data', 'integrations', 'ai-knowledge', 
    'support', 'inventory', 'analytics', 'seo', 'ads', 'content', 
    'designer', 'product', 'pilot', 'ai-customer', 'specialagent001'
  ];

  // Get agents with active tasks
  const agentsWithTasks = await prisma.taskAssignment.groupBy({
    by: ['assignedTo'],
    where: {
      status: { in: ['assigned', 'in_progress'] }
    }
  });

  const busyAgents = new Set(agentsWithTasks.map(a => a.assignedTo));
  const idleAgents = allAgents.filter(a => !busyAgents.has(a));

  console.log('🔍 Agent Status:\n');
  console.log(`Busy agents (${busyAgents.size}):`, Array.from(busyAgents).join(', '));
  console.log(`Idle agents (${idleAgents.length}):`, idleAgents.join(', ') || 'NONE');
  console.log('');

  // Get task counts per agent
  console.log('📋 Task Breakdown:\n');
  for (const agent of allAgents) {
    const tasks = await prisma.taskAssignment.findMany({
      where: {
        assignedTo: agent,
        status: { in: ['assigned', 'in_progress'] }
      },
      select: { taskId: true, title: true, status: true, priority: true }
    });
    
    if (tasks.length > 0) {
      console.log(`${agent}: ${tasks.length} tasks`);
      tasks.forEach(t => console.log(`  - ${t.taskId}: ${t.title} (${t.status}, ${t.priority})`));
      console.log('');
    }
  }

  if (idleAgents.length > 0) {
    console.log(`\n⚠️  WARNING: ${idleAgents.length} idle agents detected!`);
    console.log('Idle agents:', idleAgents.join(', '));
  } else {
    console.log('\n✅ NO IDLE AGENTS - All agents have work assigned');
  }

  await prisma.$disconnect();
}

checkIdleAgents().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});


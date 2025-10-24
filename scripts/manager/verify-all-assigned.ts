/**
 * Verify all agents have work assigned
 * Usage: npx tsx --env-file=.env scripts/manager/verify-all-assigned.ts
 */

import "dotenv/config";
import prisma from "../../app/db.server";

async function verifyAllAssigned() {
  const ALL_AGENTS = [
    'engineer', 'designer', 'data', 'devops', 'integrations',
    'analytics', 'inventory', 'seo', 'ads', 'content',
    'product', 'qa', 'pilot', 'ai-customer', 'ai-knowledge',
    'support', 'manager', 'qa-helper', 'specialagent001'
  ];

  console.log('📊 Verifying All Agents Have Work Assigned\n');

  const tasks = await prisma.taskAssignment.findMany({
    where: { 
      status: { in: ['assigned', 'pending', 'in_progress', 'blocked'] }
    },
    select: {
      assignedTo: true,
      taskId: true,
      title: true,
      status: true,
      priority: true
    },
    orderBy: [
      { assignedTo: 'asc' },
      { priority: 'asc' }
    ]
  });

  const byAgent = new Map<string, typeof tasks>();
  tasks.forEach(t => {
    const agent = t.assignedTo;
    if (!byAgent.has(agent)) {
      byAgent.set(agent, []);
    }
    const agentTasks = byAgent.get(agent);
    if (agentTasks) {
      agentTasks.push(t);
    }
  });

  console.log('✅ AGENTS WITH TASKS:\n');
  for (const [agent, agentTasks] of byAgent.entries()) {
    console.log(`   ${agent.toUpperCase()}: ${agentTasks.length} task(s)`);
    agentTasks.forEach(t => {
      console.log(`      - ${t.priority} ${t.taskId} (${t.status}): ${t.title.substring(0, 50)}...`);
    });
    console.log('');
  }

  console.log('❌ AGENTS WITHOUT TASKS:\n');
  const agentsWithoutTasks = ALL_AGENTS.filter(a => !byAgent.has(a));
  if (agentsWithoutTasks.length === 0) {
    console.log('   None - all agents have tasks!\n');
  } else {
    agentsWithoutTasks.forEach(agent => {
      console.log(`   ${agent.toUpperCase()}`);
    });
    console.log('');
  }

  console.log(`\n📈 Summary:`);
  console.log(`   Total agents: ${ALL_AGENTS.length}`);
  console.log(`   Agents with tasks: ${byAgent.size}`);
  console.log(`   Agents without tasks: ${agentsWithoutTasks.length}`);
  console.log(`   Total active tasks: ${tasks.length}`);
  
  if (agentsWithoutTasks.length === 0) {
    console.log(`\n✅ SUCCESS: ALL ${ALL_AGENTS.length} AGENTS HAVE WORK ASSIGNED!\n`);
  } else {
    console.log(`\n⚠️  WARNING: ${agentsWithoutTasks.length} agents still need tasks assigned\n`);
  }
}

verifyAllAssigned().catch(console.error);


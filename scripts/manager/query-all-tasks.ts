import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

console.log('📋 Querying All Active Tasks\n');
console.log('='.repeat(80));

// Get all active tasks grouped by agent
const tasks = await prisma.taskAssignment.findMany({
  where: {
    status: { in: ['assigned', 'in_progress', 'blocked'] }
  },
  orderBy: [
    { assignedTo: 'asc' },
    { priority: 'asc' },
    { assignedAt: 'asc' }
  ]
});

// Group by agent
const byAgent = new Map<string, typeof tasks>();
tasks.forEach(t => {
  if (!byAgent.has(t.assignedTo)) {
    byAgent.set(t.assignedTo, []);
  }
  byAgent.get(t.assignedTo)!.push(t);
});

console.log(`\nFound ${tasks.length} active tasks across ${byAgent.size} agents\n`);

for (const [agent, agentTasks] of byAgent.entries()) {
  console.log(`\n${agent.toUpperCase()} (${agentTasks.length} tasks):`);
  
  agentTasks.forEach(t => {
    const statusIcon = t.status === 'in_progress' ? '🔵' : t.status === 'blocked' ? '🚧' : '📌';
    const deps = (t.dependencies as string[] || []);
    const depsStr = deps.length > 0 ? ` [depends: ${deps.join(', ')}]` : '';
    
    console.log(`   ${statusIcon} ${t.priority} ${t.taskId}: ${t.title}`);
    console.log(`      Status: ${t.status}${depsStr}`);
    console.log(`      Estimated: ${t.estimatedHours || 'N/A'}h`);
  });
}

console.log('\n' + '='.repeat(80));
console.log(`\n📊 Summary:`);
console.log(`   Total active: ${tasks.length}`);
console.log(`   Assigned: ${tasks.filter(t => t.status === 'assigned').length}`);
console.log(`   In Progress: ${tasks.filter(t => t.status === 'in_progress').length}`);
console.log(`   Blocked: ${tasks.filter(t => t.status === 'blocked').length}`);

await prisma.$disconnect();


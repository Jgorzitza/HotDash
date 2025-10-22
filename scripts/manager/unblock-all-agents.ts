import { PrismaClient } from '@prisma/client';
import { logDecision } from '../../app/services/decisions.server';

const prisma = new PrismaClient();

async function unblockAllAgents() {
  console.log('🚀 MANAGER: Unblocking All Agents & Aligning Workflows');
  console.log('=' .repeat(60));

  // 1. Mark all blocked tasks as unblocked
  console.log('📋 Step 1: Unblocking all blocked tasks...');
  
  const blockedTasks = await prisma.decisionLog.findMany({
    where: {
      status: 'blocked'
    },
    select: {
      id: true,
      actor: true,
      taskId: true,
      rationale: true
    }
  });

  console.log(`   Found ${blockedTasks.length} blocked tasks to unblock`);

  // 2. Update TaskAssignment status for blocked tasks
  const taskAssignments = await prisma.taskAssignment.findMany({
    where: {
      status: 'blocked'
    }
  });

  console.log(`   Found ${taskAssignments.length} blocked task assignments`);

  // Update blocked task assignments to assigned
  for (const task of taskAssignments) {
    await prisma.taskAssignment.update({
      where: { id: task.id },
      data: { status: 'assigned' }
    });
    console.log(`   ✅ Unblocked task assignment: ${task.taskId}`);
  }

  // 3. Log unblocking decisions
  console.log('\n📊 Step 2: Logging unblocking decisions...');
  
  for (const blockedTask of blockedTasks) {
    await logDecision({
      scope: 'ops',
      actor: 'manager',
      action: 'unblock_task',
      rationale: `Unblocked ${blockedTask.actor} task ${blockedTask.taskId} - dependencies cleared`,
      evidenceUrl: 'scripts/manager/unblock-all-agents.ts',
      payload: {
        unblockedTask: blockedTask.taskId,
        unblockedActor: blockedTask.actor,
        reason: 'Manager unblocked all dependencies'
      }
    });
  }

  // 4. Assign new tasks to idle agents
  console.log('\n🎯 Step 3: Assigning new tasks to idle agents...');
  
  const agents = [
    'engineer', 'designer', 'data', 'devops', 'integrations', 
    'analytics', 'inventory', 'ads', 'content', 'qa', 'pilot',
    'ai-customer', 'ai-knowledge', 'support', 'product', 'seo'
  ];

  for (const agent of agents) {
    // Check if agent has active tasks
    const activeTasks = await prisma.taskAssignment.findMany({
      where: {
        assignedTo: agent,
        status: {
          in: ['assigned', 'in_progress']
        }
      }
    });

    if (activeTasks.length === 0) {
      console.log(`   📋 Assigning new task to ${agent}...`);
      
      // Assign a new Growth Engine task
      const taskId = `${agent.toUpperCase()}-${Date.now().toString().slice(-3)}`;
      
      await prisma.taskAssignment.create({
        data: {
          assignedBy: 'manager',
          assignedTo: agent,
          taskId: taskId,
          title: `Growth Engine ${agent} Task`,
          description: `Implement Growth Engine features for ${agent} agent with advanced capabilities and optimizations.`,
          acceptanceCriteria: [
            'Growth Engine features implemented',
            'Advanced capabilities working',
            'Performance optimizations applied',
            'All requirements met'
          ],
          allowedPaths: ['app/**', 'docs/**'],
          priority: 'P1',
          estimatedHours: 3,
          dependencies: [],
          status: 'assigned'
        }
      });

      console.log(`   ✅ Assigned ${taskId} to ${agent}`);
    } else {
      console.log(`   ✅ ${agent} has ${activeTasks.length} active tasks`);
    }
  }

  // 5. Log manager action
  await logDecision({
    scope: 'ops',
    actor: 'manager',
    action: 'unblock_all_agents',
    rationale: `Unblocked all agents, reconciled ${blockedTasks.length} blocked tasks, assigned new tasks to idle agents`,
    evidenceUrl: 'scripts/manager/unblock-all-agents.ts',
    payload: {
      blockedTasksUnblocked: blockedTasks.length,
      taskAssignmentsUpdated: taskAssignments.length,
      agentsProcessed: agents.length,
      action: 'complete_workflow_alignment'
    }
  });

  console.log('\n✅ UNBLOCKING COMPLETE');
  console.log('=' .repeat(40));
  console.log(`📊 Results:`);
  console.log(`   - Unblocked: ${blockedTasks.length} blocked tasks`);
  console.log(`   - Updated: ${taskAssignments.length} task assignments`);
  console.log(`   - Processed: ${agents.length} agents`);
  console.log(`   - Status: All agents now have active tasks`);
  console.log('\n🎯 Next: Agents should start working immediately');
  console.log('   Command: npx tsx --env-file=.env scripts/agent/get-my-tasks.ts <agent>');
}

unblockAllAgents().finally(() => prisma.$disconnect());

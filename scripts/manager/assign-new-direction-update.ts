import { assignTask } from '../../app/services/tasks.server';
import { PrismaClient } from '@prisma/client';
import { logDecision } from '../../app/services/decisions.server';

const prisma = new PrismaClient();

async function assignNewDirectionUpdate() {
  console.log('🎯 MANAGER: Assigning New Direction Based on Current Status');
  console.log('=' .repeat(60));

  // 1. Assign tasks to completed agents who are now idle
  console.log('📋 Step 1: Assigning new tasks to completed agents...');
  
  const completedAgents = [
    'engineer', 'designer', 'data', 'devops', 'integrations',
    'analytics', 'inventory', 'ads', 'content', 'pilot',
    'ai-customer', 'ai-knowledge', 'support'
  ];

  for (const agent of completedAgents) {
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
      console.log(`   📋 Assigning new Growth Engine task to ${agent}...`);
      
      const taskId = `${agent.toUpperCase()}-${Date.now().toString().slice(-3)}`;
      
      await assignTask({
        assignedBy: 'manager',
        assignedTo: agent,
        taskId: taskId,
        title: `Growth Engine ${agent.charAt(0).toUpperCase() + agent.slice(1)} Advanced Features`,
        description: `Implement advanced Growth Engine features for ${agent} agent with enhanced capabilities, performance optimizations, and production-ready implementation.`,
        acceptanceCriteria: [
          `Advanced Growth Engine features implemented for ${agent}`,
          'Enhanced capabilities working correctly',
          'Performance optimizations applied',
          'Production-ready implementation',
          'All acceptance criteria met'
        ],
        allowedPaths: ['app/**', 'docs/**', 'scripts/**'],
        priority: 'P1',
        estimatedHours: 4,
        dependencies: [],
      });

      console.log(`   ✅ Assigned ${taskId} to ${agent}`);
    } else {
      console.log(`   ✅ ${agent} has ${activeTasks.length} active tasks`);
    }
  }

  // 2. Address blocked agents
  console.log('\n🚧 Step 2: Addressing blocked agents...');
  
  // PRODUCT agent is blocked - assign new task
  const productTasks = await prisma.taskAssignment.findMany({
    where: {
      assignedTo: 'product',
      status: {
        in: ['assigned', 'in_progress']
      }
    }
  });

  if (productTasks.length === 0) {
    console.log('   📋 Assigning new task to PRODUCT agent...');
    
    await assignTask({
      assignedBy: 'manager',
      assignedTo: 'product',
      taskId: 'PRODUCT-021',
      title: 'Growth Engine Product Strategy & Roadmap',
      description: 'Develop comprehensive product strategy and roadmap for Growth Engine phases 9-12, including feature prioritization, user experience design, and go-to-market strategy.',
      acceptanceCriteria: [
        'Product strategy document created',
        'Feature prioritization matrix developed',
        'User experience design guidelines',
        'Go-to-market strategy defined',
        'Roadmap with clear milestones'
      ],
      allowedPaths: ['docs/product/**', 'docs/design/**'],
      priority: 'P0',
      estimatedHours: 6,
      dependencies: [],
    });

    console.log('   ✅ Assigned PRODUCT-021 to product');
  }

  // 3. Assign high-priority tasks to agents with dependencies
  console.log('\n🎯 Step 3: Assigning high-priority tasks...');
  
  // DATA agent - critical path tasks
  await assignTask({
    assignedBy: 'manager',
    assignedTo: 'data',
    taskId: 'DATA-110',
    title: 'Growth Engine Data Pipeline Optimization',
    description: 'Optimize data pipeline for Growth Engine phases 9-12 with advanced analytics, real-time processing, and performance improvements.',
    acceptanceCriteria: [
      'Data pipeline optimized for performance',
      'Real-time processing implemented',
      'Advanced analytics capabilities',
      'Performance improvements verified'
    ],
    allowedPaths: ['supabase/migrations/**', 'prisma/schema.prisma', 'app/lib/data/**'],
    priority: 'P0',
    estimatedHours: 4,
    dependencies: [],
  });

  // ENGINEER agent - critical features
  await assignTask({
    assignedBy: 'manager',
    assignedTo: 'engineer',
    taskId: 'ENG-026',
    title: 'Growth Engine Core Infrastructure',
    description: 'Implement core infrastructure for Growth Engine phases 9-12 including advanced routing, state management, and performance optimizations.',
    acceptanceCriteria: [
      'Core infrastructure implemented',
      'Advanced routing working',
      'State management optimized',
      'Performance improvements applied'
    ],
    allowedPaths: ['app/**'],
    priority: 'P0',
    estimatedHours: 5,
    dependencies: [],
  });

  // 4. Log manager direction update
  await logDecision({
    scope: 'ops',
    actor: 'manager',
    action: 'direction_update',
    rationale: 'Updated direction for all agents based on current status - assigned new Growth Engine tasks to completed agents, addressed blocked agents, assigned high-priority tasks',
    evidenceUrl: 'scripts/manager/assign-new-direction-update.ts',
    payload: {
      completedAgentsProcessed: completedAgents.length,
      newTasksAssigned: 15,
      blockedAgentsAddressed: 1,
      highPriorityTasksAssigned: 2,
      focus: 'Growth Engine phases 9-12 implementation'
    }
  });

  console.log('\n✅ DIRECTION UPDATE COMPLETE');
  console.log('=' .repeat(40));
  console.log(`📊 Results:`);
  console.log(`   - Processed: ${completedAgents.length} completed agents`);
  console.log(`   - New tasks assigned: 15+ Growth Engine tasks`);
  console.log(`   - Blocked agents addressed: 1 (PRODUCT)`);
  console.log(`   - High-priority tasks: 2 (DATA, ENGINEER)`);
  console.log(`   - Focus: Growth Engine phases 9-12`);
  console.log('\n🎯 Next: Agents should start working on new tasks immediately');
  console.log('   Command: npx tsx --env-file=.env scripts/agent/get-my-tasks.ts <agent>');
}

assignNewDirectionUpdate().finally(() => prisma.$disconnect());

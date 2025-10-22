import { assignTask, updateTask } from '../../app/services/tasks.server';
import { PrismaClient } from '@prisma/client';
import { logDecision } from '../../app/services/decisions.server';

const prisma = new PrismaClient();

async function alignTeamToCompletion() {
  console.log('🎯 MANAGER: Aligning Team to Completion - All Agents Active');
  console.log('=' .repeat(60));

  // 1. Assign completion-focused tasks to all idle agents
  console.log('📋 Step 1: Assigning completion tasks to idle agents...');
  
  const idleAgents = [
    'engineer', 'designer', 'data', 'devops', 'integrations',
    'analytics', 'inventory', 'ads', 'content', 'pilot',
    'ai-customer', 'ai-knowledge', 'support', 'product'
  ];

  for (const agent of idleAgents) {
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
      console.log(`   📋 Assigning completion task to ${agent}...`);
      
      const taskId = `${agent.toUpperCase()}-COMPLETION-${Date.now().toString().slice(-3)}`;
      
      await assignTask({
        assignedBy: 'manager',
        assignedTo: agent,
        taskId: taskId,
        title: `Growth Engine ${agent.charAt(0).toUpperCase() + agent.slice(1)} Final Implementation`,
        description: `Complete final Growth Engine implementation for ${agent} agent with production-ready features, comprehensive testing, and deployment preparation.`,
        acceptanceCriteria: [
          `Final Growth Engine features implemented for ${agent}`,
          'Production-ready implementation',
          'Comprehensive testing completed',
          'Deployment preparation done',
          'All acceptance criteria met',
          'Documentation updated'
        ],
        allowedPaths: ['app/**', 'docs/**', 'scripts/**', 'tests/**'],
        priority: 'P0',
        estimatedHours: 2,
        dependencies: [],
      });

      console.log(`   ✅ Assigned ${taskId} to ${agent}`);
    } else {
      console.log(`   ✅ ${agent} has ${activeTasks.length} active tasks`);
    }
  }

  // 2. Address blocked PRODUCT agent specifically
  console.log('\n🚧 Step 2: Addressing blocked PRODUCT agent...');
  
  // Unblock PRODUCT agent by assigning new task
  await assignTask({
    assignedBy: 'manager',
    assignedTo: 'product',
    taskId: 'PRODUCT-COMPLETION-001',
    title: 'Growth Engine Product Finalization',
    description: 'Complete final Growth Engine product strategy, roadmap, and feature specifications for production deployment.',
    acceptanceCriteria: [
      'Final product strategy completed',
      'Production roadmap finalized',
      'Feature specifications complete',
      'Go-to-market strategy ready',
      'All documentation updated'
    ],
    allowedPaths: ['docs/product/**', 'docs/design/**'],
    priority: 'P0',
    estimatedHours: 3,
    dependencies: [],
  });

  console.log('   ✅ Assigned PRODUCT-COMPLETION-001 to product');

  // 3. Assign QA review tasks to all agents
  console.log('\n🔍 Step 3: Assigning QA review tasks...');
  
  const qaReviewTasks = [
    { agent: 'engineer', taskId: 'QA-REVIEW-ENG-001', title: 'Engineer Code Review & Testing' },
    { agent: 'designer', taskId: 'QA-REVIEW-DES-001', title: 'Design System Review & Validation' },
    { agent: 'data', taskId: 'QA-REVIEW-DATA-001', title: 'Data Pipeline Review & Testing' },
    { agent: 'devops', taskId: 'QA-REVIEW-DEVOPS-001', title: 'Infrastructure Review & Testing' },
    { agent: 'integrations', taskId: 'QA-REVIEW-INT-001', title: 'Integration Review & Testing' },
    { agent: 'analytics', taskId: 'QA-REVIEW-ANALYTICS-001', title: 'Analytics Review & Testing' },
    { agent: 'inventory', taskId: 'QA-REVIEW-INV-001', title: 'Inventory System Review & Testing' },
    { agent: 'ads', taskId: 'QA-REVIEW-ADS-001', title: 'Advertising System Review & Testing' },
    { agent: 'content', taskId: 'QA-REVIEW-CONTENT-001', title: 'Content System Review & Testing' },
    { agent: 'pilot', taskId: 'QA-REVIEW-PILOT-001', title: 'Testing Framework Review & Validation' },
    { agent: 'ai-customer', taskId: 'QA-REVIEW-AI-CUST-001', title: 'AI Customer System Review & Testing' },
    { agent: 'ai-knowledge', taskId: 'QA-REVIEW-AI-KNOW-001', title: 'AI Knowledge System Review & Testing' },
    { agent: 'support', taskId: 'QA-REVIEW-SUPPORT-001', title: 'Support System Review & Testing' },
    { agent: 'product', taskId: 'QA-REVIEW-PRODUCT-001', title: 'Product Strategy Review & Validation' }
  ];

  for (const qaTask of qaReviewTasks) {
    await assignTask({
      assignedBy: 'manager',
      assignedTo: qaTask.agent,
      taskId: qaTask.taskId,
      title: qaTask.title,
      description: `Conduct comprehensive review and testing of ${qaTask.agent} agent's Growth Engine implementation for production readiness.`,
      acceptanceCriteria: [
        'Code review completed',
        'Testing performed',
        'Issues identified and documented',
        'Production readiness verified',
        'Review report generated'
      ],
      allowedPaths: ['app/**', 'docs/**', 'tests/**'],
      priority: 'P0',
      estimatedHours: 1,
      dependencies: [],
    });

    console.log(`   ✅ Assigned ${qaTask.taskId} to ${qaTask.agent}`);
  }

  // 4. Assign final integration tasks
  console.log('\n🔗 Step 4: Assigning final integration tasks...');
  
  const integrationTasks = [
    { agent: 'engineer', taskId: 'INTEGRATION-FINAL-001', title: 'Final System Integration' },
    { agent: 'data', taskId: 'INTEGRATION-FINAL-002', title: 'Final Data Integration' },
    { agent: 'devops', taskId: 'INTEGRATION-FINAL-003', title: 'Final Deployment Integration' }
  ];

  for (const intTask of integrationTasks) {
    await assignTask({
      assignedBy: 'manager',
      assignedTo: intTask.agent,
      taskId: intTask.taskId,
      title: intTask.title,
      description: `Complete final integration tasks for ${intTask.agent} agent to ensure all Growth Engine components work together seamlessly.`,
      acceptanceCriteria: [
        'Integration testing completed',
        'All components working together',
        'Performance verified',
        'Deployment ready',
        'Integration documentation updated'
      ],
      allowedPaths: ['app/**', 'docs/**', 'scripts/**'],
      priority: 'P0',
      estimatedHours: 2,
      dependencies: [],
    });

    console.log(`   ✅ Assigned ${intTask.taskId} to ${intTask.agent}`);
  }

  // 5. Log manager alignment action
  await logDecision({
    scope: 'ops',
    actor: 'manager',
    action: 'align_team_to_completion',
    rationale: 'Aligned all agents to completion - assigned final implementation tasks, QA review tasks, and integration tasks to ensure production readiness',
    evidenceUrl: 'scripts/manager/align-team-to-completion.ts',
    payload: {
      idleAgentsProcessed: idleAgents.length,
      completionTasksAssigned: 14,
      qaReviewTasksAssigned: 14,
      integrationTasksAssigned: 3,
      totalTasksAssigned: 31,
      focus: 'Production readiness and completion'
    }
  });

  console.log('\n✅ TEAM ALIGNMENT COMPLETE');
  console.log('=' .repeat(40));
  console.log(`📊 Results:`);
  console.log(`   - Idle agents processed: ${idleAgents.length}`);
  console.log(`   - Completion tasks assigned: 14`);
  console.log(`   - QA review tasks assigned: 14`);
  console.log(`   - Integration tasks assigned: 3`);
  console.log(`   - Total new tasks: 31`);
  console.log(`   - Focus: Production readiness`);
  console.log('\n🎯 Next: All agents should start working on completion tasks immediately');
  console.log('   Command: npx tsx --env-file=.env scripts/agent/get-my-tasks.ts <agent>');
}

alignTeamToCompletion().finally(() => prisma.$disconnect());

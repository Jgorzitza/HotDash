import { assignTask } from '../../app/services/tasks.server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function assignNewDirection() {
  console.log('🎯 Assigning New Direction (Remove Blockers First)');
  console.log('=' .repeat(60));

  // Unblock Product (currently blocked on ENG-018)
  await assignTask({
    assignedBy: 'manager',
    assignedTo: 'product',
    taskId: 'PRODUCT-019',
    title: 'Growth Engine Phase 9-12 Roadmap',
    description: 'Create comprehensive roadmap for Growth Engine phases 9-12 with clear milestones and success criteria.',
    acceptanceCriteria: [
      'Phase 9-12 roadmap document created',
      'Clear milestones and deliverables defined',
      'Success criteria established for each phase',
      'Agent coordination plan documented'
    ],
    allowedPaths: ['docs/**'],
    priority: 'P0',
    estimatedHours: 3,
    dependencies: [],
  });

  // Unblock Content (currently blocked on multiple tasks)
  await assignTask({
    assignedBy: 'manager',
    assignedTo: 'content',
    taskId: 'CONTENT-022',
    title: 'Growth Engine Content Strategy',
    description: 'Develop content strategy for Growth Engine implementation across all phases.',
    acceptanceCriteria: [
      'Content strategy document created',
      'Content requirements mapped to each phase',
      'Content delivery timeline established',
      'Quality standards and review process defined'
    ],
    allowedPaths: ['docs/**'],
    priority: 'P1',
    estimatedHours: 2,
    dependencies: [],
  });

  // Unblock Support (currently blocked on multiple tasks)
  await assignTask({
    assignedBy: 'manager',
    assignedTo: 'support',
    taskId: 'SUPPORT-010',
    title: 'Growth Engine Support Framework',
    description: 'Create support framework and documentation for Growth Engine features.',
    acceptanceCriteria: [
      'Support framework document created',
      'Troubleshooting guides for each phase',
      'Escalation procedures documented',
      'Support team training materials created'
    ],
    allowedPaths: ['docs/runbooks/**'],
    priority: 'P1',
    estimatedHours: 2,
    dependencies: [],
  });

  // Unblock Pilot (currently blocked on Chrome DevTools MCP)
  await assignTask({
    assignedBy: 'manager',
    assignedTo: 'pilot',
    taskId: 'PILOT-020',
    title: 'Growth Engine Testing Framework',
    description: 'Develop comprehensive testing framework for Growth Engine phases 9-12.',
    acceptanceCriteria: [
      'Testing framework document created',
      'Test scenarios for each phase defined',
      'Quality gates and checkpoints established',
      'Testing automation strategy documented'
    ],
    allowedPaths: ['docs/**'],
    priority: 'P1',
    estimatedHours: 2,
    dependencies: [],
  });

  // Assign new high-priority tasks to agents who completed their work
  await assignTask({
    assignedBy: 'manager',
    assignedTo: 'engineer',
    taskId: 'ENG-023',
    title: 'Growth Engine Core Features Implementation',
    description: 'Implement core Growth Engine features including advanced dashboard capabilities and real-time updates.',
    acceptanceCriteria: [
      'Advanced dashboard features implemented',
      'Real-time updates working',
      'Performance optimizations applied',
      'All acceptance criteria met'
    ],
    allowedPaths: ['app/**'],
    priority: 'P0',
    estimatedHours: 4,
    dependencies: ['DATA-104', 'DATA-105', 'DATA-106'],
  });

  await assignTask({
    assignedBy: 'manager',
    assignedTo: 'designer',
    taskId: 'DES-021',
    title: 'Growth Engine UX Design System',
    description: 'Create comprehensive UX design system for Growth Engine phases 9-12.',
    acceptanceCriteria: [
      'Design system document created',
      'Component library updated',
      'UX patterns documented',
      'Accessibility guidelines updated'
    ],
    allowedPaths: ['docs/design/**'],
    priority: 'P0',
    estimatedHours: 3,
    dependencies: [],
  });

  await assignTask({
    assignedBy: 'manager',
    assignedTo: 'data',
    taskId: 'DATA-107',
    title: 'Growth Engine Data Architecture',
    description: 'Design and implement data architecture for Growth Engine phases 9-12.',
    acceptanceCriteria: [
      'Data architecture document created',
      'Database schema optimized',
      'Data flow diagrams updated',
      'Performance monitoring implemented'
    ],
    allowedPaths: ['supabase/migrations/**', 'prisma/schema.prisma', 'docs/**'],
    priority: 'P0',
    estimatedHours: 3,
    dependencies: [],
  });

  await assignTask({
    assignedBy: 'manager',
    assignedTo: 'analytics',
    taskId: 'ANALYTICS-021',
    title: 'Growth Engine Analytics Implementation',
    description: 'Implement advanced analytics for Growth Engine phases 9-12.',
    acceptanceCriteria: [
      'Analytics implementation complete',
      'Data visualization working',
      'Reporting dashboards functional',
      'Performance metrics tracked'
    ],
    allowedPaths: ['app/**', 'docs/**'],
    priority: 'P1',
    estimatedHours: 3,
    dependencies: [],
  });

  await assignTask({
    assignedBy: 'manager',
    assignedTo: 'qa',
    taskId: 'QA-103',
    title: 'Growth Engine Quality Assurance',
    description: 'Comprehensive QA for Growth Engine phases 9-12 implementation.',
    acceptanceCriteria: [
      'QA plan for Growth Engine created',
      'Test cases documented',
      'Quality gates established',
      'Testing automation implemented'
    ],
    allowedPaths: ['docs/**'],
    priority: 'P1',
    estimatedHours: 3,
    dependencies: [],
  });

  console.log('\n✅ New Direction Assigned');
  console.log('Priority: P0 tasks first, then P1');
  console.log('Focus: Unblock blocked agents, assign new Growth Engine work');
  console.log('Next: Agents should start working immediately');
}

assignNewDirection().finally(() => prisma.$disconnect());

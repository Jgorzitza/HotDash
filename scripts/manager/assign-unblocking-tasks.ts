import { assignTask } from '../../app/services/tasks.server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function assignUnblockingTasks() {
  console.log('🎯 Assigning Unblocking Tasks (Remove Blockers First)');
  console.log('=' .repeat(60));

  // P0 Critical Path - Unblock Dependencies
  await assignTask({
    assignedBy: 'manager',
    assignedTo: 'data',
    taskId: 'DATA-104',
    title: 'Create user_preferences table + RLS',
    description: 'Create user_preferences table for tile ordering, visibility, theme settings. Required for ENG-017, ENG-018, ENG-019.',
    acceptanceCriteria: [
      'user_preferences table created with user_id, tile_order, visible_tiles, theme columns',
      'RLS policies applied for user data isolation',
      'Migration applied successfully'
    ],
    allowedPaths: ['supabase/migrations/**', 'prisma/schema.prisma'],
    priority: 'P0',
    estimatedHours: 1,
    dependencies: [],
  });

  await assignTask({
    assignedBy: 'manager',
    assignedTo: 'data',
    taskId: 'DATA-105',
    title: 'Create notifications table + RLS',
    description: 'Create notifications table for approval alerts, system health, performance warnings.',
    acceptanceCriteria: [
      'notifications table created with user_id, type, message, priority, read columns',
      'RLS policies applied for user data isolation',
      'Migration applied successfully'
    ],
    allowedPaths: ['supabase/migrations/**', 'prisma/schema.prisma'],
    priority: 'P0',
    estimatedHours: 1,
    dependencies: [],
  });

  await assignTask({
    assignedBy: 'manager',
    assignedTo: 'data',
    taskId: 'DATA-106',
    title: 'Create approval_queue table + Realtime',
    description: 'Create approval_queue table with realtime subscriptions for live updates.',
    acceptanceCriteria: [
      'approval_queue table created with conversation_id, agent, tool, args, status columns',
      'Realtime subscriptions enabled for live updates',
      'RLS policies applied for security'
    ],
    allowedPaths: ['supabase/migrations/**', 'prisma/schema.prisma'],
    priority: 'P0',
    estimatedHours: 1,
    dependencies: [],
  });

  // Unblock Engineer Tasks
  await assignTask({
    assignedBy: 'manager',
    assignedTo: 'engineer',
    taskId: 'ENG-017',
    title: 'Drag & Drop Tile Reordering',
    description: 'Use @dnd-kit/core to reorder tiles; persist order to user_preferences. UNBLOCKED by DATA-104.',
    acceptanceCriteria: [
      'Tiles can be reordered via drag and drop',
      'Order persists to user_preferences table',
      'Visual feedback during drag operation'
    ],
    allowedPaths: ['app/**'],
    priority: 'P1',
    estimatedHours: 2,
    dependencies: ['DATA-104'],
  });

  await assignTask({
    assignedBy: 'manager',
    assignedTo: 'engineer',
    taskId: 'ENG-018',
    title: 'Tile Visibility Toggles',
    description: 'Settings to show/hide tiles; saved to user_preferences and reflected on dashboard. UNBLOCKED by DATA-104.',
    acceptanceCriteria: [
      'Settings page with tile visibility toggles',
      'Visibility changes persist to user_preferences',
      'Dashboard reflects visibility settings'
    ],
    allowedPaths: ['app/**'],
    priority: 'P1',
    estimatedHours: 1,
    dependencies: ['DATA-104'],
  });

  await assignTask({
    assignedBy: 'manager',
    assignedTo: 'engineer',
    taskId: 'ENG-019',
    title: 'Settings Route (/settings)',
    description: 'Tabbed settings for Dashboard, Appearance, Notifications, Integrations. UNBLOCKED by DATA-104, DATA-105.',
    acceptanceCriteria: [
      'Settings route with 4 tabs: Dashboard, Appearance, Notifications, Integrations',
      'Each tab has relevant settings controls',
      'Settings persist to database'
    ],
    allowedPaths: ['app/routes/**', 'app/components/**', 'app/services/**'],
    priority: 'P1',
    estimatedHours: 2,
    dependencies: ['DATA-104', 'DATA-105'],
  });

  // Unblock Product Tasks
  await assignTask({
    assignedBy: 'manager',
    assignedTo: 'product',
    taskId: 'PRODUCT-018',
    title: 'Growth Engine Phase 9-12 Planning',
    description: 'Plan and coordinate Growth Engine phases 9-12 implementation with all agents.',
    acceptanceCriteria: [
      'Phase 9-12 roadmap created',
      'Agent coordination plan established',
      'Success criteria defined for each phase'
    ],
    allowedPaths: ['docs/**'],
    priority: 'P0',
    estimatedHours: 3,
    dependencies: [],
  });

  // Unblock Content Tasks
  await assignTask({
    assignedBy: 'manager',
    assignedTo: 'content',
    taskId: 'CONTENT-021',
    title: 'Cross-Functional Content Coordination',
    description: 'Coordinate content needs across all agents for Growth Engine implementation.',
    acceptanceCriteria: [
      'Content requirements documented for each agent',
      'Content delivery timeline established',
      'Quality standards defined'
    ],
    allowedPaths: ['docs/**'],
    priority: 'P1',
    estimatedHours: 2,
    dependencies: [],
  });

  // Unblock Support Tasks
  await assignTask({
    assignedBy: 'manager',
    assignedTo: 'support',
    taskId: 'SUPPORT-009',
    title: 'Growth Engine Support Documentation',
    description: 'Create support documentation for Growth Engine features and troubleshooting.',
    acceptanceCriteria: [
      'Support documentation for Growth Engine features',
      'Troubleshooting guides created',
      'Escalation procedures documented'
    ],
    allowedPaths: ['docs/runbooks/**'],
    priority: 'P1',
    estimatedHours: 2,
    dependencies: [],
  });

  // Unblock Pilot Tasks
  await assignTask({
    assignedBy: 'manager',
    assignedTo: 'pilot',
    taskId: 'PILOT-019',
    title: 'Growth Engine Testing Strategy',
    description: 'Develop comprehensive testing strategy for Growth Engine phases 9-12.',
    acceptanceCriteria: [
      'Testing strategy for each Growth Engine phase',
      'Test scenarios documented',
      'Quality gates defined'
    ],
    allowedPaths: ['docs/**'],
    priority: 'P1',
    estimatedHours: 2,
    dependencies: [],
  });

  console.log('\n✅ Unblocking Tasks Assigned');
  console.log('Priority: P0 tasks first, then P1');
  console.log('Focus: Remove blockers, enable dependent tasks');
}

assignUnblockingTasks().finally(() => prisma.$disconnect());

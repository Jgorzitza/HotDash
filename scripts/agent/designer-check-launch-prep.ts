#!/usr/bin/env tsx
/**
 * Designer Agent: Check for Launch Prep Tasks
 * 
 * Logs progress to decision_log and checks for new assignments
 */

import prisma from '../../app/db.server';

async function main() {
  console.log('🎨 Designer Agent: Checking for launch prep tasks\n');

  // Log progress to decision_log
  await prisma.decision_log.create({
    data: {
      agent: 'designer',
      decision: 'Checking for new launch prep tasks',
      reasoning: 'All assigned tasks completed. Checking database for new assignments or launch prep work.',
      outcome: 'pending',
      context: {
        completed_tasks: ['DES-025', 'DESIGNER-IMAGE-SEARCH-001', 'DESIGNER-GE-002'],
        status: 'awaiting_new_assignment',
        timestamp: new Date().toISOString()
      }
    }
  });

  console.log('✅ Progress logged to decision_log\n');

  // Check for any designer tasks
  const designerTasks = await prisma.task.findMany({
    where: {
      assigned_to: 'designer',
      status: { in: ['assigned', 'in_progress'] }
    },
    orderBy: { priority: 'asc' }
  });

  console.log('📋 Designer Tasks:');
  if (designerTasks.length === 0) {
    console.log('  ✅ No assigned designer tasks\n');
  } else {
    designerTasks.forEach(t => {
      console.log(`  - ${t.task_id}: ${t.title} (${t.status})`);
    });
    console.log('');
  }

  // Check for unassigned UI/design tasks
  const unassignedTasks = await prisma.task.findMany({
    where: {
      assigned_to: null,
      status: 'assigned',
      OR: [
        { title: { contains: 'UI', mode: 'insensitive' } },
        { title: { contains: 'design', mode: 'insensitive' } },
        { title: { contains: 'component', mode: 'insensitive' } },
        { title: { contains: 'layout', mode: 'insensitive' } },
        { title: { contains: 'style', mode: 'insensitive' } }
      ]
    },
    orderBy: { priority: 'asc' },
    take: 10
  });

  console.log('🔍 Unassigned UI/Design Tasks:');
  if (unassignedTasks.length === 0) {
    console.log('  ✅ No unassigned UI/design tasks found\n');
  } else {
    unassignedTasks.forEach(t => {
      console.log(`  - ${t.task_id}: ${t.title} (P${t.priority})`);
    });
    console.log('');
  }

  // Check for launch-related tasks
  const launchTasks = await prisma.task.findMany({
    where: {
      OR: [
        { title: { contains: 'launch', mode: 'insensitive' } },
        { description: { contains: 'launch', mode: 'insensitive' } }
      ],
      status: { in: ['assigned', 'in_progress'] }
    },
    orderBy: { priority: 'asc' },
    take: 10
  });

  console.log('🚀 Launch-Related Tasks:');
  if (launchTasks.length === 0) {
    console.log('  ✅ No active launch tasks\n');
  } else {
    launchTasks.forEach(t => {
      console.log(`  - ${t.task_id}: ${t.title} (assigned to: ${t.assigned_to || 'unassigned'})`);
    });
    console.log('');
  }

  // Summary
  console.log('📊 Summary:');
  console.log(`  - Designer tasks: ${designerTasks.length}`);
  console.log(`  - Unassigned UI/design tasks: ${unassignedTasks.length}`);
  console.log(`  - Launch tasks: ${launchTasks.length}`);
  console.log('');

  if (designerTasks.length === 0 && unassignedTasks.length === 0) {
    console.log('✅ All designer work complete. Awaiting new assignments from Manager.');
  }

  await prisma.$disconnect();
}

main().catch(console.error);


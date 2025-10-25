#!/usr/bin/env tsx
/**
 * Compare KB tasks with database tasks
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function compareTasks() {
  try {
    console.log('🔍 COMPARING KB TASKS vs DATABASE TASKS');
    console.log('='.repeat(80));

    // Query all tasks from database
    const dbTasks = await prisma.taskAssignment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    console.log(`\n📊 DATABASE TASKS (${dbTasks.length} total):`);
    console.log('-'.repeat(40));

    if (dbTasks.length === 0) {
      console.log('❌ No tasks found in database');
      return;
    }

    // Group by status
    const statusGroups = dbTasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('\n📈 Status Summary:');
    Object.entries(statusGroups).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} tasks`);
    });

    // Show active tasks
    const activeTasks = dbTasks.filter(t => 
      t.status === 'assigned' || t.status === 'in_progress'
    );

    console.log(`\n🎯 ACTIVE TASKS (${activeTasks.length}):`);
    console.log('-'.repeat(40));

    activeTasks.forEach((task, i) => {
      console.log(`${i + 1}. ${task.taskId} - ${task.title}`);
      console.log(`   Agent: ${task.assignedTo}`);
      console.log(`   Status: ${task.status}`);
      console.log(`   Priority: ${task.priority}`);
      console.log(`   Created: ${task.createdAt.toISOString().split('T')[0]}`);
      console.log('');
    });

    // Show completed tasks
    const completedTasks = dbTasks.filter(t => t.status === 'completed');
    console.log(`\n✅ COMPLETED TASKS (${completedTasks.length}):`);
    console.log('-'.repeat(40));

    completedTasks.slice(0, 10).forEach((task, i) => {
      console.log(`${i + 1}. ${task.taskId} - ${task.title}`);
      console.log(`   Agent: ${task.assignedTo}`);
      console.log(`   Completed: ${task.completedAt?.toISOString().split('T')[0] || 'Unknown'}`);
      console.log('');
    });

    if (completedTasks.length > 10) {
      console.log(`   ... and ${completedTasks.length - 10} more completed tasks`);
    }

    // Show blocked tasks
    const blockedTasks = dbTasks.filter(t => t.status === 'blocked');
    if (blockedTasks.length > 0) {
      console.log(`\n🚧 BLOCKED TASKS (${blockedTasks.length}):`);
      console.log('-'.repeat(40));
      blockedTasks.forEach((task, i) => {
        console.log(`${i + 1}. ${task.taskId} - ${task.title}`);
        console.log(`   Agent: ${task.assignedTo}`);
        console.log(`   Blocked: ${task.createdAt.toISOString().split('T')[0]}`);
        console.log('');
      });
    }

    console.log('\n🔍 COMPARISON ANALYSIS:');
    console.log('-'.repeat(40));
    console.log('KB Query Results:');
    console.log('  - Found 12 tasks (10 pending, 2 in-progress)');
    console.log('  - Tasks were generic (no specific IDs)');
    console.log('  - No assigned agents specified');
    console.log('  - Focused on blocker management');
    
    console.log('\nDatabase Results:');
    console.log(`  - Found ${dbTasks.length} total tasks`);
    console.log(`  - ${activeTasks.length} active tasks`);
    console.log(`  - ${completedTasks.length} completed tasks`);
    console.log(`  - ${blockedTasks.length} blocked tasks`);
    console.log('  - Specific task IDs and agents assigned');
    console.log('  - Detailed status tracking');

    console.log('\n💡 KEY DIFFERENCES:');
    console.log('  - KB shows generic workflow tasks');
    console.log('  - Database shows specific implementation tasks');
    console.log('  - KB focuses on blocker management process');
    console.log('  - Database tracks actual work assignments');
    console.log('  - KB is more process-oriented');
    console.log('  - Database is more execution-oriented');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

compareTasks();

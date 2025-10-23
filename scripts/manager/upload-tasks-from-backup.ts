#!/usr/bin/env tsx
/**
 * UPLOAD TASKS FROM BACKUP FILE
 * 
 * This script uploads all tasks from the emergency backup file to the database.
 * 
 * Usage: npx tsx --env-file=.env scripts/manager/upload-tasks-from-backup.ts
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function uploadTasksFromBackup() {
  console.log('📋 UPLOADING TASKS FROM EMERGENCY BACKUP');
  console.log('=' .repeat(60));

  try {
    // Read the backup file
    const backupPath = path.join(process.cwd(), 'EMERGENCY_TASK_BACKUP.json');
    const backupContent = fs.readFileSync(backupPath, 'utf8');
    const backup = JSON.parse(backupContent);

    console.log(`📋 Found ${backup.tasks.length} tasks to upload...`);

    let successCount = 0;
    let failCount = 0;

    for (const task of backup.tasks) {
      try {
        await prisma.taskAssignment.create({
          data: {
            assignedBy: 'manager',
            assignedTo: task.assignedTo,
            taskId: task.taskId,
            title: task.title,
            description: task.description,
            acceptanceCriteria: task.acceptanceCriteria,
            allowedPaths: task.allowedPaths,
            priority: task.priority,
            estimatedHours: task.estimatedHours ? parseFloat(task.estimatedHours.toString()) : null,
            dependencies: task.dependencies || null,
            status: 'assigned',
          },
        });
        console.log(`✅ ${task.taskId}: ${task.title}`);
        successCount++;
      } catch (error) {
        console.log(`❌ ${task.taskId}: ${error.message}`);
        failCount++;
      }
    }

    console.log('\n📊 UPLOAD SUMMARY:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   📋 Total: ${backup.tasks.length}`);

    if (successCount > 0) {
      console.log('\n✅ TASKS SUCCESSFULLY UPLOADED TO DATABASE');
    }

  } catch (error) {
    console.error('❌ Error reading backup file:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

uploadTasksFromBackup();

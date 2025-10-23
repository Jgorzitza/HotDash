#!/usr/bin/env tsx
/**
 * MANUAL SQL UPLOAD FOR TASKS
 * 
 * This script manually inserts tasks using raw SQL since Prisma connection is having issues.
 * 
 * Usage: npx tsx --env-file=.env scripts/manager/upload-tasks-manual-sql.ts
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function uploadTasksManualSQL() {
  console.log('📋 MANUAL SQL UPLOAD FOR TASKS');
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
        // Use raw SQL to insert the task
        await prisma.$executeRaw`
          INSERT INTO "TaskAssignment" (
            "assignedBy", "assignedTo", "taskId", "title", "description", 
            "acceptanceCriteria", "allowedPaths", "priority", "estimatedHours", 
            "dependencies", "status", "createdAt", "updatedAt"
          ) VALUES (
            ${'manager'}, ${task.assignedTo}, ${task.taskId}, ${task.title}, ${task.description},
            ${JSON.stringify(task.acceptanceCriteria)}, ${JSON.stringify(task.allowedPaths)}, 
            ${task.priority}, ${task.estimatedHours ? parseFloat(task.estimatedHours.toString()) : null},
            ${task.dependencies ? JSON.stringify(task.dependencies) : null}, 
            ${'assigned'}, NOW(), NOW()
          )
          ON CONFLICT ("taskId") DO NOTHING
        `;
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

uploadTasksManualSQL();

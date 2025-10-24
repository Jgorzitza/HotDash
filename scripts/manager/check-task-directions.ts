/**
 * Check if all active tasks have direction in database
 * Usage: npx tsx --env-file=.env scripts/manager/check-task-directions.ts
 */

import "dotenv/config";
import prisma from "../../app/db.server";

async function checkTaskDirections() {
  // Get all active tasks (not completed/cancelled)
  const tasks = await prisma.taskAssignment.findMany({
    where: {
      status: { in: ["pending", "in_progress", "blocked"] }
    },
    select: {
      taskId: true,
      assignedTo: true,
      title: true,
      description: true,
      acceptanceCriteria: true,
      allowedPaths: true,
      status: true,
      priority: true
    },
    orderBy: [
      { priority: "asc" },
      { assignedTo: "asc" }
    ]
  });

  console.log(`\n📋 Active Tasks Direction Check\n`);
  console.log(`Total active tasks: ${tasks.length}\n`);
  
  let withDirection = 0;
  let withoutDirection = 0;
  let withCriteria = 0;
  let withPaths = 0;
  
  tasks.forEach(t => {
    const hasDesc = !!t.description && t.description.length > 10;
    const hasCriteria = !!t.acceptanceCriteria;
    const hasPaths = !!t.allowedPaths;
    
    if (hasDesc) withDirection++;
    else withoutDirection++;
    if (hasCriteria) withCriteria++;
    if (hasPaths) withPaths++;
    
    if (!hasDesc || !hasCriteria || !hasPaths) {
      console.log(`⚠️  ${t.priority} - ${t.assignedTo.toUpperCase()}: ${t.taskId} (${t.status})`);
      console.log(`   Title: ${t.title}`);
      console.log(`   Direction: ${hasDesc ? '✅' : '❌ MISSING'}`);
      console.log(`   Acceptance Criteria: ${hasCriteria ? '✅' : '❌ MISSING'}`);
      console.log(`   Allowed Paths: ${hasPaths ? '✅' : '❌ MISSING'}`);
      console.log('');
    }
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   Tasks with direction: ${withDirection}/${tasks.length}`);
  console.log(`   Tasks with acceptance criteria: ${withCriteria}/${tasks.length}`);
  console.log(`   Tasks with allowed paths: ${withPaths}/${tasks.length}`);
  console.log(`   Tasks missing direction: ${withoutDirection}`);
  
  if (withoutDirection === 0 && withCriteria === tasks.length && withPaths === tasks.length) {
    console.log(`\n✅ ALL ACTIVE TASKS HAVE COMPLETE DIRECTION\n`);
  } else {
    console.log(`\n⚠️  SOME TASKS NEED DIRECTION UPDATES\n`);
  }
}

checkTaskDirections().catch(console.error);


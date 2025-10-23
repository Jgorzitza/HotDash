import { getAllActiveTasks } from './app/services/tasks.server';

async function checkDuplicates() {
  const allTasks = await getAllActiveTasks();
  
  console.log('\n📋 ALL ACTIVE TASKS BY AGENT\n');
  console.log('='.repeat(80));
  
  const byAgent = {};
  allTasks.forEach(task => {
    if (byAgent[task.assignedTo] === undefined) byAgent[task.assignedTo] = [];
    byAgent[task.assignedTo].push(task);
  });
  
  Object.entries(byAgent).sort().forEach(([agent, tasks]) => {
    console.log(`\n${agent.toUpperCase()} (${tasks.length} tasks):`);
    tasks.forEach(t => console.log(`  ${t.status === 'in_progress' ? '🔵' : '📌'} ${t.taskId}: ${t.title}`));
  });
  
  // Check for duplicate task IDs
  console.log('\n\n🔍 CHECKING FOR DUPLICATE TASK IDs\n');
  console.log('='.repeat(80));
  
  const taskIdCounts = {};
  allTasks.forEach(task => {
    taskIdCounts[task.taskId] = (taskIdCounts[task.taskId] || 0) + 1;
  });
  
  const duplicates = Object.entries(taskIdCounts).filter(([_, count]) => count > 1);
  
  if (duplicates.length > 0) {
    console.log('\n❌ DUPLICATE TASK IDs FOUND:\n');
    for (const [taskId, count] of duplicates) {
      console.log(`  ${taskId}: ${count} instances`);
      const instances = allTasks.filter(t => t.taskId === taskId);
      instances.forEach(t => console.log(`    - ${t.assignedTo} (${t.status})`));
    }
  } else {
    console.log('\n✅ No duplicate task IDs found');
  }
  
  console.log(`\n\nTotal active tasks: ${allTasks.length}`);
  console.log(`Agents with tasks: ${Object.keys(byAgent).length}`);
  console.log(`Agents with 0 tasks: ${17 - Object.keys(byAgent).length}`);
}

checkDuplicates().catch(console.error);

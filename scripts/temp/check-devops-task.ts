import prisma from '../../app/db.server.js';

async function checkTask() {
  const task = await prisma.taskAssignment.findUnique({
    where: { taskId: 'DEVOPS-LLAMAINDEX-001' }
  });
  
  console.log(JSON.stringify(task, null, 2));
  process.exit(0);
}

checkTask().catch(console.error);


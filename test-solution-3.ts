import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://postgres.mmbjiyhsvniqxibzgyvx:Th3rm0caf3%2F67%21@db.mmbjiyhsvniqxibzgyvx.supabase.co:5432/postgres?connect_timeout=30",
    },
  },
});

async function testSolution3() {
  try {
    console.log('🔧 Testing Solution 3: Direct Connection with IPv4');
    const result = await prisma.taskAssignment.count();
    console.log(`✅ SUCCESS! Found ${result} tasks.`);
    
    // Test the actual script function
    const { getMyTasks } = await import('./app/services/tasks.server');
    const tasks = await getMyTasks('support');
    console.log(`✅ Script works! Found ${tasks.length} tasks for support.`);
    
  } catch (error) {
    console.error('❌ Solution 3 failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testSolution3();

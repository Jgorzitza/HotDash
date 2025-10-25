import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://postgres.mmbjiyhsvniqxibzgyvx:Th3rm0caf3%2F67%21@aws-0-us-east-1.pooler.supabase.com:5432/postgres?connect_timeout=30",
    },
  },
});

async function testSolution2() {
  try {
    console.log('🔧 Testing Solution 2: Session Mode Pooler (Port 5432)');
    const result = await prisma.taskAssignment.count();
    console.log(`✅ SUCCESS! Found ${result} tasks.`);
    
    // Test the actual script function
    const { getMyTasks } = await import('./app/services/tasks.server');
    const tasks = await getMyTasks('support');
    console.log(`✅ Script works! Found ${tasks.length} tasks for support.`);
    
  } catch (error) {
    console.error('❌ Solution 2 failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testSolution2();

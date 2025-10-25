import { PrismaClient } from '@prisma/client';

// Use the working IPv4 address directly
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://postgres.mmbjiyhsvniqxibzgyvx:Th3rm0caf3%2F67%21@3.227.209.82:5432/postgres?connect_timeout=30",
    },
  },
});

async function testFinalWorking() {
  try {
    console.log('🔧 Testing Final Working Solution with IPv4 Address');
    const result = await prisma.taskAssignment.count();
    console.log(`✅ SUCCESS! Found ${result} tasks.`);
    
    // Test the actual script function with the working connection
    const tasks = await prisma.taskAssignment.findMany({
      where: { assignedTo: 'support' },
      orderBy: { priority: 'asc' }
    });
    console.log(`✅ Script works! Found ${tasks.length} tasks for support.`);
    
    if (tasks.length > 0) {
      console.log('📋 Next task:', tasks[0].title);
    }
    
  } catch (error) {
    console.error('❌ Final test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testFinalWorking();

import { PrismaClient } from '@prisma/client';

// Test with IPv4 address format from Supabase docs
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://postgres.mmbjiyhsvniqxibzgyvx:Th3rm0caf3%2F67%21@3.227.209.82:5432/postgres?connect_timeout=30",
    },
  },
});

async function testIPv4Address() {
  try {
    console.log('🔧 Testing with IPv4 Address (3.227.209.82)');
    const result = await prisma.taskAssignment.count();
    console.log(`✅ SUCCESS! Found ${result} tasks.`);
    
    // Test the actual script function
    const { getMyTasks } = await import('./app/services/tasks.server');
    const tasks = await getMyTasks('support');
    console.log(`✅ Script works! Found ${tasks.length} tasks for support.`);
    
  } catch (error) {
    console.error('❌ IPv4 Address failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testIPv4Address();

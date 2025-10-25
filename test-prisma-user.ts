import { PrismaClient } from '@prisma/client';

// Test with custom Prisma user
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://prisma.mmbjiyhsvniqxibzgyvx:Th3rm0caf3%2F67%21@3.227.209.82:5432/postgres?connect_timeout=30",
    },
  },
});

async function testPrismaUser() {
  try {
    console.log('🔧 Testing custom Prisma user connection...');
    
    // Test connection
    const result = await prisma.$queryRaw`SELECT current_user, current_database()`;
    console.log('✅ Connection successful!', result);
    
    // Test table access
    const taskCount = await prisma.taskAssignment.count();
    console.log(`✅ Found ${taskCount} tasks`);
    
    // Test decision log access
    const decisionCount = await prisma.decisionLog.count();
    console.log(`✅ Found ${decisionCount} decision log entries`);
    
  } catch (error) {
    console.error('❌ Prisma user test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaUser();

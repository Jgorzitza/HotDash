import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://postgres.mmbjiyhsvniqxibzgyvx:Th3rm0caf3%2F67%21@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connect_timeout=30",
    },
  },
});

async function testConnection() {
  try {
    console.log('Testing final IPv4 pooler connection...');
    const result = await prisma.taskAssignment.count();
    console.log(`✅ SUCCESS! Found ${result} tasks.`);
    
    // Test the actual script function
    const { getMyTasks } = await import('./app/services/tasks.server');
    const tasks = await getMyTasks('support');
    console.log(`✅ Script works! Found ${tasks.length} tasks for support.`);
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

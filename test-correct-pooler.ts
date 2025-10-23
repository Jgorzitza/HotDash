import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://postgres.mmbjiyhsvniqxibzgyvx:Th3rm0caf3%2F67%21@mmbjiyhsvniqxibzgyvx.pooler.supabase.com:6543/postgres?pgbouncer=true&connect_timeout=30",
    },
  },
});

async function testConnection() {
  try {
    console.log('Testing correct pooler URL...');
    const result = await prisma.taskAssignment.count();
    console.log(`✅ Connection successful! Found ${result} tasks.`);
  } catch (error) {
    console.error('❌ Connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

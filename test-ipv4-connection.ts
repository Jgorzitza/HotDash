import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://prisma.mmbjiyhsvniqxibzgyvx:Th3rm0caf3%2F67%21@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connect_timeout=30",
    },
  },
});

async function testConnection() {
  try {
    console.log('Testing IPv4 pooler connection...');
    const result = await prisma.taskAssignment.count();
    console.log(`✅ Connection successful! Found ${result} tasks.`);
  } catch (error) {
    console.error('❌ Connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

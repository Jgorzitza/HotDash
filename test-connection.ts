import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://prisma.mmbjiyhsvniqxibzgyvx:Th3rm0caf3%2F67%21@db.mmbjiyhsvniqxibzgyvx.supabase.co:5432/postgres?connect_timeout=30",
    },
  },
});

async function testConnection() {
  try {
    console.log('Testing direct connection with Prisma user...');
    const result = await prisma.taskAssignment.count();
    console.log(`✅ Connection successful! Found ${result} tasks.`);
  } catch (error) {
    console.error('❌ Connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

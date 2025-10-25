import { Client } from 'pg';

const client = new Client({
  connectionString: "postgres://prisma.mmbjiyhsvniqxibzgyvx:Th3rm0caf3%2F67%21@db.mmbjiyhsvniqxibzgyvx.supabase.co:5432/postgres",
  connectionTimeoutMillis: 30000,
});

async function testConnection() {
  try {
    console.log('Testing direct pg connection...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const result = await client.query('SELECT COUNT(*) FROM "TaskAssignment"');
    console.log(`✅ Found ${result.rows[0].count} tasks.`);
    
    await client.end();
  } catch (error) {
    console.error('❌ Connection failed:', error);
  }
}

testConnection();

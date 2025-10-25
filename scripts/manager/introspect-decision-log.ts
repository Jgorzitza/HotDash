/**
 * Introspect DecisionLog table to see actual schema
 */

import "dotenv/config";
import prisma from "../../app/db.server";

async function introspect() {
  try {
    const result = await prisma.$queryRaw`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = 'DecisionLog'
      ORDER BY ordinal_position
    `;
    
    console.log('\n📋 DecisionLog Table Schema:\n');
    console.log('Column Name          | Data Type        | Nullable | Default');
    console.log('---------------------|------------------|----------|------------------');
    
    (result as any[]).forEach(col => {
      const name = col.column_name.padEnd(20);
      const type = col.data_type.padEnd(16);
      const nullable = col.is_nullable.padEnd(8);
      const def = (col.column_default || '').substring(0, 18);
      console.log(`${name} | ${type} | ${nullable} | ${def}`);
    });
    
    console.log('\n');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

introspect();


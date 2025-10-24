/**
 * Check audit_log table schema
 */

import "dotenv/config";
import prisma from "../../app/db.server";

async function checkSchema() {
  try {
    const result = await prisma.$queryRaw`
      SELECT 
        column_name,
        data_type,
        is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = 'audit_log'
      ORDER BY ordinal_position
    `;
    
    console.log('\n📋 audit_log Table Schema:\n');
    (result as any[]).forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'required'})`);
    });
    console.log('\n');
    
    // Check row count
    const count = await prisma.$queryRaw`SELECT COUNT(*) as count FROM audit_log`;
    console.log(`Rows in audit_log: ${(count as any[])[0].count}\n`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSchema();


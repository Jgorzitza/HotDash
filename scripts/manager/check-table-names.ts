/**
 * Check what tables actually exist
 */

import "dotenv/config";
import prisma from "../../app/db.server";

async function checkTables() {
  try {
    const result = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND (table_name LIKE '%ecision%' OR table_name LIKE '%audit%')
      ORDER BY table_name
    `;
    
    console.log('\n📋 Tables with "decision" or "audit" in name:\n');
    (result as any[]).forEach(t => console.log(`  - ${t.table_name}`));
    console.log('\n');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();


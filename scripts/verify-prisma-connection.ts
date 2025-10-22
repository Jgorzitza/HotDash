#!/usr/bin/env tsx
/**
 * Prisma + Supabase Connection Verification Script
 * 
 * Usage:
 *   npm run verify:db
 *   OR
 *   npx tsx --env-file=.env scripts/verify-prisma-connection.ts
 */

import { PrismaClient } from '@prisma/client';

async function verifyConnection() {
  console.log('🔍 Verifying Prisma + Supabase Connection\n');
  console.log('=' .repeat(60));
  
  // Test 1: Environment Variables
  console.log('\n1️⃣  Environment Variables');
  const dbUrl = process.env.DATABASE_URL || '';
  const directUrl = process.env.DIRECT_URL || '';
  
  const maskedDbUrl = dbUrl.replace(/:[^:@]+@/, ':***@');
  const maskedDirectUrl = directUrl.replace(/:[^:@]+@/, ':***@');
  
  console.log(`   DATABASE_URL: ${maskedDbUrl || '❌ NOT SET'}`);
  console.log(`   DIRECT_URL:   ${maskedDirectUrl || '❌ NOT SET'}`);
  
  if (!dbUrl) {
    console.error('\n❌ ERROR: DATABASE_URL is not set');
    process.exit(1);
  }
  
  // Test 2: Configuration Check
  console.log('\n2️⃣  Configuration Check');
  const hasIPv4 = /\d+\.\d+\.\d+\.\d+/.test(dbUrl);
  const hasPort6543 = dbUrl.includes(':6543');
  const hasPgBouncer = dbUrl.includes('pgbouncer=true');
  
  console.log(`   Using IPv4:        ${hasIPv4 ? '✅ YES' : '⚠️  NO (using hostname)'}`);
  console.log(`   Using Port 6543:   ${hasPort6543 ? '✅ YES' : '❌ NO'}`);
  console.log(`   PgBouncer enabled: ${hasPgBouncer ? '✅ YES' : '❌ NO'}`);
  
  if (!hasPort6543 || !hasPgBouncer) {
    console.error('\n❌ ERROR: DATABASE_URL configuration is incorrect');
    console.error('   Expected: postgresql://USER:PASS@IPv4:6543/postgres?pgbouncer=true');
    process.exit(1);
  }
  
  // Test 3: Connection Test
  console.log('\n3️⃣  Connection Test');
  const prisma = new PrismaClient();
  
  try {
    await prisma.$connect();
    console.log('   ✅ Connection successful');
  } catch (error) {
    console.error('   ❌ Connection failed:', (error as Error).message);
    process.exit(1);
  }
  
  // Test 4: Query Test
  console.log('\n4️⃣  Query Test');
  try {
    const result = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    const tableCount = Number(result[0].count);
    console.log(`   ✅ Query successful (found ${tableCount} tables in public schema)`);
  } catch (error) {
    console.error('   ❌ Query failed:', (error as Error).message);
    await prisma.$disconnect();
    process.exit(1);
  }
  
  // Test 5: Model Test
  console.log('\n5️⃣  Model Test');
  try {
    const sessionCount = await prisma.session.count();
    console.log(`   ✅ Model query successful (${sessionCount} sessions in database)`);
  } catch (error) {
    console.error('   ❌ Model query failed:', (error as Error).message);
    await prisma.$disconnect();
    process.exit(1);
  }
  
  await prisma.$disconnect();
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('✅ All checks passed! Prisma is correctly configured.');
  console.log('='.repeat(60));
  console.log('\n📝 Notes:');
  console.log('   • DATABASE_URL uses transaction pooling (port 6543)');
  console.log('   • DIRECT_URL should use direct connection (port 5432)');
  console.log('   • inet_server_addr() showing IPv6 is EXPECTED (backend server)');
  console.log('   • Connection goes: App → Pooler (IPv4:6543) → DB (IPv6:5432)');
  console.log('');
}

verifyConnection().catch((error) => {
  console.error('\n💥 Unexpected error:', error);
  process.exit(1);
});


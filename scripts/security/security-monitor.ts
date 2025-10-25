#!/usr/bin/env tsx

/**
 * SECURITY MONITORING SCRIPT
 * 
 * This script monitors database security and alerts on suspicious activity.
 * Run this script regularly to ensure database security is maintained.
 */

import { PrismaClient } from '@prisma/client';
import { createSecurityMonitor } from '../../app/services/security/database-security';

const prisma = new PrismaClient();

async function runSecurityMonitor() {
  console.log('🔒 SECURITY MONITORING STARTED');
  console.log('='.repeat(50));

  try {
    const monitor = createSecurityMonitor();

    // 1. Check for suspicious activity
    console.log('🔍 Checking for suspicious activity...');
    const suspiciousActivity = await monitor.detectSuspiciousActivity();
    
    if (suspiciousActivity.length > 0) {
      console.log('🚨 SUSPICIOUS ACTIVITY DETECTED:');
      suspiciousActivity.forEach(activity => {
        console.log(`   Agent: ${activity.agent_name}`);
        console.log(`   Operations: ${activity.operation_count}`);
        console.log(`   Types: ${activity.suspicious_operations.join(', ')}`);
        console.log('');
      });
    } else {
      console.log('✅ No suspicious activity detected');
    }

    // 2. Check security alerts
    console.log('📢 Checking security alerts...');
    const alerts = await monitor.getSecurityAlerts();
    
    if (alerts.length > 0) {
      console.log('🚨 SECURITY ALERTS:');
      alerts.forEach(alert => {
        console.log(`   Time: ${alert.timestamp}`);
        console.log(`   Agent: ${alert.agent_name}`);
        console.log(`   Operation: ${alert.operation}`);
        console.log(`   Data: ${JSON.stringify(alert.new_data, null, 2)}`);
        console.log('');
      });
    } else {
      console.log('✅ No security alerts');
    }

    // 3. Check RLS policies
    console.log('🛡️ Checking Row Level Security policies...');
    const rlsStatus = await prisma.$queryRaw<Array<{
      schemaname: string;
      tablename: string;
      rowsecurity: boolean;
    }>>`
      SELECT schemaname, tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;

    const tablesWithoutRLS = rlsStatus.filter(table => !table.rowsecurity);
    
    if (tablesWithoutRLS.length > 0) {
      console.log('🚨 TABLES WITHOUT RLS:');
      tablesWithoutRLS.forEach(table => {
        console.log(`   ${table.schemaname}.${table.tablename}`);
      });
    } else {
      console.log('✅ All tables have RLS enabled');
    }

    // 4. Check audit triggers
    console.log('📝 Checking audit triggers...');
    const triggerStatus = await prisma.$queryRaw<Array<{
      trigger_name: string;
      table_name: string;
    }>>`
      SELECT t.tgname as trigger_name, c.relname as table_name
      FROM pg_trigger t
      JOIN pg_class c ON c.oid = t.tgrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND t.tgname LIKE 'audit_%'
      ORDER BY c.relname
    `;

    console.log(`✅ Found ${triggerStatus.length} audit triggers:`);
    triggerStatus.forEach(trigger => {
      console.log(`   ${trigger.trigger_name} on ${trigger.table_name}`);
    });

    // 5. Check recent operations
    console.log('📊 Recent database operations (last hour)...');
    const recentOps = await prisma.$queryRaw<Array<{
      agent_name: string;
      operation_count: bigint;
      last_operation: string;
    }>>`
      SELECT 
        agent_name,
        COUNT(*) as operation_count,
        MAX(timestamp) as last_operation
      FROM audit_log
      WHERE timestamp > NOW() - INTERVAL '1 hour'
      GROUP BY agent_name
      ORDER BY operation_count DESC
    `;

    if (recentOps.length > 0) {
      console.log('Recent activity:');
      recentOps.forEach(op => {
        console.log(`   ${op.agent_name}: ${op.operation_count} operations (last: ${op.last_operation})`);
      });
    } else {
      console.log('   No recent operations');
    }

    // 6. Create security backup if needed
    console.log('💾 Creating security backup...');
    const backupName = await monitor.createSecurityBackup();
    console.log(`✅ Security backup created: ${backupName}`);

    // 7. Final security status
    console.log('\n🎯 SECURITY STATUS SUMMARY:');
    console.log(`   Tables with RLS: ${rlsStatus.filter(t => t.rowsecurity).length}/${rlsStatus.length}`);
    console.log(`   Audit triggers: ${triggerStatus.length}`);
    console.log(`   Recent operations: ${recentOps.reduce((sum, op) => sum + Number(op.operation_count), 0)}`);
    console.log(`   Suspicious activity: ${suspiciousActivity.length}`);
    console.log(`   Security alerts: ${alerts.length}`);

    if (suspiciousActivity.length === 0 && alerts.length === 0 && tablesWithoutRLS.length === 0) {
      console.log('\n✅ ALL SECURITY CHECKS PASSED');
    } else {
      console.log('\n🚨 SECURITY ISSUES DETECTED - REVIEW REQUIRED');
    }

  } catch (error) {
    console.error('❌ Security monitoring failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the security monitor
runSecurityMonitor();

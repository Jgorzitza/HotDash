#!/usr/bin/env node
/**
 * KPI Dashboard Monitoring Script
 * Automated metrics collection and alerting
 * Growth Spec I1-I8
 * 
 * Usage: node scripts/monitoring/kpi-dashboard-check.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:45001';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkDashboards() {
  console.log('=== KPI Dashboard Health Check ===');
  console.log(`Timestamp: ${new Date().toISOString()}\n`);
  
  // Dashboard 1: Action Throughput
  console.log('📊 Dashboard 1: Action Throughput');
  const { data: backlog } = await supabase
    .from('v_action_backlog_current')
    .select('*')
    .single();
    
  if (backlog) {
    console.log(`  Pending: ${backlog.pending_count || 0}`);
    console.log(`  Approved: ${backlog.approved_count || 0}`);
    console.log(`  Rejected: ${backlog.rejected_count || 0}`);
    console.log(`  Oldest Pending: ${backlog.oldest_age_minutes ? `${Math.round(backlog.oldest_age_minutes)}min` : 'N/A'}`);
    
    // Alert if backlog > 1000
    if (backlog.pending_count > 1000) {
      console.log(`  ⚠️  ALERT: Backlog exceeds 1000 (${backlog.pending_count})`);
    }
  }
  
  // Dashboard 2: Daily Metrics
  console.log('\n📊 Dashboard 2: Approvals (Last 7 Days)');
  const { data: daily } = await supabase
    .from('v_daily_approval_metrics')
    .select('*')
    .order('day', { ascending: false })
    .limit(7);
    
  if (daily && daily.length > 0) {
    console.log(`  Total Actions: ${daily.reduce((sum, d) => sum + (d.total_actions || 0), 0)}`);
    console.log(`  Avg Approval Rate: ${(daily.reduce((sum, d) => sum + (d.approval_rate_pct || 0), 0) / daily.length).toFixed(1)}%`);
  }
  
  // Dashboard 4: System Health
  console.log('\n📊 Dashboard 4: System Health');
  const { data: health } = await supabase
    .from('v_system_health_current')
    .select('*')
    .single();
    
  if (health) {
    console.log(`  Queue Depth: ${health.queue_depth || 0}`);
    console.log(`  Errors (Last Hour): ${health.errors_last_hour || 0}`);
    console.log(`  Avg Response Time: ${health.avg_response_ms_last_hour ? `${Math.round(health.avg_response_ms_last_hour)}ms` : 'N/A'}`);
    console.log(`  Actions (Last Hour): ${health.actions_last_hour || 0}`);
    
    // Alert if error count high
    if (health.errors_last_hour > 10) {
      console.log(`  ⚠️  ALERT: High error count (${health.errors_last_hour})`);
    }
  }
  
  // Agent Performance
  console.log('\n📊 Agent Performance');
  const { data: agents } = await supabase
    .from('v_agent_performance_summary')
    .select('*')
    .order('day', { ascending: false })
    .limit(10);
    
  if (agents && agents.length > 0) {
    agents.forEach(agent => {
      const rate = agent.self_correction_rate_pct || 0;
      console.log(`  ${agent.agent_name}: ${agent.total_runs || 0} runs, ${rate.toFixed(1)}% self-correction`);
    });
  } else {
    console.log('  No agent data available yet');
  }
  
  console.log('\n✅ Dashboard check complete');
  console.log(`Timestamp: ${new Date().toISOString()}`);
}

checkDashboards().catch(console.error);

#!/usr/bin/env node
/**
 * SLO Tracking System - Service Level Objectives
 * Priority: P1-T3
 * Growth Spec: I (KPIs)
 * 
 * Tracks SLOs and error budgets for growth automation
 * Usage: node scripts/monitoring/slo-tracking.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:45001';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// SLO Definitions (Growth Spec)
const SLOS = {
  actionApiAvailability: {
    name: 'Action API Availability',
    target: 99.9,
    unit: '%',
    measurement: 'uptime',
  },
  approvalLatency: {
    name: 'Action Approval Latency',
    target: 500,
    unit: 'ms',
    measurement: 'p95',
  },
  recommenderSuccess: {
    name: 'Recommender Success Rate',
    target: 95,
    unit: '%',
    measurement: 'approval_rate',
  },
  executorSuccess: {
    name: 'Executor Success Rate',
    target: 98,
    unit: '%',
    measurement: 'execution_rate',
  },
  dataFreshness: {
    name: 'Data Pipeline Freshness',
    target: 6,
    unit: 'hours',
    measurement: 'max_age',
  },
};

// Error budget calculations (30-day window)
const ERROR_BUDGET_WINDOW_DAYS = 30;

function calculateErrorBudget(sloTarget, actualPerformance) {
  const allowedFailurePercent = 100 - sloTarget;
  const actualFailurePercent = 100 - actualPerformance;
  const errorBudget = allowedFailurePercent - actualFailurePercent;
  const errorBudgetConsumed = (actualFailurePercent / allowedFailurePercent) * 100;
  
  return {
    allowedFailurePercent,
    actualFailurePercent,
    errorBudgetRemaining: errorBudget,
    errorBudgetConsumedPercent: errorBudgetConsumed,
    status: errorBudgetConsumed > 100 ? 'EXCEEDED' : errorBudgetConsumed > 75 ? 'WARNING' : 'OK',
  };
}

function calculateBurnRate(consumed30day, windowHours = 24) {
  // Burn rate: how fast are we consuming error budget
  // If we continue at current rate, how many days until budget exhausted?
  const currentBurnRate = consumed30day / 30; // % per day
  const daysUntilExhausted = (100 - consumed30day) / currentBurnRate;
  
  return {
    currentBurnRate: currentBurnRate.toFixed(2),
    daysUntilExhausted: Math.round(daysUntilExhausted),
    alert: daysUntilExhausted < 7 ? 'CRITICAL' : daysUntilExhausted < 14 ? 'WARNING' : 'OK',
  };
}

async function trackSLOs() {
  console.log('=== SLO Tracking System ===');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Window: ${ERROR_BUDGET_WINDOW_DAYS} days\n`);
  
  const sloResults = [];
  
  // SLO 1: Action API Availability (99.9%)
  console.log('📊 SLO 1: Action API Availability');
  console.log(`  Target: ${SLOS.actionApiAvailability.target}%`);
  
  // Calculate based on observability_logs
  const { data: apiLogs } = await supabase
    .from('observability_logs')
    .select('*', { count: 'exact' })
    .gte('created_at', new Date(Date.now() - ERROR_BUDGET_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString());
    
  const totalRequests = apiLogs?.length || 0;
  const { data: errorLogs } = await supabase
    .from('observability_logs')
    .select('*', { count: 'exact' })
    .eq('level', 'ERROR')
    .gte('created_at', new Date(Date.now() - ERROR_BUDGET_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString());
    
  const errorRequests = errorLogs?.length || 0;
  
  if (totalRequests > 0) {
    const availability = ((totalRequests - errorRequests) / totalRequests) * 100;
    const budget = calculateErrorBudget(SLOS.actionApiAvailability.target, availability);
    const burn = calculateBurnRate(budget.errorBudgetConsumedPercent);
    
    console.log(`  Actual: ${availability.toFixed(3)}%`);
    console.log(`  Error Budget: ${budget.errorBudgetRemaining.toFixed(3)}% remaining (${budget.status})`);
    console.log(`  Burn Rate: ${burn.currentBurnRate}%/day (${burn.alert})`);
    
    sloResults.push({ slo: 'actionApiAvailability', ...budget, burnRate: burn });
  } else {
    console.log(`  ℹ️  No data yet`);
  }
  
  // SLO 2: Approval Latency (p95 < 500ms)
  console.log('\n📊 SLO 2: Action Approval Latency');
  console.log(`  Target: < ${SLOS.approvalLatency.target}ms (p95)`);
  
  const { data: approvals } = await supabase
    .from('agent_approvals')
    .select('created_at, updated_at, status')
    .neq('status', 'pending')
    .gte('created_at', new Date(Date.now() - ERROR_BUDGET_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString());
    
  if (approvals && approvals.length > 0) {
    const latencies = approvals
      .map(a => new Date(a.updated_at).getTime() - new Date(a.created_at).getTime())
      .sort((a, b) => a - b);
    const p95Index = Math.floor(latencies.length * 0.95);
    const p95Latency = latencies[p95Index] || 0;
    
    const meetingSLO = p95Latency < SLOS.approvalLatency.target;
    const sloCompliance = (latencies.filter(l => l < SLOS.approvalLatency.target).length / latencies.length) * 100;
    const budget = calculateErrorBudget(95, sloCompliance); // Assuming 95% should meet SLO
    
    console.log(`  Actual: ${p95Latency}ms (p95)`);
    console.log(`  SLO Compliance: ${sloCompliance.toFixed(1)}%`);
    console.log(`  Status: ${meetingSLO ? '✅ MEETING SLO' : '❌ VIOLATING SLO'}`);
    
    sloResults.push({ slo: 'approvalLatency', p95: p95Latency, ...budget });
  } else {
    console.log(`  ℹ️  No approval data yet`);
  }
  
  // SLO 3: Recommender Success Rate (> 95%)
  console.log('\n📊 SLO 3: Recommender Success Rate');
  console.log(`  Target: > ${SLOS.recommenderSuccess.target}%`);
  
  const { data: dailyMetrics } = await supabase
    .from('v_daily_approval_metrics')
    .select('*')
    .gte('day', new Date(Date.now() - ERROR_BUDGET_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString());
    
  if (dailyMetrics && dailyMetrics.length > 0) {
    const avgApprovalRate = dailyMetrics.reduce((sum, d) => sum + (d.approval_rate_pct || 0), 0) / dailyMetrics.length;
    const meetingSLO = avgApprovalRate > SLOS.recommenderSuccess.target;
    const budget = calculateErrorBudget(SLOS.recommenderSuccess.target, avgApprovalRate);
    const burn = calculateBurnRate(budget.errorBudgetConsumedPercent);
    
    console.log(`  Actual: ${avgApprovalRate.toFixed(1)}%`);
    console.log(`  Error Budget: ${budget.errorBudgetRemaining.toFixed(1)}% remaining (${budget.status})`);
    console.log(`  Status: ${meetingSLO ? '✅ MEETING SLO' : '❌ VIOLATING SLO'}`);
    
    sloResults.push({ slo: 'recommenderSuccess', ...budget, burnRate: burn });
  } else {
    console.log(`  ℹ️  No recommender data yet`);
  }
  
  // Summary
  console.log('\n=== SLO Summary ===');
  const violating = sloResults.filter(s => s.status === 'EXCEEDED').length;
  const warnings = sloResults.filter(s => s.status === 'WARNING').length;
  
  if (violating > 0) {
    console.log(`❌ SLO VIOLATIONS: ${violating}`);
  }
  if (warnings > 0) {
    console.log(`⚠️  SLO WARNINGS: ${warnings}`);
  }
  if (sloResults.length === 0) {
    console.log(`ℹ️  Awaiting data for SLO tracking`);
  } else if (violating === 0 && warnings === 0) {
    console.log(`✅ All SLOs met`);
  }
  
  console.log(`\nSLOs Tracked: ${sloResults.length}/5`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  
  return sloResults;
}

trackSLOs().catch(console.error);

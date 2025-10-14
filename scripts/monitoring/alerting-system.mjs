#!/usr/bin/env node
/**
 * Alerting System - Proactive Issue Detection
 * Growth Spec H3
 * Priority: P1-T2
 * 
 * Monitors KPI dashboards and triggers alerts based on thresholds
 * Usage: node scripts/monitoring/alerting-system.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:45001';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Alert thresholds (Growth Spec H3)
const THRESHOLDS = {
  backlog_critical: 1000,        // Action backlog > 1000
  recommender_failure: 10,       // Recommender failure rate > 10%
  executor_error: 5,             // Executor error rate > 5%
  data_pipeline_stale: 24,       // Data pipeline stale > 24 hours
  api_error_rate: 1,             // API error rate > 1%
  response_time_warning: 500,    // p95 latency > 500ms
  response_time_critical: 1000,  // p95 latency > 1000ms
};

// Alert severity levels
const SEVERITY = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  CRITICAL: 'CRITICAL',
};

const alerts = [];

function addAlert(severity, category, message, value, threshold) {
  alerts.push({
    timestamp: new Date().toISOString(),
    severity,
    category,
    message,
    value,
    threshold,
  });
  
  const icon = severity === 'CRITICAL' ? '🚨' : severity === 'WARNING' ? '⚠️' : 'ℹ️';
  console.log(`${icon} [${severity}] ${category}: ${message} (${value} vs ${threshold} threshold)`);
}

async function checkAlerts() {
  console.log('=== Alerting System - Proactive Monitoring ===');
  console.log(`Timestamp: ${new Date().toISOString()}\n`);
  
  // Alert Rule 1: Action Backlog > 1000
  console.log('🔍 Checking Alert Rule 1: Action Backlog...');
  const { data: backlog } = await supabase
    .from('v_action_backlog_current')
    .select('*')
    .single();
    
  if (backlog) {
    if (backlog.pending_count > THRESHOLDS.backlog_critical) {
      addAlert(
        SEVERITY.CRITICAL,
        'Capacity',
        'Action backlog exceeds critical threshold',
        backlog.pending_count,
        THRESHOLDS.backlog_critical
      );
    } else if (backlog.pending_count > THRESHOLDS.backlog_critical * 0.7) {
      addAlert(
        SEVERITY.WARNING,
        'Capacity',
        'Action backlog approaching threshold',
        backlog.pending_count,
        Math.round(THRESHOLDS.backlog_critical * 0.7)
      );
    } else {
      console.log('  ✅ OK: Backlog normal (' + (backlog.pending_count || 0) + ')');
    }
  }
  
  // Alert Rule 2: Recommender Failure Rate > 10%
  console.log('\n🔍 Checking Alert Rule 2: Recommender Failure Rate...');
  const { data: daily } = await supabase
    .from('v_daily_approval_metrics')
    .select('*')
    .order('day', { ascending: false })
    .limit(1);
    
  if (daily && daily.length > 0) {
    const rejectionRate = 100 - (daily[0].approval_rate_pct || 0);
    if (rejectionRate > THRESHOLDS.recommender_failure) {
      addAlert(
        SEVERITY.CRITICAL,
        'Quality',
        'Recommender rejection rate exceeds threshold',
        `${rejectionRate.toFixed(1)}%`,
        `${THRESHOLDS.recommender_failure}%`
      );
    } else {
      console.log(`  ✅ OK: Rejection rate normal (${rejectionRate.toFixed(1)}%)`);
    }
  } else {
    console.log('  ℹ️  No data: Awaiting recommender activity');
  }
  
  // Alert Rule 3: API Error Rate > 1%
  console.log('\n🔍 Checking Alert Rule 3: API Error Rate...');
  const { data: health } = await supabase
    .from('v_system_health_current')
    .select('*')
    .single();
    
  if (health) {
    const errorCount = health.errors_last_hour || 0;
    const actionCount = health.actions_last_hour || 0;
    const totalActivity = errorCount + actionCount;
    
    if (totalActivity > 0) {
      const errorRate = (errorCount / totalActivity) * 100;
      if (errorRate > THRESHOLDS.api_error_rate) {
        addAlert(
          SEVERITY.CRITICAL,
          'Reliability',
          'API error rate exceeds threshold',
          `${errorRate.toFixed(2)}%`,
          `${THRESHOLDS.api_error_rate}%`
        );
      } else {
        console.log(`  ✅ OK: Error rate normal (${errorRate.toFixed(2)}%)`);
      }
    } else {
      console.log('  ℹ️  No activity: System idle');
    }
  }
  
  // Alert Rule 4: Response Time
  console.log('\n🔍 Checking Alert Rule 4: API Response Time...');
  const { data: apiMetrics } = await supabase
    .from('v_api_health_metrics')
    .select('*')
    .order('hour', { ascending: false })
    .limit(1);
    
  if (apiMetrics && apiMetrics.length > 0) {
    const p95 = apiMetrics[0].p95_response_ms;
    if (p95 > THRESHOLDS.response_time_critical) {
      addAlert(
        SEVERITY.CRITICAL,
        'Performance',
        'P95 latency exceeds critical threshold',
        `${Math.round(p95)}ms`,
        `${THRESHOLDS.response_time_critical}ms`
      );
    } else if (p95 > THRESHOLDS.response_time_warning) {
      addAlert(
        SEVERITY.WARNING,
        'Performance',
        'P95 latency exceeds warning threshold',
        `${Math.round(p95)}ms`,
        `${THRESHOLDS.response_time_warning}ms`
      );
    } else if (p95) {
      console.log(`  ✅ OK: Latency normal (${Math.round(p95)}ms)`);
    }
  } else {
    console.log('  ℹ️  No data: Awaiting API activity');
  }
  
  // Summary
  console.log('\n=== Alert Summary ===');
  const critical = alerts.filter(a => a.severity === 'CRITICAL').length;
  const warnings = alerts.filter(a => a.severity === 'WARNING').length;
  
  if (critical > 0) {
    console.log(`🚨 CRITICAL ALERTS: ${critical}`);
  }
  if (warnings > 0) {
    console.log(`⚠️  WARNINGS: ${warnings}`);
  }
  if (alerts.length === 0) {
    console.log('✅ All systems normal - no alerts');
  }
  
  console.log(`\nTotal Alerts: ${alerts.length}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  
  return alerts;
}

// Run alerting check
checkAlerts()
  .then((alerts) => {
    if (alerts.some(a => a.severity === 'CRITICAL')) {
      process.exit(1); // Exit with error code for CI/CD integration
    }
  })
  .catch((error) => {
    console.error('❌ Alerting system error:', error.message);
    process.exit(1);
  });

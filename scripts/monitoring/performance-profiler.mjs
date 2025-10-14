#!/usr/bin/env node
/**
 * Performance Profiling System
 * Priority: P3-T6
 * 
 * Identifies bottlenecks in recommender processing, action execution, API, and database
 * Usage: node scripts/monitoring/performance-profiler.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:45001';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Performance baselines (from earlier monitoring)
const BASELINES = {
  agentSDK: 195, // ms
  llamaIndexMCP: 255, // ms
  apiResponse: 200, // ms (target)
  dbQuery: 50, // ms (target)
  recommenderProcessing: 2000, // ms (target for full cycle)
  actionExecution: 5000, // ms (target for full execution)
};

async function profileRecommenderPerformance() {
  console.log('\n📊 Recommender Processing Time');
  
  // Check agent performance metrics
  const { data: agents } = await supabase
    .from('v_agent_performance_summary')
    .select('*')
    .order('day', { ascending: false })
    .limit(10);
    
  if (agents && agents.length > 0) {
    agents.forEach(agent => {
      const duration = agent.avg_duration_seconds || 0;
      const durationMs = duration * 1000;
      const status = durationMs < BASELINES.recommenderProcessing ? '✅' : '⚠️';
      
      console.log(`  ${status} ${agent.agent_name}: ${Math.round(durationMs)}ms avg`);
      
      if (durationMs > BASELINES.recommenderProcessing) {
        console.log(`      ⚠️  Exceeds baseline (${BASELINES.recommenderProcessing}ms)`);
      }
    });
  } else {
    console.log('  ℹ️  No agent performance data yet');
  }
}

async function profileActionExecution() {
  console.log('\n📊 Action Execution Duration');
  
  // Check approval processing times
  const { data: approvals } = await supabase
    .from('agent_approvals')
    .select('created_at, updated_at, status')
    .neq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(100);
    
  if (approvals && approvals.length > 0) {
    const durations = approvals.map(a =>
      new Date(a.updated_at).getTime() - new Date(a.created_at).getTime()
    );
    
    const avg = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const p50 = durations.sort((a, b) => a - b)[Math.floor(durations.length * 0.5)];
    const p95 = durations[Math.floor(durations.length * 0.95)];
    const p99 = durations[Math.floor(durations.length * 0.99)];
    
    console.log(`  Average: ${Math.round(avg)}ms`);
    console.log(`  P50: ${Math.round(p50)}ms`);
    console.log(`  P95: ${Math.round(p95)}ms`);
    console.log(`  P99: ${Math.round(p99)}ms`);
    
    if (p95 > BASELINES.actionExecution) {
      console.log(`  ⚠️  P95 exceeds baseline (${BASELINES.actionExecution}ms)`);
    } else {
      console.log(`  ✅ Performance within baseline`);
    }
  } else {
    console.log('  ℹ️  No action execution data yet');
  }
}

async function profileAPIPerformance() {
  console.log('\n📊 API Response Times');
  
  // Check API performance from observability logs
  const { data: apiMetrics } = await supabase
    .from('v_api_health_metrics')
    .select('*')
    .order('hour', { ascending: false })
    .limit(24);
    
  if (apiMetrics && apiMetrics.length > 0) {
    const avgResponse = apiMetrics.reduce((sum, m) => sum + (m.avg_response_ms || 0), 0) / apiMetrics.length;
    const avgP95 = apiMetrics.reduce((sum, m) => sum + (m.p95_response_ms || 0), 0) / apiMetrics.length;
    
    console.log(`  Average: ${Math.round(avgResponse)}ms`);
    console.log(`  P95: ${Math.round(avgP95)}ms`);
    
    if (avgP95 > BASELINES.apiResponse) {
      console.log(`  ⚠️  P95 exceeds baseline (${BASELINES.apiResponse}ms)`);
    } else {
      console.log(`  ✅ Performance within baseline`);
    }
    
    // Identify slow endpoints
    const slowHours = apiMetrics.filter(m => (m.p95_response_ms || 0) > BASELINES.apiResponse);
    if (slowHours.length > 0) {
      console.log(`  ⚠️  Slow hours detected: ${slowHours.length}/24`);
    }
  } else {
    console.log('  ℹ️  No API performance data yet');
  }
}

async function profileDatabaseQueries() {
  console.log('\n📊 Database Query Performance');
  
  // Test key queries
  const queries = [
    { name: 'Health check', query: () => supabase.from('v_system_health_current').select('*').single() },
    { name: 'Backlog check', query: () => supabase.from('v_action_backlog_current').select('*').single() },
    { name: 'Throughput hourly', query: () => supabase.from('v_action_throughput_hourly').select('*').limit(24) },
    { name: 'Agent performance', query: () => supabase.from('v_agent_performance_summary').select('*').limit(10) },
  ];
  
  for (const q of queries) {
    const start = Date.now();
    await q.query();
    const duration = Date.now() - start;
    
    const status = duration < BASELINES.dbQuery ? '✅' : '⚠️';
    console.log(`  ${status} ${q.name}: ${duration}ms`);
    
    if (duration > BASELINES.dbQuery * 2) {
      console.log(`      ⚠️  Slow query (2x baseline)`);
    }
  }
}

async function identifyBottlenecks() {
  console.log('\n🔍 Bottleneck Identification');
  
  // Analyze performance data to find bottlenecks
  const bottlenecks = [];
  
  // Check for slow queries
  const { data: apiMetrics } = await supabase
    .from('v_api_health_metrics')
    .select('*')
    .order('p95_response_ms', { ascending: false })
    .limit(5);
    
  if (apiMetrics && apiMetrics.length > 0) {
    apiMetrics.forEach(m => {
      if ((m.p95_response_ms || 0) > BASELINES.apiResponse * 2) {
        bottlenecks.push({
          type: 'API',
          metric: `P95 ${Math.round(m.p95_response_ms)}ms`,
          threshold: `${BASELINES.apiResponse}ms`,
          severity: 'HIGH',
        });
      }
    });
  }
  
  if (bottlenecks.length > 0) {
    console.log(`  ⚠️  ${bottlenecks.length} bottlenecks identified:`);
    bottlenecks.forEach(b => {
      console.log(`    - ${b.type}: ${b.metric} (threshold: ${b.threshold})`);
    });
  } else {
    console.log(`  ✅ No significant bottlenecks detected`);
  }
  
  return bottlenecks;
}

async function generateOptimizationRecommendations(bottlenecks) {
  console.log('\n💡 Optimization Recommendations');
  
  if (bottlenecks.length === 0) {
    console.log('  ✅ System performing well - no optimizations needed');
    return [];
  }
  
  const recommendations = [];
  
  bottlenecks.forEach(b => {
    if (b.type === 'API') {
      recommendations.push({
        priority: 'HIGH',
        area: 'API Performance',
        recommendation: 'Add response caching for frequently accessed endpoints',
        expectedImprovement: '50-70% reduction in response time',
      });
      recommendations.push({
        priority: 'MEDIUM',
        area: 'Database',
        recommendation: 'Optimize slow queries with indexes',
        expectedImprovement: '30-50% reduction in query time',
      });
    }
  });
  
  recommendations.forEach((r, i) => {
    console.log(`  ${i + 1}. [${r.priority}] ${r.area}: ${r.recommendation}`);
    console.log(`     Expected: ${r.expectedImprovement}`);
  });
  
  return recommendations;
}

async function runPerformanceProfiling() {
  console.log('=== Performance Profiling System ===');
  console.log(`Timestamp: ${new Date().toISOString()}\n`);
  
  console.log('🎯 Performance Baselines:');
  console.log(`  Agent SDK: ${BASELINES.agentSDK}ms`);
  console.log(`  LlamaIndex MCP: ${BASELINES.llamaIndexMCP}ms`);
  console.log(`  API Response: ${BASELINES.apiResponse}ms`);
  console.log(`  DB Query: ${BASELINES.dbQuery}ms`);
  
  // Profile all areas
  await profileRecommenderPerformance();
  await profileActionExecution();
  await profileAPIPerformance();
  await profileDatabaseQueries();
  
  // Identify bottlenecks
  const bottlenecks = await identifyBottlenecks();
  
  // Generate recommendations
  await generateOptimizationRecommendations(bottlenecks);
  
  console.log('\n✅ Performance profiling complete');
  console.log(`Timestamp: ${new Date().toISOString()}`);
}

runPerformanceProfiling().catch(console.error);

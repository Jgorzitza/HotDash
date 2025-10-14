# Performance Profiling System
**Created**: 2025-10-14  
**Owner**: Reliability  
**Status**: Operational  
**Priority**: P3-T6

## Overview

Automated performance profiling that identifies bottlenecks in recommender processing, action execution, API response times, and database queries.

## Profiling Targets

### 1. Recommender Processing Time
**Baseline**: < 2000ms (full cycle)  
**Metrics**: Average duration from v_agent_performance_summary  
**Optimization Target**: < 1500ms

**Measured**:
- Agent execution time
- Resolution time
- Self-correction rate
- Cost per run

### 2. Action Execution Duration
**Baseline**: < 5000ms (full execution)  
**Metrics**: Approval processing time (updated_at - created_at)  
**Optimization Target**: < 3000ms

**Measured**:
- Average execution time
- P50, P95, P99 latencies
- Distribution by action type

### 3. API Response Times
**Baseline**: < 200ms average, < 500ms p95  
**Metrics**: From v_api_health_metrics  
**Optimization Target**: < 150ms avg, < 300ms p95

**Measured**:
- Average response time
- P95 latency
- Error rate correlation
- Slow endpoint identification

### 4. Database Query Performance
**Baseline**: < 50ms per query  
**Metrics**: Direct query timing  
**Optimization Target**: < 30ms

**Measured**:
- View query performance
- Index usage
- Query execution plans
- Slow query identification

## Performance Baselines

Established from production monitoring:
- **Agent SDK**: 195ms (service response)
- **LlamaIndex MCP**: 255ms (service response)
- **API Response**: 200ms (target)
- **DB Query**: 50ms (target for views)
- **Recommender**: 2000ms (full processing)
- **Action Execution**: 5000ms (full cycle)

## Current Performance (2025-10-14)

### Database Queries ✅
- Health check: 31ms (✅ 38% under baseline)
- Backlog check: 13ms (✅ 74% under baseline)
- Throughput hourly: 34ms (✅ 32% under baseline)
- Agent performance: 12ms (✅ 76% under baseline)

**Status**: All queries well-optimized

### Services ✅
- Agent SDK: 195ms (✅ within target)
- LlamaIndex MCP: 255ms (✅ within target)

**Status**: Services performing optimally

### Pending Data
- Recommender processing: Awaiting production activity
- Action execution: Awaiting production activity  
- API endpoints: Awaiting traffic

## Bottleneck Detection

### Algorithm
1. Compare metrics against baselines
2. Identify outliers (> 2x baseline)
3. Categorize by severity (HIGH/MEDIUM/LOW)
4. Generate optimization recommendations

### Thresholds
- **HIGH**: > 2x baseline
- **MEDIUM**: 1.5-2x baseline
- **LOW**: 1.2-1.5x baseline
- **OK**: < 1.2x baseline

## Optimization Recommendations

### Automated Recommendations
Based on bottleneck analysis:

**API Bottlenecks** →
- Add response caching
- Optimize database queries
- Add CDN for static assets

**Database Bottlenecks** →
- Add missing indexes
- Optimize query plans
- Use materialized views

**Recommender Bottlenecks** →
- Parallelize processing
- Add result caching
- Optimize LlamaIndex queries

**Execution Bottlenecks** →
- Add async processing
- Batch API calls
- Optimize retry logic

## Usage

### Manual Profiling
```bash
# Run performance profiler
node scripts/monitoring/performance-profiler.mjs

# Output shows:
# - Current performance vs baselines
# - Bottleneck identification
# - Optimization recommendations
```

### Scheduled Profiling
```bash
# Run hourly performance check
0 * * * * cd /path/to/hot-dash && node scripts/monitoring/performance-profiler.mjs >> logs/performance.log 2>&1

# Weekly comprehensive report
0 0 * * 0 cd /path/to/hot-dash && node scripts/monitoring/performance-profiler.mjs > reports/performance-$(date +\%Y-\%m-\%d).log
```

### Integration with CI/CD
```bash
# Fail build if performance regresses
node scripts/monitoring/performance-profiler.mjs
if [ $? -ne 0 ]; then
  echo "Performance regression detected"
  exit 1
fi
```

## APM Integration

### Built-in Profiling
- Database query timing (via observability_logs)
- API response time tracking
- Service latency monitoring

### External APM (Future)
- Datadog integration
- New Relic integration
- Custom metrics export

## Slow Query Identification

### Database Query Analysis
```sql
-- Identify slowest queries (from pg_stat_statements)
SELECT 
  query,
  calls,
  total_exec_time / calls as avg_time_ms,
  total_exec_time
FROM pg_stat_statements
ORDER BY avg_time_ms DESC
LIMIT 10;
```

### View Performance
```sql
-- Check view query plans
EXPLAIN ANALYZE SELECT * FROM v_action_throughput_hourly;
EXPLAIN ANALYZE SELECT * FROM v_recommender_performance;
EXPLAIN ANALYZE SELECT * FROM v_system_health_current;
```

## Performance Baselines Documentation

### Establishment
Baselines established from:
- Agent SDK health checks (Tasks 2-5)
- Database query profiling (Task 6.1)
- API response time monitoring (P1-T1)

### Updates
Baselines should be updated:
- After major optimizations
- Quarterly performance reviews
- When infrastructure changes (scaling, new regions)

## Files

- **Profiler**: `scripts/monitoring/performance-profiler.mjs`
- **Docs**: `docs/monitoring/PERFORMANCE_PROFILING.md` (this file)
- **Baselines**: Defined in performance-profiler.mjs BASELINES constant

## Next Steps

1. Integrate with APM tool (Datadog/New Relic)
2. Add frontend performance profiling (Lighthouse)
3. Create performance regression tests
4. Set up continuous profiling in production

---

**Evidence**: Profiler operational, baselines established, queries optimized (<50ms)
**Timestamp**: 2025-10-14T19:11:00Z

# Growth Engine Performance Optimization

**Task:** ENG-003  
**Status:** Implemented  
**Last Updated:** 2025-01-24

## Overview

The Growth Engine has comprehensive performance optimization and monitoring capabilities built-in. This document explains how to use and configure these systems.

## Performance Architecture

### Components

1. **Performance Optimizer** (`app/services/growth-engine/performance-optimizer.ts`)
   - Multi-strategy caching (LRU, LFU, FIFO)
   - Route-level performance tracking
   - Automatic optimization recommendations

2. **Performance Service** (`app/services/growth-engine-performance.ts`)
   - System metrics collection
   - Resource management
   - Auto-optimization
   - Performance monitoring

3. **Core Infrastructure** (`app/services/growth-engine/core-infrastructure.ts`)
   - Route caching strategies
   - State management
   - Data loading optimization

4. **Telemetry Pipeline** (`app/lib/growth-engine/telemetry-pipeline.ts`)
   - GSC/GA4 data integration
   - Opportunity identification
   - Data freshness tracking

## Caching Strategies

### Available Strategies

| Strategy | TTL | Use Case | Compression |
|----------|-----|----------|-------------|
| `instant` | 30s | Real-time data | No |
| `short` | 5min | Frequently changing | No |
| `medium` | 15min | Moderate updates | Yes |
| `long` | 1hr | Stable data | Yes |
| `persistent` | 24hr | Static content | Yes |

### Usage

```typescript
import { PerformanceOptimizer } from '~/services/growth-engine/performance-optimizer';

const optimizer = new PerformanceOptimizer();

// Cache with strategy
optimizer.cache.set('dashboard-data', data, 'medium');

// Get cached data
const cached = optimizer.cache.get('dashboard-data');

// Clear cache
optimizer.cache.clear();
```

### Route-Level Caching

Routes are automatically cached based on their configuration:

```typescript
const routes: GrowthEngineRoute[] = [
  {
    id: 'dashboard',
    path: '/dashboard',
    cacheStrategy: 'short', // 5 minutes
    priority: 'high'
  },
  {
    id: 'analytics',
    path: '/analytics',
    cacheStrategy: 'medium', // 15 minutes
    priority: 'medium'
  }
];
```

## Performance Monitoring

### Metrics Collected

**System Metrics:**
- CPU usage
- Memory usage
- Disk I/O
- Network latency

**Application Metrics:**
- Response time
- Throughput
- Error rate
- Success rate

**Cache Metrics:**
- Hit rate
- Miss rate
- Eviction rate
- Cache size

**Database Metrics:**
- Query time
- Connection pool usage
- Slow queries
- Deadlocks

### Monitoring Setup

```typescript
import { GrowthEnginePerformance, defaultPerformanceConfig } from '~/services/growth-engine-performance';

const performance = new GrowthEnginePerformance(defaultPerformanceConfig);

// Start monitoring
await performance.startMonitoring();

// Get current metrics
const metrics = performance.getMetrics();

// Get performance report
const report = await performance.getPerformanceReport();
```

### Performance Thresholds

Default thresholds (configurable):

```typescript
{
  cpu: 80,           // 80% CPU usage
  memory: 80,        // 80% memory usage
  responseTime: 1000, // 1 second
  errorRate: 1       // 1% error rate
}
```

## Auto-Optimization

### How It Works

The system automatically optimizes performance when:
1. Metrics exceed thresholds
2. Optimization interval elapsed (default: 5 minutes)
3. Manual optimization triggered

### Optimization Actions

**Cache Optimization:**
- Adjust TTL based on hit rates
- Evict stale entries
- Resize cache based on usage

**Database Optimization:**
- Optimize slow queries
- Adjust connection pool
- Reduce deadlocks

**Resource Optimization:**
- Reduce concurrent requests if CPU high
- Increase timeout if network slow
- Adjust memory limits

### Manual Optimization

```typescript
const result = await performance.optimize();

console.log('Optimizations:', result.optimizations);
console.log('Performance gains:', result.performanceGains);
```

## Performance Targets

### Default Targets

```typescript
{
  responseTime: 500,  // 500ms average
  throughput: 1000,   // 1000 requests/min
  errorRate: 0.5      // 0.5% error rate
}
```

### Measuring Against Targets

```typescript
const report = await performance.getPerformanceReport();

console.log('Response time:', report.metrics.application.responseTime);
console.log('Target:', report.config.optimization.performanceTargets.responseTime);
console.log('Met target:', report.metrics.application.responseTime < report.config.optimization.performanceTargets.responseTime);
```

## Database Optimization

### Connection Pooling

Configured in `supabase/config.toml`:

```toml
[db.pooler]
enabled = false
pool_mode = "transaction"
default_pool_size = 20
max_client_conn = 100
```

### Query Optimization

**Best Practices:**
- Use Supabase RPC for complex queries
- Add indexes for frequently queried fields
- Limit result sets with pagination
- Use select() to fetch only needed fields

**Example:**

```typescript
// ❌ Bad: Fetch all fields, no limit
const { data } = await supabase
  .from('growth_actions')
  .select('*');

// ✅ Good: Select specific fields, limit results
const { data } = await supabase
  .from('growth_actions')
  .select('id, title, status, created_at')
  .order('created_at', { ascending: false })
  .limit(10);
```

### Slow Query Detection

The system automatically detects slow queries (>200ms) and logs them for optimization.

## Resource Management

### Configuration

```typescript
{
  maxConcurrentRequests: 100,
  requestTimeout: 30000,      // 30 seconds
  memoryLimit: 1073741824,    // 1GB
  cpuLimit: 80                // 80%
}
```

### Request Throttling

Automatically throttles requests when:
- CPU usage > 80%
- Memory usage > 80%
- Too many concurrent requests

## Performance Testing

### Load Testing

```bash
# Run performance tests
npm run test:performance

# Run load tests
npm run test:load
```

### Benchmarking

```typescript
import { PerformanceOptimizer } from '~/services/growth-engine/performance-optimizer';

const optimizer = new PerformanceOptimizer();

// Benchmark route
const benchmark = await optimizer.benchmarkRoute('/dashboard');

console.log('Average load time:', benchmark.averageLoadTime);
console.log('P95 load time:', benchmark.p95LoadTime);
console.log('Cache hit rate:', benchmark.cacheHitRate);
```

## Monitoring Dashboard

### Metrics Endpoint

```
GET /api/growth-engine/metrics
```

**Response:**
```json
{
  "system": {
    "cpuUsage": 45.2,
    "memoryUsage": 62.8,
    "diskUsage": 38.1,
    "networkLatency": 12.5
  },
  "application": {
    "responseTime": 342,
    "throughput": 856,
    "errorRate": 0.3,
    "successRate": 99.7
  },
  "cache": {
    "hitRate": 87.5,
    "missRate": 12.5,
    "evictionRate": 2.1,
    "size": 456
  },
  "database": {
    "queryTime": 125,
    "connectionPool": 45.2,
    "slowQueries": 2,
    "deadlocks": 0
  }
}
```

### Health Check

```
GET /api/growth-engine/health
```

**Response:**
```json
{
  "status": "healthy",
  "checks": {
    "database": "ok",
    "cache": "ok",
    "memory": "ok",
    "cpu": "ok"
  },
  "uptime": 86400,
  "version": "1.0.0"
}
```

## Troubleshooting

### High CPU Usage

**Symptoms:**
- Slow response times
- Request timeouts
- System alerts

**Solutions:**
1. Check for slow queries
2. Reduce concurrent requests
3. Enable caching for expensive operations
4. Optimize database queries

### High Memory Usage

**Symptoms:**
- Out of memory errors
- Slow performance
- Cache evictions

**Solutions:**
1. Reduce cache size
2. Enable compression
3. Clear unused cache entries
4. Optimize data structures

### Slow Response Times

**Symptoms:**
- Users report slow loading
- Metrics show high response times
- Timeouts occurring

**Solutions:**
1. Check cache hit rate
2. Optimize database queries
3. Enable route-level caching
4. Reduce data payload size

### Low Cache Hit Rate

**Symptoms:**
- Cache hit rate < 50%
- Slow performance
- High database load

**Solutions:**
1. Increase cache TTL
2. Adjust cache strategy
3. Pre-warm cache for common queries
4. Review cache eviction policy

## Best Practices

### ✅ DO

- Use appropriate cache strategies for each route
- Monitor performance metrics regularly
- Set realistic performance targets
- Enable auto-optimization
- Test performance changes before deploying
- Document performance requirements

### ❌ DON'T

- Cache everything (be selective)
- Ignore performance alerts
- Skip performance testing
- Use synchronous operations for slow tasks
- Fetch more data than needed
- Disable monitoring in production

## References

- Performance Optimizer: `app/services/growth-engine/performance-optimizer.ts`
- Performance Service: `app/services/growth-engine-performance.ts`
- Core Infrastructure: `app/services/growth-engine/core-infrastructure.ts`
- Telemetry Pipeline: `app/lib/growth-engine/telemetry-pipeline.ts`
- Task: ENG-003 in TaskAssignment table


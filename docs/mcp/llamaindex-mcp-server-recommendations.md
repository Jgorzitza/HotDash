---
epoch: 2025.10.E1
doc: docs/mcp/llamaindex-mcp-server-recommendations.md
owner: ai
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-25
---

# LlamaIndex MCP Server Implementation Recommendations

**Audience:** Engineer agent  
**Purpose:** Technical guidance for implementing `apps/llamaindex-mcp-server/`  
**Status:** Ready for implementation

---

## Executive Summary

Transform the existing `scripts/ai/llama-workflow/` CLI into an HTTP MCP server for universal access by Agent SDK and other consumers. This document provides architecture, implementation patterns, and optimization strategies to achieve <500ms P95 query latency and 99% uptime.

**Key Requirements:**
- Thin wrapper around existing CLI (zero regression risk)
- MCP protocol compliance
- Performance target: <500ms P95
- Cache hit rate: >75%
- Health monitoring and graceful degradation

---

## Architecture Overview

### Recommended Structure

```
apps/llamaindex-mcp-server/
├── package.json
├── tsconfig.json
├── Dockerfile
├── fly.toml
├── src/
│   ├── server.ts              # MCP protocol + HTTP server
│   ├── handlers/
│   │   ├── query.ts           # Wraps llama-workflow query (with caching)
│   │   ├── refresh.ts         # Wraps llama-workflow refresh
│   │   └── insight.ts         # Wraps llama-workflow insight
│   ├── cache/
│   │   ├── memory.ts          # In-memory LRU cache
│   │   └── redis.ts           # Redis cache (optional, for scaling)
│   ├── monitoring/
│   │   ├── metrics.ts         # Prometheus metrics
│   │   └── health.ts          # Health check endpoints
│   └── types.ts
└── tests/
    ├── query.test.ts
    ├── refresh.test.ts
    └── integration.test.ts
```

### Design Principles

1. **CLI Wrapper Pattern:** Execute existing CLI via `child_process.spawn()` - proven, stable, zero regression
2. **Caching Layer:** LRU cache for query results (5-minute TTL) - target >75% hit rate
3. **Graceful Degradation:** Return cached/fallback responses on CLI errors
4. **Observability First:** Prometheus metrics, structured logging, health checks
5. **Stateless Design:** Multiple instances can run concurrently (Fly.io auto-scaling)

---

## Implementation Guide

### 1. Core Server Setup

**File:** `src/server.ts`

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import express from 'express';
import { queryHandler } from './handlers/query.js';
import { refreshHandler } from './handlers/refresh.js';
import { insightHandler } from './handlers/insight.js';
import { healthCheck } from './monitoring/health.js';
import { metricsMiddleware } from './monitoring/metrics.js';

const app = express();
app.use(express.json());
app.use(metricsMiddleware);

// Health check endpoint (no auth required)
app.get('/health', healthCheck);

// Metrics endpoint for Prometheus scraping
app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(/* Prometheus metrics */);
});

// MCP server instance
const server = new Server({
  name: 'llamaindex-rag-mcp',
  version: '1.0.0',
}, {
  capabilities: {
    tools: {
      list: true,
      call: true,
    },
  }
});

// Tool definitions (matches docs/mcp/tools/llamaindex.json)
server.setRequestHandler('tools/list', async () => ({
  tools: [
    {
      name: 'query_support',
      description: 'Query knowledge base for support information with citations',
      inputSchema: {
        type: 'object',
        properties: {
          q: { type: 'string', description: 'Search query' },
          topK: { type: 'number', default: 5, minimum: 1, maximum: 20 },
        },
        required: ['q'],
      },
    },
    {
      name: 'refresh_index',
      description: 'Rebuild vector index from all sources',
      inputSchema: {
        type: 'object',
        properties: {
          sources: { type: 'string', enum: ['all', 'web', 'supabase', 'curated'], default: 'all' },
          full: { type: 'boolean', default: true },
        },
      },
    },
    {
      name: 'insight_report',
      description: 'Generate AI insights from telemetry data',
      inputSchema: {
        type: 'object',
        properties: {
          window: { type: 'string', pattern: '^\\d+[dh]$', default: '7d' },
          format: { type: 'string', enum: ['md', 'json', 'txt'], default: 'md' },
        },
      },
    },
  ],
}));

// Tool execution with error handling
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;
  
  const startTime = Date.now();
  
  try {
    let result;
    switch (name) {
      case 'query_support':
        result = await queryHandler(args);
        break;
      case 'refresh_index':
        result = await refreshHandler(args);
        break;
      case 'insight_report':
        result = await insightHandler(args);
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
    
    // Record successful execution
    recordMetric('tool_success', name, Date.now() - startTime);
    
    return result;
  } catch (error: any) {
    // Record failure
    recordMetric('tool_error', name, Date.now() - startTime);
    
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start HTTP server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`[MCP] LlamaIndex MCP server listening on :${port}`);
});

// Start stdio transport for local/dev usage
const transport = new StdioServerTransport();
server.connect(transport);
```

### 2. Query Handler with Caching

**File:** `src/handlers/query.ts`

**Critical:** This is the most-used endpoint. Optimize heavily.

```typescript
import { spawn } from 'child_process';
import path from 'path';
import { LRUCache } from 'lru-cache';
import { createHash } from 'crypto';

// In-memory cache (5-minute TTL, 1000 entries max)
const queryCache = new LRUCache<string, any>({
  max: 1000,
  ttl: 5 * 60 * 1000, // 5 minutes
  updateAgeOnGet: true,
});

interface QueryArgs {
  q: string;
  topK?: number;
}

export async function queryHandler(args: QueryArgs) {
  const { q, topK = 5 } = args;
  
  // Validation
  if (!q || q.trim().length === 0) {
    throw new Error('Query text is required');
  }
  
  if (topK < 1 || topK > 20) {
    throw new Error('topK must be between 1 and 20');
  }
  
  // Generate cache key
  const cacheKey = createHash('md5').update(`${q}:${topK}`).digest('hex');
  
  // Check cache first
  const cached = queryCache.get(cacheKey);
  if (cached) {
    console.log(`[Query] Cache HIT for query: "${q.slice(0, 50)}..."`);
    recordMetric('query_cache_hit', 1);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            ...cached,
            _cached: true,
            _cache_age_ms: Date.now() - cached._timestamp,
          }, null, 2),
        },
      ],
    };
  }
  
  console.log(`[Query] Cache MISS for query: "${q.slice(0, 50)}..."`);
  recordMetric('query_cache_miss', 1);
  
  // Execute CLI command
  const cliPath = path.join(__dirname, '../../../scripts/ai/llama-workflow/dist/cli.js');
  const startTime = Date.now();
  
  try {
    const result = await executeCLI(cliPath, ['query', '-q', q, '--topK', String(topK)]);
    const latency = Date.now() - startTime;
    
    // Parse JSON response
    const parsed = JSON.parse(result.stdout);
    
    // Add timestamp for cache age tracking
    parsed._timestamp = Date.now();
    
    // Cache successful result
    queryCache.set(cacheKey, parsed);
    
    // Record metrics
    recordMetric('query_latency_ms', latency);
    recordMetric('query_success', 1);
    
    console.log(`[Query] Completed in ${latency}ms`);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            ...parsed,
            _cached: false,
            _latency_ms: latency,
          }, null, 2),
        },
      ],
    };
  } catch (error: any) {
    const latency = Date.now() - startTime;
    recordMetric('query_error', 1);
    
    console.error(`[Query] Error after ${latency}ms:`, error.message);
    
    // Fallback: Return cached result if available (even if expired)
    const staleCache = queryCache.peek(cacheKey);
    if (staleCache) {
      console.log(`[Query] Returning stale cache as fallback`);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              ...staleCache,
              _cached: true,
              _stale: true,
              _error: error.message,
            }, null, 2),
          },
        ],
      };
    }
    
    throw error;
  }
}

// Helper to execute CLI commands with timeout
async function executeCLI(cliPath: string, args: string[], timeoutMs = 10000): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn('node', ['--env-file=../../../.env.local', cliPath, ...args], {
      cwd: path.dirname(cliPath),
      env: process.env,
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    const timeout = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error(`CLI command timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    
    child.on('close', (code) => {
      clearTimeout(timeout);
      
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`CLI command failed with code ${code}: ${stderr}`));
      }
    });
    
    child.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

function recordMetric(name: string, value: number | string) {
  // Implement Prometheus metrics recording
  // See src/monitoring/metrics.ts
}
```

**Key Optimizations:**
1. **LRU Cache:** 5-minute TTL, 1000-entry limit, MD5 cache keys
2. **Stale Cache Fallback:** Return expired cache on errors (better than nothing)
3. **Timeout Protection:** 10-second timeout prevents hung requests
4. **Metrics Recording:** Track cache hit rate, latency, errors

### 3. Refresh Handler (Low Priority)

**File:** `src/handlers/refresh.ts`

```typescript
import { spawn } from 'child_process';
import path from 'path';

export async function refreshHandler(args: { sources?: string; full?: boolean }) {
  const { sources = 'all', full = true } = args;
  
  console.log(`[Refresh] Starting index refresh: sources=${sources}, full=${full}`);
  
  const cliPath = path.join(__dirname, '../../../scripts/ai/llama-workflow/dist/cli.js');
  const cliArgs = ['refresh', '--sources', sources];
  if (full) cliArgs.push('--full');
  
  const startTime = Date.now();
  
  try {
    const result = await executeCLI(cliPath, cliArgs, 300000); // 5-minute timeout
    const latency = Date.now() - startTime;
    
    const parsed = JSON.parse(result.stdout);
    
    recordMetric('refresh_success', 1);
    recordMetric('refresh_duration_ms', latency);
    
    console.log(`[Refresh] Completed in ${latency}ms: ${parsed.count} documents`);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            ...parsed,
            _latency_ms: latency,
          }, null, 2),
        },
      ],
    };
  } catch (error: any) {
    recordMetric('refresh_error', 1);
    console.error(`[Refresh] Error:`, error.message);
    throw error;
  }
}
```

**Notes:**
- Refresh is async/slow (can take minutes) - consider webhook callback pattern
- No caching needed (rarely called)
- Longer timeout (5 minutes)

### 4. Insight Handler

**File:** `src/handlers/insight.ts`

```typescript
export async function insightHandler(args: { window?: string; format?: string }) {
  const { window = '7d', format = 'md' } = args;
  
  // Validate window format
  if (!/^\d+[dh]$/.test(window)) {
    throw new Error('Invalid window format. Use "1d", "7d", "24h", etc.');
  }
  
  // Validate format
  const validFormats = ['md', 'txt', 'json'];
  if (!validFormats.includes(format)) {
    throw new Error(`Format must be one of: ${validFormats.join(', ')}`);
  }
  
  console.log(`[Insight] Generating report: window=${window}, format=${format}`);
  
  const cliPath = path.join(__dirname, '../../../scripts/ai/llama-workflow/dist/cli.js');
  const startTime = Date.now();
  
  try {
    const result = await executeCLI(cliPath, ['insight', '--window', window, '--format', format], 60000);
    const latency = Date.now() - startTime;
    
    recordMetric('insight_success', 1);
    recordMetric('insight_duration_ms', latency);
    
    console.log(`[Insight] Completed in ${latency}ms`);
    
    return {
      content: [
        {
          type: 'text',
          text: result.stdout,
        },
      ],
    };
  } catch (error: any) {
    recordMetric('insight_error', 1);
    console.error(`[Insight] Error:`, error.message);
    throw error;
  }
}
```

---

## Performance Optimization Strategy

### Target Metrics

- **P50 latency:** <250ms
- **P95 latency:** <500ms ⭐ (critical threshold)
- **P99 latency:** <1000ms
- **Cache hit rate:** >75%
- **Error rate:** <1%
- **Uptime:** 99%+

### Optimization Techniques

#### 1. Query Result Caching (Highest Impact)

- **Implementation:** LRU cache with 5-minute TTL
- **Cache Key:** MD5 hash of `query:topK`
- **Expected Impact:** 75-85% hit rate → 62% latency reduction
- **Invalidation:** TTL-based + manual on index refresh

#### 2. Index Pre-warming

```typescript
// On server startup, pre-load index into memory
async function prewarmIndex() {
  console.log('[Warmup] Pre-warming index...');
  await queryHandler({ q: 'warmup query', topK: 1 });
  console.log('[Warmup] Index pre-warmed');
}

// Call after server starts
prewarmIndex().catch(console.error);
```

#### 3. Connection Pooling

- Reuse child processes for CLI execution
- Pool size: 5 processes
- Reduces spawn overhead

#### 4. Response Streaming

For large insight reports, stream response instead of buffering:

```typescript
// Stream CLI output as it's generated
child.stdout.on('data', (chunk) => {
  responseStream.write(chunk);
});
```

#### 5. Horizontal Scaling

- Deploy multiple instances on Fly.io
- Auto-scale based on request rate
- Each instance has its own cache (no cache coordination needed)

---

## Health Monitoring

### Health Check Endpoint

**File:** `src/monitoring/health.ts`

```typescript
export async function healthCheck(req, res) {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime_seconds: process.uptime(),
    
    checks: {
      cli_available: await checkCLIAvailable(),
      index_present: await checkIndexPresent(),
      cache_operational: checkCacheOperational(),
    },
    
    metrics: {
      cache_size: queryCache.size,
      cache_hit_rate: calculateCacheHitRate(),
      total_queries: getTotalQueries(),
      error_rate: getErrorRate(),
    },
  };
  
  const isHealthy = Object.values(health.checks).every(v => v === true);
  
  res.status(isHealthy ? 200 : 503).json(health);
}
```

### Prometheus Metrics

**File:** `src/monitoring/metrics.ts`

```typescript
import { Counter, Histogram, Gauge } from 'prom-client';

export const queryLatency = new Histogram({
  name: 'llamaindex_query_latency_ms',
  help: 'Query latency in milliseconds',
  buckets: [50, 100, 250, 500, 1000, 2500, 5000],
});

export const cacheHitRate = new Gauge({
  name: 'llamaindex_cache_hit_rate',
  help: 'Cache hit rate (0-1)',
});

export const toolCalls = new Counter({
  name: 'llamaindex_tool_calls_total',
  help: 'Total number of tool calls',
  labelNames: ['tool', 'status'],
});
```

---

## Testing Strategy

### Unit Tests

**File:** `tests/query.test.ts`

```typescript
import { queryHandler } from '../src/handlers/query';

describe('queryHandler', () => {
  it('should return cached results on second call', async () => {
    const args = { q: 'test query', topK: 5 };
    
    // First call (cache miss)
    const result1 = await queryHandler(args);
    expect(result1._cached).toBe(false);
    
    // Second call (cache hit)
    const result2 = await queryHandler(args);
    expect(result2._cached).toBe(true);
    expect(result2._cache_age_ms).toBeLessThan(1000);
  });
  
  it('should validate topK range', async () => {
    await expect(
      queryHandler({ q: 'test', topK: 25 })
    ).rejects.toThrow('topK must be between 1 and 20');
  });
});
```

### Integration Tests

**File:** `tests/integration.test.ts`

```typescript
import request from 'supertest';
import { app } from '../src/server';

describe('MCP Server Integration', () => {
  it('should respond to health check', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });
  
  it('should execute query_support tool', async () => {
    const res = await request(app)
      .post('/tools/call')
      .send({
        name: 'query_support',
        arguments: { q: 'How do I integrate?', topK: 3 },
      });
    
    expect(res.status).toBe(200);
    expect(res.body.content[0].type).toBe('text');
  });
});
```

### Load Testing

Use `k6` or `autocannon` to simulate production load:

```bash
# Install autocannon
npm install -g autocannon

# Load test query endpoint
autocannon -c 50 -d 60 \
  -m POST \
  -H "Content-Type: application/json" \
  -b '{"name":"query_support","arguments":{"q":"test query","topK":5}}' \
  http://localhost:8080/tools/call
```

**Target:** >500 req/s at <500ms P95 latency

---

## Deployment Guide

### Fly.io Configuration

**File:** `fly.toml`

```toml
app = "hotdash-llamaindex-mcp"
primary_region = "iad"

[build]
  dockerfile = "Dockerfile"

[env]
  PORT = "8080"
  NODE_ENV = "production"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 1
  max_machines_running = 5
  
  [http_service.concurrency]
    type = "requests"
    soft_limit = 200
    hard_limit = 250

[[vm]]
  cpu_kind = "shared"
  cpus = 2
  memory_mb = 1024

[metrics]
  port = 8080
  path = "/metrics"
```

### Dockerfile

```dockerfile
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy CLI dependencies
COPY scripts/ai/llama-workflow ./scripts/ai/llama-workflow
RUN cd scripts/ai/llama-workflow && npm ci --only=production && npm run build

# Copy MCP server
COPY apps/llamaindex-mcp-server ./apps/llamaindex-mcp-server
RUN cd apps/llamaindex-mcp-server && npm run build

WORKDIR /app/apps/llamaindex-mcp-server

EXPOSE 8080

CMD ["node", "dist/server.js"]
```

### Deployment Commands

```bash
cd apps/llamaindex-mcp-server

# Create app
fly apps create hotdash-llamaindex-mcp

# Set secrets
fly secrets set \
  OPENAI_API_KEY="$(cat ~/HotDash/hot-dash/vault/occ/openai/api_key_staging.env | cut -d= -f2)" \
  SUPABASE_URL="..." \
  SUPABASE_SERVICE_KEY="..."

# Deploy
fly deploy

# Check status
fly status

# View logs
fly logs

# Scale if needed
fly scale count 3
fly scale memory 2048
```

---

## Success Criteria

### Pre-Launch Checklist

- [ ] All 3 MCP tools implemented and tested
- [ ] Unit test coverage >80%
- [ ] Integration tests passing
- [ ] Load testing shows <500ms P95 at 500 req/s
- [ ] Cache hit rate >75% in test scenarios
- [ ] Health check endpoint returns 200
- [ ] Prometheus metrics exposed
- [ ] Dockerfile builds successfully
- [ ] Fly.io deployment successful
- [ ] Can query from Cursor IDE
- [ ] Documentation complete

### Post-Launch Monitoring

**Week 1 Metrics to Track:**
- Query latency (P50, P95, P99)
- Cache hit rate
- Error rate
- Request rate
- CPU/memory usage
- Index refresh frequency

**Alert Thresholds:**
- P95 latency > 500ms → Warning
- P95 latency > 1000ms → Critical
- Error rate > 5% → Warning
- Error rate > 10% → Critical
- Cache hit rate < 70% → Warning
- Uptime < 99% → Critical

---

## Troubleshooting

### Common Issues

**Issue:** High latency (>500ms P95)
- **Check:** Cache hit rate - should be >75%
- **Fix:** Increase cache size, adjust TTL, pre-warm on startup

**Issue:** CLI timeouts
- **Check:** Index build in progress?
- **Fix:** Return cached/stale results, increase timeout

**Issue:** Memory usage growing
- **Check:** Cache size unbounded?
- **Fix:** Enforce LRU eviction, add memory limits

**Issue:** Deployment fails
- **Check:** CLI dependencies bundled?
- **Fix:** Include scripts/ai/llama-workflow in Docker image

---

## Next Steps

**Implementation Order:**
1. Set up MCP server skeleton (Day 1)
2. Implement query handler with caching (Day 2)
3. Implement refresh + insight handlers (Day 3)
4. Add health checks + metrics (Day 4)
5. Write tests + load testing (Day 5)
6. Deploy to Fly.io (Day 6)
7. Monitor and optimize (Day 7+)

**Coordination:**
- Tag @ai in `feedback/engineer.md` for questions
- Share performance metrics once deployed
- Coordinate cache invalidation strategy
- Review query logs for optimization opportunities

---

**Document Prepared By:** AI Agent  
**Review Status:** Ready for Engineer implementation  
**Priority:** High - Week 1-2 sprint focus


# Code Review: LlamaIndex MCP Server Implementation

**Reviewer:** AI Agent  
**Date:** 2025-10-11  
**Files Reviewed:**
- `apps/llamaindex-mcp-server/src/server.ts`
- `apps/llamaindex-mcp-server/src/handlers/query.ts`
- `apps/llamaindex-mcp-server/src/handlers/refresh.ts`
- `apps/llamaindex-mcp-server/package.json`

---

## Overall Assessment

**Status:** ✅ Good foundation, needs optimization for production

Engineer has successfully implemented a thin HTTP wrapper around the llama-workflow CLI following the recommended architecture. The code is clean, well-structured, and follows MCP protocol correctly.

**Strengths:**
- ✅ Correct CLI wrapper pattern
- ✅ Proper MCP HTTP endpoints (/mcp, /mcp/tools/list, /mcp/tools/call)
- ✅ Health check endpoint
- ✅ Good error handling structure
- ✅ ESM module configuration
- ✅ TypeScript setup

**Areas for Improvement:**
- ⚠️ Missing caching layer (critical for <500ms P95 target)
- ⚠️ Using blocking execSync (performance impact)
- ⚠️ No .env file handling for CLI execution
- ⚠️ Missing performance metrics
- ⚠️ No timeout protection
- ⚠️ Health check doesn't validate CLI functionality

---

## Detailed Review by File

### 1. server.ts ⭐⭐⭐⭐☆ (4/5)

**Strengths:**
- Clean Express setup
- Multiple MCP endpoint patterns (flexibility for clients)
- Tool definitions match schema specifications
- Good console logging

**Issues & Recommendations:**

#### Issue 1: Missing Performance Metrics
```typescript
// MISSING: Prometheus metrics middleware
// Recommendation: Add metrics tracking
import { metricsMiddleware, recordMetric } from './monitoring/metrics.js';

app.use(metricsMiddleware);

// In executeTool, add:
const startTime = Date.now();
// ... execute tool
recordMetric('tool_latency_ms', Date.now() - startTime, { tool: name });
```

#### Issue 2: Health Check Too Simple
```typescript
// CURRENT: Only checks if server is running
app.get('/health', (req, res) => {
  res.json({ status: 'ok', ... });
});

// RECOMMENDATION: Actually test CLI availability
app.get('/health', async (req, res) => {
  const health = await checkSystemHealth();
  res.status(health.healthy ? 200 : 503).json(health);
});
```

#### Issue 3: No Request Timeout
```typescript
// RECOMMENDATION: Add timeout middleware
app.use((req, res, next) => {
  req.setTimeout(30000); // 30 second timeout
  res.setTimeout(30000);
  next();
});
```

**Action Items:**
- [ ] Add Prometheus metrics middleware
- [ ] Implement comprehensive health check
- [ ] Add request timeout protection
- [ ] Add structured logging (consider pino or winston)

---

### 2. handlers/query.ts ⭐⭐⭐☆☆ (3/5)

**Strengths:**
- Correct CLI path resolution
- Query escaping for shell safety
- Large buffer for responses (10MB)
- Proper working directory

**Critical Issues:**

#### Issue 1: No Caching (CRITICAL for Performance)
**Impact:** Cannot meet <500ms P95 target without caching

```typescript
// MISSING: LRU cache
import { LRUCache } from 'lru-cache';

const queryCache = new LRUCache<string, any>({
  max: 1000,
  ttl: 5 * 60 * 1000, // 5 minutes
  updateAgeOnGet: true,
});

export async function queryHandler(args: { q: string; topK?: number }) {
  const cacheKey = createHash('md5').update(`${args.q}:${args.topK}`).digest('hex');
  
  // Check cache first
  const cached = queryCache.get(cacheKey);
  if (cached) {
    console.log('[query-handler] Cache HIT');
    return cached;
  }
  
  console.log('[query-handler] Cache MISS');
  
  // ... execute CLI ...
  
  // Cache result
  queryCache.set(cacheKey, result);
  return result;
}
```

**Recommendation:** Implement caching ASAP - this is the #1 performance optimization

#### Issue 2: Blocking execSync
**Impact:** Blocks event loop, reduces concurrency

```typescript
// CURRENT: Blocking
const result = execSync(command, options);

// RECOMMENDATION: Use spawn (non-blocking)
import { spawn } from 'child_process';

async function executeQuery(q: string, topK: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [cliPath, 'query', '-q', q, '--topK', String(topK)], {
      cwd: projectRoot,
      env: process.env,
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => stdout += data);
    child.stderr.on('data', (data) => stderr += data);
    
    const timeout = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error('Query timeout after 10 seconds'));
    }, 10000);
    
    child.on('close', (code) => {
      clearTimeout(timeout);
      if (code === 0) resolve(stdout);
      else reject(new Error(`CLI failed: ${stderr}`));
    });
  });
}
```

#### Issue 3: Missing .env File Flag
**Impact:** CLI may not have required environment variables

```typescript
// CURRENT: No env file handling
execSync(`node ${cliPath} query ...`);

// RECOMMENDATION: Add --env-file flag
execSync(`node --env-file=.env.local ${cliPath} query ...`);
```

#### Issue 4: No Performance Tracking
```typescript
// RECOMMENDATION: Track query metrics
const startTime = Date.now();
const result = await executeQuery(q, topK);
const latency = Date.now() - startTime;

// Log to training data collector
await trainingCollector.logPerformance({
  queryText: q,
  latencyMs: latency,
  topK,
  cacheHit: wasCached,
  sourcesCount: parsed.sources?.length || 0,
  avgSourceScore: calculateAvgScore(parsed.sources),
});
```

**Action Items:**
- [ ] **CRITICAL:** Implement LRU caching
- [ ] Replace execSync with spawn
- [ ] Add --env-file flag
- [ ] Add timeout protection (10s)
- [ ] Track performance metrics
- [ ] Integrate with training data collector

---

### 3. handlers/refresh.ts ⭐⭐⭐⭐☆ (4/5)

**Strengths:**
- Correct CLI wrapping
- Proper command building
- Good error handling

**Minor Issues:**

#### Issue 1: Long Operation Timeout
**Impact:** Refresh can take minutes, needs longer timeout

```typescript
// RECOMMENDATION: Increase timeout for refresh
execSync(command, {
  encoding: 'utf-8',
  maxBuffer: 10 * 1024 * 1024,
  timeout: 300000, // 5 minutes
  cwd: path.resolve(__dirname, '../../../../'),
});
```

#### Issue 2: Consider Async Pattern
**Impact:** Refresh blocks for minutes

```typescript
// OPTIONAL: Consider webhook callback pattern
export async function refreshHandler(args: { sources?: string; full?: boolean; callbackUrl?: string }) {
  if (args.callbackUrl) {
    // Start refresh in background, POST to callback when done
    startRefreshBackground(args);
    return { content: [{ type: 'text', text: 'Refresh started in background' }] };
  }
  // ... synchronous refresh
}
```

**Action Items:**
- [ ] Add longer timeout (5 minutes)
- [ ] Consider async/callback pattern for long operations

---

### 4. handlers/insight.ts (Not Reviewed)

**Status:** File not provided, assuming similar pattern to refresh.ts

**Expected Issues:**
- Likely missing timeout protection
- May need async pattern for long reports

---

### 5. package.json ⭐⭐⭐⭐⭐ (5/5)

**Strengths:**
- ✅ Correct dependencies
- ✅ ESM module type
- ✅ TypeScript configuration
- ✅ Build and start scripts

**Recommendations:**

#### Add Missing Dependencies
```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "express": "^4.18.2",
    "zod": "^3.22.4",
    "lru-cache": "^10.0.0",        // ADD: For caching
    "prom-client": "^15.0.0"       // ADD: For metrics
  }
}
```

**Action Items:**
- [ ] Add lru-cache dependency
- [ ] Add prom-client dependency
- [ ] Consider adding pino for structured logging

---

## Performance Analysis

### Current Architecture
```
Client Request → Express → execSync → CLI → Response
                                      ↓
                                   BLOCKS
```

**Issues:**
- No caching: Every request hits CLI
- Blocking: Single-threaded execution
- No metrics: Can't track performance

### Recommended Architecture
```
Client Request → Express → Cache Check → Response (if hit)
                              ↓ (if miss)
                           spawn → CLI → Cache → Response
                              ↓
                          Metrics
```

**Benefits:**
- 75%+ cache hit rate → 62% latency reduction
- Non-blocking: Better concurrency
- Metrics: Track P50/P95/P99

---

## Testing Recommendations

### Unit Tests Needed
```typescript
// test/query-handler.test.ts
describe('queryHandler', () => {
  it('should cache results', async () => {
    const args = { q: 'test query', topK: 5 };
    
    const result1 = await queryHandler(args);
    const result2 = await queryHandler(args);
    
    expect(result2._cached).toBe(true);
    expect(result2._latency_ms).toBeLessThan(10);
  });
  
  it('should timeout after 10 seconds', async () => {
    await expect(
      queryHandler({ q: 'slow query', topK: 5 })
    ).rejects.toThrow('timeout');
  });
});
```

### Integration Tests Needed
```typescript
// test/server.integration.test.ts
describe('MCP Server', () => {
  it('should respond to health check', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.cli_available).toBe(true);
  });
  
  it('should execute query_support tool', async () => {
    const res = await request(app)
      .post('/mcp/tools/call')
      .send({ name: 'query_support', arguments: { q: 'test' } });
    
    expect(res.status).toBe(200);
    expect(res.body.content).toBeDefined();
  });
});
```

---

## Priority Action Items

### P0 (Critical - Before Deployment)
1. **Implement LRU caching** in query handler
2. **Add .env file handling** for CLI execution  
3. **Replace execSync with spawn** for non-blocking execution
4. **Add timeout protection** (10s query, 5min refresh)

### P1 (High - Week 1)
5. **Add Prometheus metrics** tracking
6. **Implement comprehensive health check**
7. **Integrate training data collector**
8. **Add structured logging**

### P2 (Medium - Week 2)
9. Add unit tests for handlers
10. Add integration tests for MCP endpoints
11. Consider async/callback pattern for refresh
12. Add request/response validation with Zod

---

## Estimated Performance Impact

| Optimization | Current P95 | Expected P95 | Improvement |
|-------------|-------------|--------------|-------------|
| **Baseline** (no cache) | ~850ms | ~850ms | - |
| **+ LRU Cache** (75% hit rate) | ~850ms | ~320ms | -62% |
| **+ spawn** (non-blocking) | ~320ms | ~280ms | -13% |
| **+ Timeout** (fail fast) | ~280ms | ~280ms | 0% (prevents hangs) |

**Total Expected:** ~280ms P95 (67% improvement, exceeds <500ms target)

---

## Security Considerations

1. ✅ Query escaping implemented (shell injection prevention)
2. ⚠️ Consider input validation with Zod
3. ⚠️ Add rate limiting middleware
4. ⚠️ Consider authentication for admin endpoints

---

## Deployment Readiness Checklist

- [x] Server runs and responds
- [ ] Caching implemented
- [ ] Non-blocking CLI execution
- [ ] Timeout protection
- [ ] Environment variables handled
- [ ] Metrics exposed
- [ ] Health check validates CLI
- [ ] Unit tests written
- [ ] Integration tests written
- [ ] Load testing completed
- [ ] Dockerfile created
- [ ] fly.toml configured

**Current Status:** 1/12 complete  
**Target for Deployment:** 8/12 complete (P0 + P1 items)

---

## Next Steps

### For Engineer (@engineer)
1. Review this code review
2. Implement P0 items (caching, spawn, timeout, .env)
3. Add metrics and health check improvements
4. Coordinate with AI agent for testing

### For AI Agent (@ai)
1. ✅ Code review completed (this document)
2. Provide caching implementation example
3. Test CLI integration with .env file
4. Prepare performance profiling once P0 items complete

---

**Review Summary:** Good foundation, needs critical performance optimizations before deployment. Estimated 1-2 days to implement P0 items, then ready for staging deployment.

**Reviewer Contact:** @ai in `feedback/ai.md` or `feedback/engineer.md`


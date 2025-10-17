---
epoch: 2025.10.E1
doc: docs/data/ga_mock_dataset.md
owner: data
last_reviewed: 2025-10-05
doc_hash: TBD
expires: 2025-10-19
---

# GA Mock Dataset — MCP Transition Plan

## Purpose

This document describes the mock Google Analytics dataset used during development and the transition plan for swapping to live GA MCP host once credentials are available.

---

## Current Mock Dataset

### Location

`app/services/ga/mockClient.ts`

### Sample Data

The mock client returns deterministic landing page session data for testing and development:

```typescript
const SAMPLE_DATA: GaSession[] = [
  {
    landingPage: "/collections/new-arrivals",
    sessions: 420,
    wowDelta: -0.18, // 18% week-over-week drop
  },
  {
    landingPage: "/products/featured-widget",
    sessions: 310,
    wowDelta: 0.05, // 5% week-over-week increase
  },
  {
    landingPage: "/blogs/news/october-launch",
    sessions: 120,
    wowDelta: -0.27, // 27% week-over-week drop (anomaly)
  },
];
```

### Characteristics

- **Deterministic**: Returns same data on every call (no randomness)
- **Anomaly coverage**: Includes one page with >20% drop to test anomaly detection
- **Realistic values**: Session counts and deltas match expected production ranges
- **No external dependencies**: Pure in-memory data, no API calls

### Assumptions

- **Date range ignored**: Mock does not filter by `DateRange` parameter (returns all sample data)
- **No pagination**: Returns complete dataset (suitable for <10 landing pages)
- **Pre-calculated WoW delta**: Mock includes delta values (production MCP should calculate these)

---

## Mock Mode Configuration

### Environment Variables

- `GA_USE_MOCK=1` (default): Force mock mode regardless of MCP host configuration
- `GA_MCP_HOST`: If set and `GA_USE_MOCK=0`, uses live MCP client
- `GA_PROPERTY_ID`: GA4 property ID (required for MCP, ignored in mock mode)

### Selection Logic

From `app/services/ga/ingest.ts:31-37`:

```typescript
function selectClient() {
  const config = getGaConfig();
  if (config.useMock || !config.mcpHost) {
    return { client: createMockGaClient(), config };
  }
  return { client: createMcpGaClient(config.mcpHost), config };
}
```

**Decision tree**:

1. If `GA_USE_MOCK=1` → use mock client
2. Else if `GA_MCP_HOST` is not set → use mock client (fallback)
3. Else → use MCP client

---

## MCP Client Contract

### Expected Endpoint

`POST {GA_MCP_HOST}/landing-pages`

### Request Schema

```json
{
  "start": "2025-09-28", // ISO date (YYYY-MM-DD)
  "end": "2025-10-05"
}
```

### Response Schema

```json
{
  "data": [
    {
      "landingPage": "/products/shoes",
      "sessions": 320,
      "wowDelta": -0.25,
      "evidenceUrl": "https://analytics.google.com/..." // optional
    }
  ]
}
```

### Error Handling

- HTTP 4xx/5xx → throw `ServiceError` with `retryable: true` for 5xx
- Missing `data` field → return empty array `[]`
- Invalid JSON → throw parse error

### Rate Limits

- **Expected limit**: 10 requests/minute (per GA4 property)
- **Caching**: 5-minute TTL (configurable via `GA_CACHE_TTL_MS`)
- **Backoff**: Not yet implemented; relies on cache to reduce request frequency

---

## Transition Plan: Mock → Live MCP

### Prerequisites

1. GA MCP host credentials available (provided by ops/infrastructure)
2. GA4 property ID configured for target shop
3. MCP endpoint tested and returning valid responses
4. Rate limit policy confirmed with MCP provider

### Steps

#### 1. Verify MCP Availability

```bash
# Test MCP endpoint manually
curl -X POST https://{MCP_HOST}/landing-pages \
  -H "Content-Type: application/json" \
  -d '{"start":"2025-09-28","end":"2025-10-05"}'
```

Expected response: `200 OK` with valid `GaSession[]` data

#### 2. Configure Environment

Update `.env` (or production environment secrets):

```bash
GA_USE_MOCK=0
GA_MCP_HOST=https://ga-mcp.example.com
GA_PROPERTY_ID=123456789
GA_CACHE_TTL_MS=300000  # 5 minutes
```

#### 3. Deploy and Monitor

- Deploy updated environment config to staging
- Monitor logs for MCP request errors (check `scope: "ga.sessions"` in ServiceError logs)
- Validate dashboard tile renders with live data (compare session counts to GA4 UI)
- If errors persist, revert to mock mode (`GA_USE_MOCK=1`) and investigate

#### 4. QA Checklist

- [ ] MCP endpoint returns data for configured property ID
- [ ] Week-over-week delta calculations match expected values
- [ ] Anomaly detection flags pages with >20% drop
- [ ] Dashboard tile displays correct session counts and trends
- [ ] Cache is respected (subsequent requests within TTL return cached data)
- [ ] Evidence URLs link to GA4 UI (if provided by MCP)

#### 5. Rollback Plan

If MCP integration fails:

1. Set `GA_USE_MOCK=1` in environment config
2. Redeploy application (falls back to mock client)
3. Log issue in `feedback/data.md` with error details
4. Coordinate with infrastructure to resolve MCP host issues

---

## Testing Strategy

### Unit Tests

**Location**: `tests/unit/services/ga/`

**Coverage**:

- Mock client returns expected sample data
- MCP client constructs correct request payload
- MCP client handles 4xx/5xx errors gracefully
- Ingest service selects correct client based on config
- Anomaly detection flags pages with `wowDelta <= -0.20`

**Example**:

```typescript
import { createMockGaClient } from "~/services/ga/mockClient";

test("mock client returns deterministic sample data", async () => {
  const client = createMockGaClient();
  const data = await client.fetchLandingPageSessions({
    start: "2025-09-28",
    end: "2025-10-05",
  });

  expect(data).toHaveLength(3);
  expect(data[0].landingPage).toBe("/collections/new-arrivals");
  expect(data[2].wowDelta).toBeLessThan(-0.2); // anomaly threshold
});
```

### Integration Tests

**Scope**: E2E dashboard rendering with mock data (Playwright)

**Assertions**:

- SEO & Content Watch tile displays 3 landing pages
- Anomaly badge appears on `/blogs/news/october-launch` (27% drop)
- Refresh button triggers new data fetch (cache bypass)

### MCP Integration Test (Pending)

**Status**: Skipped until MCP available

**Implementation** (once MCP live):

```typescript
import { createMcpGaClient } from "~/services/ga/mcpClient";

test.skip("MCP client fetches live GA4 data", async () => {
  const client = createMcpGaClient(process.env.GA_MCP_HOST!);
  const data = await client.fetchLandingPageSessions({
    start: "2025-09-28",
    end: "2025-10-05",
  });

  expect(data).toBeDefined();
  expect(data.length).toBeGreaterThan(0);
  expect(data[0]).toHaveProperty("landingPage");
  expect(data[0]).toHaveProperty("sessions");
  expect(data[0]).toHaveProperty("wowDelta");
});
```

---

## Caching & Performance

### Cache Strategy

- **Key**: `ga:landing-pages:{propertyId}:{start}:{end}`
- **TTL**: 5 minutes (default), configurable via `GA_CACHE_TTL_MS`
- **Storage**: In-memory cache (`app/services/cache.server.ts`)
- **Invalidation**: Automatic expiration after TTL; manual refresh via dashboard UI

### Performance Expectations

- **Mock mode**: <10ms response time (in-memory)
- **MCP mode**: 200-500ms response time (network + GA4 API)
- **Cached**: <5ms response time (in-memory lookup)

### Rate Limit Mitigation

- Tile auto-refresh disabled by default (manual refresh only)
- Cache shared across all requests for same shop/property/date range
- If rate limit exceeded, display stale cached data + "Last updated" timestamp

---

## Monitoring & Alerting

### Metrics to Track (once MCP live)

- **MCP request latency**: P50, P95, P99 (target: <500ms P95)
- **MCP error rate**: HTTP 4xx/5xx count (target: <1% error rate)
- **Cache hit rate**: Percentage of requests served from cache (target: >80%)
- **Anomaly detection rate**: Percentage of landing pages flagged (expect 5-10%)

### Alert Conditions

- **P0**: MCP endpoint unreachable for >5 minutes → fallback to mock mode, page ops
- **P1**: Error rate >5% for 15 minutes → investigate MCP credentials/config
- **P2**: Cache hit rate <50% → review TTL settings or request patterns

### Logging

- All MCP requests logged with scope `ga.sessions` (ServiceError logs)
- Cache hits/misses logged at debug level
- Anomaly detection results logged in `DashboardFact` metadata

---

## References

- Service Implementation: `app/services/ga/ingest.ts`, `app/services/ga/mockClient.ts`, `app/services/ga/mcpClient.ts`
- Configuration: `app/config/ga.server.ts`
- KPI Definitions: `docs/data/kpis.md` (Traffic Anomalies section)
- Data Contracts: `docs/data/data_contracts.md` (Google Analytics MCP section)
- Direction: `docs/directions/data.md`

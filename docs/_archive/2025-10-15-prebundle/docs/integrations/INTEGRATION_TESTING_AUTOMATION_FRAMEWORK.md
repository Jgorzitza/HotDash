# Integration Testing Automation Framework

**Owner:** Integrations + QA + Reliability  
**Created:** 2025-10-11  
**Purpose:** Comprehensive automated testing for all external API integrations  
**Scope:** Unit tests, integration tests, contract tests, smoke tests, end-to-end tests

---

## Overview

**Testing Philosophy:** Test integrations continuously to catch issues before they impact users.

**Current State (from Task C):**

- ✅ Basic integration test scripts created
- ✅ Manual execution capability
- ⏳ CI/CD integration needed
- ⏳ Mock servers for offline testing
- ⏳ Contract testing for API changes

**Goal:** Fully automated testing at multiple levels with clear pass/fail criteria.

---

## Testing Pyramid for Integrations

```
           ┌────────────┐
           │  E2E Tests │  <-- Fewest, slowest, most realistic
           │  (5% of tests)
           └────────────┘
         ┌────────────────┐
         │Contract Tests │  <-- API compatibility
         │ (10% of tests) │
         └────────────────┘
       ┌────────────────────┐
       │Integration Tests  │  <-- Real API calls (staging)
       │  (25% of tests)    │
       └────────────────────┘
     ┌──────────────────────────┐
     │     Unit Tests          │  <-- Most, fastest, mocked
     │    (60% of tests)        │
     └──────────────────────────┘
```

**Distribution:**

- **60% Unit Tests:** Fast, mocked, test individual functions
- **25% Integration Tests:** Staging APIs, test real interactions
- **10% Contract Tests:** Verify API schemas match expectations
- **5% E2E Tests:** Full workflow, production-like environment

---

## Test Categories

### 1. Unit Tests (Mocked)

**Purpose:** Test API client logic without hitting real APIs

**Location:** `tests/unit/integrations/`

**Example:** Shopify Client Unit Test

```typescript
// tests/unit/integrations/shopify-client.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getShopifyServiceContext } from "~/services/shopify/client";

describe("Shopify Client", () => {
  let mockAdmin: any;
  let mockSession: any;

  beforeEach(() => {
    mockAdmin = {
      graphql: vi.fn(),
    };
    mockSession = {
      shop: "test-shop.myshopify.com",
      accessToken: "test-token",
    };

    vi.mock("@shopify/shopify-app-remix/server", () => ({
      authenticate: {
        admin: vi.fn(() => ({
          admin: mockAdmin,
          session: mockSession,
        })),
      },
    }));
  });

  it("should retry on 429 rate limit", async () => {
    // First call returns 429, second succeeds
    mockAdmin.graphql
      .mockResolvedValueOnce({ ok: false, status: 429 })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => ({ data: { shop: { name: "Test Shop" } } }),
      });

    const context = await getShopifyServiceContext(mockRequest);
    const result = await context.admin.graphql("{ shop { name } }", {});

    expect(mockAdmin.graphql).toHaveBeenCalledTimes(2);
    expect(result.ok).toBe(true);
  });

  it("should fail after max retries", async () => {
    mockAdmin.graphql.mockResolvedValue({ ok: false, status: 500 });

    const context = await getShopifyServiceContext(mockRequest);
    const result = await context.admin.graphql("{ shop { name } }", {});

    expect(mockAdmin.graphql).toHaveBeenCalledTimes(3); // 1 attempt + 2 retries
    expect(result.ok).toBe(false);
  });

  it("should apply exponential backoff", async () => {
    const delays: number[] = [];
    const mockWait = vi.fn((ms) => {
      delays.push(ms);
      return Promise.resolve();
    });

    // Test with custom wait function (dependency injection)
    // ... test implementation

    expect(delays[0]).toBeCloseTo(500, 50); // ~500ms ± jitter
    expect(delays[1]).toBeCloseTo(1000, 100); // ~1000ms ± jitter
  });
});
```

**Coverage Target:** 80% of client code

**Run Frequency:** Every commit (pre-commit hook + CI)

---

### 2. Integration Tests (Real APIs, Staging)

**Purpose:** Test real API interactions in staging environment

**Location:** `tests/integration/`

**Existing Scripts (from Task C):**

- `scripts/ops/test-shopify-integration.sh`
- `scripts/ops/test-chatwoot-integration.sh`
- `scripts/ops/test-ga-integration.sh`
- `scripts/ops/test-all-integrations.sh`

**Example:** Chatwoot Integration Test (TypeScript)

```typescript
// tests/integration/chatwoot-integration.test.ts
import { describe, it, expect, beforeAll } from "vitest";
import { createChatwootClient } from "~/services/chatwoot/client";

describe("Chatwoot Integration (Staging)", () => {
  let client: ReturnType<typeof createChatwootClient>;

  beforeAll(() => {
    // Use staging credentials
    client = createChatwootClient({
      baseUrl: process.env.CHATWOOT_STAGING_URL!,
      apiToken: process.env.CHATWOOT_STAGING_TOKEN!,
      accountId: parseInt(process.env.CHATWOOT_STAGING_ACCOUNT_ID!),
    });
  });

  it("should list open conversations", async () => {
    const conversations = await client.listOpenConversations(1);

    expect(Array.isArray(conversations)).toBe(true);
    expect(conversations.length).toBeGreaterThanOrEqual(0);

    if (conversations.length > 0) {
      expect(conversations[0]).toHaveProperty("id");
      expect(conversations[0]).toHaveProperty("status");
      expect(conversations[0].status).toBe("open");
    }
  });

  it("should handle rate limits gracefully", async () => {
    // Rapidly make many requests to trigger rate limit
    const promises = Array.from({ length: 20 }, (_, i) =>
      client.listOpenConversations(1),
    );

    const results = await Promise.allSettled(promises);

    // All should eventually succeed (via retry logic)
    const failures = results.filter((r) => r.status === "rejected");
    expect(failures.length).toBe(0);
  }, 30000); // 30 second timeout

  it("should handle invalid auth gracefully", async () => {
    const badClient = createChatwootClient({
      baseUrl: process.env.CHATWOOT_STAGING_URL!,
      apiToken: "invalid-token",
      accountId: 999999,
    });

    await expect(badClient.listOpenConversations(1)).rejects.toThrow(/401|403/);
  });
});
```

**Coverage Target:** All critical API endpoints

**Run Frequency:**

- Manual: Before deployments
- Automated: Nightly (2 AM UTC)
- Scheduled: After every staging deployment

---

### 3. Contract Tests (API Schema Validation)

**Purpose:** Detect breaking changes in external APIs

**Tool:** Pact or JSON Schema validation

**Location:** `tests/contract/`

**Example:** Shopify GraphQL Contract Test

```typescript
// tests/contract/shopify-orders-contract.test.ts
import { describe, it, expect } from "vitest";
import { z } from "zod";

// Expected schema for orders query
const OrderSchema = z.object({
  id: z.string(),
  name: z.string(),
  displayFinancialStatus: z.string(), // NOT financialStatus (deprecated)
  createdAt: z.string(),
  customer: z
    .object({
      displayName: z.string(),
    })
    .nullable(),
  totalPriceSet: z.object({
    shopMoney: z.object({
      amount: z.string(),
      currencyCode: z.string(),
    }),
  }),
});

describe("Shopify Orders API Contract", () => {
  it("should match expected schema", async () => {
    const response = await fetch(shopifyGraphqlEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": process.env.SHOPIFY_STAGING_TOKEN!,
      },
      body: JSON.stringify({
        query: ORDERS_QUERY,
      }),
    });

    const json = await response.json();
    const orders = json.data.orders.edges.map((e: any) => e.node);

    // Validate each order matches schema
    orders.forEach((order: any) => {
      const result = OrderSchema.safeParse(order);

      if (!result.success) {
        console.error("Schema validation failed:", result.error);
        console.error("Received data:", order);
      }

      expect(result.success).toBe(true);
    });
  });

  it("should not use deprecated fields", async () => {
    // Verify our queries don't use deprecated fields
    const querySrc = await fs.readFile(
      "app/services/shopify/queries.ts",
      "utf-8",
    );

    // Check for known deprecated fields
    expect(querySrc).not.toContain("financialStatus"); // Use displayFinancialStatus
    expect(querySrc).not.toContain("productVariantUpdate"); // Use productSet
  });
});
```

**Coverage Target:** All API responses used in production

**Run Frequency:**

- Daily (detect API changes early)
- Before major releases

---

### 4. End-to-End Tests (Full Workflow)

**Purpose:** Test complete user workflows involving integrations

**Tool:** Playwright or Cypress

**Location:** `tests/e2e/`

**Example:** Order to Dashboard E2E Test

```typescript
// tests/e2e/order-lifecycle.spec.ts
import { test, expect } from "@playwright/test";

test("Order appears in Sales Pulse after Shopify sync", async ({ page }) => {
  // 1. Create test order in Shopify (via API)
  const orderId = await createTestShopifyOrder({
    totalPrice: "99.99",
    customer: { email: "test@example.com" },
  });

  // 2. Trigger sync (or wait for scheduled sync)
  await triggerShopifySync();

  // 3. Login to HotDash
  await page.goto("/login");
  await page.fill('[name="email"]', "operator@hotdash.test");
  await page.fill('[name="password"]', process.env.TEST_PASSWORD!);
  await page.click('button[type="submit"]');

  // 4. Navigate to Sales Pulse
  await page.click('a[href="/dashboard"]');

  // 5. Verify order appears
  await expect(page.locator(".sales-pulse")).toContainText("$99.99");

  // 6. Cleanup - delete test order
  await deleteTestShopifyOrder(orderId);
});

test("Chatwoot message triggers approval workflow", async ({ page }) => {
  // 1. Send test message via Chatwoot webhook
  await sendTestChatwootWebhook({
    event: "message_created",
    conversation_id: 123,
    message: { content: "Where is my order?" },
  });

  // 2. Login as operator
  await loginAsOperator(page);

  // 3. Check approval queue
  await page.goto("/approvals");

  // 4. Verify draft response appears
  await expect(page.locator(".approval-card")).toContainText(
    "Where is my order?",
  );

  // 5. Approve draft
  await page.click('button:has-text("Approve")');

  // 6. Verify sent to Chatwoot
  // ... validation
});
```

**Coverage Target:** Critical user journeys (5-10 scenarios)

**Run Frequency:**

- Manual: Before releases
- Automated: Weekly (Sundays 3 AM UTC)

---

## Mock Servers for Offline Testing

### Why Mock Servers?

**Benefits:**

- Test without API quota consumption
- Test error scenarios (rate limits, timeouts)
- Faster test execution
- Reproducible tests (no flaky tests from API changes)

---

### Mock Server Implementation

**Tool:** MSW (Mock Service Worker) for HTTP mocking

**Location:** `tests/mocks/`

**Example:** Mock Shopify GraphQL Server

```typescript
// tests/mocks/shopify-mock.ts
import { graphql, HttpResponse } from "msw";

export const shopifyHandlers = [
  graphql.operation(async ({ query, variables }) => {
    // Parse query to determine response
    if (query.includes("shop { name }")) {
      return HttpResponse.json({
        data: {
          shop: {
            name: "Test Shop",
            email: "owner@testshop.com",
          },
        },
      });
    }

    if (query.includes("orders")) {
      return HttpResponse.json({
        data: {
          orders: {
            edges: [
              {
                node: {
                  id: "gid://shopify/Order/1",
                  name: "#1001",
                  displayFinancialStatus: "PAID",
                  createdAt: new Date().toISOString(),
                  customer: {
                    displayName: "Test Customer",
                  },
                  totalPriceSet: {
                    shopMoney: {
                      amount: "99.99",
                      currencyCode: "USD",
                    },
                  },
                },
              },
            ],
          },
        },
      });
    }

    // Default: return error
    return HttpResponse.json(
      {
        errors: [{ message: "Mock not implemented for this query" }],
      },
      { status: 400 },
    );
  }),

  // Mock rate limit error
  graphql.operation(async ({ request }) => {
    const rateLimitTest = request.headers.get("X-Test-Scenario");

    if (rateLimitTest === "rate-limit") {
      return HttpResponse.json(
        {
          errors: [{ message: "Exceeded 2 calls per second" }],
        },
        { status: 429 },
      );
    }
  }),
];
```

**Usage in Tests:**

```typescript
import { setupServer } from "msw/node";
import { shopifyHandlers } from "./mocks/shopify-mock";

const server = setupServer(...shopifyHandlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it("should handle mocked Shopify response", async () => {
  const result = await shopifyClient.getShop();
  expect(result.name).toBe("Test Shop");
});
```

---

### Mock Scenarios

**Create Mock Handlers For:**

1. **Success Cases**
   - Valid responses with typical data
   - Empty results (no orders, no conversations)

2. **Error Cases**
   - 429 Rate Limit
   - 500 Server Error
   - 503 Service Unavailable
   - Network timeout
   - Invalid auth (401/403)

3. **Edge Cases**
   - Very large responses (pagination)
   - Malformed data
   - Null/undefined fields
   - Unexpected data types

---

## CI/CD Integration

### GitHub Actions Workflow

**File:** `.github/workflows/integration-tests.yml`

```yaml
name: Integration Tests

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]
  schedule:
    - cron: "0 2 * * *" # Daily at 2 AM UTC
  workflow_dispatch: # Manual trigger

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit -- tests/unit/integrations/

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    if: github.event_name != 'pull_request' # Skip on PRs (use staging secrets)

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run integration tests
        env:
          SHOPIFY_STAGING_SHOP_DOMAIN: ${{ secrets.SHOPIFY_STAGING_SHOP_DOMAIN }}
          SHOPIFY_STAGING_ACCESS_TOKEN: ${{ secrets.SHOPIFY_STAGING_ACCESS_TOKEN }}
          CHATWOOT_STAGING_URL: ${{ secrets.CHATWOOT_STAGING_URL }}
          CHATWOOT_STAGING_TOKEN: ${{ secrets.CHATWOOT_STAGING_TOKEN }}
          GA_STAGING_PROPERTY_ID: ${{ secrets.GA_STAGING_PROPERTY_ID }}
          GOOGLE_APPLICATION_CREDENTIALS: ${{ secrets.GA_SERVICE_ACCOUNT_JSON }}
        run: |
          # Write GA credentials to file
          echo "$GOOGLE_APPLICATION_CREDENTIALS" > /tmp/ga-credentials.json
          export GOOGLE_APPLICATION_CREDENTIALS=/tmp/ga-credentials.json

          # Run tests
          npm run test:integration

      - name: Run shell integration tests
        env:
          SHOPIFY_DEV_MCP_PORT: 8001
          CHATWOOT_STAGING_URL: ${{ secrets.CHATWOOT_STAGING_URL }}
          CHATWOOT_STAGING_TOKEN: ${{ secrets.CHATWOOT_STAGING_TOKEN }}
        run: |
          chmod +x scripts/ops/test-all-integrations.sh
          ./scripts/ops/test-all-integrations.sh

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: integration-test-results
          path: test-results/

  contract-tests:
    runs-on: ubuntu-latest
    needs: unit-tests

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run contract tests
        env:
          SHOPIFY_STAGING_SHOP_DOMAIN: ${{ secrets.SHOPIFY_STAGING_SHOP_DOMAIN }}
          SHOPIFY_STAGING_ACCESS_TOKEN: ${{ secrets.SHOPIFY_STAGING_ACCESS_TOKEN }}
        run: npm run test:contract

      - name: Detect breaking changes
        if: failure()
        run: |
          echo "::error::Contract tests failed - API schema has changed"
          echo "Review test output for details on schema mismatches"

  e2e-tests:
    runs-on: ubuntu-latest
    needs: [integration-tests, contract-tests]
    if: github.ref == 'refs/heads/main' # Only on main branch

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        env:
          TEST_BASE_URL: https://staging.hotdash.app
          TEST_OPERATOR_EMAIL: ${{ secrets.TEST_OPERATOR_EMAIL }}
          TEST_OPERATOR_PASSWORD: ${{ secrets.TEST_OPERATOR_PASSWORD }}
        run: npm run test:e2e

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

### Test Commands in package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run tests/unit/",
    "test:integration": "vitest run tests/integration/ --reporter=verbose",
    "test:contract": "vitest run tests/contract/",
    "test:e2e": "playwright test",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## Test Data Management

### Test Fixtures

**Location:** `tests/fixtures/`

**Example:** Shopify Order Fixture

```typescript
// tests/fixtures/shopify-orders.ts
export const mockOrder = {
  id: "gid://shopify/Order/1234567890",
  name: "#TEST-1001",
  displayFinancialStatus: "PAID",
  createdAt: "2025-10-11T12:00:00Z",
  customer: {
    id: "gid://shopify/Customer/123",
    displayName: "Test Customer",
    email: "test@example.com",
  },
  totalPriceSet: {
    shopMoney: {
      amount: "99.99",
      currencyCode: "USD",
    },
  },
  lineItems: {
    edges: [
      {
        node: {
          id: "gid://shopify/LineItem/1",
          title: "Test Product",
          quantity: 2,
          originalUnitPriceSet: {
            shopMoney: {
              amount: "49.99",
              currencyCode: "USD",
            },
          },
        },
      },
    ],
  },
};

export const mockOrderRateLimited = {
  ...mockOrder,
  _testScenario: "rate-limit", // Signal to mock server
};

export const mockOrderWithNullCustomer = {
  ...mockOrder,
  customer: null, // Test null handling
};
```

---

### Test Database Seeding

**For Integration Tests:**

```typescript
// tests/helpers/seed-test-data.ts
export async function seedTestData() {
  const supabase = createClient(
    process.env.SUPABASE_STAGING_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Clear existing test data
  await supabase
    .from("dashboard_facts")
    .delete()
    .ilike("shop_domain", "%test%");

  // Seed test facts
  await supabase.from("dashboard_facts").insert([
    {
      shop_domain: "test-shop.myshopify.com",
      fact_type: "shopify.orders.today",
      scope: "sales",
      value: toInputJson({ count: 5, revenue: 499.95 }),
      generated_at: new Date().toISOString(),
    },
  ]);
}

export async function cleanupTestData() {
  const supabase = createClient(
    process.env.SUPABASE_STAGING_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  await supabase
    .from("dashboard_facts")
    .delete()
    .ilike("shop_domain", "%test%");
}
```

---

## Monitoring & Reporting

### Test Result Dashboard

**Create:** `docs/ops/test-results-dashboard.md`

**Metrics to Track:**

- Test pass rate (overall, per category)
- Test execution time (detect slow tests)
- Flaky test rate (tests that sometimes fail)
- Coverage percentage (code coverage)
- API availability (during integration tests)

**Visualization:** Grafana dashboard or simple HTML report

---

### Test Failure Alerts

**Slack Notification on Failure:**

```yaml
# In GitHub Actions workflow
- name: Notify on failure
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "❌ Integration Tests Failed",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*Integration Tests Failed*\nBranch: ${{ github.ref }}\nRun: <${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|View Details>"
            }
          }
        ]
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## Performance Testing

### Load Testing for APIs

**Tool:** k6 (https://k6.io/)

**Example:** Shopify API Load Test

```javascript
// tests/performance/shopify-load-test.js
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 10 }, // Ramp up to 10 users
    { duration: "1m", target: 10 }, // Stay at 10 users
    { duration: "30s", target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"], // 95% of requests < 2s
    http_req_failed: ["rate<0.01"], // < 1% errors
  },
};

export default function () {
  const shopifyUrl = __ENV.SHOPIFY_STAGING_URL;
  const accessToken = __ENV.SHOPIFY_STAGING_TOKEN;

  const response = http.post(
    `${shopifyUrl}/admin/api/2024-10/graphql.json`,
    JSON.stringify({
      query: "{ shop { name } }",
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
    },
  );

  check(response, {
    "status is 200": (r) => r.status === 200,
    "response time OK": (r) => r.timings.duration < 2000,
    "no rate limit": (r) => r.status !== 429,
  });

  sleep(1); // 1 request per second per user
}
```

**Run:** `k6 run tests/performance/shopify-load-test.js`

---

## Maintenance & Hygiene

### Flaky Test Detection

**Strategy:**

- Run tests 3 times
- If pass → fail → pass, mark as flaky
- Track flaky tests in dashboard
- Prioritize fixing flaky tests (high maintenance burden)

**Implementation:**

```yaml
# In CI workflow
- name: Detect flaky tests
  run: |
    npm run test:integration --reporter=json > test-results-1.json
    npm run test:integration --reporter=json > test-results-2.json
    npm run test:integration --reporter=json > test-results-3.json

    node scripts/analyze-flaky-tests.js
```

---

### Quarterly Test Review

**Checklist:**

- [ ] Review all failing tests (fix or remove)
- [ ] Update test data (fixtures may be stale)
- [ ] Check for deprecated APIs (contract tests)
- [ ] Remove tests for removed features
- [ ] Add tests for new integrations
- [ ] Review test coverage (aim for 80%+)
- [ ] Optimize slow tests (< 5s per test)

---

## Success Metrics

### Testing Effectiveness

**Metrics:**

- **Test Coverage:** 80%+ for integration code
- **Pass Rate:** > 98% (excluding flaky tests)
- **Execution Time:**
  - Unit tests: < 2 minutes
  - Integration tests: < 10 minutes
  - E2E tests: < 30 minutes
- **Flaky Rate:** < 5% of tests
- **API Uptime (detected by tests):** > 99%

**Business Impact:**

- Bugs caught in CI: > 80%
- Production incidents from API changes: < 2/quarter
- Time to detect API issues: < 1 hour (via nightly tests)

---

## Implementation Checklist

### Phase 1: Foundation (Week 1)

- [ ] Set up Vitest for unit tests
- [ ] Create mock server (MSW)
- [ ] Write unit tests for retry logic
- [ ] Write unit tests for Shopify client
- [ ] Set up GitHub Actions workflow (unit tests)
- **Estimated:** 12 hours

### Phase 2: Integration Tests (Week 2)

- [ ] Convert shell scripts to TypeScript tests
- [ ] Add integration tests for all 4 APIs
- [ ] Set up staging secrets in GitHub Actions
- [ ] Schedule nightly integration test runs
- **Estimated:** 16 hours

### Phase 3: Contract Tests (Week 3)

- [ ] Define schemas for all API responses
- [ ] Implement contract tests with Zod
- [ ] Set up daily contract test runs
- [ ] Add breaking change detection
- **Estimated:** 10 hours

### Phase 4: E2E Tests (Week 4)

- [ ] Set up Playwright
- [ ] Write 5-10 critical user journeys
- [ ] Integrate with CI (weekly runs)
- **Estimated:** 20 hours

**Total Effort:** 58 hours (~2 sprints)

---

**Framework Complete:** 2025-10-11 21:50 UTC  
**Status:** Ready for QA + Reliability implementation  
**Owner:** QA (test authoring), Reliability (CI/CD), Integrations (API expertise)  
**Next:** Coordinate with QA to schedule implementation sprints

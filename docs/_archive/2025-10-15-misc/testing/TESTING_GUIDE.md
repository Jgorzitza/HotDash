# HotDash Testing Guide for Developers

**Version**: 1.0  
**Date**: 2025-10-11  
**Audience**: All HotDash developers  
**Maintenance**: QA Team

---

## Quick Start

```bash
# Run all tests
npm run test:ci

# Run specific test suites
npm run test:unit          # Vitest unit tests
npm run test:e2e           # Playwright E2E tests
npm run test:a11y          # Accessibility tests
npm run test:lighthouse    # Performance tests

# Watch mode for development
npm run test:unit -- --watch
npx playwright test --ui   # Interactive E2E debugging
```

---

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Unit Testing (Vitest)](#unit-testing)
3. [Integration Testing](#integration-testing)
4. [E2E Testing (Playwright)](#e2e-testing)
5. [Accessibility Testing](#accessibility-testing)
6. [Performance Testing](#performance-testing)
7. [Security Testing](#security-testing)
8. [Test Data & Mocking](#test-data--mocking)
9. [Debugging Tests](#debugging-tests)
10. [CI/CD Integration](#cicd-integration)

---

## Testing Philosophy

**Test Pyramid**:

```
          /\
         /  \   E2E Tests (Playwright)
        / __ \  ~10% of tests - Critical user journeys
       /      \
      / Integ  \ Integration Tests
     /   Tests  \ ~20% of tests - API & service interactions
    /___________\
   /             \
  /  Unit  Tests \ Unit Tests (Vitest)
 /_________________\ ~70% of tests - Functions, utilities, services
```

**Principles**:

- **Fast**: Unit tests < 1s total, E2E < 5min total
- **Reliable**: < 1% flakiness rate
- **Independent**: Tests don't depend on execution order
- **Repeatable**: Same input = same output (deterministic)
- **Self-documenting**: Test names describe behavior

**Coverage Targets**:

- **Overall**: > 80% line coverage
- **Critical paths**: 100% coverage (approval actions, webhook flow)
- **Services**: > 90% coverage
- **Utilities**: > 95% coverage

---

## Unit Testing

### Technology: Vitest + React Testing Library

### File Structure

```
tests/unit/
  ├── services/           # Service layer tests
  ├── utils/              # Utility function tests
  ├── components/         # React component tests
  ├── fixtures/           # Shared test data
  └── setup.ts            # Global test setup
```

### Writing a Unit Test

#### Example: Service Test

```typescript
// tests/unit/services/chatwoot.escalations.spec.ts
import { describe, it, expect, beforeEach } from "vitest";
import { getEscalations } from "~/services/chatwoot/escalations";
import { mockChatwootClient } from "../fixtures/chatwoot-mocks";

describe("Chatwoot Escalations", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it("should return escalations when SLA breached", async () => {
    // Arrange
    const shopDomain = "test-shop.myshopify.com";
    const mockClient = mockChatwootClient();

    // Act
    const result = await getEscalations(shopDomain, mockClient);

    // Assert
    expect(result).toBeDefined();
    expect(result.escalations).toHaveLength(1);
    expect(result.escalations[0]).toMatchObject({
      conversationId: expect.any(Number),
      slaBreached: true,
      template: expect.any(String),
    });
  });

  it("should select appropriate template based on keywords", async () => {
    const mockClient = mockChatwootClient({
      conversations: [
        {
          messages: [{ content: "I want a refund for my order" }],
        },
      ],
    });

    const result = await getEscalations("test-shop", mockClient);

    expect(result.escalations[0].template).toBe("refund_offer");
  });
});
```

#### Example: Component Test

```typescript
// tests/unit/components/ApprovalCard.spec.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ApprovalCard } from '~/components/ApprovalCard';

describe('ApprovalCard', () => {
  it('should render queue item details', () => {
    const queueItem = {
      id: 'test-123',
      customer_name: 'John Doe',
      draft_response: 'Test draft',
      confidence_score: 85
    };

    render(<ApprovalCard item={queueItem} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText(/Confidence: 85%/)).toBeInTheDocument();
    expect(screen.getByText('Test draft')).toBeInTheDocument();
  });

  it('should call onApprove when approve button clicked', () => {
    const onApproveMock = vi.fn();
    const queueItem = { id: 'test-123' };

    render(<ApprovalCard item={queueItem} onApprove={onApproveMock} />);

    fireEvent.click(screen.getByRole('button', { name: /approve/i }));

    expect(onApproveMock).toHaveBeenCalledWith('test-123');
  });
});
```

### Best Practices

1. **Test Behavior, Not Implementation**

   ```typescript
   // ❌ Bad: Testing implementation details
   expect(component.state.isLoading).toBe(true);

   // ✅ Good: Testing observable behavior
   expect(screen.getByRole("status")).toHaveTextContent("Loading...");
   ```

2. **Arrange-Act-Assert Pattern**

   ```typescript
   it("should calculate discount correctly", () => {
     // Arrange: Set up test data
     const price = 100;
     const discountPercent = 20;

     // Act: Execute the code being tested
     const result = calculateDiscount(price, discountPercent);

     // Assert: Verify the outcome
     expect(result).toBe(80);
   });
   ```

3. **Use Descriptive Test Names**

   ```typescript
   // ❌ Bad: Vague test name
   it("works correctly", () => {
     /* ... */
   });

   // ✅ Good: Describes expected behavior
   it("should return empty array when no escalations exist", () => {
     /* ... */
   });
   ```

4. **One Assertion Per Test (when practical)**

   ```typescript
   // ✅ Good: Focused test
   it("should return escalations array", () => {
     expect(result.escalations).toBeInstanceOf(Array);
   });

   it("should include SLA breach information", () => {
     expect(result.escalations[0].slaBreached).toBe(true);
   });
   ```

---

## Integration Testing

### Purpose

Test interactions between multiple modules/services without external dependencies.

### File Structure

```
tests/integration/
  ├── agent-sdk-webhook.spec.ts    # Webhook flow integration
  ├── dashboard-facts.spec.ts      # Dashboard data pipeline
  └── chatwoot-agent-sdk.spec.ts   # Chatwoot + Agent SDK
```

### Example: Webhook Integration Test

```typescript
// tests/integration/agent-sdk-webhook.spec.ts
import { describe, it, expect } from "vitest";
import { processWebhook } from "~/functions/chatwoot-webhook";
import { supabase } from "~/config/supabase.server";

describe("Chatwoot → Agent SDK → Approval Queue", () => {
  it("should process webhook end-to-end", async () => {
    // Arrange: Mock services
    const mockLlamaIndex = mockLlamaIndexService();
    const mockAgentSDK = mockAgentSDKService();
    const mockChatwoot = mockChatwootClient();

    const payload = mockChatwootMessageCreated({
      conversation: { id: 12345 },
      message: { content: "What is your return policy?" },
    });

    // Act: Process webhook
    const result = await processWebhook(payload, {
      llamaIndex: mockLlamaIndex,
      agentSDK: mockAgentSDK,
      chatwoot: mockChatwoot,
    });

    // Assert: Verify complete pipeline
    expect(result.success).toBe(true);

    // Knowledge was queried
    expect(mockLlamaIndex.query).toHaveBeenCalledWith(
      expect.objectContaining({ query: expect.stringContaining("return") }),
    );

    // Draft was generated
    expect(mockAgentSDK.generateDraft).toHaveBeenCalled();

    // Private note created
    expect(mockChatwoot.createPrivateNote).toHaveBeenCalledWith(
      12345,
      expect.stringContaining("AGENT SDK DRAFT"),
    );

    // Queue entry created
    const queueItems = await supabase
      .from("agent_sdk_approval_queue")
      .select("*")
      .eq("conversation_id", 12345);

    expect(queueItems.data).toHaveLength(1);
    expect(queueItems.data[0]).toMatchObject({
      status: "pending",
      customer_message: "What is your return policy?",
    });
  });
});
```

---

## E2E Testing

### Technology: Playwright

### File Structure

```
tests/e2e/
  ├── approval-queue.spec.ts      # Approval queue workflows
  ├── dashboard.spec.ts           # Dashboard interactions
  ├── accessibility.spec.ts       # WCAG compliance
  └── admin-embed.spec.ts         # Shopify Admin embed
```

### Writing an E2E Test

```typescript
import { test, expect } from "@playwright/test";

test("operator can approve draft from queue", async ({ page }) => {
  // Navigate to approval queue
  await page.goto("http://localhost:3000/app/approvals");

  // Verify queue loads
  await expect(page.locator("h1")).toContainText("Approval Queue");

  // Click approve on first item
  await page.click('[data-testid="approve-button"]').first();

  // Confirm in modal
  await expect(page.locator('[role="dialog"]')).toBeVisible();
  await page.click('[data-testid="confirm-approve"]');

  // Verify success message
  await expect(page.locator('[role="alert"]')).toContainText(
    "Approved successfully",
  );

  // Verify item removed from queue
  const itemCount = await page.locator('[data-testid="queue-item"]').count();
  expect(itemCount).toBe(0);
});
```

### Page Object Pattern (Recommended for complex flows)

```typescript
// tests/e2e/pages/ApprovalQueuePage.ts
export class ApprovalQueuePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/app/approvals");
    await this.page.waitForSelector('[data-testid="queue-item"]');
  }

  async approveFirst() {
    await this.page.click('[data-testid="approve-button"]').first();
    await this.page.click('[data-testid="confirm-approve"]');
  }

  async getQueueCount() {
    return this.page.locator('[data-testid="queue-item"]').count();
  }
}

// Usage in tests
test("approval flow", async ({ page }) => {
  const queuePage = new ApprovalQueuePage(page);
  await queuePage.goto();
  await queuePage.approveFirst();

  expect(await queuePage.getQueueCount()).toBe(0);
});
```

---

## Accessibility Testing

### Technology: axe-core + Playwright

### Running Accessibility Tests

```bash
npm run test:a11y          # Run all accessibility tests
npm run test:a11y:report   # Generate HTML report
```

### Example Test

```typescript
import AxeBuilder from "@axe-core/playwright";

test("dashboard should have no accessibility violations", async ({ page }) => {
  await page.goto("http://localhost:3000/app");

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();

  expect(results.violations).toEqual([]);
});
```

### Common Accessibility Fixes

| Violation             | Fix                                    |
| --------------------- | -------------------------------------- |
| Missing alt text      | Add `alt="description"` to images      |
| Poor contrast         | Use darker colors (4.5:1 ratio)        |
| Missing form labels   | Add `<label>` with `for` attribute     |
| Non-descriptive links | Use descriptive text, not "click here" |
| Missing ARIA labels   | Add `aria-label` to icon buttons       |

---

## Performance Testing

### Technology: Lighthouse + Custom Benchmarks

### Running Performance Tests

```bash
npm run test:lighthouse         # Run Lighthouse audit
npm run perf:benchmark-routes   # Benchmark all routes
npm run perf:benchmark-mcp      # Benchmark MCP services
npm run perf:all                # Run all performance tests
```

### Performance Budgets

- **Critical routes**: < 100ms P95
- **Standard routes**: < 200ms P95
- **MCP services**: < 500ms P95
- **Lighthouse Performance**: ≥ 90

### Example Performance Test

```typescript
test("approval queue should load in < 200ms", async () => {
  const start = performance.now();

  const response = await fetch("http://localhost:3000/api/approvals/queue");
  await response.json();

  const duration = performance.now() - start;
  expect(duration).toBeLessThan(200);
});
```

---

## Security Testing

### Technology: axe-core + Custom Security Tests

### Running Security Tests

```bash
npm run test:security      # Run security test suite
npm audit                  # Check dependencies
npm run lint:security      # Security linting rules
```

### Example Security Test

```typescript
test("should sanitize XSS in user input", async () => {
  const xssPayload = '<script>alert("xss")</script>Hello';

  const response = await POST("/api/approvals/edit-approve", {
    queueItemId: "test-123",
    editedResponse: xssPayload,
  });

  const saved = await getQueueItem("test-123");
  expect(saved.edited_response).not.toContain("<script>");
  expect(saved.edited_response).toContain("Hello");
});
```

---

## Test Data & Mocking

### Mock Data Location

```
tests/fixtures/
  ├── agent-sdk-mocks.ts      # Agent SDK test data
  ├── chatwoot-mocks.ts       # Chatwoot API mocks
  ├── shopify-mocks.ts        # Shopify API mocks
  └── ga-mocks.ts             # Google Analytics mocks
```

### Creating Mock Data

```typescript
// tests/fixtures/agent-sdk-mocks.ts
export function mockQueueData(overrides = {}) {
  return {
    id: `queue-${Date.now()}`,
    conversation_id: Math.floor(Math.random() * 10000),
    customer_name: "Test Customer",
    draft_response: "Test draft response",
    confidence_score: 80,
    status: "pending",
    ...overrides,
  };
}

// Usage in tests
const highConfidenceItem = mockQueueData({ confidence_score: 95 });
const lowConfidenceItem = mockQueueData({ confidence_score: 45 });
```

### Mocking External Services

#### Mocking HTTP Requests (Vitest)

```typescript
import { vi } from "vitest";

// Mock global fetch
global.fetch = vi.fn();

beforeEach(() => {
  vi.mocked(fetch).mockResolvedValue(
    new Response(JSON.stringify({ success: true }), { status: 200 }),
  );
});

// Or use MSW (Mock Service Worker) for more complex scenarios
import { rest } from "msw";
import { setupServer } from "msw/node";

const server = setupServer(
  rest.post("http://localhost:8005/api/query", (req, res, ctx) => {
    return res(ctx.json({ sources: [] }));
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

#### Mocking Database (Supabase)

```typescript
import { supabase } from "~/config/supabase.server";

// Use test database
beforeEach(async () => {
  await supabase.from("agent_sdk_approval_queue").delete().neq("id", "0");
});

// Or mock Supabase client entirely
vi.mock("~/config/supabase.server", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
      insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
    })),
  },
}));
```

---

## Debugging Tests

### Debugging Unit Tests (Vitest)

```bash
# Run tests in debug mode
npm run test:unit -- --reporter=verbose

# Run specific test file
npm run test:unit tests/unit/logger.server.spec.ts

# Run tests matching pattern
npm run test:unit -- --grep "should log"

# Run in watch mode
npm run test:unit -- --watch
```

### Debugging E2E Tests (Playwright)

```bash
# Run in UI mode (interactive)
npx playwright test --ui

# Run in headed mode (see browser)
npx playwright test --headed

# Run specific test
npx playwright test tests/e2e/approval-queue.spec.ts

# Debug specific test
npx playwright test --debug tests/e2e/approval-queue.spec.ts

# Generate trace for failed tests
npx playwright test --trace on
npx playwright show-trace trace.zip
```

### Common Issues & Solutions

#### Issue: Test timeout

**Solution**: Increase timeout or optimize test

```typescript
test("slow operation", async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ... test code
});
```

#### Issue: Flaky test (passes sometimes, fails sometimes)

**Solution**: Add proper waits

```typescript
// ❌ Bad: Race condition
await page.click("button");
expect(await page.textContent(".result")).toBe("Success");

// ✅ Good: Wait for state
await page.click("button");
await page.waitForSelector(".result");
expect(await page.textContent(".result")).toBe("Success");
```

#### Issue: Mock not working

**Solution**: Verify mock is set up before import

```typescript
// ❌ Bad: Mock after import
import { service } from "./service";
vi.mock("./service");

// ✅ Good: Mock before import
vi.mock("./service");
import { service } from "./service";
```

---

## CI/CD Integration

### Quality Gates (All Must Pass)

1. ✅ Code Quality (typecheck + lint)
2. ✅ Unit Tests (100% pass rate)
3. ✅ E2E Tests (critical paths)
4. ✅ Accessibility (zero WCAG violations)
5. ✅ Security (no secrets, npm audit clean)
6. ✅ Build (successful compilation)
7. ✅ PR Metadata (title format, description)

### Running Tests Locally Before Commit

```bash
# Quick check (5-10 seconds)
npm run typecheck && npm run lint

# Full test suite (2-3 minutes)
npm run test:ci

# Specific suites
npm run test:unit          # Fast feedback (~5s)
npm run test:e2e           # Slower (~2min)
npm run test:a11y          # Accessibility (~1min)
```

### Pre-Commit Hook (Recommended)

```bash
# .husky/pre-commit
#!/bin/sh
npm run typecheck
npm run test:unit
```

---

## Writing Testable Code

### 1. Dependency Injection

```typescript
// ❌ Bad: Hard to test (hardcoded dependency)
export function getUser() {
  const db = new Database();
  return db.query("SELECT * FROM users");
}

// ✅ Good: Easy to test (injectable dependency)
export function getUser(db: Database) {
  return db.query("SELECT * FROM users");
}

// Test
const mockDb = { query: vi.fn().mockResolvedValue([]) };
await getUser(mockDb);
expect(mockDb.query).toHaveBeenCalled();
```

### 2. Pure Functions

```typescript
// ❌ Bad: Depends on external state
let total = 0;
function addToTotal(value) {
  total += value;
  return total;
}

// ✅ Good: Pure function (same input = same output)
function add(a, b) {
  return a + b;
}
```

### 3. Small, Focused Functions

```typescript
// ❌ Bad: God function (hard to test)
function processOrderAndSendEmailAndUpdateInventory(order) {
  // 200 lines of code
}

// ✅ Good: Single responsibility
function processOrder(order) {
  /* ... */
}
function sendOrderEmail(order) {
  /* ... */
}
function updateInventory(order) {
  /* ... */
}
```

---

## Test Coverage

### Viewing Coverage Report

```bash
npm run test:unit -- --coverage
open coverage/vitest/index.html
```

### Coverage Targets by File Type

| File Type  | Target | Critical          |
| ---------- | ------ | ----------------- |
| Services   | > 90%  | Yes               |
| Utilities  | > 95%  | Yes               |
| Routes     | > 70%  | No (E2E coverage) |
| Components | > 80%  | Medium            |

### Excluding Files from Coverage

```javascript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      exclude: ["tests/**", "**/*.spec.ts", "**/*.config.ts", "scripts/**"],
    },
  },
});
```

---

## Test Maintenance

### When to Update Tests

**Always update tests when**:

- Changing business logic
- Adding new features
- Fixing bugs (add regression test)
- Refactoring (update test structure)

**Test First (TDD) Recommended For**:

- Complex business logic
- Bug fixes (write failing test, then fix)
- API endpoints
- Critical user flows

### Handling Flaky Tests

1. **Identify**: Track test failures over time
2. **Diagnose**: Add logging, increase timeouts, check race conditions
3. **Fix**: Add proper waits, use deterministic test data
4. **Skip as last resort**: Mark `.skip()` with issue reference
   ```typescript
   test.skip("flaky test (see issue #123)", async () => {
     // ... test code
   });
   ```

### Test Debt Reduction

**Monthly review of**:

- Skipped tests (convert to .todo() or fix)
- Slow tests (optimize or split)
- Duplicate tests (consolidate)
- Outdated tests (update or remove)

---

## Quick Reference

### Vitest Assertions

```typescript
expect(value).toBe(expected); // Strict equality
expect(value).toEqual(expected); // Deep equality
expect(array).toContain(item); // Array includes
expect(object).toMatchObject(partial); // Partial match
expect(fn).toHaveBeenCalled(); // Mock called
expect(fn).toHaveBeenCalledWith(arg1, arg2); // Mock called with args
expect(value).toBeDefined(); // Not undefined
expect(value).toBeTruthy(); // Truthy value
expect(value).toBeGreaterThan(10); // Numeric comparison
```

### Playwright Assertions

```typescript
await expect(locator).toBeVisible(); // Element visible
await expect(locator).toContainText("text"); // Text content
await expect(locator).toHaveAttribute("href"); // Has attribute
await expect(locator).toHaveCount(5); // Element count
await expect(page).toHaveTitle("Title"); // Page title
await expect(page).toHaveURL(/pattern/); // URL matches
```

### Test Lifecycle Hooks

```typescript
beforeAll(() => {}); // Once before all tests
beforeEach(() => {}); // Before each test
afterEach(() => {}); // After each test
afterAll(() => {}); // Once after all tests
```

---

## FAQs

**Q: How many tests should I write?**  
A: Enough to feel confident deploying. Focus on critical paths first, edge cases second.

**Q: Should I test third-party libraries?**  
A: No, assume they work. Test your integration with them.

**Q: My test is slow. What should I do?**  
A: Profile it, mock expensive operations, or move to integration/E2E if appropriate.

**Q: My E2E test is flaky. Help!**  
A: Use `waitForSelector()`, avoid `setTimeout()`, use deterministic test data.

**Q: How do I test error scenarios?**  
A: Mock the service to throw errors, then assert your error handling works.

**Q: Should I test TypeScript types?**  
A: No, TypeScript compiler handles that. Test runtime behavior.

---

## Getting Help

- **Documentation**: `docs/testing/` directory
- **Examples**: `tests/unit/`, `tests/e2e/` directories
- **QA Team**: Tag `@qa` in PRs for test review
- **Test Strategy**: `docs/testing/agent-sdk/test-strategy.md`

---

**End of Testing Guide**

**Maintained by**: QA Team  
**Last Updated**: 2025-10-11  
**Next Review**: 2025-11-11

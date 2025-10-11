# Testing Best Practices

**Version**: 1.0  
**Date**: 2025-10-11  
**Audience**: All Developers  
**Related**: [TESTING_GUIDE.md](./TESTING_GUIDE.md)

---

## Golden Rules

1. **Write tests first (or soon after)** - Don't leave it for "later"
2. **Test behavior, not implementation** - Tests should survive refactoring
3. **Keep tests simple** - Test code should be simpler than production code
4. **One logical assertion per test** - Makes failures easier to diagnose
5. **Make tests independent** - No reliance on execution order
6. **Use descriptive names** - Test name should explain what it tests
7. **Avoid test duplication** - Each scenario tested once
8. **Keep tests fast** - Mock expensive operations
9. **Fix broken tests immediately** - Don't let them linger
10. **Delete obsolete tests** - Dead code includes tests

---

## Test Naming Conventions

### Pattern: `should [expected behavior] when [condition]`

```typescript
// ✅ Good: Clear, descriptive
it('should return 404 when user not found', () => {});
it('should calculate discount correctly for premium members', () => {});
it('should retry 3 times when API request fails', () => {});

// ❌ Bad: Vague, unclear
it('works', () => {});
it('test user function', () => {});
it('returns data', () => {});
```

### Grouping with describe

```typescript
describe('UserService', () => {
  describe('getUser', () => {
    it('should return user when ID exists', () => {});
    it('should return null when ID does not exist', () => {});
    it('should throw error when database unavailable', () => {});
  });

  describe('createUser', () => {
    it('should create user with valid data', () => {});
    it('should validate email format', () => {});
    it('should hash password before saving', () => {});
  });
});
```

---

## AAA Pattern (Arrange-Act-Assert)

Every test should follow this structure:

```typescript
it('should calculate total with tax', () => {
  // ARRANGE: Set up test data and preconditions
  const items = [
    { price: 100, quantity: 2 },
    { price: 50, quantity: 1 }
  ];
  const taxRate = 0.08;
  
  // ACT: Execute the code being tested
  const result = calculateTotal(items, taxRate);
  
  // ASSERT: Verify the expected outcome
  expect(result).toBe(270); // (100*2 + 50*1) * 1.08 = 270
});
```

---

## Mocking Best Practices

### When to Mock

**Mock**:
- External APIs (Shopify, Chatwoot, OpenAI)
- Databases (for unit tests)
- Time-dependent behavior (dates, timeouts)
- File system operations
- Network requests

**Don't Mock**:
- Simple utilities (just test them directly)
- Your own business logic (integration test instead)
- Third-party libraries you control (use real version)

### Mocking Levels

```typescript
// Level 1: Mock at module boundary (Vitest)
vi.mock('~/services/chatwoot', () => ({
  getChatwootClient: () => mockChatwootClient()
}));

// Level 2: Mock at function level
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Level 3: Mock at network level (MSW - preferred for HTTP)
import { rest } from 'msw';
server.use(
  rest.get('https://api.chatwoot.com/*', (req, res, ctx) => {
    return res(ctx.json({ data: [] }));
  })
);
```

### Mock Verification

```typescript
it('should call API with correct parameters', () => {
  const mockAPI = vi.fn();
  
  callService(mockAPI, { id: 123 });
  
  // Verify mock was called
  expect(mockAPI).toHaveBeenCalled();
  
  // Verify called with specific args
  expect(mockAPI).toHaveBeenCalledWith(
    expect.objectContaining({ id: 123 })
  );
  
  // Verify call count
  expect(mockAPI).toHaveBeenCalledTimes(1);
});
```

---

## Async Testing

### Promises

```typescript
// ✅ Good: Return promise
it('should fetch user data', () => {
  return fetchUser(123).then(user => {
    expect(user.id).toBe(123);
  });
});

// ✅ Better: async/await
it('should fetch user data', async () => {
  const user = await fetchUser(123);
  expect(user.id).toBe(123);
});

// ❌ Bad: Missing await/return
it('should fetch user data', () => {
  fetchUser(123).then(user => {
    expect(user.id).toBe(123); // This might not run!
  });
});
```

### Timeouts & Retries

```typescript
it('should wait for async operation', async () => {
  const promise = slowOperation();
  
  // Wait up to 5 seconds
  const result = await Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 5000)
    )
  ]);
  
  expect(result).toBeDefined();
});

// Or use Playwright's built-in waiting
test('should wait for element', async ({ page }) => {
  await page.click('button');
  
  // Waits up to 30s by default
  await expect(page.locator('.result')).toBeVisible();
});
```

---

## Test Data Best Practices

### 1. Use Factories for Complex Objects

```typescript
// tests/fixtures/factories.ts
export function createUser(overrides = {}) {
  return {
    id: Math.floor(Math.random() * 10000),
    email: `user${Date.now()}@test.com`,
    name: 'Test User',
    role: 'operator',
    created_at: new Date().toISOString(),
    ...overrides
  };
}

// Usage
const adminUser = createUser({ role: 'admin' });
const newUser = createUser({ created_at: yesterday() });
```

### 2. Keep Test Data Minimal

```typescript
// ❌ Bad: Too much irrelevant data
const user = {
  id: 123,
  email: 'test@example.com',
  name: 'John Doe',
  address: '123 Main St',
  phone: '+1-555-0100',
  preferences: { theme: 'dark', language: 'en' },
  // ... 20 more fields
};

// ✅ Good: Only what's needed for this test
const user = {
  id: 123,
  role: 'admin' // Only field relevant to this test
};
```

### 3. Use Descriptive Test Data

```typescript
// ❌ Bad: Magic numbers
const result = calculate(123, 456);
expect(result).toBe(579);

// ✅ Good: Self-documenting
const price = 100;
const taxRate = 0.08;
const expected = price * (1 + taxRate);

const result = calculateTotal(price, taxRate);
expect(result).toBe(expected);
```

---

## E2E Testing Best Practices

### 1. Use data-testid Selectors

```typescript
// ❌ Bad: Fragile selectors
await page.click('.btn.btn-primary.approve-btn');
await page.locator('div > div > button:nth-child(2)').click();

// ✅ Good: Stable, semantic selectors
await page.click('[data-testid="approve-button"]');
await page.getByRole('button', { name: 'Approve' }).click();
```

### 2. Wait for State, Not Time

```typescript
// ❌ Bad: Arbitrary wait
await page.click('button');
await page.waitForTimeout(3000); // Hope 3s is enough

// ✅ Good: Wait for actual state change
await page.click('button');
await page.waitForSelector('.success-message');
```

### 3. Clean Up Test Data

```typescript
test.beforeEach(async () => {
  // Clean database before each test
  await supabase
    .from('agent_sdk_approval_queue')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
});

test.afterEach(async () => {
  // Clean up after test
  await clearTestData();
});
```

---

## Coverage Best Practices

### Focus on Critical Paths

```typescript
// Priority 1: Critical business logic (100% coverage required)
function calculateRefund(order) {
  // Must have tests for all code paths
}

// Priority 2: Error handling (>80% coverage)
function handleAPIError(error) {
  // Test main scenarios
}

// Priority 3: UI components (>70% coverage)
function UserProfile({ user }) {
  // Test key interactions
}

// Lower priority: Simple utilities (test if complex)
function formatDate(date) {
  // Test if non-trivial logic
}
```

### Don't Chase 100% Coverage

**Test these**:
- Business logic
- Data transformations
- Error handling
- Edge cases
- Security-critical code

**Don't obsess over**:
- Simple getters/setters
- Framework boilerplate
- Type definitions
- Configuration files

---

## Common Anti-Patterns

### 1. Testing Implementation Details

```typescript
// ❌ Bad: Tests internal state
it('should set loading to true', () => {
  component.fetchData();
  expect(component.state.isLoading).toBe(true);
});

// ✅ Good: Tests observable behavior
it('should show loading spinner while fetching', () => {
  component.fetchData();
  expect(screen.getByRole('status')).toBeInTheDocument();
});
```

### 2. Brittle Tests

```typescript
// ❌ Bad: Breaks on styling changes
expect(element.className).toBe('button primary blue');

// ✅ Good: Tests semantic meaning
expect(element).toHaveAttribute('type', 'submit');
```

### 3. Testing Multiple Things

```typescript
// ❌ Bad: Multiple unrelated assertions
it('user service works', () => {
  expect(createUser()).toBeDefined();
  expect(deleteUser()).toBe(true);
  expect(listUsers()).toHaveLength(0);
});

// ✅ Good: One logical concept per test
it('should create user with valid data', () => {
  const user = createUser({ email: 'test@example.com' });
  expect(user).toBeDefined();
  expect(user.email).toBe('test@example.com');
});

it('should delete user by ID', () => {
  const result = deleteUser(123);
  expect(result).toBe(true);
});
```

### 4. Excessive Mocking

```typescript
// ❌ Bad: Mocking everything (integration test would be better)
vi.mock('~/services/db');
vi.mock('~/services/cache');
vi.mock('~/services/auth');
vi.mock('~/services/email');
// ... 10 more mocks

// ✅ Good: Mock only external dependencies
vi.mock('~/external/shopify-api');
// Test real integration of your services
```

---

## Playwright-Specific Best Practices

### 1. Use Locators, Not element Handles

```typescript
// ❌ Bad: ElementHandle (can become stale)
const button = await page.$('button');
await button.click();

// ✅ Good: Locator (auto-waits, auto-retries)
await page.locator('button').click();
```

### 2. Use Built-In Assertions

```typescript
// ❌ Bad: Manual waiting and assertion
await page.waitForSelector('.message');
const text = await page.textContent('.message');
expect(text).toBe('Success');

// ✅ Good: Built-in assertion with auto-wait
await expect(page.locator('.message')).toHaveText('Success');
```

### 3. Use test.step for Complex Flows

```typescript
test('complete checkout flow', async ({ page }) => {
  await test.step('Add item to cart', async () => {
    await page.goto('/products/123');
    await page.click('[data-testid="add-to-cart"]');
    await expect(page.locator('.cart-count')).toHaveText('1');
  });

  await test.step('Proceed to checkout', async () => {
    await page.click('[data-testid="cart-icon"]');
    await page.click('[data-testid="checkout-button"]');
  });

  await test.step('Complete payment', async () => {
    // ... checkout steps
  });
});
```

---

## Code Review Checklist for Tests

### Before Submitting PR

- [ ] All tests pass locally (`npm run test:ci`)
- [ ] New features have tests
- [ ] Bug fixes have regression tests
- [ ] Test names are descriptive
- [ ] No `.only()` or `.skip()` without reason
- [ ] Mocks are cleaned up properly
- [ ] Test data is deterministic
- [ ] No console.log() in tests
- [ ] Coverage increased or maintained

### Reviewing Test Code

- [ ] Tests actually test the stated behavior
- [ ] Assertions are meaningful
- [ ] Test data is realistic
- [ ] Mocks are appropriate (not excessive)
- [ ] Error cases are tested
- [ ] Edge cases are covered
- [ ] Tests will catch regressions

---

## Performance Best Practices

### Keep Unit Tests Fast

```typescript
// ❌ Bad: Real HTTP call in unit test
it('should fetch user', async () => {
  const user = await fetch('https://api.example.com/user/123');
  expect(user).toBeDefined();
});

// ✅ Good: Mocked HTTP call
it('should fetch user', async () => {
  global.fetch = vi.fn().mockResolvedValue({ id: 123 });
  const user = await fetchUser(123);
  expect(user.id).toBe(123);
});
```

### Optimize E2E Tests

```typescript
// ❌ Bad: Full page reload for each test
test.beforeEach(async ({ page }) => {
  await page.goto('/app');
  await login(page);
});

// ✅ Good: Reuse authentication state
test.use({ storageState: 'auth.json' });
```

### Parallel Execution

```typescript
// Enable parallel test execution
// vitest.config.ts
export default defineConfig({
  test: {
    threads: true,
    maxThreads: 4
  }
});

// Mark tests as independent
test.describe.configure({ mode: 'parallel' });
```

---

## Test Maintenance

### Regular Cleanup Tasks

**Weekly**:
- Review and fix failing tests
- Remove `.skip()` tests or convert to `.todo()`
- Update outdated mocks

**Monthly**:
- Review test coverage reports
- Identify and fill coverage gaps
- Refactor slow tests
- Clean up duplicate tests

**Quarterly**:
- Audit test suite health
- Update testing dependencies
- Review test strategy alignment with codebase

### Handling Flaky Tests

```typescript
// 1. Add retry for truly flaky external dependencies
test.describe.configure({ retries: 2 });

// 2. Add debugging for flakiness
it('flaky test', async () => {
  console.log('Test started at:', new Date().toISOString());
  // ... test code with extra logging
});

// 3. Skip with issue reference (last resort)
it.skip('flaky test - see issue #456', async () => {
  // ... test code
});
```

---

## Accessibility Testing Best Practices

### 1. Test with Keyboard Only

```typescript
test('approval queue keyboard navigable', async ({ page }) => {
  await page.goto('/app/approvals');
  
  // Navigate with keyboard only
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter'); // Expand item
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter'); // Approve
  
  await expect(page.locator('[role="dialog"]')).toBeVisible();
});
```

### 2. Test Screen Reader Announcements

```typescript
test('should announce status changes', async ({ page }) => {
  await page.goto('/app/approvals');
  
  const liveRegion = page.locator('[aria-live="polite"]');
  
  await page.click('[data-testid="approve-button"]').first();
  
  await expect(liveRegion).toContainText(/approved/i);
});
```

### 3. Check Color Contrast

```typescript
import AxeBuilder from '@axe-core/playwright';

test('should have sufficient color contrast', async ({ page }) => {
  await page.goto('/app');
  
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2aa'])
    .analyze();
  
  const contrastViolations = results.violations.filter(
    v => v.id === 'color-contrast'
  );
  
  expect(contrastViolations).toHaveLength(0);
});
```

---

## Security Testing Best Practices

### 1. Test Input Sanitization

```typescript
it('should sanitize XSS payload', async () => {
  const xssInput = '<script>alert("xss")</script>Hello';
  
  const result = await processUserInput(xssInput);
  
  expect(result).not.toContain('<script>');
  expect(result).toContain('Hello');
});
```

### 2. Test Authentication

```typescript
it('should require authentication', async () => {
  const response = await fetch('/api/approvals/queue');
  
  expect(response.status).toBe(401);
});

it('should accept valid JWT token', async () => {
  const token = generateTestToken({ userId: '123', role: 'operator' });
  
  const response = await fetch('/api/approvals/queue', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  expect(response.status).toBe(200);
});
```

### 3. Test Authorization

```typescript
it('should prevent operator from modifying others items', async () => {
  // Operator 1 claims item
  await claimQueueItem('item-123', 'operator-1');
  
  // Operator 2 tries to approve
  const response = await approveQueueItem('item-123', 'operator-2');
  
  expect(response.status).toBe(403);
  expect(response.body.error).toContain('not authorized');
});
```

---

## Snapshot Testing (Use Sparingly)

### When to Use Snapshots

**Good Use Cases**:
- Complex data structures that rarely change
- API response formats
- Error messages

**Avoid For**:
- UI components (use visual regression instead)
- Timestamps or random data
- Large objects with frequently changing fields

### Example

```typescript
it('should return correct error structure', () => {
  const error = createServiceError('Database timeout', {
    code: 'DB_TIMEOUT',
    retryable: true
  });
  
  expect(error).toMatchSnapshot();
});

// Update snapshots when intentionally changed
// npm run test:unit -- -u
```

---

## Test Organization

### File Naming

```
# Match source file names
app/services/chatwoot/escalations.ts
  → tests/unit/chatwoot.escalations.spec.ts

app/components/ApprovalCard.tsx
  → tests/unit/ApprovalCard.spec.tsx

app/routes/app.approvals.tsx
  → tests/e2e/approval-queue.spec.ts
```

### Test File Structure

```typescript
// Imports
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { functionUnderTest } from '~/path/to/module';

// Mocks (if needed)
vi.mock('~/external/service');

// Test suite
describe('ModuleName', () => {
  // Setup
  beforeEach(() => {
    // Arrange common setup
  });
  
  // Teardown
  afterEach(() => {
    // Clean up
  });
  
  // Happy path tests first
  it('should work in normal case', () => {
    // ...
  });
  
  // Edge cases
  it('should handle empty input', () => {
    // ...
  });
  
  // Error cases last
  it('should throw error when invalid', () => {
    // ...
  });
});
```

---

## Documentation in Tests

### Self-Documenting Tests

```typescript
// Tests serve as living documentation
describe('Discount Calculator', () => {
  it('should apply 10% discount to premium members', () => {
    const price = 100;
    const member = { tier: 'premium' };
    
    const result = calculateDiscount(price, member);
    
    expect(result).toBe(90); // 100 - 10% = 90
  });

  it('should not apply discount to free tier members', () => {
    const price = 100;
    const member = { tier: 'free' };
    
    const result = calculateDiscount(price, member);
    
    expect(result).toBe(100); // No discount
  });
});
```

### Comments in Tests (When Needed)

```typescript
it('should handle timezone conversion correctly', () => {
  // Given: User in New York (UTC-5)
  const nycTime = '2025-01-01T12:00:00-05:00';
  
  // When: Converting to UTC
  const utcTime = convertToUTC(nycTime);
  
  // Then: Time should be 5 hours ahead
  expect(utcTime).toBe('2025-01-01T17:00:00Z');
});
```

---

## Test-Driven Development (TDD)

### Red-Green-Refactor Cycle

1. **Red**: Write failing test
   ```typescript
   it('should calculate shipping cost', () => {
     const result = calculateShipping(weight, distance);
     expect(result).toBe(15.50);
   });
   // Test fails: calculateShipping is not defined
   ```

2. **Green**: Make test pass (simplest way)
   ```typescript
   function calculateShipping(weight, distance) {
     return 15.50; // Hardcoded to pass test
   }
   ```

3. **Refactor**: Implement properly
   ```typescript
   function calculateShipping(weight, distance) {
     const baseRate = 5;
     const perPound = 0.50;
     const perMile = 0.10;
     return baseRate + (weight * perPound) + (distance * perMile);
   }
   ```

### When to Use TDD

**Recommended for**:
- Bug fixes (write failing test that reproduces bug)
- Complex algorithms
- API endpoints
- Business logic with clear requirements

**Optional for**:
- UI components (design often evolves)
- Prototypes
- Scripts

---

## Continuous Improvement

### Measure Test Quality

```bash
# Test execution time
npm run test:unit -- --reporter=verbose

# Test flakiness (run 10 times)
for i in {1..10}; do npm run test:e2e; done

# Coverage trends
npm run test:unit -- --coverage
```

### Test Code Reviews

**Questions to ask**:
- Does this test add value?
- Will it catch real bugs?
- Is it testing the right thing?
- Is it maintainable?
- Would a new developer understand it?

---

## Resources

### Internal Documentation
- [Testing Guide](./TESTING_GUIDE.md) - Comprehensive guide
- [Agent SDK Test Strategy](./agent-sdk/test-strategy.md) - Integration testing
- [Performance Framework](./performance-testing-framework.md) - Load testing
- [Security Suite](./security-test-suite.md) - Security testing
- [Accessibility Standards](./accessibility-standards.md) - A11y requirements

### External Resources
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Kent C. Dodds Testing Blog](https://kentcdodds.com/blog)

---

## Getting Help

**Questions about testing?**
- Slack: #testing or #qa
- Tag @qa in PR for test review
- Review existing tests for examples
- Check this guide first!

**Found a bug in a test?**
- File issue with label: `test-bug`
- Tag @qa for triage
- Include test output and steps to reproduce

---

**End of Testing Best Practices**

**Remember**: Good tests give you confidence to ship. Bad tests give you false confidence or slow you down. Aim for good tests.

**Maintained by**: QA Team  
**Last Updated**: 2025-10-11


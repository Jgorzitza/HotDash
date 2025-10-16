# Testing Documentation

**File:** `docs/specs/testing.md`  
**Owner:** QA Agent  
**Purpose:** Comprehensive testing guide for HotDash  
**Version:** 1.0  
**Last Updated:** 2025-10-15

---

## Table of Contents

1. [Overview](#overview)
2. [Test Strategy](#test-strategy)
3. [Test Types](#test-types)
4. [Running Tests](#running-tests)
5. [Writing Tests](#writing-tests)
6. [CI/CD Integration](#cicd-integration)
7. [Coverage Requirements](#coverage-requirements)
8. [Best Practices](#best-practices)

---

## Overview

HotDash uses a comprehensive testing strategy covering all layers:
- **Unit Tests:** Component and function-level testing
- **Integration Tests:** API routes and database integration
- **E2E Tests:** Complete user flows with Playwright
- **Performance Tests:** Load and stress testing
- **Security Tests:** OWASP Top 10 validation
- **Accessibility Tests:** WCAG 2.1 AA compliance

**Test Framework:** Vitest (unit/integration), Playwright (E2E)  
**Coverage Tool:** Vitest coverage (c8)  
**CI/CD:** GitHub Actions

---

## Test Strategy

### Testing Pyramid

```
        /\
       /  \  E2E Tests (15%)
      /____\
     /      \  Integration Tests (35%)
    /________\
   /          \  Unit Tests (50%)
  /__________\
```

**Distribution:**
- 50% Unit Tests (fast, isolated)
- 35% Integration Tests (API + DB)
- 15% E2E Tests (critical user flows)

### Quality Gates

**All PRs must pass:**
- ✅ Unit test coverage ≥ 80%
- ✅ All integration tests passing
- ✅ Critical E2E flows passing
- ✅ Performance budgets met
- ✅ Security tests passing
- ✅ Accessibility tests passing

---

## Test Types

### 1. Unit Tests

**Location:** `tests/unit/**/*.spec.ts`  
**Purpose:** Test individual components and functions in isolation  
**Tools:** Vitest, React Testing Library

**Example:**
```typescript
import { describe, it, expect } from 'vitest';
import { calculateAOV } from '~/utils/metrics';

describe('calculateAOV', () => {
  it('should calculate average order value', () => {
    const result = calculateAOV(10000, 100);
    expect(result).toBe(100);
  });
  
  it('should handle zero orders', () => {
    const result = calculateAOV(10000, 0);
    expect(result).toBe(0);
  });
});
```

**Run:** `npm run test:unit`

### 2. Integration Tests

**Location:** `tests/integration/**/*.spec.ts`  
**Purpose:** Test API routes, database operations, external services  
**Tools:** Vitest, Supertest

**Example:**
```typescript
import { describe, it, expect } from 'vitest';

describe('GET /api/shopify/revenue', () => {
  it('should return revenue data', async () => {
    const response = await fetch('http://localhost:3000/api/shopify/revenue');
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('revenue');
  });
});
```

**Run:** `npm run test:integration`

### 3. E2E Tests

**Location:** `tests/e2e/**/*.spec.ts`  
**Purpose:** Test complete user flows in real browser  
**Tools:** Playwright

**Example:**
```typescript
import { test, expect } from '@playwright/test';

test('complete user flow', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('/dashboard');
});
```

**Run:** `npm run test:e2e`

### 4. Performance Tests

**Location:** `tests/performance/**/*.spec.ts`  
**Purpose:** Validate performance budgets and load handling  
**Tools:** Vitest, custom load testing

**Budgets:**
- P95 API latency < 500ms
- Page load time < 3s
- 100 concurrent users supported

**Run:** `npm run test:performance`

### 5. Security Tests

**Location:** `tests/security/**/*.spec.ts`  
**Purpose:** Validate security controls (auth, input validation, etc.)  
**Tools:** Vitest, OWASP dependency check

**Coverage:**
- Authentication/Authorization
- Input validation
- SQL injection prevention
- XSS prevention
- CSRF protection
- Secrets management

**Run:** `npm run test:security`

### 6. Accessibility Tests

**Location:** `tests/e2e/accessibility.spec.ts`  
**Purpose:** Ensure WCAG 2.1 AA compliance  
**Tools:** Playwright, axe-core

**Coverage:**
- Keyboard navigation
- Screen reader support
- Color contrast
- ARIA labels
- Focus management

**Run:** `npm run test:accessibility`

---

## Running Tests

### All Tests
```bash
npm test
```

### Specific Test Suites
```bash
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npm run test:e2e            # E2E tests only
npm run test:performance    # Performance tests only
npm run test:security       # Security tests only
npm run test:accessibility  # Accessibility tests only
```

### Watch Mode
```bash
npm run test:watch          # Watch mode for development
```

### Coverage
```bash
npm run test:coverage       # Generate coverage report
```

### Specific File
```bash
npm test -- tests/unit/utils/metrics.spec.ts
```

### Specific Test
```bash
npm test -- -t "should calculate AOV"
```

---

## Writing Tests

### Test Structure

Follow the **Arrange-Act-Assert** pattern:

```typescript
describe('Feature', () => {
  it('should do something', () => {
    // Arrange: Set up test data
    const input = { value: 100 };
    
    // Act: Execute the code under test
    const result = myFunction(input);
    
    // Assert: Verify the result
    expect(result).toBe(expected);
  });
});
```

### Test Naming

**Good:**
- `should calculate AOV correctly`
- `should handle empty cart`
- `should redirect to login when not authenticated`

**Bad:**
- `test 1`
- `works`
- `AOV`

### Fixtures

Use fixtures for test data:

```typescript
import { TilesFixtureFactory } from '~/tests/fixtures/tiles-factory';

const revenueData = TilesFixtureFactory.revenue();
const allTiles = TilesFixtureFactory.allTiles();
```

### Mocking

**Mock external services:**
```typescript
vi.mock('~/services/shopify', () => ({
  getRevenue: vi.fn().mockResolvedValue({ revenue: 100000 })
}));
```

**Mock API routes (E2E):**
```typescript
await page.route('**/api/shopify/revenue', (route) => {
  route.fulfill({
    status: 200,
    body: JSON.stringify({ revenue: 100000 })
  });
});
```

---

## CI/CD Integration

### GitHub Actions Workflow

**File:** `.github/workflows/test.yml`

**Triggers:**
- Pull requests to `main`
- Pushes to `main`

**Jobs:**
1. Unit Tests (with coverage)
2. Integration Tests (with Postgres)
3. E2E Tests (with Playwright)
4. Performance Tests
5. Security Tests
6. Accessibility Tests
7. Test Summary

**Artifacts:**
- Coverage reports
- Playwright reports
- Accessibility reports
- Dependency check reports

### PR Checks

All PRs must pass:
- ✅ All test suites
- ✅ Coverage ≥ 80%
- ✅ No security vulnerabilities
- ✅ No accessibility violations

---

## Coverage Requirements

### Minimum Coverage

- **Overall:** ≥ 80%
- **Statements:** ≥ 80%
- **Branches:** ≥ 75%
- **Functions:** ≥ 80%
- **Lines:** ≥ 80%

### Critical Paths

**Must have 100% coverage:**
- Authentication logic
- Payment processing
- Data mutations
- Security controls

### Viewing Coverage

```bash
npm run test:coverage
open coverage/index.html
```

---

## Best Practices

### 1. Test Isolation

Each test should be independent:
```typescript
describe('Feature', () => {
  beforeEach(() => {
    // Reset state before each test
  });
  
  afterEach(() => {
    // Clean up after each test
  });
});
```

### 2. Use Descriptive Names

```typescript
// Good
it('should return 401 when user is not authenticated', () => {});

// Bad
it('test auth', () => {});
```

### 3. Test Edge Cases

```typescript
describe('calculateAOV', () => {
  it('should handle zero orders', () => {});
  it('should handle negative revenue', () => {});
  it('should handle very large numbers', () => {});
  it('should handle decimal precision', () => {});
});
```

### 4. Avoid Test Interdependence

```typescript
// Bad: Tests depend on execution order
it('should create user', () => { /* creates user */ });
it('should update user', () => { /* assumes user exists */ });

// Good: Each test is independent
it('should create user', () => { /* creates and cleans up */ });
it('should update user', () => { /* creates, updates, cleans up */ });
```

### 5. Use Fixtures

```typescript
// Good: Reusable fixtures
const user = UserFixtureFactory.create();

// Bad: Inline data
const user = { id: 1, name: 'Test', email: 'test@example.com' };
```

### 6. Test Behavior, Not Implementation

```typescript
// Good: Tests behavior
it('should display error message when login fails', () => {});

// Bad: Tests implementation
it('should call setError with "Invalid credentials"', () => {});
```

### 7. Keep Tests Fast

- Use mocks for external services
- Use in-memory databases for tests
- Parallelize test execution
- Skip slow tests in watch mode

### 8. Document Complex Tests

```typescript
/**
 * This test verifies the complete approval flow:
 * 1. User opens approval drawer
 * 2. Sets grades (tone, accuracy, policy)
 * 3. Edits draft text
 * 4. Approves
 * 5. Verifies audit log entry created
 */
it('should complete approval flow with audit trail', async () => {
  // Test implementation
});
```

---

## Troubleshooting

### Tests Failing Locally

1. **Clear cache:** `npm run test:clear-cache`
2. **Reinstall dependencies:** `rm -rf node_modules && npm install`
3. **Check environment:** Ensure `.env.test` is configured

### Flaky Tests

1. **Add explicit waits:** Use `waitFor` instead of fixed timeouts
2. **Increase timeouts:** For slow operations
3. **Check for race conditions:** Ensure proper async handling

### Coverage Not Updating

1. **Clear coverage:** `rm -rf coverage`
2. **Run with coverage:** `npm run test:coverage`
3. **Check ignored files:** Verify `.coveragerc` configuration

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Test Plan Template](./test_plan_template.md)
- [Acceptance Criteria Guide](./acceptance_criteria_guide.md)

---

**Version History:**
- 1.0 (2025-10-15): Initial testing documentation


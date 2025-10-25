# Test Automation Pipeline Documentation

**Task:** TESTING-EMERGENCY-004  
**Status:** Complete  
**Last Updated:** 2025-10-23

## Overview

HotDash uses a comprehensive test automation pipeline with multiple testing frameworks and continuous integration workflows. This document provides complete documentation for the testing infrastructure.

## Testing Frameworks

### 1. Vitest (Unit & Integration Tests)

**Configuration:** `vitest.config.ts`

**Framework:** Vitest v2.1.9 with jsdom environment  
**Coverage:** Components, utilities, services, and business logic

**Key Features:**
- Fast execution with Vite-powered transforms
- TypeScript support out of the box
- jsdom environment for DOM testing
- Coverage reporting with v8
- Path aliases configured (`~` → `app/`)

**Test Patterns:**
```bash
tests/unit/**/*.spec.ts
tests/unit/**/*.spec.tsx
tests/integration/**/*.spec.ts
tests/agents/**/*.spec.ts
tests/contract/**/*.test.ts
```

**Setup File:** `tests/unit/setup.ts`
- Polaris component mocks (matchMedia, ResizeObserver)
- Environment variables for tests
- React Router mocks

**Run Commands:**
```bash
npm run test:unit          # Run all unit tests
vitest run                 # Same as above
vitest watch               # Watch mode
vitest run --coverage      # With coverage report
```

### 2. Playwright (E2E & Accessibility Tests)

**Configuration:** `playwright.config.ts`

**Framework:** Playwright v1.48.2  
**Coverage:** Full application flows, accessibility, visual regression

**Key Features:**
- Mock mode support (PLAYWRIGHT_MOCK_MODE)
- Multiple test projects (mock-mode, admin-embed)
- Automatic web server startup
- Trace on first retry
- HTML and JSON reporters

**Test Patterns:**
```bash
tests/playwright/**/*.spec.ts
tests/e2e/**/*.spec.ts
```

**Projects:**
1. **mock-mode**: Dashboard and modal tests with mocked data
2. **admin-embed**: Shopify Admin embedded app tests

**Run Commands:**
```bash
npm run test:e2e           # Run all E2E tests
npm run test:a11y          # Run accessibility tests
playwright test            # Same as test:e2e
playwright test --ui       # Interactive UI mode
playwright test --debug    # Debug mode
```

**Environment Variables:**
- `PLAYWRIGHT_MOCK_MODE`: "0" for live, "1" for mock (default: "1")
- `PLAYWRIGHT_BASE_URL`: Base URL for tests (default: http://127.0.0.1:4173)
- `PLAYWRIGHT_SHOPIFY_EMAIL`: Admin credentials for live tests
- `PLAYWRIGHT_SHOPIFY_PASSWORD`: Admin password for live tests

### 3. Lighthouse (Performance Tests)

**Script:** `scripts/ci/run-lighthouse.mjs`

**Framework:** Lighthouse v12.3.0  
**Coverage:** Performance, accessibility, SEO, best practices

**Run Commands:**
```bash
npm run test:lighthouse    # Run Lighthouse audit
```

## CI/CD Pipeline

### Main CI Workflow

**File:** `.github/workflows/ci.yml`

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch

**Jobs:**

#### 1. build-test
- Checkout code with full history
- Setup Node.js 20 with npm cache
- Install dependencies (`npm ci`)
- Run full CI suite (`npm run ci`)
- Dev MCP Ban Check
- Upload test results as artifacts

#### 2. manager-outcome
- Depends on: build-test
- Asserts manager produced PR or escalation

**CI Suite Command:**
```bash
npm run ci
```

**CI Suite Components:**
1. **Formatting:** `npm run fmt` - Prettier
2. **Linting:** `npm run lint` - ESLint
3. **Testing:** `npm run test:ci` - All tests
4. **Security:** `npm run scan` - Secret scanning

### Test CI Workflow

**Command:** `npm run test:ci`

**Components:**
1. Unit tests: `npm run test:unit`
2. E2E tests: `npm run test:e2e`
3. Accessibility tests: `npm run test:a11y`
4. Lighthouse tests: `npm run test:lighthouse`

### Additional CI Workflows

#### CI Guards
**File:** `.github/workflows/ci-guards.yml`

**Jobs:**
- MCP Evidence Validation
- Heartbeat Validation
- Dev MCP Ban Check

#### Migration Testing
**File:** `.github/workflows/migration-test.yml`

**Triggers:**
- PRs affecting `prisma/migrations/**`
- PRs affecting `prisma/schema.prisma`

#### AI Config Validation
**File:** `.github/workflows/ai-config.yml`

**Triggers:**
- PRs affecting `app/agents/config/**`

#### Gitleaks (Secret Scanning)
**File:** `.github/workflows/gitleaks.yml`

**Purpose:** Detect secrets in code

## Test Coverage

### Current Test Suites

**Unit Tests:**
- Analytics (action attribution, ROI, metrics)
- Ads (A/B testing, campaign automation, ROAS)
- Inventory (vendor management, PO tracking, seasonality)
- SEO (rankings, anomalies, search console)
- Services (Chatwoot, Shopify, Supabase)
- Components (ActionQueueCard, PIICard, Tiles)
- Utilities (date, validation, analytics)

**Integration Tests:**
- Ads workflow
- Agent SDK webhooks
- Chatwoot integration
- Growth engine
- Inventory workflows
- Social API
- Idea pool API

**E2E Tests:**
- Approval queue
- Dashboard flows
- Modal interactions
- Settings flow
- PII card
- Admin embed

**Accessibility Tests:**
- WCAG 2.1 AA compliance
- Screen reader compatibility
- Keyboard navigation

**Performance Tests:**
- Tile load benchmarks
- Lighthouse audits

### Coverage Reporting

**Vitest Coverage:**
- Reporter: text, lcov
- Directory: `./coverage/vitest`

**Playwright Coverage:**
- Reporter: html, json
- Directory: `./coverage/playwright`

**Run Coverage:**
```bash
vitest run --coverage
```

## Test Data Management

### Fixtures

**Location:** `tests/fixtures/`

**Available Fixtures:**
- `agent-sdk-mocks.ts` - Agent SDK mock data
- `chatwoot/` - Chatwoot conversation fixtures
- `shopify/` - Shopify API response fixtures
- `shopify-admin/` - Shopify Admin API fixtures
- `deploy-147/` - Deployment test fixtures

### Test Helpers

**Location:** `tests/helpers/`

**Available Helpers:**
- `shopify-fixtures.ts` - Shopify test data generators
- `test-utils.ts` - Common test utilities

### Mock Data

**Strategy:**
- Use fixtures for consistent test data
- Mock external APIs (Shopify, Chatwoot, GA4)
- Environment-based mocking (DASHBOARD_USE_MOCK)

## Environment Configuration

### Test Environment Variables

**Required:**
```bash
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_KEY=test-service-key
```

**Optional:**
```bash
PLAYWRIGHT_MOCK_MODE=1              # 0 for live, 1 for mock
PLAYWRIGHT_BASE_URL=http://...      # Test server URL
PLAYWRIGHT_SHOPIFY_EMAIL=...        # For admin embed tests
PLAYWRIGHT_SHOPIFY_PASSWORD=...     # For admin embed tests
DASHBOARD_USE_MOCK=1                # Mock mode for app
```

### CI Environment

**GitHub Actions Secrets:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- Additional secrets as needed

## Running Tests Locally

### Quick Start

```bash
# Install dependencies
npm ci

# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:e2e
npm run test:a11y
npm run test:lighthouse

# Run full CI suite
npm run ci
```

### Watch Mode

```bash
# Unit tests in watch mode
vitest watch

# E2E tests in UI mode
playwright test --ui
```

### Debug Mode

```bash
# Debug Playwright tests
playwright test --debug

# Debug specific test file
playwright test tests/e2e/approval-queue.spec.ts --debug
```

## Best Practices

### Writing Tests

1. **Use descriptive test names**
   ```typescript
   it("should calculate ROI correctly with positive revenue", () => {
     // test implementation
   });
   ```

2. **Follow AAA pattern** (Arrange, Act, Assert)
   ```typescript
   it("should format currency correctly", () => {
     // Arrange
     const amount = 1234.56;
     
     // Act
     const result = formatCurrency(amount);
     
     // Assert
     expect(result).toBe("$1,235");
   });
   ```

3. **Mock external dependencies**
   ```typescript
   vi.mock("~/services/shopify", () => ({
     getProduct: vi.fn().mockResolvedValue(mockProduct)
   }));
   ```

4. **Use fixtures for complex data**
   ```typescript
   import { mockChatwootConversation } from "../fixtures/chatwoot";
   ```

### Test Organization

- Unit tests: `tests/unit/`
- Integration tests: `tests/integration/`
- E2E tests: `tests/e2e/` or `tests/playwright/`
- Fixtures: `tests/fixtures/`
- Helpers: `tests/helpers/`

### Naming Conventions

- Test files: `*.spec.ts` or `*.spec.tsx`
- Contract tests: `*.test.ts`
- Fixtures: `*-fixtures.ts` or `mock-*.ts`

## Troubleshooting

### Common Issues

**1. Tests failing in CI but passing locally**
- Check environment variables
- Verify Node.js version (should be 20)
- Clear npm cache: `npm ci`

**2. Playwright tests timing out**
- Increase timeout in `playwright.config.ts`
- Check if web server is starting correctly
- Verify DASHBOARD_USE_MOCK is set

**3. Coverage not generating**
- Ensure `@vitest/coverage-v8` is installed
- Check `vitest.config.ts` coverage settings
- Run with `--coverage` flag

**4. Mock mode not working**
- Set `PLAYWRIGHT_MOCK_MODE=1`
- Set `DASHBOARD_USE_MOCK=1`
- Check fixture data is available

## Maintenance

### Regular Tasks

- **Weekly:** Review test coverage reports
- **Monthly:** Update test dependencies
- **Per Release:** Run full test suite
- **Per PR:** Automated CI runs all tests

### Updating Dependencies

```bash
# Update Vitest
npm install -D vitest@latest @vitest/coverage-v8@latest

# Update Playwright
npm install -D @playwright/test@latest
npx playwright install

# Update Lighthouse
npm install -D lighthouse@latest
```

## Metrics & Monitoring

### Test Execution Time

- Unit tests: ~3-5 seconds
- E2E tests: ~30-60 seconds
- Full CI suite: ~2-3 minutes

### Success Criteria

- ✅ All tests passing
- ✅ Coverage > 70% (target)
- ✅ No flaky tests
- ✅ CI pipeline green

## References

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/)
- [Testing Library](https://testing-library.com/)

## Acceptance Criteria Status

1. ✅ Set up Jest testing framework - **Using Vitest (modern alternative)**
2. ✅ Configure test automation pipeline - **CI/CD workflows configured**
3. ✅ Set up test coverage reporting - **Vitest coverage + Playwright reports**
4. ✅ Configure test environment - **Setup files, mocks, fixtures**
5. ✅ Implement test data management - **Fixtures and helpers in place**
6. ✅ Document test automation procedures - **This document**

---

**Completed:** 2025-10-23  
**Engineer:** engineer agent  
**Evidence:** All test suites running, CI workflows operational, comprehensive documentation


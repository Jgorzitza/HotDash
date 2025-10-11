# Integration Testing Guide

**Owner:** Integrations + QA  
**Created:** 2025-10-11  
**Purpose:** Guide for testing external API integrations

---

## Overview

HotDash integrates with external APIs (Shopify, Chatwoot, Google Analytics). This guide describes the testing strategy, available test scripts, and mock data requirements.

---

## Test Scripts

### Individual Integration Tests

**1. Shopify Integration Test**
```bash
./scripts/ops/test-shopify-integration.sh
```

Tests:
- Shopify MCP availability
- Staging secrets present
- GraphQL query patterns (deprecated check)
- Retry logic implementation

**2. Chatwoot Integration Test**
```bash
./scripts/ops/test-chatwoot-integration.sh
```

Tests:
- Chatwoot staging secrets present
- Health endpoint status
- Client implementation
- Escalation templates

**3. Google Analytics Integration Test**
```bash
./scripts/ops/test-ga-integration.sh
```

Tests:
- Service account credentials present and valid
- File permissions (must be 600)
- Direct API client implementation
- Package dependencies current

### All-In-One Test Suite
```bash
./scripts/ops/test-all-integrations.sh
```

Runs all 3 tests and generates summary report in `artifacts/integrations/integration-tests/`.

---

## Mock Data & Fixtures

### Shopify Fixtures
**Location:** `tests/fixtures/shopify/`

**Required Fixtures:**
- `orders.json` - Sample order data matching SALES_PULSE_QUERY response
- `fulfillments.json` - Sample fulfillment data
- `inventory.json` - Sample inventory levels

**Regeneration:**
When Shopify queries are fixed, regenerate fixtures from real staging data:
```bash
# Manual process:
# 1. Run query against staging Shopify store
# 2. Save response JSON to fixtures directory
# 3. Sanitize any PII (customer emails, addresses)
# 4. Commit to git
```

### Chatwoot Fixtures
**Location:** `tests/fixtures/chatwoot/`

**Required Fixtures:**
- `conversations.json` - Sample conversations with SLA data
- `messages.json` - Sample message history
- `templates.json` - Template matching test data

### Google Analytics Fixtures
**Location:** `tests/fixtures/ga/`

**Required Fixtures:**
- `landing-pages.json` - Sample runReport response
- `sessions.json` - Transformed session data

---

## CI/CD Integration

### GitHub Actions
```yaml
# Add to existing test workflow
- name: Test External Integrations
  run: ./scripts/ops/test-all-integrations.sh
```

### Pre-commit Hooks
```bash
# Add to .github/hooks/pre-commit
./scripts/ops/test-all-integrations.sh || {
  echo "Integration tests failed - fix before committing"
  exit 1
}
```

---

## Mock API Responses

### For Unit Tests

**Shopify Admin API Mock:**
```typescript
// tests/mocks/shopify.ts
export const mockShopifyAdmin = {
  graphql: jest.fn().mockImplementation((query, options) => {
    // Return fixture based on query
    if (query.includes('SalesPulse')) {
      return {
        ok: true,
        json: () => Promise.resolve(require('../fixtures/shopify/orders.json'))
      };
    }
    // ... other queries
  })
};
```

**Chatwoot API Mock:**
```typescript
// tests/mocks/chatwoot.ts
export const mockChatwootClient = {
  listConversations: jest.fn().mockResolvedValue(
    require('../fixtures/chatwoot/conversations.json')
  )
};
```

**Google Analytics Mock:**
```typescript
// tests/mocks/ga.ts
jest.mock('@google-analytics/data', () => ({
  BetaAnalyticsDataClient: jest.fn().mockImplementation(() => ({
    runReport: jest.fn().mockResolvedValue([
      require('../fixtures/ga/landing-pages.json')
    ])
  }))
}));
```

---

## Test Data Requirements

### Shopify Test Data

**Orders Fixture Requirements:**
- At least 5 orders spanning last 7 days
- Mix of fulfillment statuses (FULFILLED, PENDING, UNFULFILLED)
- Mix of financial statuses (PAID, PENDING, AUTHORIZED)
- Multiple line items per order
- SKU data present
- Currency data (amount + code)

**Inventory Fixture Requirements:**
- At least 10 product variants
- Mix of inventory levels (0, low stock, adequate stock)
- Multiple locations
- Available quantity data
- Product and variant metadata

### Chatwoot Test Data

**Conversations Fixture Requirements:**
- At least 5 unassigned conversations
- Mix of SLA status (breached, not breached)
- Message history (customer + agent messages)
- Tags for classification (shipping, refund, general)
- Timestamps (Unix seconds)

### Google Analytics Test Data

**Sessions Fixture Requirements:**
- At least 20 landing pages
- Session counts (realistic distribution)
- Date range: Last 7 days
- Ordered by sessions DESC

---

## Continuous Monitoring

### Scheduled Test Execution
**Frequency:** Daily (via GitHub Actions or cron)  
**Purpose:** Detect API changes, credential expiry, service degradation

**Cron Setup:**
```bash
# Daily integration test at 2 AM UTC
0 2 * * * cd /path/to/hotdash && ./scripts/ops/test-all-integrations.sh >> /tmp/integration-tests.log 2>&1
```

### Alert Conditions
- Any integration test fails
- Health endpoints return non-200
- Deprecated patterns detected in new code
- Secrets missing or invalid

---

**Guide Created:** 2025-10-11 21:32 UTC  
**Test Scripts:** 4 scripts (3 individual + 1 suite runner)  
**Next:** Create fixture templates and add to CI/CD


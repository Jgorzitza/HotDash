# Production Smoke Tests

## Overview

Smoke tests are lightweight, fast tests that verify critical functionality is working in production. They run frequently (every 5-15 minutes) to catch issues quickly.

## Test Categories

### 1. Critical Path Tests (`critical-path.spec.ts`)
- Dashboard loads successfully
- Authentication works
- Core API endpoints respond
- Database connectivity verified

### 2. Data Integrity Tests (`data-integrity.spec.ts`)
- Schema validation
- RLS policies enforced
- Data consistency checks
- Backup verification

### 3. Integration Tests (`integrations.spec.ts`)
- Shopify API connectivity
- Supabase connectivity
- Chatwoot API health
- External service health

### 4. Performance Tests (`performance.spec.ts`)
- Page load times < thresholds
- API response times < thresholds
- Database query performance

## Running Smoke Tests

```bash
# Run all smoke tests
npm run test:smoke

# Run specific category
npm run test:smoke:critical
npm run test:smoke:data
npm run test:smoke:integrations
npm run test:smoke:performance

# Run in CI
npm run test:smoke:ci
```

## Test Structure

Each smoke test should:
- Run in < 30 seconds
- Be independent (no dependencies on other tests)
- Clean up after itself
- Provide clear failure messages
- Include retry logic for flaky external services

## Alerting

Failed smoke tests trigger:
- Slack notification to #alerts channel
- PagerDuty alert for P0 failures
- Dashboard status update
- Automatic rollback consideration

## Maintenance

- Review smoke tests weekly
- Update thresholds based on performance trends
- Add new tests for critical features
- Remove obsolete tests


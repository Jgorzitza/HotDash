# Mutation Testing Framework (Task E)

**Technology**: Stryker Mutator  
**Purpose**: Verify tests actually catch bugs  
**Date**: 2025-10-11

---

## What is Mutation Testing?

Mutation testing introduces small changes (mutations) to your code and verifies that tests fail. If tests still pass with buggy code, the tests aren't effective.

**Example**:
```typescript
// Original code
function calculateDiscount(price, percent) {
  return price * (1 - percent / 100);
}

// Mutation: Change operator
function calculateDiscount(price, percent) {
  return price * (1 + percent / 100);  // Changed - to +
}
```

**Expected**: Tests should FAIL with this mutation  
**If tests PASS**: Your tests aren't testing the calculation logic!

---

## Setup

```bash
npm install -D @stryker-mutator/core @stryker-mutator/typescript-checker @stryker-mutator/vitest-runner
```

### Configuration

```javascript
// stryker.conf.json
{
  "$schema": "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
  "packageManager": "npm",
  "testRunner": "vitest",
  "reporters": ["html", "clear-text", "progress", "dashboard"],
  "coverageAnalysis": "perTest",
  "mutate": [
    "app/services/**/*.ts",
    "app/utils/**/*.ts",
    "!app/**/*.spec.ts",
    "!app/**/*.test.ts"
  ],
  "thresholds": {
    "high": 90,
    "low": 70,
    "break": 60
  },
  "timeoutMS": 60000,
  "concurrency": 4
}
```

---

## Running Mutation Tests

```bash
# Run on specific module
npx stryker run --mutate="app/services/chatwoot/escalations.ts"

# Run on all services
npx stryker run

# Generate HTML report
npx stryker run --reporters html
open reports/mutation/html/index.html
```

---

## Example Mutation Test

```typescript
// app/services/discount.ts
export function calculateDiscount(price: number, discountPercent: number): number {
  if (discountPercent < 0 || discountPercent > 100) {
    throw new Error('Invalid discount percent');
  }
  return price * (1 - discountPercent / 100);
}

// tests/unit/discount.spec.ts
describe('calculateDiscount', () => {
  it('should calculate 20% discount correctly', () => {
    expect(calculateDiscount(100, 20)).toBe(80);
  });

  it('should throw error for negative discount', () => {
    expect(() => calculateDiscount(100, -10)).toThrow('Invalid discount percent');
  });

  it('should throw error for discount > 100', () => {
    expect(() => calculateDiscount(100, 150)).toThrow('Invalid discount percent');
  });
});
```

**Mutations Stryker Will Try**:
1. Change `<` to `<=` → Test should catch
2. Change `>` to `>=` → Test should catch
3. Change `-` to `+` → Test should catch
4. Remove if statement → Test should catch

**Mutation Score**: 4/4 killed = 100% (excellent!)

---

## Interpreting Results

### Mutation States

| State | Meaning | Good/Bad |
|-------|---------|----------|
| Killed | Test failed when code mutated | ✅ Good - Test is effective |
| Survived | Test passed with buggy code | ❌ Bad - Test missing coverage |
| Timeout | Mutation caused infinite loop | ⚠️ Warning - Review logic |
| No Coverage | Code not covered by tests | ❌ Bad - Add tests |

### Mutation Score

```
Mutation Score = (Killed + Timeout) / (Total Mutations)

90-100%: Excellent test quality
70-89%:  Good test quality
50-69%:  Fair test quality
<50%:    Poor test quality - Improve tests
```

---

## CI Integration

```yaml
# .github/workflows/mutation-testing.yml
name: Mutation Testing

on:
  schedule:
    - cron: '0 3 * * 0'  # Weekly on Sunday

jobs:
  mutation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx stryker run
      - uses: actions/upload-artifact@v4
        with:
          name: mutation-report
          path: reports/mutation/
```

---

## Recommendations

### Start Small
- Week 1: Run on utilities (pure functions)
- Week 2: Run on services
- Week 3: Run on full codebase

### Focus on Critical Code
```javascript
// stryker.conf.json
{
  "mutate": [
    "app/services/approval/**/*.ts",    // Critical: Approval logic
    "app/services/chatwoot/**/*.ts",    // Critical: Customer communication
    "app/services/shopify/**/*.ts",     // Critical: E-commerce integration
    "app/utils/logger.server.ts"        // Critical: Observability
  ]
}
```

### Weekly Mutation Testing
- Run on changed files only (fast)
- Full suite monthly (comprehensive)

---

**Status**: Framework designed with Stryker  
**Estimated Effort**: 8 hours (setup + first run)  
**Value**: Ensures test quality, not just coverage


# Visual Regression Testing Framework (Task C)

**Technology**: Playwright Visual Comparisons (Built-in)  
**Alternative**: Percy or Chromatic (if budget allows)  
**Date**: 2025-10-11

---

## Overview

Visual regression testing catches unintended UI changes by comparing screenshots before and after code changes.

**Approach**: Start with Playwright's built-in visual comparisons (free), migrate to Percy/Chromatic if needed.

---

## Implementation with Playwright

### Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,  // Allow small differences
      threshold: 0.2       // 20% threshold
    }
  }
});
```

### Example Tests

```typescript
// tests/e2e/visual-regression.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('dashboard should match snapshot', async ({ page }) => {
    await page.goto('http://localhost:3000/app');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('dashboard.png');
  });

  test('approval queue should match snapshot', async ({ page }) => {
    // Seed deterministic test data
    await seedApprovalQueue([
      { id: '1', customer_name: 'Test User 1', confidence_score: 85 },
      { id: '2', customer_name: 'Test User 2', confidence_score: 45 }
    ]);
    
    await page.goto('http://localhost:3000/app/approvals');
    await page.waitForSelector('[data-testid="queue-item"]');
    
    await expect(page).toHaveScreenshot('approval-queue.png');
  });

  test('approval modal should match snapshot', async ({ page }) => {
    await page.goto('http://localhost:3000/app/approvals');
    await page.click('[data-testid="approve-button"]').first();
    
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    
    await expect(modal).toHaveScreenshot('approval-modal.png');
  });
});
```

### Update Snapshots

```bash
# Update all snapshots
npx playwright test --update-snapshots

# Update specific snapshot
npx playwright test visual-regression.spec.ts --update-snapshots
```

---

## Alternative: Percy Integration

### Setup

```bash
npm install -D @percy/cli @percy/playwright
```

### Configuration

```typescript
// tests/e2e/percy-visual.spec.ts
import { test } from '@playwright/test';
import percySnapshot from '@percy/playwright';

test('approval queue visual test', async ({ page }) => {
  await page.goto('http://localhost:3000/app/approvals');
  
  await percySnapshot(page, 'Approval Queue - Empty State');
  
  await seedApprovalQueue([...testData]);
  await page.reload();
  
  await percySnapshot(page, 'Approval Queue - With Items');
});
```

### GitHub Action

```yaml
# .github/workflows/percy-visual.yml
- name: Run Percy snapshots
  run: npx percy exec -- npm run test:e2e
  env:
    PERCY_TOKEN: ${{ secrets.PERCY_TOKEN }}
```

---

## Visual Test Scenarios

1. **Empty States**: No data, loading, error states
2. **Data States**: With data, different data quantities
3. **Interaction States**: Hover, focus, active, disabled
4. **Responsive**: Mobile, tablet, desktop breakpoints
5. **Themes**: Light/dark mode (if applicable)
6. **Edge Cases**: Long text, special characters, overflow

---

**Status**: Framework designed, ready for implementation  
**Estimated Effort**: 4 hours (Playwright), 8 hours (Percy)  
**Dependencies**: None


/**
 * Phase 6 Settings Page Accessibility Tests - WCAG 2.2 AA Compliance
 *
 * Comprehensive accessibility testing for Settings & Personalization features:
 * - Dashboard tab (tile visibility, drag/drop reordering)
 * - Appearance tab (theme switching)
 * - Notifications tab (desktop notifications, thresholds)
 * - Integrations tab (health checks, API keys)
 *
 * @requires @axe-core/playwright
 * @see docs/specs/phase-6-test-plan.md (TS-024 to TS-029)
 * @see docs/design/accessibility-audit-phase-1-6.md
 */

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const SETTINGS_PATH = "/app/settings";

/**
 * WCAG 2.2 Level AA Baseline Tests
 */
test.describe("Settings Page WCAG 2.2 AA Compliance", () => {
  test("should have no critical accessibility violations", async ({ page }) => {
    await page.goto(`${SETTINGS_PATH}?mock=1`);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    // Log violations for debugging
    if (accessibilityScanResults.violations.length > 0) {
      console.log("\n❌ Accessibility violations found on Settings page:");
      accessibilityScanResults.violations.forEach((violation) => {
        console.log(`\n  ${violation.id}: ${violation.description}`);
        console.log(`  Impact: ${violation.impact}`);
        console.log(`  Help: ${violation.helpUrl}`);
        console.log(`  Elements affected: ${violation.nodes.length}`);
      });
    }

    // Target: 0 critical violations for launch
    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );
    expect(criticalViolations).toEqual([]);
  });

  test("should have proper page title for screen readers", async ({ page }) => {
    await page.goto(`${SETTINGS_PATH}?mock=1`);

    await expect(page).toHaveTitle(/settings/i);
  });

  test("should have proper landmark regions", async ({ page }) => {
    await page.goto(`${SETTINGS_PATH}?mock=1`);

    // Check for required landmarks
    await expect(page.locator("main, [role='main']")).toBeVisible();
    await expect(page.locator("[role='navigation'], nav")).toBeVisible();
  });
});

/**
 * Keyboard Navigation Tests (TS-024)
 * WCAG 2.1.1 (Keyboard - Level A)
 * WCAG 2.1.2 (No Keyboard Trap - Level A)
 * WCAG 2.4.7 (Focus Visible - Level AA)
 */
test.describe("Settings Page Keyboard Navigation", () => {
  test("should have logical tab order through all 4 tabs", async ({ page }) => {
    await page.goto(`${SETTINGS_PATH}?mock=1`);

    // Press Tab to move through interface
    await page.keyboard.press("Tab");
    let focused = page.locator(":focus");

    // Verify focus indicator is visible
    await expect(focused).toBeVisible();

    // Tab through all interactive elements
    const tabCount = 20; // Approximate number of focusable elements
    for (let i = 0; i < tabCount; i++) {
      await page.keyboard.press("Tab");
      focused = page.locator(":focus");
      await expect(focused).toBeVisible(); // Focus indicator must be visible
    }
  });

  test("should navigate between tabs using keyboard", async ({ page }) => {
    await page.goto(`${SETTINGS_PATH}?mock=1`);

    // Tab to first tab button
    const dashboardTab = page.locator('[role="tab"]', { hasText: /dashboard/i });
    await dashboardTab.focus();

    // Press Enter to activate tab
    await page.keyboard.press("Enter");

    // Verify tab panel is visible
    const dashboardPanel = page.locator('[role="tabpanel"]').first();
    await expect(dashboardPanel).toBeVisible();

    // Navigate to next tab with Arrow keys (if supported)
    // Or Tab to next tab button
    const appearanceTab = page.locator('[role="tab"]', { hasText: /appearance/i });
    await appearanceTab.focus();
    await page.keyboard.press("Enter");

    const appearancePanel = page.locator('[role="tabpanel"]').nth(1);
    await expect(appearancePanel).toBeVisible();
  });

  test("should allow keyboard interaction with toggles", async ({ page }) => {
    await page.goto(`${SETTINGS_PATH}?mock=1`);

    // Navigate to Dashboard tab
    const dashboardTab = page.locator('[role="tab"]', { hasText: /dashboard/i });
    await dashboardTab.click();

    // Find tile visibility toggle
    const toggle = page.locator('[role="switch"]').first();
    await toggle.focus();

    // Get initial state
    const initialState = await toggle.getAttribute("aria-checked");

    // Press Space to toggle
    await page.keyboard.press("Space");

    // Verify state changed
    const newState = await toggle.getAttribute("aria-checked");
    expect(newState).not.toBe(initialState);
  });

  test("should not have keyboard traps", async ({ page }) => {
    await page.goto(`${SETTINGS_PATH}?mock=1`);

    // Tab through entire page
    for (let i = 0; i < 50; i++) {
      await page.keyboard.press("Tab");
    }

    // Should be able to Shift+Tab back
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("Shift+Tab");
    }

    // Should still have focus somewhere on page (no trap)
    const focused = page.locator(":focus");
    await expect(focused).toBeAttached();
  });

  test("should have visible focus indicators with sufficient contrast", async ({
    page,
  }) => {
    await page.goto(`${SETTINGS_PATH}?mock=1`);

    // Focus an interactive element
    const button = page.locator("button").first();
    await button.focus();

    // Check for focus ring visibility
    // Note: This is a basic check; full contrast testing requires axe-core
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2aa"])
      .include("button:focus")
      .analyze();

    const focusViolations = accessibilityScanResults.violations.filter(
      (v) =>
        v.id === "color-contrast" ||
        v.id === "focus-order-semantics" ||
        v.id === "focus-visible",
    );

    expect(focusViolations).toEqual([]);
  });
});

/**
 * Drag/Drop Keyboard Alternative Tests (TS-026)
 * WCAG 2.5.7 (Dragging Movements - Level AA)
 */
test.describe("Tile Reordering Keyboard Accessibility", () => {
  test("should provide keyboard alternative to drag/drop", async ({ page }) => {
    await page.goto(`${SETTINGS_PATH}?mock=1`);

    // Navigate to Dashboard tab
    const dashboardTab = page.locator('[role="tab"]', { hasText: /dashboard/i });
    await dashboardTab.click();

    // Look for "Edit Tile Order" button (keyboard alternative)
    const editOrderButton = page.locator("button", {
      hasText: /edit.*order|reorder/i,
    });

    // Button should exist and be accessible via keyboard
    await editOrderButton.focus();
    await page.keyboard.press("Enter");

    // Modal should open with tile reordering UI
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Modal should have up/down arrow buttons
    const upButton = modal.locator("button", { hasText: /up|↑|chevron.*up/i }).first();
    const downButton = modal.locator("button", { hasText: /down|↓|chevron.*down/i }).first();

    await expect(upButton).toBeVisible();
    await expect(downButton).toBeVisible();

    // Buttons should have accessible labels
    const upLabel = await upButton.getAttribute("aria-label");
    expect(upLabel).toMatch(/move.*up/i);
  });

  test("should announce current position to screen readers", async ({ page }) => {
    await page.goto(`${SETTINGS_PATH}?mock=1`);

    // Open tile reorder modal (keyboard alternative)
    const dashboardTab = page.locator('[role="tab"]', { hasText: /dashboard/i });
    await dashboardTab.click();

    const editOrderButton = page.locator("button", {
      hasText: /edit.*order|reorder/i,
    });
    await editOrderButton.click();

    // Check for position announcement
    const tileItem = page.locator('[role="listitem"]').first();
    const ariaLabel = await tileItem.getAttribute("aria-label");

    // Should announce position: "Revenue & Sales, position 1 of 8"
    expect(ariaLabel).toMatch(/position \d+ of \d+/i);
  });
});

/**
 * Color Contrast Tests (TS-027)
 * WCAG 1.4.3 (Contrast Minimum - Level AA)
 * WCAG 1.4.11 (Non-text Contrast - Level AA)
 */
test.describe("Settings Page Color Contrast", () => {
  test("should meet 4.5:1 contrast ratio for all text (Light theme)", async ({
    page,
  }) => {
    await page.goto(`${SETTINGS_PATH}?mock=1`);

    // Set light theme
    const appearanceTab = page.locator('[role="tab"]', { hasText: /appearance/i });
    await appearanceTab.click();

    const lightThemeRadio = page.locator('[type="radio"]', { hasText: /light/i });
    await lightThemeRadio.check();

    // Run contrast check
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2aa"])
      .analyze();

    const contrastViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === "color-contrast",
    );

    // Log any contrast violations
    if (contrastViolations.length > 0) {
      console.log("\n⚠️  Color contrast violations (Light theme):");
      contrastViolations.forEach((v) => {
        console.log(`  Impact: ${v.impact}`);
        v.nodes.forEach((node) => {
          console.log(`  Element: ${node.html}`);
        });
      });
    }

    expect(contrastViolations).toEqual([]);
  });

  test("should meet 4.5:1 contrast ratio for all text (Dark theme)", async ({
    page,
  }) => {
    await page.goto(`${SETTINGS_PATH}?mock=1`);

    // Set dark theme
    const appearanceTab = page.locator('[role="tab"]', { hasText: /appearance/i });
    await appearanceTab.click();

    const darkThemeRadio = page.locator('[type="radio"]', { hasText: /dark/i });
    await darkThemeRadio.check();

    // Wait for theme to apply
    await page.waitForTimeout(500);

    // Run contrast check
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2aa"])
      .analyze();

    const contrastViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === "color-contrast",
    );

    // Log any contrast violations
    if (contrastViolations.length > 0) {
      console.log("\n⚠️  Color contrast violations (Dark theme):");
      contrastViolations.forEach((v) => {
        console.log(`  Impact: ${v.impact}`);
        v.nodes.forEach((node) => {
          console.log(`  Element: ${node.html}`);
        });
      });
    }

    expect(contrastViolations).toEqual([]);
  });

  test("should meet 3:1 contrast for UI components (borders, icons)", async ({
    page,
  }) => {
    await page.goto(`${SETTINGS_PATH}?mock=1`);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2aa"])
      .analyze();

    // Check for non-text contrast violations (WCAG 1.4.11)
    const uiContrastViolations = accessibilityScanResults.violations.filter(
      (v) => v.id.includes("color-contrast") || v.id.includes("non-text"),
    );

    expect(uiContrastViolations).toEqual([]);
  });
});

/**
 * Screen Reader Compatibility Tests (TS-025)
 * WCAG 4.1.2 (Name, Role, Value - Level A)
 * WCAG 4.1.3 (Status Messages - Level AA)
 */
test.describe("Settings Page Screen Reader Compatibility", () => {
  test("should have proper ARIA labels on all interactive elements", async ({
    page,
  }) => {
    await page.goto(`${SETTINGS_PATH}?mock=1`);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const labelViolations = accessibilityScanResults.violations.filter(
      (v) =>
        v.id === "button-name" ||
        v.id === "label" ||
        v.id === "label-title-only" ||
        v.id === "aria-input-field-name",
    );

    if (labelViolations.length > 0) {
      console.log("\n⚠️  ARIA label violations:");
      labelViolations.forEach((v) => {
        console.log(`  ${v.id}: ${v.description}`);
        v.nodes.forEach((node) => {
          console.log(`    ${node.html}`);
        });
      });
    }

    expect(labelViolations).toEqual([]);
  });

  test("should announce theme changes to screen readers", async ({ page }) => {
    await page.goto(`${SETTINGS_PATH}?mock=1`);

    // Navigate to Appearance tab
    const appearanceTab = page.locator('[role="tab"]', { hasText: /appearance/i });
    await appearanceTab.click();

    // Check for ARIA live region
    const liveRegion = page.locator('[aria-live="polite"]');
    await expect(liveRegion).toBeAttached();

    // Change theme
    const darkThemeRadio = page.locator('[type="radio"]', { hasText: /dark/i });
    await darkThemeRadio.check();

    // Verify announcement (live region should update)
    // Note: Full screen reader testing requires actual screen reader software
    await expect(liveRegion).toBeVisible();
  });

  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto(`${SETTINGS_PATH}?mock=1`);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["best-practice"])
      .analyze();

    const headingViolations = accessibilityScanResults.violations.filter((v) =>
      v.id.includes("heading"),
    );

    expect(headingViolations).toEqual([]);
  });

  test("should have descriptive labels for form controls", async ({ page }) => {
    await page.goto(`${SETTINGS_PATH}?mock=1`);

    // Check all form inputs have associated labels
    const inputs = page.locator("input, select, textarea");
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute("id");
      const ariaLabel = await input.getAttribute("aria-label");
      const ariaLabelledby = await input.getAttribute("aria-labelledby");

      // Input must have either: associated label, aria-label, or aria-labelledby
      const hasLabel = id
        ? await page.locator(`label[for="${id}"]`).count() > 0
        : false;

      expect(
        hasLabel || ariaLabel !== null || ariaLabelledby !== null,
      ).toBeTruthy();
    }
  });
});

/**
 * ARIA Roles and Attributes Tests (TS-029)
 * WCAG 4.1.2 (Name, Role, Value - Level A)
 */
test.describe("Settings Page ARIA Implementation", () => {
  test("should have proper roles for tabs", async ({ page }) => {
    await page.goto(`${SETTINGS_PATH}?mock=1`);

    // Check tablist role
    const tablist = page.locator('[role="tablist"]');
    await expect(tablist).toBeVisible();

    // Check tab roles
    const tabs = page.locator('[role="tab"]');
    await expect(tabs).toHaveCount(4); // Dashboard, Appearance, Notifications, Integrations

    // Check tabpanel roles
    const tabpanels = page.locator('[role="tabpanel"]');
    const visiblePanels = await tabpanels.count();
    expect(visiblePanels).toBeGreaterThan(0);
  });

  test("should have proper aria-selected on tabs", async ({ page }) => {
    await page.goto(`${SETTINGS_PATH}?mock=1`);

    // First tab should be selected by default
    const firstTab = page.locator('[role="tab"]').first();
    await expect(firstTab).toHaveAttribute("aria-selected", "true");

    // Other tabs should not be selected
    const secondTab = page.locator('[role="tab"]').nth(1);
    await expect(secondTab).toHaveAttribute("aria-selected", "false");

    // Click second tab
    await secondTab.click();

    // Now second tab should be selected
    await expect(secondTab).toHaveAttribute("aria-selected", "true");
    await expect(firstTab).toHaveAttribute("aria-selected", "false");
  });

  test("should have proper roles for toggles/switches", async ({ page }) => {
    await page.goto(`${SETTINGS_PATH}?mock=1`);

    // Navigate to Dashboard tab
    const dashboardTab = page.locator('[role="tab"]', { hasText: /dashboard/i });
    await dashboardTab.click();

    // Find toggle switches
    const switches = page.locator('[role="switch"]');
    const count = await switches.count();
    expect(count).toBeGreaterThan(0);

    // Check aria-checked attribute
    const firstSwitch = switches.first();
    const ariaChecked = await firstSwitch.getAttribute("aria-checked");
    expect(ariaChecked === "true" || ariaChecked === "false").toBeTruthy();
  });

  test("should have proper ARIA attributes on modals", async ({ page }) => {
    await page.goto(`${SETTINGS_PATH}?mock=1`);

    // Trigger modal (e.g., "Reset to Defaults" confirmation)
    const resetButton = page.locator("button", { hasText: /reset/i }).first();
    if (await resetButton.isVisible()) {
      await resetButton.click();

      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
      await expect(modal).toHaveAttribute("aria-modal", "true");
      await expect(modal).toHaveAttribute("aria-labelledby"); // Modal title
    }
  });
});

/**
 * Focus Management Tests (TS-028)
 * WCAG 2.4.3 (Focus Order - Level A)
 * WCAG 3.2.1 (On Focus - Level A)
 */
test.describe("Settings Page Focus Management", () => {
  test("should trap focus within modal when open", async ({ page }) => {
    await page.goto(`${SETTINGS_PATH}?mock=1`);

    // Open modal (if reset button exists)
    const resetButton = page.locator("button", { hasText: /reset/i }).first();
    if (await resetButton.isVisible()) {
      await resetButton.click();

      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();

      // Tab through modal
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press("Tab");
        const focused = page.locator(":focus");

        // Verify focus is still within modal
        const isInsideModal = await focused.evaluate(
          (el) => {
            const modalEl = document.querySelector('[role="dialog"]');
            return modalEl?.contains(el) ?? false;
          },
        );

        expect(isInsideModal).toBe(true);
      }
    }
  });

  test("should return focus to trigger element when modal closes", async ({
    page,
  }) => {
    await page.goto(`${SETTINGS_PATH}?mock=1`);

    const resetButton = page.locator("button", { hasText: /reset/i }).first();
    if (await resetButton.isVisible()) {
      // Remember button for later comparison
      await resetButton.click();

      // Close modal with Escape
      await page.keyboard.press("Escape");

      // Focus should return to reset button
      const focused = page.locator(":focus");
      await expect(focused).toHaveText(/reset/i);
    }
  });

  test("should not trigger actions on focus alone", async ({ page }) => {
    await page.goto(`${SETTINGS_PATH}?mock=1`);

    // Focus a button (should not trigger action)
    const saveButton = page.locator("button", { hasText: /save/i }).first();
    await saveButton.focus();

    // Verify no modal or navigation occurred
    const modal = page.locator('[role="dialog"]');
    await expect(modal).not.toBeVisible();

    // Current URL should not have changed
    expect(page.url()).toContain("/settings");
  });
});

/**
 * Error Handling Accessibility Tests
 * WCAG 3.3.1 (Error Identification - Level A)
 * WCAG 3.3.3 (Error Suggestion - Level AA)
 */
test.describe("Settings Error Handling Accessibility", () => {
  test("should announce validation errors to screen readers", async ({ page }) => {
    await page.goto(`${SETTINGS_PATH}?mock=1`);

    // Navigate to Notifications tab
    const notificationsTab = page.locator('[role="tab"]', {
      hasText: /notifications/i,
    });
    await notificationsTab.click();

    // Enter invalid threshold value (if validation exists)
    const thresholdInput = page.locator('input[type="number"]').first();
    if (await thresholdInput.isVisible()) {
      await thresholdInput.fill("-1"); // Invalid negative value

      // Try to save
      const saveButton = page.locator("button", { hasText: /save/i }).first();
      await saveButton.click();

      // Check for error message with role="alert" or aria-live="assertive"
      const errorMessage = page.locator('[role="alert"], [aria-live="assertive"]');
      await expect(errorMessage).toBeVisible();

      // Check for aria-invalid on input
      await expect(thresholdInput).toHaveAttribute("aria-invalid", "true");

      // Check for aria-describedby linking to error
      const ariaDescribedby = await thresholdInput.getAttribute("aria-describedby");
      expect(ariaDescribedby).toBeTruthy();
    }
  });
});

/**
 * Target: Lighthouse Accessibility Score ≥ 95
 * (Use Lighthouse CLI for full scoring)
 */
test.describe("Lighthouse Accessibility Baseline", () => {
  test("should meet minimum Lighthouse accessibility score", async ({ page }) => {
    await page.goto(`${SETTINGS_PATH}?mock=1`);

    // Run comprehensive axe scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    // Calculate approximate score
    const violations = accessibilityScanResults.violations;
    const criticalCount = violations.filter((v) => v.impact === "critical").length;
    const seriousCount = violations.filter((v) => v.impact === "serious").length;

    // Log summary
    console.log(`\nAccessibility Summary:`);
    console.log(`  Critical violations: ${criticalCount}`);
    console.log(`  Serious violations: ${seriousCount}`);
    console.log(`  Total violations: ${violations.length}`);

    // For Lighthouse score ≥ 95, aim for:
    // - 0 critical violations
    // - ≤ 2 serious violations
    expect(criticalCount).toBe(0);
    expect(seriousCount).toBeLessThanOrEqual(2);
  });
});

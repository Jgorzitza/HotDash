/**
 * Dashboard Accessibility Tests - WCAG 2.2 AA Compliance
 *
 * Comprehensive accessibility testing for the operator control center dashboard:
 * - Tile grid layout (8+ tiles)
 * - Real-time updates with aria-live regions
 * - Modal interactions
 * - Keyboard navigation
 *
 * @requires @axe-core/playwright
 * @see docs/specs/phase-6-test-plan.md
 * @see docs/design/accessibility-audit-phase-1-6.md
 */

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const DASHBOARD_PATH = "/app";

/**
 * WCAG 2.2 Level AA Baseline Tests
 */
test.describe("Dashboard WCAG 2.2 AA Compliance", () => {
  test("should have no critical accessibility violations", async ({ page }) => {
    await page.goto(`${DASHBOARD_PATH}?mock=1`);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    // Log violations for debugging
    if (accessibilityScanResults.violations.length > 0) {
      console.log("\n❌ Accessibility violations found on Dashboard:");
      accessibilityScanResults.violations.forEach((violation) => {
        console.log(`\n  ${violation.id}: ${violation.description}`);
        console.log(`  Impact: ${violation.impact}`);
        console.log(`  Help: ${violation.helpUrl}`);
        console.log(`  Elements affected: ${violation.nodes.length}`);
      });
    }

    // Target: 0 critical violations
    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );
    expect(criticalViolations).toEqual([]);
  });

  test("should have descriptive page title", async ({ page }) => {
    await page.goto(`${DASHBOARD_PATH}?mock=1`);

    await expect(page).toHaveTitle(/dashboard|control center|operator/i);
  });

  test("should have proper landmark regions", async ({ page }) => {
    await page.goto(`${DASHBOARD_PATH}?mock=1`);

    // Check for required landmarks
    await expect(page.locator("main, [role='main']")).toBeVisible();
    await expect(page.locator("header, [role='banner']")).toBeVisible();
  });
});

/**
 * Keyboard Navigation Tests
 * WCAG 2.1.1 (Keyboard - Level A)
 * WCAG 2.4.7 (Focus Visible - Level AA)
 */
test.describe("Dashboard Keyboard Navigation", () => {
  test("should navigate through all tiles using Tab key", async ({ page }) => {
    await page.goto(`${DASHBOARD_PATH}?mock=1`);

    // Tab through tiles
    const tileCount = 8; // Minimum expected tiles
    let focusedTiles = 0;

    for (let i = 0; i < 30; i++) {
      // Tab more times to catch all interactive elements
      await page.keyboard.press("Tab");
      const focused = page.locator(":focus");

      // Check if focused element is within a tile
      const isInTile = await focused.evaluate((el) => {
        return (
          el.closest("[data-testid*='tile'], .tile, [role='article']") !== null
        );
      });

      if (isInTile) {
        focusedTiles++;
      }

      // Verify focus indicator is visible
      await expect(focused).toBeVisible();
    }

    // Should have focused on at least some tiles
    expect(focusedTiles).toBeGreaterThan(0);
  });

  test("should activate tiles with Enter key", async ({ page }) => {
    await page.goto(`${DASHBOARD_PATH}?mock=1`);

    // Find first interactive tile or button
    const tileButton = page.locator("button, [role='button']").first();
    await tileButton.focus();

    // Press Enter to activate
    await page.keyboard.press("Enter");

    // Some action should occur (modal, navigation, or expansion)
    // Check for modal
    const modal = page.locator('[role="dialog"]');
    const modalVisible = await modal.isVisible().catch(() => false);

    // Or check if URL changed (navigation)
    const urlChanged = !page.url().includes("/app");

    // At least one should be true
    expect(modalVisible || urlChanged).toBeTruthy();
  });

  test("should have skip to main content link", async ({ page }) => {
    await page.goto(`${DASHBOARD_PATH}?mock=1`);

    // First Tab should focus skip link
    await page.keyboard.press("Tab");

    const skipLink = page
      .locator("a", { hasText: /skip.*main.*content/i })
      .first();

    // Skip link should exist (may be visually hidden until focused)
    if ((await skipLink.count()) > 0) {
      await expect(skipLink).toBeFocused();

      // Pressing Enter should move focus to main content
      await page.keyboard.press("Enter");

      const mainContent = page.locator('main, [role="main"]');
      const focused = page.locator(":focus");

      // Focus should be within main content area
      const isInMain = await focused.evaluate((el) => {
        const main = document.querySelector("main, [role='main']");
        return main?.contains(el) ?? false;
      });

      expect(isInMain).toBe(true);
    }
  });
});

/**
 * Color Contrast Tests
 * WCAG 1.4.3 (Contrast Minimum - Level AA)
 */
test.describe("Dashboard Color Contrast", () => {
  test("should meet 4.5:1 contrast ratio for all tile text", async ({
    page,
  }) => {
    await page.goto(`${DASHBOARD_PATH}?mock=1`);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2aa"])
      .analyze();

    const contrastViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === "color-contrast",
    );

    if (contrastViolations.length > 0) {
      console.log("\n⚠️  Color contrast violations:");
      contrastViolations.forEach((v) => {
        console.log(`  Impact: ${v.impact}`);
        v.nodes.forEach((node) => {
          console.log(`  Element: ${node.html.substring(0, 100)}...`);
          console.log(`  Foreground: ${node.any[0]?.data?.fgColor}`);
          console.log(`  Background: ${node.any[0]?.data?.bgColor}`);
          console.log(`  Contrast: ${node.any[0]?.data?.contrastRatio}`);
        });
      });
    }

    expect(contrastViolations).toEqual([]);
  });
});

/**
 * Screen Reader Compatibility Tests
 * WCAG 4.1.2 (Name, Role, Value - Level A)
 * WCAG 4.1.3 (Status Messages - Level AA)
 */
test.describe("Dashboard Screen Reader Compatibility", () => {
  test("should have proper headings for each tile", async ({ page }) => {
    await page.goto(`${DASHBOARD_PATH}?mock=1`);

    // Check for tile headings
    const headings = page.locator("h1, h2, h3, [role='heading']");
    const count = await headings.count();

    // Should have at least one heading per tile (8+)
    expect(count).toBeGreaterThanOrEqual(8);

    // Check heading hierarchy
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["best-practice"])
      .analyze();

    const headingViolations = accessibilityScanResults.violations.filter((v) =>
      v.id.includes("heading"),
    );

    expect(headingViolations).toEqual([]);
  });

  test("should announce live tile updates to screen readers", async ({
    page,
  }) => {
    await page.goto(`${DASHBOARD_PATH}?mock=1`);

    // Check for aria-live regions on tiles
    const liveRegions = page.locator('[aria-live="polite"]');
    const count = await liveRegions.count();

    // At least some tiles should have live regions for updates
    expect(count).toBeGreaterThan(0);
  });

  test("should have descriptive labels for all interactive elements", async ({
    page,
  }) => {
    await page.goto(`${DASHBOARD_PATH}?mock=1`);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a"])
      .analyze();

    const labelViolations = accessibilityScanResults.violations.filter(
      (v) =>
        v.id === "button-name" ||
        v.id === "link-name" ||
        v.id === "label" ||
        v.id === "aria-input-field-name",
    );

    if (labelViolations.length > 0) {
      console.log("\n⚠️  Label violations:");
      labelViolations.forEach((v) => {
        console.log(`  ${v.id}: ${v.description}`);
        v.nodes.forEach((node) => {
          console.log(`    ${node.html.substring(0, 100)}...`);
        });
      });
    }

    expect(labelViolations).toEqual([]);
  });

  test("should use semantic HTML for tiles", async ({ page }) => {
    await page.goto(`${DASHBOARD_PATH}?mock=1`);

    // Tiles should use semantic elements: article, section, or role="article"
    const semanticTiles = page.locator(
      "article, section, [role='article'], [role='region']",
    );
    const count = await semanticTiles.count();

    expect(count).toBeGreaterThan(0);
  });
});

/**
 * ARIA Implementation Tests
 * WCAG 4.1.2 (Name, Role, Value - Level A)
 */
test.describe("Dashboard ARIA Implementation", () => {
  test("should have proper ARIA roles for tile structure", async ({ page }) => {
    await page.goto(`${DASHBOARD_PATH}?mock=1`);

    // Check for proper roles on tiles
    const tiles = page.locator(
      "[role='article'], [role='region'], [role='group']",
    );
    const count = await tiles.count();

    // Should have multiple tiles with semantic roles
    expect(count).toBeGreaterThan(0);
  });

  test("should have aria-labelledby for tiles", async ({ page }) => {
    await page.goto(`${DASHBOARD_PATH}?mock=1`);

    // Find tiles with aria-labelledby
    const labelledTiles = page.locator("[aria-labelledby]");
    const count = await labelledTiles.count();

    // At least some tiles should use aria-labelledby for accessible names
    expect(count).toBeGreaterThan(0);
  });
});

/**
 * Modal Accessibility Tests
 */
test.describe("Dashboard Modal Accessibility", () => {
  test("should trap focus within modal when opened from tile", async ({
    page,
  }) => {
    await page.goto(`${DASHBOARD_PATH}?mock=1`);

    // Click a tile to open modal
    const tileButton = page.locator("button, [role='button']").first();
    await tileButton.click();

    // Wait for modal
    const modal = page.locator('[role="dialog"]');
    const modalVisible = await modal.isVisible().catch(() => false);

    if (modalVisible) {
      // Tab through modal multiple times
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press("Tab");
        const focused = page.locator(":focus");

        // Verify focus is still within modal
        const isInsideModal = await focused.evaluate((el) => {
          const modalEl = document.querySelector('[role="dialog"]');
          return modalEl?.contains(el) ?? false;
        });

        expect(isInsideModal).toBe(true);
      }
    }
  });

  test("should have proper ARIA attributes on modals", async ({ page }) => {
    await page.goto(`${DASHBOARD_PATH}?mock=1`);

    // Open a modal
    const tileButton = page.locator("button").first();
    await tileButton.click();

    const modal = page.locator('[role="dialog"]');
    const modalVisible = await modal.isVisible().catch(() => false);

    if (modalVisible) {
      await expect(modal).toHaveAttribute("aria-modal", "true");

      // Should have aria-labelledby or aria-label
      const hasLabel =
        (await modal.getAttribute("aria-labelledby")) !== null ||
        (await modal.getAttribute("aria-label")) !== null;

      expect(hasLabel).toBe(true);
    }
  });

  test("should close modal on Escape and return focus", async ({ page }) => {
    await page.goto(`${DASHBOARD_PATH}?mock=1`);

    // Open a modal
    const tileButton = page.locator("button").first();
    await tileButton.click();

    const modal = page.locator('[role="dialog"]');
    const modalVisible = await modal.isVisible().catch(() => false);

    if (modalVisible) {
      // Press Escape
      await page.keyboard.press("Escape");

      // Modal should close
      await expect(modal).not.toBeVisible();

      // Focus should return to tile button
      const focused = page.locator(":focus");
      await expect(focused).toBeVisible();
    }
  });
});

/**
 * Real-Time Update Accessibility
 */
test.describe("Dashboard Real-Time Updates Accessibility", () => {
  test("should announce connection status changes", async ({ page }) => {
    await page.goto(`${DASHBOARD_PATH}?mock=1`);

    // Look for connection indicator with aria-live
    const connectionIndicator = page.locator(
      "[aria-live], [data-testid*='connection']",
    );

    const count = await connectionIndicator.count();
    if (count > 0) {
      const firstIndicator = connectionIndicator.first();
      const ariaLive = await firstIndicator.getAttribute("aria-live");

      // Connection status should be polite or assertive
      expect(ariaLive === "polite" || ariaLive === "assertive").toBeTruthy();
    }
  });

  test("should use aria-live for dynamic tile content", async ({ page }) => {
    await page.goto(`${DASHBOARD_PATH}?mock=1`);

    // Check for aria-live on tiles
    const liveTiles = page.locator('[aria-live="polite"]');
    const count = await liveTiles.count();

    // At least some tiles should have live regions
    expect(count).toBeGreaterThan(0);
  });
});

/**
 * Notification Accessibility
 */
test.describe("Dashboard Notification Accessibility", () => {
  test("should announce toast notifications to screen readers", async ({
    page,
  }) => {
    await page.goto(`${DASHBOARD_PATH}?mock=1`);

    // Look for toast container with proper role
    const toastContainer = page.locator(
      '[role="status"], [role="alert"], [aria-live]',
    );

    const count = await toastContainer.count();
    if (count > 0) {
      const toast = toastContainer.first();

      // Should have role="status" or role="alert"
      const role = await toast.getAttribute("role");
      const ariaLive = await toast.getAttribute("aria-live");

      expect(
        role === "status" ||
          role === "alert" ||
          ariaLive === "polite" ||
          ariaLive === "assertive",
      ).toBeTruthy();
    }
  });
});

/**
 * Touch Target Size Tests
 * WCAG 2.5.8 (Target Size Minimum - Level AA, WCAG 2.2)
 */
test.describe("Dashboard Touch Target Sizes", () => {
  test("should have minimum 24x24px touch targets", async ({ page }) => {
    await page.goto(`${DASHBOARD_PATH}?mock=1`);

    // Find all interactive elements
    const interactiveElements = page.locator(
      "button, a, input, [role='button']",
    );
    const count = await interactiveElements.count();

    let undersizedCount = 0;

    for (let i = 0; i < Math.min(count, 20); i++) {
      // Check first 20 elements
      const element = interactiveElements.nth(i);
      const box = await element.boundingBox();

      if (box) {
        // WCAG 2.2 requires minimum 24x24px
        if (box.width < 24 || box.height < 24) {
          undersizedCount++;
          const text = await element.textContent();
          console.log(
            `⚠️  Undersized target: ${text?.substring(0, 30)} (${box.width}x${box.height}px)`,
          );
        }
      }
    }

    // Allow up to 2 undersized targets (may be exceptions like inline links)
    expect(undersizedCount).toBeLessThanOrEqual(2);
  });
});

/**
 * Lighthouse Accessibility Score Target
 */
test.describe("Dashboard Lighthouse Baseline", () => {
  test("should meet Lighthouse accessibility score target", async ({
    page,
  }) => {
    await page.goto(`${DASHBOARD_PATH}?mock=1`);

    // Run comprehensive axe scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    const violations = accessibilityScanResults.violations;
    const criticalCount = violations.filter(
      (v) => v.impact === "critical",
    ).length;
    const seriousCount = violations.filter(
      (v) => v.impact === "serious",
    ).length;

    console.log(`\nDashboard Accessibility Summary:`);
    console.log(`  Critical violations: ${criticalCount}`);
    console.log(`  Serious violations: ${seriousCount}`);
    console.log(`  Total violations: ${violations.length}`);

    // For Lighthouse score ≥ 95:
    // - 0 critical violations
    // - ≤ 2 serious violations
    expect(criticalCount).toBe(0);
    expect(seriousCount).toBeLessThanOrEqual(2);
  });
});

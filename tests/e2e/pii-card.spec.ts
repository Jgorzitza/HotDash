/**
 * E2E Tests: PII Card UI & Workflows
 *
 * Tests the operator-facing PII Card in the approval workflow.
 * Uses Playwright for browser automation.
 *
 * Test Strategy: docs/testing/agent-sdk/test-strategy.md
 *
 * @requires PII Card UI implemented
 * @requires Database seeded with test data
 * @requires Approval system integration
 */

import { test, expect } from "@playwright/test";

/**
 * Test Data Setup
 * TODO: Import from fixtures once implemented
 */

const mockApprovalData = {
  id: "test-approval-001",
  kind: "cx_escalation",
  state: "pending_review",
  summary: "Customer needs size chart for snowboard",
  created_by: "ai-customer",
  evidence: {
    what_changes: "Add size chart to product page",
    why_now: "Customer specifically requested sizing information",
    impact_forecast: "Reduced support tickets and improved conversion"
  },
  impact: {
    expected_outcome: "Customer can self-serve sizing information",
    metrics_affected: ["support_tickets", "conversion_rate"],
    user_experience: "Improved product discovery",
    business_value: "Reduced support load, increased sales"
  },
  risk: {
    what_could_go_wrong: "Size chart might be inaccurate",
    recovery_time: "2-4 hours to correct"
  },
  rollback: {
    steps: [
      "Remove size chart from product page",
      "Revert to previous product description",
      "Notify customer of correction"
    ],
    artifact_location: "Product page metafields"
  },
  actions: [{
    endpoint: "/api/approvals/test-approval-001/approve",
    payload: { taskId: "test-approval-001" }
  }],
  created_at: "2025-10-22T10:00:00Z",
  updated_at: "2025-10-22T10:00:00Z"
};

const mockCustomerPII = {
  orderId: "#1234567890",
  orderStatus: "fulfilled",
  fulfillmentStatus: "shipped",
  email: "justin@hotrodan.com",
  phone: "555-123-4567",
  shippingAddress: {
    name: "Justin Case",
    address1: "123 Main St",
    address2: "Apt 4B",
    city: "Los Angeles",
    province: "CA",
    country: "USA",
    zip: "90210",
  },
  tracking: {
    carrier: "UPS",
    number: "1Z999AA10123456784",
    url: "https://www.ups.com/track?number=1Z999AA10123456784",
    lastEvent: "Delivered",
    lastEventDate: "2025-10-20T14:30:00Z",
  },
  lineItems: [
    {
      title: "Powder Board",
      sku: "PB-001",
      quantity: 1,
      price: "$299.99",
    },
    {
      title: "Wax Kit",
      sku: "WK-100",
      quantity: 2,
      price: "$19.99",
    },
  ],
};

/**
 * Test Suite
 */

test.describe("PII Card E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to approvals page
    await page.goto("/approvals");
    
    // Wait for page to load
    await page.waitForLoadState("networkidle");
  });

  test.describe("PII Card Display", () => {
    test("should display PII Card with full customer data", async ({ page }) => {
      // Mock the approval data with PII
      await page.route("**/api/approvals/**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            approvals: [mockApprovalData],
            total: 1,
            counts: { pending_review: 1 }
          })
        });
      });

      // Mock the PII data endpoint
      await page.route("**/api/customer-pii/**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockCustomerPII)
        });
      });

      // Click on an approval to open details
      await page.click('[data-testid="approval-card-test-approval-001"]');
      
      // Wait for PII Card to load
      await page.waitForSelector('[data-testid="pii-card"]', { timeout: 5000 });

      // Verify PII Card displays full customer data
      await expect(page.locator('[data-testid="pii-card"]')).toBeVisible();
      await expect(page.locator('text=justin@hotrodan.com')).toBeVisible();
      await expect(page.locator('text=555-123-4567')).toBeVisible();
      await expect(page.locator('text=123 Main St')).toBeVisible();
      await expect(page.locator('text=1Z999AA10123456784')).toBeVisible();
    });

    test("should display operator-only warning banner", async ({ page }) => {
      await page.route("**/api/approvals/**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            approvals: [mockApprovalData],
            total: 1,
            counts: { pending_review: 1 }
          })
        });
      });

      await page.route("**/api/customer-pii/**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockCustomerPII)
        });
      });

      await page.click('[data-testid="approval-card-test-approval-001"]');
      await page.waitForSelector('[data-testid="pii-card"]');

      // Verify warning banner is displayed
      await expect(page.locator('[role="alert"]')).toBeVisible();
      await expect(page.locator('text=OPERATOR ONLY')).toBeVisible();
      await expect(page.locator('text=NOT SENT TO CUSTOMER')).toBeVisible();
    });

    test("should display order details section", async ({ page }) => {
      await page.route("**/api/approvals/**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            approvals: [mockApprovalData],
            total: 1,
            counts: { pending_review: 1 }
          })
        });
      });

      await page.route("**/api/customer-pii/**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockCustomerPII)
        });
      });

      await page.click('[data-testid="approval-card-test-approval-001"]');
      await page.waitForSelector('[data-testid="pii-card"]');

      // Verify order details
      await expect(page.locator('text=#1234567890')).toBeVisible();
      await expect(page.locator('text=fulfilled')).toBeVisible();
      await expect(page.locator('text=shipped')).toBeVisible();
    });

    test("should display customer contact section", async ({ page }) => {
      await page.route("**/api/approvals/**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            approvals: [mockApprovalData],
            total: 1,
            counts: { pending_review: 1 }
          })
        });
      });

      await page.route("**/api/customer-pii/**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockCustomerPII)
        });
      });

      await page.click('[data-testid="approval-card-test-approval-001"]');
      await page.waitForSelector('[data-testid="pii-card"]');

      // Verify customer contact info
      await expect(page.locator('text=justin@hotrodan.com')).toBeVisible();
      await expect(page.locator('text=555-123-4567')).toBeVisible();
    });

    test("should display shipping address section", async ({ page }) => {
      await page.route("**/api/approvals/**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            approvals: [mockApprovalData],
            total: 1,
            counts: { pending_review: 1 }
          })
        });
      });

      await page.route("**/api/customer-pii/**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockCustomerPII)
        });
      });

      await page.click('[data-testid="approval-card-test-approval-001"]');
      await page.waitForSelector('[data-testid="pii-card"]');

      // Verify shipping address
      await expect(page.locator('text=Justin Case')).toBeVisible();
      await expect(page.locator('text=123 Main St')).toBeVisible();
      await expect(page.locator('text=Apt 4B')).toBeVisible();
      await expect(page.locator('text=Los Angeles, CA 90210')).toBeVisible();
      await expect(page.locator('text=USA')).toBeVisible();
    });

    test("should display tracking information", async ({ page }) => {
      await page.route("**/api/approvals/**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            approvals: [mockApprovalData],
            total: 1,
            counts: { pending_review: 1 }
          })
        });
      });

      await page.route("**/api/customer-pii/**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockCustomerPII)
        });
      });

      await page.click('[data-testid="approval-card-test-approval-001"]');
      await page.waitForSelector('[data-testid="pii-card"]');

      // Verify tracking info
      await expect(page.locator('text=UPS')).toBeVisible();
      await expect(page.locator('text=1Z999AA10123456784')).toBeVisible();
      await expect(page.locator('text=Delivered')).toBeVisible();
      await expect(page.locator('text=Track Package ↗')).toBeVisible();
    });

    test("should display line items table", async ({ page }) => {
      await page.route("**/api/approvals/**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            approvals: [mockApprovalData],
            total: 1,
            counts: { pending_review: 1 }
          })
        });
      });

      await page.route("**/api/customer-pii/**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockCustomerPII)
        });
      });

      await page.click('[data-testid="approval-card-test-approval-001"]');
      await page.waitForSelector('[data-testid="pii-card"]');

      // Verify line items
      await expect(page.locator('text=Powder Board')).toBeVisible();
      await expect(page.locator('text=PB-001')).toBeVisible();
      await expect(page.locator('text=$299.99')).toBeVisible();
      await expect(page.locator('text=Wax Kit')).toBeVisible();
      await expect(page.locator('text=WK-100')).toBeVisible();
      await expect(page.locator('text=$19.99')).toBeVisible();
    });
  });

  test.describe("Copy Functionality", () => {
    test("should copy email to clipboard", async ({ page }) => {
      await page.route("**/api/approvals/**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            approvals: [mockApprovalData],
            total: 1,
            counts: { pending_review: 1 }
          })
        });
      });

      await page.route("**/api/customer-pii/**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockCustomerPII)
        });
      });

      await page.click('[data-testid="approval-card-test-approval-001"]');
      await page.waitForSelector('[data-testid="pii-card"]');

      // Click copy email button
      await page.click('[aria-label="Copy email"]');
      
      // Verify clipboard content (this would need to be implemented in the test environment)
      // Note: Clipboard API testing in Playwright requires special setup
    });

    test("should copy address to clipboard", async ({ page }) => {
      await page.route("**/api/approvals/**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            approvals: [mockApprovalData],
            total: 1,
            counts: { pending_review: 1 }
          })
        });
      });

      await page.route("**/api/customer-pii/**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockCustomerPII)
        });
      });

      await page.click('[data-testid="approval-card-test-approval-001"]');
      await page.waitForSelector('[data-testid="pii-card"]');

      // Click copy address button
      await page.click('[aria-label="Copy address"]');
    });

    test("should copy tracking number to clipboard", async ({ page }) => {
      await page.route("**/api/approvals/**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            approvals: [mockApprovalData],
            total: 1,
            counts: { pending_review: 1 }
          })
        });
      });

      await page.route("**/api/customer-pii/**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockCustomerPII)
        });
      });

      await page.click('[data-testid="approval-card-test-approval-001"]');
      await page.waitForSelector('[data-testid="pii-card"]');

      // Click copy tracking button
      await page.click('[aria-label="Copy tracking number"]');
    });
  });

  test.describe("Accessibility", () => {
    test("should be keyboard navigable", async ({ page }) => {
      await page.route("**/api/approvals/**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            approvals: [mockApprovalData],
            total: 1,
            counts: { pending_review: 1 }
          })
        });
      });

      await page.route("**/api/customer-pii/**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockCustomerPII)
        });
      });

      await page.click('[data-testid="approval-card-test-approval-001"]');
      await page.waitForSelector('[data-testid="pii-card"]');

      // Test keyboard navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Verify focus is on a copy button
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBe('BUTTON');
    });

    test("should have proper ARIA labels", async ({ page }) => {
      await page.route("**/api/approvals/**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            approvals: [mockApprovalData],
            total: 1,
            counts: { pending_review: 1 }
          })
        });
      });

      await page.route("**/api/customer-pii/**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockCustomerPII)
        });
      });

      await page.click('[data-testid="approval-card-test-approval-001"]');
      await page.waitForSelector('[data-testid="pii-card"]');

      // Verify ARIA labels
      await expect(page.locator('[aria-label="Customer PII - Operator Only"]')).toBeVisible();
      await expect(page.locator('[role="alert"]')).toBeVisible();
      await expect(page.locator('[aria-label="Copy email"]')).toBeVisible();
      await expect(page.locator('[aria-label="Copy address"]')).toBeVisible();
      await expect(page.locator('[aria-label="Copy tracking number"]')).toBeVisible();
    });
  });

  test.describe("Error Handling", () => {
    test("should handle missing PII data gracefully", async ({ page }) => {
      await page.route("**/api/approvals/**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            approvals: [mockApprovalData],
            total: 1,
            counts: { pending_review: 1 }
          })
        });
      });

      // Mock API error for PII data
      await page.route("**/api/customer-pii/**", async (route) => {
        await route.fulfill({
          status: 404,
          contentType: "application/json",
          body: JSON.stringify({ error: "Customer PII not found" })
        });
      });

      await page.click('[data-testid="approval-card-test-approval-001"]');
      
      // Should show error message
      await expect(page.locator('text=Customer PII not found')).toBeVisible();
    });

    test("should handle network errors gracefully", async ({ page }) => {
      await page.route("**/api/approvals/**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            approvals: [mockApprovalData],
            total: 1,
            counts: { pending_review: 1 }
          })
        });
      });

      // Mock network error
      await page.route("**/api/customer-pii/**", async (route) => {
        await route.abort();
      });

      await page.click('[data-testid="approval-card-test-approval-001"]');
      
      // Should show error state
      await expect(page.locator('text=Failed to load customer data')).toBeVisible();
    });
  });
});

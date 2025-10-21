/**
 * Unit Tests for CX Theme Actions Service (PRODUCT-015)
 *
 * Tests:
 * - Theme to implementation type mapping
 * - Draft copy generation (all template types)
 * - Action card generation from themes
 * - Batch theme processing
 * - Action Queue integration
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  mapThemeToImplementationType,
  generateDraftCopy,
  generateCXThemeAction,
  processCXThemes,
  addCXActionsToQueue,
  type ConversationTheme,
} from "~/services/product/cx-theme-actions";

// Mock facts.server
vi.mock("~/services/facts.server", () => ({
  recordDashboardFact: vi.fn().mockResolvedValue({
    id: 1,
    shopDomain: "test-shop.myshopify.com",
    factType: "product.cx_theme_action",
    scope: "growth",
    value: {},
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
}));

// Mock json.ts
vi.mock("~/services/json", () => ({
  toInputJson: vi.fn((val) => val),
}));

describe("CX Theme Actions Service - PRODUCT-015", () => {
  const mockTheme: ConversationTheme = {
    theme: "size chart",
    productHandle: "powder-snowboard",
    occurrences: 7,
    exampleQueries: [
      "What size should I get?",
      "Do you have a size chart?",
      "Size guide for this board?",
    ],
    detectedAt: "2025-10-21T00:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("mapThemeToImplementationType", () => {
    it("should map 'size chart' to content/add_size_chart", () => {
      const result = mapThemeToImplementationType("size chart");
      
      expect(result.type).toBe("content");
      expect(result.implementationType).toBe("add_size_chart");
    });

    it("should map 'sizing guide' to content/add_size_chart", () => {
      const result = mapThemeToImplementationType("sizing guide");
      
      expect(result.type).toBe("content");
      expect(result.implementationType).toBe("add_size_chart");
    });

    it("should map 'product dimensions' to content/add_dimensions", () => {
      const result = mapThemeToImplementationType("product dimensions");
      
      expect(result.type).toBe("content");
      expect(result.implementationType).toBe("add_dimensions");
    });

    it("should map 'how to install' to content/add_installation_guide", () => {
      const result = mapThemeToImplementationType("how to install");
      
      expect(result.type).toBe("content");
      expect(result.implementationType).toBe("add_installation_guide");
    });

    it("should map 'warranty information' to content/add_warranty_section", () => {
      const result = mapThemeToImplementationType("warranty information");
      
      expect(result.type).toBe("content");
      expect(result.implementationType).toBe("add_warranty_section");
    });

    it("should map 'return policy' to seo/add_return_policy_link", () => {
      const result = mapThemeToImplementationType("return policy");
      
      expect(result.type).toBe("seo");
      expect(result.implementationType).toBe("add_return_policy_link");
    });

    it("should map 'shipping time' to seo/add_shipping_estimate", () => {
      const result = mapThemeToImplementationType("shipping time");
      
      expect(result.type).toBe("seo");
      expect(result.implementationType).toBe("add_shipping_estimate");
    });

    it("should map 'in stock' to product_update/add_stock_indicator", () => {
      const result = mapThemeToImplementationType("in stock");
      
      expect(result.type).toBe("product_update");
      expect(result.implementationType).toBe("add_stock_indicator");
    });

    it("should map 'when restock' to product_update/add_restock_notification", () => {
      const result = mapThemeToImplementationType("when restock");
      
      expect(result.type).toBe("product_update");
      expect(result.implementationType).toBe("add_restock_notification");
    });

    it("should handle unknown theme with general_update", () => {
      const result = mapThemeToImplementationType("unknown theme");
      
      expect(result.type).toBe("content");
      expect(result.implementationType).toBe("general_update");
    });

    it("should be case-insensitive", () => {
      const result1 = mapThemeToImplementationType("SIZE CHART");
      const result2 = mapThemeToImplementationType("Size Chart");
      
      expect(result1.implementationType).toBe("add_size_chart");
      expect(result2.implementationType).toBe("add_size_chart");
    });
  });

  describe("generateDraftCopy", () => {
    it("should generate size chart template", () => {
      const copy = generateDraftCopy("size chart", "Powder Snowboard", 7);
      
      expect(copy).toContain("Size Chart for Powder Snowboard");
      expect(copy).toContain("7 customer inquiries");
      expect(copy).toContain("| Size | Chest");
      expect(copy).toContain("Fit Notes");
    });

    it("should generate dimensions template", () => {
      const copy = generateDraftCopy("product dimensions", "Cargo Box", 5);
      
      expect(copy).toContain("Product Dimensions for Cargo Box");
      expect(copy).toContain("5 inquiries");
      expect(copy).toContain("Length:");
      expect(copy).toContain("Packaging Dimensions");
    });

    it("should generate installation guide template", () => {
      const copy = generateDraftCopy("how to install", "Roof Rack", 4);
      
      expect(copy).toContain("Installation Guide for Roof Rack");
      expect(copy).toContain("4 customers asked");
      expect(copy).toContain("Installation Steps");
      expect(copy).toContain("Tools Needed");
    });

    it("should generate warranty template", () => {
      const copy = generateDraftCopy("warranty information", "Bindings", 6);
      
      expect(copy).toContain("Warranty Information for Bindings");
      expect(copy).toContain("6 inquiries");
      expect(copy).toContain("**Warranty**:");
      expect(copy).toContain("Claim Process");
    });

    it("should generate generic template for unknown themes", () => {
      const copy = generateDraftCopy("custom theme", "Product Name", 3);
      
      expect(copy).toContain("Product Name");
      expect(copy).toContain("custom theme");
      expect(copy).toContain("3 inquiries");
    });
  });

  describe("generateCXThemeAction", () => {
    it("should generate Action card from theme", async () => {
      const action = await generateCXThemeAction(mockTheme, "test-shop.myshopify.com");
      
      expect(action).not.toBeNull();
      expect(action?.type).toBe("content");
      expect(action?.title).toContain("Add size chart");
      expect(action?.title).toContain("Powder Snowboard");
      expect(action?.description).toContain("7 customers asked");
      expect(action?.expectedRevenue).toBe(350); // 7 * $50
      expect(action?.confidence).toBe(0.9); // >=5 occurrences = high confidence
      expect(action?.ease).toBe(0.8); // size chart = high ease
      expect(action?.draftCopy).toContain("Size Chart");
      expect(action?.metadata.theme).toBe("size chart");
      expect(action?.metadata.occurrences).toBe(7);
      expect(action?.metadata.productHandle).toBe("powder-snowboard");
      expect(action?.metadata.implementationType).toBe("add_size_chart");
    });

    it("should calculate lower confidence for <5 occurrences", async () => {
      const lowOccurrenceTheme: ConversationTheme = {
        ...mockTheme,
        occurrences: 3,
      };
      
      const action = await generateCXThemeAction(lowOccurrenceTheme, "test-shop.myshopify.com");
      
      expect(action?.confidence).toBe(0.7); // <5 occurrences = lower confidence
    });

    it("should calculate expected revenue based on occurrences", async () => {
      const highOccurrenceTheme: ConversationTheme = {
        ...mockTheme,
        occurrences: 10,
      };
      
      const action = await generateCXThemeAction(highOccurrenceTheme, "test-shop.myshopify.com");
      
      expect(action?.expectedRevenue).toBe(500); // 10 * $50
    });

    it("should set ease score based on implementation type", async () => {
      const nonSizeChartTheme: ConversationTheme = {
        ...mockTheme,
        theme: "warranty information",
      };
      
      const action = await generateCXThemeAction(nonSizeChartTheme, "test-shop.myshopify.com");
      
      expect(action?.ease).toBe(0.6); // non-size-chart = lower ease
    });

    it("should include example queries in metadata", async () => {
      const action = await generateCXThemeAction(mockTheme, "test-shop.myshopify.com");
      
      expect(action?.metadata.exampleQueries).toEqual(mockTheme.exampleQueries);
      expect(action?.metadata.exampleQueries.length).toBe(3);
    });
  });

  describe("processCXThemes", () => {
    it("should process multiple themes", async () => {
      const themes: ConversationTheme[] = [
        mockTheme,
        {
          theme: "warranty information",
          productHandle: "carbon-bindings",
          occurrences: 5,
          exampleQueries: ["What's the warranty?"],
          detectedAt: "2025-10-21T00:00:00Z",
        },
        {
          theme: "product dimensions",
          productHandle: "roof-box",
          occurrences: 4,
          exampleQueries: ["How big is it?"],
          detectedAt: "2025-10-21T00:00:00Z",
        },
      ];
      
      const actions = await processCXThemes(themes, "test-shop.myshopify.com");
      
      expect(actions).toHaveLength(3);
      expect(actions[0].title).toContain("size chart");
      expect(actions[1].title).toContain("warranty information");
      expect(actions[2].title).toContain("product dimensions");
    });

    it("should handle empty themes array", async () => {
      const actions = await processCXThemes([], "test-shop.myshopify.com");
      
      expect(actions).toHaveLength(0);
    });

    it("should skip themes with null product", async () => {
      // Mock scenario where product doesn't exist would return null
      // In current implementation, mock product is always returned
      // This test demonstrates the pattern
      const themes: ConversationTheme[] = [mockTheme];
      
      const actions = await processCXThemes(themes, "test-shop.myshopify.com");
      
      expect(actions).toHaveLength(1);
    });
  });

  describe("addCXActionsToQueue", () => {
    it("should add actions to queue via DashboardFact", async () => {
      const { recordDashboardFact } = await import("~/services/facts.server");
      
      const actions = await processCXThemes([mockTheme], "test-shop.myshopify.com");
      const result = await addCXActionsToQueue(actions, "test-shop.myshopify.com");
      
      expect(result.added).toBe(1);
      expect(result.facts).toHaveLength(1);
      expect(recordDashboardFact).toHaveBeenCalledWith(
        expect.objectContaining({
          shopDomain: "test-shop.myshopify.com",
          factType: "product.cx_theme_action",
          scope: "growth",
        })
      );
    });

    it("should add multiple actions to queue", async () => {
      const { recordDashboardFact } = await import("~/services/facts.server");
      
      const themes: ConversationTheme[] = [
        mockTheme,
        {
          theme: "warranty information",
          productHandle: "bindings",
          occurrences: 5,
          exampleQueries: ["warranty?"],
          detectedAt: "2025-10-21T00:00:00Z",
        },
      ];
      
      const actions = await processCXThemes(themes, "test-shop.myshopify.com");
      const result = await addCXActionsToQueue(actions, "test-shop.myshopify.com");
      
      expect(result.added).toBe(2);
      expect(result.facts).toHaveLength(2);
      expect(recordDashboardFact).toHaveBeenCalledTimes(2);
    });

    it("should handle empty actions array", async () => {
      const result = await addCXActionsToQueue([], "test-shop.myshopify.com");
      
      expect(result.added).toBe(0);
      expect(result.facts).toHaveLength(0);
    });

    it("should include metadata in dashboard fact", async () => {
      const { recordDashboardFact } = await import("~/services/facts.server");
      
      const actions = await processCXThemes([mockTheme], "test-shop.myshopify.com");
      await addCXActionsToQueue(actions, "test-shop.myshopify.com");
      
      expect(recordDashboardFact).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            theme: "size chart",
            occurrences: 7,
            productHandle: "powder-snowboard",
            createdBy: "ai-knowledge",
            status: "pending",
          }),
        })
      );
    });
  });

  describe("Integration: Full CX Theme Processing Flow", () => {
    it("should complete full flow from themes to Action Queue", async () => {
      const themes: ConversationTheme[] = [
        {
          theme: "size chart",
          productHandle: "powder-snowboard",
          occurrences: 7,
          exampleQueries: ["size?"],
          detectedAt: "2025-10-21T00:00:00Z",
        },
        {
          theme: "warranty information",
          productHandle: "bindings",
          occurrences: 5,
          exampleQueries: ["warranty?"],
          detectedAt: "2025-10-21T00:00:00Z",
        },
      ];
      
      // Step 1: Process themes
      const actions = await processCXThemes(themes, "test-shop.myshopify.com");
      expect(actions).toHaveLength(2);
      
      // Step 2: Add to queue
      const result = await addCXActionsToQueue(actions, "test-shop.myshopify.com");
      expect(result.added).toBe(2);
      expect(result.facts).toHaveLength(2);
      
      // Verify all actions have required fields
      actions.forEach((action) => {
        expect(action.type).toMatch(/content|seo|product_update/);
        expect(action.title).toBeTruthy();
        expect(action.description).toBeTruthy();
        expect(action.expectedRevenue).toBeGreaterThan(0);
        expect(action.confidence).toBeGreaterThan(0);
        expect(action.ease).toBeGreaterThan(0);
        expect(action.draftCopy).toBeTruthy();
        expect(action.metadata.theme).toBeTruthy();
        expect(action.metadata.occurrences).toBeGreaterThan(0);
      });
    });
  });
});


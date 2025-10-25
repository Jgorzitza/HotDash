/**
 * Unit Tests: CX Action Applier Service
 *
 * Tests integration between Product agent's CX theme actions
 * and Content agent's implementation service
 */

import { describe, it, expect, vi } from "vitest";
import {
  mapImplementationTypeToContentType,
  applyCXThemeAction,
} from "~/services/content/cx-action-applier";
import type { CXThemeAction } from "~/services/product/cx-theme-actions";

// Mock dependencies
vi.mock("~/services/content/cx-content-implementation", () => ({
  applyCXContent: vi.fn(),
}));

describe("CX Action Applier Service", () => {
  describe("mapImplementationTypeToContentType", () => {
    it("should map add_size_chart to size_chart", () => {
      const result = mapImplementationTypeToContentType("add_size_chart");
      expect(result).toBe("size_chart");
    });

    it("should map add_dimensions to dimensions", () => {
      const result = mapImplementationTypeToContentType("add_dimensions");
      expect(result).toBe("dimensions");
    });

    it("should map add_installation_guide to installation_guide", () => {
      const result = mapImplementationTypeToContentType(
        "add_installation_guide",
      );
      expect(result).toBe("installation_guide");
    });

    it("should map add_warranty_section to warranty", () => {
      const result = mapImplementationTypeToContentType("add_warranty_section");
      expect(result).toBe("warranty");
    });

    it("should return null for unknown implementation type", () => {
      const result = mapImplementationTypeToContentType("unknown_type");
      expect(result).toBeNull();
    });

    it("should return null for SEO implementation types", () => {
      const result = mapImplementationTypeToContentType(
        "add_return_policy_link",
      );
      expect(result).toBeNull();
    });
  });

  describe("applyCXThemeAction", () => {
    it("should apply content-type action successfully", async () => {
      const { applyCXContent } = await import(
        "~/services/content/cx-content-implementation"
      );

      (applyCXContent as any).mockResolvedValue({
        success: true,
        productId: "gid://shopify/Product/123",
        contentType: "size_chart",
        metafieldId: "gid://shopify/Metafield/456",
      });

      const mockAction: CXThemeAction = {
        type: "content",
        title: "Add size chart to Powder Boards",
        description: "7 customers asked about sizing",
        expectedRevenue: 350,
        confidence: 0.9,
        ease: 0.8,
        evidenceUrl: "/api/cx-themes/size%20chart",
        affectedEntities: ["powder-boards"],
        draftCopy: "**Size Chart**\n\n| Size | Measurements |\n...",
        metadata: {
          theme: "size chart",
          occurrences: 7,
          productHandle: "powder-boards",
          exampleQueries: ["What size should I get?"],
          implementationType: "add_size_chart",
        },
      };

      const mockRequest = new Request("http://localhost");

      const result = await applyCXThemeAction(
        mockAction,
        "gid://shopify/Product/123",
        mockRequest,
      );

      expect(result.success).toBe(true);
      expect(result.productId).toBe("gid://shopify/Product/123");
      expect(result.contentType).toBe("size_chart");
      expect(result.appliedAt).toBeDefined();
      expect(applyCXContent).toHaveBeenCalledWith(
        {
          productId: "gid://shopify/Product/123",
          contentType: "size_chart",
          content: "**Size Chart**\n\n| Size | Measurements |\n...",
          productHandle: "powder-boards",
        },
        mockRequest,
      );
    });

    it("should reject non-content action types", async () => {
      const mockAction: CXThemeAction = {
        type: "seo", // Not content type
        title: "Add return policy link",
        description: "5 customers asked about returns",
        expectedRevenue: 250,
        confidence: 0.8,
        ease: 0.7,
        evidenceUrl: "/api/cx-themes/return%20policy",
        affectedEntities: ["powder-boards"],
        draftCopy: "Return policy content",
        metadata: {
          theme: "return policy",
          occurrences: 5,
          productHandle: "powder-boards",
          exampleQueries: ["What's your return policy?"],
          implementationType: "add_return_policy_link",
        },
      };

      const mockRequest = new Request("http://localhost");

      const result = await applyCXThemeAction(
        mockAction,
        "gid://shopify/Product/123",
        mockRequest,
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("not handled by Content agent");
    });

    it("should handle missing draft copy", async () => {
      const mockAction: CXThemeAction = {
        type: "content",
        title: "Add dimensions",
        description: "3 customers asked about size",
        expectedRevenue: 150,
        confidence: 0.7,
        ease: 0.6,
        evidenceUrl: "/api/cx-themes/dimensions",
        affectedEntities: ["powder-boards"],
        // No draftCopy provided
        metadata: {
          theme: "product dimensions",
          occurrences: 3,
          productHandle: "powder-boards",
          exampleQueries: ["How big is this?"],
          implementationType: "add_dimensions",
        },
      };

      const mockRequest = new Request("http://localhost");

      const result = await applyCXThemeAction(
        mockAction,
        "gid://shopify/Product/123",
        mockRequest,
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Action has no draft copy to apply");
    });

    it("should handle unknown implementation types", async () => {
      const mockAction: CXThemeAction = {
        type: "content",
        title: "Unknown action",
        description: "Test",
        expectedRevenue: 100,
        confidence: 0.5,
        ease: 0.5,
        evidenceUrl: "/api/cx-themes/unknown",
        affectedEntities: ["test-product"],
        draftCopy: "Test content",
        metadata: {
          theme: "unknown",
          occurrences: 1,
          productHandle: "test-product",
          exampleQueries: ["Test?"],
          implementationType: "unknown_type",
        },
      };

      const mockRequest = new Request("http://localhost");

      const result = await applyCXThemeAction(
        mockAction,
        "gid://shopify/Product/123",
        mockRequest,
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("Unsupported implementation type");
    });

    it("should handle applyCXContent failures", async () => {
      const { applyCXContent } = await import(
        "~/services/content/cx-content-implementation"
      );

      (applyCXContent as any).mockResolvedValue({
        success: false,
        productId: "gid://shopify/Product/123",
        contentType: "size_chart",
        error: "Shopify API error",
      });

      const mockAction: CXThemeAction = {
        type: "content",
        title: "Add size chart",
        description: "Test",
        expectedRevenue: 100,
        confidence: 0.9,
        ease: 0.8,
        evidenceUrl: "/api/cx-themes/size-chart",
        affectedEntities: ["test-product"],
        draftCopy: "Size chart content",
        metadata: {
          theme: "size chart",
          occurrences: 5,
          productHandle: "test-product",
          exampleQueries: ["What size?"],
          implementationType: "add_size_chart",
        },
      };

      const mockRequest = new Request("http://localhost");

      const result = await applyCXThemeAction(
        mockAction,
        "gid://shopify/Product/123",
        mockRequest,
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Shopify API error");
    });
  });
});

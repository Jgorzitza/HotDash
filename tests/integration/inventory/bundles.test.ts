/**
 * Integration Tests: Bundles (INVENTORY-008)
 *
 * Tests bundle/kit inventory handling
 */

import { describe, it, expect } from "vitest";
import { parseBundleMetafield } from "~/services/inventory/bundles";

describe("Bundle Support - Metafield Parsing", () => {
  it("should parse BUNDLE:TRUE format", () => {
    const components = parseBundleMetafield(
      "BUNDLE:TRUE,COMPONENTS:SKU1:2,SKU2:3"
    );

    expect(components).toHaveLength(2);
    expect(components[0]).toEqual({
      componentProductId: "SKU1",
      quantity: 2,
    });
    expect(components[1]).toEqual({
      componentProductId: "SKU2",
      quantity: 3,
    });
  });

  it("should return empty array for non-bundles", () => {
    const components = parseBundleMetafield("REGULAR:PRODUCT");
    expect(components).toHaveLength(0);
  });

  it("should handle empty metafield", () => {
    const components = parseBundleMetafield("");
    expect(components).toHaveLength(0);
  });

  it("should throw error for invalid component format", () => {
    expect(() => parseBundleMetafield("BUNDLE:TRUE,COMPONENTS:INVALID")).toThrow();
  });
});



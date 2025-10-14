/**
 * Shopify Test Data Generator for Growth Features
 * Generates realistic Hot Rod AN product data
 */

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  status: string;
  onlineStoreUrl: string;
  seo: {
    title: string;
    description: string;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        sku: string;
        price: string;
        inventoryQuantity: number;
      };
    }>;
  };
}

const PRODUCT_TEMPLATES = [
  {
    category: "Fuel Pumps",
    products: [
      {
        title: "Walbro/TI 255 LPH in-tank EFI pump kit (GCA758)",
        handle: "walbro-ti-255-lph-in-tank-efi-pump-kit-gca758",
        sku: "WALBRO-GCA758-KIT",
        price: "189.99",
        seoTitle: "Walbro 255 LPH Fuel Pump Kit - GCA758 | In-Tank EFI Pump",
        seoDesc: "Complete Walbro 255 LPH in-tank EFI fuel pump kit. Supports 450+ HP.",
      },
      {
        title: "Aeromotive A1000 Fuel Pump - 11101",
        handle: "aeromotive-a1000-fuel-pump-11101",
        sku: "AERO-11101",
        price: "449.99",
        seoTitle: "Aeromotive A1000 Fuel Pump 11101 | 1200 HP Carb/EFI",
        seoDesc: "Aeromotive A1000 external fuel pump supporting up to 1200 HP.",
      },
    ],
  },
  {
    category: "Fuel Lines",
    products: [
      {
        title: "PTFE lined Black Nylon with Orange Checks braided hose - AN6",
        handle: "ptfe-lined-black-nylon-with-orange-checks-braided-hose-an6",
        sku: "PTFE-AN6-BO-5FT",
        price: "45.99",
        seoTitle: "AN6 PTFE Fuel Line - Black/Orange Braided Hose",
        seoDesc: "Premium PTFE lined AN6 fuel line. -40°F to 300°F rating.",
      },
      {
        title: "LS Swap AN Fuel Line Install Kit — Return-Style (PTFE AN-6)",
        handle: "return-style-ls-engine-an-fuel-line-install-kit",
        sku: "LS-RETURN-KIT-AN6",
        price: "279.99",
        seoTitle: "LS Swap Return-Style Fuel Line Kit - Complete AN6 PTFE System",
        seoDesc: "Complete return-style fuel system for LS swaps.",
      },
    ],
  },
  {
    category: "Regulators",
    products: [
      {
        title: "Aeromotive Adjustable Fuel Pressure Regulator - 13109",
        handle: "aeromotive-adjustable-fuel-pressure-regulator-13109",
        sku: "AERO-13109-REG",
        price: "159.99",
        seoTitle: "Aeromotive Adjustable EFI Fuel Regulator 13109",
        seoDesc: "Compact bypass-style regulator. 30-70 PSI adjustable.",
      },
    ],
  },
];

/**
 * Generate Shopify product test data
 */
export function generateShopifyProducts(count: number = 5): ShopifyProduct[] {
  const products: ShopifyProduct[] = [];
  let productId = 8000;
  let variantId = 80000;

  for (let i = 0; i < count; i++) {
    const category = PRODUCT_TEMPLATES[i % PRODUCT_TEMPLATES.length];
    const template = category.products[i % category.products.length];
    
    productId++;
    variantId++;

    products.push({
      id: `gid://shopify/Product/${productId}`,
      title: template.title,
      handle: template.handle,
      status: "ACTIVE",
      onlineStoreUrl: `https://hotrodan.com/products/${template.handle}`,
      seo: {
        title: template.seoTitle,
        description: template.seoDesc,
      },
      variants: {
        edges: [
          {
            node: {
              id: `gid://shopify/ProductVariant/${variantId}`,
              sku: template.sku,
              price: template.price,
              inventoryQuantity: Math.floor(Math.random() * 50) + 5,
            },
          },
        ],
      },
    });
  }

  return products;
}

/**
 * Generate low stock products for inventory alerts
 */
export function generateLowStockProducts(count: number = 3): ShopifyProduct[] {
  return generateShopifyProducts(count).map((product) => ({
    ...product,
    variants: {
      edges: product.variants.edges.map((edge) => ({
        ...edge,
        node: {
          ...edge.node,
          inventoryQuantity: Math.floor(Math.random() * 5) + 1, // 1-5 units
        },
      })),
    },
  }));
}

/**
 * Generate page metadata for SEO optimization testing
 */
export interface PageMetadata {
  url: string;
  title: string;
  description: string;
  h1: string;
  wordCount: number;
  hasSchema: boolean;
}

export function generatePageMetadata(count: number = 5): PageMetadata[] {
  return PRODUCT_TEMPLATES.slice(0, count).flatMap((category) =>
    category.products.map((product) => ({
      url: `https://hotrodan.com/products/${product.handle}`,
      title: product.seoTitle,
      description: product.seoDesc,
      h1: product.title,
      wordCount: Math.floor(Math.random() * 500) + 300,
      hasSchema: Math.random() > 0.3, // 70% have schema
    }))
  );
}


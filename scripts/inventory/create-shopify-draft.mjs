#!/usr/bin/env node
/**
 * Shopify Draft Product Creation Script
 *
 * Creates draft products in Shopify with variants, SEO, and JSON-LD
 * Usage: node scripts/inventory/create-shopify-draft.mjs --title="New Product" [--dry-run]
 */

/**
 * Generate Shopify product draft payload
 *
 * @param {Object} productData - Product information
 * @returns {Object} GraphQL mutation payload
 */
export function generateProductDraft(productData) {
  const {
    title,
    descriptionHtml,
    vendor = "Hot Rod AN",
    productType = "Hot Sauce",
    tags = [],
    variants = [],
    seo = {},
    images = [],
    metafields = [],
  } = productData;

  return {
    title,
    descriptionHtml,
    vendor,
    productType,
    tags,
    variants: variants.map((v) => ({
      title: v.title || "Default",
      price: v.price,
      sku: v.sku,
      inventoryQuantities: v.inventoryQuantity
        ? [
            {
              availableQuantity: v.inventoryQuantity,
              locationId: v.locationId || "gid://shopify/Location/1",
            },
          ]
        : undefined,
      weight: v.weight,
      weightUnit: v.weightUnit || "POUNDS",
    })),
    seo: {
      title: seo.title || title,
      description: seo.description || `${title} - Hot Rod AN artisan hot sauce`,
    },
    images: images.map((img) => ({
      src: img.src,
      altText: img.alt || title,
    })),
    metafields: [
      ...metafields,
      // Add JSON-LD structured data
      {
        namespace: "schema",
        key: "product_json_ld",
        value: JSON.stringify(generateProductJSONLD(productData)),
        type: "json",
      },
    ],
    status: "DRAFT",
  };
}

/**
 * Generate JSON-LD structured data for product
 *
 * @param {Object} productData - Product information
 * @returns {Object} JSON-LD object
 */
export function generateProductJSONLD(productData) {
  const { title, descriptionHtml, variants = [], images = [] } = productData;

  const lowestPrice = variants.length > 0 ? Math.min(...variants.map((v) => parseFloat(v.price))) : 0;

  const highestPrice = variants.length > 0 ? Math.max(...variants.map((v) => parseFloat(v.price))) : lowestPrice;

  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: title,
    description: stripHtml(descriptionHtml || ""),
    brand: {
      "@type": "Brand",
      name: "Hot Rod AN",
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: lowestPrice.toFixed(2),
      highPrice: highestPrice.toFixed(2),
      availability: "https://schema.org/InStock",
    },
    image: images.length > 0 ? images[0].src : undefined,
  };
}

/**
 * Strip HTML tags from string
 */
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, "").trim();
}

/**
 * GraphQL mutation for creating product
 */
export const CREATE_PRODUCT_MUTATION = `
  mutation productCreate($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id
        title
        handle
        status
        variants(first: 10) {
          edges {
            node {
              id
              title
              sku
              price
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Create product draft in Shopify
 *
 * @param {Function} shopifyClient - Shopify GraphQL client function
 * @param {Object} productData - Product information
 * @param {boolean} dryRun - If true, only return payload without executing
 * @returns {Object} Result with product or errors
 */
export async function createProductDraft(shopifyClient, productData, dryRun = false) {
  const input = generateProductDraft(productData);

  if (dryRun) {
    return {
      dryRun: true,
      payload: input,
      mutation: CREATE_PRODUCT_MUTATION,
    };
  }

  try {
    const response = await shopifyClient(CREATE_PRODUCT_MUTATION, { input });

    if (response.data?.productCreate?.userErrors?.length > 0) {
      return {
        success: false,
        errors: response.data.productCreate.userErrors,
      };
    }

    return {
      success: true,
      product: response.data.productCreate.product,
    };
  } catch (error) {
    return {
      success: false,
      errors: [{ message: error.message }],
    };
  }
}

/**
 * Validate product data before creation
 *
 * @param {Object} productData - Product information
 * @returns {Object} Validation result
 */
export function validateProductData(productData) {
  const errors = [];

  if (!productData.title || productData.title.trim().length === 0) {
    errors.push("Product title is required");
  }

  if (productData.title && productData.title.length > 255) {
    errors.push("Product title must be 255 characters or less");
  }

  if (productData.variants && productData.variants.length > 0) {
    productData.variants.forEach((variant, index) => {
      if (!variant.price || parseFloat(variant.price) <= 0) {
        errors.push(`Variant ${index + 1}: Price must be greater than 0`);
      }

      if (variant.sku && variant.sku.length > 100) {
        errors.push(`Variant ${index + 1}: SKU must be 100 characters or less`);
      }
    });
  } else {
    errors.push("At least one variant is required");
  }

  if (productData.seo?.title && productData.seo.title.length > 70) {
    errors.push("SEO title should be 70 characters or less for best results");
  }

  if (productData.seo?.description && productData.seo.description.length > 320) {
    errors.push("SEO description should be 320 characters or less for best results");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate product data from CSV row
 *
 * @param {Object} row - CSV row data
 * @returns {Object} Product data
 */
export function parseProductFromCSV(row) {
  return {
    title: row.title,
    descriptionHtml: row.description ? `<p>${row.description}</p>` : "",
    productType: row.product_type || "Hot Sauce",
    tags: row.tags ? row.tags.split(",").map((t) => t.trim()) : [],
    variants: [
      {
        title: row.variant_title || "Default",
        price: row.price,
        sku: row.sku,
        inventoryQuantity: parseInt(row.inventory_quantity || "0", 10),
        weight: parseFloat(row.weight || "0"),
        weightUnit: row.weight_unit || "POUNDS",
      },
    ],
    seo: {
      title: row.seo_title,
      description: row.seo_description,
    },
  };
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const isDryRun = process.argv.includes("--dry-run");

  // Example product data
  const exampleProduct = {
    title: "Ghost Pepper Extreme Hot Sauce",
    descriptionHtml: "<p>Our hottest creation yet! Made with Carolina Reaper and Ghost Peppers.</p>",
    vendor: "Hot Rod AN",
    productType: "Hot Sauce",
    tags: ["extreme-heat", "ghost-pepper", "seasonal"],
    variants: [
      {
        title: "5oz Bottle",
        price: "12.99",
        sku: "GHOST-5OZ",
        inventoryQuantity: 50,
        weight: 0.5,
        weightUnit: "POUNDS",
      },
      {
        title: "12oz Bottle",
        price: "19.99",
        sku: "GHOST-12OZ",
        inventoryQuantity: 30,
        weight: 1.0,
        weightUnit: "POUNDS",
      },
    ],
    seo: {
      title: "Ghost Pepper Extreme Hot Sauce - Carolina Reaper Heat",
      description: "Extreme heat hot sauce made with Ghost Peppers and Carolina Reapers. Perfect for heat lovers!",
    },
    images: [
      {
        src: "https://example.com/ghost-pepper.jpg",
        alt: "Ghost Pepper Extreme Hot Sauce",
      },
    ],
  };

  // Validate
  const validation = validateProductData(exampleProduct);
  if (!validation.valid) {
    console.error("❌ Validation errors:");
    validation.errors.forEach((err) => console.error(`   - ${err}`));
    process.exit(1);
  }

  // Generate draft
  const draft = generateProductDraft(exampleProduct);

  console.log("✅ Product draft generated:");
  console.log(JSON.stringify(draft, null, 2));

  if (isDryRun) {
    console.log("\n📋 DRY RUN - No changes made to Shopify");
  } else {
    console.log("\n💡 Use --dry-run flag to preview without creating");
  }
}


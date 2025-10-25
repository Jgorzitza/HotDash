import { recordDashboardFact } from "../facts.server";
import { toInputJson } from "../json";
import type { DashboardFact } from "@prisma/client";

/**
 * ConversationTheme interface (from AI-Knowledge agent)
 * Represents a recurring theme detected in customer conversations
 */
export interface ConversationTheme {
  theme: string;
  productHandle: string;
  occurrences: number;
  exampleQueries: string[];
  detectedAt: string;
}

/**
 * CXThemeAction interface
 * Represents an actionable task generated from a CX theme
 */
export interface CXThemeAction {
  type: "content" | "seo" | "product_update";
  title: string;
  description: string;
  expectedRevenue: number;
  confidence: number;
  ease: number;
  evidenceUrl: string;
  affectedEntities: string[];
  draftCopy?: string;
  metadata: {
    theme: string;
    occurrences: number;
    productHandle: string;
    exampleQueries: string[];
    implementationType: string;
  };
}

/**
 * Maps a theme to an implementation type
 * Returns the action type and specific implementation approach
 */
export function mapThemeToImplementationType(theme: string): {
  type: "content" | "seo" | "product_update";
  implementationType: string;
} {
  const themeMap: Record<
    string,
    { type: "content" | "seo" | "product_update"; implementationType: string }
  > = {
    "size chart": { type: "content", implementationType: "add_size_chart" },
    "sizing guide": { type: "content", implementationType: "add_size_chart" },
    "product dimensions": {
      type: "content",
      implementationType: "add_dimensions",
    },
    "how to install": {
      type: "content",
      implementationType: "add_installation_guide",
    },
    "warranty information": {
      type: "content",
      implementationType: "add_warranty_section",
    },
    "return policy": {
      type: "seo",
      implementationType: "add_return_policy_link",
    },
    "shipping time": {
      type: "seo",
      implementationType: "add_shipping_estimate",
    },
    "in stock": {
      type: "product_update",
      implementationType: "add_stock_indicator",
    },
    "when restock": {
      type: "product_update",
      implementationType: "add_restock_notification",
    },
  };

  return (
    themeMap[theme.toLowerCase()] || {
      type: "content",
      implementationType: "general_update",
    }
  );
}

/**
 * Generates draft copy for implementation
 * Creates ready-to-use content based on the theme and product
 */
export function generateDraftCopy(
  theme: string,
  productTitle: string,
  occurrences: number,
): string {
  const implType = mapThemeToImplementationType(theme);

  const templates: Record<string, string> = {
    add_size_chart: `
**Size Chart for ${productTitle}**

Based on ${occurrences} customer inquiries in the last 7 days, customers need sizing guidance. Recommended size chart:

| Size | Chest (in) | Waist (in) | Length (in) |
|------|-----------|-----------|------------|
| S    | 34-36     | 28-30     | 27         |
| M    | 38-40     | 32-34     | 28         |
| L    | 42-44     | 36-38     | 29         |
| XL   | 46-48     | 40-42     | 30         |

**Fit Notes**: True to size. For between sizes, size up for comfort.
    `.trim(),

    add_dimensions: `
**Product Dimensions for ${productTitle}**

Customers are asking about exact dimensions (${occurrences} inquiries). Add to product description:

**Dimensions**:
- Length: [FILL IN]
- Width: [FILL IN]
- Height/Depth: [FILL IN]
- Weight: [FILL IN]

**Packaging Dimensions**:
- Box size: [FILL IN]
- Shipping weight: [FILL IN]
    `.trim(),

    add_installation_guide: `
**Installation Guide for ${productTitle}**

${occurrences} customers asked for installation help. Suggested guide:

**Installation Steps**:
1. [STEP 1]
2. [STEP 2]
3. [STEP 3]

**Tools Needed**: [LIST]
**Installation Time**: [TIME]

**Video Tutorial**: [LINK TO VIDEO if available]
    `.trim(),

    add_warranty_section: `
**Warranty Information for ${productTitle}**

Customers are asking about warranty coverage (${occurrences} inquiries). Add to product page:

**Warranty**: [1-year/2-year/etc.] limited warranty
**Covers**: Manufacturing defects, material failures
**Does Not Cover**: Normal wear and tear, misuse, improper installation
**Claim Process**: Email support@hotrodan.com with order number and photos
    `.trim(),
  };

  return (
    templates[implType.implementationType] ||
    `
Update ${productTitle} to address customer questions about "${theme}" (${occurrences} inquiries in last 7 days).
  `.trim()
  );
}

/**
 * Mock function to get Shopify product by handle
 * In production, this would query Shopify GraphQL API
 */
async function getShopifyProductByHandle(handle: string): Promise<{
  id: string;
  title: string;
  handle: string;
} | null> {
  // TODO: Implement Shopify GraphQL query
  // For now, return mock data to allow service testing
  return {
    id: `gid://shopify/Product/mock-${handle}`,
    title: handle
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    handle,
  };
}

/**
 * Generates an Action card from a CX theme
 * Converts customer conversation patterns into actionable product improvements
 */
export async function generateCXThemeAction(
  theme: ConversationTheme,
  shopDomain: string,
): Promise<CXThemeAction | null> {
  // Get product details
  const product = await getShopifyProductByHandle(theme.productHandle);

  if (!product) {
    console.warn(`[Product] Product not found: ${theme.productHandle}`);
    return null;
  }

  const implMapping = mapThemeToImplementationType(theme.theme);
  const draftCopy = generateDraftCopy(
    theme.theme,
    product.title,
    theme.occurrences,
  );

  // Calculate expected impact
  const expectedRevenue = theme.occurrences * 50; // Estimate: $50 saved support time per inquiry
  const confidence = theme.occurrences >= 5 ? 0.9 : 0.7; // Higher confidence with more data
  const ease = implMapping.implementationType === "add_size_chart" ? 0.8 : 0.6;

  return {
    type: implMapping.type,
    title: `Add ${theme.theme} to ${product.title}`,
    description: `${theme.occurrences} customers asked about "${theme.theme}" in the last 7 days. Adding this to the product page may reduce support volume by ${Math.round(theme.occurrences * 0.8)} tickets/week and increase conversions by an estimated 5-8%.`,
    expectedRevenue,
    confidence,
    ease,
    evidenceUrl: `/api/cx-themes/${encodeURIComponent(theme.theme)}`,
    affectedEntities: [theme.productHandle],
    draftCopy,
    metadata: {
      theme: theme.theme,
      occurrences: theme.occurrences,
      productHandle: theme.productHandle,
      exampleQueries: theme.exampleQueries,
      implementationType: implMapping.implementationType,
    },
  };
}

/**
 * Processes multiple CX themes and generates Action cards
 * Batch processes themes from AI-Knowledge agent
 */
export async function processCXThemes(
  themes: ConversationTheme[],
  shopDomain: string,
): Promise<CXThemeAction[]> {
  const actions: CXThemeAction[] = [];

  for (const theme of themes) {
    const action = await generateCXThemeAction(theme, shopDomain);

    if (action) {
      actions.push(action);
    }
  }

  return actions;
}

/**
 * Adds CX theme actions to the Action Queue (via DashboardFact)
 * Stores actions as dashboard facts for operator review
 */
export async function addCXActionsToQueue(
  actions: CXThemeAction[],
  shopDomain: string,
): Promise<{ added: number; facts: DashboardFact[] }> {
  const facts: DashboardFact[] = [];

  for (const action of actions) {
    const fact = await recordDashboardFact({
      shopDomain,
      factType: "product.cx_theme_action",
      scope: "growth",
      value: toInputJson(action),
      metadata: toInputJson({
        theme: action.metadata.theme,
        occurrences: action.metadata.occurrences,
        productHandle: action.metadata.productHandle,
        createdBy: "ai-knowledge",
        status: "pending",
      }),
      evidenceUrl: action.evidenceUrl,
    });

    facts.push(fact);
  }

  console.log(`[Product] ✅ Added ${actions.length} CX theme actions to queue`);

  return {
    added: actions.length,
    facts,
  };
}

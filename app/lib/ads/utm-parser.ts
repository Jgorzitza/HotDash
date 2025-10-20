/**
 * UTM Tracking & Attribution
 *
 * Parses UTM parameters from Shopify orders and attributes revenue to campaigns.
 * Supports both first-touch and last-touch attribution models.
 *
 * @module app/lib/ads/utm-parser
 */

/**
 * UTM parameters from customer journey
 */
export interface UTMParameters {
  source: string | null; // e.g., "google", "facebook"
  medium: string | null; // e.g., "cpc", "social"
  campaign: string | null; // e.g., "spring_sale_2025"
  term: string | null; // e.g., "hot sauce gifts"
  content: string | null; // e.g., "red_button_v2"
}

/**
 * Visit data with UTM parameters
 */
export interface VisitData {
  utmParameters: UTMParameters | null;
  source: string | null;
  sourceType: string | null;
  landingPage: string | null;
  referrerUrl: string | null;
  occurredAt: string | null;
}

/**
 * Customer journey summary from Shopify
 */
export interface CustomerJourneySummary {
  customerOrderIndex: number;
  daysToConversion: number;
  firstVisit: VisitData | null;
  lastVisit: VisitData | null;
  ready: boolean;
}

/**
 * Shopify order with customer journey data
 */
export interface ShopifyOrderWithAttribution {
  id: string;
  name: string;
  createdAt: string;
  currentTotalPriceSet: {
    shopMoney: {
      amount: string;
      currencyCode: string;
    };
  };
  customer: {
    id: string;
    email: string | null;
  } | null;
  customerJourneySummary: CustomerJourneySummary | null;
}

/**
 * Attribution result
 */
export interface AttributionResult {
  orderId: string;
  orderName: string;
  orderDate: string;
  revenueCents: number;
  currencyCode: string;
  customerId: string | null;
  customerEmail: string | null;

  // Attribution data
  attributionModel: "first_touch" | "last_touch" | "unknown";
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;

  // Additional context
  customerOrderIndex: number;
  daysToConversion: number;
  landingPage: string | null;
  referrerUrl: string | null;
}

/**
 * Parses UTM parameters from a Shopify order's customer journey.
 *
 * @param order - Shopify order with customerJourneySummary
 * @param model - Attribution model: 'first_touch' (default) or 'last_touch'
 * @returns Attribution result or null if no journey data
 *
 * @example
 * ```typescript
 * const attribution = parseOrderAttribution(order, 'first_touch');
 * if (attribution) {
 *   console.log(`Campaign: ${attribution.utmCampaign}, Revenue: $${attribution.revenueCents / 100}`);
 * }
 * ```
 */
export function parseOrderAttribution(
  order: ShopifyOrderWithAttribution,
  model: "first_touch" | "last_touch" = "first_touch",
): AttributionResult | null {
  if (!order.customerJourneySummary || !order.customerJourneySummary.ready) {
    return null;
  }

  const journey = order.customerJourneySummary;
  const visit =
    model === "first_touch" ? journey.firstVisit : journey.lastVisit;

  if (!visit) {
    return null;
  }

  // Parse revenue (convert string to cents)
  const revenueString = order.currentTotalPriceSet.shopMoney.amount;
  const revenueCents = Math.round(parseFloat(revenueString) * 100);

  return {
    orderId: order.id,
    orderName: order.name,
    orderDate: order.createdAt,
    revenueCents,
    currencyCode: order.currentTotalPriceSet.shopMoney.currencyCode,
    customerId: order.customer?.id || null,
    customerEmail: order.customer?.email || null,

    attributionModel: model,
    utmSource: visit.utmParameters?.source || null,
    utmMedium: visit.utmParameters?.medium || null,
    utmCampaign: visit.utmParameters?.campaign || null,
    utmTerm: visit.utmParameters?.term || null,
    utmContent: visit.utmParameters?.content || null,

    customerOrderIndex: journey.customerOrderIndex,
    daysToConversion: journey.daysToConversion,
    landingPage: visit.landingPage || null,
    referrerUrl: visit.referrerUrl || null,
  };
}

/**
 * Parses attribution for multiple orders.
 *
 * @param orders - Array of Shopify orders
 * @param model - Attribution model: 'first_touch' or 'last_touch'
 * @returns Array of attribution results (excludes orders without journey data)
 *
 * @example
 * ```typescript
 * const attributions = parseMultipleOrdersAttribution(orders, 'last_touch');
 * const totalRevenue = attributions.reduce((sum, a) => sum + a.revenueCents, 0);
 * ```
 */
export function parseMultipleOrdersAttribution(
  orders: ShopifyOrderWithAttribution[],
  model: "first_touch" | "last_touch" = "first_touch",
): AttributionResult[] {
  if (!orders || orders.length === 0) {
    return [];
  }

  return orders
    .map((order) => parseOrderAttribution(order, model))
    .filter((result): result is AttributionResult => result !== null);
}

/**
 * Groups attribution results by campaign.
 *
 * @param attributions - Array of attribution results
 * @returns Object with campaign as key, array of attributions as value
 *
 * @example
 * ```typescript
 * const byCampaign = groupByCampaign(attributions);
 * for (const [campaign, orders] of Object.entries(byCampaign)) {
 *   const revenue = orders.reduce((sum, o) => sum + o.revenueCents, 0);
 *   console.log(`${campaign}: ${orders.length} orders, $${revenue / 100} revenue`);
 * }
 * ```
 */
export function groupByCampaign(
  attributions: AttributionResult[],
): Record<string, AttributionResult[]> {
  if (!attributions || attributions.length === 0) {
    return {};
  }

  const groups: Record<string, AttributionResult[]> = {};

  for (const attr of attributions) {
    const campaign = attr.utmCampaign || "unknown";
    if (!groups[campaign]) {
      groups[campaign] = [];
    }
    groups[campaign].push(attr);
  }

  return groups;
}

/**
 * Groups attribution results by source (platform).
 *
 * @param attributions - Array of attribution results
 * @returns Object with source as key, array of attributions as value
 *
 * @example
 * ```typescript
 * const bySource = groupBySource(attributions);
 * // { "google": [...], "facebook": [...], "instagram": [...] }
 * ```
 */
export function groupBySource(
  attributions: AttributionResult[],
): Record<string, AttributionResult[]> {
  if (!attributions || attributions.length === 0) {
    return {};
  }

  const groups: Record<string, AttributionResult[]> = {};

  for (const attr of attributions) {
    const source = attr.utmSource || "unknown";
    if (!groups[source]) {
      groups[source] = [];
    }
    groups[source].push(attr);
  }

  return groups;
}

/**
 * Calculates campaign revenue from attributed orders.
 *
 * @param attributions - Array of attribution results
 * @param campaignName - Campaign name to filter by
 * @returns Total revenue in cents for the campaign
 *
 * @example
 * ```typescript
 * const revenue = calculateCampaignRevenue(attributions, 'spring_sale_2025');
 * console.log(`Revenue: $${revenue / 100}`);
 * ```
 */
export function calculateCampaignRevenue(
  attributions: AttributionResult[],
  campaignName: string,
): number {
  if (!attributions || attributions.length === 0) {
    return 0;
  }

  return attributions
    .filter((attr) => attr.utmCampaign === campaignName)
    .reduce((sum, attr) => sum + attr.revenueCents, 0);
}

/**
 * Builds a campaign attribution summary.
 *
 * @param attributions - Array of attribution results
 * @param campaignName - Campaign name to summarize
 * @returns Summary with orders, revenue, conversions, avg order value
 *
 * @example
 * ```typescript
 * const summary = buildCampaignSummary(attributions, 'spring_sale_2025');
 * console.log(`${summary.orderCount} orders, ROAS: ${summary.roas}x`);
 * ```
 */
export function buildCampaignSummary(
  attributions: AttributionResult[],
  campaignName: string,
  spendCents?: number,
): {
  campaignName: string;
  orderCount: number;
  revenueCents: number;
  conversions: number;
  avgOrderValueCents: number;
  avgDaysToConversion: number;
  roas: number | null;
} {
  const campaignOrders = attributions.filter(
    (attr) => attr.utmCampaign === campaignName,
  );

  const revenueCents = campaignOrders.reduce(
    (sum, attr) => sum + attr.revenueCents,
    0,
  );
  const conversions = campaignOrders.length;
  const avgOrderValueCents =
    conversions > 0 ? Math.round(revenueCents / conversions) : 0;

  const totalDaysToConversion = campaignOrders.reduce(
    (sum, attr) => sum + attr.daysToConversion,
    0,
  );
  const avgDaysToConversion =
    conversions > 0 ? Math.round(totalDaysToConversion / conversions) : 0;

  const roas =
    spendCents && spendCents > 0
      ? parseFloat((revenueCents / spendCents).toFixed(2))
      : null;

  return {
    campaignName,
    orderCount: conversions,
    revenueCents,
    conversions,
    avgOrderValueCents,
    avgDaysToConversion,
    roas,
  };
}

/**
 * Matches campaign IDs from ads system to UTM campaigns.
 *
 * This helps link Shopify order attribution to campaign data from Meta/Google/etc.
 *
 * @param utmCampaign - UTM campaign parameter (e.g., "spring_sale_2025")
 * @param campaigns - Array of campaign objects with utm_campaign field
 * @returns Matching campaign or null
 *
 * @example
 * ```typescript
 * const campaign = matchCampaignByUTM('spring_sale_2025', campaigns);
 * if (campaign) {
 *   console.log(`Matched to ${campaign.platform} campaign ${campaign.id}`);
 * }
 * ```
 */
export function matchCampaignByUTM<
  T extends { utm_campaign?: string; id: string },
>(utmCampaign: string, campaigns: T[]): T | null {
  if (!utmCampaign || !campaigns || campaigns.length === 0) {
    return null;
  }

  // Exact match
  const exactMatch = campaigns.find((c) => c.utm_campaign === utmCampaign);

  if (exactMatch) {
    return exactMatch;
  }

  // Case-insensitive match
  const utmLower = utmCampaign.toLowerCase();
  const caseInsensitiveMatch = campaigns.find(
    (c) => c.utm_campaign?.toLowerCase() === utmLower,
  );

  return caseInsensitiveMatch || null;
}

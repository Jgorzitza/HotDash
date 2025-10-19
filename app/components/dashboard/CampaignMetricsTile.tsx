/**
 * Campaign Metrics Tile
 *
 * Dashboard tile component displaying advertising campaign metrics
 * Shows ROAS, CPC, spend with loading and error states
 *
 * @module app/components/dashboard/CampaignMetricsTile
 */

import {
  Card,
  BlockStack,
  Text,
  InlineStack,
  Badge,
  Spinner,
  Banner,
  Divider,
} from "@shopify/polaris";

/**
 * Campaign metrics tile props
 */
interface CampaignMetricsTileProps {
  /** Total advertising spend */
  spend: number;

  /** Return on Ad Spend value */
  roas: number;

  /** Cost Per Click value */
  cpc: number;

  /** Total number of clicks */
  clicks: number;

  /** Total number of impressions */
  impressions: number;

  /** ROAS trend direction */
  roasTrend?: "up" | "down" | "neutral";

  /** ROAS percent change */
  roasChange?: string;

  /** Currency code for formatting */
  currency?: string;

  /** Loading state */
  loading?: boolean;

  /** Error state */
  error?: string;

  /** Time period label */
  period?: string;
}

/**
 * Format currency value
 */
function formatCurrency(value: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format number with commas
 */
function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

/**
 * Campaign Metrics Tile Component
 *
 * Displays advertising campaign performance metrics in a dashboard tile
 * including ROAS, CPC, spend, clicks, and impressions.
 *
 * @example
 * ```tsx
 * <CampaignMetricsTile
 *   spend={1250}
 *   roas={4.2}
 *   cpc={1.85}
 *   clicks={675}
 *   impressions={12500}
 *   roasTrend="up"
 *   roasChange="+12.5%"
 *   period="Last 7 days"
 * />
 * ```
 */
export function CampaignMetricsTile({
  spend,
  roas,
  cpc,
  clicks,
  impressions,
  roasTrend = "neutral",
  roasChange,
  currency = "USD",
  loading = false,
  error,
  period = "Last 7 days",
}: CampaignMetricsTileProps) {
  // Loading state
  if (loading) {
    return (
      <Card>
        <BlockStack gap="400" align="center">
          <Spinner size="small" />
          <Text as="p" tone="subdued">
            Loading campaign metrics...
          </Text>
        </BlockStack>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <BlockStack gap="400">
          <Text as="h3" variant="headingMd">
            Campaign Metrics
          </Text>
          <Banner tone="critical" title="Failed to load metrics">
            {error}
          </Banner>
        </BlockStack>
      </Card>
    );
  }

  // Determine ROAS tone
  const roasTone = roas >= 4.0 ? "success" : roas >= 2.0 ? "info" : "critical";

  return (
    <Card>
      <BlockStack gap="400">
        {/* Header */}
        <BlockStack gap="200">
          <Text as="h3" variant="headingMd">
            Campaign Metrics
          </Text>
          <Text as="p" tone="subdued" variant="bodyMd">
            {period}
          </Text>
        </BlockStack>

        <Divider />

        {/* Primary Metric: ROAS */}
        <BlockStack gap="200">
          <Text as="p" tone="subdued" variant="bodyMd">
            Return on Ad Spend (ROAS)
          </Text>
          <InlineStack gap="300" align="space-between" blockAlign="center">
            <Text as="h2" variant="heading2xl">
              {roas.toFixed(2)}x
            </Text>
            {roasChange && (
              <InlineStack gap="200" align="end" blockAlign="center">
                <Text as="p" tone="subdued">
                  {roasChange}
                </Text>
                {roasTrend !== "neutral" && (
                  <Badge tone={roasTrend === "up" ? "success" : "critical"}>
                    {roasTrend === "up" ? "↑" : "↓"}
                  </Badge>
                )}
              </InlineStack>
            )}
          </InlineStack>
          <Badge tone={roasTone}>
            {roas >= 4.0
              ? "Excellent"
              : roas >= 2.0
                ? "Good"
                : "Needs Improvement"}
          </Badge>
        </BlockStack>

        <Divider />

        {/* Secondary Metrics */}
        <BlockStack gap="300">
          {/* Spend */}
          <InlineStack gap="200" align="space-between" blockAlign="center">
            <Text as="p" variant="bodyMd">
              Total Spend
            </Text>
            <Text as="p" variant="headingMd" fontWeight="semibold">
              {formatCurrency(spend, currency)}
            </Text>
          </InlineStack>

          {/* CPC */}
          <InlineStack gap="200" align="space-between" blockAlign="center">
            <Text as="p" variant="bodyMd">
              Cost Per Click
            </Text>
            <Text as="p" variant="headingMd" fontWeight="semibold">
              {formatCurrency(cpc, currency)}
            </Text>
          </InlineStack>

          {/* Clicks */}
          <InlineStack gap="200" align="space-between" blockAlign="center">
            <Text as="p" variant="bodyMd">
              Clicks
            </Text>
            <Text as="p" variant="headingMd" fontWeight="semibold">
              {formatNumber(clicks)}
            </Text>
          </InlineStack>

          {/* Impressions */}
          <InlineStack gap="200" align="space-between" blockAlign="center">
            <Text as="p" variant="bodyMd">
              Impressions
            </Text>
            <Text as="p" variant="headingMd" fontWeight="semibold">
              {formatNumber(impressions)}
            </Text>
          </InlineStack>

          {/* CTR (calculated) */}
          <InlineStack gap="200" align="space-between" blockAlign="center">
            <Text as="p" variant="bodyMd">
              Click-Through Rate
            </Text>
            <Text as="p" variant="headingMd" fontWeight="semibold">
              {impressions > 0
                ? ((clicks / impressions) * 100).toFixed(2)
                : "0.00"}
              %
            </Text>
          </InlineStack>
        </BlockStack>
      </BlockStack>
    </Card>
  );
}

/**
 * Compact Campaign Metrics Tile (alternative layout)
 *
 * Shows only the most critical metrics in a condensed format
 */
export function CompactCampaignMetricsTile({
  spend,
  roas,
  cpc,
  loading = false,
  error,
}: Pick<
  CampaignMetricsTileProps,
  "spend" | "roas" | "cpc" | "loading" | "error"
>) {
  if (loading) {
    return (
      <Card>
        <BlockStack gap="200" align="center">
          <Spinner size="small" />
        </BlockStack>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <BlockStack gap="200">
          <Text as="p" tone="critical" variant="bodyMd">
            Error loading metrics
          </Text>
        </BlockStack>
      </Card>
    );
  }

  return (
    <Card>
      <BlockStack gap="300">
        <Text as="h4" variant="headingSm">
          Campaigns
        </Text>
        <InlineStack gap="400" align="space-between">
          <BlockStack gap="100">
            <Text as="p" tone="subdued" variant="bodySm">
              ROAS
            </Text>
            <Text as="p" variant="headingMd">
              {roas.toFixed(1)}x
            </Text>
          </BlockStack>
          <BlockStack gap="100">
            <Text as="p" tone="subdued" variant="bodySm">
              Spend
            </Text>
            <Text as="p" variant="headingMd">
              ${spend.toFixed(0)}
            </Text>
          </BlockStack>
          <BlockStack gap="100">
            <Text as="p" tone="subdued" variant="bodySm">
              CPC
            </Text>
            <Text as="p" variant="headingMd">
              ${cpc.toFixed(2)}
            </Text>
          </BlockStack>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}

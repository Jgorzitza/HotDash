/**
 * Ads Dashboard Tile
 *
 * Displays key advertising metrics (spend, ROAS, clicks, conversions)
 * using Shopify Polaris components. Fetches data from /api/ads/campaigns.
 */

import { Card, Text, BlockStack, InlineStack, Box } from "@shopify/polaris";
import { useFetcher } from "react-router";
import { useEffect } from "react";
import {
  formatCentsToDollars,
  formatROAS,
  formatPercentage,
} from "~/lib/ads/metrics";

export interface AdsTileData {
  summary: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalSpend: number;
    totalRevenue: number;
    totalClicks: number;
    totalConversions: number;
    overallROAS: number | null;
  };
}

export function AdsTile() {
  const fetcher = useFetcher<AdsTileData>();

  // Fetch ads data on mount
  useEffect(() => {
    if (fetcher.state === "idle" && !fetcher.data) {
      fetcher.load("/api/ads/campaigns");
    }
  }, [fetcher]);

  const isLoading = fetcher.state === "loading";
  const summary = fetcher.data?.summary;

  // Calculate derived metrics
  const avgCPC = summary?.totalClicks
    ? summary.totalSpend / summary.totalClicks
    : null;
  const conversionRate =
    summary?.totalClicks && summary?.totalConversions
      ? summary.totalConversions / summary.totalClicks
      : null;

  return (
    <Card>
      <BlockStack gap="400">
        {/* Header */}
        <InlineStack align="space-between" blockAlign="center">
          <Text as="h2" variant="headingMd">
            Advertising Performance
          </Text>
          <Text as="span" variant="bodySm" tone="subdued">
            {isLoading
              ? "Loading..."
              : `${summary?.activeCampaigns ?? 0} active campaigns`}
          </Text>
        </InlineStack>

        {/* Key Metrics Grid */}
        <Box>
          <InlineStack gap="400" wrap={false}>
            {/* Total Spend */}
            <Box width="25%">
              <BlockStack gap="100">
                <Text as="p" variant="bodySm" tone="subdued">
                  Total Spend
                </Text>
                <Text as="p" variant="headingLg">
                  {isLoading || !summary
                    ? "—"
                    : formatCentsToDollars(summary.totalSpend)}
                </Text>
              </BlockStack>
            </Box>

            {/* ROAS */}
            <Box width="25%">
              <BlockStack gap="100">
                <Text as="p" variant="bodySm" tone="subdued">
                  ROAS
                </Text>
                <Text
                  as="p"
                  variant="headingLg"
                  tone={
                    summary?.overallROAS && summary.overallROAS >= 2
                      ? "success"
                      : summary?.overallROAS && summary.overallROAS >= 1
                        ? "caution"
                        : "critical"
                  }
                >
                  {isLoading || !summary
                    ? "—"
                    : formatROAS(summary.overallROAS)}
                </Text>
              </BlockStack>
            </Box>

            {/* Total Clicks */}
            <Box width="25%">
              <BlockStack gap="100">
                <Text as="p" variant="bodySm" tone="subdued">
                  Total Clicks
                </Text>
                <Text as="p" variant="headingLg">
                  {isLoading || !summary
                    ? "—"
                    : summary.totalClicks.toLocaleString()}
                </Text>
              </BlockStack>
            </Box>

            {/* Conversions */}
            <Box width="25%">
              <BlockStack gap="100">
                <Text as="p" variant="bodySm" tone="subdued">
                  Conversions
                </Text>
                <Text as="p" variant="headingLg">
                  {isLoading || !summary
                    ? "—"
                    : summary.totalConversions.toLocaleString()}
                </Text>
              </BlockStack>
            </Box>
          </InlineStack>
        </Box>

        {/* Secondary Metrics */}
        <Box
          paddingBlockStart="200"
          borderBlockStartWidth="025"
          borderColor="border-secondary"
        >
          <InlineStack gap="400" wrap={false}>
            {/* Revenue */}
            <Box width="33%">
              <BlockStack gap="100">
                <Text as="p" variant="bodySm" tone="subdued">
                  Revenue
                </Text>
                <Text as="p" variant="bodyMd">
                  {isLoading || !summary
                    ? "—"
                    : formatCentsToDollars(summary.totalRevenue)}
                </Text>
              </BlockStack>
            </Box>

            {/* Avg CPC */}
            <Box width="33%">
              <BlockStack gap="100">
                <Text as="p" variant="bodySm" tone="subdued">
                  Avg CPC
                </Text>
                <Text as="p" variant="bodyMd">
                  {isLoading || !avgCPC
                    ? "—"
                    : formatCentsToDollars(Math.round(avgCPC))}
                </Text>
              </BlockStack>
            </Box>

            {/* Conversion Rate */}
            <Box width="33%">
              <BlockStack gap="100">
                <Text as="p" variant="bodySm" tone="subdued">
                  Conv. Rate
                </Text>
                <Text as="p" variant="bodyMd">
                  {isLoading || !conversionRate
                    ? "—"
                    : formatPercentage(conversionRate)}
                </Text>
              </BlockStack>
            </Box>
          </InlineStack>
        </Box>

        {/* Footer - Campaign Count */}
        <Box paddingBlockStart="200">
          <Text as="p" variant="bodySm" alignment="end" tone="subdued">
            {isLoading || !summary
              ? "Loading campaigns..."
              : `${summary.totalCampaigns} total campaigns across all platforms`}
          </Text>
        </Box>
      </BlockStack>
    </Card>
  );
}

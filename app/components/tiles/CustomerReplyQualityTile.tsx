/**
 * Customer Reply Quality Dashboard Tile
 *
 * Displays AI customer reply performance metrics:
 * - % drafted by AI
 * - Average grades (tone, accuracy, policy)
 * - Approval rate
 * - Edit distance
 */

import { Card, BlockStack, InlineStack, Text, Badge } from "@shopify/polaris";
import type { ResponseQualityMetrics } from "../../lib/metrics/customer-reply-quality";
import { formatForDashboardTile } from "../../lib/metrics/customer-reply-quality";

export interface CustomerReplyQualityTileProps {
  metrics: ResponseQualityMetrics;
  loading?: boolean;
}

export function CustomerReplyQualityTile({
  metrics,
  loading = false,
}: CustomerReplyQualityTileProps) {
  const tiles = formatForDashboardTile(metrics);

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between">
          <Text as="h2" variant="headingMd">
            AI Customer Reply Quality
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            {metrics.startDate} – {metrics.endDate}
          </Text>
        </InlineStack>

        {loading ? (
          <Text as="p" variant="bodyMd">
            Loading metrics...
          </Text>
        ) : (
          <BlockStack gap="300">
            {tiles.map((tile, idx) => (
              <InlineStack key={idx} align="space-between" blockAlign="start">
                <BlockStack gap="100">
                  <Text as="p" variant="bodyMd" tone="subdued">
                    {tile.title}
                  </Text>
                  <Text as="h3" variant="headingLg">
                    {tile.value}
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    {tile.subtitle}
                  </Text>
                </BlockStack>
                {tile.badge && (
                  <Badge tone={tile.badge.tone}>{tile.badge.label}</Badge>
                )}
              </InlineStack>
            ))}
          </BlockStack>
        )}
      </BlockStack>
    </Card>
  );
}

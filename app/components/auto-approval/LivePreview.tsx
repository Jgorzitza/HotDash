/**
 * LivePreview Component - P0
 * 
 * Shows live preview of how many actions would auto-approve
 * with current settings
 */

import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  ProgressBar,
  Banner,
  Box,
} from '@shopify/polaris';

export interface LivePreviewProps {
  stats: {
    totalPending: number;
    wouldAutoApprove: number;
    percentageAutoApproved: number;
  };
}

export function LivePreview({ stats }: LivePreviewProps) {
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getTone = (): 'success' | 'warning' | 'info' => {
    if (stats.percentageAutoApproved >= 80) return 'warning';
    if (stats.percentageAutoApproved >= 50) return 'success';
    return 'info';
  };

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between" blockAlign="center">
          <Text variant="headingMd" as="h3">
            Live Preview
          </Text>
          <Banner tone="info" hideIcon>
            <Text variant="bodySm">
              Based on current pending actions
            </Text>
          </Banner>
        </InlineStack>

        {/* Main Stats */}
        <Box
          background="bg-surface-secondary"
          padding="500"
          borderRadius="300"
        >
          <BlockStack gap="400">
            <InlineStack align="space-between" blockAlign="baseline">
              <BlockStack gap="100">
                <Text variant="bodySm" tone="subdued">
                  Would Auto-Approve
                </Text>
                <Text variant="heading2xl" as="p">
                  {formatNumber(stats.wouldAutoApprove)}
                </Text>
              </BlockStack>

              <BlockStack gap="100">
                <Text variant="bodySm" tone="subdued" alignment="end">
                  Total Pending
                </Text>
                <Text variant="headingLg" as="p" tone="subdued" alignment="end">
                  {formatNumber(stats.totalPending)}
                </Text>
              </BlockStack>
            </InlineStack>

            {/* Progress Bar */}
            <BlockStack gap="200">
              <ProgressBar 
                progress={stats.percentageAutoApproved} 
                tone={getTone()}
                size="small"
              />
              <InlineStack align="space-between">
                <Text variant="bodySm" tone="subdued">
                  {stats.percentageAutoApproved.toFixed(1)}% of pending actions
                </Text>
                <Text variant="bodySm" fontWeight="semibold">
                  {formatNumber(stats.totalPending - stats.wouldAutoApprove)} require manual review
                </Text>
              </InlineStack>
            </BlockStack>
          </BlockStack>
        </Box>

        {/* Warnings */}
        {stats.percentageAutoApproved >= 80 && (
          <Banner tone="warning">
            <Text>
              ⚠️ High auto-approval rate. Consider increasing thresholds to maintain quality control.
            </Text>
          </Banner>
        )}

        {stats.percentageAutoApproved < 20 && (
          <Banner tone="info">
            <Text>
              💡 Low auto-approval rate. Consider lowering thresholds to save more time.
            </Text>
          </Banner>
        )}
      </BlockStack>
    </Card>
  );
}


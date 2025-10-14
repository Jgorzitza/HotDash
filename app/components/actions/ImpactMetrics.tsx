/**
 * ImpactMetrics Component
 * 
 * Displays predicted impact metrics for an action
 * - CTR Lift
 * - Traffic Increase
 * - Revenue Impact
 * - Time to Impact
 */

import { Card, BlockStack, InlineStack, Text, Badge, Box, Grid } from '@shopify/polaris';

export interface ImpactMetricsProps {
  metrics: {
    ctrLift?: number; // CTR lift percentage
    trafficIncrease?: number; // Traffic increase percentage
    revenueImpact?: number; // Estimated revenue impact ($)
    timeToImpact?: string; // e.g., "2-3 weeks"
  };
}

export function ImpactMetrics({ metrics }: ImpactMetricsProps) {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return `${value > 0 ? '+' : ''}${value}%`;
  };

  return (
    <Card>
      <BlockStack gap="300">
        <Text variant="headingXs">Predicted Impact</Text>

        <Grid columns={{ xs: 2, sm: 2, md: 4, lg: 4, xl: 4 }}>
          {/* CTR Lift */}
          {metrics.ctrLift !== undefined && (
            <Box
              background="bg-surface-secondary"
              padding="400"
              borderRadius="200"
            >
              <BlockStack gap="200">
                <Text variant="bodySm" tone="subdued">
                  CTR Lift
                </Text>
                <Text variant="headingLg" as="h3">
                  {formatPercentage(metrics.ctrLift)}
                </Text>
              </BlockStack>
            </Box>
          )}

          {/* Traffic Increase */}
          {metrics.trafficIncrease !== undefined && (
            <Box
              background="bg-surface-secondary"
              padding="400"
              borderRadius="200"
            >
              <BlockStack gap="200">
                <Text variant="bodySm" tone="subdued">
                  Traffic
                </Text>
                <Text variant="headingLg" as="h3">
                  {formatPercentage(metrics.trafficIncrease)}
                </Text>
              </BlockStack>
            </Box>
          )}

          {/* Revenue Impact */}
          {metrics.revenueImpact !== undefined && (
            <Box
              background="bg-surface-success-subdued"
              padding="400"
              borderRadius="200"
            >
              <BlockStack gap="200">
                <Text variant="bodySm" tone="subdued">
                  Revenue
                </Text>
                <Text variant="headingLg" as="h3">
                  {formatCurrency(metrics.revenueImpact)}
                </Text>
              </BlockStack>
            </Box>
          )}

          {/* Time to Impact */}
          {metrics.timeToImpact && (
            <Box
              background="bg-surface-secondary"
              padding="400"
              borderRadius="200"
            >
              <BlockStack gap="200">
                <Text variant="bodySm" tone="subdued">
                  Time to Impact
                </Text>
                <Text variant="headingMd" as="h3">
                  {metrics.timeToImpact}
                </Text>
              </BlockStack>
            </Box>
          )}
        </Grid>

        {/* Summary */}
        <Box
          background="bg-surface-info"
          padding="300"
          borderRadius="200"
        >
          <InlineStack gap="200" align="start">
            <Text variant="bodySm">
              📊 Based on similar actions, we predict this will generate{' '}
              {metrics.revenueImpact && <strong>{formatCurrency(metrics.revenueImpact)}</strong>}
              {metrics.revenueImpact && metrics.timeToImpact && ' '}
              {metrics.timeToImpact && <>in <strong>{metrics.timeToImpact}</strong></>}
              .
            </Text>
          </InlineStack>
        </Box>
      </BlockStack>
    </Card>
  );
}


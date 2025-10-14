/**
 * PerformanceOverview Component - P0
 * 
 * Overview cards showing key performance metrics
 * - Total Actions
 * - Approval Rate
 * - Total ROI
 * - Time Saved
 */

import {
  BlockStack,
  Grid,
  Card,
  Text,
  InlineStack,
  Box,
  Icon,
} from '@shopify/polaris';
import { 
  CheckCircleIcon, 
  CashDollarIcon,
  ClockIcon,
  AnalyticsIcon 
} from '@shopify/polaris-icons';

export interface PerformanceOverviewProps {
  overview: {
    totalActions: number;
    approvalRate: number;
    totalROI: number;
    timeSaved: number;
  };
}

export function PerformanceOverview({ overview }: PerformanceOverviewProps) {
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const metrics = [
    {
      title: 'Total Actions',
      value: formatNumber(overview.totalActions),
      icon: AnalyticsIcon,
      tone: 'info' as const,
    },
    {
      title: 'Approval Rate',
      value: `${overview.approvalRate}%`,
      icon: CheckCircleIcon,
      tone: 'success' as const,
    },
    {
      title: 'Total ROI',
      value: formatCurrency(overview.totalROI),
      icon: CashDollarIcon,
      tone: 'success' as const,
    },
    {
      title: 'Time Saved',
      value: `${overview.timeSaved} hrs`,
      icon: ClockIcon,
      tone: 'info' as const,
    },
  ];

  return (
    <Grid columns={{ xs: 1, sm: 2, md: 4, lg: 4, xl: 4 }}>
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <BlockStack gap="300">
            <InlineStack align="space-between" blockAlign="center">
              <Text variant="bodySm" tone="subdued">
                {metric.title}
              </Text>
              <Box
                background={`bg-fill-${metric.tone}` as any}
                padding="200"
                borderRadius="100"
              >
                <Icon source={metric.icon} tone={metric.tone} />
              </Box>
            </InlineStack>

            <Text variant="heading2xl" as="h3">
              {metric.value}
            </Text>

            {/* Trend indicator (optional) */}
            <Text variant="bodySm" tone="success">
              ↑ vs last period
            </Text>
          </BlockStack>
        </Card>
      ))}
    </Grid>
  );
}


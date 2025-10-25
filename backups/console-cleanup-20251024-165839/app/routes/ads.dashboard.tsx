/**
 * Ads Dashboard Route
 * 
 * ADS-006: Production campaign monitoring dashboard
 * Real-time ROAS tracking, alerts, and optimization recommendations
 */

import type { LoaderFunctionArgs } from 'react-router';
import { useLoaderData, useRevalidator } from 'react-router';
import { useEffect } from 'react';
import {
  Page,
  Layout,
  Card,
  Text,
  Badge,
  InlineStack,
  BlockStack,
  Box,
  Banner,
  DataTable,
  ProgressBar,
} from '@shopify/polaris';
import { generateMonitoringDashboard, getCampaignHealthScore, formatAlertNotification, DEFAULT_MONITORING_CONFIG } from '~/services/ads/production-monitoring';
import type { Campaign, CampaignPerformance } from '~/services/ads/types';

// Mock data for demonstration - replace with actual data fetching
const mockCampaigns: Campaign[] = [
  {
    id: 'campaign-1',
    name: 'Summer Sale 2025',
    status: 'ENABLED',
    dailyBudgetCents: 50000,
    targetCpcCents: 100,
  },
  {
    id: 'campaign-2',
    name: 'Brand Awareness',
    status: 'ENABLED',
    dailyBudgetCents: 30000,
    targetCpcCents: 150,
  },
  {
    id: 'campaign-3',
    name: 'Product Launch',
    status: 'ENABLED',
    dailyBudgetCents: 75000,
    targetCpcCents: 200,
  },
];

const mockPerformances: CampaignPerformance[] = [
  {
    campaignId: 'campaign-1',
    campaignName: 'Summer Sale 2025',
    impressions: 50000,
    clicks: 2500,
    costCents: 250000,
    conversions: 125,
    revenueCents: 1000000,
    ctr: 0.05,
    avgCpcCents: 100,
    customerId: 'customer-1',
    dateRange: '2025-10-23',
  },
  {
    campaignId: 'campaign-2',
    campaignName: 'Brand Awareness',
    impressions: 30000,
    clicks: 300,
    costCents: 45000,
    conversions: 15,
    revenueCents: 60000,
    ctr: 0.01,
    avgCpcCents: 150,
    customerId: 'customer-1',
    dateRange: '2025-10-23',
  },
  {
    campaignId: 'campaign-3',
    campaignName: 'Product Launch',
    impressions: 75000,
    clicks: 3750,
    costCents: 750000,
    conversions: 250,
    revenueCents: 2500000,
    ctr: 0.05,
    avgCpcCents: 200,
    customerId: 'customer-1',
    dateRange: '2025-10-23',
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  // TODO: Fetch actual campaign and performance data from database
  const dashboard = generateMonitoringDashboard(
    mockCampaigns,
    mockPerformances,
    DEFAULT_MONITORING_CONFIG
  );

  return Response.json({ dashboard });
}

export default function AdsDashboard() {
  const { dashboard } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      revalidator.revalidate();
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [revalidator]);

  return (
    <Page
      title="Ad Campaign Monitoring"
      subtitle="Real-time performance tracking and optimization"
    >
      <Layout>
        {/* Summary Cards */}
        <Layout.Section>
          <InlineStack gap="400" wrap={false}>
            <Card>
              <BlockStack gap="200">
                <Text variant="headingSm" as="h3" tone="subdued">
                  Total Campaigns
                </Text>
                <Text variant="heading2xl" as="p">
                  {dashboard.summary.totalCampaigns}
                </Text>
                <InlineStack gap="200">
                  <Badge tone="success">{dashboard.summary.healthyCampaigns} Healthy</Badge>
                  <Badge tone="warning">{dashboard.summary.warningCampaigns} Warning</Badge>
                  <Badge tone="critical">{dashboard.summary.criticalCampaigns} Critical</Badge>
                </InlineStack>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="200">
                <Text variant="headingSm" as="h3" tone="subdued">
                  Overall ROAS
                </Text>
                <Text variant="heading2xl" as="p" tone={dashboard.summary.overallROAS >= 2.0 ? 'success' : 'critical'}>
                  {dashboard.summary.overallROAS.toFixed(2)}x
                </Text>
                <Text variant="bodySm" as="p" tone="subdued">
                  ${dashboard.summary.totalRevenue.toFixed(2)} / ${dashboard.summary.totalSpend.toFixed(2)}
                </Text>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="200">
                <Text variant="headingSm" as="h3" tone="subdued">
                  Active Alerts
                </Text>
                <Text variant="heading2xl" as="p" tone={dashboard.summary.activeAlerts > 0 ? 'warning' : 'success'}>
                  {dashboard.summary.activeAlerts}
                </Text>
                <Text variant="bodySm" as="p" tone="subdued">
                  {dashboard.summary.pendingRecommendations} recommendations
                </Text>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="200">
                <Text variant="headingSm" as="h3" tone="subdued">
                  Total Spend
                </Text>
                <Text variant="heading2xl" as="p">
                  ${dashboard.summary.totalSpend.toFixed(2)}
                </Text>
                <Text variant="bodySm" as="p" tone="subdued">
                  Revenue: ${dashboard.summary.totalRevenue.toFixed(2)}
                </Text>
              </BlockStack>
            </Card>
          </InlineStack>
        </Layout.Section>

        {/* Recent Alerts */}
        {dashboard.recentAlerts.length > 0 && (
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Recent Alerts
                </Text>
                {dashboard.recentAlerts.map((alert, index) => (
                  <Banner
                    key={index}
                    tone={alert.severity === 'high' ? 'critical' : 'warning'}
                  >
                    <Text variant="bodyMd" as="p">
                      {formatAlertNotification(alert)}
                    </Text>
                  </Banner>
                ))}
              </BlockStack>
            </Card>
          </Layout.Section>
        )}

        {/* Campaign Performance Table */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">
                Campaign Performance
              </Text>
              <DataTable
                columnContentTypes={['text', 'text', 'numeric', 'numeric', 'numeric', 'numeric', 'text']}
                headings={['Campaign', 'Status', 'ROAS', 'Spend', 'Revenue', 'Health', 'Alerts']}
                rows={dashboard.campaigns.map(campaign => {
                  const healthScore = getCampaignHealthScore(campaign);
                  return [
                    campaign.campaignName,
                    <Badge
                      key="status"
                      tone={
                        campaign.status === 'healthy' ? 'success' :
                        campaign.status === 'warning' ? 'warning' :
                        campaign.status === 'critical' ? 'critical' :
                        'info'
                      }
                    >
                      {campaign.status}
                    </Badge>,
                    campaign.currentROAS !== null ? `${campaign.currentROAS.toFixed(2)}x` : 'N/A',
                    `$${campaign.metrics.spend.toFixed(2)}`,
                    `$${campaign.metrics.revenue.toFixed(2)}`,
                    <Box key="health">
                      <Text variant="bodySm" as="p">{healthScore.toFixed(0)}%</Text>
                      <ProgressBar
                        progress={healthScore}
                        tone={healthScore >= 80 ? 'success' : healthScore >= 60 ? 'primary' : 'critical'}
                        size="small"
                      />
                    </Box>,
                    campaign.alerts.length > 0 ? (
                      <Badge key="alerts" tone="warning">
                        {campaign.alerts.length} alert{campaign.alerts.length > 1 ? 's' : ''}
                      </Badge>
                    ) : (
                      <Text key="alerts" variant="bodySm" as="span" tone="subdued">
                        None
                      </Text>
                    ),
                  ];
                })}
              />
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Top Recommendations */}
        {dashboard.topRecommendations.length > 0 && (
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Top Optimization Recommendations
                </Text>
                {dashboard.topRecommendations.slice(0, 5).map((rec, index) => (
                  <Card key={index}>
                    <BlockStack gap="200">
                      <InlineStack align="space-between" blockAlign="center">
                        <Text variant="bodyMd" as="p" fontWeight="semibold">
                          {rec.campaignName}
                        </Text>
                        <Badge tone={rec.severity === 'high' ? 'critical' : rec.severity === 'medium' ? 'warning' : 'info'}>
                          {rec.severity} priority
                        </Badge>
                      </InlineStack>
                      <Text variant="bodySm" as="p">
                        {rec.reason}
                      </Text>
                      <Text variant="bodySm" as="p" tone="subdued">
                        Action: {rec.type.replace(/_/g, ' ')}
                      </Text>
                    </BlockStack>
                  </Card>
                ))}
              </BlockStack>
            </Card>
          </Layout.Section>
        )}

        {/* Last Updated */}
        <Layout.Section>
          <Text variant="bodySm" as="p" tone="subdued" alignment="end">
            Last updated: {new Date(dashboard.lastUpdated).toLocaleString()}
          </Text>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

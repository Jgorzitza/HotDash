/**
 * Campaign Performance Dashboard
 * 
 * Purpose: Visual dashboard for all advertising campaigns
 * Owner: ads agent
 * Date: 2025-10-15
 */


import { useLoaderData } from 'react-router';
import { Page, Layout, Card, Text, BlockStack, InlineStack, Badge, DataTable } from '@shopify/polaris';
import type { CampaignMetrics, AggregatedPerformance } from '../lib/ads/tracking';
import { calculateCampaignPerformance, aggregateCampaignPerformance } from '../lib/ads/tracking';

export async function loader({ request }: any) {
  // TODO: Replace with real API call
  const mockCampaigns: CampaignMetrics[] = [
    {
      campaignId: 'meta_001',
      campaignName: 'Fall Collection - Meta',
      platform: 'meta',
      status: 'active',
      adSpend: 500,
      revenue: 2000,
      impressions: 50000,
      clicks: 500,
      conversions: 40,
      dateStart: '2025-10-01',
      dateEnd: '2025-10-15',
    },
    {
      campaignId: 'google_001',
      campaignName: 'Search - Hot Sauce',
      platform: 'google',
      status: 'active',
      adSpend: 750,
      revenue: 3750,
      impressions: 100000,
      clicks: 1000,
      conversions: 75,
      dateStart: '2025-10-01',
      dateEnd: '2025-10-15',
    },
    {
      campaignId: 'tiktok_001',
      campaignName: 'Brand Awareness - TikTok',
      platform: 'tiktok',
      status: 'active',
      adSpend: 400,
      revenue: 1200,
      impressions: 200000,
      clicks: 2000,
      conversions: 24,
      dateStart: '2025-10-01',
      dateEnd: '2025-10-15',
    },
  ];

  const campaignsWithPerformance = mockCampaigns.map(calculateCampaignPerformance);
  const aggregated = aggregateCampaignPerformance(mockCampaigns);

  return Response.json({ campaigns: campaignsWithPerformance, aggregated });
}

export default function AdsDashboard() {
  const { campaigns, aggregated } = useLoaderData<typeof loader>();

  return (
    <Page title="Campaign Performance Dashboard" subtitle="Monitor and optimize your advertising campaigns">
      <Layout>
        <Layout.Section>
          <InlineStack gap="400">
            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">Total Ad Spend</Text>
                <Text as="p" variant="heading2xl">${aggregated.totalAdSpend.toLocaleString()}</Text>
                <Text as="p" variant="bodySm" tone="subdued">Across {aggregated.totalCampaigns} campaigns</Text>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">Total Revenue</Text>
                <Text as="p" variant="heading2xl">${aggregated.totalRevenue.toLocaleString()}</Text>
                <Text as="p" variant="bodySm" tone="subdued">{aggregated.totalConversions} conversions</Text>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">Average ROAS</Text>
                <Text as="p" variant="heading2xl">{aggregated.aggregatedRoas.toFixed(2)}x</Text>
                <Badge tone={aggregated.aggregatedRoas >= 3.0 ? 'success' : 'warning'}>
                  {aggregated.aggregatedRoas >= 3.0 ? 'Good' : 'Needs Improvement'}
                </Badge>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">Average CPA</Text>
                <Text as="p" variant="heading2xl">${aggregated.averageCpa.toFixed(2)}</Text>
                <Text as="p" variant="bodySm" tone="subdued">Cost per acquisition</Text>
              </BlockStack>
            </Card>
          </InlineStack>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingLg">Performance by Platform</Text>
              <DataTable
                columnContentTypes={['text', 'numeric', 'numeric', 'numeric', 'numeric', 'numeric']}
                headings={['Platform', 'Campaigns', 'Ad Spend', 'Revenue', 'ROAS', 'CPA']}
                rows={Object.entries(aggregated.byPlatform).map(([platform, data]) => [
                  platform.charAt(0).toUpperCase() + platform.slice(1),
                  data.campaigns.toString(),
                  `$${data.adSpend.toLocaleString()}`,
                  `$${data.revenue.toLocaleString()}`,
                  `${data.roas.toFixed(2)}x`,
                  `$${data.cpa.toFixed(2)}`,
                ])}
              />
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingLg">Campaign Details</Text>
              <DataTable
                columnContentTypes={['text', 'text', 'text', 'numeric', 'numeric', 'numeric', 'numeric', 'numeric', 'numeric']}
                headings={['Campaign', 'Platform', 'Status', 'Ad Spend', 'Revenue', 'ROAS', 'CPC', 'CPM', 'CPA']}
                rows={campaigns.map(campaign => [
                  campaign.campaignName,
                  campaign.platform.charAt(0).toUpperCase() + campaign.platform.slice(1),
                  campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1),
                  `$${campaign.adSpend.toLocaleString()}`,
                  `$${campaign.revenue.toLocaleString()}`,
                  `${campaign.roas.toFixed(2)}x`,
                  `$${campaign.cpc.toFixed(2)}`,
                  `$${campaign.cpm.toFixed(2)}`,
                  `$${campaign.cpa.toFixed(2)}`,
                ])}
              />
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <InlineStack gap="400">
            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">Total Impressions</Text>
                <Text as="p" variant="headingXl">{aggregated.totalImpressions.toLocaleString()}</Text>
                <Text as="p" variant="bodySm" tone="subdued">CTR: {aggregated.aggregatedCtr.toFixed(2)}%</Text>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">Total Clicks</Text>
                <Text as="p" variant="headingXl">{aggregated.totalClicks.toLocaleString()}</Text>
                <Text as="p" variant="bodySm" tone="subdued">Avg CPC: ${aggregated.averageCpc.toFixed(2)}</Text>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">Conversion Rate</Text>
                <Text as="p" variant="headingXl">{aggregated.aggregatedConversionRate.toFixed(2)}%</Text>
                <Text as="p" variant="bodySm" tone="subdued">{aggregated.totalConversions} total conversions</Text>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">Average CPM</Text>
                <Text as="p" variant="headingXl">${aggregated.averageCpm.toFixed(2)}</Text>
                <Text as="p" variant="bodySm" tone="subdued">Cost per 1000 impressions</Text>
              </BlockStack>
            </Card>
          </InlineStack>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <Text as="p" variant="bodySm" tone="subdued">
              Data from {aggregated.dateStart} to {aggregated.dateEnd}
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              Last updated: {new Date(aggregated.calculatedAt).toLocaleString()}
            </Text>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}


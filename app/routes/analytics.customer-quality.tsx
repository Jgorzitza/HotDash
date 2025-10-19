/**
 * Customer Quality Analytics Dashboard — Visualize quality trends
 *
 * Analytics page for deep-dive into customer reply quality:
 * - Quality score trends over time
 * - Approval rate tracking
 * - Edit distance visualization
 * - Top issues and recommendations
 */

import { useLoaderData } from "react-router";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  InlineStack,
  Badge,
} from "@shopify/polaris";
import { EditDistanceChart } from "~/components/visualizations/EditDistanceChart";
import type { ResponseQualityMetrics } from "~/lib/metrics/customer-reply-quality";

interface AnalyticsData {
  current: ResponseQualityMetrics;
  historical: Array<{
    date: string;
    avgTone: number;
    avgAccuracy: number;
    avgPolicy: number;
    approvalRate: number;
    editDistance: number;
  }>;
  editDistanceData: Array<{
    date: string;
    avgEditDistance: number;
    count: number;
  }>;
}

export async function loader() {
  // TODO: Fetch from Supabase quality metrics
  const mockData: AnalyticsData = {
    current: {
      totalReplies: 500,
      aiDraftedCount: 450,
      aiDraftedPercentage: 90,
      avgTone: 4.6,
      avgAccuracy: 4.7,
      avgPolicy: 4.8,
      avgOverall: 4.7,
      approvalRate: 88,
      avgEditDistance: 28,
      startDate: "2025-10-01",
      endDate: "2025-10-19",
    },
    historical: [],
    editDistanceData: [],
  };

  return mockData;
}

export default function CustomerQualityAnalytics() {
  const data = useLoaderData<typeof loader>();

  const getScoreBadge = (score: number) => {
    if (score >= 4.5) return { text: "Excellent", tone: "success" as const };
    if (score >= 4.0) return { text: "Good", tone: "success" as const };
    if (score >= 3.5) return { text: "Fair", tone: "attention" as const };
    return { text: "Needs Work", tone: "critical" as const };
  };

  return (
    <Page
      title="Customer Reply Quality Analytics"
      subtitle={`${data.current.startDate} to ${data.current.endDate}`}
    >
      <Layout>
        {/* Overview Cards */}
        <Layout.Section>
          <InlineStack gap="400">
            <Card>
              <BlockStack gap="200">
                <Text as="p" variant="bodySm" tone="subdued">
                  AI Drafted
                </Text>
                <Text as="h2" variant="heading2xl">
                  {data.current.aiDraftedPercentage.toFixed(0)}%
                </Text>
                <Text as="p" variant="bodySm">
                  {data.current.aiDraftedCount} of {data.current.totalReplies}{" "}
                  replies
                </Text>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="200">
                <InlineStack align="space-between">
                  <Text as="p" variant="bodySm" tone="subdued">
                    Quality Score
                  </Text>
                  <Badge tone={getScoreBadge(data.current.avgOverall).tone}>
                    {getScoreBadge(data.current.avgOverall).text}
                  </Badge>
                </InlineStack>
                <Text as="h2" variant="heading2xl">
                  {data.current.avgOverall.toFixed(1)}
                </Text>
                <Text as="p" variant="bodySm">
                  Target: ≥4.5 / 5.0
                </Text>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="200">
                <Text as="p" variant="bodySm" tone="subdued">
                  Approval Rate
                </Text>
                <Text as="h2" variant="heading2xl">
                  {data.current.approvalRate.toFixed(0)}%
                </Text>
                <Text as="p" variant="bodySm">
                  Target: ≥85%
                </Text>
              </BlockStack>
            </Card>
          </InlineStack>
        </Layout.Section>

        {/* Quality Breakdown */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h3" variant="headingMd">
                Quality Score Breakdown
              </Text>

              <InlineStack gap="400">
                <BlockStack gap="200">
                  <Text as="p" variant="bodySm" tone="subdued">
                    Tone
                  </Text>
                  <Text as="h3" variant="headingLg">
                    {data.current.avgTone.toFixed(1)}
                  </Text>
                  <Badge tone={getScoreBadge(data.current.avgTone).tone}>
                    {getScoreBadge(data.current.avgTone).text}
                  </Badge>
                </BlockStack>

                <BlockStack gap="200">
                  <Text as="p" variant="bodySm" tone="subdued">
                    Accuracy
                  </Text>
                  <Text as="h3" variant="headingLg">
                    {data.current.avgAccuracy.toFixed(1)}
                  </Text>
                  <Badge tone={getScoreBadge(data.current.avgAccuracy).tone}>
                    {getScoreBadge(data.current.avgAccuracy).text}
                  </Badge>
                </BlockStack>

                <BlockStack gap="200">
                  <Text as="p" variant="bodySm" tone="subdued">
                    Policy
                  </Text>
                  <Text as="h3" variant="headingLg">
                    {data.current.avgPolicy.toFixed(1)}
                  </Text>
                  <Badge tone={getScoreBadge(data.current.avgPolicy).tone}>
                    {getScoreBadge(data.current.avgPolicy).text}
                  </Badge>
                </BlockStack>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Edit Distance Trends */}
        {data.editDistanceData.length > 0 && (
          <Layout.Section>
            <Card>
              <EditDistanceChart data={data.editDistanceData} />
            </Card>
          </Layout.Section>
        )}

        {/* Recommendations */}
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as="h3" variant="headingMd">
                Recommendations
              </Text>

              <BlockStack gap="200">
                {data.current.avgTone < 4.5 && (
                  <Text as="p" variant="bodyMd">
                    • Review brand voice guidelines - tone below target
                  </Text>
                )}
                {data.current.avgAccuracy < 4.7 && (
                  <Text as="p" variant="bodyMd">
                    • Update knowledge base - accuracy below target
                  </Text>
                )}
                {data.current.avgPolicy < 4.8 && (
                  <Text as="p" variant="bodyMd">
                    • Strengthen policy constraints - compliance below target
                  </Text>
                )}
                {data.current.approvalRate < 85 && (
                  <Text as="p" variant="bodyMd">
                    • Analyze rejection patterns - approval rate below target
                  </Text>
                )}
                {data.current.avgEditDistance > 50 && (
                  <Text as="p" variant="bodyMd">
                    • High edit distance - drafts need significant revision
                  </Text>
                )}
                {data.current.avgOverall >= 4.5 &&
                  data.current.approvalRate >= 85 &&
                  data.current.avgEditDistance <= 50 && (
                    <Text as="p" variant="bodyMd">
                      ✓ All metrics meet targets - excellent performance!
                    </Text>
                  )}
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

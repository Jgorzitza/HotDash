import { useLoaderData } from "react-router";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  InlineStack,
  Text,
  Badge,
  ProgressBar,
  Banner,
  DataTable,
} from "@shopify/polaris";

/**
 * Draft A/B Testing Framework — Test prompt variations
 *
 * Enables data-driven optimization of draft generation by:
 * - Testing different prompt templates
 * - Comparing RAG retrieval strategies
 * - Measuring quality impact
 */

export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  promptTemplate?: string;
  ragStrategy?: "vector" | "hybrid" | "summary";
  temperature?: number; // LLM temperature
  enabled: boolean;
}

export interface ABTestResult {
  variantId: string;
  conversationId: string;
  draftReply: string;
  grading?: {
    tone: number;
    accuracy: number;
    policy: number;
  };
  approved: boolean;
  editDistance?: number;
  latencySeconds?: number;
}

export interface ABTestAnalysis {
  variantA: {
    id: string;
    name: string;
    avgQuality: number;
    approvalRate: number;
    avgEditDistance: number;
    sampleSize: number;
  };
  variantB: {
    id: string;
    name: string;
    avgQuality: number;
    approvalRate: number;
    avgEditDistance: number;
    sampleSize: number;
  };
  winner?: "A" | "B" | "tie";
  confidence: number; // 0-1, statistical confidence
  recommendation: string;
}

/**
 * Assign conversation to variant (50/50 split)
 */
export function assignVariant(
  conversationId: string,
  variants: [ABTestVariant, ABTestVariant],
): ABTestVariant {
  // Simple hash-based assignment for consistency
  const hash = conversationId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return variants[hash % 2];
}

/**
 * Calculate average quality score
 */
function calculateAvgQuality(results: ABTestResult[]): number {
  if (results.length === 0) return 0;

  const withGrading = results.filter((r) => r.grading);
  if (withGrading.length === 0) return 0;

  const sum = withGrading.reduce((acc, r) => {
    if (!r.grading) return acc;
    return acc + (r.grading.tone + r.grading.accuracy + r.grading.policy) / 3;
  }, 0);

  return sum / withGrading.length;
}

/**
 * Calculate approval rate
 */
function calculateApprovalRate(results: ABTestResult[]): number {
  if (results.length === 0) return 0;
  const approved = results.filter((r) => r.approved).length;
  return approved / results.length;
}

/**
 * Calculate average edit distance
 */
function calculateAvgEditDistance(results: ABTestResult[]): number {
  if (results.length === 0) return 0;

  const withDistance = results.filter((r) => r.editDistance !== undefined);
  if (withDistance.length === 0) return 0;

  const sum = withDistance.reduce((acc, r) => acc + (r.editDistance || 0), 0);
  return sum / withDistance.length;
}

/**
 * Analyze A/B test results
 */
export function analyzeABTest(
  variantA: ABTestVariant,
  variantB: ABTestVariant,
  resultsA: ABTestResult[],
  resultsB: ABTestResult[],
): ABTestAnalysis {
  const statsA = {
    id: variantA.id,
    name: variantA.name,
    avgQuality: calculateAvgQuality(resultsA),
    approvalRate: calculateApprovalRate(resultsA),
    avgEditDistance: calculateAvgEditDistance(resultsA),
    sampleSize: resultsA.length,
  };

  const statsB = {
    id: variantB.id,
    name: variantB.name,
    avgQuality: calculateAvgQuality(resultsB),
    approvalRate: calculateApprovalRate(resultsB),
    avgEditDistance: calculateAvgEditDistance(resultsB),
    sampleSize: resultsB.length,
  };

  // Determine winner (simplified - real implementation should use statistical tests)
  let winner: "A" | "B" | "tie" | undefined = undefined;
  let recommendation = "Insufficient data for recommendation";

  // Require minimum sample size
  if (statsA.sampleSize >= 30 && statsB.sampleSize >= 30) {
    const qualityDiff = statsA.avgQuality - statsB.avgQuality;
    const approvalDiff = statsA.approvalRate - statsB.approvalRate;

    // Significant difference threshold: 0.3 points on quality or 10% on approval
    if (Math.abs(qualityDiff) > 0.3 || Math.abs(approvalDiff) > 0.1) {
      winner = qualityDiff > 0 ? "A" : "B";
      recommendation = `Variant ${winner} shows better performance. Consider making it the default.`;
    } else {
      winner = "tie";
      recommendation =
        "No significant difference detected. Both variants perform similarly.";
    }
  } else {
    recommendation = `Need more data. Current samples: A=${statsA.sampleSize}, B=${statsB.sampleSize}. Target: 30+ each.`;
  }

  // Confidence based on sample size
  const minSampleSize = Math.min(statsA.sampleSize, statsB.sampleSize);
  const confidence = Math.min(0.95, minSampleSize / 50);

  return {
    variantA: statsA,
    variantB: statsB,
    winner,
    confidence,
    recommendation,
  };
}

export async function loader() {
  // TODO: Fetch from Supabase
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
    editDistanceData: [
      { date: "2025-10-19", avgEditDistance: 25, count: 30 },
      { date: "2025-10-18", avgEditDistance: 28, count: 32 },
      { date: "2025-10-17", avgEditDistance: 30, count: 28 },
    ],
  };

  return mockData;
}

export default function CustomerQualityAnalytics() {
  const data = useLoaderData<typeof loader>();

  return (
    <Page
      title="Customer Reply Quality"
      subtitle="Deep-dive analytics and trends"
      backAction={{ url: "/app" }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingLg">
                Current Performance
              </Text>
              <InlineStack gap="400">
                <BlockStack gap="100">
                  <Text as="p" variant="bodySm" tone="subdued">
                    Overall Quality
                  </Text>
                  <Text as="h3" variant="heading2xl">
                    {data.current.avgOverall.toFixed(1)}
                  </Text>
                  <Text as="p" variant="bodySm">
                    / 5.0
                  </Text>
                </BlockStack>

                <BlockStack gap="100">
                  <Text as="p" variant="bodySm" tone="subdued">
                    Approval Rate
                  </Text>
                  <Text as="h3" variant="heading2xl">
                    {data.current.approvalRate.toFixed(0)}%
                  </Text>
                </BlockStack>

                <BlockStack gap="100">
                  <Text as="p" variant="bodySm" tone="subdued">
                    Avg Edit Distance
                  </Text>
                  <Text as="h3" variant="heading2xl">
                    {data.current.avgEditDistance.toFixed(0)}
                  </Text>
                  <Text as="p" variant="bodySm">
                    characters
                  </Text>
                </BlockStack>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

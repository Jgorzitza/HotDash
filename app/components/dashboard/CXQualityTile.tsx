/**
 * CX Quality Tile — Display avg grades, draft acceptance rate, human edit %
 *
 * Per AIC-007 spec: Show quality metrics for customer support AI drafting
 */

import { Card, BlockStack, InlineStack, Text, Badge } from "@shopify/polaris";

export interface CXQualityMetrics {
  avgGrades: {
    tone: number; // 1-5
    accuracy: number; // 1-5
    policy: number; // 1-5
  };
  draftAcceptanceRate: number; // 0-100%
  humanEditPct: number; // 0-100% (how many drafts needed editing)
  totalDrafts: number;
}

export interface CXQualityTileProps {
  metrics: CXQualityMetrics;
  loading?: boolean;
}

export function CXQualityTile({
  metrics,
  loading = false,
}: CXQualityTileProps) {
  const avgOverall =
    (metrics.avgGrades.tone +
      metrics.avgGrades.accuracy +
      metrics.avgGrades.policy) /
    3;

  const qualityBadge = () => {
    if (avgOverall >= 4.5) return <Badge tone="success">Excellent</Badge>;
    if (avgOverall >= 4.0) return <Badge tone="success">Good</Badge>;
    if (avgOverall >= 3.5) return <Badge tone="attention">Fair</Badge>;
    return <Badge tone="critical">Needs Work</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <BlockStack gap="300">
          <Text as="h2" variant="headingMd">
            CX Quality
          </Text>
          <Text as="p" variant="bodyMd">
            Loading...
          </Text>
        </BlockStack>
      </Card>
    );
  }

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between" blockAlign="center">
          <Text as="h2" variant="headingMd">
            CX Quality
          </Text>
          {qualityBadge()}
        </InlineStack>

        {/* Average Grades */}
        <BlockStack gap="200">
          <Text as="p" variant="bodySm" tone="subdued">
            Average Grades
          </Text>
          <BlockStack gap="100">
            <InlineStack align="space-between">
              <Text as="span" variant="bodyMd">
                Tone
              </Text>
              <Text as="span" variant="bodyMd" fontWeight="semibold">
                {metrics.avgGrades.tone.toFixed(1)} / 5.0
              </Text>
            </InlineStack>
            <InlineStack align="space-between">
              <Text as="span" variant="bodyMd">
                Accuracy
              </Text>
              <Text as="span" variant="bodyMd" fontWeight="semibold">
                {metrics.avgGrades.accuracy.toFixed(1)} / 5.0
              </Text>
            </InlineStack>
            <InlineStack align="space-between">
              <Text as="span" variant="bodyMd">
                Policy
              </Text>
              <Text as="span" variant="bodyMd" fontWeight="semibold">
                {metrics.avgGrades.policy.toFixed(1)} / 5.0
              </Text>
            </InlineStack>
          </BlockStack>
        </BlockStack>

        {/* Acceptance Rate */}
        <InlineStack align="space-between" blockAlign="start">
          <BlockStack gap="100">
            <Text as="p" variant="bodySm" tone="subdued">
              Draft Acceptance Rate
            </Text>
            <Text as="h3" variant="headingLg">
              {metrics.draftAcceptanceRate.toFixed(0)}%
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              {metrics.totalDrafts} total drafts
            </Text>
          </BlockStack>

          <BlockStack gap="100">
            <Text as="p" variant="bodySm" tone="subdued">
              Human Edit %
            </Text>
            <Text as="h3" variant="headingLg">
              {metrics.humanEditPct.toFixed(0)}%
            </Text>
          </BlockStack>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}

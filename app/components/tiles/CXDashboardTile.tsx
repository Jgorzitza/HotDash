/**
 * CX Dashboard Tile — Customer support queue and metrics
 *
 * Displays:
 * - Queue size (open conversations)
 * - Average response time
 * - SLA status (<15 min target)
 * - Average quality grades
 */

import { Card, BlockStack, InlineStack, Text, Badge } from "@shopify/polaris";

export interface CXMetrics {
  queueSize: number;
  avgResponseTimeMinutes: number;
  slaCompliance: number; // 0-100%
  slaBreaches: number;
  avgGrades: {
    tone: number; // 1-5
    accuracy: number; // 1-5
    policy: number; // 1-5
  };
  aiDraftedPct: number; // 0-100%
}

export interface CXDashboardTileProps {
  metrics: CXMetrics;
  loading?: boolean;
  onViewQueue?: () => void;
}

export function CXDashboardTile({
  metrics,
  loading = false,
  onViewQueue,
}: CXDashboardTileProps) {
  const slaBadge = () => {
    if (metrics.slaCompliance >= 95) {
      return <Badge tone="success">On Track</Badge>;
    }
    if (metrics.slaCompliance >= 85) {
      return <Badge tone="attention">At Risk</Badge>;
    }
    return <Badge tone="critical">{metrics.slaBreaches} Breaches</Badge>;
  };

  const qualityBadge = () => {
    const avgQuality =
      (metrics.avgGrades.tone +
        metrics.avgGrades.accuracy +
        metrics.avgGrades.policy) /
      3;

    if (avgQuality >= 4.5) {
      return <Badge tone="success">Excellent</Badge>;
    }
    if (avgQuality >= 4.0) {
      return <Badge tone="success">Good</Badge>;
    }
    if (avgQuality >= 3.5) {
      return <Badge tone="attention">Fair</Badge>;
    }
    return <Badge tone="critical">Needs Work</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <BlockStack gap="300">
          <Text as="h2" variant="headingMd">
            Customer Support
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
            Customer Support
          </Text>
          {slaBadge()}
        </InlineStack>

        {/* Queue Size */}
        <InlineStack align="space-between" blockAlign="start">
          <BlockStack gap="100">
            <Text as="p" variant="bodySm" tone="subdued">
              Queue Size
            </Text>
            <Text as="h3" variant="headingLg">
              {metrics.queueSize}
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              open conversations
            </Text>
          </BlockStack>

          {onViewQueue && metrics.queueSize > 0 && (
            <Text as="span">
              <button
                onClick={onViewQueue}
                style={{
                  background: "none",
                  border: "none",
                  color: "#005BD3",
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontSize: "14px",
                }}
              >
                View Queue →
              </button>
            </Text>
          )}
        </InlineStack>

        {/* Response Time */}
        <InlineStack align="space-between">
          <BlockStack gap="100">
            <Text as="p" variant="bodySm" tone="subdued">
              Avg Response Time
            </Text>
            <Text as="h3" variant="headingLg">
              {metrics.avgResponseTimeMinutes}m
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              target: ≤15 min
            </Text>
          </BlockStack>

          <BlockStack gap="100">
            <Text as="p" variant="bodySm" tone="subdued">
              AI Drafted
            </Text>
            <Text as="h3" variant="headingLg">
              {metrics.aiDraftedPct.toFixed(0)}%
            </Text>
          </BlockStack>
        </InlineStack>

        {/* Quality Grades */}
        <InlineStack align="space-between" blockAlign="center">
          <BlockStack gap="100">
            <Text as="p" variant="bodySm" tone="subdued">
              Quality Score
            </Text>
            <InlineStack gap="200" blockAlign="center">
              <Text as="span" variant="bodyMd">
                T: {metrics.avgGrades.tone.toFixed(1)}
              </Text>
              <Text as="span" variant="bodyMd">
                A: {metrics.avgGrades.accuracy.toFixed(1)}
              </Text>
              <Text as="span" variant="bodyMd">
                P: {metrics.avgGrades.policy.toFixed(1)}
              </Text>
            </InlineStack>
          </BlockStack>
          {qualityBadge()}
        </InlineStack>
      </BlockStack>
    </Card>
  );
}

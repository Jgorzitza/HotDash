/**
 * Edit Distance Chart — Visualize draft quality trends
 *
 * Shows edit distance distribution and trends over time.
 * Helps CEO understand how much human editing is required.
 */

import { BlockStack, InlineStack, Text, Badge } from "@shopify/polaris";

export interface EditDistanceDataPoint {
  date: string; // YYYY-MM-DD
  avgEditDistance: number;
  count: number;
}

export interface EditDistanceChartProps {
  data: EditDistanceDataPoint[];
  title?: string;
}

export function EditDistanceChart({
  data,
  title = "Draft Edit Distance Trends",
}: EditDistanceChartProps) {
  if (data.length === 0) {
    return (
      <BlockStack gap="200">
        <Text as="h3" variant="headingMd">
          {title}
        </Text>
        <Text as="p" variant="bodyMd" tone="subdued">
          No data available
        </Text>
      </BlockStack>
    );
  }

  // Calculate overall stats
  const totalEdits = data.reduce((sum, d) => sum + d.count, 0);
  const weightedSum = data.reduce(
    (sum, d) => sum + d.avgEditDistance * d.count,
    0,
  );
  const overallAvg = weightedSum / totalEdits;

  // Find max for scaling
  const maxDistance = Math.max(...data.map((d) => d.avgEditDistance));
  const scale = 100 / maxDistance; // Scale to 100px height

  // Determine trend
  const recentAvg =
    data.slice(0, 7).reduce((sum, d) => sum + d.avgEditDistance, 0) /
    Math.min(7, data.length);
  const olderAvg =
    data.slice(7, 14).reduce((sum, d) => sum + d.avgEditDistance, 0) /
    Math.min(7, data.length - 7);
  const trend =
    recentAvg < olderAvg
      ? "improving"
      : recentAvg > olderAvg
        ? "declining"
        : "stable";

  const interpretDistance = (
    distance: number,
  ): { label: string; tone: "success" | "attention" | "critical" } => {
    if (distance < 20) return { label: "Excellent", tone: "success" };
    if (distance < 50) return { label: "Good", tone: "success" };
    if (distance < 100) return { label: "Fair", tone: "attention" };
    return { label: "Needs Improvement", tone: "critical" };
  };

  const overallStatus = interpretDistance(overallAvg);

  return (
    <BlockStack gap="400">
      {/* Header */}
      <InlineStack align="space-between" blockAlign="center">
        <Text as="h3" variant="headingMd">
          {title}
        </Text>
        <Badge tone={overallStatus.tone}>{overallStatus.label}</Badge>
      </InlineStack>

      {/* Summary Stats */}
      <InlineStack gap="400">
        <BlockStack gap="100">
          <Text as="p" variant="bodySm" tone="subdued">
            Average Edit Distance
          </Text>
          <Text as="p" variant="headingLg">
            {Math.round(overallAvg)}
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            characters changed
          </Text>
        </BlockStack>

        <BlockStack gap="100">
          <Text as="p" variant="bodySm" tone="subdued">
            Total Drafts
          </Text>
          <Text as="p" variant="headingLg">
            {totalEdits}
          </Text>
        </BlockStack>

        <BlockStack gap="100">
          <Text as="p" variant="bodySm" tone="subdued">
            Trend (7d)
          </Text>
          <Text as="p" variant="bodyMd" fontWeight="semibold">
            {trend === "improving"
              ? "↓ Improving"
              : trend === "declining"
                ? "↑ Declining"
                : "→ Stable"}
          </Text>
        </BlockStack>
      </InlineStack>

      {/* Simple Bar Chart */}
      <BlockStack gap="200">
        <Text as="p" variant="bodySm" fontWeight="semibold">
          Daily Edit Distance (Last {data.length} days)
        </Text>
        <BlockStack gap="100">
          {data.slice(0, 14).map((point, idx) => {
            const height = Math.max(2, point.avgEditDistance * scale);
            const status = interpretDistance(point.avgEditDistance);

            return (
              <InlineStack key={idx} gap="200" blockAlign="center">
                <div
                  style={{ width: "80px", fontSize: "12px", color: "#6B7280" }}
                >
                  {point.date}
                </div>
                <div
                  style={{
                    width: `${height}%`,
                    height: "20px",
                    backgroundColor:
                      status.tone === "success"
                        ? "#22C55E"
                        : status.tone === "attention"
                          ? "#F59E0B"
                          : "#EF4444",
                    borderRadius: "4px",
                    minWidth: "2px",
                  }}
                />
                <Text as="p" variant="bodySm">
                  {Math.round(point.avgEditDistance)} ({point.count} drafts)
                </Text>
              </InlineStack>
            );
          })}
        </BlockStack>
      </BlockStack>

      {/* Insights */}
      <BlockStack gap="100">
        <Text as="p" variant="bodySm" fontWeight="semibold">
          Insights
        </Text>
        <Text as="p" variant="bodySm" tone="subdued">
          {overallAvg < 20 && "Excellent! Drafts require minimal editing."}
          {overallAvg >= 20 &&
            overallAvg < 50 &&
            "Good quality drafts. Some refinement needed."}
          {overallAvg >= 50 &&
            overallAvg < 100 &&
            "Moderate editing required. Consider reviewing RAG knowledge base."}
          {overallAvg >= 100 &&
            "Significant editing needed. Review prompt templates and knowledge base coverage."}
        </Text>
      </BlockStack>
    </BlockStack>
  );
}

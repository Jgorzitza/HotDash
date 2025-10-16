import { Card, BlockStack, Text, InlineStack, Badge, Spinner, Tooltip } from "@shopify/polaris";

interface DataPoint {
  date: string;
  value: number;
}

interface RevenueTileEnhancedProps {
  value: string;
  orderCount: number;
  trend: "up" | "down" | "neutral";
  sparklineData: DataPoint[];
  anomalies?: Array<{ date: string; reason: string }>;
  loading?: boolean;
}

export function RevenueTileEnhanced({ value, orderCount, trend, sparklineData, anomalies, loading }: RevenueTileEnhancedProps) {
  if (loading) {
    return (
      <Card>
        <BlockStack gap="400" align="center">
          <Spinner size="small" />
          <Text as="p" tone="subdued">Loading...</Text>
        </BlockStack>
      </Card>
    );
  }

  const max = Math.max(...sparklineData.map(d => d.value));
  const min = Math.min(...sparklineData.map(d => d.value));
  const range = max - min;

  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h3" variant="headingMd">Revenue</Text>
        <BlockStack gap="200">
          <Text as="h2" variant="heading2xl">{value}</Text>
          <InlineStack gap="200" align="start" blockAlign="center">
            <Text as="p" tone="subdued">{orderCount} orders today</Text>
            {trend !== "neutral" && (
              <Badge tone={trend === "up" ? "success" : "critical"}>
                {trend === "up" ? "↑" : "↓"}
              </Badge>
            )}
          </InlineStack>
          
          <svg width="100%" height="40" style={{ marginTop: "8px" }}>
            <polyline
              fill="none"
              stroke="#008060"
              strokeWidth="2"
              points={sparklineData.map((d, i) => {
                const x = (i / (sparklineData.length - 1)) * 100;
                const y = 40 - ((d.value - min) / range) * 35;
                return `${x}%,${y}`;
              }).join(" ")}
            />
          </svg>

          {anomalies && anomalies.length > 0 && (
            <InlineStack gap="100">
              {anomalies.map((anomaly, idx) => (
                <Tooltip key={idx} content={`${anomaly.date}: ${anomaly.reason}`}>
                  <Badge tone="warning">⚠️</Badge>
                </Tooltip>
              ))}
            </InlineStack>
          )}
        </BlockStack>
      </BlockStack>
    </Card>
  );
}

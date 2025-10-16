import { Card, BlockStack, Text, InlineStack, Badge, Spinner } from "@shopify/polaris";

interface RevenueTileProps {
  value: string;
  orderCount: number;
  trend: "up" | "down" | "neutral";
  loading?: boolean;
}

export function RevenueTile({ value, orderCount, trend, loading }: RevenueTileProps) {
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
  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h3" variant="headingMd">Revenue</Text>
        <BlockStack gap="200">
          <Text as="h2" variant="heading2xl">{value}</Text>
          <InlineStack gap="200" align="start" blockAlign="center">
            <Text as="p" tone="subdued">{orderCount} orders today</Text>
            {trend !== "neutral" && (
              <Badge tone={trend === "up" ? "success" : "critical"}>{trend === "up" ? "↑" : "↓"}</Badge>
            )}
          </InlineStack>
        </BlockStack>
      </BlockStack>
    </Card>
  );
}

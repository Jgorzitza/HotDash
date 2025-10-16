import { Card, BlockStack, Text, InlineStack, Badge, Spinner } from "@shopify/polaris";

interface AOVTileProps {
  value: string;
  trend: "up" | "down" | "neutral";
  percentChange: string;
  loading?: boolean;
}

export function AOVTile({ value, trend, percentChange, loading }: AOVTileProps) {
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
        <Text as="h3" variant="headingMd">Average Order Value</Text>
        <BlockStack gap="200">
          <Text as="h2" variant="heading2xl">{value}</Text>
          <InlineStack gap="200" align="start" blockAlign="center">
            <Text as="p" tone="subdued">{percentChange} vs yesterday</Text>
            {trend !== "neutral" && (
              <Badge tone={trend === "up" ? "success" : "critical"}>{trend === "up" ? "↑" : "↓"}</Badge>
            )}
          </InlineStack>
        </BlockStack>
      </BlockStack>
    </Card>
  );
}

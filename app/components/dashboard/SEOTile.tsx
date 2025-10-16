import { Card, BlockStack, Text, InlineStack, Badge, Spinner } from "@shopify/polaris";

interface SEOTileProps {
  alertCount: number;
  topAlert: string;
  trend: "up" | "down" | "neutral";
  loading?: boolean;
}

export function SEOTile({ alertCount, topAlert, trend, loading }: SEOTileProps) {
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
        <Text as="h3" variant="headingMd">SEO Alerts</Text>
        <BlockStack gap="200">
          <Text as="h2" variant="heading2xl">{alertCount} alert{alertCount !== 1 ? 's' : ''}</Text>
          <InlineStack gap="200" align="start" blockAlign="center">
            <Text as="p" tone="subdued">{topAlert}</Text>
            {trend === "down" && <Badge tone="critical">↓</Badge>}
          </InlineStack>
        </BlockStack>
      </BlockStack>
    </Card>
  );
}

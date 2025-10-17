import {
  Card,
  BlockStack,
  Text,
  InlineStack,
  Badge,
  Spinner,
} from "@shopify/polaris";

interface ReturnsTileProps {
  count: number;
  pendingReview: number;
  trend: "up" | "down" | "neutral";
  loading?: boolean;
}

export function ReturnsTile({
  count,
  pendingReview,
  trend,
  loading,
}: ReturnsTileProps) {
  if (loading) {
    return (
      <Card>
        <BlockStack gap="400" align="center">
          <Spinner size="small" />
          <Text as="p" tone="subdued">
            Loading...
          </Text>
        </BlockStack>
      </Card>
    );
  }

  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h3" variant="headingMd">
          Returns
        </Text>
        <BlockStack gap="200">
          <Text as="h2" variant="heading2xl">
            {count}
          </Text>
          <InlineStack gap="200" align="start" blockAlign="center">
            <Text as="p" tone="subdued">
              {pendingReview} pending review
            </Text>
            {trend !== "neutral" && (
              <Badge tone={trend === "up" ? "critical" : "success"}>
                {trend === "up" ? "↑" : "↓"}
              </Badge>
            )}
          </InlineStack>
        </BlockStack>
      </BlockStack>
    </Card>
  );
}

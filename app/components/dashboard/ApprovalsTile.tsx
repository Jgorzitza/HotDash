import { Card, BlockStack, Text, InlineStack, Badge, Spinner } from "@shopify/polaris";

interface ApprovalsTileProps {
  pendingCount: number;
  filters?: string[];
  loading?: boolean;
}

export function ApprovalsTile({ pendingCount, filters, loading }: ApprovalsTileProps) {
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
        <Text as="h3" variant="headingMd">Approvals Queue</Text>
        <BlockStack gap="200">
          <Text as="h2" variant="heading2xl">{pendingCount} pending</Text>
          {filters && filters.length > 0 && (
            <InlineStack gap="100">
              {filters.map((filter, idx) => (
                <Badge key={idx}>{filter}</Badge>
              ))}
            </InlineStack>
          )}
        </BlockStack>
      </BlockStack>
    </Card>
  );
}

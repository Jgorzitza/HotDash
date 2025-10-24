import { Card, BlockStack, Text, InlineStack, Badge, Spinner, } from "@shopify/polaris";
export function StockRiskTile({ skuCount, subtitle, trend, loading, }) {
    if (loading) {
        return (<Card>
        <BlockStack gap="400" align="center">
          <Spinner size="small"/>
          <Text as="p" tone="subdued">
            Loading...
          </Text>
        </BlockStack>
      </Card>);
    }
    return (<Card>
      <BlockStack gap="400">
        <Text as="h3" variant="headingMd">
          Stock Risk
        </Text>
        <BlockStack gap="200">
          <Text as="h2" variant="heading2xl">
            {skuCount} SKUs
          </Text>
          <InlineStack gap="200" align="start" blockAlign="center">
            <Text as="p" tone="subdued">
              {subtitle}
            </Text>
            {trend === "down" && <Badge tone="critical">⚠️</Badge>}
          </InlineStack>
        </BlockStack>
      </BlockStack>
    </Card>);
}
//# sourceMappingURL=StockRiskTile.js.map
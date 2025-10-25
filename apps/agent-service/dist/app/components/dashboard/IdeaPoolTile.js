/**
 * Idea Pool Tile
 *
 * Displays product idea backlog health showing pool capacity (5/5),
 * wildcard status, and pending/accepted/rejected counts.
 *
 * Spec: docs/design/dashboard-tiles.md (Section 12)
 */
import { Card, BlockStack, Text, InlineStack, Badge, Button, Spinner, } from "@shopify/polaris";
export function IdeaPoolTile({ data, loading, error }) {
    if (loading) {
        return (<Card>
        <BlockStack gap="400" align="center">
          <Spinner size="small"/>
          <Text as="p" tone="subdued">
            Loading idea pool...
          </Text>
        </BlockStack>
      </Card>);
    }
    if (error) {
        return (<Card>
        <BlockStack gap="400">
          <Text as="p" tone="critical">
            Unable to load idea pool data.
          </Text>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </BlockStack>
      </Card>);
    }
    if (!data || data.totalIdeas === 0) {
        return (<Card>
        <BlockStack gap="400">
          <Text as="h3" variant="headingMd">
            Idea Pool
          </Text>
          <Text as="p" tone="subdued">
            No ideas in the pool yet. New ideas will appear here when the AI
            generates suggestions.
          </Text>
        </BlockStack>
      </Card>);
    }
    const isFull = data.totalIdeas >= data.maxIdeas;
    const hasWildcard = !!data.wildcardId || !!data.wildcardTitle;
    return (<Card>
      <BlockStack gap="400">
        {/* Header with status badge */}
        <InlineStack align="space-between" blockAlign="center">
          <Text as="h3" variant="headingMd">
            Idea Pool
          </Text>
          <Badge tone={isFull ? "success" : "warning"}>
            {isFull ? "Full" : "Filling"}
          </Badge>
        </InlineStack>

        {/* Main metric */}
        <BlockStack gap="200">
          <Text as="p" variant="heading2xl" fontWeight="bold">
            {data.totalIdeas}/{data.maxIdeas}
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            Ideas in pool
          </Text>
        </BlockStack>

        {/* Wildcard display */}
        {hasWildcard && (<InlineStack gap="200" blockAlign="center">
            <Badge tone="warning">Wildcard</Badge>
            <Text as="p" variant="bodySm" tone="subdued">
              {data.wildcardTitle || data.wildcardId}
            </Text>
          </InlineStack>)}

        {/* Metrics breakdown */}
        <BlockStack gap="200">
          <InlineStack align="space-between">
            <Text as="p" variant="bodySm" tone="subdued">
              Pending
            </Text>
            <Text as="p" variant="bodySm" fontWeight="semibold">
              {data.pendingCount}
            </Text>
          </InlineStack>
          <InlineStack align="space-between">
            <Text as="p" variant="bodySm" tone="subdued">
              Accepted
            </Text>
            <Text as="p" variant="bodySm" fontWeight="semibold">
              {data.acceptedCount}
            </Text>
          </InlineStack>
          <InlineStack align="space-between">
            <Text as="p" variant="bodySm" tone="subdued">
              Rejected
            </Text>
            <Text as="p" variant="bodySm" fontWeight="semibold">
              {data.rejectedCount}
            </Text>
          </InlineStack>
        </BlockStack>

        {/* CTA Button */}
        <Button url="/ideas" variant="primary">
          View Idea Pool
        </Button>
      </BlockStack>
    </Card>);
}
//# sourceMappingURL=IdeaPoolTile.js.map
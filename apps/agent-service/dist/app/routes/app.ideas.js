/**
 * Idea Pool Route
 *
 * Displays and manages product idea suggestions from the AI
 * Supports accept/reject workflow with HITL approval
 *
 * Spec: docs/design/dashboard-tiles.md (Section 12)
 */
import { useLoaderData } from "react-router";
import { Page, Layout, Card, BlockStack, Text, InlineStack, Badge, Button, EmptyState, } from "@shopify/polaris";
export async function loader({ request }) {
    // TODO: Fetch from Supabase product_suggestions table
    // For now, return empty pool
    const data = {
        ideas: [],
        totalIdeas: 0,
        maxIdeas: 5,
        pendingCount: 0,
        acceptedCount: 0,
        rejectedCount: 0,
    };
    return Response.json(data);
}
export default function IdeasRoute() {
    const data = useLoaderData();
    if (data.ideas.length === 0) {
        return (<Page title="Idea Pool" backAction={{ content: "Dashboard", url: "/app" }}>
        <Layout>
          <Layout.Section>
            <Card>
              <EmptyState heading="No ideas in the pool" image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png">
                <p>
                  New product ideas will appear here when the AI generates
                  suggestions based on customer feedback and market trends.
                </p>
              </EmptyState>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>);
    }
    return (<Page title="Idea Pool" subtitle={`${data.totalIdeas} of ${data.maxIdeas} ideas`} backAction={{ content: "Dashboard", url: "/app" }}>
      <Layout>
        {/* Summary Card */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Pool Status
              </Text>
              <InlineStack gap="400">
                <div>
                  <Text as="p" variant="bodySm" tone="subdued">
                    Pending
                  </Text>
                  <Text as="p" variant="headingLg">
                    {data.pendingCount}
                  </Text>
                </div>
                <div>
                  <Text as="p" variant="bodySm" tone="subdued">
                    Accepted
                  </Text>
                  <Text as="p" variant="headingLg">
                    {data.acceptedCount}
                  </Text>
                </div>
                <div>
                  <Text as="p" variant="bodySm" tone="subdued">
                    Rejected
                  </Text>
                  <Text as="p" variant="headingLg">
                    {data.rejectedCount}
                  </Text>
                </div>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Idea Cards */}
        {data.ideas.map((idea) => (<Layout.Section key={idea.id}>
            <Card>
              <BlockStack gap="400">
                {/* Header */}
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h3" variant="headingMd">
                    {idea.title}
                  </Text>
                  <InlineStack gap="200">
                    {idea.isWildcard && <Badge tone="warning">Wildcard</Badge>}
                    <Badge tone={idea.status === "accepted"
                ? "success"
                : idea.status === "rejected"
                    ? "critical"
                    : "attention"}>
                      {idea.status.charAt(0).toUpperCase() +
                idea.status.slice(1)}
                    </Badge>
                  </InlineStack>
                </InlineStack>

                {/* Description */}
                <Text as="p" variant="bodyMd">
                  {idea.description}
                </Text>

                {/* Reasoning */}
                {idea.reasoning && (<BlockStack gap="200">
                    <Text as="p" variant="bodyS m" fontWeight="semibold">
                      AI Reasoning:
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {idea.reasoning}
                    </Text>
                  </BlockStack>)}

                {/* Actions for pending ideas */}
                {idea.status === "pending" && (<InlineStack gap="200">
                    <Button variant="primary" tone="success">
                      Accept
                    </Button>
                    <Button tone="critical">Reject</Button>
                  </InlineStack>)}
              </BlockStack>
            </Card>
          </Layout.Section>))}
      </Layout>
    </Page>);
}
//# sourceMappingURL=app.ideas.js.map
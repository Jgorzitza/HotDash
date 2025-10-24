import React from "react";
import {
  BlockStack,
  Box,
  Button,
  Card,
  DataTable,
  EmptyState,
  InlineGrid,
  InlineStack,
  Layout,
  Page,
  Text,
  Badge,
  Banner,
} from "@shopify/polaris";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "react-router";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import { json } from "~/utils/http.server";
import {
  generateOptimizationReport,
  queueOptimizationRecommendations,
  recordOptimizationHistory,
} from "~/services/inventory/optimization";
import type {
  OptimizationRecommendation,
  OptimizationSummary,
} from "~/services/inventory/optimization";

interface LoaderData {
  report: OptimizationSummary;
}

interface ActionData {
  ok: boolean;
  message: string;
  queued?: { queued: number; skipped: number };
  recorded?: { recorded: number };
}

export async function loader(_: LoaderFunctionArgs) {
  const report = await generateOptimizationReport();
  return json<LoaderData>({ report });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "queue-high-priority") {
    try {
      const report = await generateOptimizationReport();
      const highPriority = report.recommendations.filter(
        (rec) => rec.priority === "high",
      );

      if (highPriority.length === 0) {
        return json<ActionData>({
          ok: false,
          message: "There are no high-priority recommendations to queue right now.",
        });
      }

      const [queued, recorded] = await Promise.all([
        queueOptimizationRecommendations({
          recommendations: highPriority,
          actor: "inventory",
          reason: "Queued from Inventory Optimization page",
        }),
        recordOptimizationHistory({
          recommendations: highPriority,
          operator: "inventory",
        }),
      ]);

      return json<ActionData>({
        ok: true,
        message: `Queued ${queued.queued} recommendation${queued.queued === 1 ? "" : "s"} for CEO review`,
        queued,
        recorded,
      });
    } catch (error: any) {
      console.error("[Inventory Optimization] action failed", error);
      return json<ActionData>(
        {
          ok: false,
          message:
            error instanceof Error
              ? error.message
              : "Unable to queue recommendations. Please try again.",
        },
        { status: 500 },
      );
    }
  }

  return json<ActionData>({
    ok: false,
    message: "Unsupported action.",
  });
}

export default function InventoryOptimizationRoute() {
  const { report } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const highPriority = report.recommendations.filter(
    (rec) => rec.priority === "high",
  );
  const isSubmittingQueue =
    navigation.state === "submitting" &&
    navigation.formData?.get("intent") === "queue-high-priority";

  const tableRows = report.recommendations.map((recommendation) => {
    const priorityTone =
      recommendation.priority === "high"
        ? "critical"
        : recommendation.priority === "medium"
          ? "warning"
          : "new";

    return [
      <BlockStack gap="100" key={`${recommendation.productId}-name`}>
        <InlineStack gap="200" align="start">
          <Text as="span" fontWeight="semibold">
            {recommendation.productName}
          </Text>
          <Badge tone="info">{recommendation.abcClass}</Badge>
        </InlineStack>
        <Text as="span" tone="subdued">
          SKU: {recommendation.sku ?? "N/A"}
        </Text>
      </BlockStack>,
      <Text as="span" key={`${recommendation.productId}-issue`}>
        {recommendation.currentIssue}
      </Text>,
      <Badge tone={priorityTone as any} key={`${recommendation.productId}-prio`}>
        {recommendation.priority.toUpperCase()}
      </Badge>,
      <Text as="span" key={`${recommendation.productId}-qty`}>
        {recommendation.orderSuggestion.recommendedOrderQty}
      </Text>,
      <Text as="span" key={`${recommendation.productId}-forecast`}>
        {recommendation.metrics.dailyForecast}
      </Text>,
      <Text as="span" key={`${recommendation.productId}-action`}>
        {recommendation.recommendedAction}
      </Text>,
    ];
  });

  return (
    <Page
      title="Inventory Optimization"
      subtitle="Review stock risks, see suggested actions, and push recommendations into the CEO approval queue."
    >
      <Form method="post">
        <input type="hidden" name="intent" value="queue-high-priority" />
        <Layout>
          <Layout.Section>
            {actionData ? (
              <Box marginBlockEnd="400">
                <Banner
                  title={actionData.ok ? "Queue updated" : "Action failed"}
                  tone={actionData.ok ? "success" : "critical"}
                >
                  <p>{actionData.message}</p>
                </Banner>
              </Box>
            ) : null}
            <Card>
              <Card.Section>
                <Text variant="headingMd" as="h2">
                  Key stock metrics
                </Text>
              </Card.Section>
              <Card.Section>
                <InlineGrid columns={{ xs: 1, sm: 3 }} gap="400">
                  <MetricTile
                    title="Dead stock"
                    value={report.deadStock.count.toString()}
                    helper={`$${report.deadStock.totalValue.toLocaleString()} tied up`}
                    tone="critical"
                  />
                  <MetricTile
                    title="Overstock"
                    value={report.overstock.count.toString()}
                    helper={`$${report.overstock.tiedUpCapital.toLocaleString()} carrying cost`}
                    tone="warning"
                  />
                  <MetricTile
                    title="High-priority actions"
                    value={highPriority.length.toString()}
                    helper="Ready to queue for approval"
                    tone={highPriority.length > 0 ? "info" : "success"}
                  />
                </InlineGrid>
              </Card.Section>
            </Card>
          </Layout.Section>

          <Layout.Section>
            <Card>
              <Card.Section>
                <BlockStack gap="200">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text variant="headingMd" as="h2">
                      Recommendations
                    </Text>
                    <Button
                      variant="primary"
                      submit
                      loading={isSubmittingQueue}
                      disabled={highPriority.length === 0}
                    >
                      Queue high-priority actions
                    </Button>
                  </InlineStack>
                  <Text tone="subdued">
                    Review suggested reorder quantities, dead stock candidates, and overstock reductions. Queue high priority items for CEO approval with one click.
                  </Text>
                </BlockStack>
              </Card.Section>
              {report.recommendations.length === 0 ? (
                <Card.Section>
                  <EmptyState
                    heading="All caught up"
                    action={{ content: "Refresh", url: "?" }}
                    image="https://cdn.shopify.com/static/images/polaris/patterns/callout.png"
                  >
                    <p>
                      There are no optimization recommendations right now. Check back after new sales or inventory updates.
                    </p>
                  </EmptyState>
                </Card.Section>
              ) : (
                <Card.Section>
                  <DataTable
                    columnContentTypes={["text", "text", "text", "numeric", "numeric", "text"]}
                    headings={[
                      "Product",
                      "Issue",
                      "Priority",
                      "Order qty",
                      "Daily forecast",
                      "Suggested action",
                    ]}
                    rows={tableRows}
                  />
                </Card.Section>
              )}
            </Card>
          </Layout.Section>

          <Layout.Section secondary>
            <Card>
              <Card.Section>
                <Text variant="headingMd" as="h2">
                  Pipeline summary
                </Text>
              </Card.Section>
              <Card.Section>
                <BlockStack gap="300">
                  <InlineStack gap="200" align="space-between">
                    <Text as="span">Pending approvals</Text>
                    <Badge tone="info">
                      {report.approvals.pending.length}
                    </Badge>
                  </InlineStack>
                  <InlineStack gap="200" align="space-between">
                    <Text as="span">Slow movers</Text>
                    <Badge tone="warning">
                      {report.slowMovers.count}
                    </Badge>
                  </InlineStack>
                  <InlineStack gap="200" align="space-between">
                    <Text as="span">ROP alerts</Text>
                    <Badge tone="attention">
                      {report.ropAlerts.count}
                    </Badge>
                  </InlineStack>
                </BlockStack>
              </Card.Section>
            </Card>
          </Layout.Section>
        </Layout>
      </Form>
    </Page>
  );
}

interface MetricTileProps {
  title: string;
  value: string;
  helper: string;
  tone: "critical" | "warning" | "info" | "success" | "attention";
}

function MetricTile({ title, value, helper, tone }: MetricTileProps) {
  const badgeTone: Record<MetricTileProps["tone"], React.ComponentProps<typeof Badge>["tone"]> = {
    critical: "critical",
    warning: "attention",
    info: "info",
    success: "success",
    attention: "attention",
  };

  return (
    <Box
      background="subdued"
      padding="400"
      borderRadius="base"
    >
      <BlockStack gap="200">
        <Text as="h3" variant="headingSm">
          {title}
        </Text>
        <InlineStack gap="200" align="center">
          <Text variant="headingLg" as="span">
            {value}
          </Text>
          <Badge tone={badgeTone[tone]}>{helper}</Badge>
        </InlineStack>
      </BlockStack>
    </Box>
  );
}

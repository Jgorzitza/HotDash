import {
  BlockStack,
  Card,
  DataTable,
  InlineGrid,
  InlineStack,
  Layout,
  Page,
  Text,
  Badge,
} from "@shopify/polaris";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { json } from "~/utils/http.server";
import {
  getInventoryHealthSnapshot,
  type InventoryHealthSnapshot,
} from "~/services/inventory/health-monitor";
import { InventoryHealthDashboard } from "~/components/inventory/InventoryHealthDashboard";

export async function loader(_: LoaderFunctionArgs) {
  const snapshot = await getInventoryHealthSnapshot();
  return json<InventoryHealthSnapshot>(snapshot);
}

export default function InventoryHealthRoute() {
  const snapshot = useLoaderData<typeof loader>();
  const { metrics, ropAlerts } = snapshot;

  const alertRows = ropAlerts.map((alert) => [
    <InlineStack gap="200" align="start" key={`${alert.productId}-name`}>
      <Text as="span" fontWeight="semibold">
        {alert.productName}
      </Text>
      {alert.sku ? (
        <Text as="span" tone="subdued">
          SKU: {alert.sku}
        </Text>
      ) : null}
    </InlineStack>,
    <Badge
      tone={
        alert.status === "urgent_reorder"
          ? "critical"
          : alert.status === "low_stock"
            ? "warning"
            : "critical"
      }
      key={`${alert.productId}-status`}
    >
      {alert.status.replace("_", " ")}
    </Badge>,
    <Text as="span" key={`${alert.productId}-stock`}>
      {alert.currentStock}
    </Text>,
    <Text as="span" key={`${alert.productId}-rop`}>
      {alert.reorderPoint}
    </Text>,
    <Text as="span" key={`${alert.productId}-safety`}>
      {alert.safetyStock}
    </Text>,
    <Text as="span" key={`${alert.productId}-stockout`}>
      {alert.daysUntilStockout ?? "N/A"}
    </Text>,
    <Text as="span" key={`${alert.productId}-recommended`}>
      {alert.recommendedOrderQty}
    </Text>,
  ]);

  return (
    <Page
      title="Inventory Health"
      subtitle="Monitor reorder points, stock levels, and priority alerts in real time."
    >
      <Layout>
        <Layout.Section>
          <InventoryHealthDashboard metrics={metrics} />
        </Layout.Section>

        <Layout.Section>
          <Card>
            <Card.Section>
              <InlineStack align="space-between" blockAlign="center">
                <Text variant="headingMd" as="h2">
                  ROP Alerts
                </Text>
                <InlineGrid columns={{ xs: 1, sm: 3 }} gap="200">
                  <Badge tone="critical">
                    Urgent:{" "}
                    {
                      ropAlerts.filter(
                        (alert) =>
                          alert.status === "urgent_reorder" ||
                          alert.status === "out_of_stock",
                      ).length
                    }
                  </Badge>
                  <Badge tone="warning">
                    Low stock:{" "}
                    {
                      ropAlerts.filter(
                        (alert) => alert.status === "low_stock",
                      ).length
                    }
                  </Badge>
                  <Badge tone="info">
                    Total alerts: {metrics.activeAlerts}
                  </Badge>
                </InlineGrid>
              </InlineStack>
              <Text as="p" tone="subdued">
                Prioritized by ROP status and days until stockout. Use these
                insights to trigger purchase orders or emergency sourcing.
              </Text>
            </Card.Section>
            <Card.Section subdued>
              {alertRows.length === 0 ? (
                <BlockStack gap="200">
                  <Text as="p" tone="subdued">
                    No ROP alerts at the moment. All monitored products are
                    above their reorder thresholds.
                  </Text>
                </BlockStack>
              ) : (
                <DataTable
                  columnContentTypes={[
                    "text",
                    "text",
                    "numeric",
                    "numeric",
                    "numeric",
                    "numeric",
                    "numeric",
                  ]}
                  headings={[
                    "Product",
                    "Status",
                    "On hand",
                    "ROP",
                    "Safety stock",
                    "Days to stockout",
                    "Recommended order",
                  ]}
                  rows={alertRows}
                />
              )}
            </Card.Section>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

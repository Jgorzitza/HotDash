import { BlockStack, Card, InlineStack, Text, Badge, Box } from "@shopify/polaris";
import { useLoaderData } from "react-router";

export interface IntegrationStatus {
  name: string;
  status: "healthy" | "degraded" | "down";
  lastCheck: string;
  responseTime?: number;
  message?: string;
}

export interface IntegrationsHealthData {
  integrations: IntegrationStatus[];
  overallHealth: "healthy" | "degraded" | "down";
  lastUpdated: string;
}

export function IntegrationsHealthTile() {
  const data = useLoaderData<IntegrationsHealthData>();

  const getStatusBadge = (status: IntegrationStatus["status"]) => {
    switch (status) {
      case "healthy":
        return <Badge tone="success">Healthy</Badge>;
      case "degraded":
        return <Badge tone="warning">Degraded</Badge>;
      case "down":
        return <Badge tone="critical">Down</Badge>;
    }
  };

  const getStatusColor = (status: IntegrationStatus["status"]) => {
    switch (status) {
      case "healthy":
        return "#00A65A";
      case "degraded":
        return "#FFA500";
      case "down":
        return "#D72C0D";
    }
  };

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between">
          <Text variant="headingMd" as="h2">
            Integrations Health
          </Text>
          {data && (
            <Badge
              tone={
                data.overallHealth === "healthy"
                  ? "success"
                  : data.overallHealth === "degraded"
                    ? "warning"
                    : "critical"
              }
            >
              {data.overallHealth.toUpperCase()}
            </Badge>
          )}
        </InlineStack>

        {!data && (
          <Text as="p" tone="subdued">
            Loading integration health...
          </Text>
        )}

        {data && (
          <BlockStack gap="300">
            {data.integrations.map((integration) => (
              <Box
                key={integration.name}
                padding="300"
                borderRadius="200"
                background="surface-secondary"
              >
                <InlineStack align="space-between" blockAlign="center">
                  <InlineStack gap="200" blockAlign="center">
                    <Box
                      width="8px"
                      minHeight="8px"
                      borderRadius="full"
                      background={
                        getStatusColor(integration.status) as any
                      }
                    />
                    <Text as="span" variant="bodyMd" fontWeight="medium">
                      {integration.name}
                    </Text>
                  </InlineStack>

                  <InlineStack gap="300" blockAlign="center">
                    {integration.responseTime && (
                      <Text as="span" tone="subdued" variant="bodySm">
                        {integration.responseTime}ms
                      </Text>
                    )}
                    {getStatusBadge(integration.status)}
                  </InlineStack>
                </InlineStack>

                {integration.message && (
                  <Box paddingBlockStart="200">
                    <Text as="p" tone="subdued" variant="bodySm">
                      {integration.message}
                    </Text>
                  </Box>
                )}
              </Box>
            ))}

            <Text as="p" tone="subdued" variant="bodySm" alignment="end">
              Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}
            </Text>
          </BlockStack>
        )}
      </BlockStack>
    </Card>
  );
}


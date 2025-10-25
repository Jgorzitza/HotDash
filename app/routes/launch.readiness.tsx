import { useMemo } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import {
  Page,
  Layout,
  Card,
  InlineGrid,
  BlockStack,
  Text,
  Badge,
  List,
  Divider,
  InlineStack,
} from "@shopify/polaris";

import {
  getDashboardMetrics,
  getHealthSummary,
} from "~/lib/monitoring/dashboard";
import { ProductionMonitoringService } from "~/services/analytics/production-monitoring";
import { IntegrationManager } from "~/services/integrations/integration-manager";
import { generateGrowthEngineAnalytics } from "~/services/analytics/growthEngine";
import { getLaunchMetrics } from "~/services/metrics/launch-metrics";

type TileStatus = "healthy" | "warning" | "critical";

interface TileSummary {
  id: string;
  label: string;
  status: TileStatus;
  summary: string;
  meta?: {
    value?: string;
    trend?: string;
  };
}

interface BlockerSummary {
  id: string;
  title: string;
  owner: string;
  priority: string;
  detail: string;
}

type CheckStatus = "pass" | "warn" | "fail";

interface StatusCheck {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
}

interface LoaderResponse {
  tiles: TileSummary[];
  blockers: BlockerSummary[];
  checks: StatusCheck[];
  lastUpdated: string;
}

function mapHealthStatusToTile(status: string): TileStatus {
  switch (status) {
    case "healthy":
    case "good":
      return "healthy";
    case "degraded":
    case "warning":
    case "at-risk":
      return "warning";
    case "unhealthy":
    case "critical":
    case "behind":
      return "critical";
    default:
      return "warning";
  }
}

function mapIntegrationHealth(
  checks: Array<{ healthy: boolean; service: string; error?: string }>,
): { status: TileStatus; summary: string } {
  if (checks.length === 0) {
    return {
      status: "warning",
      summary: "No integration health data available.",
    };
  }

  const unhealthy = checks.filter((check) => !check.healthy);
  if (unhealthy.length === 0) {
    return {
      status: "healthy",
      summary: "All monitored integrations are healthy.",
    };
  }

  const services = unhealthy.map((item) => item.service || "unknown").join(", ");
  return {
    status: unhealthy.length === checks.length ? "critical" : "warning",
    summary: `Attention required: ${services}`,
  };
}

function evaluateLaunchMetrics(metrics: Awaited<ReturnType<typeof getLaunchMetrics>>): {
  status: TileStatus;
  summary: string;
} {
  const activation = metrics.adoption.activation.activationRate;
  const dauMau = metrics.adoption.dauMau.ratio;
  const nps = metrics.satisfaction.nps.npsScore;

  let status: TileStatus = "healthy";
  if (activation < 50 || nps < 20 || dauMau < 30) {
    status = "critical";
  } else if (activation < 60 || nps < 40 || dauMau < 40) {
    status = "warning";
  }

  const summary = `Activation ${activation}% · DAU/MAU ${dauMau}% · NPS ${Math.round(
    nps,
  )}`;

  return { status, summary };
}

function toCheckStatus(condition: boolean, warningCondition: boolean): CheckStatus {
  if (condition) return "pass";
  if (warningCondition) return "warn";
  return "fail";
}

export async function loader({ request }: LoaderFunctionArgs) {
  void request; // suppress unused warning

  const [dashboardMetrics, systemSummary] = [
    getDashboardMetrics(3600000),
    getHealthSummary(),
  ];

  const monitoringService = new ProductionMonitoringService();
  const healthReport = await monitoringService.generateHealthReport();

  const integrationManager = new IntegrationManager();
  let integrationHealth;
  try {
    integrationHealth = await integrationManager.getHealthStatus();
  } catch (error) {
    console.warn("[LaunchReadiness] Failed to load integration health:", error);
    integrationHealth = [];
  }

  const launchMetrics = await getLaunchMetrics();

  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  const growthAnalytics = await generateGrowthEngineAnalytics(
    startDate.toISOString().slice(0, 10),
    endDate.toISOString().slice(0, 10),
  );

  const integrationSummary = mapIntegrationHealth(integrationHealth);
  const metricSummary = evaluateLaunchMetrics(launchMetrics);
  const analyticsStatus = mapHealthStatusToTile(healthReport.overall.status);

  const tiles: TileSummary[] = [
    {
      id: "system-health",
      label: "System Health",
      status: mapHealthStatusToTile(systemSummary.status),
      summary: systemSummary.message,
    },
    {
      id: "analytics-health",
      label: "Analytics Health",
      status: analyticsStatus,
      summary: `Score ${Math.round(healthReport.overall.score)} · ${
        healthReport.metrics.performance.avgResponseTime.toFixed(0)
      }ms avg response · Error rate ${(healthReport.metrics.performance.errorRate ?? 0).toFixed(
        2,
      )}%`,
    },
    {
      id: "integration-health",
      label: "Integrations",
      status: integrationSummary.status,
      summary: integrationSummary.summary,
      meta: {
        value: `${integrationHealth.filter((item) => item.healthy).length}/${
          integrationHealth.length || 0
        } healthy`,
      },
    },
    {
      id: "launch-kpis",
      label: "Launch KPIs",
      status: metricSummary.status,
      summary: metricSummary.summary,
    },
  ];

  const blockers: BlockerSummary[] =
    growthAnalytics.performance.blockedActions.slice(0, 5).map((action) => ({
      id: action.actionId,
      title: action.title,
      owner: action.actionType.toUpperCase(),
      priority: action.priority.toUpperCase(),
      detail:
        action.blockers.length > 0
          ? action.blockers.join("; ")
          : "Blocker details not documented.",
    }));

  const criticalAlerts = dashboardMetrics.alerts.critical;
  const uptime = dashboardMetrics.uptime.overall;
  const routeP95 = dashboardMetrics.performance.routes.p95;
  const anomalyCount = healthReport.anomalies.anomalies.length;

  const checks: StatusCheck[] = [
    {
      id: "uptime",
      label: "Uptime ≥ 99%",
      status: toCheckStatus(uptime >= 99, uptime >= 97),
      detail: `Overall uptime ${uptime.toFixed(2)}%`,
    },
    {
      id: "critical-alerts",
      label: "Critical alerts resolved",
      status: toCheckStatus(criticalAlerts === 0, criticalAlerts <= 2),
      detail:
        criticalAlerts === 0
          ? "No critical alerts outstanding."
          : `${criticalAlerts} critical alert(s) remain.`,
    },
    {
      id: "route-performance",
      label: "Route performance P95 < 3000ms",
      status: toCheckStatus(routeP95 < 3000, routeP95 < 4000),
      detail: `Current route P95 ${routeP95.toFixed(0)}ms`,
    },
    {
      id: "anomaly-review",
      label: "Anomaly backlog clear",
      status: toCheckStatus(anomalyCount === 0, anomalyCount <= 3),
      detail:
        anomalyCount === 0
          ? "No unresolved anomalies."
          : `${anomalyCount} anomaly alert(s) pending review.`,
    },
  ];

  return Response.json({
    tiles,
    blockers,
    checks,
    lastUpdated: new Date().toISOString(),
  } satisfies LoaderResponse);
}

function statusBadgeTone(status: TileStatus | CheckStatus): "success" | "critical" | "attention" {
  if (status === "healthy" || status === "pass") {
    return "success";
  }
  if (status === "critical" || status === "fail") {
    return "critical";
  }
  return "attention";
}

function statusLabel(status: TileStatus | CheckStatus): string {
  switch (status) {
    case "healthy":
    case "pass":
      return "Healthy";
    case "warning":
    case "warn":
      return "Attention";
    case "critical":
    case "fail":
      return "Critical";
    default:
      return status;
  }
}

export default function LaunchReadinessRoute() {
  const { tiles, blockers, checks, lastUpdated } =
    useLoaderData<typeof loader>();

  const hasBlockers = blockers.length > 0;
  const formattedUpdated = useMemo(
    () => new Date(lastUpdated).toLocaleString(),
    [lastUpdated],
  );

  return (
    <Page
      title="Launch Readiness Snapshot"
      subtitle={`Updated ${formattedUpdated}`}
      narrowWidth
    >
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Tile Health
              </Text>
              <InlineGrid columns={{ xs: 1, sm: 2 }} gap="400">
                {tiles.map((tile) => (
                  <Card key={tile.id} padding="400">
                    <BlockStack gap="200">
                      <InlineStack align="space-between" blockAlign="center">
                        <Text as="h3" variant="headingSm">
                          {tile.label}
                        </Text>
                        <Badge tone={statusBadgeTone(tile.status)}>
                          {statusLabel(tile.status)}
                        </Badge>
                      </InlineStack>
                      <Text as="p" variant="bodyMd">
                        {tile.summary}
                      </Text>
                      {tile.meta?.value && (
                        <Text as="p" variant="bodySm" tone="subdued">
                          {tile.meta.value}
                        </Text>
                      )}
                    </BlockStack>
                  </Card>
                ))}
              </InlineGrid>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h2" variant="headingMd">
                  Blockers
                </Text>
                <Badge tone={statusBadgeTone(hasBlockers ? "warning" : "pass")}>
                  {hasBlockers ? `${blockers.length} open` : "None"}
                </Badge>
              </InlineStack>
              {hasBlockers ? (
                <BlockStack gap="200">
                  {blockers.map((blocker, index) => (
                    <div key={blocker.id}>
                      {index > 0 && <Divider />}
                      <BlockStack gap="100">
                        <InlineStack align="space-between" blockAlign="center">
                          <Text as="h3" variant="headingSm">
                            {blocker.title}
                          </Text>
                          <InlineStack gap="200">
                            <Badge tone="critical">{blocker.priority}</Badge>
                            <Badge tone="attention">{blocker.owner}</Badge>
                          </InlineStack>
                        </InlineStack>
                        <Text as="p" variant="bodySm">
                          {blocker.detail}
                        </Text>
                      </BlockStack>
                    </div>
                  ))}
                </BlockStack>
              ) : (
                <Text as="p" variant="bodySm" tone="subdued">
                  No launch blockers logged in the last 30 days.
                </Text>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">
                Status Checks
              </Text>
              <List type="bullet">
                {checks.map((check) => (
                  <List.Item key={check.id}>
                    <InlineStack gap="200" blockAlign="center">
                      <Badge tone={statusBadgeTone(check.status)}>
                        {statusLabel(check.status)}
                      </Badge>
                      <Text as="span" variant="bodyMd">
                        {check.label}
                      </Text>
                      <Text as="span" variant="bodySm" tone="subdued">
                        {check.detail}
                      </Text>
                    </InlineStack>
                  </List.Item>
                ))}
              </List>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

import { useMemo } from "react";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineGrid,
  InlineStack,
  Badge,
  Button,
  ProgressBar,
  Divider,
  List,
} from "@shopify/polaris";
import { ConnectionIndicator } from "~/components/realtime/ConnectionIndicator";
import { LiveBadge } from "~/components/realtime/LiveBadge";

export type TrendDirection = "up" | "down" | "stable";

export interface VitalSummary {
  value: number;
  unit: string;
  rating: "good" | "needs-improvement" | "poor";
  threshold: number;
}

export interface CoreWebVitalsSummary {
  mobile: {
    lcp: VitalSummary;
    fid: VitalSummary;
    cls: VitalSummary;
    overallScore: number;
  };
  desktop: {
    lcp: VitalSummary;
    fid: VitalSummary;
    cls: VitalSummary;
    overallScore: number;
  };
  recommendations: string[];
}

export interface PerformanceSummary {
  routes: {
    p50: number;
    p95: number;
    p99: number;
    sampleSize: number;
  };
  apis: {
    p50: number;
    p95: number;
    p99: number;
    sampleSize: number;
  };
  targets: {
    p95Warning: number;
    p95Critical: number;
    p99Critical: number;
  };
}

export interface ErrorRateSummary {
  clientErrorRate: number;
  serverErrorRate: number;
  totalErrors: number;
  breakdown: {
    client: number;
    server: number;
  };
  thresholds: {
    clientWarning: number;
    clientCritical: number;
    serverWarning: number;
    serverCritical: number;
  };
}

export interface EngagementSummary {
  sessions: number;
  activeUsers: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversionRate: number;
  trend: TrendDirection;
}

export interface FunnelStage {
  label: string;
  value: number;
  conversion: number;
}

export interface FunnelSummary {
  signupRate: number;
  activationRate: number;
  dropoffs: Array<{
    stage: string;
    rate: number;
  }>;
  stages: FunnelStage[];
}

export interface MonitoringThresholds {
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
  };
  performance: PerformanceSummary["targets"];
  errors: ErrorRateSummary["thresholds"];
  engagement: {
    minSessions: number;
    maxBounceRate: number;
    minActivationRate: number;
  };
  funnel: {
    checkoutDropoffCritical: number;
  };
}

export interface LaunchMonitoringAlert {
  id: string;
  severity: "info" | "warning" | "critical";
  metric: string;
  message: string;
  currentValue: number;
  threshold: number;
  timestamp: string;
  category: string;
}

export interface LaunchMonitoringData {
  timestamp: string;
  coreWebVitals: CoreWebVitalsSummary;
  performance: PerformanceSummary;
  errors: ErrorRateSummary;
  engagement: EngagementSummary;
  funnel: FunnelSummary;
  alerts: LaunchMonitoringAlert[];
  thresholds: MonitoringThresholds;
}

interface LaunchMonitoringDashboardProps {
  data: LaunchMonitoringData;
  connectionStatus: string;
  connectionQuality?: string;
  isRefreshing: boolean;
  onRefresh: () => void;
}

const severityTone = {
  info: "subdued" as const,
  warning: "attention" as const,
  critical: "critical" as const,
};

export function LaunchMonitoringDashboard({
  data,
  connectionStatus,
  connectionQuality,
  isRefreshing,
  onRefresh,
}: LaunchMonitoringDashboardProps) {
  const activeAlerts = data.alerts.filter((alert) => alert.severity !== "info");

  const overallVitalsStatus = useMemo(() => {
    const vitals = [
      data.coreWebVitals.mobile.lcp.rating,
      data.coreWebVitals.mobile.fid.rating,
      data.coreWebVitals.mobile.cls.rating,
      data.coreWebVitals.desktop.lcp.rating,
      data.coreWebVitals.desktop.fid.rating,
      data.coreWebVitals.desktop.cls.rating,
    ];

    if (vitals.includes("poor")) {
      return { tone: "critical" as const, label: "Action Required" };
    }
    if (vitals.includes("needs-improvement")) {
      return { tone: "warning" as const, label: "Needs Optimization" };
    }
    return { tone: "success" as const, label: "Healthy" };
  }, [data.coreWebVitals]);

  return (
    <Page
      title="Launch Metrics Monitoring"
      subtitle={`Last updated: ${new Date(data.timestamp).toLocaleString()}`}
      titleMetadata={
        <InlineStack gap="200" blockAlign="center">
          <ConnectionIndicator status={connectionStatus} quality={connectionQuality} />
          {activeAlerts.length > 0 && (
            <LiveBadge
              count={activeAlerts.length}
              label="Alerts"
              showPulse
            />
          )}
          <Button onClick={onRefresh} loading={isRefreshing} plain>
            Refresh
          </Button>
        </InlineStack>
      }
    >
      <Layout>
        <Layout.Section>
          <InlineGrid columns={{ xs: 1, sm: 2, md: 4 }} gap="400">
            <SummaryMetricCard
              title="Sessions"
              value={data.engagement.sessions.toLocaleString()}
              helperText="Last hour"
              tone={data.engagement.sessions >= data.thresholds.engagement.minSessions ? "success" : "warning"}
            />
            <SummaryMetricCard
              title="Bounce Rate"
              value={`${data.engagement.bounceRate.toFixed(1)}%`}
              helperText={`Target < ${data.thresholds.engagement.maxBounceRate}%`}
              tone={data.engagement.bounceRate <= data.thresholds.engagement.maxBounceRate ? "success" : "critical"}
            />
            <SummaryMetricCard
              title="Conversion Rate"
              value={`${data.engagement.conversionRate.toFixed(2)}%`}
              helperText="Goal ≥ 3%"
              tone={data.engagement.conversionRate >= 3 ? "success" : "warning"}
            />
            <SummaryMetricCard
              title="Activation Rate"
              value={`${data.funnel.activationRate.toFixed(1)}%`}
              helperText={`Goal ≥ ${data.thresholds.engagement.minActivationRate}%`}
              tone={data.funnel.activationRate >= data.thresholds.engagement.minActivationRate ? "success" : "critical"}
            />
          </InlineGrid>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack gap="200" blockAlign="center">
                <Text as="h2" variant="headingMd">
                  Core Web Vitals
                </Text>
                <Badge tone={overallVitalsStatus.tone}>{overallVitalsStatus.label}</Badge>
              </InlineStack>
              <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
                <VitalsPanel
                  title="Mobile"
                  vitals={data.coreWebVitals.mobile}
                  thresholds={data.thresholds.coreWebVitals}
                />
                <VitalsPanel
                  title="Desktop"
                  vitals={data.coreWebVitals.desktop}
                  thresholds={data.thresholds.coreWebVitals}
                />
              </InlineGrid>
              {data.coreWebVitals.recommendations.length > 0 && (
                <Card sectioned>
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingSm">
                      Optimization Recommendations
                    </Text>
                    <List type="number">
                      {data.coreWebVitals.recommendations.map((item, index) => (
                        <List.Item key={`${item}-${index}`}>{item}</List.Item>
                      ))}
                    </List>
                  </BlockStack>
                </Card>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingMd">
                    Performance Latency
                  </Text>
                  <Badge tone="subdued">P95 target {data.performance.targets.p95Warning}ms</Badge>
                </InlineStack>
                <LatencyTable title="Routes" metrics={data.performance.routes} thresholds={data.performance.targets} />
                <Divider />
                <LatencyTable title="APIs" metrics={data.performance.apis} thresholds={data.performance.targets} />
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingMd">
                    Error Rates
                  </Text>
                  <Badge tone="subdued">Goal &lt; {data.errors.thresholds.serverWarning}% server</Badge>
                </InlineStack>
                <ErrorRateBar
                  label="Server"
                  value={data.errors.serverErrorRate}
                  threshold={data.errors.thresholds.serverWarning}
                  critical={data.errors.thresholds.serverCritical}
                />
                <ErrorRateBar
                  label="Client"
                  value={data.errors.clientErrorRate}
                  threshold={data.errors.thresholds.clientWarning}
                  critical={data.errors.thresholds.clientCritical}
                />
                <Text as="p" tone="subdued" variant="bodySm">
                  {data.errors.totalErrors.toLocaleString()} total errors in the monitoring window.
                </Text>
              </BlockStack>
            </Card>
          </InlineGrid>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h2" variant="headingMd">
                  User Engagement
                </Text>
                <Badge tone={trendTone(data.engagement.trend)}>Trend: {data.engagement.trend}</Badge>
              </InlineStack>
              <InlineGrid columns={{ xs: 1, md: 3 }} gap="300">
                <EngagementMetric
                  label="Active Users"
                  value={data.engagement.activeUsers.toLocaleString()}
                  helper="Rolling 24h"
                />
                <EngagementMetric
                  label="Avg. Session Duration"
                  value={`${Math.round(data.engagement.avgSessionDuration / 60)}m ${(data.engagement.avgSessionDuration % 60).toFixed(0)}s`}
                  helper="Weighted by sessions"
                />
                <EngagementMetric
                  label="Pages per Session"
                  value={(data.engagement.sessions > 0
                    ? (data.funnel.stages[0]?.value || 0) / data.engagement.sessions
                    : 0
                  ).toFixed(2)}
                  helper="Calculated from funnel"
                />
              </InlineGrid>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h2" variant="headingMd">
                  Conversion Funnel
                </Text>
                <Badge tone={data.funnel.dropoffs.find((d) => d.stage === "Checkout → Purchase" && d.rate >= data.thresholds.funnel.checkoutDropoffCritical)
                  ? "critical"
                  : "success"}
                >
                  Checkout dropoff target &lt; {data.thresholds.funnel.checkoutDropoffCritical}%
                </Badge>
              </InlineStack>
              <InlineGrid columns={{ xs: 1, md: data.funnel.stages.length }} gap="300">
                {data.funnel.stages.map((stage) => (
                  <FunnelStageCard key={stage.label} stage={stage} />
                ))}
              </InlineGrid>
              <BlockStack gap="100">
                {data.funnel.dropoffs.map((drop) => (
                  <Text
                    as="p"
                    key={drop.stage}
                    tone={drop.rate >= data.thresholds.funnel.checkoutDropoffCritical && drop.stage === "Checkout → Purchase" ? "critical" : "subdued"}
                  >
                    {drop.stage}: {drop.rate.toFixed(1)}% dropoff
                  </Text>
                ))}
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h2" variant="headingMd">
                  Alert Thresholds
                </Text>
                <Badge tone="subdued">Configured</Badge>
              </InlineStack>
              <InlineGrid columns={{ xs: 1, md: 3 }} gap="300">
                <ThresholdCard
                  title="Core Web Vitals"
                  items={[
                    `LCP ≤ ${data.thresholds.coreWebVitals.lcp}ms`,
                    `FID ≤ ${data.thresholds.coreWebVitals.fid}ms`,
                    `CLS ≤ ${data.thresholds.coreWebVitals.cls}`,
                  ]}
                />
                <ThresholdCard
                  title="Performance"
                  items={[
                    `P95 warning: ${data.performance.targets.p95Warning}ms`,
                    `P95 critical: ${data.performance.targets.p95Critical}ms`,
                    `P99 critical: ${data.performance.targets.p99Critical}ms`,
                  ]}
                />
                <ThresholdCard
                  title="Errors & Engagement"
                  items={[
                    `Server error warning: ${data.errors.thresholds.serverWarning}%`,
                    `Client error warning: ${data.errors.thresholds.clientWarning}%`,
                    `Bounce rate target: < ${data.thresholds.engagement.maxBounceRate}%`,
                  ]}
                />
              </InlineGrid>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h2" variant="headingMd">
                  Active Alerts
                </Text>
                <Badge tone={activeAlerts.length > 0 ? "critical" : "success"}>
                  {activeAlerts.length > 0 ? `${activeAlerts.length} active` : "No active alerts"}
                </Badge>
              </InlineStack>
              {data.alerts.length === 0 ? (
                <Text as="p" tone="subdued">
                  Monitoring clean. No alerts triggered in the selected window.
                </Text>
              ) : (
                <BlockStack gap="200">
                  {data.alerts.map((alert) => (
                    <Card key={alert.id} subdued>
                      <BlockStack gap="150">
                        <InlineStack align="space-between" blockAlign="center">
                          <Badge tone={severityTone[alert.severity]}>{alert.category}</Badge>
                          <Text as="p" tone="subdued" variant="bodySm">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </Text>
                        </InlineStack>
                        <Text as="h3" variant="headingSm">
                          {alert.metric}
                        </Text>
                        <Text as="p" variant="bodyMd">
                          {alert.message}
                        </Text>
                        <Text as="p" tone="subdued" variant="bodySm">
                          Current: {formatNumber(alert.currentValue)} · Threshold: {formatNumber(alert.threshold)}
                        </Text>
                      </BlockStack>
                    </Card>
                  ))}
                </BlockStack>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

function SummaryMetricCard({
  title,
  value,
  helperText,
  tone,
}: {
  title: string;
  value: string;
  helperText?: string;
  tone: "success" | "critical" | "warning";
}) {
  return (
    <Card tone={tone}>
      <BlockStack gap="150">
        <Text as="h3" variant="bodyMd">
          {title}
        </Text>
        <Text as="p" variant="headingLg">
          {value}
        </Text>
        {helperText && (
          <Text as="p" tone="subdued" variant="bodySm">
            {helperText}
          </Text>
        )}
      </BlockStack>
    </Card>
  );
}

function VitalsPanel({
  title,
  vitals,
  thresholds,
}: {
  title: string;
  vitals: CoreWebVitalsSummary["mobile"];
  thresholds: MonitoringThresholds["coreWebVitals"];
}) {
  return (
    <Card>
      <BlockStack gap="200">
        <Text as="h3" variant="headingSm">
          {title}
        </Text>
        <VitalRow label="LCP" metric={vitals.lcp} target={thresholds.lcp} />
        <VitalRow label="FID" metric={vitals.fid} target={thresholds.fid} />
        <VitalRow label="CLS" metric={vitals.cls} target={thresholds.cls} />
        <Text as="p" tone="subdued" variant="bodySm">
          Overall score: {(vitals.overallScore * 100).toFixed(0)}
        </Text>
      </BlockStack>
    </Card>
  );
}

function VitalRow({
  label,
  metric,
  target,
}: {
  label: string;
  metric: VitalSummary;
  target: number;
}) {
  const tone = metric.rating === "good" ? "success" : metric.rating === "needs-improvement" ? "warning" : "critical";

  return (
    <InlineStack align="space-between" blockAlign="center">
      <InlineStack gap="200" blockAlign="center">
        <Badge tone={tone}>{label}</Badge>
        <Text as="p" variant="bodyMd">
          {formatNumber(metric.value)} {metric.unit}
        </Text>
      </InlineStack>
      <Text as="p" tone="subdued" variant="bodySm">
        Target ≤ {formatNumber(target)} {metric.unit}
      </Text>
    </InlineStack>
  );
}

function LatencyTable({
  title,
  metrics,
  thresholds,
}: {
  title: string;
  metrics: PerformanceSummary["routes"];
  thresholds: PerformanceSummary["targets"];
}) {
  return (
    <BlockStack gap="150">
      <Text as="h3" variant="headingSm">
        {title}
      </Text>
      <InlineGrid columns={{ xs: 2, md: 4 }} gap="150">
        <LatencyStat label="P50" value={metrics.p50} unit="ms" />
        <LatencyStat label="P95" value={metrics.p95} unit="ms" warning={thresholds.p95Warning} critical={thresholds.p95Critical} />
        <LatencyStat label="P99" value={metrics.p99} unit="ms" critical={thresholds.p99Critical} />
        <LatencyStat label="Samples" value={metrics.sampleSize} />
      </InlineGrid>
    </BlockStack>
  );
}

function LatencyStat({
  label,
  value,
  unit,
  warning,
  critical,
}: {
  label: string;
  value: number;
  unit?: string;
  warning?: number;
  critical?: number;
}) {
  let tone: "subdued" | "warning" | "critical" = "subdued";
  if (typeof critical === "number" && value >= critical) {
    tone = "critical";
  } else if (typeof warning === "number" && value >= warning) {
    tone = "warning";
  }

  return (
    <Card subdued>
      <BlockStack gap="100">
        <Text as="p" tone="subdued" variant="bodySm">
          {label}
        </Text>
        <Text as="p" variant="headingMd" tone={tone}>
          {formatNumber(value)}{unit ? ` ${unit}` : ""}
        </Text>
      </BlockStack>
    </Card>
  );
}

function ErrorRateBar({
  label,
  value,
  threshold,
  critical,
}: {
  label: string;
  value: number;
  threshold: number;
  critical: number;
}) {
  const tone: "success" | "warning" | "critical" =
    value >= critical ? "critical" : value >= threshold ? "warning" : "success";

  return (
    <BlockStack gap="100">
      <InlineStack align="space-between" blockAlign="center">
        <Text as="p" variant="bodyMd">
          {label}
        </Text>
        <Text as="p" tone={tone}>
          {value.toFixed(2)}%
        </Text>
      </InlineStack>
      <ProgressBar
        progress={Math.min(100, value)}
        color={tone === "critical" ? "critical" : tone === "warning" ? "highlight" : "success"}
      />
      <Text as="p" tone="subdued" variant="bodySm">
        Threshold: {threshold}% (critical {critical}%)
      </Text>
    </BlockStack>
  );
}

function EngagementMetric({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <Card>
      <BlockStack gap="100">
        <Text as="p" tone="subdued" variant="bodySm">
          {label}
        </Text>
        <Text as="p" variant="headingMd">
          {value}
        </Text>
        {helper && (
          <Text as="p" tone="subdued" variant="bodySm">
            {helper}
          </Text>
        )}
      </BlockStack>
    </Card>
  );
}

function FunnelStageCard({ stage }: { stage: FunnelStage }) {
  return (
    <Card>
      <BlockStack gap="100">
        <Text as="p" variant="bodyMd">
          {stage.label}
        </Text>
        <Text as="p" variant="headingMd">
          {stage.value.toLocaleString()}
        </Text>
        <Text as="p" tone="subdued" variant="bodySm">
          {stage.conversion.toFixed(1)}% conversion
        </Text>
      </BlockStack>
    </Card>
  );
}

function ThresholdCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <BlockStack gap="100">
        <Text as="p" variant="bodyMd">
          {title}
        </Text>
        <List type="bullet">
          {items.map((item) => (
            <List.Item key={item}>{item}</List.Item>
          ))}
        </List>
      </BlockStack>
    </Card>
  );
}

function trendTone(trend: TrendDirection) {
  switch (trend) {
    case "up":
      return "success";
    case "down":
      return "critical";
    default:
      return "subdued";
  }
}

function formatNumber(value: number): string {
  if (Number.isInteger(value)) {
    return value.toLocaleString();
  }
  return Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

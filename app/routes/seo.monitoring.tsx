/**
 * SEO Health Monitoring Dashboard
 * 
 * Real-time SEO health monitoring with:
 * - Ranking tracking and alerts
 * - Critical issue alerts (48h SLA)
 * - Search Console integration
 * - Automated issue resolution workflow
 */

import { type LoaderFunctionArgs, type MetaFunction } from "react-router";
import { useLoaderData } from "react-router";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  InlineStack,
  Text,
  Badge,
  DataTable,
  Button,
  Divider,
  Banner,
  ProgressBar,
} from "@shopify/polaris";
import { trackRankings, detectRankingAlerts, getActiveAlerts, type RankingData, type RankingAlert } from "~/services/seo/ranking-tracker";
import { getSearchConsoleSummary } from "~/lib/seo/search-console";
import { buildSeoAnomalyBundle } from "~/lib/seo/pipeline";
import { getLandingPageAnomalies } from "~/services/ga/ingest";
import {
  detectTrafficAnomalies,
  detectRankingAnomalies,
  detectVitalsAnomalies,
  detectCrawlAnomalies,
} from "~/lib/seo/anomalies";

interface LoaderData {
  rankings: RankingData[];
  alerts: RankingAlert[];
  searchConsole: any;
  anomalies: any[];
  healthScore: number;
  timestamp: string;
}

export const meta: MetaFunction = () => {
  return [
    { title: "SEO Health Monitoring Dashboard | Hot Dash" },
    {
      name: "description",
      content:
        "Monitor keyword rankings, crawl anomalies, search console coverage, and SEO health alerts for your Shopify store inside Hot Dash.",
    },
    { name: "robots", content: "noindex, nofollow" },
    { property: "og:title", content: "SEO Health Monitoring Dashboard" },
    {
      property: "og:description",
      content:
        "Centralized SEO monitoring with health scores, ranking alerts, and traffic anomaly detection for Shopify brands.",
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const shopDomain = url.searchParams.get("shop") || "default-shop.myshopify.com";

    // Track current rankings
    const rankings = await trackRankings();

    // Detect ranking alerts
    const rankingAlerts = await detectRankingAlerts(rankings);

    // Get active alerts (within SLA)
    const activeAlerts = await getActiveAlerts();

    // Get Search Console summary
    const searchConsole = await getSearchConsoleSummary();

    // Get traffic anomalies
    const gaResult = await getLandingPageAnomalies({ shopDomain });
    const trafficInputs = gaResult.data
      .filter((item) => item.isAnomaly)
      .map((item) => ({
        landingPage: item.landingPage,
        currentSessions: item.sessions,
        previousSessions: Math.round(item.sessions / (1 + item.wowDelta)),
        wowDelta: item.wowDelta,
      }));

    const factMetadata = (gaResult.fact.metadata ?? {}) as Record<string, any>;
    const generatedAt =
      typeof factMetadata?.generatedAt === "string"
        ? factMetadata.generatedAt
        : undefined;

    // Build anomaly bundle
    const bundle = buildSeoAnomalyBundle({
      shopDomain,
      traffic: detectTrafficAnomalies(trafficInputs),
      ranking: detectRankingAnomalies([]),
      vitals: detectVitalsAnomalies([]),
      crawl: detectCrawlAnomalies([]),
      generatedAt,
      sources: {
        traffic: gaResult.source,
        ranking: "search-console",
        vitals: "mock",
        crawl: "mock",
      },
      isSampled: Boolean(factMetadata?.sampled),
    });

    // Calculate health score
    const healthScore = calculateHealthScore(rankings, activeAlerts, bundle.anomalies);

    return Response.json({
      rankings: rankings.slice(0, 20), // Top 20 keywords
      alerts: activeAlerts,
      searchConsole,
      anomalies: bundle.anomalies,
      healthScore,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[SEO Monitoring] Error:", error);
    return Response.json(
      {
        rankings: [],
        alerts: [],
        searchConsole: null,
        anomalies: [],
        healthScore: 0,
        timestamp: new Date().toISOString(),
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Calculate overall SEO health score (0-100)
 */
function calculateHealthScore(
  rankings: RankingData[],
  alerts: RankingAlert[],
  anomalies: any[]
): number {
  let score = 100;

  // Deduct for critical alerts
  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
  score -= criticalAlerts * 10;

  // Deduct for warning alerts
  const warningAlerts = alerts.filter(a => a.severity === 'warning').length;
  score -= warningAlerts * 5;

  // Deduct for critical anomalies
  const criticalAnomalies = anomalies.filter(a => a.severity === 'critical').length;
  score -= criticalAnomalies * 8;

  // Deduct for warning anomalies
  const warningAnomalies = anomalies.filter(a => a.severity === 'warning').length;
  score -= warningAnomalies * 3;

  // Deduct for ranking drops
  const rankingDrops = rankings.filter(r => r.change < -3).length;
  score -= rankingDrops * 2;

  return Math.max(0, Math.min(100, score));
}

function getHealthScoreColor(score: number): 'success' | 'warning' | 'critical' {
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  return 'critical';
}

function getSeverityBadge(severity: 'critical' | 'warning' | 'info') {
  switch (severity) {
    case 'critical':
      return { tone: 'critical' as const, children: 'Critical' };
    case 'warning':
      return { tone: 'warning' as const, children: 'Warning' };
    case 'info':
      return { tone: 'info' as const, children: 'Info' };
  }
}

function formatTimeRemaining(slaDeadline: string): string {
  const now = new Date();
  const deadline = new Date(slaDeadline);
  const hoursRemaining = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));
  
  if (hoursRemaining < 0) return 'Overdue';
  if (hoursRemaining < 1) return '< 1 hour';
  if (hoursRemaining < 24) return `${hoursRemaining}h`;
  return `${Math.floor(hoursRemaining / 24)}d ${hoursRemaining % 24}h`;
}

export default function SEOMonitoringDashboard() {
  const data = useLoaderData<LoaderData>();

  const criticalAlerts = data.alerts.filter(a => a.severity === 'critical');
  const warningAlerts = data.alerts.filter(a => a.severity === 'warning');

  // Prepare ranking table rows
  const rankingRows = data.rankings.map(ranking => [
    ranking.keyword,
    ranking.currentPosition.toString(),
    ranking.previousPosition.toString(),
    <Text as="span" tone={ranking.change > 0 ? 'success' : ranking.change < 0 ? 'critical' : undefined}>
      {ranking.change > 0 ? '+' : ''}{ranking.change}
    </Text>,
    ranking.clicks.toString(),
    ranking.impressions.toLocaleString(),
    `${(ranking.ctr * 100).toFixed(2)}%`,
  ]);

  // Prepare alert table rows
  const alertRows = data.alerts.map(alert => [
    <Badge {...getSeverityBadge(alert.severity)} />,
    alert.keyword,
    alert.currentPosition.toString(),
    alert.previousPosition.toString(),
    <Text as="span" tone="critical">
      {alert.change}
    </Text>,
    formatTimeRemaining(alert.slaDeadline),
    <Button size="slim">Resolve</Button>,
  ]);

  return (
    <Page
      title="SEO Health Monitoring"
      subtitle="Real-time SEO monitoring with critical issue alerts"
      backAction={{ content: "Dashboard", url: "/" }}
    >
      <Layout>
        {/* Health Score */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h2" variant="headingLg">
                  SEO Health Score
                </Text>
                <Badge tone={getHealthScoreColor(data.healthScore)}>
                  {data.healthScore}/100
                </Badge>
              </InlineStack>
              <ProgressBar
                progress={data.healthScore}
                tone={getHealthScoreColor(data.healthScore)}
                size="small"
              />
              <Text as="p" variant="bodySm" tone="subdued">
                Last updated: {new Date(data.timestamp).toLocaleString()}
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Critical Alerts Banner */}
        {criticalAlerts.length > 0 && (
          <Layout.Section>
            <Banner tone="critical" title={`${criticalAlerts.length} Critical Alert${criticalAlerts.length > 1 ? 's' : ''}`}>
              <p>
                Critical SEO issues detected that require immediate attention within 48 hours.
                Review and resolve alerts below to maintain SEO health.
              </p>
            </Banner>
          </Layout.Section>
        )}

        {/* Alert Summary */}
        <Layout.Section>
          <InlineStack gap="400">
            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  Critical Alerts
                </Text>
                <Text as="p" variant="heading2xl" fontWeight="bold">
                  {criticalAlerts.length}
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  48h SLA
                </Text>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  Warning Alerts
                </Text>
                <Text as="p" variant="heading2xl" fontWeight="bold">
                  {warningAlerts.length}
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Monitor closely
                </Text>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  Total Alerts
                </Text>
                <Text as="p" variant="heading2xl" fontWeight="bold">
                  {data.alerts.length}
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Active issues
                </Text>
              </BlockStack>
            </Card>
          </InlineStack>
        </Layout.Section>

        {/* Active Alerts */}
        {data.alerts.length > 0 && (
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingLg">
                  Active Alerts (48h SLA)
                </Text>
                <Divider />
                <DataTable
                  columnContentTypes={['text', 'text', 'numeric', 'numeric', 'numeric', 'text', 'text']}
                  headings={['Severity', 'Keyword', 'Current', 'Previous', 'Change', 'Time Left', 'Action']}
                  rows={alertRows}
                />
              </BlockStack>
            </Card>
          </Layout.Section>
        )}

        {/* Ranking Tracking */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h2" variant="headingLg">
                  Keyword Rankings (Top 20)
                </Text>
                <Button>View All</Button>
              </InlineStack>
              <Divider />
              {data.rankings.length > 0 ? (
                <DataTable
                  columnContentTypes={['text', 'numeric', 'numeric', 'numeric', 'numeric', 'numeric', 'numeric']}
                  headings={['Keyword', 'Position', 'Previous', 'Change', 'Clicks', 'Impressions', 'CTR']}
                  rows={rankingRows}
                />
              ) : (
                <Text as="p" variant="bodyLg" alignment="center">
                  No ranking data available
                </Text>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

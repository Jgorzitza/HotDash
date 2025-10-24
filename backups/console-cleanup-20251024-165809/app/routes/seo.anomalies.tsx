/**
 * SEO Monitoring Dashboard
 * 
 * Comprehensive SEO monitoring including:
 * - Traffic anomalies
 * - Ranking changes
 * - Core Web Vitals
 * - Crawl errors
 * - Search Console metrics
 */

import { type LoaderFunctionArgs } from "react-router";
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
} from "@shopify/polaris";
import { buildSeoAnomalyBundle } from "~/lib/seo/pipeline";
import { buildSeoDiagnostics } from "~/lib/seo/diagnostics";
import { getLandingPageAnomalies } from "~/services/ga/ingest";
import {
  detectTrafficAnomalies,
  detectRankingAnomalies,
  detectVitalsAnomalies,
  detectCrawlAnomalies,
  type SEOAnomaly,
} from "~/lib/seo/anomalies";
import { getSearchConsoleSummary } from "~/lib/seo/search-console";

interface LoaderData {
  anomalies: SEOAnomaly[];
  diagnostics: any;
  searchConsole: any;
  timestamp: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const shopDomain = url.searchParams.get("shop") || "default-shop.myshopify.com";

  try {
    // Fetch traffic anomalies from GA4
    const gaResult = await getLandingPageAnomalies({ shopDomain });

    // Convert GA anomalies to TrafficAnomalyInput format
    const trafficInputs = gaResult.data
      .filter((item) => item.isAnomaly)
      .map((item) => ({
        landingPage: item.landingPage,
        currentSessions: item.sessions,
        previousSessions: Math.round(item.sessions / (1 + item.wowDelta)),
        wowDelta: item.wowDelta,
      }));

    // Detect all anomaly types
    const factMetadata = (gaResult.fact.metadata ?? {}) as Record<string, any>;
    const generatedAt =
      typeof factMetadata?.generatedAt === "string"
        ? factMetadata.generatedAt
        : undefined;
    const isSampled = Boolean(factMetadata?.sampled);

    // Mock data for ranking, vitals, and crawl (replace with real data when available)
    const mockRankingData: any[] = [];
    const mockVitalsData: any[] = [];
    const mockCrawlErrors: any[] = [];

    const bundle = buildSeoAnomalyBundle({
      shopDomain,
      traffic: detectTrafficAnomalies(trafficInputs),
      ranking: detectRankingAnomalies(mockRankingData),
      vitals: detectVitalsAnomalies(mockVitalsData),
      crawl: detectCrawlAnomalies(mockCrawlErrors),
      generatedAt,
      sources: {
        traffic: gaResult.source,
        ranking: "mock",
        vitals: "mock",
        crawl: "mock",
      },
      isSampled,
    });

    const diagnostics = buildSeoDiagnostics(bundle);

    // Fetch Search Console summary
    const searchConsole = await getSearchConsoleSummary();

    return Response.json({
      anomalies: bundle.anomalies,
      diagnostics,
      searchConsole,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[SEO Dashboard] Error:", error);
    return Response.json(
      {
        anomalies: [],
        diagnostics: null,
        searchConsole: null,
        timestamp: new Date().toISOString(),
        error: error.message,
      },
      { status: 500 }
    );
  }
}

function getSeverityBadge(severity: "critical" | "warning" | "info") {
  switch (severity) {
    case "critical":
      return { tone: "critical" as const, children: "Critical" };
    case "warning":
      return { tone: "warning" as const, children: "Warning" };
    case "info":
      return { tone: "info" as const, children: "Info" };
  }
}

function getAnomalyTypeBadge(type: string) {
  switch (type) {
    case "traffic":
      return { tone: "info" as const, children: "Traffic" };
    case "ranking":
      return { tone: "attention" as const, children: "Ranking" };
    case "vitals":
      return { tone: "warning" as const, children: "Web Vitals" };
    case "crawl":
      return { tone: "critical" as const, children: "Crawl Error" };
    default:
      return { tone: "info" as const, children: type };
  }
}

export default function SEOAnomaliesDashboard() {
  const data = useLoaderData<LoaderData>();

  // Group anomalies by severity
  const criticalAnomalies = data.anomalies.filter((a) => a.severity === "critical");
  const warningAnomalies = data.anomalies.filter((a) => a.severity === "warning");
  const infoAnomalies = data.anomalies.filter((a) => a.severity === "info");

  // Prepare data table rows
  const anomalyRows = data.anomalies.map((anomaly) => [
    <Badge {...getSeverityBadge(anomaly.severity)} />,
    <Badge {...getAnomalyTypeBadge(anomaly.type)} />,
    anomaly.title,
    anomaly.description,
    anomaly.affectedUrl || "N/A",
    anomaly.metric.current.toString(),
    anomaly.metric.changePercent
      ? `${anomaly.metric.changePercent > 0 ? "+" : ""}${anomaly.metric.changePercent.toFixed(1)}%`
      : "N/A",
  ]);

  return (
    <Page
      title="SEO Monitoring Dashboard"
      subtitle="Comprehensive SEO health monitoring and anomaly detection"
      backAction={{ content: "Dashboard", url: "/" }}
    >
      <Layout>
        {/* Summary Cards */}
        <Layout.Section>
          <InlineStack gap="400">
            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  Critical Issues
                </Text>
                <Text as="p" variant="heading2xl" fontWeight="bold">
                  {criticalAnomalies.length}
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Require immediate attention
                </Text>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  Warnings
                </Text>
                <Text as="p" variant="heading2xl" fontWeight="bold">
                  {warningAnomalies.length}
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Monitor closely
                </Text>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  Info
                </Text>
                <Text as="p" variant="heading2xl" fontWeight="bold">
                  {infoAnomalies.length}
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  For awareness
                </Text>
              </BlockStack>
            </Card>
          </InlineStack>
        </Layout.Section>

        {/* Search Console Metrics */}
        {data.searchConsole && (
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingLg">
                  Search Console Metrics (Last 30 Days)
                </Text>
                <Divider />
                <InlineStack gap="600">
                  <BlockStack gap="200">
                    <Text as="p" variant="bodySm" tone="subdued">
                      Total Clicks
                    </Text>
                    <Text as="p" variant="headingLg" fontWeight="bold">
                      {data.searchConsole.analytics.clicks.toLocaleString()}
                    </Text>
                    <Text
                      as="p"
                      variant="bodySm"
                      tone={data.searchConsole.analytics.clicksChange >= 0 ? "success" : "critical"}
                    >
                      {data.searchConsole.analytics.clicksChange >= 0 ? "+" : ""}
                      {data.searchConsole.analytics.clicksChange.toFixed(1)}%
                    </Text>
                  </BlockStack>

                  <BlockStack gap="200">
                    <Text as="p" variant="bodySm" tone="subdued">
                      Total Impressions
                    </Text>
                    <Text as="p" variant="headingLg" fontWeight="bold">
                      {data.searchConsole.analytics.impressions.toLocaleString()}
                    </Text>
                    <Text
                      as="p"
                      variant="bodySm"
                      tone={data.searchConsole.analytics.impressionsChange >= 0 ? "success" : "critical"}
                    >
                      {data.searchConsole.analytics.impressionsChange >= 0 ? "+" : ""}
                      {data.searchConsole.analytics.impressionsChange.toFixed(1)}%
                    </Text>
                  </BlockStack>

                  <BlockStack gap="200">
                    <Text as="p" variant="bodySm" tone="subdued">
                      Average CTR
                    </Text>
                    <Text as="p" variant="headingLg" fontWeight="bold">
                      {(data.searchConsole.analytics.ctr * 100).toFixed(2)}%
                    </Text>
                    <Text
                      as="p"
                      variant="bodySm"
                      tone={data.searchConsole.analytics.ctrChange >= 0 ? "success" : "critical"}
                    >
                      {data.searchConsole.analytics.ctrChange >= 0 ? "+" : ""}
                      {data.searchConsole.analytics.ctrChange.toFixed(1)}%
                    </Text>
                  </BlockStack>

                  <BlockStack gap="200">
                    <Text as="p" variant="bodySm" tone="subdued">
                      Average Position
                    </Text>
                    <Text as="p" variant="headingLg" fontWeight="bold">
                      {data.searchConsole.analytics.position.toFixed(1)}
                    </Text>
                    <Text
                      as="p"
                      variant="bodySm"
                      tone={data.searchConsole.analytics.positionChange <= 0 ? "success" : "critical"}
                    >
                      {data.searchConsole.analytics.positionChange >= 0 ? "+" : ""}
                      {data.searchConsole.analytics.positionChange.toFixed(1)}
                    </Text>
                  </BlockStack>
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        )}

        {/* Anomalies Table */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h2" variant="headingLg">
                  All Anomalies
                </Text>
                <Button>Export Report</Button>
              </InlineStack>
              <Divider />
              {data.anomalies.length > 0 ? (
                <DataTable
                  columnContentTypes={["text", "text", "text", "text", "text", "numeric", "numeric"]}
                  headings={["Severity", "Type", "Title", "Description", "URL", "Current", "Change"]}
                  rows={anomalyRows}
                />
              ) : (
                <BlockStack gap="200">
                  <Text as="p" variant="bodyLg" alignment="center">
                    No anomalies detected
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued" alignment="center">
                    Your SEO metrics are looking healthy!
                  </Text>
                </BlockStack>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}


/**
 * Data Quality Monitoring Dashboard
 * 
 * Task: DATA-QUALITY-001
 * MCP Evidence: artifacts/data/2025-10-24/mcp/data-quality-monitoring.jsonl
 * 
 * Provides comprehensive data quality monitoring interface:
 * - Real-time quality metrics
 * - Validation rule status
 * - Anomaly detection alerts
 * - Data freshness monitoring
 * - Quality trends and history
 */

import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineGrid,
  Badge,
  DataTable,
  Banner,
  ProgressBar,
} from "@shopify/polaris";
import { DataQualityService } from "~/services/data/data-quality.service";
import { authenticate } from "~/shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  // Fetch all data quality metrics
  const [
    validationResults,
    qualityMetrics,
    anomalies,
    freshnessChecks
  ] = await Promise.all([
    DataQualityService.runValidationRules(),
    DataQualityService.calculateQualityMetrics(),
    DataQualityService.detectAnomalies('database'),
    DataQualityService.checkDataFreshness()
  ]);

  // Calculate overall quality score
  const overallScore = qualityMetrics.reduce((sum, m) => sum + m.qualityScore, 0) / qualityMetrics.length;

  return json({
    validationResults,
    qualityMetrics,
    anomalies,
    freshnessChecks,
    overallScore: Math.round(overallScore),
    timestamp: new Date().toISOString()
  });
};

export default function DataQualityDashboard() {
  const {
    validationResults,
    qualityMetrics,
    anomalies,
    freshnessChecks,
    overallScore,
    timestamp
  } = useLoaderData<typeof loader>();

  // Determine overall status
  const getStatusBadge = (score: number) => {
    if (score >= 90) return <Badge tone="success">Excellent</Badge>;
    if (score >= 75) return <Badge tone="info">Good</Badge>;
    if (score >= 60) return <Badge tone="warning">Fair</Badge>;
    return <Badge tone="critical">Poor</Badge>;
  };

  // Count critical issues
  const criticalAnomalies = anomalies.filter(a => a.severity === 'critical').length;
  const staleDataSources = freshnessChecks.results.filter(r => r.isStale).length;
  const failedValidations = validationResults.failed;

  return (
    <Page
      title="Data Quality Monitoring"
      subtitle={`Last updated: ${new Date(timestamp).toLocaleString()}`}
    >
      <Layout>
        {/* Critical Alerts */}
        {(criticalAnomalies > 0 || staleDataSources > 0 || failedValidations > 0) && (
          <Layout.Section>
            <Banner
              title="Data Quality Issues Detected"
              tone="critical"
            >
              <BlockStack gap="200">
                {criticalAnomalies > 0 && (
                  <Text as="p">
                    {criticalAnomalies} critical anomal{criticalAnomalies === 1 ? 'y' : 'ies'} detected
                  </Text>
                )}
                {staleDataSources > 0 && (
                  <Text as="p">
                    {staleDataSources} data source{staleDataSources === 1 ? ' is' : 's are'} stale
                  </Text>
                )}
                {failedValidations > 0 && (
                  <Text as="p">
                    {failedValidations} validation rule{failedValidations === 1 ? '' : 's'} failed
                  </Text>
                )}
              </BlockStack>
            </Banner>
          </Layout.Section>
        )}

        {/* Overall Quality Score */}
        <Layout.Section>
          <InlineGrid columns={{ xs: 1, sm: 2, md: 4 }} gap="400">
            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  Overall Quality Score
                </Text>
                <Text as="p" variant="heading2xl">
                  {overallScore}%
                </Text>
                {getStatusBadge(overallScore)}
                <ProgressBar progress={overallScore} size="small" tone={overallScore >= 75 ? "success" : "critical"} />
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  Validation Rules
                </Text>
                <Text as="p" variant="heading2xl">
                  {validationResults.passed}/{validationResults.totalRules}
                </Text>
                <Badge tone={validationResults.failed === 0 ? "success" : "warning"}>
                  {validationResults.failed} Failed
                </Badge>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  Anomalies
                </Text>
                <Text as="p" variant="heading2xl">
                  {anomalies.length}
                </Text>
                <Badge tone={criticalAnomalies > 0 ? "critical" : "info"}>
                  {criticalAnomalies} Critical
                </Badge>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  Data Freshness
                </Text>
                <Text as="p" variant="heading2xl">
                  {freshnessChecks.healthy}/{freshnessChecks.totalChecks}
                </Text>
                <Badge tone={staleDataSources > 0 ? "warning" : "success"}>
                  {staleDataSources} Stale
                </Badge>
              </BlockStack>
            </Card>
          </InlineGrid>
        </Layout.Section>

        {/* Quality Metrics by Data Source */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingLg">
                Quality Metrics by Data Source
              </Text>
              <DataTable
                columnContentTypes={['text', 'text', 'text', 'numeric', 'numeric', 'numeric', 'numeric']}
                headings={[
                  'Data Source',
                  'Table',
                  'Metric Type',
                  'Total Records',
                  'Valid Records',
                  'Quality Score',
                  'Status'
                ]}
                rows={qualityMetrics.map(metric => [
                  metric.dataSource,
                  metric.tableName || '-',
                  metric.metricType,
                  metric.totalRecords.toLocaleString(),
                  metric.validRecords.toLocaleString(),
                  `${metric.qualityScore}%`,
                  metric.qualityScore >= 90 ? '✅ Excellent' :
                  metric.qualityScore >= 75 ? '✓ Good' :
                  metric.qualityScore >= 60 ? '⚠ Fair' : '❌ Poor'
                ])}
              />
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Validation Rules Status */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingLg">
                Validation Rules
              </Text>
              <DataTable
                columnContentTypes={['text', 'text', 'text', 'text', 'text']}
                headings={[
                  'Rule Name',
                  'Type',
                  'Severity',
                  'Last Run',
                  'Status'
                ]}
                rows={validationResults.results.map(result => [
                  result.ruleName,
                  result.ruleType || '-',
                  result.severity || '-',
                  result.lastRun ? new Date(result.lastRun).toLocaleString() : 'Never',
                  result.passed ? '✅ Passed' : '❌ Failed'
                ])}
              />
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Anomalies */}
        {anomalies.length > 0 && (
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingLg">
                  Detected Anomalies
                </Text>
                <DataTable
                  columnContentTypes={['text', 'text', 'text', 'numeric', 'numeric', 'text', 'text']}
                  headings={[
                    'Type',
                    'Data Source',
                    'Table',
                    'Expected',
                    'Actual',
                    'Deviation',
                    'Severity'
                  ]}
                  rows={anomalies.map(anomaly => [
                    anomaly.anomalyType,
                    anomaly.dataSource,
                    anomaly.tableName || '-',
                    anomaly.expectedValue?.toLocaleString() || '-',
                    anomaly.actualValue?.toLocaleString() || '-',
                    anomaly.deviationPct ? `${anomaly.deviationPct}%` : '-',
                    anomaly.severity === 'critical' ? '🔴 Critical' :
                    anomaly.severity === 'warning' ? '⚠️ Warning' : 'ℹ️ Info'
                  ])}
                />
              </BlockStack>
            </Card>
          </Layout.Section>
        )}

        {/* Data Freshness */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingLg">
                Data Freshness Monitoring
              </Text>
              <DataTable
                columnContentTypes={['text', 'text', 'text', 'numeric', 'text']}
                headings={[
                  'Check Name',
                  'Data Source',
                  'Table',
                  'Minutes Since Update',
                  'Status'
                ]}
                rows={freshnessChecks.results.map(check => [
                  check.checkName,
                  check.dataSource,
                  check.tableName,
                  check.minutesSinceUpdate.toLocaleString(),
                  check.isStale ? '⚠️ Stale' : '✅ Fresh'
                ])}
              />
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}


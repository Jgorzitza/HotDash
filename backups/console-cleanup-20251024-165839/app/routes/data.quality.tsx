/**
 * Data Quality Dashboard Route
 * Task: DATA-023
 */

import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { Card, Page, Layout, Text, Badge } from "@shopify/polaris";
import { DataQualityService } from "~/services/data/data-quality.service";

export async function loader({ request }: LoaderFunctionArgs) {
  const [validationResults, freshnessResults] = await Promise.all([
    DataQualityService.runValidationRules(),
    DataQualityService.checkFreshness()
  ]);
  
  return Response.json({
    validation: validationResults,
    freshness: freshnessResults,
    timestamp: new Date().toISOString()
  });
}

export default function DataQualityDashboard() {
  const { validation, freshness, timestamp } = useLoaderData<typeof loader>();
  
  return (
    <Page title="Data Quality Dashboard">
      <Layout>
        <Layout.Section>
          <Card>
            <div style={{ padding: '16px' }}>
              <Text as="h2" variant="headingMd">Validation Rules</Text>
              <div style={{ marginTop: '16px' }}>
                <Text as="p">Total Rules: {validation.totalRules}</Text>
                <Text as="p">Passed: {validation.passed}</Text>
                <Text as="p">Failed: {validation.failed}</Text>
              </div>
            </div>
          </Card>
        </Layout.Section>
        
        <Layout.Section>
          <Card>
            <div style={{ padding: '16px' }}>
              <Text as="h2" variant="headingMd">Data Freshness</Text>
              <div style={{ marginTop: '16px' }}>
                <Text as="p">Total Checks: {freshness.totalChecks}</Text>
                <Text as="p">Healthy: {freshness.healthy}</Text>
                <Text as="p">Stale: {freshness.stale}</Text>
              </div>
            </div>
          </Card>
        </Layout.Section>
        
        <Layout.Section>
          <Text as="p" variant="bodySm" tone="subdued">
            Last updated: {new Date(timestamp).toLocaleString()}
          </Text>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

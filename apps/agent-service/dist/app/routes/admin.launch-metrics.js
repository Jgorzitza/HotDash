/**
 * Launch Metrics Dashboard
 *
 * Task: ANALYTICS-LAUNCH-001
 *
 * Route: /admin/launch-metrics
 *
 * Comprehensive launch metrics dashboard tracking:
 * 1. User engagement (DAU, WAU, MAU)
 * 2. Feature adoption rates
 * 3. Performance metrics (load times, errors)
 * 4. Agent performance (suggestions, approvals, accuracy)
 * 5. Business metrics (orders, revenue, inventory turns)
 *
 * Features:
 * - Real-time updates via SSE
 * - Historical trend analysis
 * - Alerts for anomalies
 * - Export to Google Analytics
 */
import { useLoaderData, useRevalidator } from "react-router";
import { useState, useEffect } from "react";
import { Page, Layout, Card, Text, Badge, InlineStack, BlockStack, DataTable, Banner, SkeletonBodyText, } from "@shopify/polaris";
import { getLaunchMetrics } from "~/services/metrics/launch-metrics";
import { logDecision } from "~/services/decisions.server";
import { useSSE } from "~/hooks/useSSE";
import { ConnectionIndicator } from "~/components/realtime/ConnectionIndicator";
export async function loader({ request }) {
    try {
        const metrics = await getLaunchMetrics();
        await logDecision({
            scope: 'build',
            actor: 'analytics',
            action: 'launch_metrics_dashboard_loaded',
            rationale: 'Launch metrics dashboard loaded successfully',
            evidenceUrl: 'app/routes/admin.launch-metrics.tsx',
        });
        return Response.json({
            metrics,
            timestamp: new Date().toISOString(),
            error: null,
        });
    }
    catch (error) {
        console.error('[Launch Metrics] Error:', error);
        return Response.json({
            metrics: null,
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
    }
}
export default function LaunchMetricsDashboard() {
    const initialData = useLoaderData();
    const [metrics, setMetrics] = useState(initialData.metrics);
    const [alerts, setAlerts] = useState([]);
    const revalidator = useRevalidator();
    // SSE connection for real-time updates
    const { status, lastMessage, isConnected } = useSSE('/api/sse.updates', true);
    // Handle SSE messages
    useEffect(() => {
        if (lastMessage) {
            if (lastMessage.type === 'analytics-refresh') {
                revalidator.revalidate();
            }
            else if (lastMessage.type === 'performance-alert') {
                setAlerts(prev => [...prev, lastMessage.data].slice(0, 10));
            }
        }
    }, [lastMessage, revalidator]);
    // Auto-refresh every 5 minutes
    useEffect(() => {
        const interval = setInterval(() => {
            revalidator.revalidate();
        }, 300000);
        return () => clearInterval(interval);
    }, [revalidator]);
    // Update metrics when revalidator completes
    useEffect(() => {
        if (revalidator.state === 'idle' && revalidator.data) {
            const data = revalidator.data;
            if (data.metrics) {
                setMetrics(data.metrics);
            }
        }
    }, [revalidator.state, revalidator.data]);
    // Generate alerts based on metrics
    useEffect(() => {
        if (!metrics)
            return;
        const newAlerts = [];
        // DAU/MAU ratio alert
        if (metrics.adoption.dauMau.ratio < 0.2) {
            newAlerts.push({
                type: 'User Engagement',
                message: `Low DAU/MAU ratio: ${(metrics.adoption.dauMau.ratio * 100).toFixed(1)}% (target: >20%)`,
                severity: 'warning',
            });
        }
        // Activation rate alert
        if (metrics.adoption.activation.activationRate < 50) {
            newAlerts.push({
                type: 'Activation',
                message: `Low activation rate: ${metrics.adoption.activation.activationRate}% (target: >50%)`,
                severity: 'critical',
            });
        }
        // NPS alert
        if (metrics.satisfaction.nps.npsScore < 30) {
            newAlerts.push({
                type: 'Satisfaction',
                message: `Low NPS score: ${metrics.satisfaction.nps.npsScore} (target: >30)`,
                severity: 'warning',
            });
        }
        if (newAlerts.length > 0) {
            setAlerts(prev => [...newAlerts, ...prev].slice(0, 10));
        }
    }, [metrics]);
    const exportToGA = async () => {
        try {
            const response = await fetch('/api/analytics/export-to-ga', {
                method: 'POST',
            });
            const result = await response.json();
            if (result.success) {
                alert(`Successfully exported ${result.eventsExported} metrics to Google Analytics!`);
            }
            else {
                alert(`Export failed: ${result.message}`);
            }
        }
        catch (error) {
            console.error('[Launch Metrics] Export failed:', error);
            alert('Export failed. Check console for details.');
        }
    };
    if (initialData.error) {
        return (<Page title="Launch Metrics">
        <Layout>
          <Layout.Section>
            <Banner status="critical">
              <Text as="p">Error loading metrics: {initialData.error}</Text>
            </Banner>
          </Layout.Section>
        </Layout>
      </Page>);
    }
    if (!metrics) {
        return (<Page title="Launch Metrics">
        <Layout>
          <Layout.Section>
            <Card>
              <SkeletonBodyText lines={10}/>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>);
    }
    return (<Page title="Launch Metrics Dashboard" subtitle={`Last updated: ${new Date(initialData.timestamp).toLocaleString()}`} primaryAction={{
            content: 'Export to GA',
            onAction: exportToGA,
        }} secondaryActions={[
            {
                content: 'Refresh',
                onAction: () => revalidator.revalidate(),
            },
        ]}>
      <Layout>
        {/* Connection Status */}
        <Layout.Section>
          <InlineStack align="end">
            <ConnectionIndicator status={status} lastHeartbeat={null}/>
          </InlineStack>
        </Layout.Section>
        
        {/* Alerts */}
        {alerts.length > 0 && (<Layout.Section>
            <Banner status={alerts.some(a => a.severity === 'critical') ? 'critical' : 'warning'} title={`${alerts.length} Alert${alerts.length > 1 ? 's' : ''}`}>
              <BlockStack gap="200">
                {alerts.slice(0, 3).map((alert, i) => (<Text key={i} as="p">
                    <strong>{alert.type}:</strong> {alert.message}
                  </Text>))}
              </BlockStack>
            </Banner>
          </Layout.Section>)}
        
        {/* 1. User Engagement */}
        <Layout.Section>
          <Text as="h2" variant="headingLg">1. User Engagement</Text>
        </Layout.Section>
        
        <Layout.Section>
          <InlineStack gap="400">
            <Card>
              <BlockStack gap="200">
                <Text as="p" tone="subdued">DAU</Text>
                <Text as="h2" variant="heading2xl">{metrics.adoption.dauMau.dau}</Text>
                <Badge tone={metrics.adoption.dauMau.trend === 'up' ? 'success' : 'attention'}>
                  {metrics.adoption.dauMau.trend}
                </Badge>
              </BlockStack>
            </Card>
            
            <Card>
              <BlockStack gap="200">
                <Text as="p" tone="subdued">MAU</Text>
                <Text as="h2" variant="heading2xl">{metrics.adoption.dauMau.mau}</Text>
              </BlockStack>
            </Card>
            
            <Card>
              <BlockStack gap="200">
                <Text as="p" tone="subdued">DAU/MAU Ratio</Text>
                <Text as="h2" variant="heading2xl">
                  {(metrics.adoption.dauMau.ratio * 100).toFixed(1)}%
                </Text>
                <Text as="p" tone="subdued">Stickiness</Text>
              </BlockStack>
            </Card>
            
            <Card>
              <BlockStack gap="200">
                <Text as="p" tone="subdued">Signups (Weekly)</Text>
                <Text as="h2" variant="heading2xl">{metrics.adoption.signups.signups}</Text>
                <Text as="p" tone="subdued">
                  {metrics.adoption.signups.percentOfTarget}% of target
                </Text>
              </BlockStack>
            </Card>
          </InlineStack>
        </Layout.Section>
        
        {/* 2. Feature Adoption */}
        <Layout.Section>
          <Text as="h2" variant="headingLg">2. Feature Adoption</Text>
        </Layout.Section>
        
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack gap="400">
                <BlockStack gap="200">
                  <Text as="p" tone="subdued">Activation Rate</Text>
                  <Text as="h2" variant="heading2xl">
                    {metrics.adoption.activation.activationRate}%
                  </Text>
                  <Text as="p" tone="subdued">
                    {metrics.adoption.activation.activatedUsers} / {metrics.adoption.activation.totalUsers} users
                  </Text>
                </BlockStack>
                
                <BlockStack gap="200">
                  <Text as="p" tone="subdued">Time to First Value</Text>
                  <Text as="h2" variant="heading2xl">
                    {metrics.adoption.ttfv.median} min
                  </Text>
                  <Text as="p" tone="subdued">Median</Text>
                </BlockStack>
              </InlineStack>
              
              <DataTable columnContentTypes={['text', 'numeric']} headings={['Milestone', 'Completion %']} rows={[
            ['Profile Setup', `${metrics.adoption.activation.milestoneCompletion.profileSetup}%`],
            ['First Integration', `${metrics.adoption.activation.milestoneCompletion.firstIntegration}%`],
            ['View Dashboard', `${metrics.adoption.activation.milestoneCompletion.viewDashboard}%`],
            ['First Approval', `${metrics.adoption.activation.milestoneCompletion.firstApproval}%`],
            ['First Workflow', `${metrics.adoption.activation.milestoneCompletion.firstWorkflow}%`],
        ]}/>
            </BlockStack>
          </Card>
        </Layout.Section>
        
        {/* 3. Satisfaction Metrics */}
        <Layout.Section>
          <Text as="h2" variant="headingLg">3. Customer Satisfaction</Text>
        </Layout.Section>
        
        <Layout.Section>
          <InlineStack gap="400">
            <Card>
              <BlockStack gap="200">
                <Text as="p" tone="subdued">NPS Score</Text>
                <Text as="h2" variant="heading2xl">{metrics.satisfaction.nps.npsScore}</Text>
                <Badge tone={metrics.satisfaction.nps.trend === 'improving' ? 'success' : 'attention'}>
                  {metrics.satisfaction.nps.trend}
                </Badge>
              </BlockStack>
            </Card>
            
            <Card>
              <BlockStack gap="200">
                <Text as="p" tone="subdued">CSAT Average</Text>
                <Text as="h2" variant="heading2xl">
                  {metrics.satisfaction.csat[0]?.averageRating.toFixed(1) || 'N/A'}
                </Text>
                <Text as="p" tone="subdued">Out of 5.0</Text>
              </BlockStack>
            </Card>
            
            <Card>
              <BlockStack gap="200">
                <Text as="p" tone="subdued">Sentiment</Text>
                <Text as="h2" variant="heading2xl">
                  {(metrics.satisfaction.sentiment.positiveRate * 100).toFixed(0)}%
                </Text>
                <Text as="p" tone="subdued">Positive</Text>
              </BlockStack>
            </Card>
          </InlineStack>
        </Layout.Section>
      </Layout>
    </Page>);
}
//# sourceMappingURL=admin.launch-metrics.js.map
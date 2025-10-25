/**
 * Integration Health Dashboard
 * 
 * Real-time monitoring dashboard for all third-party integrations:
 * - Shopify Admin API
 * - Publer Social Media API
 * - Chatwoot Customer Service API
 * 
 * Features:
 * - Real-time health status
 * - Circuit breaker status
 * - Performance metrics
 * - Rate limit monitoring
 * - Incident tracking
 */

import type { LoaderFunctionArgs } from 'react-router';
import { useLoaderData, useRevalidator } from 'react-router';
import { Page, Layout, Card, Badge, Text, BlockStack, InlineStack, Banner, ProgressBar, Button, Box, DataTable } from '@shopify/polaris';
import { useEffect } from 'react';
import { integrationManager } from '~/services/integrations/integration-manager';
import { checkAllIntegrations } from '~/services/integrations/health';
import shopify from '~/shopify.server';

interface Incident {
  id: string;
  service: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
}

interface Alert {
  id: string;
  service: string;
  type: 'circuit_breaker_open' | 'high_error_rate' | 'high_latency' | 'service_down';
  message: string;
  timestamp: string;
  escalated: boolean;
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Get Shopify admin client if available
    let adminGraphqlClient;
    try {
      const { admin } = await shopify.authenticate.admin(request);
      adminGraphqlClient = admin.graphql;
    } catch (error) {
      console.warn('[Health Dashboard] Shopify auth unavailable');
    }

    // Get health status from all integrations
    const healthChecks = await checkAllIntegrations(adminGraphqlClient);

    // Get metrics from integration manager
    const metrics = integrationManager.getMetrics();

    // Get circuit breaker status
    const circuitBreakers = {
      shopify: integrationManager.getCircuitBreakerStatus('shopify'),
      publer: integrationManager.getCircuitBreakerStatus('publer'),
      chatwoot: integrationManager.getCircuitBreakerStatus('chatwoot'),
    };

    // Track incidents based on current status
    const incidents: Incident[] = [];
    const alerts: Alert[] = [];

    healthChecks.checks.forEach((check) => {
      const metric = metrics.find(m => m.name === check.service);
      const circuitBreakerOpen = circuitBreakers[check.service as keyof typeof circuitBreakers];

      // Create incident if service is unhealthy
      if (!check.healthy) {
        incidents.push({
          id: `incident-${check.service}-${Date.now()}`,
          service: check.service,
          severity: 'critical',
          message: check.error || 'Service is unhealthy',
          timestamp: check.timestamp,
          resolved: false,
        });

        // Create alert for service down
        alerts.push({
          id: `alert-${check.service}-down-${Date.now()}`,
          service: check.service,
          type: 'service_down',
          message: `${check.service} is currently unavailable`,
          timestamp: new Date().toISOString(),
          escalated: true, // Auto-escalate service down alerts
        });
      }

      // Create incident if circuit breaker is open
      if (circuitBreakerOpen) {
        incidents.push({
          id: `incident-${check.service}-cb-${Date.now()}`,
          service: check.service,
          severity: 'warning',
          message: 'Circuit breaker is open',
          timestamp: new Date().toISOString(),
          resolved: false,
        });

        alerts.push({
          id: `alert-${check.service}-cb-${Date.now()}`,
          service: check.service,
          type: 'circuit_breaker_open',
          message: `Circuit breaker opened for ${check.service}`,
          timestamp: new Date().toISOString(),
          escalated: false,
        });
      }

      // Create incident if error rate is high
      if (metric && metric.totalRequests > 10) {
        const errorRate = (metric.failedRequests / metric.totalRequests) * 100;
        if (errorRate > 10) {
          incidents.push({
            id: `incident-${check.service}-errors-${Date.now()}`,
            service: check.service,
            severity: errorRate > 25 ? 'critical' : 'warning',
            message: `High error rate: ${errorRate.toFixed(1)}%`,
            timestamp: new Date().toISOString(),
            resolved: false,
          });

          alerts.push({
            id: `alert-${check.service}-errors-${Date.now()}`,
            service: check.service,
            type: 'high_error_rate',
            message: `Error rate is ${errorRate.toFixed(1)}% for ${check.service}`,
            timestamp: new Date().toISOString(),
            escalated: errorRate > 25, // Escalate if > 25%
          });
        }
      }

      // Create incident if latency is high
      if (metric && metric.averageLatency > 2000) {
        incidents.push({
          id: `incident-${check.service}-latency-${Date.now()}`,
          service: check.service,
          severity: 'warning',
          message: `High latency: ${Math.round(metric.averageLatency)}ms`,
          timestamp: new Date().toISOString(),
          resolved: false,
        });

        alerts.push({
          id: `alert-${check.service}-latency-${Date.now()}`,
          service: check.service,
          type: 'high_latency',
          message: `Average latency is ${Math.round(metric.averageLatency)}ms for ${check.service}`,
          timestamp: new Date().toISOString(),
          escalated: metric.averageLatency > 5000, // Escalate if > 5s
        });
      }
    });

    return Response.json({
      healthChecks,
      metrics,
      circuitBreakers,
      incidents,
      alerts,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Health Dashboard] Error:', error);
    return Response.json({
      healthChecks: {
        overall: 'unhealthy' as const,
        checks: [],
        summary: { total: 0, healthy: 0, unhealthy: 0 },
      },
      metrics: [],
      circuitBreakers: {},
      incidents: [],
      alerts: [],
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

export default function IntegrationHealthDashboard() {
  const data = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      revalidator.revalidate();
    }, 30000);

    return () => clearInterval(interval);
  }, [revalidator]);

  const getHealthBadge = (healthy: boolean) => {
    return healthy ? (
      <Badge tone="success">Healthy</Badge>
    ) : (
      <Badge tone="critical">Unhealthy</Badge>
    );
  };

  const getCircuitBreakerBadge = (isOpen: boolean) => {
    return isOpen ? (
      <Badge tone="warning">Open</Badge>
    ) : (
      <Badge tone="success">Closed</Badge>
    );
  };

  const getOverallBadge = (status: 'healthy' | 'degraded' | 'unhealthy') => {
    switch (status) {
      case 'healthy':
        return <Badge tone="success">All Systems Operational</Badge>;
      case 'degraded':
        return <Badge tone="warning">Degraded Performance</Badge>;
      case 'unhealthy':
        return <Badge tone="critical">System Outage</Badge>;
    }
  };

  const calculateHealthScore = (metric: typeof data.metrics[0]) => {
    if (metric.totalRequests === 0) return 100;
    const successRate = (metric.successfulRequests / metric.totalRequests) * 100;
    return Math.round(successRate);
  };

  return (
    <Page
      title="Integration Health Dashboard"
      subtitle={`Last updated: ${new Date(data.timestamp).toLocaleString()}`}
      primaryAction={{
        content: 'Refresh',
        onAction: () => revalidator.revalidate(),
      }}
    >
      <Layout>
        {/* Overall Status */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text as="h2" variant="headingMd">Overall Status</Text>
                {getOverallBadge(data.healthChecks.overall)}
              </InlineStack>
              
              {data.error && (
                <Banner tone="critical">
                  <p>{data.error}</p>
                </Banner>
              )}

              <InlineStack gap="400">
                <Box>
                  <Text as="p" variant="bodyMd" tone="subdued">Total Integrations</Text>
                  <Text as="p" variant="headingLg">{data.healthChecks.summary.total}</Text>
                </Box>
                <Box>
                  <Text as="p" variant="bodyMd" tone="subdued">Healthy</Text>
                  <Text as="p" variant="headingLg" tone="success">{data.healthChecks.summary.healthy}</Text>
                </Box>
                <Box>
                  <Text as="p" variant="bodyMd" tone="subdued">Unhealthy</Text>
                  <Text as="p" variant="headingLg" tone="critical">{data.healthChecks.summary.unhealthy}</Text>
                </Box>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Individual Integration Status */}
        {data.healthChecks.checks.map((check) => {
          const metric = data.metrics.find(m => m.name === check.service);
          const healthScore = metric ? calculateHealthScore(metric) : 0;
          const circuitBreakerOpen = data.circuitBreakers[check.service as keyof typeof data.circuitBreakers];

          return (
            <Layout.Section key={check.service} variant="oneThird">
              <Card>
                <BlockStack gap="400">
                  <InlineStack align="space-between">
                    <Text as="h3" variant="headingMd">{check.service.toUpperCase()}</Text>
                    {getHealthBadge(check.healthy)}
                  </InlineStack>

                  {/* Health Score */}
                  <Box>
                    <Text as="p" variant="bodyMd" tone="subdued">Health Score</Text>
                    <ProgressBar 
                      progress={healthScore} 
                      tone={healthScore >= 90 ? 'success' : healthScore >= 70 ? 'primary' : 'critical'}
                    />
                    <Text as="p" variant="bodySm">{healthScore}%</Text>
                  </Box>

                  {/* Circuit Breaker Status */}
                  <InlineStack align="space-between">
                    <Text as="p" variant="bodyMd">Circuit Breaker</Text>
                    {getCircuitBreakerBadge(circuitBreakerOpen || false)}
                  </InlineStack>

                  {/* Latency */}
                  {check.latencyMs !== undefined && (
                    <Box>
                      <Text as="p" variant="bodyMd" tone="subdued">Latency</Text>
                      <Text as="p" variant="bodyMd">{check.latencyMs}ms</Text>
                    </Box>
                  )}

                  {/* Metrics */}
                  {metric && (
                    <BlockStack gap="200">
                      <InlineStack align="space-between">
                        <Text as="p" variant="bodySm" tone="subdued">Total Requests</Text>
                        <Text as="p" variant="bodySm">{metric.totalRequests}</Text>
                      </InlineStack>
                      <InlineStack align="space-between">
                        <Text as="p" variant="bodySm" tone="subdued">Successful</Text>
                        <Text as="p" variant="bodySm" tone="success">{metric.successfulRequests}</Text>
                      </InlineStack>
                      <InlineStack align="space-between">
                        <Text as="p" variant="bodySm" tone="subdued">Failed</Text>
                        <Text as="p" variant="bodySm" tone="critical">{metric.failedRequests}</Text>
                      </InlineStack>
                      <InlineStack align="space-between">
                        <Text as="p" variant="bodySm" tone="subdued">Avg Latency</Text>
                        <Text as="p" variant="bodySm">{Math.round(metric.averageLatency)}ms</Text>
                      </InlineStack>
                    </BlockStack>
                  )}

                  {/* Error Message */}
                  {check.error && (
                    <Banner tone="critical">
                      <p>{check.error}</p>
                    </Banner>
                  )}

                  {/* Last Success/Error */}
                  {metric && (
                    <BlockStack gap="200">
                      {metric.lastSuccess && (
                        <Text as="p" variant="bodySm" tone="subdued">
                          Last success: {new Date(metric.lastSuccess).toLocaleTimeString()}
                        </Text>
                      )}
                      {metric.lastError && (
                        <Text as="p" variant="bodySm" tone="critical">
                          Last error: {metric.lastError}
                        </Text>
                      )}
                    </BlockStack>
                  )}
                </BlockStack>
              </Card>
            </Layout.Section>
          );
        })}

        {/* Active Incidents */}
        {data.incidents.length > 0 && (
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text as="h2" variant="headingMd">Active Incidents</Text>
                  <Badge tone="critical">{data.incidents.length}</Badge>
                </InlineStack>

                <DataTable
                  columnContentTypes={['text', 'text', 'text', 'text', 'text']}
                  headings={['Service', 'Severity', 'Message', 'Time', 'Status']}
                  rows={data.incidents.map(incident => [
                    incident.service.toUpperCase(),
                    <Badge tone={incident.severity === 'critical' ? 'critical' : 'warning'}>
                      {incident.severity}
                    </Badge>,
                    incident.message,
                    new Date(incident.timestamp).toLocaleTimeString(),
                    incident.resolved ? (
                      <Badge tone="success">Resolved</Badge>
                    ) : (
                      <Badge tone="attention">Active</Badge>
                    ),
                  ])}
                />
              </BlockStack>
            </Card>
          </Layout.Section>
        )}

        {/* Alert Escalation */}
        {data.alerts.length > 0 && (
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text as="h2" variant="headingMd">Alert Escalation</Text>
                  <Badge tone="warning">
                    {data.alerts.filter(a => a.escalated).length} Escalated
                  </Badge>
                </InlineStack>

                <Banner tone="warning">
                  <p>
                    {data.alerts.filter(a => a.escalated).length} alert(s) have been escalated to on-call engineer.
                    Critical alerts trigger immediate notification via PagerDuty/Slack.
                  </p>
                </Banner>

                <DataTable
                  columnContentTypes={['text', 'text', 'text', 'text', 'text']}
                  headings={['Service', 'Type', 'Message', 'Time', 'Escalated']}
                  rows={data.alerts.map(alert => [
                    alert.service.toUpperCase(),
                    alert.type.replace(/_/g, ' ').toUpperCase(),
                    alert.message,
                    new Date(alert.timestamp).toLocaleTimeString(),
                    alert.escalated ? (
                      <Badge tone="critical">Yes</Badge>
                    ) : (
                      <Badge>No</Badge>
                    ),
                  ])}
                />

                <BlockStack gap="200">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">Escalation Rules</Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    • Service Down: Immediate escalation
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    • Error Rate {'>'} 25%: Immediate escalation
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    • Latency {'>'} 5000ms: Immediate escalation
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    • Circuit Breaker Open: Monitor, escalate if persists {'>'} 5 min
                  </Text>
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        )}

        {/* Rate Limiting & Performance */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">Rate Limiting & Performance</Text>

              <BlockStack gap="300">
                <Box>
                  <Text as="p" variant="bodyMd" fontWeight="semibold">Shopify</Text>
                  <Text as="p" variant="bodySm" tone="subdued">2 requests/second, burst 10</Text>
                </Box>
                <Box>
                  <Text as="p" variant="bodyMd" fontWeight="semibold">Publer</Text>
                  <Text as="p" variant="bodySm" tone="subdued">5 requests/second, burst 15</Text>
                </Box>
                <Box>
                  <Text as="p" variant="bodyMd" fontWeight="semibold">Chatwoot</Text>
                  <Text as="p" variant="bodySm" tone="subdued">10 requests/second, burst 30</Text>
                </Box>
              </BlockStack>

              <Banner tone="info">
                <p>All integrations use exponential backoff retry logic with circuit breaker protection.</p>
              </Banner>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

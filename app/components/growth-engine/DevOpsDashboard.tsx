/**
 * DevOps Growth Engine Dashboard Component
 * 
 * Main dashboard for DevOps Growth Engine features
 * Displays automation, performance, security, and testing status
 */

import { Card, Text, Button, Box, InlineStack, Badge, Spinner, EmptyState, List } from "@shopify/polaris";
import { useFetcher } from "@remix-run/react";
import { useState, useEffect } from "react";

interface DevOpsStatus {
  timestamp: string;
  automation: {
    status: 'idle' | 'running' | 'completed' | 'failed';
    lastDeployment?: string;
    activeThreats: number;
  };
  performance: {
    status: 'idle' | 'monitoring' | 'optimizing' | 'completed';
    currentLatency: number;
    targetLatency: number;
    optimizationScore: number;
  };
  security: {
    status: 'idle' | 'monitoring' | 'investigating' | 'resolved';
    threatLevel: 'low' | 'medium' | 'high' | 'critical';
    complianceScore: number;
    activeThreats: number;
  };
  testing: {
    status: 'idle' | 'running' | 'completed' | 'failed';
    lastRun?: string;
    coverage: number;
    passRate: number;
  };
}

interface DevOpsRecommendations {
  automation: Array<{
    type: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    impact: number;
    effort: 'low' | 'medium' | 'high';
  }>;
  performance: Array<{
    type: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    expectedImprovement: number;
    effort: 'low' | 'medium' | 'high';
  }>;
  security: Array<{
    type: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    riskReduction: number;
    effort: 'low' | 'medium' | 'high';
  }>;
  testing: Array<{
    type: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    expectedImprovement: number;
    effort: 'low' | 'medium' | 'high';
  }>;
}

export function DevOpsDashboard() {
  const [status, setStatus] = useState<DevOpsStatus | null>(null);
  const [recommendations, setRecommendations] = useState<DevOpsRecommendations | null>(null);
  const [loading, setLoading] = useState(true);
  
  const statusFetcher = useFetcher();
  const recommendationsFetcher = useFetcher();
  const actionFetcher = useFetcher();

  useEffect(() => {
    // Load initial data
    loadStatus();
    loadRecommendations();
  }, []);

  const loadStatus = () => {
    statusFetcher.load('/api/growth-engine.devops?action=status');
  };

  const loadRecommendations = () => {
    recommendationsFetcher.load('/api/growth-engine.devops?action=recommendations');
  };

  useEffect(() => {
    if (statusFetcher.data) {
      setStatus(statusFetcher.data);
      setLoading(false);
    }
  }, [statusFetcher.data]);

  useEffect(() => {
    if (recommendationsFetcher.data) {
      setRecommendations(recommendationsFetcher.data);
    }
  }, [recommendationsFetcher.data]);

  const handleAction = (action: string, params: any = {}) => {
    actionFetcher.submit(
      { action, ...params },
      { method: 'post', action: '/api/growth-engine.devops', encType: 'application/json' }
    );
  };

  const getStatusBadge = (status: string) => {
    const tone = status === 'completed' || status === 'monitoring' ? 'success' :
                 status === 'running' || status === 'optimizing' ? 'info' :
                 status === 'failed' ? 'critical' : 'warning';
    return <Badge tone={tone}>{status.toUpperCase()}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const tone = priority === 'critical' ? 'critical' :
                 priority === 'high' ? 'warning' :
                 priority === 'medium' ? 'info' : 'success';
    return <Badge tone={tone}>{priority.toUpperCase()}</Badge>;
  };

  if (loading) {
    return (
      <Box padding="400">
        <InlineStack align="center" gap="200">
          <Spinner accessibilityLabel="Loading DevOps dashboard" size="small" />
          <Text as="p" variant="bodyMd">Loading DevOps dashboard...</Text>
        </InlineStack>
      </Box>
    );
  }

  return (
    <Box padding="400">
      <Text as="h1" variant="headingLg">DevOps Growth Engine Dashboard</Text>
      
      <Box paddingBlockStart="400">
        <InlineStack gap="400" wrap={false}>
          {/* Automation Status */}
          <Card>
            <Text as="h2" variant="headingMd">Automation</Text>
            <Box paddingBlockStart="200">
              {status?.automation && (
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="p" variant="bodyMd">
                    Status: {getStatusBadge(status.automation.status)}
                  </Text>
                  {status.automation.lastDeployment && (
                    <Text as="p" variant="bodySm" color="subdued">
                      Last: {new Date(status.automation.lastDeployment).toLocaleString()}
                    </Text>
                  )}
                </InlineStack>
              )}
              <Box paddingBlockStart="200">
                <Button
                  size="slim"
                  loading={actionFetcher.state === 'submitting'}
                  onClick={() => handleAction('deploy', { version: '1.0.0' })}
                >
                  Deploy
                </Button>
              </Box>
            </Box>
          </Card>

          {/* Performance Status */}
          <Card>
            <Text as="h2" variant="headingMd">Performance</Text>
            <Box paddingBlockStart="200">
              {status?.performance && (
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="p" variant="bodyMd">
                    Status: {getStatusBadge(status.performance.status)}
                  </Text>
                  <Text as="p" variant="bodySm" color="subdued">
                    Latency: {status.performance.currentLatency}ms / {status.performance.targetLatency}ms
                  </Text>
                </InlineStack>
              )}
              <Box paddingBlockStart="200">
                <Button
                  size="slim"
                  loading={actionFetcher.state === 'submitting'}
                  onClick={() => handleAction('optimize')}
                >
                  Optimize
                </Button>
              </Box>
            </Box>
          </Card>

          {/* Security Status */}
          <Card>
            <Text as="h2" variant="headingMd">Security</Text>
            <Box paddingBlockStart="200">
              {status?.security && (
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="p" variant="bodyMd">
                    Status: {getStatusBadge(status.security.status)}
                  </Text>
                  <Text as="p" variant="bodySm" color="subdued">
                    Compliance: {status.security.complianceScore}%
                  </Text>
                </InlineStack>
              )}
              <Box paddingBlockStart="200">
                <Button
                  size="slim"
                  loading={actionFetcher.state === 'submitting'}
                  onClick={() => handleAction('monitor')}
                >
                  Monitor
                </Button>
              </Box>
            </Box>
          </Card>

          {/* Testing Status */}
          <Card>
            <Text as="h2" variant="headingMd">Testing</Text>
            <Box paddingBlockStart="200">
              {status?.testing && (
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="p" variant="bodyMd">
                    Status: {getStatusBadge(status.testing.status)}
                  </Text>
                  <Text as="p" variant="bodySm" color="subdued">
                    Coverage: {status.testing.coverage}%
                  </Text>
                </InlineStack>
              )}
              <Box paddingBlockStart="200">
                <Button
                  size="slim"
                  loading={actionFetcher.state === 'submitting'}
                  onClick={() => handleAction('test', { testTypes: ['unit', 'integration', 'e2e'] })}
                >
                  Test
                </Button>
              </Box>
            </Box>
          </Card>
        </InlineStack>
      </Box>

      {/* Recommendations */}
      {recommendations && (
        <Box paddingBlockStart="400">
          <Text as="h2" variant="headingMd">Recommendations</Text>
          <Box paddingBlockStart="200">
            <InlineStack gap="400" wrap={false}>
              {Object.entries(recommendations).map(([category, recs]) => (
                <Card key={category}>
                  <Text as="h3" variant="headingSm">{category.charAt(0).toUpperCase() + category.slice(1)}</Text>
                  <Box paddingBlockStart="200">
                    {recs.length > 0 ? (
                      <List>
                        {recs.map((rec, index) => (
                          <List.Item key={index}>
                            <InlineStack align="space-between" blockAlign="center">
                              <Text as="p" variant="bodyMd">{rec.description}</Text>
                              {getPriorityBadge(rec.priority)}
                            </InlineStack>
                          </List.Item>
                        ))}
                      </List>
                    ) : (
                      <EmptyState
                        heading="No recommendations"
                        image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                        imageContained
                      >
                        <Text as="p" variant="bodyMd">
                          All systems are optimized.
                        </Text>
                      </EmptyState>
                    )}
                  </Box>
                </Card>
              ))}
            </InlineStack>
          </Box>
        </Box>
      )}

      {/* Action Results */}
      {actionFetcher.data && (
        <Box paddingBlockStart="400">
          <Card>
            <Text as="h3" variant="headingSm">Action Results</Text>
            <Box paddingBlockStart="200">
              <Text as="p" variant="bodyMd">
                {actionFetcher.data.success ? 'Action completed successfully' : 'Action failed'}
              </Text>
              {actionFetcher.data.error && (
                <Text as="p" variant="bodySm" color="critical">
                  Error: {actionFetcher.data.error}
                </Text>
              )}
            </Box>
          </Card>
        </Box>
      )}
    </Box>
  );
}

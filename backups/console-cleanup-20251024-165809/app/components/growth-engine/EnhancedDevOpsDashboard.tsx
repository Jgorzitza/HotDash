/**
 * Enhanced DevOps Growth Engine Dashboard Component
 * 
 * Comprehensive dashboard for advanced DevOps Growth Engine features
 * Displays automation, performance, security, testing, monitoring, cost optimization, and disaster recovery
 */

import { Card, Text, Button, Box, InlineStack, Badge, Spinner, EmptyState, List, Tabs, ProgressBar } from "@shopify/polaris";
import { useFetcher } from "react-router";
import { useState, useEffect } from "react";

interface EnhancedDevOpsStatus {
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
  monitoring: {
    status: 'idle' | 'monitoring' | 'alerting';
    activeAlerts: number;
    systemHealth: 'healthy' | 'degraded' | 'critical';
  };
  costOptimization: {
    status: 'idle' | 'monitoring' | 'optimizing';
    dailySpend: number;
    budgetAlert: boolean;
    optimizationScore: number;
  };
  disasterRecovery: {
    status: 'idle' | 'monitoring' | 'testing' | 'recovering';
    lastBackup?: string;
    nextTest?: string;
    recoveryReadiness: number;
  };
}

interface EnhancedDevOpsRecommendations {
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
  monitoring: Array<{
    type: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    impact: number;
    effort: 'low' | 'medium' | 'high';
  }>;
  costOptimization: Array<{
    type: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    potentialSavings: number;
    effort: 'low' | 'medium' | 'high';
  }>;
  disasterRecovery: Array<{
    type: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    riskReduction: number;
    effort: 'low' | 'medium' | 'high';
  }>;
}

export function EnhancedDevOpsDashboard() {
  const [status, setStatus] = useState<EnhancedDevOpsStatus | null>(null);
  const [recommendations, setRecommendations] = useState<EnhancedDevOpsRecommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  
  const statusFetcher = useFetcher();
  const recommendationsFetcher = useFetcher();
  const actionFetcher = useFetcher();

  useEffect(() => {
    // Load initial data
    loadStatus();
    loadRecommendations();
  }, []);

  const loadStatus = () => {
    statusFetcher.load('/api/growth-engine.enhanced-devops?action=status');
  };

  const loadRecommendations = () => {
    recommendationsFetcher.load('/api/growth-engine.enhanced-devops?action=recommendations');
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
      { method: 'post', action: '/api/growth-engine.enhanced-devops', encType: 'application/json' }
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

  const tabs = [
    { id: 'overview', content: 'Overview' },
    { id: 'automation', content: 'Automation' },
    { id: 'performance', content: 'Performance' },
    { id: 'security', content: 'Security' },
    { id: 'testing', content: 'Testing' },
    { id: 'monitoring', content: 'Monitoring' },
    { id: 'cost', content: 'Cost Optimization' },
    { id: 'disaster', content: 'Disaster Recovery' }
  ];

  if (loading) {
    return (
      <Box padding="400">
        <InlineStack align="center" gap="200">
          <Spinner accessibilityLabel="Loading enhanced DevOps dashboard" size="small" />
          <Text as="p" variant="bodyMd">Loading enhanced DevOps dashboard...</Text>
        </InlineStack>
      </Box>
    );
  }

  return (
    <Box padding="400">
      <Text as="h1" variant="headingLg">Enhanced DevOps Growth Engine Dashboard</Text>
      
      <Box paddingBlockStart="400">
        <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
          <Box paddingBlockStart="400">
            {selectedTab === 0 && (
              <Box>
                <Text as="h2" variant="headingMd">System Overview</Text>
                <Box paddingBlockStart="200">
                  <InlineStack gap="400" wrap={false}>
                    {/* System Health */}
                    <Card>
                      <Text as="h3" variant="headingSm">System Health</Text>
                      <Box paddingBlockStart="200">
                        <InlineStack align="space-between" blockAlign="center">
                          <Text as="p" variant="bodyMd">
                            Status: {status?.monitoring.systemHealth ? getStatusBadge(status.monitoring.systemHealth) : 'Unknown'}
                          </Text>
                          <Text as="p" variant="bodySm" color="subdued">
                            Alerts: {status?.monitoring.activeAlerts || 0}
                          </Text>
                        </InlineStack>
                      </Box>
                    </Card>

                    {/* Performance */}
                    <Card>
                      <Text as="h3" variant="headingSm">Performance</Text>
                      <Box paddingBlockStart="200">
                        <InlineStack align="space-between" blockAlign="center">
                          <Text as="p" variant="bodyMd">
                            Latency: {status?.performance.currentLatency || 0}ms / {status?.performance.targetLatency || 0}ms
                          </Text>
                          <Text as="p" variant="bodySm" color="subdued">
                            Score: {Math.round((status?.performance.optimizationScore || 0) * 100)}%
                          </Text>
                        </InlineStack>
                        <Box paddingBlockStart="200">
                          <ProgressBar progress={status?.performance.optimizationScore || 0} />
                        </Box>
                      </Box>
                    </Card>

                    {/* Security */}
                    <Card>
                      <Text as="h3" variant="headingSm">Security</Text>
                      <Box paddingBlockStart="200">
                        <InlineStack align="space-between" blockAlign="center">
                          <Text as="p" variant="bodyMd">
                            Threat Level: {status?.security.threatLevel ? getStatusBadge(status.security.threatLevel) : 'Unknown'}
                          </Text>
                          <Text as="p" variant="bodySm" color="subdued">
                            Compliance: {status?.security.complianceScore || 0}%
                          </Text>
                        </InlineStack>
                      </Box>
                    </Card>

                    {/* Cost Optimization */}
                    <Card>
                      <Text as="h3" variant="headingSm">Cost Optimization</Text>
                      <Box paddingBlockStart="200">
                        <InlineStack align="space-between" blockAlign="center">
                          <Text as="p" variant="bodyMd">
                            Daily Spend: ${status?.costOptimization.dailySpend || 0}
                          </Text>
                          <Text as="p" variant="bodySm" color="subdued">
                            Score: {Math.round((status?.costOptimization.optimizationScore || 0) * 100)}%
                          </Text>
                        </InlineStack>
                        {status?.costOptimization.budgetAlert && (
                          <Box paddingBlockStart="200">
                            <Badge tone="critical">BUDGET ALERT</Badge>
                          </Box>
                        )}
                      </Box>
                    </Card>
                  </InlineStack>
                </Box>
              </Box>
            )}

            {selectedTab === 1 && (
              <Box>
                <Text as="h2" variant="headingMd">Automation</Text>
                <Box paddingBlockStart="200">
                  <Card>
                    <InlineStack align="space-between" blockAlign="center">
                      <Text as="p" variant="bodyMd">
                        Status: {status?.automation.status ? getStatusBadge(status.automation.status) : 'Unknown'}
                      </Text>
                      <Button
                        size="slim"
                        loading={actionFetcher.state === 'submitting'}
                        onClick={() => handleAction('deploy', { version: '1.0.0' })}
                      >
                        Deploy
                      </Button>
                    </InlineStack>
                    {status?.automation.lastDeployment && (
                      <Box paddingBlockStart="200">
                        <Text as="p" variant="bodySm" color="subdued">
                          Last Deployment: {new Date(status.automation.lastDeployment).toLocaleString()}
                        </Text>
                      </Box>
                    )}
                  </Card>
                </Box>
              </Box>
            )}

            {selectedTab === 2 && (
              <Box>
                <Text as="h2" variant="headingMd">Performance</Text>
                <Box paddingBlockStart="200">
                  <Card>
                    <InlineStack align="space-between" blockAlign="center">
                      <Text as="p" variant="bodyMd">
                        Status: {status?.performance.status ? getStatusBadge(status.performance.status) : 'Unknown'}
                      </Text>
                      <Button
                        size="slim"
                        loading={actionFetcher.state === 'submitting'}
                        onClick={() => handleAction('optimize')}
                      >
                        Optimize
                      </Button>
                    </InlineStack>
                    <Box paddingBlockStart="200">
                      <Text as="p" variant="bodySm" color="subdued">
                        Current Latency: {status?.performance.currentLatency || 0}ms / Target: {status?.performance.targetLatency || 0}ms
                      </Text>
                      <Box paddingBlockStart="200">
                        <ProgressBar progress={(status?.performance.currentLatency || 0) / (status?.performance.targetLatency || 1)} />
                      </Box>
                    </Box>
                  </Card>
                </Box>
              </Box>
            )}

            {selectedTab === 3 && (
              <Box>
                <Text as="h2" variant="headingMd">Security</Text>
                <Box paddingBlockStart="200">
                  <Card>
                    <InlineStack align="space-between" blockAlign="center">
                      <Text as="p" variant="bodyMd">
                        Status: {status?.security.status ? getStatusBadge(status.security.status) : 'Unknown'}
                      </Text>
                      <Button
                        size="slim"
                        loading={actionFetcher.state === 'submitting'}
                        onClick={() => handleAction('monitor')}
                      >
                        Monitor
                      </Button>
                    </InlineStack>
                    <Box paddingBlockStart="200">
                      <Text as="p" variant="bodySm" color="subdued">
                        Compliance Score: {status?.security.complianceScore || 0}%
                      </Text>
                      <Text as="p" variant="bodySm" color="subdued">
                        Active Threats: {status?.security.activeThreats || 0}
                      </Text>
                    </Box>
                  </Card>
                </Box>
              </Box>
            )}

            {selectedTab === 4 && (
              <Box>
                <Text as="h2" variant="headingMd">Testing</Text>
                <Box paddingBlockStart="200">
                  <Card>
                    <InlineStack align="space-between" blockAlign="center">
                      <Text as="p" variant="bodyMd">
                        Status: {status?.testing.status ? getStatusBadge(status.testing.status) : 'Unknown'}
                      </Text>
                      <Button
                        size="slim"
                        loading={actionFetcher.state === 'submitting'}
                        onClick={() => handleAction('test', { testTypes: ['unit', 'integration', 'e2e'] })}
                      >
                        Test
                      </Button>
                    </InlineStack>
                    <Box paddingBlockStart="200">
                      <Text as="p" variant="bodySm" color="subdued">
                        Coverage: {status?.testing.coverage || 0}%
                      </Text>
                      <Text as="p" variant="bodySm" color="subdued">
                        Pass Rate: {status?.testing.passRate || 0}%
                      </Text>
                    </Box>
                  </Card>
                </Box>
              </Box>
            )}

            {selectedTab === 5 && (
              <Box>
                <Text as="h2" variant="headingMd">Monitoring</Text>
                <Box paddingBlockStart="200">
                  <Card>
                    <InlineStack align="space-between" blockAlign="center">
                      <Text as="p" variant="bodyMd">
                        Status: {status?.monitoring.status ? getStatusBadge(status.monitoring.status) : 'Unknown'}
                      </Text>
                      <Button
                        size="slim"
                        loading={actionFetcher.state === 'submitting'}
                        onClick={() => handleAction('execute', { operations: ['monitoring'] })}
                      >
                        Monitor
                      </Button>
                    </InlineStack>
                    <Box paddingBlockStart="200">
                      <Text as="p" variant="bodySm" color="subdued">
                        Active Alerts: {status?.monitoring.activeAlerts || 0}
                      </Text>
                      <Text as="p" variant="bodySm" color="subdued">
                        System Health: {status?.monitoring.systemHealth || 'Unknown'}
                      </Text>
                    </Box>
                  </Card>
                </Box>
              </Box>
            )}

            {selectedTab === 6 && (
              <Box>
                <Text as="h2" variant="headingMd">Cost Optimization</Text>
                <Box paddingBlockStart="200">
                  <Card>
                    <InlineStack align="space-between" blockAlign="center">
                      <Text as="p" variant="bodyMd">
                        Status: {status?.costOptimization.status ? getStatusBadge(status.costOptimization.status) : 'Unknown'}
                      </Text>
                      <Button
                        size="slim"
                        loading={actionFetcher.state === 'submitting'}
                        onClick={() => handleAction('cost-optimize')}
                      >
                        Optimize
                      </Button>
                    </InlineStack>
                    <Box paddingBlockStart="200">
                      <Text as="p" variant="bodySm" color="subdued">
                        Daily Spend: ${status?.costOptimization.dailySpend || 0}
                      </Text>
                      <Text as="p" variant="bodySm" color="subdued">
                        Optimization Score: {Math.round((status?.costOptimization.optimizationScore || 0) * 100)}%
                      </Text>
                    </Box>
                  </Card>
                </Box>
              </Box>
            )}

            {selectedTab === 7 && (
              <Box>
                <Text as="h2" variant="headingMd">Disaster Recovery</Text>
                <Box paddingBlockStart="200">
                  <Card>
                    <InlineStack align="space-between" blockAlign="center">
                      <Text as="p" variant="bodyMd">
                        Status: {status?.disasterRecovery.status ? getStatusBadge(status.disasterRecovery.status) : 'Unknown'}
                      </Text>
                      <Button
                        size="slim"
                        loading={actionFetcher.state === 'submitting'}
                        onClick={() => handleAction('disaster-test', { type: 'simulation' })}
                      >
                        Test
                      </Button>
                    </InlineStack>
                    <Box paddingBlockStart="200">
                      <Text as="p" variant="bodySm" color="subdued">
                        Recovery Readiness: {status?.disasterRecovery.recoveryReadiness || 0}%
                      </Text>
                      {status?.disasterRecovery.lastBackup && (
                        <Text as="p" variant="bodySm" color="subdued">
                          Last Backup: {new Date(status.disasterRecovery.lastBackup).toLocaleString()}
                        </Text>
                      )}
                    </Box>
                  </Card>
                </Box>
              </Box>
            )}
          </Box>
        </Tabs>
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

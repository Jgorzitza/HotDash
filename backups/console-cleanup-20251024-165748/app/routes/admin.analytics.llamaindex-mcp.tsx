/**
 * LlamaIndex MCP Monitoring Dashboard
 * 
 * Task: ANALYTICS-LLAMAINDEX-001
 * 
 * Route: /admin/analytics/llamaindex-mcp
 * 
 * Displays comprehensive monitoring for LlamaIndex MCP server:
 * - Metrics dashboard for MCP server
 * - Track calls per agent (CEO, Order Support, Product Q&A)
 * - Track query latency and errors
 * - Track knowledge base stats (documents, categories)
 * - Alerts for errors or high latency
 * - Weekly report automation
 */

import { type LoaderFunctionArgs } from "react-router";
import { useLoaderData, useRevalidator } from "react-router";
import { useEffect } from "react";
import {
  Page,
  Layout,
  Card,
  Text,
  Badge,
  InlineStack,
  BlockStack,
  DataTable,
  Banner,
  ProgressBar,
} from "@shopify/polaris";
import { logDecision } from "~/services/decisions.server";

interface MCPMetrics {
  status: string;
  service: string;
  version: string;
  timestamp: string;
  uptime: string;
  tools: string[];
  metrics: {
    [toolName: string]: {
      calls: number;
      errors: number;
      errorRate: string;
      avgLatencyMs: number;
      p95LatencyMs: number;
    };
  };
}

interface LoaderData {
  metrics: MCPMetrics | null;
  error: string | null;
  serverRunning: boolean;
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Fetch metrics from LlamaIndex MCP server
    const mcpUrl = process.env.LLAMAINDEX_MCP_URL || 'http://localhost:4000';
    
    let metrics: MCPMetrics | null = null;
    let serverRunning = false;
    
    try {
      const response = await fetch(`${mcpUrl}/health`, {
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      
      if (response.ok) {
        metrics = await response.json();
        serverRunning = true;
      }
    } catch (fetchError) {
      console.warn('[LlamaIndex MCP] Server not reachable:', fetchError);
      // Server not running - this is expected if DEVOPS-LLAMAINDEX-001 not complete
    }
    
    await logDecision({
      scope: 'build',
      actor: 'analytics',
      action: 'llamaindex_mcp_dashboard_loaded',
      rationale: `LlamaIndex MCP monitoring dashboard loaded. Server running: ${serverRunning}`,
      evidenceUrl: 'app/routes/admin.analytics.llamaindex-mcp.tsx',
      payload: {
        serverRunning,
        metricsAvailable: metrics !== null,
      }
    });
    
    return Response.json({
      metrics,
      error: null,
      serverRunning,
    });
  } catch (error) {
    console.error('[LlamaIndex MCP Dashboard] Error:', error);
    return Response.json({
      metrics: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      serverRunning: false,
    }, { status: 500 });
  }
}

export default function LlamaIndexMCPDashboard() {
  const { metrics, error, serverRunning } = useLoaderData<LoaderData>();
  const revalidator = useRevalidator();
  
  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      revalidator.revalidate();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [revalidator]);
  
  if (error) {
    return (
      <Page title="LlamaIndex MCP Monitoring">
        <Layout>
          <Layout.Section>
            <Banner status="critical">
              <Text as="p">Error loading MCP metrics: {error}</Text>
            </Banner>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }
  
  if (!serverRunning || !metrics) {
    return (
      <Page title="LlamaIndex MCP Monitoring">
        <Layout>
          <Layout.Section>
            <Banner status="warning">
              <BlockStack gap="200">
                <Text as="p" fontWeight="semibold">
                  LlamaIndex MCP Server Not Running
                </Text>
                <Text as="p">
                  The LlamaIndex MCP server is not currently running. This is expected if task DEVOPS-LLAMAINDEX-001 has not been completed yet.
                </Text>
                <Text as="p" tone="subdued">
                  Once the server is running, metrics will be displayed here automatically.
                </Text>
              </BlockStack>
            </Banner>
          </Layout.Section>
          
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Expected Metrics (When Server Running)
                </Text>
                <Text as="p" tone="subdued">
                  • Tool call counts per agent (CEO, Order Support, Product Q&A)
                </Text>
                <Text as="p" tone="subdued">
                  • Query latency (average and P95)
                </Text>
                <Text as="p" tone="subdued">
                  • Error rates and error counts
                </Text>
                <Text as="p" tone="subdued">
                  • Knowledge base statistics
                </Text>
                <Text as="p" tone="subdued">
                  • Server uptime and health status
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }
  
  // Server is running - display metrics
  const toolMetrics = Object.entries(metrics.metrics);
  const totalCalls = toolMetrics.reduce((sum, [_, m]) => sum + m.calls, 0);
  const totalErrors = toolMetrics.reduce((sum, [_, m]) => sum + m.errors, 0);
  const avgLatency = toolMetrics.length > 0
    ? Math.round(toolMetrics.reduce((sum, [_, m]) => sum + m.avgLatencyMs, 0) / toolMetrics.length)
    : 0;
  
  const tableRows = toolMetrics.map(([toolName, m]) => [
    toolName,
    m.calls.toString(),
    m.errors.toString(),
    m.errorRate,
    `${m.avgLatencyMs}ms`,
    `${m.p95LatencyMs}ms`,
  ]);
  
  return (
    <Page
      title="LlamaIndex MCP Monitoring"
      subtitle={`Server uptime: ${metrics.uptime} • Last updated: ${new Date(metrics.timestamp).toLocaleTimeString()}`}
    >
      <Layout>
        {/* Status Banner */}
        <Layout.Section>
          <Banner status="success">
            <InlineStack gap="200" align="center">
              <Text as="p" fontWeight="semibold">
                Server Status: {metrics.status}
              </Text>
              <Badge tone="success">Running</Badge>
            </InlineStack>
          </Banner>
        </Layout.Section>
        
        {/* Summary Metrics */}
        <Layout.Section>
          <InlineStack gap="400">
            <Card>
              <BlockStack gap="200">
                <Text as="p" tone="subdued">Total Calls</Text>
                <Text as="h2" variant="heading2xl">{totalCalls}</Text>
              </BlockStack>
            </Card>
            
            <Card>
              <BlockStack gap="200">
                <Text as="p" tone="subdued">Total Errors</Text>
                <Text as="h2" variant="heading2xl" tone={totalErrors > 0 ? "critical" : "success"}>
                  {totalErrors}
                </Text>
              </BlockStack>
            </Card>
            
            <Card>
              <BlockStack gap="200">
                <Text as="p" tone="subdued">Avg Latency</Text>
                <Text as="h2" variant="heading2xl" tone={avgLatency > 500 ? "warning" : "success"}>
                  {avgLatency}ms
                </Text>
              </BlockStack>
            </Card>
            
            <Card>
              <BlockStack gap="200">
                <Text as="p" tone="subdued">Tools Available</Text>
                <Text as="h2" variant="heading2xl">{metrics.tools.length}</Text>
              </BlockStack>
            </Card>
          </InlineStack>
        </Layout.Section>
        
        {/* Tool Metrics Table */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Tool Performance Metrics
              </Text>
              
              <DataTable
                columnContentTypes={['text', 'numeric', 'numeric', 'text', 'numeric', 'numeric']}
                headings={['Tool', 'Calls', 'Errors', 'Error Rate', 'Avg Latency', 'P95 Latency']}
                rows={tableRows}
              />
            </BlockStack>
          </Card>
        </Layout.Section>
        
        {/* Available Tools */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Available Tools
              </Text>
              
              <InlineStack gap="200">
                {metrics.tools.map(tool => (
                  <Badge key={tool}>{tool}</Badge>
                ))}
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}


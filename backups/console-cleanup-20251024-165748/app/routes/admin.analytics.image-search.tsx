/**
 * Image Search Analytics Dashboard
 * 
 * Task: ANALYTICS-IMAGE-SEARCH-001
 * 
 * Route: /admin/analytics/image-search
 * 
 * Displays comprehensive analytics for image search feature:
 * - Track image uploads per day/week/month
 * - Track search queries and results
 * - Track GPT-4 Vision API costs
 * - Track embedding generation costs
 * - Track search performance (latency)
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
} from "@shopify/polaris";
import { PrismaClient } from "@prisma/client";
import { logDecision } from "~/services/decisions.server";

const prisma = new PrismaClient();

interface ImageSearchMetrics {
  uploads: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  searches: {
    total: number;
    today: number;
    avgResultsPerSearch: number;
  };
  costs: {
    gpt4Vision: {
      totalCalls: number;
      estimatedCost: number;
    };
    embeddings: {
      totalGenerated: number;
      estimatedCost: number;
    };
    totalEstimatedCost: number;
  };
  performance: {
    avgUploadLatency: number;
    avgSearchLatency: number;
    avgEmbeddingLatency: number;
  };
  featureEnabled: boolean;
}

async function getImageSearchMetrics(): Promise<ImageSearchMetrics> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(now);
  monthStart.setMonth(monthStart.getMonth() - 1);
  
  // Check if tables exist
  let featureEnabled = false;
  try {
    await prisma.$queryRaw`SELECT 1 FROM customer_photos LIMIT 1`;
    featureEnabled = true;
  } catch (error) {
    console.log('[Image Search Analytics] Tables not yet created - feature not enabled');
  }
  
  if (!featureEnabled) {
    return {
      uploads: { total: 0, today: 0, thisWeek: 0, thisMonth: 0 },
      searches: { total: 0, today: 0, avgResultsPerSearch: 0 },
      costs: {
        gpt4Vision: { totalCalls: 0, estimatedCost: 0 },
        embeddings: { totalGenerated: 0, estimatedCost: 0 },
        totalEstimatedCost: 0,
      },
      performance: {
        avgUploadLatency: 0,
        avgSearchLatency: 0,
        avgEmbeddingLatency: 0,
      },
      featureEnabled: false,
    };
  }
  
  // Get upload metrics
  const totalUploads = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*) as count FROM customer_photos
  `;
  
  const todayUploads = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*) as count FROM customer_photos
    WHERE created_at >= ${todayStart}
  `;
  
  const weekUploads = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*) as count FROM customer_photos
    WHERE created_at >= ${weekStart}
  `;
  
  const monthUploads = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*) as count FROM customer_photos
    WHERE created_at >= ${monthStart}
  `;
  
  // Get embedding metrics
  const totalEmbeddings = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*) as count FROM image_embeddings
  `;
  
  // Estimate costs
  // GPT-4 Vision: ~$0.01 per image (gpt-4o-mini is cheaper, ~$0.001)
  // Text embeddings: ~$0.0001 per 1K tokens (description ~200 tokens = $0.00002)
  const gpt4VisionCalls = Number(totalEmbeddings[0]?.count || 0);
  const gpt4VisionCost = gpt4VisionCalls * 0.001; // Using gpt-4o-mini pricing
  
  const embeddingCalls = Number(totalEmbeddings[0]?.count || 0);
  const embeddingCost = embeddingCalls * 0.00002; // ~200 tokens per description
  
  return {
    uploads: {
      total: Number(totalUploads[0]?.count || 0),
      today: Number(todayUploads[0]?.count || 0),
      thisWeek: Number(weekUploads[0]?.count || 0),
      thisMonth: Number(monthUploads[0]?.count || 0),
    },
    searches: {
      total: 0, // TODO: Track in decision_log or separate table
      today: 0,
      avgResultsPerSearch: 0,
    },
    costs: {
      gpt4Vision: {
        totalCalls: gpt4VisionCalls,
        estimatedCost: gpt4VisionCost,
      },
      embeddings: {
        totalGenerated: embeddingCalls,
        estimatedCost: embeddingCost,
      },
      totalEstimatedCost: gpt4VisionCost + embeddingCost,
    },
    performance: {
      avgUploadLatency: 0, // TODO: Track via metrics
      avgSearchLatency: 0,
      avgEmbeddingLatency: 0,
    },
    featureEnabled: true,
  };
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const metrics = await getImageSearchMetrics();
    
    await logDecision({
      scope: 'build',
      actor: 'analytics',
      action: 'image_search_dashboard_loaded',
      rationale: `Image search analytics dashboard loaded. Feature enabled: ${metrics.featureEnabled}`,
      evidenceUrl: 'app/routes/admin.analytics.image-search.tsx',
      payload: {
        featureEnabled: metrics.featureEnabled,
        totalUploads: metrics.uploads.total,
        totalCost: metrics.costs.totalEstimatedCost,
      },
    });
    
    return Response.json({ metrics, error: null });
  } catch (error) {
    console.error('[Image Search Dashboard] Error:', error);
    return Response.json({
      metrics: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export default function ImageSearchAnalyticsDashboard() {
  const { metrics, error } = useLoaderData<{ metrics: ImageSearchMetrics | null; error: string | null }>();
  const revalidator = useRevalidator();
  
  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      revalidator.revalidate();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [revalidator]);
  
  if (error) {
    return (
      <Page title="Image Search Analytics">
        <Layout>
          <Layout.Section>
            <Banner status="critical">
              <Text as="p">Error loading metrics: {error}</Text>
            </Banner>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }
  
  if (!metrics || !metrics.featureEnabled) {
    return (
      <Page title="Image Search Analytics">
        <Layout>
          <Layout.Section>
            <Banner status="warning">
              <BlockStack gap="200">
                <Text as="p" fontWeight="semibold">
                  Image Search Feature Not Yet Enabled
                </Text>
                <Text as="p">
                  The image search feature is not currently enabled. This is expected if task ENG-IMAGE-SEARCH-003 has not been completed yet.
                </Text>
                <Text as="p" tone="subdued">
                  Once the feature is deployed, metrics will be displayed here automatically.
                </Text>
              </BlockStack>
            </Banner>
          </Layout.Section>
          
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Expected Metrics (When Feature Enabled)
                </Text>
                <Text as="p" tone="subdued">
                  • Image uploads per day/week/month
                </Text>
                <Text as="p" tone="subdued">
                  • Search queries and results
                </Text>
                <Text as="p" tone="subdued">
                  • GPT-4 Vision API costs
                </Text>
                <Text as="p" tone="subdued">
                  • Embedding generation costs
                </Text>
                <Text as="p" tone="subdued">
                  • Search performance (latency)
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }
  
  // Feature is enabled - display metrics
  return (
    <Page title="Image Search Analytics">
      <Layout>
        {/* Status Banner */}
        <Layout.Section>
          <Banner status="success">
            <InlineStack gap="200" align="center">
              <Text as="p" fontWeight="semibold">
                Image Search Feature: Active
              </Text>
              <Badge tone="success">Enabled</Badge>
            </InlineStack>
          </Banner>
        </Layout.Section>
        
        {/* Upload Metrics */}
        <Layout.Section>
          <Text as="h2" variant="headingLg">Upload Metrics</Text>
        </Layout.Section>
        
        <Layout.Section>
          <InlineStack gap="400">
            <Card>
              <BlockStack gap="200">
                <Text as="p" tone="subdued">Total Uploads</Text>
                <Text as="h2" variant="heading2xl">{metrics.uploads.total}</Text>
              </BlockStack>
            </Card>
            
            <Card>
              <BlockStack gap="200">
                <Text as="p" tone="subdued">Today</Text>
                <Text as="h2" variant="heading2xl">{metrics.uploads.today}</Text>
              </BlockStack>
            </Card>
            
            <Card>
              <BlockStack gap="200">
                <Text as="p" tone="subdued">This Week</Text>
                <Text as="h2" variant="heading2xl">{metrics.uploads.thisWeek}</Text>
              </BlockStack>
            </Card>
            
            <Card>
              <BlockStack gap="200">
                <Text as="p" tone="subdued">This Month</Text>
                <Text as="h2" variant="heading2xl">{metrics.uploads.thisMonth}</Text>
              </BlockStack>
            </Card>
          </InlineStack>
        </Layout.Section>
        
        {/* Cost Metrics */}
        <Layout.Section>
          <Text as="h2" variant="headingLg">API Cost Tracking</Text>
        </Layout.Section>
        
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack gap="400" align="space-between">
                <BlockStack gap="200">
                  <Text as="p" tone="subdued">GPT-4 Vision API</Text>
                  <Text as="p">{metrics.costs.gpt4Vision.totalCalls} calls</Text>
                  <Text as="p" fontWeight="semibold">
                    ${metrics.costs.gpt4Vision.estimatedCost.toFixed(4)}
                  </Text>
                </BlockStack>
                
                <BlockStack gap="200">
                  <Text as="p" tone="subdued">Embedding Generation</Text>
                  <Text as="p">{metrics.costs.embeddings.totalGenerated} embeddings</Text>
                  <Text as="p" fontWeight="semibold">
                    ${metrics.costs.embeddings.estimatedCost.toFixed(4)}
                  </Text>
                </BlockStack>
                
                <BlockStack gap="200">
                  <Text as="p" tone="subdued">Total Estimated Cost</Text>
                  <Text as="h2" variant="heading2xl" tone={metrics.costs.totalEstimatedCost > 1 ? "warning" : "success"}>
                    ${metrics.costs.totalEstimatedCost.toFixed(2)}
                  </Text>
                </BlockStack>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}


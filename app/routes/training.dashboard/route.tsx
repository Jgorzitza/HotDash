import { json, type LoaderFunctionArgs } from 'react-router';
import { useLoaderData } from 'react-router';
import { Page, Layout, Card, BlockStack, Text, ProgressBar, InlineStack, Badge } from '@shopify/polaris';

interface TrainingMetrics {
  totalApprovals: number;
  approvalRate: number;
  rejectionRate: number;
  editRate: number;
  avgDecisionTime: number;
  improvementTrend: number;
  accuracyScore: number;
}

// Mock data - replace with actual DB queries
export async function loader({ request }: LoaderFunctionArgs) {
  // TODO: Query actual training data from database
  const metrics: TrainingMetrics = {
    totalApprovals: 47,
    approvalRate: 68,
    rejectionRate: 23,
    editRate: 9,
    avgDecisionTime: 2.3,
    improvementTrend: 12,
    accuracyScore: 87
  };
  
  return json({ metrics });
}

export default function TrainingDashboard() {
  const { metrics } = useLoaderData<typeof loader>();
  
  return (
    <Page
      title="Your Training Impact"
      subtitle="See how your feedback improves AI performance"
      backAction={{ url: '/app' }}
    >
      <Layout>
        {/* Overview Stats */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">
                Your Training Progress
              </Text>
              
              <InlineStack gap="600" wrap={false}>
                <div style={{ flex: 1 }}>
                  <BlockStack gap="200">
                    <Text variant="bodyMd" as="p" tone="subdued">
                      Total Approvals Reviewed
                    </Text>
                    <Text variant="heading2xl" as="p">
                      {metrics.totalApprovals}
                    </Text>
                  </BlockStack>
                </div>
                
                <div style={{ flex: 1 }}>
                  <BlockStack gap="200">
                    <Text variant="bodyMd" as="p" tone="subdued">
                      Accuracy Score
                    </Text>
                    <Text variant="heading2xl" as="p">
                      {metrics.accuracyScore}%
                    </Text>
                  </BlockStack>
                </div>
                
                <div style={{ flex: 1 }}>
                  <BlockStack gap="200">
                    <Text variant="bodyMd" as="p" tone="subdued">
                      Avg Decision Time
                    </Text>
                    <Text variant="heading2xl" as="p">
                      {metrics.avgDecisionTime}m
                    </Text>
                  </BlockStack>
                </div>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>
        
        {/* Decision Breakdown */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">
                Your Decision Patterns
              </Text>
              
              <BlockStack gap="300">
                {/* Approval Rate */}
                <BlockStack gap="200">
                  <InlineStack align="space-between">
                    <Text variant="bodyMd" as="p">
                      Approvals
                    </Text>
                    <Text variant="bodyMd" as="p" fontWeight="semibold">
                      {metrics.approvalRate}%
                    </Text>
                  </InlineStack>
                  <ProgressBar progress={metrics.approvalRate} size="small" tone="success" />
                  <Text variant="bodySm" as="p" tone="subdued">
                    Target: 70-85% (you're on track)
                  </Text>
                </BlockStack>
                
                {/* Rejection Rate */}
                <BlockStack gap="200">
                  <InlineStack align="space-between">
                    <Text variant="bodyMd" as="p">
                      Rejections
                    </Text>
                    <Text variant="bodyMd" as="p" fontWeight="semibold">
                      {metrics.rejectionRate}%
                    </Text>
                  </InlineStack>
                  <ProgressBar progress={metrics.rejectionRate} size="small" tone="warning" />
                  <Text variant="bodySm" as="p" tone="subdued">
                    Target: 15-25% (good quality control)
                  </Text>
                </BlockStack>
                
                {/* Edit Rate */}
                <BlockStack gap="200">
                  <InlineStack align="space-between">
                    <Text variant="bodyMd" as="p">
                      Edits
                    </Text>
                    <Text variant="bodyMd" as="p" fontWeight="semibold">
                      {metrics.editRate}%
                    </Text>
                  </InlineStack>
                  <ProgressBar progress={metrics.editRate} size="small" tone="info" />
                  <Text variant="bodySm" as="p" tone="subdued">
                    Your tone adjustments help AI learn brand voice
                  </Text>
                </BlockStack>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
        
        {/* AI Improvement */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between" blockAlign="center">
                <Text variant="headingMd" as="h2">
                  AI Learning from Your Feedback
                </Text>
                <Badge tone="success">
                  +{metrics.improvementTrend}% This Week
                </Badge>
              </InlineStack>
              
              <BlockStack gap="200">
                <Text variant="bodyMd" as="p">
                  The AI is getting better at matching your approval preferences:
                </Text>
                
                <ul style={{ paddingLeft: '20px' }}>
                  <li>
                    <Text variant="bodyMd" as="span">
                      <strong>Tone Matching:</strong> AI now uses more enthusiast language after your edits
                    </Text>
                  </li>
                  <li>
                    <Text variant="bodyMd" as="span">
                      <strong>Policy Accuracy:</strong> Fewer policy errors after your corrections
                    </Text>
                  </li>
                  <li>
                    <Text variant="bodyMd" as="span">
                      <strong>Response Quality:</strong> Your approval rate trending up (+{metrics.improvementTrend}%)
                    </Text>
                  </li>
                </ul>
                
                <Text variant="bodyMd" as="p" tone="subdued">
                  Every rejection and edit helps the AI learn. Keep providing feedback!
                </Text>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
        
        {/* Quick Tips */}
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="300">
              <Text variant="headingMd" as="h3">
                Quick Tips
              </Text>
              
              <BlockStack gap="200">
                <Text variant="bodyMd" as="p" fontWeight="semibold">
                  ⚡ Speed Up:
                </Text>
                <Text variant="bodySm" as="p">
                  For order status queries with high confidence, quick approve (30-60 sec)
                </Text>
                
                <Text variant="bodyMd" as="p" fontWeight="semibold">
                  🎯 Focus On:
                </Text>
                <Text variant="bodySm" as="p">
                  Policy accuracy and Hot Rod tone - these are where you add most value
                </Text>
                
                <Text variant="bodyMd" as="p" fontWeight="semibold">
                  ⚠️ Watch For:
                </Text>
                <Text variant="bodySm" as="p">
                  High-value disputes ($100+) and threats always need escalation
                </Text>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}


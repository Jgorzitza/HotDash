import { json, type LoaderFunctionArgs } from 'react-router';
import { useLoaderData } from 'react-router';
import { Page, Layout, Card, BlockStack, Text, Badge, InlineStack, ProgressBar, Button } from '@shopify/polaris';

interface CertificationLevel {
  level: number;
  title: string;
  badge: string;
  requirements: string[];
  achieved: boolean;
  progress: number;
}

interface CertificationData {
  currentLevel: number;
  levels: CertificationLevel[];
  stats: {
    totalApprovals: number;
    approvalRate: number;
    avgTimeMinutes: number;
    escalationRate: number;
  };
}

export async function loader({ request }: LoaderFunctionArgs) {
  // TODO: Query actual certification data from database
  const data: CertificationData = {
    currentLevel: 1,
    levels: [
      {
        level: 1,
        title: 'Queue Operator',
        badge: '🟢',
        requirements: [
          'Complete 30-min training session',
          'Pass 10-question quiz (80%)',
          'Complete 3 practice scenarios',
          'Review 5 live approvals with manager'
        ],
        achieved: true,
        progress: 100
      },
      {
        level: 2,
        title: 'Skilled Operator',
        badge: '🔵',
        requirements: [
          '2 weeks experience',
          '50+ successful approvals',
          'Approval rate 70-85%',
          'Pass complex scenario quiz',
          'Manager review of 20 approvals'
        ],
        achieved: false,
        progress: 65
      },
      {
        level: 3,
        title: 'Expert Operator',
        badge: '🟡',
        requirements: [
          '1 month experience',
          '200+ successful approvals',
          'Avg time <2 minutes',
          'Train 1 new operator',
          'Contribute KB improvement'
        ],
        achieved: false,
        progress: 0
      },
      {
        level: 4,
        title: 'Queue Master',
        badge: '🏆',
        requirements: [
          '3 months experience',
          '1000+ successful approvals',
          'Avg time <90 seconds',
          'Lead training session',
          'Process improvement implemented'
        ],
        achieved: false,
        progress: 0
      }
    ],
    stats: {
      totalApprovals: 47,
      approvalRate: 68,
      avgTimeMinutes: 2.3,
      escalationRate: 14
    }
  };
  
  return json({ data });
}

export default function TrainingCertification() {
  const { data } = useLoaderData<typeof loader>();
  
  return (
    <Page
      title="Certification Progress"
      subtitle="Track your journey from operator to master"
      backAction={{ url: '/app' }}
    >
      <Layout>
        {/* Current Level */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between" blockAlign="center">
                <Text variant="headingLg" as="h2">
                  Your Current Level
                </Text>
                <Badge tone="success" size="large">
                  {data.levels[data.currentLevel - 1].badge} Level {data.currentLevel}: {data.levels[data.currentLevel - 1].title}
                </Badge>
              </InlineStack>
              
              <Text variant="bodyMd" as="p">
                You've achieved {data.levels.filter(l => l.achieved).length} of {data.levels.length} certification levels.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
        
        {/* Performance Stats */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h3">
                Your Performance Stats
              </Text>
              
              <InlineStack gap="600" wrap={false}>
                <div style={{ flex: 1 }}>
                  <BlockStack gap="200">
                    <Text variant="bodySm" as="p" tone="subdued">
                      Total Approvals
                    </Text>
                    <Text variant="headingLg" as="p">
                      {data.stats.totalApprovals}
                    </Text>
                  </BlockStack>
                </div>
                
                <div style={{ flex: 1 }}>
                  <BlockStack gap="200">
                    <Text variant="bodySm" as="p" tone="subdued">
                      Approval Rate
                    </Text>
                    <Text variant="headingLg" as="p">
                      {data.stats.approvalRate}%
                    </Text>
                    <Text variant="bodySm" as="p" tone={
                      data.stats.approvalRate >= 70 && data.stats.approvalRate <= 85 ? 'success' : 'subdued'
                    }>
                      Target: 70-85%
                    </Text>
                  </BlockStack>
                </div>
                
                <div style={{ flex: 1 }}>
                  <BlockStack gap="200">
                    <Text variant="bodySm" as="p" tone="subdued">
                      Avg Decision Time
                    </Text>
                    <Text variant="headingLg" as="p">
                      {data.stats.avgTimeMinutes}m
                    </Text>
                    <Text variant="bodySm" as="p" tone={
                      data.stats.avgTimeMinutes <= 3 ? 'success' : 'subdued'
                    }>
                      Target: 1-3 min
                    </Text>
                  </BlockStack>
                </div>
                
                <div style={{ flex: 1 }}>
                  <BlockStack gap="200">
                    <Text variant="bodySm" as="p" tone="subdued">
                      Escalation Rate
                    </Text>
                    <Text variant="headingLg" as="p">
                      {data.stats.escalationRate}%
                    </Text>
                    <Text variant="bodySm" as="p" tone={
                      data.stats.escalationRate >= 10 && data.stats.escalationRate <= 15 ? 'success' : 'subdued'
                    }>
                      Target: 10-15%
                    </Text>
                  </BlockStack>
                </div>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>
        
        {/* Certification Levels */}
        {data.levels.map((level, index) => (
          <Layout.Section key={level.level}>
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between" blockAlign="center">
                  <InlineStack gap="300" blockAlign="center">
                    <Text variant="headingMd" as="h3">
                      {level.badge} Level {level.level}: {level.title}
                    </Text>
                    {level.achieved && (
                      <Badge tone="success">Achieved ✓</Badge>
                    )}
                    {!level.achieved && level.progress > 0 && (
                      <Badge tone="info">In Progress</Badge>
                    )}
                  </InlineStack>
                </InlineStack>
                
                {!level.achieved && level.progress > 0 && (
                  <BlockStack gap="200">
                    <Text variant="bodySm" as="p" tone="subdued">
                      Progress to Level {level.level}
                    </Text>
                    <ProgressBar progress={level.progress} size="small" />
                  </BlockStack>
                )}
                
                <BlockStack gap="100">
                  <Text variant="bodyMd" as="p" fontWeight="semibold">
                    Requirements:
                  </Text>
                  <ul style={{ paddingLeft: '20px', margin: 0 }}>
                    {level.requirements.map((req, i) => (
                      <li key={i}>
                        <Text variant="bodySm" as="span">
                          {req}
                        </Text>
                      </li>
                    ))}
                  </ul>
                </BlockStack>
                
                {!level.achieved && index === data.currentLevel && (
                  <InlineStack gap="200">
                    <Button variant="primary" url="/training/onboarding">
                      Continue Training
                    </Button>
                    <Button url={`/training/quiz/level-${level.level}`}>
                      Take Assessment
                    </Button>
                  </InlineStack>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
        ))}
      </Layout>
    </Page>
  );
}


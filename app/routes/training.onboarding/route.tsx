import { useState, useEffect } from 'react';
import { Page, Layout, Card, BlockStack, Text, Button, ProgressBar, InlineStack, Badge, Checkbox, Banner } from '@shopify/polaris';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'reading' | 'practice' | 'quiz' | 'observation';
  duration: number; // minutes
  required: boolean;
  resourceUrl?: string;
  completed: boolean;
}

interface OnboardingTrack {
  role: 'support' | 'sales' | 'manager';
  steps: OnboardingStep[];
}

const ONBOARDING_TRACKS: Record<string, OnboardingTrack> = {
  support: {
    role: 'support',
    steps: [
      {
        id: 'video-basics',
        title: 'Watch: OCC Overview',
        description: 'Learn the basics of the Operator Control Center',
        type: 'video',
        duration: 6,
        required: true,
        resourceUrl: '/training/videos/occ-overview',
        completed: false
      },
      {
        id: 'read-guide',
        title: 'Read: Support Operator Guide',
        description: 'Review decision framework and escalation rules',
        type: 'reading',
        duration: 15,
        required: true,
        resourceUrl: '/training/guides/support-operator',
        completed: false
      },
      {
        id: 'practice-queue',
        title: 'Practice: Approval Queue Training',
        description: 'Complete 4 training scenarios',
        type: 'practice',
        duration: 20,
        required: true,
        resourceUrl: '/training/approval-queue',
        completed: false
      },
      {
        id: 'quiz-knowledge',
        title: 'Quiz: Knowledge Check',
        description: 'Pass 10-question assessment (80% required)',
        type: 'quiz',
        duration: 10,
        required: true,
        resourceUrl: '/training/quiz/level-1',
        completed: false
      },
      {
        id: 'observe-live',
        title: 'Live Practice: Shadowing',
        description: 'Review 5 real approvals with manager',
        type: 'observation',
        duration: 30,
        required: true,
        completed: false
      }
    ]
  },
  sales: {
    role: 'sales',
    steps: [
      {
        id: 'video-basics',
        title: 'Watch: OCC Overview',
        description: 'Learn the basics of the Operator Control Center',
        type: 'video',
        duration: 6,
        required: true,
        resourceUrl: '/training/videos/occ-overview',
        completed: false
      },
      {
        id: 'read-guide',
        title: 'Read: Sales Operator Guide',
        description: 'Review upsell techniques and sales protocols',
        type: 'reading',
        duration: 15,
        required: true,
        resourceUrl: '/training/guides/sales-operator',
        completed: false
      },
      {
        id: 'product-knowledge',
        title: 'Study: Hot Rod Product Knowledge',
        description: 'Learn product categories and fitment basics',
        type: 'reading',
        duration: 30,
        required: true,
        resourceUrl: '/training/product-knowledge',
        completed: false
      },
      {
        id: 'practice-queue',
        title: 'Practice: Sales Approval Training',
        description: 'Complete 4 sales-focused scenarios',
        type: 'practice',
        duration: 25,
        required: true,
        resourceUrl: '/training/approval-queue',
        completed: false
      },
      {
        id: 'quiz-knowledge',
        title: 'Quiz: Sales Knowledge Check',
        description: 'Pass assessment (80% required)',
        type: 'quiz',
        duration: 10,
        required: true,
        resourceUrl: '/training/quiz/sales-level-1',
        completed: false
      }
    ]
  },
  manager: {
    role: 'manager',
    steps: [
      {
        id: 'video-basics',
        title: 'Watch: OCC Overview',
        description: 'Learn the Operator Control Center architecture',
        type: 'video',
        duration: 6,
        required: true,
        resourceUrl: '/training/videos/occ-overview',
        completed: false
      },
      {
        id: 'read-guide',
        title: 'Read: Manager Escalation Guide',
        description: 'Review escalation handling and coaching techniques',
        type: 'reading',
        duration: 20,
        required: true,
        resourceUrl: '/training/guides/manager-operator',
        completed: false
      },
      {
        id: 'practice-escalations',
        title: 'Practice: Escalation Scenarios',
        description: 'Handle 5 escalation situations',
        type: 'practice',
        duration: 30,
        required: true,
        resourceUrl: '/training/escalation-scenarios',
        completed: false
      },
      {
        id: 'dashboard-training',
        title: 'Review: Performance Dashboard',
        description: 'Learn to monitor operator performance',
        type: 'reading',
        duration: 15,
        required: true,
        resourceUrl: '/training/dashboard',
        completed: false
      },
      {
        id: 'quiz-knowledge',
        title: 'Quiz: Manager Assessment',
        description: 'Pass management assessment (80% required)',
        type: 'quiz',
        duration: 15,
        required: true,
        resourceUrl: '/training/quiz/manager-level-1',
        completed: false
      }
    ]
  }
};

export default function TrainingOnboarding() {
  const [selectedRole, setSelectedRole] = useState<'support' | 'sales' | 'manager'>('support');
  const [steps, setSteps] = useState<OnboardingStep[]>(ONBOARDING_TRACKS[selectedRole].steps);
  
  useEffect(() => {
    setSteps(ONBOARDING_TRACKS[selectedRole].steps);
  }, [selectedRole]);
  
  const handleStepToggle = (stepId: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: !step.completed } : step
    ));
  };
  
  const completedSteps = steps.filter(s => s.completed).length;
  const totalSteps = steps.length;
  const progress = (completedSteps / totalSteps) * 100;
  const totalTime = steps.reduce((sum, step) => sum + step.duration, 0);
  const completedTime = steps.filter(s => s.completed).reduce((sum, step) => sum + step.duration, 0);
  
  const getStepIcon = (type: OnboardingStep['type']) => {
    switch (type) {
      case 'video': return '📹';
      case 'reading': return '📖';
      case 'practice': return '🎯';
      case 'quiz': return '✅';
      case 'observation': return '👁️';
    }
  };
  
  return (
    <Page
      title="Operator Onboarding"
      subtitle="Complete your training path to become certified"
      backAction={{ url: '/app' }}
    >
      <Layout>
        {/* Role Selection */}
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text variant="headingMd" as="h2">
                Select Your Role
              </Text>
              <InlineStack gap="300">
                <Button
                  onClick={() => setSelectedRole('support')}
                  variant={selectedRole === 'support' ? 'primary' : 'secondary'}
                >
                  Support Operator
                </Button>
                <Button
                  onClick={() => setSelectedRole('sales')}
                  variant={selectedRole === 'sales' ? 'primary' : 'secondary'}
                >
                  Sales Operator
                </Button>
                <Button
                  onClick={() => setSelectedRole('manager')}
                  variant={selectedRole === 'manager' ? 'primary' : 'secondary'}
                >
                  Manager
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>
        
        {/* Progress Overview */}
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <InlineStack align="space-between">
                <Text variant="headingMd" as="h2">
                  Your Progress
                </Text>
                <Badge tone={progress === 100 ? 'success' : 'info'}>
                  {completedSteps}/{totalSteps} Steps
                </Badge>
              </InlineStack>
              
              <ProgressBar progress={progress} size="medium" tone="primary" />
              
              <InlineStack gap="400">
                <Text variant="bodySm" as="p" tone="subdued">
                  Time invested: {completedTime} min
                </Text>
                <Text variant="bodySm" as="p" tone="subdued">
                  Remaining: {totalTime - completedTime} min
                </Text>
              </InlineStack>
              
              {progress === 100 && (
                <Banner tone="success" title="Onboarding Complete! 🎉">
                  You've completed all required training. You're now certified as a Level 1 Queue Operator.
                </Banner>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
        
        {/* Onboarding Steps */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">
                Training Checklist
              </Text>
              
              <BlockStack gap="300">
                {steps.map((step, index) => (
                  <div key={step.id} style={{
                    padding: '16px',
                    background: step.completed ? '#f1f8f4' : '#ffffff',
                    border: '1px solid #e1e3e5',
                    borderRadius: '8px'
                  }}>
                    <BlockStack gap="200">
                      <InlineStack align="space-between" blockAlign="start">
                        <InlineStack gap="300" blockAlign="center">
                          <Checkbox
                            label=""
                            checked={step.completed}
                            onChange={() => handleStepToggle(step.id)}
                          />
                          <BlockStack gap="100">
                            <InlineStack gap="200" blockAlign="center">
                              <Text variant="bodyMd" as="p" fontWeight="semibold">
                                {getStepIcon(step.type)} {step.title}
                              </Text>
                              {step.required && (
                                <Badge tone="info" size="small">Required</Badge>
                              )}
                            </InlineStack>
                            <Text variant="bodySm" as="p" tone="subdued">
                              {step.description}
                            </Text>
                          </BlockStack>
                        </InlineStack>
                        
                        <InlineStack gap="200">
                          <Text variant="bodySm" as="p" tone="subdued">
                            {step.duration} min
                          </Text>
                          {step.resourceUrl && !step.completed && (
                            <Button size="slim" url={step.resourceUrl}>
                              Start
                            </Button>
                          )}
                        </InlineStack>
                      </InlineStack>
                    </BlockStack>
                  </div>
                ))}
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
        
        {/* Next Steps */}
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="300">
              <Text variant="headingMd" as="h3">
                Next Steps
              </Text>
              
              {progress < 100 ? (
                <BlockStack gap="200">
                  <Text variant="bodyMd" as="p">
                    Complete the checklist to become certified!
                  </Text>
                  
                  <Text variant="bodySm" as="p" tone="subdued">
                    {steps.filter(s => !s.completed && s.required).length} required steps remaining
                  </Text>
                  
                  {steps.find(s => !s.completed)?.resourceUrl && (
                    <Button
                      variant="primary"
                      url={steps.find(s => !s.completed)?.resourceUrl}
                    >
                      Continue Training
                    </Button>
                  )}
                </BlockStack>
              ) : (
                <BlockStack gap="200">
                  <Text variant="bodyMd" as="p">
                    🎉 Ready to start using the approval queue!
                  </Text>
                  
                  <Button variant="primary" url="/app/approvals">
                    Go to Approval Queue
                  </Button>
                  
                  <Button url="/training/dashboard">
                    View Your Dashboard
                  </Button>
                </BlockStack>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}


import { useState } from 'react';
import { Page, Layout, Card, BlockStack, InlineStack, Text, Button, Badge, Banner, ProgressBar } from '@shopify/polaris';

interface TrainingScenario {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  conversationId: number;
  customerMessage: string;
  aiResponse: string;
  correctAction: 'approve' | 'reject' | 'edit';
  feedback: {
    approve?: string;
    reject?: string;
    edit?: string;
  };
  hints: string[];
}

const TRAINING_SCENARIOS: TrainingScenario[] = [
  {
    id: 'scenario-1',
    title: 'Simple Order Status Query',
    difficulty: 'easy',
    conversationId: 1001,
    customerMessage: 'Where is my order #12345?',
    aiResponse: 'Hi! Your order #12345 shipped yesterday via FedEx. Tracking: 1Z999AA10123456784. Expected delivery: Tuesday.',
    correctAction: 'approve',
    feedback: {
      approve: '✅ Correct! This is accurate, complete, and has the right tone. Quick approval is appropriate.',
      reject: '❌ Not quite. The AI response is accurate and helpful. Rejecting would waste time.',
      edit: '⚠️ You could edit, but this response is already good. Editing here would be unnecessary.'
    },
    hints: [
      'Check: Is the information accurate?',
      'Check: Does it answer the question?',
      'Check: Is the tone appropriate?'
    ]
  },
  {
    id: 'scenario-2',
    title: 'Incorrect Policy Information',
    difficulty: 'medium',
    conversationId: 1002,
    customerMessage: 'Can I return this after 25 days?',
    aiResponse: 'Sorry, our return policy is 14 days. We cannot accept returns after that.',
    correctAction: 'reject',
    feedback: {
      approve: '❌ Wrong! The AI cited a 14-day policy, but Hot Rodan has a 30-day return policy. Approving this would give false information.',
      reject: '✅ Correct! The policy is wrong (30 days, not 14). You caught the error before it reached the customer.',
      edit: '⚠️ You could edit to fix the policy, but rejecting and handling manually is better for training the AI.'
    },
    hints: [
      'What is Hot Rodan\'s actual return policy?',
      'Would this response help or harm the customer?',
      'How confident is the AI in this answer?'
    ]
  },
  {
    id: 'scenario-3',
    title: 'Tone Needs Improvement',
    difficulty: 'medium',
    conversationId: 1003,
    customerMessage: 'I\'m building a \'67 Mustang. Will these headers fit?',
    aiResponse: 'Yes, part #HED-67 fits 1967 Mustang.',
    correctAction: 'edit',
    feedback: {
      approve: '⚠️ The info is correct, but the tone is too dry for Hot Rod culture. Editing would add enthusiast energy.',
      reject: '❌ Rejecting is too harsh. The info is accurate, it just needs tone improvement.',
      edit: '✅ Correct! Edit to add enthusiasm: "Absolutely! Part #HED-67 bolts right up to \'67 Mustangs. That\'s going to be a sweet build!"'
    },
    hints: [
      'Is the information accurate?',
      'Does the tone match Hot Rod culture?',
      'How would an enthusiast talk to another enthusiast?'
    ]
  },
  {
    id: 'scenario-4',
    title: 'High-Value Issue (Escalate)',
    difficulty: 'hard',
    conversationId: 1004,
    customerMessage: 'You charged me $850 twice! I\'m calling my credit card company!',
    aiResponse: 'I apologize for the error. Let me check your account and process a refund right away.',
    correctAction: 'reject',
    feedback: {
      approve: '❌ Never approve high-value disputes ($850) or chargeback threats. This needs manager escalation.',
      reject: '✅ Correct! Escalate to manager immediately. High value + threat = manager handles directly.',
      edit: '❌ Editing won\'t help here. This needs immediate manager attention, not AI response.'
    },
    hints: [
      'What is the dollar amount?',
      'Did the customer make any threats?',
      'Should AI handle this alone?'
    ]
  }
];

export default function TrainingApprovalQueue() {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [userAction, setUserAction] = useState<'approve' | 'reject' | 'edit' | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [completedScenarios, setCompletedScenarios] = useState<string[]>([]);
  
  const scenario = TRAINING_SCENARIOS[currentScenario];
  const progress = ((currentScenario + 1) / TRAINING_SCENARIOS.length) * 100;
  
  const handleAction = (action: 'approve' | 'reject' | 'edit') => {
    setUserAction(action);
    setShowFeedback(true);
    
    const isCorrect = action === scenario.correctAction;
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
    
    setCompletedScenarios(prev => [...prev, scenario.id]);
  };
  
  const handleNext = () => {
    setUserAction(null);
    setShowFeedback(false);
    
    if (currentScenario < TRAINING_SCENARIOS.length - 1) {
      setCurrentScenario(prev => prev + 1);
    }
  };
  
  const handleReset = () => {
    setCurrentScenario(0);
    setUserAction(null);
    setShowFeedback(false);
    setScore({ correct: 0, total: 0 });
    setCompletedScenarios([]);
  };
  
  const isComplete = currentScenario === TRAINING_SCENARIOS.length - 1 && showFeedback;
  const scorePercentage = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
  
  return (
    <Page
      title="Approval Queue Training"
      subtitle="Learn to review and approve AI responses effectively"
      backAction={{ url: '/app' }}
    >
      <Layout>
        {/* Progress */}
        <Layout.Section>
          <Card>
            <BlockStack gap="200">
              <InlineStack align="space-between">
                <Text variant="bodyMd" as="p">
                  Scenario {currentScenario + 1} of {TRAINING_SCENARIOS.length}
                </Text>
                <Text variant="bodyMd" as="p">
                  Score: {score.correct}/{score.total} ({scorePercentage}%)
                </Text>
              </InlineStack>
              <ProgressBar progress={progress} size="small" tone="primary" />
            </BlockStack>
          </Card>
        </Layout.Section>
        
        {/* Scenario */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              {/* Header */}
              <InlineStack align="space-between" blockAlign="center">
                <Text variant="headingMd" as="h2">
                  {scenario.title}
                </Text>
                <Badge tone={
                  scenario.difficulty === 'easy' ? 'success' :
                  scenario.difficulty === 'medium' ? 'warning' :
                  'critical'
                }>
                  {scenario.difficulty.toUpperCase()}
                </Badge>
              </InlineStack>
              
              {/* Customer Message */}
              <BlockStack gap="200">
                <Text variant="bodyMd" as="p" fontWeight="semibold">
                  Customer Message (Conversation #{scenario.conversationId}):
                </Text>
                <div style={{ 
                  background: '#f6f6f7', 
                  padding: '12px', 
                  borderRadius: '4px',
                  fontStyle: 'italic'
                }}>
                  "{scenario.customerMessage}"
                </div>
              </BlockStack>
              
              {/* AI Response */}
              <BlockStack gap="200">
                <Text variant="bodyMd" as="p" fontWeight="semibold">
                  AI Generated Response:
                </Text>
                <div style={{ 
                  background: '#e3f2fd', 
                  padding: '12px', 
                  borderRadius: '4px'
                }}>
                  {scenario.aiResponse}
                </div>
              </BlockStack>
              
              {/* Hints */}
              {!showFeedback && (
                <BlockStack gap="200">
                  <Text variant="bodyMd" as="p" tone="subdued">
                    Consider these checks:
                  </Text>
                  <ul style={{ paddingLeft: '20px', color: '#6d7175' }}>
                    {scenario.hints.map((hint, i) => (
                      <li key={i}>{hint}</li>
                    ))}
                  </ul>
                </BlockStack>
              )}
              
              {/* Actions */}
              {!showFeedback ? (
                <InlineStack gap="300">
                  <Button onClick={() => handleAction('approve')} variant="primary">
                    ✅ Approve
                  </Button>
                  <Button onClick={() => handleAction('reject')} tone="critical">
                    ❌ Reject
                  </Button>
                  <Button onClick={() => handleAction('edit')}>
                    ✏️ Edit Response
                  </Button>
                </InlineStack>
              ) : (
                <BlockStack gap="300">
                  {/* Feedback Banner */}
                  <Banner
                    tone={userAction === scenario.correctAction ? 'success' : 'warning'}
                    title={userAction === scenario.correctAction ? 'Correct!' : 'Not Quite'}
                  >
                    {scenario.feedback[userAction!]}
                  </Banner>
                  
                  {/* Navigation */}
                  {isComplete ? (
                    <BlockStack gap="300">
                      <Banner tone="success" title="Training Complete!">
                        <p>You scored {score.correct} out of {score.total} ({scorePercentage}%).</p>
                        {scorePercentage >= 75 ? (
                          <p>Great work! You're ready to handle real approvals.</p>
                        ) : (
                          <p>Review the feedback and try again to improve your score.</p>
                        )}
                      </Banner>
                      <InlineStack gap="300">
                        <Button onClick={handleReset} variant="primary">
                          Restart Training
                        </Button>
                        <Button url="/app/approvals">
                          Go to Approval Queue
                        </Button>
                      </InlineStack>
                    </BlockStack>
                  ) : (
                    <Button onClick={handleNext} variant="primary">
                      Next Scenario →
                    </Button>
                  )}
                </BlockStack>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
        
        {/* Training Guide */}
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="300">
              <Text variant="headingMd" as="h3">
                Decision Framework
              </Text>
              <BlockStack gap="200">
                <Text variant="bodyMd" as="p" fontWeight="semibold">
                  ✅ Approve when:
                </Text>
                <ul style={{ paddingLeft: '20px', fontSize: '14px' }}>
                  <li>Information is accurate</li>
                  <li>Answers customer question</li>
                  <li>Tone is appropriate</li>
                  <li>No red flags</li>
                </ul>
                
                <Text variant="bodyMd" as="p" fontWeight="semibold">
                  ❌ Reject when:
                </Text>
                <ul style={{ paddingLeft: '20px', fontSize: '14px' }}>
                  <li>Information is wrong</li>
                  <li>Doesn't answer question</li>
                  <li>Missing critical details</li>
                  <li>High-risk situations</li>
                </ul>
                
                <Text variant="bodyMd" as="p" fontWeight="semibold">
                  ✏️ Edit when:
                </Text>
                <ul style={{ paddingLeft: '20px', fontSize: '14px' }}>
                  <li>Info correct but tone off</li>
                  <li>Minor improvements needed</li>
                  <li>Add enthusiast language</li>
                  <li>Personalize response</li>
                </ul>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}


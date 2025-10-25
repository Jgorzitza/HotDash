/**
 * Welcome Modal Component
 * 
 * First-visit welcome modal with 3-step setup guide
 * 
 * Task: ENG-079
 */

import { useState, useEffect } from 'react';
import {
  Modal,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Checkbox,
  ProgressBar,
  Icon,
  Badge,
} from '@shopify/polaris';
import {
  FlagIcon,
  CheckCircleIcon,
  SettingsIcon,
  NotificationIcon,
} from '@shopify/polaris-icons';

export interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

interface SetupStep {
  id: string;
  title: string;
  description: string;
  icon: typeof FlagIcon;
  completed: boolean;
}

export function WelcomeModal({ open, onClose, onComplete }: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [steps, setSteps] = useState<SetupStep[]>([
    {
      id: 'dashboard',
      title: 'Explore Your Dashboard',
      description: 'Get familiar with your 8 control tiles: Sales Pulse, Inventory Heatmap, CX Escalations, and more. Each tile gives you real-time insights into your business.',
      icon: FlagIcon,
      completed: false,
    },
    {
      id: 'approvals',
      title: 'Set Up Approval Workflow',
      description: 'Review and approve AI-suggested actions before they execute. Your approval queue shows pending inventory orders, customer replies, and growth recommendations.',
      icon: CheckCircleIcon,
      completed: false,
    },
    {
      id: 'notifications',
      title: 'Configure Notifications',
      description: 'Choose how you want to be notified about critical alerts, approval requests, and performance updates. Stay informed without being overwhelmed.',
      icon: NotificationIcon,
      completed: false,
    },
  ]);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setCurrentStep(0);
      setDontShowAgain(false);
      setSteps(prev => prev.map(step => ({ ...step, completed: false })));
    }
  }, [open]);

  // Mark current step as completed and move to next
  const handleNext = () => {
    setSteps(prev => prev.map((step, index) => 
      index === currentStep ? { ...step, completed: true } : step
    ));

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  // Skip current step and move to next
  const handleSkip = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  // Complete the tour
  const handleComplete = () => {
    if (dontShowAgain) {
      // Store preference in localStorage
      localStorage.setItem('hotdash_welcome_completed', 'true');
    }
    
    if (onComplete) {
      onComplete();
    }
    
    onClose();
  };

  // Close modal
  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('hotdash_welcome_completed', 'true');
    }
    onClose();
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const completedSteps = steps.filter(s => s.completed).length;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Welcome to Hot Dash Control Center"
      size="large"
      primaryAction={{
        content: isLastStep ? 'Get Started' : 'Next',
        onAction: handleNext,
      }}
      secondaryActions={[
        {
          content: isLastStep ? 'Skip for Now' : 'Skip This Step',
          onAction: handleSkip,
        },
      ]}
    >
      <Modal.Section>
        <BlockStack gap="500">
          {/* Progress indicator */}
          <BlockStack gap="200">
            <InlineStack align="space-between">
              <Text as="p" variant="bodySm" tone="subdued">
                Step {currentStep + 1} of {steps.length}
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                {completedSteps} completed
              </Text>
            </InlineStack>
            <ProgressBar progress={progress} size="small" />
          </BlockStack>

          {/* Current step content */}
          <BlockStack gap="400" align="center">
            <div style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--p-color-bg-surface-info)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Icon source={currentStepData.icon} tone="info" />
            </div>

            <BlockStack gap="200" align="center">
              <Text variant="headingLg" as="h2" alignment="center">
                {currentStepData.title}
              </Text>
              
              <Text variant="bodyMd" as="p" alignment="center" tone="subdued">
                {currentStepData.description}
              </Text>
            </BlockStack>

            {/* Step-specific content */}
            {currentStepData.id === 'dashboard' && (
              <BlockStack gap="300">
                <InlineStack gap="200" wrap={false}>
                  <Badge tone="info">Sales Pulse</Badge>
                  <Badge tone="success">Inventory</Badge>
                  <Badge tone="warning">CX Escalations</Badge>
                  <Badge tone="attention">Growth Engine</Badge>
                </InlineStack>
                <Text variant="bodySm" as="p" alignment="center" tone="subdued">
                  Each tile updates in real-time with live data from your store
                </Text>
              </BlockStack>
            )}

            {currentStepData.id === 'approvals' && (
              <BlockStack gap="300">
                <InlineStack gap="400" align="center">
                  <div style={{ textAlign: 'center' }}>
                    <Text variant="headingMd" as="p">AI Suggests</Text>
                    <Text variant="bodySm" as="p" tone="subdued">Inventory orders</Text>
                    <Text variant="bodySm" as="p" tone="subdued">Customer replies</Text>
                    <Text variant="bodySm" as="p" tone="subdued">Growth actions</Text>
                  </div>
                  <Text variant="headingLg" as="p">→</Text>
                  <div style={{ textAlign: 'center' }}>
                    <Text variant="headingMd" as="p">You Approve</Text>
                    <Text variant="bodySm" as="p" tone="subdued">Review evidence</Text>
                    <Text variant="bodySm" as="p" tone="subdued">Make edits</Text>
                    <Text variant="bodySm" as="p" tone="subdued">Approve or reject</Text>
                  </div>
                </InlineStack>
              </BlockStack>
            )}

            {currentStepData.id === 'notifications' && (
              <BlockStack gap="300">
                <InlineStack gap="200" wrap={false}>
                  <Badge>Critical Alerts</Badge>
                  <Badge>Approval Requests</Badge>
                  <Badge>Performance Updates</Badge>
                </InlineStack>
                <Text variant="bodySm" as="p" alignment="center" tone="subdued">
                  Configure in Settings → Notifications after completing this tour
                </Text>
              </BlockStack>
            )}
          </BlockStack>

          {/* Completion message (last step) */}
          {isLastStep && (
            <BlockStack gap="300" align="center">
              <div style={{
                padding: 'var(--p-space-400)',
                backgroundColor: 'var(--p-color-bg-surface-success)',
                borderRadius: 'var(--p-border-radius-200)',
                width: '100%',
              }}>
                <InlineStack gap="300" align="center" blockAlign="center">
                  <Icon source={CheckCircleIcon} tone="success" />
                  <BlockStack gap="100">
                    <Text variant="headingMd" as="p">
                      🎉 You're All Set!
                    </Text>
                    <Text variant="bodyMd" as="p" tone="subdued">
                      Your control center is ready. Start exploring your dashboard and let AI help you run your business more efficiently.
                    </Text>
                  </BlockStack>
                </InlineStack>
              </div>
            </BlockStack>
          )}

          {/* Don't show again checkbox */}
          <Checkbox
            label="Don't show this welcome tour again"
            checked={dontShowAgain}
            onChange={setDontShowAgain}
          />

          {/* Step indicators */}
          <InlineStack gap="200" align="center">
            {steps.map((step, index) => (
              <div
                key={step.id}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: 
                    step.completed 
                      ? 'var(--p-color-bg-fill-success)' 
                      : index === currentStep 
                        ? 'var(--p-color-bg-fill-info)' 
                        : 'var(--p-color-bg-fill-disabled)',
                  transition: 'background-color 0.2s ease',
                }}
                aria-label={`Step ${index + 1}: ${step.title}${step.completed ? ' (completed)' : index === currentStep ? ' (current)' : ''}`}
              />
            ))}
          </InlineStack>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}

/**
 * Hook to check if welcome modal should be shown
 */
export function useWelcomeModal() {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const hasCompleted = localStorage.getItem('hotdash_welcome_completed');
    setShouldShow(!hasCompleted);
  }, []);

  const markCompleted = () => {
    localStorage.setItem('hotdash_welcome_completed', 'true');
    setShouldShow(false);
  };

  return {
    shouldShow,
    markCompleted,
  };
}


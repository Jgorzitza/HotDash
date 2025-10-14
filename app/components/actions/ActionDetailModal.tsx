/**
 * ActionDetailModal Component - Enhanced (P0)
 * 
 * Full-screen modal showing action details with approval workflow
 * Features:
 * - Diff visualization (before/after, syntax highlighted)
 * - Confidence indicator (0-100% color coded)
 * - Impact metrics (CTR lift, traffic, revenue)
 * - AI rationale in plain language
 * - Action buttons (Approve/Reject/Edit/Schedule)
 * - Real-time execution status
 */

import { useState, useEffect } from 'react';
import {
  Modal,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Badge,
  Box,
  Banner,
  Divider,
  ProgressBar,
  Card,
  Icon,
} from '@shopify/polaris';
import { AlertCircleIcon, CheckCircleIcon, ClockIcon } from '@shopify/polaris-icons';
import { type Action } from './ActionDock';
import { DiffViewer } from './DiffViewer';
import { PriorityBadge } from './PriorityBadge';
import { ActionTypeBadge } from './ActionTypeBadge';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { ImpactMetrics } from './ImpactMetrics';

export interface ActionDetailModalProps {
  action: Action | null;
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
  onSchedule?: (scheduledFor: Date) => Promise<void>;
  onEdit?: (updates: Partial<Action>) => Promise<void>;
  onClose: () => void;
  isOpen: boolean;
  enableRealTimeUpdates?: boolean;
}

export function ActionDetailModal({
  action,
  onApprove,
  onReject,
  onSchedule,
  onEdit,
  onClose,
  isOpen,
  enableRealTimeUpdates = true,
}: ActionDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [confirmReject, setConfirmReject] = useState(false);
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);
  const [executionStatus, setExecutionStatus] = useState<string | null>(null);

  // Real-time status updates
  useEffect(() => {
    if (!enableRealTimeUpdates || !action || action.status !== 'executing') {
      return;
    }

    const interval = setInterval(async () => {
      // Poll for status updates
      try {
        const response = await fetch(`/api/actions/${action.id}`);
        const data = await response.json();
        if (data.status !== action.status) {
          setExecutionStatus(`Status changed: ${data.status}`);
        }
      } catch (err) {
        console.error('Failed to fetch action status:', err);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [action, enableRealTimeUpdates]);

  if (!action) return null;

  const handleApprove = async () => {
    if (!confirmApprove) {
      setConfirmApprove(true);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onApprove();
      onClose();
    } catch (err) {
      setError('Failed to approve action. Please try again.');
      setConfirmApprove(false);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!confirmReject) {
      setConfirmReject(true);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onReject();
      onClose();
    } catch (err) {
      setError('Failed to reject action. Please try again.');
      setConfirmReject(false);
    } finally {
      setLoading(false);
    }
  };

  const getStatusTone = (
    status: string
  ): 'info' | 'success' | 'critical' | 'warning' | undefined => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'info';
      case 'approved':
      case 'executed':
        return 'success';
      case 'rejected':
      case 'failed':
        return 'critical';
      default:
        return undefined;
    }
  };

  const formatToolName = (toolName: string): string => {
    const parts = toolName.split('_');
    const platform = parts[0];
    const actionParts = parts.slice(1);
    
    const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
    const actionName = actionParts
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return `${actionName} (${platformName})`;
  };

  const handleSchedule = async () => {
    if (!onSchedule) return;
    // Simple schedule for 24 hours from now (would be replaced with date picker)
    const scheduledDate = new Date();
    scheduledDate.setHours(scheduledDate.getHours() + 24);
    
    setLoading(true);
    setError(null);
    try {
      await onSchedule(scheduledDate);
      onClose();
    } catch (err) {
      setError('Failed to schedule action. Please try again.');
    } finally {
      setLoading(false);
      setShowSchedulePicker(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={formatToolName(action.toolName)}
      primaryAction={
        action.status === 'pending'
          ? {
              content: confirmApprove ? 'Confirm Approval' : 'Approve',
              onAction: handleApprove,
              tone: confirmApprove ? 'critical' : 'success',
              loading,
              disabled: loading,
            }
          : undefined
      }
      secondaryActions={
        action.status === 'pending'
          ? [
              {
                content: confirmReject ? 'Confirm Rejection' : 'Reject',
                onAction: handleReject,
                destructive: confirmReject,
                loading,
                disabled: loading,
              },
              ...(onSchedule ? [{
                content: 'Schedule',
                onAction: handleSchedule,
                loading,
                disabled: loading,
              }] : []),
              ...(onEdit ? [{
                content: 'Edit',
                onAction: () => {/* Would open edit modal */},
                disabled: loading,
              }] : []),
            ]
          : undefined
      }
    >
      <Modal.Section>
        <BlockStack gap="400">
          {/* Error Banner */}
          {error && (
            <Banner tone="critical" onDismiss={() => setError(null)}>
              {error}
            </Banner>
          )}

          {/* Real-time execution status */}
          {executionStatus && (
            <Banner tone="info">
              <InlineStack gap="200" blockAlign="center">
                <Icon source={ClockIcon} />
                <Text>{executionStatus}</Text>
              </InlineStack>
            </Banner>
          )}

          {/* Confirmation Banners */}
          {confirmApprove && (
            <Banner tone="warning">
              <Text>
                Confirm approval? This action will be queued for execution immediately.
              </Text>
            </Banner>
          )}

          {confirmReject && (
            <Banner tone="info">
              <Text>Confirm rejection? This action will be discarded.</Text>
            </Banner>
          )}

          {/* Status and Priority */}
          <InlineStack gap="200" wrap={false}>
            <Badge tone={getStatusTone(action.status)}>{action.status}</Badge>
            <PriorityBadge priority={action.priority} />
            <ActionTypeBadge toolName={action.toolName} />
            {action.scheduledFor && (
              <Badge tone="info">
                Scheduled: {new Date(action.scheduledFor).toLocaleDateString()}
              </Badge>
            )}
          </InlineStack>

          {/* Confidence Indicator (P0) */}
          {action.confidence !== undefined && (
            <ConfidenceIndicator confidence={action.confidence} />
          )}

          {/* Impact Metrics (P0) */}
          {action.impactMetrics && (
            <ImpactMetrics metrics={action.impactMetrics} />
          )}

          <Divider />

          {/* Agent and Timestamps */}
          <BlockStack gap="200">
            <Text variant="bodySm" as="p">
              <strong>Requested by:</strong> {action.agent}
            </Text>
            <Text variant="bodySm" as="p" tone="subdued">
              {new Date(action.requestedAt).toLocaleString()}
            </Text>
            {action.reviewedAt && (
              <Text variant="bodySm" as="p" tone="subdued">
                Reviewed: {new Date(action.reviewedAt).toLocaleString()}
                {action.reviewedBy && ` by ${action.reviewedBy}`}
              </Text>
            )}
            {action.executedAt && (
              <Text variant="bodySm" as="p" tone="subdued">
                Executed: {new Date(action.executedAt).toLocaleString()}
              </Text>
            )}
          </BlockStack>

          <Divider />

          {/* AI Rationale (P0 - Plain Language) */}
          {action.rationale && (
            <Card>
              <BlockStack gap="200">
                <InlineStack gap="200" blockAlign="center">
                  <Icon source={AlertCircleIcon} />
                  <Text variant="headingXs">Why This Action?</Text>
                </InlineStack>
                <Text as="p" tone="subdued">{action.rationale}</Text>
              </BlockStack>
            </Card>
          )}

          {/* Parameters with Diff Visualization (P0) */}
          <Box>
            {action.beforeSnapshot && action.afterSnapshot ? (
              <DiffViewer 
                before={action.beforeSnapshot} 
                after={action.afterSnapshot} 
                title="Changes" 
              />
            ) : (
              <DiffViewer content={action.parameters} title="Parameters" />
            )}
          </Box>

          {/* Context Information */}
          {(action.conversationId || action.shopDomain || action.externalRef) && (
            <>
              <Divider />
              <Box>
                <BlockStack gap="200">
                  <Text variant="headingXs">Context</Text>
                  {action.conversationId && (
                    <Text variant="bodySm" as="p">
                      Conversation ID: {action.conversationId}
                    </Text>
                  )}
                  {action.shopDomain && (
                    <Text variant="bodySm" as="p">
                      Shop: {action.shopDomain}
                    </Text>
                  )}
                  {action.externalRef && (
                    <Text variant="bodySm" as="p">
                      Reference: {action.externalRef}
                    </Text>
                  )}
                </BlockStack>
              </Box>
            </>
          )}

          {/* Tags */}
          {action.tags && action.tags.length > 0 && (
            <Box>
              <BlockStack gap="200">
                <Text variant="headingXs">Tags</Text>
                <InlineStack gap="200">
                  {action.tags.map((tag, index) => (
                    <Badge key={index}>{tag}</Badge>
                  ))}
                </InlineStack>
              </BlockStack>
            </Box>
          )}

          {/* Execution Result */}
          {action.result && (
            <>
              <Divider />
              <Box>
                <DiffViewer content={action.result} title="Execution Result" />
              </Box>
            </>
          )}

          {/* Error */}
          {action.error && (
            <Banner tone="critical">
              <BlockStack gap="200">
                <Text fontWeight="semibold">Execution Error</Text>
                <Text>{action.error}</Text>
              </BlockStack>
            </Banner>
          )}
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}


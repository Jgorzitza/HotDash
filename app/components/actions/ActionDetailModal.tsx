/**
 * ActionDetailModal Component
 * 
 * Full-screen modal showing action details with approval workflow
 * Displays parameters, rationale, context, and execution history
 */

import { useState } from 'react';
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
} from '@shopify/polaris';
import { type Action } from './ActionDock';
import { DiffViewer } from './DiffViewer';
import { PriorityBadge } from './PriorityBadge';
import { ActionTypeBadge } from './ActionTypeBadge';

export interface ActionDetailModalProps {
  action: Action | null;
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
  onEdit?: (updates: Partial<Action>) => Promise<void>;
  onClose: () => void;
  isOpen: boolean;
}

export function ActionDetailModal({
  action,
  onApprove,
  onReject,
  onEdit,
  onClose,
  isOpen,
}: ActionDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [confirmReject, setConfirmReject] = useState(false);

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

          {/* Confirmation Banner */}
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
          </InlineStack>

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

          {/* Rationale */}
          {action.rationale && (
            <Box>
              <BlockStack gap="200">
                <Text variant="headingXs">Rationale</Text>
                <Text as="p">{action.rationale}</Text>
              </BlockStack>
            </Box>
          )}

          {/* Parameters */}
          <Box>
            <DiffViewer content={action.parameters} title="Parameters" />
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


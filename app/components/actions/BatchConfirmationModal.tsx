/**
 * BatchConfirmationModal Component - P0
 * 
 * Confirmation modal for batch operations
 * Shows summary of actions to be performed and asks for confirmation
 */

import {
  Modal,
  BlockStack,
  InlineStack,
  Text,
  Banner,
  Badge,
  Box,
  Divider,
} from '@shopify/polaris';
import { type Action } from './ActionDock';

export interface BatchConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  action: 'approve' | 'reject' | 'schedule';
  actions: Action[];
  scheduledDate?: Date;
}

export function BatchConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  action,
  actions,
  scheduledDate,
}: BatchConfirmationModalProps) {
  const getActionTitle = (): string => {
    switch (action) {
      case 'approve':
        return 'Approve All Actions';
      case 'reject':
        return 'Reject All Actions';
      case 'schedule':
        return 'Schedule All Actions';
    }
  };

  const getActionDescription = (): string => {
    switch (action) {
      case 'approve':
        return 'These actions will be approved and queued for immediate execution.';
      case 'reject':
        return 'These actions will be rejected and discarded permanently.';
      case 'schedule':
        return `These actions will be scheduled for execution on ${scheduledDate?.toLocaleDateString()}.`;
    }
  };

  const getActionTone = (): 'critical' | 'warning' | 'info' => {
    switch (action) {
      case 'reject':
        return 'critical';
      case 'approve':
        return 'warning';
      case 'schedule':
        return 'info';
    }
  };

  const getConfirmButtonText = (): string => {
    switch (action) {
      case 'approve':
        return 'Approve All';
      case 'reject':
        return 'Reject All';
      case 'schedule':
        return 'Schedule All';
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={getActionTitle()}
      primaryAction={{
        content: getConfirmButtonText(),
        onAction: onConfirm,
        tone: action === 'reject' ? 'critical' : 'success',
      }}
      secondaryActions={[
        {
          content: 'Cancel',
          onAction: onClose,
        },
      ]}
    >
      <Modal.Section>
        <BlockStack gap="400">
          {/* Warning Banner */}
          <Banner tone={getActionTone()}>
            <Text>{getActionDescription()}</Text>
          </Banner>

          {/* Summary */}
          <Box>
            <BlockStack gap="300">
              <InlineStack align="space-between" blockAlign="center">
                <Text variant="headingXs">Selected Actions</Text>
                <Badge tone="info">{actions.length}</Badge>
              </InlineStack>

              <Divider />

              {/* Action List (first 5 + count) */}
              <BlockStack gap="200">
                {actions.slice(0, 5).map((act) => (
                  <Box
                    key={act.id}
                    background="bg-surface-secondary"
                    padding="300"
                    borderRadius="200"
                  >
                    <InlineStack gap="200" align="space-between">
                      <Text variant="bodySm" truncate>
                        {act.toolName}
                      </Text>
                      <Badge tone={act.priority === 'urgent' || act.priority === 'high' ? 'warning' : undefined}>
                        {act.priority}
                      </Badge>
                    </InlineStack>
                  </Box>
                ))}

                {actions.length > 5 && (
                  <Text variant="bodySm" tone="subdued" alignment="center">
                    + {actions.length - 5} more actions
                  </Text>
                )}
              </BlockStack>
            </BlockStack>
          </Box>

          {/* Impact Warning */}
          {action === 'approve' && (
            <Banner tone="info">
              <Text>
                💡 These actions will execute immediately. Review each action's impact metrics 
                before approving to ensure expected outcomes.
              </Text>
            </Banner>
          )}

          {action === 'reject' && (
            <Banner tone="critical">
              <Text>
                ⚠️ This cannot be undone. Rejected actions are permanently discarded.
              </Text>
            </Banner>
          )}
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}


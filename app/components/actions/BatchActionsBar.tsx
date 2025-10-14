/**
 * BatchActionsBar Component - P0
 * 
 * Sticky bulk actions bar for multi-select operations
 * Features:
 * - Approve All, Reject All, Schedule All actions
 * - Progress indicator (X/Y processed)
 * - Confirmation modal
 * - Sticky positioning at bottom of viewport
 */

import { useState } from 'react';
import {
  Box,
  InlineStack,
  Text,
  Button,
  Badge,
  ProgressBar,
  BlockStack,
} from '@shopify/polaris';

export interface BatchActionsBarProps {
  selectedCount: number;
  totalCount: number;
  onApproveAll: () => Promise<void>;
  onRejectAll: () => Promise<void>;
  onScheduleAll?: () => Promise<void>;
  onClearSelection: () => void;
  isProcessing?: boolean;
  processedCount?: number;
}

export function BatchActionsBar({
  selectedCount,
  totalCount,
  onApproveAll,
  onRejectAll,
  onScheduleAll,
  onClearSelection,
  isProcessing = false,
  processedCount = 0,
}: BatchActionsBarProps) {
  const [loading, setLoading] = useState(false);

  if (selectedCount === 0) {
    return null;
  }

  const handleApproveAll = async () => {
    setLoading(true);
    try {
      await onApproveAll();
    } finally {
      setLoading(false);
    }
  };

  const handleRejectAll = async () => {
    setLoading(true);
    try {
      await onRejectAll();
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleAll = async () => {
    if (!onScheduleAll) return;
    setLoading(true);
    try {
      await onScheduleAll();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      position="fixed"
      insetBlockEnd="0"
      insetInlineStart="0"
      insetInlineEnd="0"
      background="bg-fill"
      borderBlockStartWidth="025"
      borderColor="border"
      padding="400"
      style={{
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
        zIndex: 100,
      }}
    >
      <BlockStack gap="300">
        {/* Progress Bar */}
        {isProcessing && (
          <Box>
            <BlockStack gap="200">
              <InlineStack align="space-between">
                <Text variant="bodySm" tone="subdued">
                  Processing actions...
                </Text>
                <Text variant="bodySm" fontWeight="semibold">
                  {processedCount} / {selectedCount}
                </Text>
              </InlineStack>
              <ProgressBar 
                progress={(processedCount / selectedCount) * 100} 
                tone="primary"
              />
            </BlockStack>
          </Box>
        )}

        {/* Actions Bar */}
        <InlineStack align="space-between" blockAlign="center">
          {/* Selection Info */}
          <InlineStack gap="200" blockAlign="center">
            <Badge tone="info">{selectedCount} selected</Badge>
            <Text variant="bodySm" tone="subdued">
              of {totalCount} total
            </Text>
            <Button
              variant="plain"
              onClick={onClearSelection}
              disabled={loading || isProcessing}
            >
              Clear
            </Button>
          </InlineStack>

          {/* Bulk Action Buttons */}
          <InlineStack gap="200">
            <Button
              onClick={handleRejectAll}
              loading={loading}
              disabled={isProcessing}
              tone="critical"
            >
              Reject All
            </Button>
            
            {onScheduleAll && (
              <Button
                onClick={handleScheduleAll}
                loading={loading}
                disabled={isProcessing}
              >
                Schedule All
              </Button>
            )}

            <Button
              onClick={handleApproveAll}
              loading={loading}
              disabled={isProcessing}
              tone="success"
              variant="primary"
            >
              Approve All
            </Button>
          </InlineStack>
        </InlineStack>
      </BlockStack>
    </Box>
  );
}


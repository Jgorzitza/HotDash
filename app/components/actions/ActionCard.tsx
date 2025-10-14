/**
 * ActionCard Component
 * 
 * Displays individual action with approve/reject buttons
 * Shows tool name, agent, priority, and rationale
 */

import { useState } from 'react';
import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Badge,
  Banner,
  Box,
  Checkbox,
} from '@shopify/polaris';
import { type Action } from './ActionDock';
import { ActionTypeBadge } from './ActionTypeBadge';
import { PriorityBadge } from './PriorityBadge';

export interface ActionCardProps {
  action: Action;
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
  onViewDetail: () => void;
  variant?: 'compact' | 'expanded';
  // Batch selection support (P0)
  isSelected?: boolean;
  onToggleSelect?: (id: number) => void;
  showCheckbox?: boolean;
}

export function ActionCard({
  action,
  onApprove,
  onReject,
  onViewDetail,
  variant = 'compact',
  isSelected = false,
  onToggleSelect,
  showCheckbox = false,
}: ActionCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    try {
      await onApprove();
    } catch (err) {
      setError('Failed to approve action. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    setError(null);
    try {
      await onReject();
    } catch (err) {
      setError('Failed to reject action. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get priority border styling
  const getPriorityBorder = () => {
    const borders = {
      urgent: '4px solid var(--p-color-border-critical)',
      high: '4px solid var(--p-color-border-caution)',
      normal: '2px solid var(--p-color-border-info)',
      low: '1px solid var(--p-color-border-secondary)',
    };
    return borders[action.priority as keyof typeof borders] || borders.normal;
  };

  // Get priority background
  const getPriorityBackground = () => {
    const backgrounds = {
      urgent: 'var(--p-color-bg-critical-subdued)',
      high: 'var(--p-color-bg-caution-subdued)',
      normal: 'var(--p-color-bg-info-subdued)',
      low: 'var(--p-color-bg-surface-secondary)',
    };
    return backgrounds[action.priority as keyof typeof backgrounds] || backgrounds.normal;
  };

  return (
    <Box
      background={getPriorityBackground() as any}
      borderRadius="200"
      padding="400"
      style={{ 
        borderLeft: getPriorityBorder(),
        outline: isSelected ? '2px solid var(--p-color-border-interactive)' : 'none',
      }}
    >
      <BlockStack gap="300">
        {/* Error Banner */}
        {error && (
          <Banner tone="critical" onDismiss={() => setError(null)}>
            {error}
          </Banner>
        )}

        <InlineStack gap="300" align="space-between" blockAlign="center">
          {/* Checkbox for batch selection (P0) */}
          <InlineStack gap="200">
            {showCheckbox && onToggleSelect && (
              <Checkbox
                label=""
                checked={isSelected}
                onChange={() => onToggleSelect(action.id)}
              />
            )}
            
            {/* Header: Badges */}
            <InlineStack gap="200" wrap={false}>
              <ActionTypeBadge toolName={action.toolName} />
              <PriorityBadge priority={action.priority} />
            </InlineStack>
          </InlineStack>
        </InlineStack>

        {/* Tool Name */}
        <Text variant="bodyMd" as="p" fontWeight="semibold">
          {formatToolName(action.toolName)}
        </Text>

        {/* Agent and Timestamp */}
        <Text variant="bodySm" as="p" tone="subdued">
          Requested by {action.agent} • {formatTimestamp(action.requestedAt)}
        </Text>

        {/* Rationale */}
        {action.rationale && (
          <Text variant="bodySm" as="p">
            {action.rationale}
          </Text>
        )}

        {/* Parameters Preview (if expanded) */}
        {variant === 'expanded' && (
          <Box
            background="bg-surface-secondary"
            padding="300"
            borderRadius="200"
          >
            <pre
              style={{
                margin: 0,
                fontFamily: 'monospace',
                fontSize: '12px',
                overflow: 'auto',
                maxHeight: '200px',
              }}
            >
              {JSON.stringify(action.parameters, null, 2)}
            </pre>
          </Box>
        )}

        {/* Action Buttons */}
        <InlineStack gap="200">
          <Button
            size="slim"
            tone="success"
            onClick={handleApprove}
            loading={loading}
            disabled={loading}
          >
            Approve
          </Button>
          <Button
            size="slim"
            onClick={handleReject}
            loading={loading}
            disabled={loading}
          >
            Reject
          </Button>
          <Button size="slim" variant="plain" onClick={onViewDetail}>
            Details
          </Button>
        </InlineStack>
      </BlockStack>
    </Box>
  );
}

/**
 * Format tool name for display
 * "chatwoot_send_public_reply" → "Send Public Reply (Chatwoot)"
 */
function formatToolName(toolName: string): string {
  const parts = toolName.split('_');
  const platform = parts[0];
  const actionParts = parts.slice(1);
  
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
  const actionName = actionParts
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return `${actionName} (${platformName})`;
}

/**
 * Format timestamp for display
 */
function formatTimestamp(timestamp: Date | string): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
}


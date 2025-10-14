/**
 * ActionDock Component
 * 
 * Displays top 10 pending actions for operator review
 * Includes quick approve/reject buttons and real-time updates
 */

import { Card, BlockStack, InlineStack, Text, Badge, EmptyState, SkeletonBodyText } from '@shopify/polaris';
import { ActionCard } from './ActionCard';

export interface Action {
  id: number;
  toolName: string;
  agent: string;
  parameters: any;
  rationale?: string | null;
  status: string;
  needsApproval: boolean;
  conversationId?: number | null;
  shopDomain?: string | null;
  externalRef?: string | null;
  requestedAt: Date | string;
  reviewedAt?: Date | string | null;
  reviewedBy?: string | null;
  executedAt?: Date | string | null;
  result?: any | null;
  error?: string | null;
  priority: string;
  tags: string[];
  // Enhanced P0 fields
  confidence?: number; // 0-100 confidence score
  impactMetrics?: {
    ctrLift?: number; // CTR lift percentage
    trafficIncrease?: number; // Traffic increase percentage
    revenueImpact?: number; // Estimated revenue impact
    timeToImpact?: string; // e.g., "2-3 weeks"
  };
  scheduledFor?: Date | string | null; // Scheduled execution time
  beforeSnapshot?: any; // Before state for diff
  afterSnapshot?: any; // After state for diff
}

export interface ActionDockProps {
  actions: Action[];
  onApprove: (id: number) => Promise<void>;
  onReject: (id: number) => Promise<void>;
  onViewDetail: (id: number) => void;
  isLoading?: boolean;
}

export function ActionDock({
  actions,
  onApprove,
  onReject,
  onViewDetail,
  isLoading = false,
}: ActionDockProps) {
  // Empty state when no pending actions
  if (!isLoading && actions.length === 0) {
    return (
      <Card>
        <EmptyState
          heading="No pending actions"
          image=""
        >
          <Text as="p" variant="bodyMd" tone="subdued">
            All actions have been reviewed. New actions will appear here when they require approval.
          </Text>
        </EmptyState>
      </Card>
    );
  }

  return (
    <Card>
      <BlockStack gap="400">
        {/* Header */}
        <InlineStack align="space-between" blockAlign="center">
          <Text variant="headingMd" as="h2">
            Pending Actions
          </Text>
          {!isLoading && (
            <Badge tone="info">{actions.length}</Badge>
          )}
        </InlineStack>

        {/* Loading State */}
        {isLoading ? (
          <SkeletonBodyText lines={5} />
        ) : (
          /* Action Cards */
          <BlockStack gap="300">
            {actions.map((action) => (
              <ActionCard
                key={action.id}
                action={action}
                onApprove={() => onApprove(action.id)}
                onReject={() => onReject(action.id)}
                onViewDetail={() => onViewDetail(action.id)}
              />
            ))}
          </BlockStack>
        )}
      </BlockStack>
    </Card>
  );
}


import { useState } from 'react';
import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Badge,
  Banner,
  Spinner,
  Tooltip,
} from '@shopify/polaris';

interface ApprovalCardProps {
  approval: {
    id: string;
    conversationId: number;
    createdAt: string;
    pending: {
      agent: string;
      tool: string;
      args: Record<string, any>;
    }[];
  };
  onDetails?: () => void;
}

export function ApprovalCard({ approval, onDetails }: ApprovalCardProps) {
  const [actionLoading, setActionLoading] = useState<'none' | 'approve' | 'reject'>('none');
  const [error, setError] = useState<string | null>(null);

  const action = approval.pending[0]; // First pending action
  const riskLevel = getRiskLevel(action.tool);

  async function postAndReload(path: string) {
    try {
      const res = await fetch(path, { method: 'POST' });
      if (!res.ok) {
        let msg = `Request failed (${res.status})`;
        try {
          const text = await res.text();
          if (text) msg += `: ${text.slice(0, 200)}`;
        } catch {}
        throw new Error(msg);
      }
      window.location.reload();
    } catch (e: any) {
      setError(e?.message || 'Request failed. Please try again.');
      setActionLoading('none');
    }
  }

  const handleApprove = async () => {
    setError(null);
    setActionLoading('approve');
    await postAndReload(`/approvals/${approval.id}/0/approve`);
  };

  const handleReject = async () => {
    setError(null);
    setActionLoading('reject');
    await postAndReload(`/approvals/${approval.id}/0/reject`);
  };

  const isBusy = actionLoading !== 'none';

  return (
    <Card aria-busy={isBusy}>
      <BlockStack gap="400">
        {/* Header */}
        <InlineStack align="space-between" blockAlign="center">
          <Text variant="headingMd" as="h2">
            Conversation #{approval.conversationId}
          </Text>
          <Badge tone={riskLevel === 'high' ? 'critical' : riskLevel === 'medium' ? 'warning' : 'success'}>
            {`${riskLevel.toUpperCase()} RISK`}
          </Badge>
        </InlineStack>

        {/* Agent & Tool Info */}
        <BlockStack gap="200">
          <Text variant="bodyMd" as="p">
            <strong>Agent:</strong> {action.agent}
          </Text>
          <Text variant="bodyMd" as="p">
            <strong>Tool:</strong> {action.tool}
          </Text>
          <Text variant="bodyMd" as="p" tone="subdued">
            <strong>Arguments:</strong>
          </Text>
          <pre style={{
            background: '#f6f6f7',
            padding: '12px',
            borderRadius: '4px',
            fontSize: '12px',
            overflow: 'auto',
          }}>
            {JSON.stringify(action.args, null, 2)}
          </pre>
          <Text variant="bodySm" as="p" tone="subdued">
            Requested {new Date(approval.createdAt).toLocaleString()}
          </Text>
        </BlockStack>

        {/* Error Message */}
        {error && (
          <Banner tone="critical" onDismiss={() => setError(null)} data-testid="approval-error-banner">
            {error}
          </Banner>
        )}

        {/* Actions */}
        <InlineStack gap="200">
          <Tooltip content="Approve this action">
            <Button
              variant="primary"
              tone="success"
              onClick={handleApprove}
              loading={actionLoading === 'approve'}
              disabled={isBusy}
              data-testid="approval-approve-btn"
            >
              {actionLoading === 'approve' ? 'Approving…' : 'Approve'}
            </Button>
          </Tooltip>
          <Button
            onClick={onDetails}
            variant="secondary"
            disabled={isBusy}
          >
            Details
          </Button>

          <Tooltip content="Reject and do not apply">
            <Button
              variant="primary"
              tone="critical"
              onClick={handleReject}
              loading={actionLoading === 'reject'}
              disabled={isBusy}
              data-testid="approval-reject-btn"
            >
              {actionLoading === 'reject' ? 'Rejecting…' : 'Reject'}
            </Button>
          </Tooltip>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}

// Helper: Determine risk level based on tool
function getRiskLevel(tool: string): 'low' | 'medium' | 'high' {
  const highRisk = ['send_email', 'create_refund', 'cancel_order'];
  const mediumRisk = ['create_private_note', 'update_conversation'];

  if (highRisk.includes(tool)) return 'high';
  if (mediumRisk.includes(tool)) return 'medium';
  return 'low';
}


import { useState } from 'react';
import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Badge,
  Banner,
} from '@shopify/polaris';
import { useSubmit } from 'react-router';

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
}

export function ApprovalCard({ approval }: ApprovalCardProps) {
  const submit = useSubmit();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const action = approval.pending[0]; // First pending action
  const riskLevel = getRiskLevel(action.tool);
  
  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/approvals/${approval.id}/0/approve`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to approve');
      // Trigger revalidation
      window.location.reload();
    } catch (err) {
      setError('Failed to approve. Please try again.');
      setLoading(false);
    }
  };
  
  const handleReject = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/approvals/${approval.id}/0/reject`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to reject');
      // Trigger revalidation
      window.location.reload();
    } catch (err) {
      setError('Failed to reject. Please try again.');
      setLoading(false);
    }
  };
  
  return (
    <Card>
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
            overflow: 'auto'
          }}>
            {JSON.stringify(action.args, null, 2)}
          </pre>
          <Text variant="bodySm" as="p" tone="subdued">
            Requested {new Date(approval.createdAt).toLocaleString()}
          </Text>
        </BlockStack>
        
        {/* Error Message */}
        {error && (
          <Banner tone="critical" onDismiss={() => setError(null)}>
            {error}
          </Banner>
        )}
        
        {/* Actions */}
        <InlineStack gap="200">
          <Button
            variant="primary"
            tone="success"
            onClick={handleApprove}
            loading={loading}
            disabled={loading}
          >
            Approve
          </Button>
          <Button
            variant="primary"
            tone="critical"
            onClick={handleReject}
            loading={loading}
            disabled={loading}
          >
            Reject
          </Button>
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


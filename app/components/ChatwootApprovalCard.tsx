import { useState } from 'react';
import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Badge,
  Banner,
  TextField,
  Box,
} from '@shopify/polaris';
import { useFetcher } from 'react-router';

interface ChatwootApproval {
  id: number;
  chatwoot_conversation_id: number;
  customer_name: string | null;
  customer_email: string | null;
  customer_message: string;
  draft_response: string;
  confidence_score: number;
  knowledge_sources: any[];
  suggested_tags: string[];
  sentiment_analysis: any;
  recommended_action: string;
  priority: string;
  created_at: string;
}

interface ChatwootApprovalCardProps {
  approval: ChatwootApproval;
}

export function ChatwootApprovalCard({ approval }: ChatwootApprovalCardProps) {
  const fetcher = useFetcher();
  const [isEditing, setIsEditing] = useState(false);
  const [editedResponse, setEditedResponse] = useState(approval.draft_response);
  const [operatorNotes, setOperatorNotes] = useState('');
  
  const isLoading = fetcher.state !== 'idle';
  
  // Determine badge tone based on priority
  const getPriorityTone = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'critical';
      case 'high': return 'warning';
      case 'normal': return 'info';
      case 'low': return 'success';
      default: return 'info';
    }
  };
  
  // Determine confidence badge
  const getConfidenceTone = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'critical';
  };
  
  const handleApprove = () => {
    fetcher.submit(
      { action: 'approve' },
      { method: 'post', action: `/chatwoot-approvals/${approval.id}/approve` }
    );
  };
  
  const handleEdit = () => {
    if (isEditing) {
      // Submit edited version
      fetcher.submit(
        { 
          action: 'edit',
          editedResponse,
          operatorNotes,
        },
        { method: 'post', action: `/chatwoot-approvals/${approval.id}/approve` }
      );
    } else {
      // Enter edit mode
      setIsEditing(true);
    }
  };
  
  const handleEscalate = () => {
    const reason = operatorNotes || prompt('Please provide an escalation reason:');
    if (reason) {
      fetcher.submit(
        {
          action: 'escalate',
          operatorNotes: reason,
        },
        { method: 'post', action: `/chatwoot-approvals/${approval.id}/escalate` }
      );
    }
  };
  
  const handleReject = () => {
    const reason = operatorNotes || prompt('Please provide a rejection reason:');
    if (reason) {
      fetcher.submit(
        {
          action: 'reject',
          operatorNotes: reason,
        },
        { method: 'post', action: `/chatwoot-approvals/${approval.id}/reject` }
      );
    }
  };
  
  return (
    <Card>
      <BlockStack gap="400">
        {/* Header */}
        <InlineStack align="space-between" blockAlign="center" wrap={false}>
          <BlockStack gap="100">
            <Text variant="headingMd" as="h2">
              Conversation #{approval.chatwoot_conversation_id}
            </Text>
            {approval.customer_name && (
              <Text variant="bodyMd" as="p">
                {approval.customer_name} ({approval.customer_email})
              </Text>
            )}
          </BlockStack>
          <InlineStack gap="200">
            <Badge tone={getPriorityTone(approval.priority)}>
              {approval.priority.toUpperCase()}
            </Badge>
            <Badge tone={getConfidenceTone(approval.confidence_score)}>
              {`${approval.confidence_score}% Confidence`}
            </Badge>
          </InlineStack>
        </InlineStack>
        
        {/* Customer Message */}
        <BlockStack gap="200">
          <Text variant="bodyMd" as="p" fontWeight="bold">
            Customer Message:
          </Text>
          <Box
            background="bg-surface-secondary"
            padding="400"
            borderRadius="200"
          >
            <Text variant="bodyMd" as="p">
              {approval.customer_message}
            </Text>
          </Box>
        </BlockStack>
        
        {/* Draft Response */}
        <BlockStack gap="200">
          <InlineStack align="space-between" blockAlign="center">
            <Text variant="bodyMd" as="p" fontWeight="bold">
              🤖 Draft Response:
            </Text>
            <Badge tone={approval.recommended_action === 'approve' ? 'success' : 'attention'}>
              {`Recommended: ${approval.recommended_action.toUpperCase()}`}
            </Badge>
          </InlineStack>
          
          {isEditing ? (
            <TextField
              label=""
              value={editedResponse}
              onChange={setEditedResponse}
              multiline={6}
              autoComplete="off"
            />
          ) : (
            <Box
              background="bg-surface-active"
              padding="400"
              borderRadius="200"
            >
              <Text variant="bodyMd" as="p">
                {approval.draft_response}
              </Text>
            </Box>
          )}
        </BlockStack>
        
        {/* Knowledge Sources */}
        {approval.knowledge_sources && approval.knowledge_sources.length > 0 && (
          <BlockStack gap="200">
            <Text variant="bodyMd" as="p" fontWeight="bold">
              📚 Knowledge Sources:
            </Text>
            <Box
              background="bg-surface-secondary"
              padding="300"
              borderRadius="200"
            >
              <BlockStack gap="100">
                {approval.knowledge_sources.map((source: any, idx: number) => (
                  <Text key={idx} variant="bodySm" as="p">
                    • {source.title || source.name} ({source.version || 'latest'}) - 
                    Relevance: {source.relevance ? Math.round(source.relevance * 100) : 0}%
                  </Text>
                ))}
              </BlockStack>
            </Box>
          </BlockStack>
        )}
        
        {/* Suggested Tags */}
        {approval.suggested_tags && approval.suggested_tags.length > 0 && (
          <InlineStack gap="200">
            <Text variant="bodyMd" as="p" fontWeight="bold">
              🏷️ Suggested Tags:
            </Text>
            {approval.suggested_tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </InlineStack>
        )}
        
        {/* Sentiment Analysis */}
        {approval.sentiment_analysis && approval.sentiment_analysis.customer_sentiment && (
          <InlineStack gap="200">
            <Text variant="bodyMd" as="p" fontWeight="bold">
              😊 Sentiment:
            </Text>
            <Text variant="bodyMd" as="p">
              {approval.sentiment_analysis.customer_sentiment} (Urgency: {approval.sentiment_analysis.urgency || 'medium'})
            </Text>
          </InlineStack>
        )}
        
        {/* Operator Notes */}
        {isEditing && (
          <TextField
            label="Operator Notes (optional)"
            value={operatorNotes}
            onChange={setOperatorNotes}
            placeholder="Add any notes about this approval..."
            autoComplete="off"
          />
        )}
        
        {/* Timestamp */}
        <Text variant="bodySm" as="p" tone="subdued">
          Created {new Date(approval.created_at).toLocaleString()}
        </Text>
        
        {/* Warning Banner */}
        {approval.confidence_score < 70 && (
          <Banner tone="warning">
            ⚠️ Low confidence score - Review carefully or escalate to senior support
          </Banner>
        )}
        
        {approval.sentiment_analysis?.urgency === 'urgent' && (
          <Banner tone="critical">
            🚨 URGENT - Customer requires immediate attention
          </Banner>
        )}
        
        {/* Actions */}
        <InlineStack gap="200" wrap={false}>
          <Button
            variant="primary"
            tone="success"
            onClick={handleApprove}
            loading={isLoading}
            disabled={isLoading || isEditing}
          >
            ✓ Approve
          </Button>
          <Button
            variant={isEditing ? 'primary' : 'secondary'}
            onClick={handleEdit}
            loading={isLoading}
            disabled={isLoading}
          >
            {isEditing ? '✓ Send Edited' : '✎ Edit'}
          </Button>
          <Button
            variant="secondary"
            tone="critical"
            onClick={handleEscalate}
            loading={isLoading}
            disabled={isLoading}
          >
            ⚠ Escalate
          </Button>
          <Button
            variant="secondary"
            onClick={handleReject}
            loading={isLoading}
            disabled={isLoading}
          >
            ✗ Reject
          </Button>
          {isEditing && (
            <Button
              onClick={() => {
                setIsEditing(false);
                setEditedResponse(approval.draft_response);
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
        </InlineStack>
      </BlockStack>
    </Card>
  );
}


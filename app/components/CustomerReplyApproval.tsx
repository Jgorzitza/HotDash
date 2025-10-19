/**
 * Customer Reply Approval Component — HITL approval flow for AI-drafted replies
 *
 * Displays conversation context, AI draft, evidence, and grading UI.
 * Integrates with approvals drawer for HITL workflow.
 */

import { useState } from "react";
import {
  Card,
  Text,
  BlockStack,
  Button,
  TextField,
  InlineStack,
  Badge,
  Divider,
} from "@shopify/polaris";
import type { ReplyDraft } from "../agents/customer/draft-generator";
import type { CustomerReplyGrading } from "../agents/customer/grading-schema";

export interface CustomerReplyApprovalProps {
  draft: ReplyDraft;
  onApprove: (
    grading: Omit<CustomerReplyGrading, "id" | "created_at" | "graded_at">,
  ) => Promise<void>;
  onReject: (
    grading: Omit<CustomerReplyGrading, "id" | "created_at" | "graded_at">,
  ) => Promise<void>;
}

export function CustomerReplyApproval({
  draft,
  onApprove,
  onReject,
}: CustomerReplyApprovalProps) {
  const [editedReply, setEditedReply] = useState(draft.suggestedReply);
  const [tone, setTone] = useState<number>(4);
  const [accuracy, setAccuracy] = useState<number>(4);
  const [policy, setPolicy] = useState<number>(4);
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      const grading: Omit<
        CustomerReplyGrading,
        "id" | "created_at" | "graded_at"
      > = {
        conversation_id: draft.conversationId,
        draft_reply: draft.suggestedReply,
        human_reply: editedReply,
        tone,
        accuracy,
        policy,
        approved: true,
        graded_by: "current_user", // TODO: Get from session
        rag_sources: draft.evidence.ragSources,
        confidence: draft.evidence.confidence,
      };

      await onApprove(grading);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      const grading: Omit<
        CustomerReplyGrading,
        "id" | "created_at" | "graded_at"
      > = {
        conversation_id: draft.conversationId,
        draft_reply: draft.suggestedReply,
        human_reply: editedReply,
        tone,
        accuracy,
        policy,
        approved: false,
        graded_by: "current_user", // TODO: Get from session
        rag_sources: draft.evidence.ragSources,
        confidence: draft.evidence.confidence,
      };

      await onReject(grading);
    } finally {
      setLoading(false);
    }
  };

  const confidenceBadge = (confidence: number | undefined) => {
    if (!confidence) return null;
    const pct = Math.round(confidence * 100);
    if (pct >= 80) return <Badge tone="success">{pct}% confidence</Badge>;
    if (pct >= 60) return <Badge tone="attention">{pct}% confidence</Badge>;
    return <Badge tone="critical">{pct}% confidence</Badge>;
  };

  return (
    <BlockStack gap="400">
      {/* Conversation Context */}
      <Card>
        <BlockStack gap="300">
          <Text as="h3" variant="headingMd">
            Conversation Context
          </Text>
          <BlockStack gap="200">
            {draft.context.slice(-5).map((msg, idx) => (
              <Text key={idx} as="p" variant="bodyMd">
                {msg}
              </Text>
            ))}
          </BlockStack>
        </BlockStack>
      </Card>

      {/* AI Draft Reply */}
      <Card>
        <BlockStack gap="300">
          <InlineStack align="space-between">
            <Text as="h3" variant="headingMd">
              AI Draft Reply
            </Text>
            {confidenceBadge(draft.evidence.confidence)}
          </InlineStack>

          <TextField
            label="Reply"
            value={editedReply}
            onChange={setEditedReply}
            multiline={6}
            autoComplete="off"
          />

          {draft.evidence.ragSources &&
            draft.evidence.ragSources.length > 0 && (
              <Text as="p" variant="bodySm" tone="subdued">
                Sources: {draft.evidence.ragSources.join(", ")}
              </Text>
            )}
        </BlockStack>
      </Card>

      {/* Risk Assessment */}
      <Card>
        <BlockStack gap="300">
          <Text as="h3" variant="headingMd">
            Risk Assessment
          </Text>
          <Text as="p" variant="bodyMd">
            {draft.risk}
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            Rollback: {draft.rollback}
          </Text>
        </BlockStack>
      </Card>

      <Divider />

      {/* Grading UI */}
      <Card>
        <BlockStack gap="400">
          <Text as="h3" variant="headingMd">
            Quality Grading (1-5)
          </Text>

          <BlockStack gap="300">
            <TextField
              label="Tone (Friendly, professional, brand-aligned)"
              type="number"
              value={String(tone)}
              onChange={(val) => setTone(Math.max(1, Math.min(5, Number(val))))}
              min={1}
              max={5}
              autoComplete="off"
            />

            <TextField
              label="Accuracy (Factually correct, addresses need)"
              type="number"
              value={String(accuracy)}
              onChange={(val) =>
                setAccuracy(Math.max(1, Math.min(5, Number(val))))
              }
              min={1}
              max={5}
              autoComplete="off"
            />

            <TextField
              label="Policy (Follows company guidelines)"
              type="number"
              value={String(policy)}
              onChange={(val) =>
                setPolicy(Math.max(1, Math.min(5, Number(val))))
              }
              min={1}
              max={5}
              autoComplete="off"
            />
          </BlockStack>
        </BlockStack>
      </Card>

      {/* Actions */}
      <InlineStack gap="300">
        <Button variant="primary" onClick={handleApprove} loading={loading}>
          Approve & Send
        </Button>
        <Button onClick={handleReject} loading={loading}>
          Reject & Manual Reply
        </Button>
      </InlineStack>
    </BlockStack>
  );
}

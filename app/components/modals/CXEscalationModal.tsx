import { useEffect, useMemo, useState } from "react";
import { useFetcher } from "react-router";
import { Modal, TextField, Button, BlockStack, InlineStack, Text, Banner } from "@shopify/polaris";

import type { EscalationConversation } from "../../services/chatwoot/types";

interface CXEscalationModalProps {
  conversation: EscalationConversation;
  open: boolean;
  onClose: () => void;
}

interface ActionResponse {
  ok?: boolean;
  error?: string;
}

export function CXEscalationModal({ conversation, open, onClose }: CXEscalationModalProps) {
  const fetcher = useFetcher<ActionResponse>();
  const [reply, setReply] = useState(conversation.suggestedReply ?? "");
  const [note, setNote] = useState("");

  const hasSuggestion = Boolean((conversation.suggestedReply ?? "").trim());

  useEffect(() => {
    if (open) {
      setReply(conversation.suggestedReply ?? "");
      setNote("");
    }
  }, [open, conversation.suggestedReply]);

  useEffect(() => {
    if (!open) return;
    if (fetcher.state !== "idle") return;
    if (fetcher.data?.ok) {
      onClose();
    }
  }, [fetcher.state, fetcher.data, onClose, open]);

  const isSubmitting = fetcher.state !== "idle";

  const messageHistory = useMemo(() => {
    return (conversation.messages ?? []).map((message) => ({
      ...message,
      displayAuthor: message.author === "agent" ? "Agent" : "Customer",
    }));
  }, [conversation.messages]);

  const commonFields = {
    conversationId: String(conversation.id),
    customerName: conversation.customerName,
    suggestedReply: conversation.suggestedReply ?? "",
    aiSuggestionUsed: String(conversation.aiSuggestionEnabled && Boolean(conversation.aiSuggestion)),
    aiSuggestionMetadata: conversation.aiSuggestion
      ? JSON.stringify(conversation.aiSuggestion)
      : "",
  } satisfies Record<string, string>;

  const submit = (action: string, extra: Record<string, string> = {}) => {
    const formData = new FormData();
    formData.set("action", action);
    Object.entries(commonFields).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.set(key, value);
      }
    });
    formData.set("selectedReply", reply);
    if (note.trim()) {
      formData.set("note", note.trim());
    }
    Object.entries(extra).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.set(key, value);
      }
    });

    fetcher.submit(formData, {
      action: "/actions/chatwoot/escalate",
      method: "post",
      encType: "application/x-www-form-urlencoded",
    });
  };

  const handleApprove = () => {
    submit("approve_send");
  };

  const handleEscalate = () => {
    submit("escalate");
  };

  const handleResolve = () => {
    submit("mark_resolved");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`CX Pulse — ${conversation.customerName}`}
      primaryAction={{
        content: "Approve & send",
        onAction: handleApprove,
        disabled: !hasSuggestion || !reply.trim() || isSubmitting,
        loading: isSubmitting,
      }}
      secondaryActions={[
        {
          content: "Escalate",
          onAction: handleEscalate,
          disabled: isSubmitting,
        },
        {
          content: "Mark resolved",
          onAction: handleResolve,
          disabled: isSubmitting,
        },
      ]}
    >
      <Modal.Section>
        <BlockStack gap="400">
          <Text as="p" variant="bodySm" tone="subdued">
            Conversation #{conversation.id} · Status: {conversation.status}
          </Text>

          {fetcher.data?.error && (
            <Banner tone="critical">
              <p>{fetcher.data.error}</p>
            </Banner>
          )}

          {/* Conversation History */}
          <BlockStack gap="200">
            <Text as="h3" variant="headingSm">Conversation history</Text>
            <div role="log" aria-live="polite">
              {messageHistory.length === 0 ? (
                <Text as="p" tone="subdued">No message history loaded.</Text>
              ) : (
                <BlockStack gap="200">
                  {messageHistory.map((message) => (
                    <div key={message.id} style={{ padding: '12px', background: '#f6f6f7', borderRadius: '8px' }}>
                      <BlockStack gap="100">
                        <InlineStack gap="200" align="space-between" blockAlign="start">
                          <Text as="span" fontWeight="semibold">{message.displayAuthor}</Text>
                          <Text as="span" tone="subdued" variant="bodySm">
                            {new Date(message.createdAt).toLocaleString()}
                          </Text>
                        </InlineStack>
                        <Text as="p">{message.content}</Text>
                      </BlockStack>
                    </div>
                  ))}
                </BlockStack>
              )}
            </div>
          </BlockStack>

          {/* Suggested Reply */}
          <BlockStack gap="200">
            <Text as="h3" variant="headingSm">Suggested reply</Text>
            {hasSuggestion ? (
              <TextField
                label=""
                value={reply}
                onChange={setReply}
                multiline={6}
                disabled={isSubmitting}
                autoComplete="off"
              />
            ) : (
              <Text as="p" tone="subdued">
                No suggested reply available. Draft your response or escalate to team lead.
              </Text>
            )}
          </BlockStack>

          {/* Internal Note */}
          <TextField
            label="Internal note"
            value={note}
            onChange={setNote}
            multiline={3}
            placeholder="Add context for audit trail"
            disabled={isSubmitting}
            autoComplete="off"
          />
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}

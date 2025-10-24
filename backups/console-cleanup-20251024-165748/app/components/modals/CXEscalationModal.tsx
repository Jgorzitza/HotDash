import { useEffect, useMemo, useState } from "react";
import { useFetcher } from "react-router";
import {
  Modal,
  TextContainer,
  TextField,
  RangeSlider,
  ButtonGroup,
  Button,
  Banner,
  Scrollable,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Divider,
} from "@shopify/polaris";

import type { EscalationConversation } from "../../services/chatwoot/types";
import { useModalFocusTrap } from "../../hooks/useModalFocusTrap";
import { useToast } from "../../hooks/useToast";

interface CXEscalationModalProps {
  conversation: EscalationConversation;
  open: boolean;
  onClose: () => void;
}

interface ActionResponse {
  ok?: boolean;
  error?: string;
}

export function CXEscalationModal({
  conversation,
  open,
  onClose,
}: CXEscalationModalProps) {
  const fetcher = useFetcher<ActionResponse>();
  const [reply, setReply] = useState(conversation.suggestedReply ?? "");
  const [note, setNote] = useState("");

  // Grading sliders (1-5 scale)
  const [toneGrade, setToneGrade] = useState(3);
  const [accuracyGrade, setAccuracyGrade] = useState(3);
  const [policyGrade, setPolicyGrade] = useState(3);

  // Accessibility: Focus trap + Escape key + Initial focus (WCAG 2.4.3, 2.1.1)
  useModalFocusTrap(open, onClose);

  // Toast notifications for user feedback (Designer P0 requirement)
  const { showSuccess, showError } = useToast();

  const hasSuggestion = Boolean((conversation.suggestedReply ?? "").trim());

  useEffect(() => {
    if (open) {
      setReply(conversation.suggestedReply ?? "");
      setNote("");
      // Reset grades to default (3 = neutral)
      setToneGrade(3);
      setAccuracyGrade(3);
      setPolicyGrade(3);
    }
  }, [open, conversation.suggestedReply]);

  useEffect(() => {
    if (!open) return;
    if (fetcher.state !== "idle") return;
    if (fetcher.data?.ok) {
      showSuccess("Pit stop complete! 🏁");
      onClose();
    } else if (fetcher.data?.error) {
      showError(fetcher.data.error);
    }
  }, [fetcher.state, fetcher.data, onClose, open, showSuccess, showError]);

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
    aiSuggestionUsed: String(
      conversation.aiSuggestionEnabled && Boolean(conversation.aiSuggestion),
    ),
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

    // Add grading data (1-5 scale)
    formData.set("toneGrade", String(toneGrade));
    formData.set("accuracyGrade", String(accuracyGrade));
    formData.set("policyGrade", String(policyGrade));

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

  const handleEdit = () => {
    // Edit action allows operator to modify the suggested reply before approval
    // No submission - keeps modal open for editing
    console.log("Edit mode - operator modifying suggested reply");
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
      title={`CX Escalation — ${conversation.customerName}`}
      primaryAction={{
        content: "Approve & send",
        onAction: handleApprove,
        disabled: !hasSuggestion || !reply.trim() || isSubmitting,
        loading: isSubmitting,
      }}
      secondaryActions={[
        {
          content: "Edit",
          onAction: handleEdit,
          disabled: isSubmitting,
        },
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
          <TextContainer>
            <Text as="p" variant="bodySm" tone="subdued">
              Conversation #{conversation.id} · Status: {conversation.status}
            </Text>
          </TextContainer>

          {fetcher.data?.error && (
            <Banner tone="critical" onDismiss={() => {}}>
              <p>{fetcher.data.error}</p>
            </Banner>
          )}

          <BlockStack gap="300">
            <Text as="h3" variant="headingMd">
              Conversation history
            </Text>
            <Card>
              <Scrollable shadow style={{ maxHeight: "300px" }}>
                <BlockStack gap="200">
                  {messageHistory.length === 0 ? (
                    <Text as="p" tone="subdued">
                      No recent messages available.
                    </Text>
                  ) : (
                    messageHistory.map((message) => (
                      <Card key={message.id}>
                        <BlockStack gap="100">
                          <InlineStack align="space-between">
                            <Text as="span" variant="bodyMd" fontWeight="semibold">
                              {message.displayAuthor}
                            </Text>
                            <Text as="span" variant="bodySm" tone="subdued">
                              {new Date(message.createdAt).toLocaleString()}
                            </Text>
                          </InlineStack>
                          <Text as="p">{message.content}</Text>
                        </BlockStack>
                      </Card>
                    ))
                  )}
                </BlockStack>
              </Scrollable>
            </Card>
          </BlockStack>

          <Divider />

          <BlockStack gap="300">
            <Text as="h3" variant="headingMd">
              Suggested reply
            </Text>
            {hasSuggestion ? (
              <TextField
                label=""
                value={reply}
                onChange={setReply}
                multiline={6}
                autoComplete="off"
                disabled={isSubmitting}
                helpText="Edit the AI-suggested reply before sending"
              />
            ) : (
              <Banner tone="info">
                <p>No template available. Draft response manually or escalate.</p>
              </Banner>
            )}
          </BlockStack>

          <Divider />

          <BlockStack gap="300">
            <Text as="h3" variant="headingMd">
              Internal note
            </Text>
            <TextField
              label=""
              value={note}
              onChange={setNote}
              multiline={3}
              placeholder="Add context for audit trail"
              autoComplete="off"
              disabled={isSubmitting}
            />
          </BlockStack>

          <Divider />

          <BlockStack gap="300">
            <Text as="h3" variant="headingMd">
              Grade AI Response (1-5 scale)
            </Text>
            <BlockStack gap="400">
              <RangeSlider
                label="Tone"
                value={toneGrade}
                onChange={setToneGrade}
                min={1}
                max={5}
                step={1}
                output
                disabled={isSubmitting}
                helpText="Grade response tone from 1 (poor) to 5 (excellent)"
              />
              <RangeSlider
                label="Accuracy"
                value={accuracyGrade}
                onChange={setAccuracyGrade}
                min={1}
                max={5}
                step={1}
                output
                disabled={isSubmitting}
                helpText="Grade response accuracy from 1 (poor) to 5 (excellent)"
              />
              <RangeSlider
                label="Policy Compliance"
                value={policyGrade}
                onChange={setPolicyGrade}
                min={1}
                max={5}
                step={1}
                output
                disabled={isSubmitting}
                helpText="Grade policy compliance from 1 (poor) to 5 (excellent)"
              />
            </BlockStack>
          </BlockStack>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}

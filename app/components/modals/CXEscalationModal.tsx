import { useEffect, useMemo, useState } from "react";
import { useFetcher } from "react-router";

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

  if (!open) {
    return null;
  }

  return (
    <div className="occ-modal-backdrop" role="presentation">
      <dialog
        open
        className="occ-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`cx-escalation-${conversation.id}-title`}
        data-testid="cx-escalation-dialog"
      >
        <div className="occ-modal__header">
          <div>
            <h2 id={`cx-escalation-${conversation.id}-title`}>
              CX Pulse — {conversation.customerName}
            </h2>
            <p className="occ-text-meta" style={{ margin: 0 }}>
              Conversation #{conversation.id} · Status: {conversation.status}
            </p>
          </div>
          <button
            type="button"
            className="occ-button occ-button--plain"
            onClick={onClose}
            aria-label="Close escalation modal"
          >
            Close
          </button>
        </div>

        <div className="occ-modal__body">
          <section className="occ-modal__section">
            <h3>Conversation history</h3>
            <div className="occ-modal__messages" role="log" aria-live="polite">
              {messageHistory.length === 0 ? (
                <p className="occ-text-secondary">No message history loaded.</p>
              ) : (
                messageHistory.map((message) => (
                  <article key={message.id} className="occ-modal__message" data-author={message.author}>
                    <header>
                      <strong>{message.displayAuthor}</strong>
                      <span>{new Date(message.createdAt).toLocaleString()}</span>
                    </header>
                    <p>{message.content}</p>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="occ-modal__section">
            <h3>Suggested reply</h3>
            {hasSuggestion ? (
              <textarea
                className="occ-textarea"
                rows={6}
                value={reply}
                onChange={(event) => setReply(event.currentTarget.value)}
                aria-label="Reply text"
                disabled={isSubmitting}
              />
            ) : (
              <p className="occ-text-secondary">No suggested reply available. Draft your response or escalate to team lead.</p>
            )}
          </section>

          <section className="occ-modal__section">
            <h3>Internal note</h3>
            <textarea
              className="occ-textarea"
              rows={3}
              value={note}
              onChange={(event) => setNote(event.currentTarget.value)}
              placeholder="Add context for audit trail"
              disabled={isSubmitting}
            />
          </section>

          {fetcher.data?.error ? (
            <p className="occ-feedback occ-feedback--error" role="alert">
              {fetcher.data.error}
            </p>
          ) : null}
        </div>

        <div className="occ-modal__footer">
          <div className="occ-modal__footer-actions">
            <button
              type="button"
              className="occ-button occ-button--primary"
              onClick={handleApprove}
              disabled={!hasSuggestion || !reply.trim() || isSubmitting}
            >
              Approve &amp; send
            </button>
            <button
              type="button"
              className="occ-button occ-button--secondary"
              onClick={handleEscalate}
              disabled={isSubmitting}
            >
              Escalate
            </button>
            <button
              type="button"
              className="occ-button occ-button--secondary"
              onClick={handleResolve}
              disabled={isSubmitting}
            >
              Mark resolved
            </button>
          </div>
          <button
            type="button"
            className="occ-button occ-button--plain"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </dialog>
    </div>
  );
}

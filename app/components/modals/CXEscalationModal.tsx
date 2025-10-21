import { useEffect, useMemo, useState } from "react";
import { useFetcher } from "react-router";

import type { EscalationConversation } from "../../services/chatwoot/types";
import { useModalFocusTrap } from "../../hooks/useModalFocusTrap";

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
              CX Escalation — {conversation.customerName}
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
                <p className="occ-text-secondary">
                  No recent messages available.
                </p>
              ) : (
                messageHistory.map((message) => (
                  <article
                    key={message.id}
                    className="occ-modal__message"
                    data-author={message.author}
                  >
                    <header>
                      <strong>{message.displayAuthor}</strong>
                      <span>
                        {new Date(message.createdAt).toLocaleString()}
                      </span>
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
              <p className="occ-text-secondary">
                No template available. Draft response manually or escalate.
              </p>
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

          <section className="occ-modal__section">
            <h3>Grade AI Response (1-5 scale)</h3>
            <div className="occ-modal__grading" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="occ-grade-control">
                <label htmlFor={`tone-grade-${conversation.id}`} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span>Tone</span>
                  <span aria-live="polite">{toneGrade}/5</span>
                </label>
                <input
                  type="range"
                  id={`tone-grade-${conversation.id}`}
                  min="1"
                  max="5"
                  step="1"
                  value={toneGrade}
                  onChange={(e) => setToneGrade(Number(e.target.value))}
                  aria-label="Grade response tone from 1 (poor) to 5 (excellent)"
                  disabled={isSubmitting}
                  style={{ width: "100%" }}
                />
              </div>
              
              <div className="occ-grade-control">
                <label htmlFor={`accuracy-grade-${conversation.id}`} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span>Accuracy</span>
                  <span aria-live="polite">{accuracyGrade}/5</span>
                </label>
                <input
                  type="range"
                  id={`accuracy-grade-${conversation.id}`}
                  min="1"
                  max="5"
                  step="1"
                  value={accuracyGrade}
                  onChange={(e) => setAccuracyGrade(Number(e.target.value))}
                  aria-label="Grade response accuracy from 1 (poor) to 5 (excellent)"
                  disabled={isSubmitting}
                  style={{ width: "100%" }}
                />
              </div>
              
              <div className="occ-grade-control">
                <label htmlFor={`policy-grade-${conversation.id}`} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span>Policy Compliance</span>
                  <span aria-live="polite">{policyGrade}/5</span>
                </label>
                <input
                  type="range"
                  id={`policy-grade-${conversation.id}`}
                  min="1"
                  max="5"
                  step="1"
                  value={policyGrade}
                  onChange={(e) => setPolicyGrade(Number(e.target.value))}
                  aria-label="Grade policy compliance from 1 (poor) to 5 (excellent)"
                  disabled={isSubmitting}
                  style={{ width: "100%" }}
                />
              </div>
            </div>
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
              onClick={handleEdit}
              disabled={isSubmitting}
              aria-label="Edit suggested reply before approval"
            >
              Edit
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

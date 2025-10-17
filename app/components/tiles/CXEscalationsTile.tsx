import { useMemo, useState } from "react";

import type { EscalationConversation } from "../../services/chatwoot/types";
import { CXEscalationModal } from "../modals";

interface CXEscalationsTileProps {
  conversations: EscalationConversation[];
  enableModal?: boolean;
}

export function CXEscalationsTile({
  conversations,
  enableModal = false,
}: CXEscalationsTileProps) {
  const [activeConversationId, setActiveConversationId] = useState<
    number | null
  >(null);

  const activeConversation = useMemo(() => {
    if (!enableModal || activeConversationId == null) return null;
    return (
      conversations.find(
        (conversation) => conversation.id === activeConversationId,
      ) ?? null
    );
  }, [activeConversationId, conversations, enableModal]);

  const openModal = (conversationId: number) => {
    if (!enableModal) return;
    setActiveConversationId(conversationId);
  };

  const closeModal = () => setActiveConversationId(null);

  if (!conversations.length) {
    return (
      <p style={{ color: "var(--occ-text-secondary)", margin: 0 }}>
        No SLA breaches detected.
      </p>
    );
  }

  return (
    <>
      <ul
        style={{
          margin: 0,
          paddingLeft: "1.1rem",
          display: "flex",
          flexDirection: "column",
          gap: "var(--occ-space-1)",
          color: "var(--occ-text-primary)",
        }}
      >
        {conversations.map((conversation) => (
          <li key={conversation.id}>
            <div className="occ-tile-row">
              <span>
                {conversation.customerName} — {conversation.status}
                {conversation.slaBreached ? " • SLA breached" : ""}
              </span>
              {enableModal ? (
                <button
                  type="button"
                  className="occ-link-button"
                  onClick={() => openModal(conversation.id)}
                  data-testid="cx-escalations-open"
                >
                  Review
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      {activeConversation ? (
        <CXEscalationModal
          conversation={activeConversation}
          open={Boolean(activeConversation)}
          onClose={closeModal}
        />
      ) : null}
    </>
  );
}

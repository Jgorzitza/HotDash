import type { EscalationConversation } from "../../services/chatwoot/types";

interface CXEscalationsTileProps {
  conversations: EscalationConversation[];
}

export function CXEscalationsTile({ conversations }: CXEscalationsTileProps) {
  return (
    <>
      {conversations.length ? (
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
              {conversation.customerName} — {conversation.status}
              {conversation.slaBreached ? " • SLA breached" : ""}
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ color: "var(--occ-text-secondary)", margin: 0 }}>
          No SLA breaches detected.
        </p>
      )}
    </>
  );
}

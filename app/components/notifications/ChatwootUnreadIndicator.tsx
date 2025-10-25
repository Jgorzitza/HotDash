interface ChatwootUnreadIndicatorProps {
  count?: number;
}

const MAX_DISPLAY_COUNT = 99;

export function ChatwootUnreadIndicator({
  count,
}: ChatwootUnreadIndicatorProps) {
  if (!count || count < 1) {
    return null;
  }

  const displayCount = count > MAX_DISPLAY_COUNT ? `${MAX_DISPLAY_COUNT}+` : `${count}`;

  return (
    <span
      data-testid="chatwoot-unread-indicator"
      aria-live="polite"
      style={{ display: "inline-flex", alignItems: "center" }}
    >
      <s-badge
        tone="critical"
        aria-label={`Chatwoot unread conversations: ${displayCount}`}
      >
        {displayCount}
      </s-badge>
    </span>
  );
}

export default ChatwootUnreadIndicator;

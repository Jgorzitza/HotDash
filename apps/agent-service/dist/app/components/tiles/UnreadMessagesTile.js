export function UnreadMessagesTile({ unread }) {
    if (!unread) {
        return (<p style={{
                color: "var(--occ-text-secondary)",
                margin: 0,
            }}>
        No unread messages data available
      </p>);
    }
    const { unread_count, top_conversation } = unread;
    const metricStyle = {
        fontSize: "var(--occ-font-size-metric)",
        fontWeight: "var(--occ-font-weight-semibold)",
        margin: 0,
        color: "var(--occ-text-primary)",
    };
    const metaStyle = {
        color: "var(--occ-text-secondary)",
        margin: 0,
        fontSize: "var(--occ-font-size-sm)",
    };
    const formatTimeAgo = (isoString) => {
        const now = new Date();
        const then = new Date(isoString);
        const diffMs = now.getTime() - then.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        if (diffMins < 1)
            return "Just now";
        if (diffMins < 60)
            return `${diffMins}m ago`;
        if (diffHours < 24)
            return `${diffHours}h ago`;
        return `${Math.floor(diffHours / 24)}d ago`;
    };
    return (<div style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--occ-space-4)",
        }}>
      <section>
        <p style={metricStyle}>{unread_count}</p>
        <p style={metaStyle}>
          Unread {unread_count === 1 ? "conversation" : "conversations"}
        </p>
      </section>

      {top_conversation && (<section style={{
                padding: "var(--occ-space-3)",
                borderLeft: "2px solid var(--occ-border-default)",
                paddingLeft: "var(--occ-space-3)",
                background: "var(--occ-bg-secondary)",
                borderRadius: "var(--occ-radius-sm)",
            }}>
          <p style={{
                ...metaStyle,
                fontWeight: "var(--occ-font-weight-medium)",
                marginBottom: "var(--occ-space-2)",
                color: "var(--occ-text-primary)",
            }}>
            {top_conversation.customer_name}
          </p>
          <p style={{
                ...metaStyle,
                marginBottom: "var(--occ-space-1)",
            }}>
            {top_conversation.snippet}
            {top_conversation.snippet.length === 100 && "..."}
          </p>
          <p style={{
                ...metaStyle,
                fontSize: "var(--occ-font-size-xs)",
            }}>
            {formatTimeAgo(top_conversation.created_at)}
          </p>
        </section>)}

      {unread_count === 0 && (<section>
          <p style={{
                ...metaStyle,
                fontStyle: "italic",
            }}>
            All caught up! No unread messages.
          </p>
        </section>)}
    </div>);
}
//# sourceMappingURL=UnreadMessagesTile.js.map
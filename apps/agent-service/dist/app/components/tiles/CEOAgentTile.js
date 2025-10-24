export function CEOAgentTile({ stats }) {
    if (!stats) {
        return (<p style={{
                color: "var(--occ-text-secondary)",
                margin: 0,
            }}>
        No CEO agent data available
      </p>);
    }
    const { actions_today, pending_approvals, last_action, recent_actions } = stats;
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
        if (!isoString)
            return "Never";
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
      <section style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "var(--occ-space-3)",
        }}>
        <div>
          <p style={metricStyle}>{actions_today}</p>
          <p style={metaStyle}>Actions Today</p>
        </div>
        <div>
          <p style={metricStyle}>{pending_approvals}</p>
          <p style={metaStyle}>Pending Approvals</p>
        </div>
      </section>

      <section>
        <p style={{
            ...metaStyle,
            marginBottom: "var(--occ-space-1)",
            fontWeight: "var(--occ-font-weight-medium)",
        }}>
          Last Action:
        </p>
        <p style={metaStyle}>{formatTimeAgo(last_action)}</p>
      </section>

      {recent_actions && recent_actions.length > 0 && (<section>
          <p style={{
                ...metaStyle,
                marginBottom: "var(--occ-space-2)",
                fontWeight: "var(--occ-font-weight-medium)",
            }}>
            Recent Activity:
          </p>
          <ul style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "var(--occ-space-2)",
            }}>
            {recent_actions.slice(0, 3).map((action) => (<li key={action.id} style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--occ-space-1)",
                    padding: "var(--occ-space-2)",
                    borderLeft: "2px solid var(--occ-border-default)",
                    paddingLeft: "var(--occ-space-2)",
                }}>
                <span style={{
                    ...metaStyle,
                    fontSize: "var(--occ-font-size-xs)",
                    color: "var(--occ-text-primary)",
                }}>
                  {action.description}
                </span>
                <span style={{
                    ...metaStyle,
                    fontSize: "var(--occ-font-size-xs)",
                }}>
                  {action.type.replace(/_/g, " ")} •{" "}
                  <span style={{
                    color: action.status === "completed"
                        ? "var(--occ-text-success)"
                        : action.status === "pending"
                            ? "var(--occ-text-warning)"
                            : "var(--occ-text-secondary)",
                }}>
                    {action.status.replace(/_/g, " ")}
                  </span>
                </span>
              </li>))}
          </ul>
        </section>)}
    </div>);
}
//# sourceMappingURL=CEOAgentTile.js.map
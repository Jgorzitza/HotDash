import { Link } from "react-router";
import { useEffect, useState } from "react";
export function ApprovalsQueueTile({ pendingCount: externalPendingCount, oldestPendingTime: externalOldestTime, }) {
    const [pendingCount, setPendingCount] = useState(externalPendingCount || 0);
    const [oldestPendingTime, setOldestPendingTime] = useState(externalOldestTime || "");
    const [loading, setLoading] = useState(!externalPendingCount);
    useEffect(() => {
        if (externalPendingCount !== undefined)
            return;
        const loadData = async () => {
            try {
                setLoading(true);
                // Fetch summary via API to avoid server-only imports on client
                const res = await fetch("/api/approvals/summary");
                if (!res.ok)
                    throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                const counts = json?.data?.counts ?? {};
                const oldestISO = json?.data?.oldestPendingISO ?? null;
                setPendingCount(counts.pending_review || 0);
                if (oldestISO) {
                    const oldestDate = new Date(oldestISO);
                    const now = new Date();
                    const diffMs = now.getTime() - oldestDate.getTime();
                    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                    const diffDays = Math.floor(diffHours / 24);
                    if (diffDays > 0)
                        setOldestPendingTime(`${diffDays}d ago`);
                    else if (diffHours > 0)
                        setOldestPendingTime(`${diffHours}h ago`);
                    else
                        setOldestPendingTime("Just now");
                }
                else {
                    setOldestPendingTime("None");
                }
            }
            catch (error) {
                console.error("Error loading approvals data:", error);
                setPendingCount(0);
                setOldestPendingTime("Error");
            }
            finally {
                setLoading(false);
            }
        };
        loadData();
    }, [externalPendingCount]);
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
    const badgeStyle = {
        display: "inline-block",
        padding: "var(--occ-space-1) var(--occ-space-2)",
        borderRadius: "var(--occ-radius-sm)",
        fontSize: "var(--occ-font-size-xs)",
        fontWeight: "var(--occ-font-weight-medium)",
        background: pendingCount > 0 ? "var(--occ-bg-warning)" : "var(--occ-bg-success)",
        color: pendingCount > 0 ? "var(--occ-text-warning)" : "var(--occ-text-success)",
    };
    if (loading) {
        return (<div style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--occ-space-4)",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "120px",
            }}>
        <p style={metaStyle}>Loading approvals...</p>
      </div>);
    }
    return (<div style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--occ-space-4)",
            height: "100%",
        }}>
      <section>
        <div style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--occ-space-2)",
            marginBottom: "var(--occ-space-2)",
        }}>
          <p style={metricStyle}>{pendingCount}</p>
          <span style={badgeStyle}>
            {pendingCount === 0 ? "All Clear" : `${pendingCount} Pending`}
          </span>
        </div>
        <p style={metaStyle}>Approvals Queue</p>
      </section>

      <section style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "var(--occ-space-3)",
        }}>
        <div>
          <p style={{
            ...metricStyle,
            fontSize: "var(--occ-font-size-lg)",
        }}>
            {oldestPendingTime}
          </p>
          <p style={metaStyle}>Oldest Pending</p>
        </div>
      </section>

      {/* CTA Button to navigate to /approvals */}
      <section style={{ marginTop: "auto" }}>
        <Link to="/approvals" style={{
            display: "inline-block",
            padding: "var(--occ-space-2) var(--occ-space-3)",
            background: "var(--occ-bg-primary)",
            color: "var(--occ-text-on-primary)",
            textDecoration: "none",
            borderRadius: "var(--occ-radius-md)",
            fontSize: "var(--occ-font-size-sm)",
            fontWeight: "var(--occ-font-weight-medium)",
            textAlign: "center",
            width: "100%",
            boxSizing: "border-box",
        }}>
          Review Approvals
        </Link>
      </section>
    </div>);
}
//# sourceMappingURL=ApprovalsQueueTile.js.map
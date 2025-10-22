import type { IdeaPoolResponse } from "~/routes/api.analytics.idea-pool";
import { Link } from "react-router";

interface IdeaPoolTileProps {
  ideaPool: IdeaPoolResponse["data"];
}

export function IdeaPoolTile({ ideaPool }: IdeaPoolTileProps) {
  if (!ideaPool) {
    return (
      <p
        style={{
          color: "var(--occ-text-secondary)",
          margin: 0,
        }}
      >
        No idea pool data available
      </p>
    );
  }

  const { ideas, total_count, wildcard_count } = ideaPool;
  const pendingCount = ideas.filter(
    (i) => i.status === "pending_review",
  ).length;
  const approvedCount = ideas.filter((i) => i.status === "approved").length;

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
    background: "var(--occ-bg-accent)",
    color: "var(--occ-text-accent)",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--occ-space-4)",
      }}
    >
      <section>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--occ-space-2)",
            marginBottom: "var(--occ-space-2)",
          }}
        >
          <p style={metricStyle}>{total_count}/5</p>
          {wildcard_count > 0 && (
            <span style={badgeStyle}>
              {wildcard_count} Wildcard{wildcard_count > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <p style={metaStyle}>Pool capacity</p>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "var(--occ-space-3)",
        }}
      >
        <div>
          <p
            style={{
              ...metricStyle,
              fontSize: "var(--occ-font-size-lg)",
            }}
          >
            {pendingCount}
          </p>
          <p style={metaStyle}>Pending</p>
        </div>
        <div>
          <p
            style={{
              ...metricStyle,
              fontSize: "var(--occ-font-size-lg)",
            }}
          >
            {approvedCount}
          </p>
          <p style={metaStyle}>Approved</p>
        </div>
        <div>
          <p
            style={{
              ...metricStyle,
              fontSize: "var(--occ-font-size-lg)",
            }}
          >
            {
              ideas.filter(
                (i) => i.priority === "high" || i.priority === "urgent",
              ).length
            }
          </p>
          <p style={metaStyle}>High Priority</p>
        </div>
      </section>

      {ideas.length > 0 && (
        <section>
          <p
            style={{
              ...metaStyle,
              marginBottom: "var(--occ-space-2)",
              fontWeight: "var(--occ-font-weight-medium)",
            }}
          >
            Recent Ideas:
          </p>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "var(--occ-space-1)",
            }}
          >
            {ideas.slice(0, 3).map((idea) => (
              <li
                key={idea.id}
                style={{
                  ...metaStyle,
                  padding: "var(--occ-space-1)",
                  borderLeft: "2px solid var(--occ-border-default)",
                  paddingLeft: "var(--occ-space-2)",
                }}
              >
                {idea.title}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* CTA Button to navigate to /ideas */}
      <section style={{ marginTop: "auto" }}>
        <Link
          to="/ideas"
          style={{
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
          }}
        >
          View All Ideas
        </Link>
      </section>
    </div>
  );
}

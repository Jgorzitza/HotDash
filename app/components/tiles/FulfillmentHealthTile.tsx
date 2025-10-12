import type { FulfillmentIssue } from "../../services/shopify/types";

interface FulfillmentHealthTileProps {
  issues: FulfillmentIssue[];
}

function formatDateTime(value?: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleString();
}

export function FulfillmentHealthTile({ issues }: FulfillmentHealthTileProps) {
  return (
    <>
      {issues.length ? (
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
          {issues.map((issue) => (
            <li key={issue.orderId}>
              {issue.name} — {issue.displayStatus.toLowerCase()} (since{" "}
              {formatDateTime(issue.createdAt)})
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ color: "var(--occ-text-secondary)", margin: 0 }}>
          All orders on schedule.
        </p>
      )}
    </>
  );
}

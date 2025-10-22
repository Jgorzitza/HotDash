/**
 * SEO Impact Tile Component (ENG-024)
 *
 * Displays SEO ranking metrics:
 * - Total tracked keywords
 * - Average position
 * - Top mover preview
 */

interface SEOImpactData {
  totalKeywords: number;
  avgPosition: number;
  topMover: {
    keyword: string;
    oldPosition: number;
    newPosition: number;
    change: number;
  };
}

interface SEOImpactTileProps {
  data: SEOImpactData;
  onOpenModal?: () => void;
}

export function SEOImpactTile({ data, onOpenModal }: SEOImpactTileProps) {
  const isImprovement = data.topMover.change < 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--occ-space-4)",
        height: "100%",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--occ-space-4)",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "var(--occ-font-size-sm)",
              color: "var(--occ-text-secondary)",
              marginBottom: "var(--occ-space-1)",
            }}
          >
            Keywords
          </div>
          <div
            style={{
              fontSize: "var(--occ-font-size-2xl)",
              fontWeight: "var(--occ-font-weight-bold)",
            }}
          >
            {data.totalKeywords}
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: "var(--occ-font-size-sm)",
              color: "var(--occ-text-secondary)",
              marginBottom: "var(--occ-space-1)",
            }}
          >
            Avg Position
          </div>
          <div
            style={{
              fontSize: "var(--occ-font-size-2xl)",
              fontWeight: "var(--occ-font-weight-bold)",
            }}
          >
            {data.avgPosition.toFixed(1)}
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "var(--occ-space-3)",
          background: "var(--occ-bg-secondary)",
          borderRadius: "var(--occ-radius-md)",
          borderLeft: `3px solid ${isImprovement ? "var(--occ-border-success)" : "var(--occ-border-critical)"}`,
        }}
      >
        <div
          style={{
            fontSize: "var(--occ-font-size-xs)",
            color: "var(--occ-text-secondary)",
            marginBottom: "var(--occ-space-2)",
          }}
        >
          {isImprovement ? "📈" : "📉"} Top Mover
        </div>
        <div
          style={{
            fontSize: "var(--occ-font-size-sm)",
            fontWeight: "600",
            marginBottom: "var(--occ-space-1)",
          }}
        >
          {data.topMover.keyword}
        </div>
        <div
          style={{
            fontSize: "var(--occ-font-size-xs)",
            color: isImprovement
              ? "var(--occ-text-success)"
              : "var(--occ-text-critical)",
          }}
        >
          #{data.topMover.oldPosition} → #{data.topMover.newPosition} (
          {isImprovement ? "" : "+"}
          {data.topMover.change})
        </div>
      </div>

      {onOpenModal && (
        <button
          onClick={onOpenModal}
          style={{
            marginTop: "auto",
            padding: "var(--occ-space-2) var(--occ-space-3)",
            background: "var(--occ-bg-primary)",
            color: "var(--occ-text-on-primary)",
            border: "none",
            borderRadius: "var(--occ-radius-md)",
            fontSize: "var(--occ-font-size-sm)",
            fontWeight: "var(--occ-font-weight-medium)",
            cursor: "pointer",
          }}
        >
          View Rankings →
        </button>
      )}
    </div>
  );
}

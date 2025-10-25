/**
 * Growth Metrics Tile Component (ENG-026)
 *
 * Displays overall growth metrics across all channels:
 * - Weekly growth percentage
 * - Total reach
 * - Best performing channel
 */
export function GrowthMetricsTile({ data, onOpenModal, }) {
    return (<div style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--occ-space-4)",
            height: "100%",
        }}>
      <div>
        <div style={{
            fontSize: "var(--occ-font-size-sm)",
            color: "var(--occ-text-secondary)",
            marginBottom: "var(--occ-space-2)",
        }}>
          Weekly Growth
        </div>
        <div style={{
            fontSize: "var(--occ-font-size-3xl)",
            fontWeight: "var(--occ-font-weight-bold)",
            color: data.weeklyGrowth >= 15
                ? "var(--occ-text-success)"
                : data.weeklyGrowth >= 5
                    ? "var(--occ-text-warning)"
                    : "var(--occ-text-default)",
        }}>
          +{data.weeklyGrowth.toFixed(1)}%
        </div>
      </div>

      <div>
        <div style={{
            fontSize: "var(--occ-font-size-xs)",
            color: "var(--occ-text-secondary)",
            marginBottom: "var(--occ-space-1)",
        }}>
          Total Reach
        </div>
        <div style={{ fontSize: "var(--occ-font-size-xl)", fontWeight: "600" }}>
          {data.totalReach.toLocaleString()}
        </div>
      </div>

      <div style={{
            padding: "var(--occ-space-3)",
            background: "var(--occ-bg-secondary)",
            borderRadius: "var(--occ-radius-md)",
            borderLeft: "3px solid var(--occ-border-primary)",
        }}>
        <div style={{
            fontSize: "var(--occ-font-size-xs)",
            color: "var(--occ-text-secondary)",
            marginBottom: "var(--occ-space-2)",
        }}>
          🚀 Best Channel
        </div>
        <div style={{
            fontSize: "var(--occ-font-size-sm)",
            fontWeight: "600",
            marginBottom: "var(--occ-space-1)",
        }}>
          {data.bestChannel.name}
        </div>
        <div style={{
            fontSize: "var(--occ-font-size-xs)",
            color: "var(--occ-text-success)",
        }}>
          +{data.bestChannel.growth.toFixed(1)}% growth
        </div>
      </div>

      {onOpenModal && (<button onClick={onOpenModal} style={{
                marginTop: "auto",
                padding: "var(--occ-space-2) var(--occ-space-3)",
                background: "var(--occ-bg-primary)",
                color: "var(--occ-text-on-primary)",
                border: "none",
                borderRadius: "var(--occ-radius-md)",
                fontSize: "var(--occ-font-size-sm)",
                fontWeight: "var(--occ-font-weight-medium)",
                cursor: "pointer",
            }}>
          View All Channels →
        </button>)}
    </div>);
}
//# sourceMappingURL=GrowthMetricsTile.js.map
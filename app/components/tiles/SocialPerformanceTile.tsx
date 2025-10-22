/**
 * Social Performance Tile Component
 *
 * ENG-023: Displays social media post performance metrics
 * - Total posts count
 * - Average engagement
 * - Top post preview
 * - Click to open modal with detailed charts
 */

interface SocialPerformanceData {
  totalPosts: number;
  avgEngagement: number;
  topPost: {
    platform: string;
    content: string;
    impressions: number;
    engagement: number;
  };
}

interface SocialPerformanceTileProps {
  data: SocialPerformanceData;
  onOpenModal?: () => void;
}

export function SocialPerformanceTile({
  data,
  onOpenModal,
}: SocialPerformanceTileProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--occ-space-4)",
        height: "100%",
      }}
    >
      {/* Metrics Summary */}
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
            Total Posts
          </div>
          <div
            style={{
              fontSize: "var(--occ-font-size-2xl)",
              fontWeight: "var(--occ-font-weight-bold)",
              color: "var(--occ-text-default)",
            }}
          >
            {data.totalPosts}
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
            Avg Engagement
          </div>
          <div
            style={{
              fontSize: "var(--occ-font-size-2xl)",
              fontWeight: "var(--occ-font-weight-bold)",
              color: "var(--occ-text-default)",
            }}
          >
            {data.avgEngagement}
          </div>
        </div>
      </div>

      {/* Top Post Preview */}
      <div
        style={{
          padding: "var(--occ-space-3)",
          background: "var(--occ-bg-secondary)",
          borderRadius: "var(--occ-radius-md)",
          borderLeft: "3px solid var(--occ-border-primary)",
        }}
      >
        <div
          style={{
            fontSize: "var(--occ-font-size-xs)",
            color: "var(--occ-text-secondary)",
            marginBottom: "var(--occ-space-2)",
          }}
        >
          🔥 Top Post ({data.topPost.platform})
        </div>
        <div
          style={{
            fontSize: "var(--occ-font-size-sm)",
            color: "var(--occ-text-default)",
            marginBottom: "var(--occ-space-2)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {data.topPost.content}
        </div>
        <div
          style={{
            display: "flex",
            gap: "var(--occ-space-4)",
            fontSize: "var(--occ-font-size-xs)",
            color: "var(--occ-text-secondary)",
          }}
        >
          <span>{data.topPost.impressions.toLocaleString()} views</span>
          <span>{data.topPost.engagement.toLocaleString()} engagements</span>
        </div>
      </div>

      {/* View Details Button */}
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
          View All Posts →
        </button>
      )}
    </div>
  );
}

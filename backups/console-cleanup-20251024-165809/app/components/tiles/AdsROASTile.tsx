/**
 * Ads ROAS Tile Component (ENG-025)
 *
 * Displays advertising campaign ROAS metrics:
 * - Total ad spend
 * - Total revenue from ads
 * - ROAS (Return on Ad Spend)
 */

interface AdsROASData {
  totalSpend: number;
  totalRevenue: number;
  roas: number;
  topCampaign: {
    name: string;
    platform: string;
    roas: number;
    spend: number;
  };
}

interface AdsROASTileProps {
  data: AdsROASData;
  onOpenModal?: () => void;
}

export function AdsROASTile({ data, onOpenModal }: AdsROASTileProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--occ-space-4)",
        height: "100%",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "var(--occ-font-size-sm)",
            color: "var(--occ-text-secondary)",
            marginBottom: "var(--occ-space-2)",
          }}
        >
          Return on Ad Spend
        </div>
        <div
          style={{
            fontSize: "var(--occ-font-size-3xl)",
            fontWeight: "var(--occ-font-weight-bold)",
            color:
              data.roas >= 4
                ? "var(--occ-text-success)"
                : data.roas >= 2
                  ? "var(--occ-text-warning)"
                  : "var(--occ-text-critical)",
          }}
        >
          {data.roas.toFixed(2)}x
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--occ-space-3)",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "var(--occ-font-size-xs)",
              color: "var(--occ-text-secondary)",
            }}
          >
            Spend
          </div>
          <div
            style={{ fontSize: "var(--occ-font-size-md)", fontWeight: "600" }}
          >
            ${data.totalSpend.toLocaleString()}
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: "var(--occ-font-size-xs)",
              color: "var(--occ-text-secondary)",
            }}
          >
            Revenue
          </div>
          <div
            style={{ fontSize: "var(--occ-font-size-md)", fontWeight: "600" }}
          >
            ${data.totalRevenue.toLocaleString()}
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "var(--occ-space-3)",
          background: "var(--occ-bg-secondary)",
          borderRadius: "var(--occ-radius-md)",
          borderLeft: "3px solid var(--occ-border-success)",
        }}
      >
        <div
          style={{
            fontSize: "var(--occ-font-size-xs)",
            color: "var(--occ-text-secondary)",
            marginBottom: "var(--occ-space-2)",
          }}
        >
          🏆 Top Campaign
        </div>
        <div
          style={{
            fontSize: "var(--occ-font-size-sm)",
            fontWeight: "600",
            marginBottom: "var(--occ-space-1)",
          }}
        >
          {data.topCampaign.name}
        </div>
        <div
          style={{
            fontSize: "var(--occ-font-size-xs)",
            color: "var(--occ-text-secondary)",
          }}
        >
          {data.topCampaign.platform} • ROAS {data.topCampaign.roas.toFixed(1)}x
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
          View Campaigns →
        </button>
      )}
    </div>
  );
}

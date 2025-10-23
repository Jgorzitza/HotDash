/**
 * Ads ROAS Modal Component (ENG-025)
 *
 * Detailed advertising performance view with:
 * - ROAS trend chart (line)
 * - Spend distribution (doughnut)
 * - Campaign comparison table
 */

import { OCC_CHART_COLORS, OCC_CHART_COLORS_TRANSPARENT } from "../charts";
import type { ChartData } from "chart.js";
import { lazy, Suspense } from "react";

// Lazy-load heavy chart components to reduce initial bundle size
const LineChart = lazy(() =>
  import("../charts/LineChart").then((m) => ({ default: m.LineChart })),
);
const DoughnutChart = lazy(() =>
  import("../charts/DoughnutChart").then((m) => ({ default: m.DoughnutChart })),
);

interface Campaign {
  name: string;
  platform: string;
  spend: number;
  revenue: number;
  roas: number;
}

interface AdsROASModalProps {
  data: {
    trend: { labels: string[]; roas: number[]; spend: number[] };
    campaigns: Campaign[];
    distribution: Array<{
      platform: string;
      spend: number;
      percentage: number;
    }>;
  };
  onClose: () => void;
}

export function AdsROASModal({ data, onClose }: AdsROASModalProps) {
  const trendChartData: ChartData<"line"> = {
    labels: data.trend.labels,
    datasets: [
      {
        label: "ROAS",
        data: data.trend.roas,
        borderColor: OCC_CHART_COLORS.success,
        backgroundColor: OCC_CHART_COLORS_TRANSPARENT.success,
        fill: true,
        tension: 0.4,
        yAxisID: "y",
      },
      {
        label: "Spend ($)",
        data: data.trend.spend,
        borderColor: OCC_CHART_COLORS.warning,
        backgroundColor: OCC_CHART_COLORS_TRANSPARENT.warning,
        fill: false,
        tension: 0.4,
        yAxisID: "y1",
      },
    ],
  };

  const distributionChartData: ChartData<"doughnut"> = {
    labels: data.distribution.map((d) => d.platform),
    datasets: [
      {
        data: data.distribution.map((d) => d.spend),
        backgroundColor: [
          OCC_CHART_COLORS.primary,
          OCC_CHART_COLORS.success,
          OCC_CHART_COLORS.purple,
        ],
        hoverOffset: 4,
      },
    ],
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--occ-bg-surface)",
          borderRadius: "var(--occ-radius-lg)",
          padding: "var(--occ-space-6)",
          maxWidth: "1000px",
          width: "90%",
          maxHeight: "90vh",
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "var(--occ-space-6)",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "var(--occ-font-size-xl)",
              fontWeight: "var(--occ-font-weight-bold)",
            }}
          >
            Ad Campaign Performance
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "var(--occ-text-secondary)",
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "var(--occ-space-6)",
            marginBottom: "var(--occ-space-6)",
          }}
        >
          <div>
            <h3
              style={{
                fontSize: "var(--occ-font-size-md)",
                fontWeight: "var(--occ-font-weight-semibold)",
                marginBottom: "var(--occ-space-4)",
              }}
            >
              ROAS & Spend Trend
            </h3>
            <Suspense fallback={<div style={{ height: 300 }}>Loading chart…</div>}>
              <LineChart
              data={trendChartData}
              height={300}
              options={{
                scales: {
                  y: {
                    type: "linear",
                    position: "left",
                    title: { display: true, text: "ROAS" },
                  },
                  y1: {
                    type: "linear",
                    position: "right",
                    grid: { drawOnChartArea: false },
                    title: { display: true, text: "Spend ($)" },
                  },
                },
              }}
              />
            </Suspense>
          </div>
          <div>
            <h3
              style={{
                fontSize: "var(--occ-font-size-md)",
                fontWeight: "var(--occ-font-weight-semibold)",
                marginBottom: "var(--occ-space-4)",
              }}
            >
              Spend Distribution
            </h3>
            <Suspense fallback={<div style={{ height: 280 }}>Loading chart…</div>}>
              <DoughnutChart data={distributionChartData} height={280} />
            </Suspense>
          </div>
        </div>

        <div>
          <h3
            style={{
              fontSize: "var(--occ-font-size-md)",
              fontWeight: "var(--occ-font-weight-semibold)",
              marginBottom: "var(--occ-space-4)",
            }}
          >
            Campaign Performance
          </h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "var(--occ-font-size-sm)",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "2px solid var(--occ-border-default)",
                  textAlign: "left",
                }}
              >
                <th
                  style={{
                    padding: "var(--occ-space-3)",
                    color: "var(--occ-text-secondary)",
                  }}
                >
                  Campaign
                </th>
                <th
                  style={{
                    padding: "var(--occ-space-3)",
                    color: "var(--occ-text-secondary)",
                  }}
                >
                  Platform
                </th>
                <th
                  style={{
                    padding: "var(--occ-space-3)",
                    color: "var(--occ-text-secondary)",
                    textAlign: "right",
                  }}
                >
                  Spend
                </th>
                <th
                  style={{
                    padding: "var(--occ-space-3)",
                    color: "var(--occ-text-secondary)",
                    textAlign: "right",
                  }}
                >
                  Revenue
                </th>
                <th
                  style={{
                    padding: "var(--occ-space-3)",
                    color: "var(--occ-text-secondary)",
                    textAlign: "right",
                  }}
                >
                  ROAS
                </th>
              </tr>
            </thead>
            <tbody>
              {data.campaigns.map((campaign) => (
                <tr
                  key={campaign.name}
                  style={{ borderBottom: "1px solid var(--occ-border-subtle)" }}
                >
                  <td
                    style={{ padding: "var(--occ-space-3)", fontWeight: "600" }}
                  >
                    {campaign.name}
                  </td>
                  <td style={{ padding: "var(--occ-space-3)" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        background: "var(--occ-bg-secondary)",
                        borderRadius: "var(--occ-radius-sm)",
                        fontSize: "var(--occ-font-size-xs)",
                      }}
                    >
                      {campaign.platform}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "var(--occ-space-3)",
                      textAlign: "right",
                    }}
                  >
                    ${campaign.spend.toLocaleString()}
                  </td>
                  <td
                    style={{
                      padding: "var(--occ-space-3)",
                      textAlign: "right",
                    }}
                  >
                    ${campaign.revenue.toLocaleString()}
                  </td>
                  <td
                    style={{
                      padding: "var(--occ-space-3)",
                      textAlign: "right",
                      fontWeight: "600",
                      color:
                        campaign.roas >= 4
                          ? "var(--occ-text-success)"
                          : campaign.roas >= 2
                            ? "var(--occ-text-warning)"
                            : "var(--occ-text-critical)",
                    }}
                  >
                    {campaign.roas.toFixed(1)}x
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

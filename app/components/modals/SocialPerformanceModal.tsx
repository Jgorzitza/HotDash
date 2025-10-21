/**
 * Social Performance Modal Component
 * 
 * ENG-023: Detailed view of social media performance
 * - Line chart showing engagement trends (Chart.js)
 * - DataTable with top posts (impressions, CTR, engagement rate)
 * - Date range filter (future enhancement)
 */

import { LineChart, OCC_CHART_COLORS } from '../charts';
import type { ChartData } from 'chart.js';

interface SocialPost {
  postId: string;
  platform: string;
  content: string;
  metrics: {
    impressions: number;
    clicks: number;
    engagement: number;
    ctr: number;
    engagementRate: number;
  };
}

interface SocialPerformanceModalProps {
  data: {
    trend: {
      labels: string[];
      impressions: number[];
      engagement: number[];
    };
    topPosts: SocialPost[];
  };
  onClose: () => void;
}

export function SocialPerformanceModal({ data, onClose }: SocialPerformanceModalProps) {
  // Prepare chart data per Context7 Chart.js docs
  const chartData: ChartData<'line'> = {
    labels: data.trend.labels,
    datasets: [
      {
        label: 'Impressions',
        data: data.trend.impressions,
        borderColor: OCC_CHART_COLORS.primary,
        backgroundColor: 'rgba(0, 91, 211, 0.1)',
        fill: true,
        tension: 0.4, // Smooth curves
      },
      {
        label: 'Engagement',
        data: data.trend.engagement,
        borderColor: OCC_CHART_COLORS.success,
        backgroundColor: 'rgba(0, 128, 96, 0.1)',
        fill: true,
        tension: 0.4,
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
          maxWidth: "900px",
          width: "90%",
          maxHeight: "90vh",
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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
            Social Media Performance
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

        {/* Engagement Trend Chart */}
        <div style={{ marginBottom: "var(--occ-space-6)" }}>
          <h3
            style={{
              fontSize: "var(--occ-font-size-md)",
              fontWeight: "var(--occ-font-weight-semibold)",
              marginBottom: "var(--occ-space-4)",
            }}
          >
            Engagement Trends (Last 7 Days)
          </h3>
          <LineChart data={chartData} height={300} />
        </div>

        {/* Top Posts Table */}
        <div>
          <h3
            style={{
              fontSize: "var(--occ-font-size-md)",
              fontWeight: "var(--occ-font-weight-semibold)",
              marginBottom: "var(--occ-space-4)",
            }}
          >
            Top Performing Posts
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
                <th style={{ padding: "var(--occ-space-3)", color: "var(--occ-text-secondary)" }}>
                  Platform
                </th>
                <th style={{ padding: "var(--occ-space-3)", color: "var(--occ-text-secondary)" }}>
                  Content
                </th>
                <th style={{ padding: "var(--occ-space-3)", color: "var(--occ-text-secondary)", textAlign: "right" }}>
                  Impressions
                </th>
                <th style={{ padding: "var(--occ-space-3)", color: "var(--occ-text-secondary)", textAlign: "right" }}>
                  CTR
                </th>
                <th style={{ padding: "var(--occ-space-3)", color: "var(--occ-text-secondary)", textAlign: "right" }}>
                  Engagement
                </th>
              </tr>
            </thead>
            <tbody>
              {data.topPosts.map((post) => (
                <tr
                  key={post.postId}
                  style={{
                    borderBottom: "1px solid var(--occ-border-subtle)",
                  }}
                >
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
                      {post.platform}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "var(--occ-space-3)",
                      maxWidth: "300px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {post.content}
                  </td>
                  <td style={{ padding: "var(--occ-space-3)", textAlign: "right" }}>
                    {post.metrics.impressions.toLocaleString()}
                  </td>
                  <td style={{ padding: "var(--occ-space-3)", textAlign: "right" }}>
                    {post.metrics.ctr.toFixed(1)}%
                  </td>
                  <td style={{ padding: "var(--occ-space-3)", textAlign: "right", fontWeight: "600" }}>
                    {post.metrics.engagementRate.toFixed(1)}%
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


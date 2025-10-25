/**
 * SEO Impact Modal Component (ENG-024)
 *
 * Detailed SEO ranking view with:
 * - Position trend chart (line)
 * - Top movers bar chart
 * - Content correlation table
 */
import { OCC_CHART_COLORS } from "../charts";
import { lazy, Suspense } from "react";
// Lazy-load heavy chart components to reduce initial bundle size
const LineChart = lazy(() => import("../charts/LineChart").then((m) => ({ default: m.LineChart })));
const BarChart = lazy(() => import("../charts/BarChart").then((m) => ({ default: m.BarChart })));
export function SEOImpactModal({ data, onClose }) {
    const trendChartData = {
        labels: data.trend.labels,
        datasets: [
            {
                label: "Average Position",
                data: data.trend.positions,
                borderColor: OCC_CHART_COLORS.primary,
                backgroundColor: "rgba(0, 91, 211, 0.1)",
                fill: true,
                tension: 0.4,
            },
        ],
    };
    const moversChartData = {
        labels: data.topMovers.map((m) => m.keyword),
        datasets: [
            {
                label: "Position Change",
                data: data.topMovers.map((m) => m.change),
                backgroundColor: data.topMovers.map((m) => m.change < 0 ? OCC_CHART_COLORS.success : OCC_CHART_COLORS.critical),
            },
        ],
    };
    return (<div style={{
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
        }} onClick={onClose}>
      <div style={{
            background: "var(--occ-bg-surface)",
            borderRadius: "var(--occ-radius-lg)",
            padding: "var(--occ-space-6)",
            maxWidth: "900px",
            width: "90%",
            maxHeight: "90vh",
            overflow: "auto",
        }} onClick={(e) => e.stopPropagation()}>
        <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "var(--occ-space-6)",
        }}>
          <h2 style={{
            margin: 0,
            fontSize: "var(--occ-font-size-xl)",
            fontWeight: "var(--occ-font-weight-bold)",
        }}>
            SEO Rankings Impact
          </h2>
          <button onClick={onClose} style={{
            background: "none",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
            color: "var(--occ-text-secondary)",
        }}>
            ×
          </button>
        </div>

        <div style={{ marginBottom: "var(--occ-space-6)" }}>
          <h3 style={{
            fontSize: "var(--occ-font-size-md)",
            fontWeight: "var(--occ-font-weight-semibold)",
            marginBottom: "var(--occ-space-4)",
        }}>
            Position Trend
          </h3>
          <Suspense fallback={<div style={{ height: 250 }}>Loading chart…</div>}>
            <LineChart data={trendChartData} height={250}/>
          </Suspense>
        </div>

        <div style={{ marginBottom: "var(--occ-space-6)" }}>
          <h3 style={{
            fontSize: "var(--occ-font-size-md)",
            fontWeight: "var(--occ-font-weight-semibold)",
            marginBottom: "var(--occ-space-4)",
        }}>
            Top Movers
          </h3>
          <Suspense fallback={<div style={{ height: 200 }}>Loading chart…</div>}>
            <BarChart data={moversChartData} height={200} horizontal/>
          </Suspense>
        </div>

        <div>
          <h3 style={{
            fontSize: "var(--occ-font-size-md)",
            fontWeight: "var(--occ-font-weight-semibold)",
            marginBottom: "var(--occ-space-4)",
        }}>
            Keyword Rankings
          </h3>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "var(--occ-font-size-sm)",
        }}>
            <thead>
              <tr style={{
            borderBottom: "2px solid var(--occ-border-default)",
            textAlign: "left",
        }}>
                <th style={{
            padding: "var(--occ-space-3)",
            color: "var(--occ-text-secondary)",
        }}>
                  Keyword
                </th>
                <th style={{
            padding: "var(--occ-space-3)",
            color: "var(--occ-text-secondary)",
            textAlign: "right",
        }}>
                  Position
                </th>
                <th style={{
            padding: "var(--occ-space-3)",
            color: "var(--occ-text-secondary)",
            textAlign: "right",
        }}>
                  Change
                </th>
                <th style={{
            padding: "var(--occ-space-3)",
            color: "var(--occ-text-secondary)",
        }}>
                  URL
                </th>
              </tr>
            </thead>
            <tbody>
              {data.topMovers.map((mover) => (<tr key={mover.keyword} style={{ borderBottom: "1px solid var(--occ-border-subtle)" }}>
                  <td style={{ padding: "var(--occ-space-3)", fontWeight: "600" }}>
                    {mover.keyword}
                  </td>
                  <td style={{
                padding: "var(--occ-space-3)",
                textAlign: "right",
            }}>
                    #{mover.position}
                  </td>
                  <td style={{
                padding: "var(--occ-space-3)",
                textAlign: "right",
                color: mover.change < 0
                    ? "var(--occ-text-success)"
                    : "var(--occ-text-critical)",
                fontWeight: "600",
            }}>
                    {mover.change < 0 ? "" : "+"}
                    {mover.change}
                  </td>
                  <td style={{
                padding: "var(--occ-space-3)",
                fontSize: "var(--occ-font-size-xs)",
                color: "var(--occ-text-secondary)",
            }}>
                    {mover.url}
                  </td>
                </tr>))}
            </tbody>
          </table>
        </div>
      </div>
    </div>);
}
//# sourceMappingURL=SEOImpactModal.js.map
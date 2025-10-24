/**
 * Action Attribution Panel Component
 *
 * ANALYTICS-101: Attribution panel with 7/14/28-day tabs showing performance metrics
 * for each approved Action with GA4 hd_action_key attribution data
 */
import { useState } from "react";
export function AttributionPanel({ data, loading = false, error, }) {
    const [selectedWindow, setSelectedWindow] = useState("28d");
    const [sortBy, setSortBy] = useState("roi");
    const [selectedAction, setSelectedAction] = useState(null);
    if (loading) {
        return (<div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "var(--occ-space-8)",
            }}>
        <div style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--occ-space-2)",
            }}>
          <div style={{
                width: "20px",
                height: "20px",
                border: "2px solid var(--occ-color-primary)",
                borderTop: "2px solid transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
            }}></div>
          <span>Loading attribution data...</span>
        </div>
      </div>);
    }
    if (error) {
        return (<div style={{
                padding: "var(--occ-space-4)",
                border: "1px solid var(--occ-color-error)",
                borderRadius: "var(--occ-radius-md)",
                backgroundColor: "var(--occ-bg-error-subdued)",
            }}>
        <div style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--occ-space-2)",
            }}>
          <span style={{ color: "var(--occ-color-error)" }}>⚠️</span>
          <div>
            <h3 style={{ margin: 0, color: "var(--occ-color-error)" }}>
              Error loading attribution data
            </h3>
            <p style={{ margin: 0, color: "var(--occ-text-secondary)" }}>
              {error}
            </p>
          </div>
        </div>
      </div>);
    }
    const sortedActions = getSortedActions(data.actions, sortBy);
    return (<div style={{ padding: "var(--occ-space-4)" }}>
      {/* Header */}
      <div style={{ marginBottom: "var(--occ-space-4)" }}>
        <h2 style={{ margin: 0, marginBottom: "var(--occ-space-2)" }}>
          Action Attribution Dashboard
        </h2>
        <p style={{
            margin: 0,
            color: "var(--occ-text-secondary)",
            fontSize: "var(--occ-font-size-sm)",
        }}>
          Period: {new Date(data.period.start).toLocaleDateString()} -{" "}
          {new Date(data.period.end).toLocaleDateString()}
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "var(--occ-space-3)",
            marginBottom: "var(--occ-space-4)",
        }}>
        <SummaryCard title="Total Actions" value={data.summary.totalActions} icon="📊"/>
        <SummaryCard title="Total Revenue" value={`$${data.summary.totalRevenue.toLocaleString()}`} icon="💰"/>
        <SummaryCard title="Total Conversions" value={data.summary.totalConversions.toLocaleString()} icon="🎯"/>
        <SummaryCard title="Average ROI" value={`${data.summary.averageROI.toFixed(1)}x`} icon="📈"/>
        <SummaryCard title="Overall Confidence" value={`${data.summary.overallConfidence.toFixed(0)}%`} icon="🎯"/>
      </div>

      {/* Controls */}
      <div style={{
            display: "flex",
            gap: "var(--occ-space-3)",
            marginBottom: "var(--occ-space-4)",
            flexWrap: "wrap",
        }}>
        {/* Time Window Selector */}
        <div>
          <label style={{
            display: "block",
            marginBottom: "var(--occ-space-1)",
            fontSize: "var(--occ-font-size-sm)",
            fontWeight: "var(--occ-font-weight-medium)",
        }}>
            Time Window:
          </label>
          <select value={selectedWindow} onChange={(e) => setSelectedWindow(e.target.value)} style={{
            padding: "var(--occ-space-2)",
            border: "1px solid var(--occ-border-default)",
            borderRadius: "var(--occ-radius-sm)",
            fontSize: "var(--occ-font-size-sm)",
        }}>
            <option value="7d">7 Days</option>
            <option value="14d">14 Days</option>
            <option value="28d">28 Days</option>
          </select>
        </div>

        {/* Sort Selector */}
        <div>
          <label style={{
            display: "block",
            marginBottom: "var(--occ-space-1)",
            fontSize: "var(--occ-font-size-sm)",
            fontWeight: "var(--occ-font-weight-medium)",
        }}>
            Sort By:
          </label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{
            padding: "var(--occ-space-2)",
            border: "1px solid var(--occ-border-default)",
            borderRadius: "var(--occ-radius-sm)",
            fontSize: "var(--occ-font-size-sm)",
        }}>
            <option value="roi">ROI</option>
            <option value="revenue">Revenue</option>
            <option value="conversions">Conversions</option>
            <option value="confidence">Confidence</option>
          </select>
        </div>
      </div>

      {/* Actions Table */}
      <div style={{
            border: "1px solid var(--occ-border-default)",
            borderRadius: "var(--occ-radius-md)",
            overflow: "hidden",
        }}>
        <div style={{
            backgroundColor: "var(--occ-bg-subdued)",
            padding: "var(--occ-space-3)",
            borderBottom: "1px solid var(--occ-border-default)",
        }}>
          <h3 style={{ margin: 0, fontSize: "var(--occ-font-size-lg)" }}>
            Action Performance ({selectedWindow})
          </h3>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "var(--occ-font-size-sm)",
        }}>
            <thead>
              <tr style={{ backgroundColor: "var(--occ-bg-subdued)" }}>
                <th style={{ padding: "var(--occ-space-3)", textAlign: "left" }}>
                  Action
                </th>
                <th style={{ padding: "var(--occ-space-3)", textAlign: "right" }}>
                  Impressions
                </th>
                <th style={{ padding: "var(--occ-space-3)", textAlign: "right" }}>
                  Clicks
                </th>
                <th style={{ padding: "var(--occ-space-3)", textAlign: "right" }}>
                  Conversions
                </th>
                <th style={{ padding: "var(--occ-space-3)", textAlign: "right" }}>
                  Revenue
                </th>
                <th style={{ padding: "var(--occ-space-3)", textAlign: "right" }}>
                  ROAS
                </th>
                <th style={{ padding: "var(--occ-space-3)", textAlign: "right" }}>
                  CTR
                </th>
                <th style={{ padding: "var(--occ-space-3)", textAlign: "right" }}>
                  Confidence
                </th>
                <th style={{ padding: "var(--occ-space-3)", textAlign: "center" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedActions.map((action) => (<ActionRow key={action.actionId} action={action} window={selectedWindow} isSelected={selectedAction === action.actionId} onSelect={() => setSelectedAction(selectedAction === action.actionId
                ? null
                : action.actionId)}/>))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Detail Modal */}
      {selectedAction && (<ActionDetailModal action={data.actions.find((a) => a.actionId === selectedAction)} onClose={() => setSelectedAction(null)}/>)}
    </div>);
}
function SummaryCard({ title, value, icon, }) {
    return (<div style={{
            padding: "var(--occ-space-3)",
            border: "1px solid var(--occ-border-default)",
            borderRadius: "var(--occ-radius-md)",
            backgroundColor: "var(--occ-bg-surface)",
        }}>
      <div style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--occ-space-2)",
        }}>
        <span style={{ fontSize: "var(--occ-font-size-lg)" }}>{icon}</span>
        <div>
          <p style={{
            margin: 0,
            fontSize: "var(--occ-font-size-sm)",
            color: "var(--occ-text-secondary)",
        }}>
            {title}
          </p>
          <p style={{
            margin: 0,
            fontSize: "var(--occ-font-size-lg)",
            fontWeight: "var(--occ-font-weight-semibold)",
        }}>
            {value}
          </p>
        </div>
      </div>
    </div>);
}
function ActionRow({ action, window, isSelected, onSelect, }) {
    const metrics = action.actualImpact[window];
    const delta = action.performanceDelta;
    const getDeltaColor = (value) => {
        if (value > 0)
            return "var(--occ-color-success)";
        if (value < 0)
            return "var(--occ-color-error)";
        return "var(--occ-text-secondary)";
    };
    const getConfidenceColor = (score) => {
        if (score >= 80)
            return "var(--occ-color-success)";
        if (score >= 60)
            return "var(--occ-color-warning)";
        return "var(--occ-color-error)";
    };
    return (<tr style={{
            backgroundColor: isSelected
                ? "var(--occ-bg-primary-subdued)"
                : "transparent",
            cursor: "pointer",
        }}>
      <td style={{ padding: "var(--occ-space-3)" }}>
        <div>
          <div style={{ fontWeight: "var(--occ-font-weight-medium)" }}>
            {action.title}
          </div>
          <div style={{
            fontSize: "var(--occ-font-size-xs)",
            color: "var(--occ-text-secondary)",
        }}>
            {action.actionType.toUpperCase()} • {action.targetSlug}
          </div>
        </div>
      </td>
      <td style={{ padding: "var(--occ-space-3)", textAlign: "right" }}>
        <div>
          <div>{metrics.impressions.toLocaleString()}</div>
          <div style={{
            fontSize: "var(--occ-font-size-xs)",
            color: getDeltaColor(delta.impressions),
        }}>
            {delta.impressions > 0 ? "+" : ""}
            {delta.impressions.toLocaleString()}
          </div>
        </div>
      </td>
      <td style={{ padding: "var(--occ-space-3)", textAlign: "right" }}>
        <div>
          <div>{metrics.clicks.toLocaleString()}</div>
          <div style={{
            fontSize: "var(--occ-font-size-xs)",
            color: "var(--occ-text-secondary)",
        }}>
            {metrics.ctr.toFixed(1)}% CTR
          </div>
        </div>
      </td>
      <td style={{ padding: "var(--occ-space-3)", textAlign: "right" }}>
        <div>
          <div>{metrics.conversions.toLocaleString()}</div>
          <div style={{
            fontSize: "var(--occ-font-size-xs)",
            color: getDeltaColor(delta.conversions),
        }}>
            {delta.conversions > 0 ? "+" : ""}
            {delta.conversions.toLocaleString()}
          </div>
        </div>
      </td>
      <td style={{ padding: "var(--occ-space-3)", textAlign: "right" }}>
        <div>
          <div>${metrics.revenue.toLocaleString()}</div>
          <div style={{
            fontSize: "var(--occ-font-size-xs)",
            color: getDeltaColor(delta.revenue),
        }}>
            {delta.revenue > 0 ? "+" : ""}${delta.revenue.toLocaleString()}
          </div>
        </div>
      </td>
      <td style={{ padding: "var(--occ-space-3)", textAlign: "right" }}>
        <div>
          <div>{metrics.roas.toFixed(1)}x</div>
          <div style={{
            fontSize: "var(--occ-font-size-xs)",
            color: getDeltaColor(delta.roas),
        }}>
            {delta.roas > 0 ? "+" : ""}
            {delta.roas.toFixed(1)}x
          </div>
        </div>
      </td>
      <td style={{ padding: "var(--occ-space-3)", textAlign: "right" }}>
        {metrics.ctr.toFixed(1)}%
      </td>
      <td style={{ padding: "var(--occ-space-3)", textAlign: "right" }}>
        <span style={{ color: getConfidenceColor(action.confidenceScore) }}>
          {action.confidenceScore.toFixed(0)}%
        </span>
      </td>
      <td style={{ padding: "var(--occ-space-3)", textAlign: "center" }}>
        <button onClick={onSelect} style={{
            padding: "var(--occ-space-1) var(--occ-space-2)",
            border: "1px solid var(--occ-border-default)",
            borderRadius: "var(--occ-radius-sm)",
            backgroundColor: "var(--occ-bg-surface)",
            fontSize: "var(--occ-font-size-xs)",
            cursor: "pointer",
        }}>
          View Details →
        </button>
      </td>
    </tr>);
}
function ActionDetailModal({ action, onClose, }) {
    return (<div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
        }}>
      <div style={{
            backgroundColor: "var(--occ-bg-surface)",
            borderRadius: "var(--occ-radius-lg)",
            padding: "var(--occ-space-6)",
            maxWidth: "800px",
            maxHeight: "80vh",
            overflow: "auto",
            position: "relative",
        }}>
        <button onClick={onClose} style={{
            position: "absolute",
            top: "var(--occ-space-4)",
            right: "var(--occ-space-4)",
            background: "none",
            border: "none",
            fontSize: "var(--occ-font-size-lg)",
            cursor: "pointer",
        }}>
          ×
        </button>

        <h3 style={{ margin: 0, marginBottom: "var(--occ-space-4)" }}>
          {action.title}
        </h3>

        <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--occ-space-4)",
        }}>
          {/* Expected vs Actual */}
          <div>
            <h4 style={{ margin: 0, marginBottom: "var(--occ-space-2)" }}>
              Expected vs Actual (28d)
            </h4>
            <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--occ-space-2)",
        }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Revenue:</span>
                <span>
                  ${action.expectedImpact.revenue.toLocaleString()} → $
                  {action.actualImpact["28d"].revenue.toLocaleString()}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Conversions:</span>
                <span>
                  {action.expectedImpact.conversions} →{" "}
                  {action.actualImpact["28d"].conversions}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>ROAS:</span>
                <span>
                  {action.expectedImpact.roas.toFixed(1)}x →{" "}
                  {action.actualImpact["28d"].roas.toFixed(1)}x
                </span>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div>
            <h4 style={{ margin: 0, marginBottom: "var(--occ-space-2)" }}>
              Performance Metrics
            </h4>
            <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--occ-space-2)",
        }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Confidence Score:</span>
                <span style={{
            color: action.confidenceScore >= 80
                ? "var(--occ-color-success)"
                : action.confidenceScore >= 60
                    ? "var(--occ-color-warning)"
                    : "var(--occ-color-error)",
        }}>
                  {action.confidenceScore.toFixed(0)}%
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Realized ROI:</span>
                <span>{action.realizedROI.toFixed(1)}x</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>CTR:</span>
                <span>{action.actualImpact["28d"].ctr.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Time Window Comparison */}
        <div style={{ marginTop: "var(--occ-space-4)" }}>
          <h4 style={{ margin: 0, marginBottom: "var(--occ-space-2)" }}>
            Performance by Time Window
          </h4>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "var(--occ-space-3)",
        }}>
            {["7d", "14d", "28d"].map((window) => {
            const metrics = action.actualImpact[window];
            return (<div key={window} style={{
                    padding: "var(--occ-space-3)",
                    border: "1px solid var(--occ-border-default)",
                    borderRadius: "var(--occ-radius-md)",
                    backgroundColor: "var(--occ-bg-subdued)",
                }}>
                  <h5 style={{ margin: 0, marginBottom: "var(--occ-space-2)" }}>
                    {window}
                  </h5>
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--occ-space-1)",
                }}>
                    <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                }}>
                      <span>Revenue:</span>
                      <span>${metrics.revenue.toLocaleString()}</span>
                    </div>
                    <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                }}>
                      <span>Conversions:</span>
                      <span>{metrics.conversions}</span>
                    </div>
                    <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                }}>
                      <span>ROAS:</span>
                      <span>{metrics.roas.toFixed(1)}x</span>
                    </div>
                  </div>
                </div>);
        })}
          </div>
        </div>
      </div>
    </div>);
}
function getSortedActions(actions, sortBy) {
    return [...actions].sort((a, b) => {
        switch (sortBy) {
            case "roi":
                return b.realizedROI - a.realizedROI;
            case "revenue":
                return b.actualImpact["28d"].revenue - a.actualImpact["28d"].revenue;
            case "conversions":
                return (b.actualImpact["28d"].conversions - a.actualImpact["28d"].conversions);
            case "confidence":
                return b.confidenceScore - a.confidenceScore;
            default:
                return 0;
        }
    });
}
export default AttributionPanel;
//# sourceMappingURL=AttributionPanel.js.map
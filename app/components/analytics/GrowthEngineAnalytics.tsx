/**
 * Growth Engine Advanced Analytics Component
 *
 * Displays comprehensive analytics for Growth Engine phases 9-12
 * including attribution modeling, performance insights, and recommendations.
 */

import { useState, useEffect } from "react";
import type { GrowthEngineAnalytics } from "~/services/analytics/growthEngineAdvanced";

interface GrowthEngineAnalyticsProps {
  analytics: GrowthEngineAnalytics;
  timeframe: string;
  period: {
    start: string;
    end: string;
  };
  generatedAt: string;
}

type ViewMode = "overview" | "attribution" | "recommendations";

export function GrowthEngineAnalyticsComponent({
  analytics,
  timeframe,
  period,
  generatedAt,
}: GrowthEngineAnalyticsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [isLoading, setIsLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getEfficiencyColor = (score: number) => {
    if (score >= 80) return "var(--occ-color-success)";
    if (score >= 60) return "var(--occ-color-warning)";
    return "var(--occ-color-error)";
  };

  const getROIColor = (roi: number) => {
    if (roi >= 4) return "var(--occ-color-success)";
    if (roi >= 2) return "var(--occ-color-warning)";
    return "var(--occ-color-error)";
  };

  return (
    <div style={{ padding: "var(--occ-space-4)" }}>
      {/* Header */}
      <div style={{ marginBottom: "var(--occ-space-4)" }}>
        <h2 style={{ margin: 0, marginBottom: "var(--occ-space-2)" }}>
          Growth Engine Advanced Analytics
        </h2>
        <p style={{ 
          margin: 0, 
          color: "var(--occ-text-secondary)",
          fontSize: "var(--occ-font-size-sm)"
        }}>
          Period: {new Date(period.start).toLocaleDateString()} - {new Date(period.end).toLocaleDateString()} • 
          Timeframe: {timeframe} • 
          Generated: {new Date(generatedAt).toLocaleTimeString()}
        </p>
      </div>

      {/* View Mode Tabs */}
      <div style={{ 
        display: "flex", 
        gap: "var(--occ-space-2)", 
        marginBottom: "var(--occ-space-4)",
        borderBottom: "1px solid var(--occ-border-default)"
      }}>
        {[
          { key: "overview", label: "Overview" },
          { key: "attribution", label: "Attribution" },
          { key: "recommendations", label: "Recommendations" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setViewMode(key as ViewMode)}
            style={{
              padding: "var(--occ-space-2) var(--occ-space-3)",
              border: "none",
              background: viewMode === key ? "var(--occ-bg-primary)" : "transparent",
              color: viewMode === key ? "var(--occ-text-on-primary)" : "var(--occ-text-primary)",
              cursor: "pointer",
              borderRadius: "var(--occ-radius-sm) var(--occ-radius-sm) 0 0",
              fontSize: "var(--occ-font-size-sm)",
              fontWeight: "var(--occ-font-weight-medium)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Overview View */}
      {viewMode === "overview" && (
        <div>
          {/* Summary Metrics */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "var(--occ-space-3)",
            marginBottom: "var(--occ-space-4)"
          }}>
            <div style={{
              padding: "var(--occ-space-3)",
              border: "1px solid var(--occ-border-default)",
              borderRadius: "var(--occ-radius-md)",
              backgroundColor: "var(--occ-bg-surface)"
            }}>
              <h3 style={{ margin: 0, fontSize: "var(--occ-font-size-lg)", marginBottom: "var(--occ-space-1)" }}>
                {analytics.summary.totalActions}
              </h3>
              <p style={{ margin: 0, color: "var(--occ-text-secondary)", fontSize: "var(--occ-font-size-sm)" }}>
                Total Actions
              </p>
            </div>
            <div style={{
              padding: "var(--occ-space-3)",
              border: "1px solid var(--occ-border-default)",
              borderRadius: "var(--occ-radius-md)",
              backgroundColor: "var(--occ-bg-surface)"
            }}>
              <h3 style={{ margin: 0, fontSize: "var(--occ-font-size-lg)", marginBottom: "var(--occ-space-1)" }}>
                {formatCurrency(analytics.summary.totalRevenue)}
              </h3>
              <p style={{ margin: 0, color: "var(--occ-text-secondary)", fontSize: "var(--occ-font-size-sm)" }}>
                Total Revenue
              </p>
            </div>
            <div style={{
              padding: "var(--occ-space-3)",
              border: "1px solid var(--occ-border-default)",
              borderRadius: "var(--occ-radius-md)",
              backgroundColor: "var(--occ-bg-surface)"
            }}>
              <h3 style={{ margin: 0, fontSize: "var(--occ-font-size-lg)", marginBottom: "var(--occ-space-1)" }}>
                {analytics.summary.totalConversions}
              </h3>
              <p style={{ margin: 0, color: "var(--occ-text-secondary)", fontSize: "var(--occ-font-size-sm)" }}>
                Total Conversions
              </p>
            </div>
            <div style={{
              padding: "var(--occ-space-3)",
              border: "1px solid var(--occ-border-default)",
              borderRadius: "var(--occ-radius-md)",
              backgroundColor: "var(--occ-bg-surface)"
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: "var(--occ-font-size-lg)", 
                marginBottom: "var(--occ-space-1)",
                color: getROIColor(analytics.summary.averageROI)
              }}>
                {analytics.summary.averageROI.toFixed(1)}x
              </h3>
              <p style={{ margin: 0, color: "var(--occ-text-secondary)", fontSize: "var(--occ-font-size-sm)" }}>
                Average ROI
              </p>
            </div>
            <div style={{
              padding: "var(--occ-space-3)",
              border: "1px solid var(--occ-border-default)",
              borderRadius: "var(--occ-radius-md)",
              backgroundColor: "var(--occ-bg-surface)"
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: "var(--occ-font-size-lg)", 
                marginBottom: "var(--occ-space-1)",
                color: getEfficiencyColor(analytics.summary.overallEfficiency)
              }}>
                {formatPercentage(analytics.summary.overallEfficiency)}
              </h3>
              <p style={{ margin: 0, color: "var(--occ-text-secondary)", fontSize: "var(--occ-font-size-sm)" }}>
                Overall Efficiency
              </p>
            </div>
          </div>

          {/* Top Performing Actions */}
          <div style={{ marginBottom: "var(--occ-space-4)" }}>
            <h3 style={{ margin: 0, marginBottom: "var(--occ-space-3)" }}>Top Performing Actions</h3>
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--occ-space-2)"
            }}>
              {analytics.performanceInsights.topPerformingActions.map((action, index) => (
                <div key={action.actionId} style={{
                  padding: "var(--occ-space-3)",
                  border: "1px solid var(--occ-border-default)",
                  borderRadius: "var(--occ-radius-md)",
                  backgroundColor: "var(--occ-bg-surface)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "var(--occ-font-size-base)" }}>
                        {action.title}
                      </h4>
                      <p style={{ 
                        margin: 0, 
                        color: "var(--occ-text-secondary)", 
                        fontSize: "var(--occ-font-size-sm)" 
                      }}>
                        {action.actionType.toUpperCase()} • {action.targetSlug}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ 
                        margin: 0, 
                        fontSize: "var(--occ-font-size-sm)",
                        color: "var(--occ-text-secondary)"
                      }}>
                        Expected ROI: {action.expectedROI?.toFixed(1)}x
                      </p>
                      <p style={{ 
                        margin: 0, 
                        fontSize: "var(--occ-font-size-sm)",
                        color: "var(--occ-text-secondary)"
                      }}>
                        Budget: {formatCurrency(action.budget || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Optimization Opportunities */}
          {analytics.performanceInsights.optimizationOpportunities.length > 0 && (
            <div>
              <h3 style={{ margin: 0, marginBottom: "var(--occ-space-3)" }}>Optimization Opportunities</h3>
              <div style={{
                padding: "var(--occ-space-3)",
                border: "1px solid var(--occ-border-warning)",
                borderRadius: "var(--occ-radius-md)",
                backgroundColor: "var(--occ-bg-warning-subdued)"
              }}>
                <ul style={{ margin: 0, paddingLeft: "var(--occ-space-4)" }}>
                  {analytics.performanceInsights.optimizationOpportunities.map((opportunity, index) => (
                    <li key={index} style={{ marginBottom: "var(--occ-space-1)" }}>
                      {opportunity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Attribution View */}
      {viewMode === "attribution" && (
        <div>
          <h3 style={{ margin: 0, marginBottom: "var(--occ-space-3)" }}>Attribution Analysis</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "var(--occ-font-size-sm)"
            }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--occ-border-default)" }}>
                  <th style={{ padding: "var(--occ-space-2)", textAlign: "left" }}>Action</th>
                  <th style={{ padding: "var(--occ-space-2)", textAlign: "right" }}>Revenue</th>
                  <th style={{ padding: "var(--occ-space-2)", textAlign: "right" }}>Conversions</th>
                  <th style={{ padding: "var(--occ-space-2)", textAlign: "right" }}>Cost</th>
                  <th style={{ padding: "var(--occ-space-2)", textAlign: "right" }}>ROI</th>
                  <th style={{ padding: "var(--occ-space-2)", textAlign: "right" }}>Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {analytics.attributionAnalysis.map((data) => (
                  <tr key={data.actionId} style={{ borderBottom: "1px solid var(--occ-border-subdued)" }}>
                    <td style={{ padding: "var(--occ-space-2)" }}>
                      <div>
                        <div style={{ fontWeight: "var(--occ-font-weight-medium)" }}>
                          {data.actionType.toUpperCase()}
                        </div>
                        <div style={{ 
                          fontSize: "var(--occ-font-size-xs)", 
                          color: "var(--occ-text-secondary)" 
                        }}>
                          {data.targetSlug}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "var(--occ-space-2)", textAlign: "right" }}>
                      {formatCurrency(data.totalAttribution.revenue)}
                    </td>
                    <td style={{ padding: "var(--occ-space-2)", textAlign: "right" }}>
                      {data.totalAttribution.conversions}
                    </td>
                    <td style={{ padding: "var(--occ-space-2)", textAlign: "right" }}>
                      {formatCurrency(data.totalAttribution.cost)}
                    </td>
                    <td style={{ 
                      padding: "var(--occ-space-2)", 
                      textAlign: "right",
                      color: getROIColor(data.totalAttribution.roi)
                    }}>
                      {data.totalAttribution.roi.toFixed(1)}x
                    </td>
                    <td style={{ 
                      padding: "var(--occ-space-2)", 
                      textAlign: "right",
                      color: getEfficiencyColor(data.efficiency.efficiencyScore)
                    }}>
                      {formatPercentage(data.efficiency.efficiencyScore)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recommendations View */}
      {viewMode === "recommendations" && (
        <div>
          <h3 style={{ margin: 0, marginBottom: "var(--occ-space-3)" }}>Recommendations</h3>
          
          {/* Scaling Actions */}
          {analytics.recommendations.scalingActions.length > 0 && (
            <div style={{ marginBottom: "var(--occ-space-4)" }}>
              <h4 style={{ margin: 0, marginBottom: "var(--occ-space-2)" }}>Scale These Actions</h4>
              <div style={{
                padding: "var(--occ-space-3)",
                border: "1px solid var(--occ-border-success)",
                borderRadius: "var(--occ-radius-md)",
                backgroundColor: "var(--occ-bg-success-subdued)"
              }}>
                <ul style={{ margin: 0, paddingLeft: "var(--occ-space-4)" }}>
                  {analytics.recommendations.scalingActions.map((action) => (
                    <li key={action.actionId} style={{ marginBottom: "var(--occ-space-1)" }}>
                      {action.title} ({action.actionType.toUpperCase()})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Optimization Actions */}
          {analytics.recommendations.optimizationActions.length > 0 && (
            <div style={{ marginBottom: "var(--occ-space-4)" }}>
              <h4 style={{ margin: 0, marginBottom: "var(--occ-space-2)" }}>Optimize These Actions</h4>
              <div style={{
                padding: "var(--occ-space-3)",
                border: "1px solid var(--occ-border-warning)",
                borderRadius: "var(--occ-radius-md)",
                backgroundColor: "var(--occ-bg-warning-subdued)"
              }}>
                <ul style={{ margin: 0, paddingLeft: "var(--occ-space-4)" }}>
                  {analytics.recommendations.optimizationActions.map((action, index) => (
                    <li key={index} style={{ marginBottom: "var(--occ-space-1)" }}>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Budget Adjustments */}
          <div>
            <h4 style={{ margin: 0, marginBottom: "var(--occ-space-2)" }}>Budget Adjustments</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--occ-space-3)" }}>
              {analytics.recommendations.budgetAdjustments.increase.length > 0 && (
                <div style={{
                  padding: "var(--occ-space-3)",
                  border: "1px solid var(--occ-border-success)",
                  borderRadius: "var(--occ-radius-md)",
                  backgroundColor: "var(--occ-bg-success-subdued)"
                }}>
                  <h5 style={{ margin: 0, marginBottom: "var(--occ-space-2)", color: "var(--occ-color-success)" }}>
                    Increase Budget
                  </h5>
                  <ul style={{ margin: 0, paddingLeft: "var(--occ-space-4)" }}>
                    {analytics.recommendations.budgetAdjustments.increase.map((action, index) => (
                      <li key={index} style={{ marginBottom: "var(--occ-space-1)" }}>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {analytics.recommendations.budgetAdjustments.decrease.length > 0 && (
                <div style={{
                  padding: "var(--occ-space-3)",
                  border: "1px solid var(--occ-border-error)",
                  borderRadius: "var(--occ-radius-md)",
                  backgroundColor: "var(--occ-bg-error-subdued)"
                }}>
                  <h5 style={{ margin: 0, marginBottom: "var(--occ-space-2)", color: "var(--occ-color-error)" }}>
                    Decrease Budget
                  </h5>
                  <ul style={{ margin: 0, paddingLeft: "var(--occ-space-4)" }}>
                    {analytics.recommendations.budgetAdjustments.decrease.map((action, index) => (
                      <li key={index} style={{ marginBottom: "var(--occ-space-1)" }}>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
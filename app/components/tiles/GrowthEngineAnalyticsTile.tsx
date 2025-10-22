/**
 * Growth Engine Analytics Tile
 *
 * Displays advanced analytics for Growth Engine phases 9-12
 * including attribution modeling, performance insights, and recommendations.
 */

import { useState, useEffect } from "react";
import { GrowthEngineAnalyticsComponent } from "../analytics/GrowthEngineAnalytics";
import type { GrowthEngineAnalytics } from "~/services/analytics/growthEngineAdvanced";

interface GrowthEngineAnalyticsTileProps {
  analytics: GrowthEngineAnalytics;
  timeframe: string;
  period: {
    start: string;
    end: string;
  };
  generatedAt: string;
}

export function GrowthEngineAnalyticsTile({
  analytics,
  timeframe,
  period,
  generatedAt,
}: GrowthEngineAnalyticsTileProps) {
  const [isExpanded, setIsExpanded] = useState(false);
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
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--occ-space-4)" }}>
      {/* Summary Metrics */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
        gap: "var(--occ-space-3)"
      }}>
        <div style={{ textAlign: "center" }}>
          <p style={{
            fontSize: "var(--occ-font-size-metric)",
            fontWeight: "var(--occ-font-weight-semibold)",
            margin: 0,
            color: "var(--occ-text-primary)"
          }}>
            {analytics.summary.totalActions}
          </p>
          <p style={{
            margin: 0,
            color: "var(--occ-text-secondary)",
            fontSize: "var(--occ-font-size-sm)"
          }}>
            Actions
          </p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{
            fontSize: "var(--occ-font-size-metric)",
            fontWeight: "var(--occ-font-weight-semibold)",
            margin: 0,
            color: "var(--occ-text-primary)"
          }}>
            {formatCurrency(analytics.summary.totalRevenue)}
          </p>
          <p style={{
            margin: 0,
            color: "var(--occ-text-secondary)",
            fontSize: "var(--occ-font-size-sm)"
          }}>
            Revenue
          </p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{
            fontSize: "var(--occ-font-size-metric)",
            fontWeight: "var(--occ-font-weight-semibold)",
            margin: 0,
            color: getROIColor(analytics.summary.averageROI)
          }}>
            {analytics.summary.averageROI.toFixed(1)}x
          </p>
          <p style={{
            margin: 0,
            color: "var(--occ-text-secondary)",
            fontSize: "var(--occ-font-size-sm)"
          }}>
            Avg ROI
          </p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{
            fontSize: "var(--occ-font-size-metric)",
            fontWeight: "var(--occ-font-weight-semibold)",
            margin: 0,
            color: getEfficiencyColor(analytics.summary.overallEfficiency)
          }}>
            {formatPercentage(analytics.summary.overallEfficiency)}
          </p>
          <p style={{
            margin: 0,
            color: "var(--occ-text-secondary)",
            fontSize: "var(--occ-font-size-sm)"
          }}>
            Efficiency
          </p>
        </div>
      </div>

      {/* Top Performers */}
      <div>
        <h4 style={{ 
          margin: 0, 
          marginBottom: "var(--occ-space-2)",
          fontSize: "var(--occ-font-size-base)",
          fontWeight: "var(--occ-font-weight-medium)"
        }}>
          Top Performers
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--occ-space-2)" }}>
          {analytics.performanceInsights.topPerformingActions.slice(0, 3).map((action) => (
            <div key={action.actionId} style={{
              padding: "var(--occ-space-2)",
              border: "1px solid var(--occ-border-default)",
              borderRadius: "var(--occ-radius-sm)",
              backgroundColor: "var(--occ-bg-surface)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ 
                    margin: 0, 
                    fontSize: "var(--occ-font-size-sm)",
                    fontWeight: "var(--occ-font-weight-medium)"
                  }}>
                    {action.title}
                  </p>
                  <p style={{ 
                    margin: 0, 
                    fontSize: "var(--occ-font-size-xs)",
                    color: "var(--occ-text-secondary)"
                  }}>
                    {action.actionType.toUpperCase()}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ 
                    margin: 0, 
                    fontSize: "var(--occ-font-size-sm)",
                    color: getROIColor(action.expectedROI || 0)
                  }}>
                    {action.expectedROI?.toFixed(1)}x ROI
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
          <h4 style={{ 
            margin: 0, 
            marginBottom: "var(--occ-space-2)",
            fontSize: "var(--occ-font-size-base)",
            fontWeight: "var(--occ-font-weight-medium)"
          }}>
            Optimization Opportunities
          </h4>
          <div style={{
            padding: "var(--occ-space-2)",
            border: "1px solid var(--occ-border-warning)",
            borderRadius: "var(--occ-radius-sm)",
            backgroundColor: "var(--occ-bg-warning-subdued)"
          }}>
            <p style={{ 
              margin: 0, 
              fontSize: "var(--occ-font-size-sm)",
              color: "var(--occ-color-warning)"
            }}>
              {analytics.performanceInsights.optimizationOpportunities.length} actions need optimization
            </p>
          </div>
        </div>
      )}

      {/* Expand/Collapse Button */}
      <div style={{ marginTop: "auto" }}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            width: "100%",
            padding: "var(--occ-space-2) var(--occ-space-3)",
            background: "var(--occ-bg-primary)",
            color: "var(--occ-text-on-primary)",
            border: "none",
            borderRadius: "var(--occ-radius-md)",
            cursor: "pointer",
            fontSize: "var(--occ-font-size-sm)",
            fontWeight: "var(--occ-font-weight-medium)",
          }}
        >
          {isExpanded ? "Show Summary" : "View Full Analytics"}
        </button>
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--occ-space-4)"
        }}>
          <div style={{
            backgroundColor: "var(--occ-bg-surface)",
            borderRadius: "var(--occ-radius-lg)",
            maxWidth: "90vw",
            maxHeight: "90vh",
            overflow: "auto",
            position: "relative"
          }}>
            <button
              onClick={() => setIsExpanded(false)}
              style={{
                position: "absolute",
                top: "var(--occ-space-3)",
                right: "var(--occ-space-3)",
                background: "var(--occ-bg-surface)",
                border: "1px solid var(--occ-border-default)",
                borderRadius: "var(--occ-radius-sm)",
                padding: "var(--occ-space-1) var(--occ-space-2)",
                cursor: "pointer",
                fontSize: "var(--occ-font-size-sm)",
                zIndex: 1001
              }}
            >
              ✕ Close
            </button>
            <GrowthEngineAnalyticsComponent
              analytics={analytics}
              timeframe={timeframe}
              period={period}
              generatedAt={generatedAt}
            />
          </div>
        </div>
      )}
    </div>
  );
}

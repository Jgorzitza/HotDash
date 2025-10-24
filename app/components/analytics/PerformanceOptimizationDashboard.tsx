/**
 * Growth Engine Performance Optimization Dashboard
 *
 * ANALYTICS-001: Advanced performance optimization dashboard for Growth Engine
 * Displays performance analysis, optimization recommendations, and real-time monitoring
 */

import { useState, useEffect } from "react";
import type {
  PerformanceAnalysisResult,
  OptimizationResult,
} from "~/lib/growth-engine/performance-analysis";
import type { OptimizationResult as OptimizerResult } from "~/services/analytics/performance-optimizer";

interface PerformanceOptimizationDashboardProps {
  analysis?: PerformanceAnalysisResult;
  optimization?: OptimizerResult;
  loading?: boolean;
  error?: string;
}

type ViewMode =
  | "overview"
  | "analysis"
  | "optimization"
  | "recommendations"
  | "monitoring";

export function PerformanceOptimizationDashboard({
  analysis,
  optimization,
  loading = false,
  error,
}: PerformanceOptimizationDashboardProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Trigger refresh (would be handled by parent component)
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--occ-space-8)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--occ-space-2)",
          }}
        >
          <div
            style={{
              width: "20px",
              height: "20px",
              border: "2px solid var(--occ-color-primary)",
              borderTop: "2px solid transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          ></div>
          <span>Loading performance optimization data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "var(--occ-space-4)",
          border: "1px solid var(--occ-color-error)",
          borderRadius: "var(--occ-radius-md)",
          backgroundColor: "var(--occ-bg-error-subdued)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--occ-space-2)",
          }}
        >
          <span style={{ color: "var(--occ-color-error)" }}>⚠️</span>
          <div>
            <h3 style={{ margin: 0, color: "var(--occ-color-error)" }}>
              Error loading performance data
            </h3>
            <p style={{ margin: 0, color: "var(--occ-text-secondary)" }}>
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "var(--occ-space-4)" }}>
      {/* Header */}
      <div style={{ marginBottom: "var(--occ-space-4)" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "var(--occ-space-2)",
          }}
        >
          <h2 style={{ margin: 0 }}>Performance Optimization Dashboard</h2>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--occ-space-2)",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--occ-space-1)",
                fontSize: "var(--occ-font-size-sm)",
              }}
            >
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              Auto-refresh
            </label>
            {analysis && (
              <span
                style={{
                  fontSize: "var(--occ-font-size-sm)",
                  color: "var(--occ-text-secondary)",
                }}
              >
                Last updated:{" "}
                {new Date(analysis.timestamp).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <p
          style={{
            margin: 0,
            color: "var(--occ-text-secondary)",
            fontSize: "var(--occ-font-size-sm)",
          }}
        >
          Advanced performance analysis and optimization for Growth Engine
          infrastructure
        </p>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: "flex",
          gap: "var(--occ-space-2)",
          marginBottom: "var(--occ-space-4)",
          borderBottom: "1px solid var(--occ-border-default)",
        }}
      >
        {[
          { key: "overview", label: "Overview" },
          { key: "analysis", label: "Analysis" },
          { key: "optimization", label: "Optimization" },
          { key: "recommendations", label: "Recommendations" },
          { key: "monitoring", label: "Monitoring" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setViewMode(key as ViewMode)}
            style={{
              padding: "var(--occ-space-2) var(--occ-space-3)",
              border: "none",
              background:
                viewMode === key ? "var(--occ-bg-primary)" : "transparent",
              color:
                viewMode === key
                  ? "var(--occ-text-on-primary)"
                  : "var(--occ-text-primary)",
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

      {/* Content */}
      {viewMode === "overview" && analysis && (
        <OverviewView analysis={analysis} optimization={optimization} />
      )}
      {viewMode === "analysis" && analysis && (
        <AnalysisView analysis={analysis} />
      )}
      {viewMode === "optimization" && optimization && (
        <OptimizationView optimization={optimization} />
      )}
      {viewMode === "recommendations" && analysis && (
        <RecommendationsView analysis={analysis} />
      )}
      {viewMode === "monitoring" && analysis && (
        <MonitoringView analysis={analysis} />
      )}
    </div>
  );
}

function OverviewView({
  analysis,
  optimization,
}: {
  analysis: PerformanceAnalysisResult;
  optimization?: OptimizerResult;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "var(--occ-color-success)";
    if (score >= 80) return "var(--occ-color-warning)";
    if (score >= 70) return "var(--occ-color-error)";
    return "var(--occ-color-error)";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "excellent":
        return "🟢";
      case "good":
        return "🟡";
      case "fair":
        return "🟠";
      case "poor":
        return "🔴";
      case "critical":
        return "🚨";
      default:
        return "⚪";
    }
  };

  return (
    <div>
      {/* Overall Performance Score */}
      <div style={{ marginBottom: "var(--occ-space-4)" }}>
        <h3 style={{ margin: 0, marginBottom: "var(--occ-space-3)" }}>
          Overall Performance
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "var(--occ-space-3)",
          }}
        >
          <div
            style={{
              padding: "var(--occ-space-4)",
              border: "1px solid var(--occ-border-default)",
              borderRadius: "var(--occ-radius-md)",
              backgroundColor: "var(--occ-bg-surface)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "var(--occ-font-size-4xl)",
                fontWeight: "var(--occ-font-weight-bold)",
                color: getScoreColor(analysis.overallScore),
                marginBottom: "var(--occ-space-2)",
              }}
            >
              {analysis.overallScore}
            </div>
            <div
              style={{
                fontSize: "var(--occ-font-size-lg)",
                fontWeight: "var(--occ-font-weight-semibold)",
                marginBottom: "var(--occ-space-1)",
              }}
            >
              Overall Score
            </div>
            <div
              style={{
                fontSize: "var(--occ-font-size-sm)",
                color: "var(--occ-text-secondary)",
              }}
            >
              Performance Rating
            </div>
          </div>

          {optimization && (
            <div
              style={{
                padding: "var(--occ-space-4)",
                border: "1px solid var(--occ-border-success)",
                borderRadius: "var(--occ-radius-md)",
                backgroundColor: "var(--occ-bg-success-subdued)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "var(--occ-font-size-4xl)",
                  fontWeight: "var(--occ-font-weight-bold)",
                  color: "var(--occ-color-success)",
                  marginBottom: "var(--occ-space-2)",
                }}
              >
                +{optimization.performanceGains.overall}%
              </div>
              <div
                style={{
                  fontSize: "var(--occ-font-size-lg)",
                  fontWeight: "var(--occ-font-weight-semibold)",
                  marginBottom: "var(--occ-space-1)",
                }}
              >
                Performance Gain
              </div>
              <div
                style={{
                  fontSize: "var(--occ-font-size-sm)",
                  color: "var(--occ-text-secondary)",
                }}
              >
                From Optimization
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category Performance */}
      <div style={{ marginBottom: "var(--occ-space-4)" }}>
        <h3 style={{ margin: 0, marginBottom: "var(--occ-space-3)" }}>
          Category Performance
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "var(--occ-space-3)",
          }}
        >
          {Object.entries(analysis.categories).map(([category, data]) => (
            <div
              key={category}
              style={{
                padding: "var(--occ-space-3)",
                border: "1px solid var(--occ-border-default)",
                borderRadius: "var(--occ-radius-md)",
                backgroundColor: "var(--occ-bg-surface)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "var(--occ-space-2)",
                }}
              >
                <div>
                  <h4 style={{ margin: 0, textTransform: "capitalize" }}>
                    {category}
                  </h4>
                  <div
                    style={{
                      fontSize: "var(--occ-font-size-sm)",
                      color: "var(--occ-text-secondary)",
                    }}
                  >
                    {getStatusIcon(data.status)} {data.status}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "var(--occ-font-size-2xl)",
                    fontWeight: "var(--occ-font-weight-bold)",
                    color: getScoreColor(data.score),
                  }}
                >
                  {data.score}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "var(--occ-space-2)",
                  fontSize: "var(--occ-font-size-sm)",
                }}
              >
                <div>
                  <div style={{ color: "var(--occ-text-secondary)" }}>
                    Response Time
                  </div>
                  <div style={{ fontWeight: "var(--occ-font-weight-medium)" }}>
                    {data.metrics.responseTime.toFixed(0)}ms
                  </div>
                </div>
                <div>
                  <div style={{ color: "var(--occ-text-secondary)" }}>
                    Throughput
                  </div>
                  <div style={{ fontWeight: "var(--occ-font-weight-medium)" }}>
                    {data.metrics.throughput.toFixed(0)}/s
                  </div>
                </div>
                <div>
                  <div style={{ color: "var(--occ-text-secondary)" }}>
                    Error Rate
                  </div>
                  <div style={{ fontWeight: "var(--occ-font-weight-medium)" }}>
                    {data.metrics.errorRate.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div style={{ color: "var(--occ-text-secondary)" }}>
                    Resource Usage
                  </div>
                  <div style={{ fontWeight: "var(--occ-font-weight-medium)" }}>
                    {data.metrics.resourceUsage.toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Critical Issues */}
      {analysis.criticalIssues.length > 0 && (
        <div>
          <h3 style={{ margin: 0, marginBottom: "var(--occ-space-3)" }}>
            Critical Issues
          </h3>
          <div style={{ display: "grid", gap: "var(--occ-space-2)" }}>
            {analysis.criticalIssues.map((issue) => (
              <div
                key={issue.id}
                style={{
                  padding: "var(--occ-space-3)",
                  border: "1px solid var(--occ-border-error)",
                  borderRadius: "var(--occ-radius-md)",
                  backgroundColor: "var(--occ-bg-error-subdued)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    marginBottom: "var(--occ-space-2)",
                  }}
                >
                  <div>
                    <h4 style={{ margin: 0, color: "var(--occ-color-error)" }}>
                      {issue.title}
                    </h4>
                    <p
                      style={{
                        margin: 0,
                        color: "var(--occ-text-secondary)",
                        fontSize: "var(--occ-font-size-sm)",
                      }}
                    >
                      {issue.description}
                    </p>
                  </div>
                  <span
                    style={{
                      padding: "var(--occ-space-1) var(--occ-space-2)",
                      borderRadius: "var(--occ-radius-sm)",
                      fontSize: "var(--occ-font-size-xs)",
                      backgroundColor: "var(--occ-bg-error)",
                      color: "var(--occ-color-error)",
                      fontWeight: "var(--occ-font-weight-medium)",
                    }}
                  >
                    {issue.severity.toUpperCase()}
                  </span>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "var(--occ-font-size-sm)",
                      fontWeight: "var(--occ-font-weight-medium)",
                      marginBottom: "var(--occ-space-1)",
                    }}
                  >
                    Immediate Actions:
                  </div>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: "var(--occ-space-4)",
                      fontSize: "var(--occ-font-size-sm)",
                    }}
                  >
                    {issue.immediateActions.map((action, index) => (
                      <li key={index}>{action}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AnalysisView({ analysis }: { analysis: PerformanceAnalysisResult }) {
  return (
    <div>
      <h3 style={{ margin: 0, marginBottom: "var(--occ-space-3)" }}>
        Detailed Performance Analysis
      </h3>

      {/* Performance Trends */}
      {analysis.performanceTrends.length > 0 && (
        <div style={{ marginBottom: "var(--occ-space-4)" }}>
          <h4 style={{ margin: 0, marginBottom: "var(--occ-space-2)" }}>
            Performance Trends
          </h4>
          <div style={{ display: "grid", gap: "var(--occ-space-2)" }}>
            {analysis.performanceTrends.map((trend, index) => (
              <div
                key={index}
                style={{
                  padding: "var(--occ-space-3)",
                  border: "1px solid var(--occ-border-default)",
                  borderRadius: "var(--occ-radius-md)",
                  backgroundColor: "var(--occ-bg-surface)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div
                      style={{ fontWeight: "var(--occ-font-weight-medium)" }}
                    >
                      {trend.metric}
                    </div>
                    <div
                      style={{
                        fontSize: "var(--occ-font-size-sm)",
                        color: "var(--occ-text-secondary)",
                      }}
                    >
                      {trend.timeframe}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: "var(--occ-font-size-lg)",
                        fontWeight: "var(--occ-font-weight-semibold)",
                        color:
                          trend.change > 0
                            ? "var(--occ-color-success)"
                            : "var(--occ-color-error)",
                      }}
                    >
                      {trend.change > 0 ? "+" : ""}
                      {trend.change.toFixed(1)}%
                    </div>
                    <div
                      style={{
                        fontSize: "var(--occ-font-size-sm)",
                        color: "var(--occ-text-secondary)",
                      }}
                    >
                      {trend.trend}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Details */}
      <div>
        <h4 style={{ margin: 0, marginBottom: "var(--occ-space-2)" }}>
          Category Details
        </h4>
        <div style={{ display: "grid", gap: "var(--occ-space-3)" }}>
          {Object.entries(analysis.categories).map(([category, data]) => (
            <div
              key={category}
              style={{
                padding: "var(--occ-space-4)",
                border: "1px solid var(--occ-border-default)",
                borderRadius: "var(--occ-radius-md)",
                backgroundColor: "var(--occ-bg-surface)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "var(--occ-space-3)",
                }}
              >
                <h5 style={{ margin: 0, textTransform: "capitalize" }}>
                  {category} Performance
                </h5>
                <div
                  style={{
                    fontSize: "var(--occ-font-size-2xl)",
                    fontWeight: "var(--occ-font-weight-bold)",
                    color:
                      data.score >= 80
                        ? "var(--occ-color-success)"
                        : data.score >= 60
                          ? "var(--occ-color-warning)"
                          : "var(--occ-color-error)",
                  }}
                >
                  {data.score}
                </div>
              </div>

              {/* Metrics Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "var(--occ-space-3)",
                  marginBottom: "var(--occ-space-3)",
                }}
              >
                <MetricCard
                  title="Response Time"
                  value={`${data.metrics.responseTime.toFixed(0)}ms`}
                />
                <MetricCard
                  title="Throughput"
                  value={`${data.metrics.throughput.toFixed(0)}/s`}
                />
                <MetricCard
                  title="Error Rate"
                  value={`${data.metrics.errorRate.toFixed(1)}%`}
                />
                <MetricCard
                  title="Resource Usage"
                  value={`${data.metrics.resourceUsage.toFixed(0)}%`}
                />
              </div>

              {/* Bottlenecks */}
              {data.bottlenecks.length > 0 && (
                <div>
                  <h6 style={{ margin: 0, marginBottom: "var(--occ-space-2)" }}>
                    Bottlenecks
                  </h6>
                  <div style={{ display: "grid", gap: "var(--occ-space-2)" }}>
                    {data.bottlenecks.map((bottleneck) => (
                      <div
                        key={bottleneck.id}
                        style={{
                          padding: "var(--occ-space-2)",
                          border: "1px solid var(--occ-border-warning)",
                          borderRadius: "var(--occ-radius-sm)",
                          backgroundColor: "var(--occ-bg-warning-subdued)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "start",
                            marginBottom: "var(--occ-space-1)",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontWeight: "var(--occ-font-weight-medium)",
                              }}
                            >
                              {bottleneck.description}
                            </div>
                            <div
                              style={{
                                fontSize: "var(--occ-font-size-sm)",
                                color: "var(--occ-text-secondary)",
                              }}
                            >
                              Impact: {bottleneck.impact}% • Solution:{" "}
                              {bottleneck.solution}
                            </div>
                          </div>
                          <span
                            style={{
                              padding: "var(--occ-space-1) var(--occ-space-2)",
                              borderRadius: "var(--occ-radius-sm)",
                              fontSize: "var(--occ-font-size-xs)",
                              backgroundColor:
                                bottleneck.severity === "critical"
                                  ? "var(--occ-bg-error)"
                                  : "var(--occ-bg-warning)",
                              color:
                                bottleneck.severity === "critical"
                                  ? "var(--occ-color-error)"
                                  : "var(--occ-color-warning)",
                              fontWeight: "var(--occ-font-weight-medium)",
                            }}
                          >
                            {bottleneck.severity.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Optimizations */}
              {data.optimizations.length > 0 && (
                <div>
                  <h6 style={{ margin: 0, marginBottom: "var(--occ-space-2)" }}>
                    Optimizations
                  </h6>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: "var(--occ-space-4)",
                      fontSize: "var(--occ-font-size-sm)",
                    }}
                  >
                    {data.optimizations.map((optimization, index) => (
                      <li
                        key={index}
                        style={{ marginBottom: "var(--occ-space-1)" }}
                      >
                        {optimization}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OptimizationView({ optimization }: { optimization: OptimizerResult }) {
  return (
    <div>
      <h3 style={{ margin: 0, marginBottom: "var(--occ-space-3)" }}>
        Optimization Results
      </h3>

      {/* Optimization Summary */}
      <div style={{ marginBottom: "var(--occ-space-4)" }}>
        <div
          style={{
            padding: "var(--occ-space-4)",
            border: "1px solid var(--occ-border-success)",
            borderRadius: "var(--occ-radius-md)",
            backgroundColor: "var(--occ-bg-success-subdued)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "var(--occ-font-size-4xl)",
              fontWeight: "var(--occ-font-weight-bold)",
              color: "var(--occ-color-success)",
              marginBottom: "var(--occ-space-2)",
            }}
          >
            {optimization.success ? "✅" : "❌"}
          </div>
          <div
            style={{
              fontSize: "var(--occ-font-size-lg)",
              fontWeight: "var(--occ-font-weight-semibold)",
              marginBottom: "var(--occ-space-1)",
            }}
          >
            {optimization.success
              ? "Optimization Successful"
              : "Optimization Failed"}
          </div>
          <div
            style={{
              fontSize: "var(--occ-font-size-sm)",
              color: "var(--occ-text-secondary)",
            }}
          >
            {optimization.optimizationsApplied.length} optimizations applied
          </div>
        </div>
      </div>

      {/* Performance Gains */}
      <div style={{ marginBottom: "var(--occ-space-4)" }}>
        <h4 style={{ margin: 0, marginBottom: "var(--occ-space-2)" }}>
          Performance Gains
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "var(--occ-space-3)",
          }}
        >
          <MetricCard
            title="Overall"
            value={`+${optimization.performanceGains.overall}%`}
          />
          <MetricCard
            title="Database"
            value={`+${optimization.performanceGains.database}%`}
          />
          <MetricCard
            title="API"
            value={`+${optimization.performanceGains.api}%`}
          />
          <MetricCard
            title="Frontend"
            value={`+${optimization.performanceGains.frontend}%`}
          />
          <MetricCard
            title="Caching"
            value={`+${optimization.performanceGains.caching}%`}
          />
          <MetricCard
            title="Analytics"
            value={`+${optimization.performanceGains.analytics}%`}
          />
        </div>
      </div>

      {/* Applied Optimizations */}
      {optimization.optimizationsApplied.length > 0 && (
        <div style={{ marginBottom: "var(--occ-space-4)" }}>
          <h4 style={{ margin: 0, marginBottom: "var(--occ-space-2)" }}>
            Applied Optimizations
          </h4>
          <div style={{ display: "grid", gap: "var(--occ-space-2)" }}>
            {optimization.optimizationsApplied.map((optimization, index) => (
              <div
                key={index}
                style={{
                  padding: "var(--occ-space-3)",
                  border: "1px solid var(--occ-border-success)",
                  borderRadius: "var(--occ-radius-md)",
                  backgroundColor: "var(--occ-bg-success-subdued)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--occ-space-2)",
                  }}
                >
                  <span style={{ color: "var(--occ-color-success)" }}>✅</span>
                  <span style={{ fontWeight: "var(--occ-font-weight-medium)" }}>
                    {optimization}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optimization Log */}
      {optimization.evidence.optimizationLog.length > 0 && (
        <div>
          <h4 style={{ margin: 0, marginBottom: "var(--occ-space-2)" }}>
            Optimization Log
          </h4>
          <div
            style={{
              padding: "var(--occ-space-3)",
              border: "1px solid var(--occ-border-default)",
              borderRadius: "var(--occ-radius-md)",
              backgroundColor: "var(--occ-bg-surface)",
              fontFamily: "monospace",
              fontSize: "var(--occ-font-size-sm)",
            }}
          >
            {optimization.evidence.optimizationLog.map((log, index) => (
              <div key={index} style={{ marginBottom: "var(--occ-space-1)" }}>
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RecommendationsView({
  analysis,
}: {
  analysis: PerformanceAnalysisResult;
}) {
  return (
    <div>
      <h3 style={{ margin: 0, marginBottom: "var(--occ-space-3)" }}>
        Optimization Recommendations
      </h3>

      <div style={{ display: "grid", gap: "var(--occ-space-3)" }}>
        {analysis.recommendations.map((recommendation) => (
          <div
            key={recommendation.id}
            style={{
              padding: "var(--occ-space-4)",
              border: "1px solid var(--occ-border-default)",
              borderRadius: "var(--occ-radius-md)",
              backgroundColor: "var(--occ-bg-surface)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
                marginBottom: "var(--occ-space-3)",
              }}
            >
              <div>
                <h4 style={{ margin: 0, marginBottom: "var(--occ-space-1)" }}>
                  {recommendation.title}
                </h4>
                <p
                  style={{
                    margin: 0,
                    color: "var(--occ-text-secondary)",
                    fontSize: "var(--occ-font-size-sm)",
                  }}
                >
                  {recommendation.description}
                </p>
              </div>
              <div style={{ display: "flex", gap: "var(--occ-space-2)" }}>
                <span
                  style={{
                    padding: "var(--occ-space-1) var(--occ-space-2)",
                    borderRadius: "var(--occ-radius-sm)",
                    fontSize: "var(--occ-font-size-xs)",
                    backgroundColor:
                      recommendation.priority === "critical"
                        ? "var(--occ-bg-error)"
                        : recommendation.priority === "high"
                          ? "var(--occ-bg-warning)"
                          : "var(--occ-bg-info)",
                    color:
                      recommendation.priority === "critical"
                        ? "var(--occ-color-error)"
                        : recommendation.priority === "high"
                          ? "var(--occ-color-warning)"
                          : "var(--occ-color-info)",
                    fontWeight: "var(--occ-font-weight-medium)",
                  }}
                >
                  {recommendation.priority.toUpperCase()}
                </span>
                <span
                  style={{
                    padding: "var(--occ-space-1) var(--occ-space-2)",
                    borderRadius: "var(--occ-radius-sm)",
                    fontSize: "var(--occ-font-size-xs)",
                    backgroundColor: "var(--occ-bg-subdued)",
                    color: "var(--occ-text-secondary)",
                    fontWeight: "var(--occ-font-weight-medium)",
                  }}
                >
                  {recommendation.category.toUpperCase()}
                </span>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "var(--occ-space-3)",
                marginBottom: "var(--occ-space-3)",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "var(--occ-font-size-sm)",
                    fontWeight: "var(--occ-font-weight-medium)",
                    marginBottom: "var(--occ-space-1)",
                  }}
                >
                  Expected Impact
                </div>
                <div
                  style={{
                    fontSize: "var(--occ-font-size-lg)",
                    fontWeight: "var(--occ-font-weight-semibold)",
                    color: "var(--occ-color-success)",
                  }}
                >
                  +{recommendation.impact}%
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "var(--occ-font-size-sm)",
                    fontWeight: "var(--occ-font-weight-medium)",
                    marginBottom: "var(--occ-space-1)",
                  }}
                >
                  Implementation Effort
                </div>
                <div
                  style={{
                    fontSize: "var(--occ-font-size-lg)",
                    fontWeight: "var(--occ-font-weight-semibold)",
                  }}
                >
                  {recommendation.effort.toUpperCase()}
                </div>
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: "var(--occ-font-size-sm)",
                  fontWeight: "var(--occ-font-weight-medium)",
                  marginBottom: "var(--occ-space-2)",
                }}
              >
                Implementation Steps:
              </div>
              <ol
                style={{
                  margin: 0,
                  paddingLeft: "var(--occ-space-4)",
                  fontSize: "var(--occ-font-size-sm)",
                }}
              >
                {recommendation.implementation.steps.map((step, index) => (
                  <li
                    key={index}
                    style={{ marginBottom: "var(--occ-space-1)" }}
                  >
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MonitoringView({ analysis }: { analysis: PerformanceAnalysisResult }) {
  return (
    <div>
      <h3 style={{ margin: 0, marginBottom: "var(--occ-space-3)" }}>
        Real-time Monitoring
      </h3>

      <div
        style={{
          padding: "var(--occ-space-4)",
          border: "1px solid var(--occ-border-info)",
          borderRadius: "var(--occ-radius-md)",
          backgroundColor: "var(--occ-bg-info-subdued)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "var(--occ-font-size-2xl)",
            marginBottom: "var(--occ-space-2)",
          }}
        >
          📊
        </div>
        <div
          style={{
            fontSize: "var(--occ-font-size-lg)",
            fontWeight: "var(--occ-font-weight-semibold)",
            marginBottom: "var(--occ-space-1)",
          }}
        >
          Monitoring Dashboard
        </div>
        <div
          style={{
            fontSize: "var(--occ-font-size-sm)",
            color: "var(--occ-text-secondary)",
          }}
        >
          Real-time performance monitoring and alerting system
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <div
      style={{
        padding: "var(--occ-space-3)",
        border: "1px solid var(--occ-border-default)",
        borderRadius: "var(--occ-radius-md)",
        backgroundColor: "var(--occ-bg-surface)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: "var(--occ-font-size-sm)",
          color: "var(--occ-text-secondary)",
          marginBottom: "var(--occ-space-1)",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: "var(--occ-font-size-lg)",
          fontWeight: "var(--occ-font-weight-semibold)",
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default PerformanceOptimizationDashboard;

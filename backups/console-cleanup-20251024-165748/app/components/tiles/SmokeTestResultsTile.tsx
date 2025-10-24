/**
 * Smoke Test Results Tile
 * 
 * Displays recent smoke test results and health status.
 */

import type { ReactNode } from "react";

export interface SmokeTestResult {
  timestamp: string;
  environment: string;
  passed: number;
  failed: number;
  skipped: number;
  total: number;
  duration: number;
  status: "healthy" | "degraded" | "unhealthy";
}

export interface SmokeTestData {
  latest: SmokeTestResult;
  history: SmokeTestResult[];
  trends: {
    passRate: number;
    avgDuration: number;
    failureRate: number;
  };
}

interface SmokeTestResultsTileProps {
  data: SmokeTestData;
}

export function SmokeTestResultsTile({ data }: SmokeTestResultsTileProps) {
  const { latest, trends } = data;
  
  const passRate = latest.total > 0 
    ? ((latest.passed / latest.total) * 100).toFixed(1)
    : "0.0";
  
  const statusColor = 
    latest.status === "healthy" ? "var(--occ-status-success)" :
    latest.status === "degraded" ? "var(--occ-status-warning)" :
    "var(--occ-status-critical)";
  
  const statusIcon = 
    latest.status === "healthy" ? "✅" :
    latest.status === "degraded" ? "⚠️" :
    "❌";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--occ-space-3)" }}>
      {/* Status Header */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "var(--occ-space-2)",
        padding: "var(--occ-space-2)",
        backgroundColor: "var(--occ-surface-subdued)",
        borderRadius: "var(--occ-border-radius)",
      }}>
        <span style={{ fontSize: "24px" }}>{statusIcon}</span>
        <div>
          <div style={{ 
            fontSize: "var(--occ-font-size-lg)", 
            fontWeight: "var(--occ-font-weight-semibold)",
            color: statusColor,
          }}>
            {latest.status.charAt(0).toUpperCase() + latest.status.slice(1)}
          </div>
          <div style={{ 
            fontSize: "var(--occ-font-size-sm)", 
            color: "var(--occ-text-secondary)" 
          }}>
            {latest.environment} • {new Date(latest.timestamp).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(2, 1fr)", 
        gap: "var(--occ-space-2)" 
      }}>
        <MetricBox
          label="Pass Rate"
          value={`${passRate}%`}
          trend={trends.passRate >= 95 ? "up" : "down"}
        />
        <MetricBox
          label="Duration"
          value={`${(latest.duration / 1000).toFixed(1)}s`}
          subtitle={`Avg: ${(trends.avgDuration / 1000).toFixed(1)}s`}
        />
        <MetricBox
          label="Passed"
          value={latest.passed.toString()}
          color="var(--occ-status-success)"
        />
        <MetricBox
          label="Failed"
          value={latest.failed.toString()}
          color={latest.failed > 0 ? "var(--occ-status-critical)" : "var(--occ-text-secondary)"}
        />
      </div>

      {/* Test Breakdown */}
      <div style={{ 
        padding: "var(--occ-space-2)",
        backgroundColor: "var(--occ-surface-subdued)",
        borderRadius: "var(--occ-border-radius)",
      }}>
        <div style={{ 
          fontSize: "var(--occ-font-size-sm)", 
          fontWeight: "var(--occ-font-weight-semibold)",
          marginBottom: "var(--occ-space-1)",
        }}>
          Test Summary
        </div>
        <div style={{ 
          display: "flex", 
          gap: "var(--occ-space-2)",
          fontSize: "var(--occ-font-size-sm)",
        }}>
          <span>Total: {latest.total}</span>
          <span>•</span>
          <span style={{ color: "var(--occ-status-success)" }}>
            ✓ {latest.passed}
          </span>
          {latest.failed > 0 && (
            <>
              <span>•</span>
              <span style={{ color: "var(--occ-status-critical)" }}>
                ✗ {latest.failed}
              </span>
            </>
          )}
          {latest.skipped > 0 && (
            <>
              <span>•</span>
              <span style={{ color: "var(--occ-text-secondary)" }}>
                ⊘ {latest.skipped}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Trends */}
      {data.history.length > 1 && (
        <div style={{ 
          fontSize: "var(--occ-font-size-sm)",
          color: "var(--occ-text-secondary)",
        }}>
          <div>
            Failure rate (7d): {(trends.failureRate * 100).toFixed(1)}%
          </div>
          <div>
            Last {data.history.length} runs tracked
          </div>
        </div>
      )}
    </div>
  );
}

interface MetricBoxProps {
  label: string;
  value: string;
  subtitle?: string;
  trend?: "up" | "down";
  color?: string;
}

function MetricBox({ label, value, subtitle, trend, color }: MetricBoxProps) {
  return (
    <div style={{ 
      padding: "var(--occ-space-2)",
      backgroundColor: "var(--occ-surface-subdued)",
      borderRadius: "var(--occ-border-radius)",
    }}>
      <div style={{ 
        fontSize: "var(--occ-font-size-sm)", 
        color: "var(--occ-text-secondary)",
        marginBottom: "var(--occ-space-1)",
      }}>
        {label}
      </div>
      <div style={{ 
        fontSize: "var(--occ-font-size-xl)", 
        fontWeight: "var(--occ-font-weight-semibold)",
        color: color || "var(--occ-text-primary)",
        display: "flex",
        alignItems: "center",
        gap: "var(--occ-space-1)",
      }}>
        {value}
        {trend && (
          <span style={{ fontSize: "var(--occ-font-size-sm)" }}>
            {trend === "up" ? "↑" : "↓"}
          </span>
        )}
      </div>
      {subtitle && (
        <div style={{ 
          fontSize: "var(--occ-font-size-xs)", 
          color: "var(--occ-text-secondary)",
          marginTop: "var(--occ-space-1)",
        }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}


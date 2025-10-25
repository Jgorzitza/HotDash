/**
 * Performance Monitor Component
 *
 * Displays real-time performance metrics for Growth Engine phases 9-12
 * including load times, memory usage, and optimization recommendations.
 */

import React, { useState, useEffect } from "react";
import { usePerformanceMonitoring } from "~/services/performance/dashboardOptimization";

interface PerformanceMonitorProps {
  showDetails?: boolean;
  position?: "top-right" | "bottom-right" | "bottom-left";
}

export function PerformanceMonitor({ 
  showDetails = false, 
  position = "bottom-right" 
}: PerformanceMonitorProps) {
  const { summary, clearCache } = usePerformanceMonitoring();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Show performance monitor in development or when explicitly enabled
  useEffect(() => {
    const shouldShow = process.env.NODE_ENV === "development" || 
                      localStorage.getItem("performance-monitor") === "enabled";
    setIsVisible(shouldShow);
  }, []);

  if (!isVisible) return null;

  const formatTime = (ms: number) => `${ms.toFixed(1)}ms`;
  const formatMemory = (mb: number) => `${mb.toFixed(1)}MB`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return "var(--occ-color-success)";
    if (value <= thresholds.warning) return "var(--occ-color-warning)";
    return "var(--occ-color-error)";
  };

  const positionStyles = {
    "top-right": { top: "var(--occ-space-4)", right: "var(--occ-space-4)" },
    "bottom-right": { bottom: "var(--occ-space-4)", right: "var(--occ-space-4)" },
    "bottom-left": { bottom: "var(--occ-space-4)", left: "var(--occ-space-4)" },
  };

  return (
    <div
      style={{
        position: "fixed",
        ...positionStyles[position],
        zIndex: 1000,
        backgroundColor: "var(--occ-bg-surface)",
        border: "1px solid var(--occ-border-default)",
        borderRadius: "var(--occ-radius-md)",
        padding: "var(--occ-space-3)",
        boxShadow: "var(--occ-shadow-lg)",
        minWidth: "200px",
        fontSize: "var(--occ-font-size-sm)",
      }}
    >
      {/* Header */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "var(--occ-space-2)"
      }}>
        <h4 style={{ margin: 0, fontSize: "var(--occ-font-size-sm)", fontWeight: "var(--occ-font-weight-medium)" }}>
          Performance Monitor
        </h4>
        <div style={{ display: "flex", gap: "var(--occ-space-1)" }}>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "var(--occ-font-size-xs)",
              color: "var(--occ-text-secondary)",
            }}
          >
            {isExpanded ? "−" : "+"}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "var(--occ-font-size-xs)",
              color: "var(--occ-text-secondary)",
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--occ-space-1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "var(--occ-text-secondary)" }}>Load Time:</span>
          <span style={{ 
            color: getPerformanceColor(summary.averageLoadTime, { good: 200, warning: 500 })
          }}>
            {formatTime(summary.averageLoadTime)}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "var(--occ-text-secondary)" }}>Memory:</span>
          <span style={{ 
            color: getPerformanceColor(summary.averageMemoryUsage, { good: 50, warning: 100 })
          }}>
            {formatMemory(summary.averageMemoryUsage)}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "var(--occ-text-secondary)" }}>Cache Hit:</span>
          <span style={{ 
            color: getPerformanceColor(100 - summary.averageCacheHitRate, { good: 20, warning: 50 })
          }}>
            {formatPercentage(summary.averageCacheHitRate)}
          </span>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div style={{ 
          marginTop: "var(--occ-space-3)",
          paddingTop: "var(--occ-space-3)",
          borderTop: "1px solid var(--occ-border-subdued)"
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--occ-space-2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--occ-text-secondary)" }}>Render Time:</span>
              <span style={{ 
                color: getPerformanceColor(summary.averageRenderTime, { good: 16, warning: 33 })
              }}>
                {formatTime(summary.averageRenderTime)}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--occ-text-secondary)" }}>API Response:</span>
              <span style={{ 
                color: getPerformanceColor(summary.averageApiResponseTime, { good: 200, warning: 500 })
              }}>
                {formatTime(summary.averageApiResponseTime)}
              </span>
            </div>
            
            {/* Actions */}
            <div style={{ 
              marginTop: "var(--occ-space-2)",
              paddingTop: "var(--occ-space-2)",
              borderTop: "1px solid var(--occ-border-subdued)"
            }}>
              <button
                onClick={clearCache}
                style={{
                  width: "100%",
                  padding: "var(--occ-space-1) var(--occ-space-2)",
                  background: "var(--occ-bg-primary)",
                  color: "var(--occ-text-on-primary)",
                  border: "none",
                  borderRadius: "var(--occ-radius-sm)",
                  cursor: "pointer",
                  fontSize: "var(--occ-font-size-xs)",
                }}
              >
                Clear Cache
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Performance indicator for production
export function PerformanceIndicator() {
  const { summary } = usePerformanceMonitoring();
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    // Show indicator if performance is poor
    const isPoorPerformance = 
      summary.averageLoadTime > 1000 || 
      summary.averageMemoryUsage > 100 || 
      summary.averageCacheHitRate < 50;
    
    setShowIndicator(isPoorPerformance);
  }, [summary]);

  if (!showIndicator) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "var(--occ-space-4)",
        left: "var(--occ-space-4)",
        backgroundColor: "var(--occ-color-warning)",
        color: "var(--occ-text-on-warning)",
        padding: "var(--occ-space-2) var(--occ-space-3)",
        borderRadius: "var(--occ-radius-md)",
        fontSize: "var(--occ-font-size-sm)",
        fontWeight: "var(--occ-font-weight-medium)",
        zIndex: 1000,
        cursor: "pointer",
      }}
      onClick={() => {
        localStorage.setItem("performance-monitor", "enabled");
        window.location.reload();
      }}
    >
      ⚠️ Performance Issues Detected
    </div>
  );
}

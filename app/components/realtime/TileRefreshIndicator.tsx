/**
 * Tile Refresh Indicator Component
 * 
 * Shows when tile was last updated and refresh status:
 * - "Updated X ago" timestamp
 * - Pulse animation on refresh
 * - Manual refresh button
 * - Auto-refresh progress bar (optional)
 * 
 * Phase 5 - ENG-025
 */

import { useEffect, useState } from "react";

interface TileRefreshIndicatorProps {
  lastUpdated: string | Date;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  autoRefreshInterval?: number; // in seconds
}

export function TileRefreshIndicator({
  lastUpdated,
  isRefreshing = false,
  onRefresh,
  autoRefreshInterval,
}: TileRefreshIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState("");
  const [progress, setProgress] = useState(0);

  // Update "X ago" timestamp every second
  useEffect(() => {
    const updateTimeAgo = () => {
      const now = new Date();
      const then = new Date(lastUpdated);
      const diffMs = now.getTime() - then.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);

      if (diffSeconds < 5) {
        setTimeAgo("Just now");
      } else if (diffSeconds < 60) {
        setTimeAgo(`${diffSeconds}s ago`);
      } else if (diffMinutes < 60) {
        setTimeAgo(`${diffMinutes}m ago`);
      } else {
        setTimeAgo(`${diffHours}h ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  // Auto-refresh progress
  useEffect(() => {
    if (!autoRefreshInterval) return;

    const startTime = new Date(lastUpdated).getTime();
    const intervalMs = autoRefreshInterval * 1000;

    const updateProgress = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progressPercent = Math.min((elapsed / intervalMs) * 100, 100);
      setProgress(progressPercent);
    };

    updateProgress();
    const interval = setInterval(updateProgress, 100);

    return () => clearInterval(interval);
  }, [lastUpdated, autoRefreshInterval]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--occ-space-3)",
        fontSize: "var(--occ-font-size-xs)",
        color: "var(--occ-text-secondary)",
      }}
    >
      {/* Pulse indicator */}
      {isRefreshing && (
        <div
          style={{
            width: "12px",
            height: "12px",
            position: "relative",
          }}
        >
          <span
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: "var(--occ-color-info)",
              animation: "occ-pulse-ring 1.5s infinite",
            }}
          />
          <span
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: "var(--occ-color-info)",
            }}
          />
        </div>
      )}

      {/* Timestamp */}
      <span>Updated {timeAgo}</span>

      {/* Manual refresh button */}
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--occ-text-interactive)",
            cursor: isRefreshing ? "not-allowed" : "pointer",
            padding: "0",
            fontSize: "var(--occ-font-size-sm)",
            opacity: isRefreshing ? 0.5 : 1,
          }}
          aria-label="Refresh tile"
          title="Refresh now"
        >
          <span style={{ animation: isRefreshing ? "occ-rotate 1s linear infinite" : undefined }}>
            ↻
          </span>
        </button>
      )}

      {/* Auto-refresh progress bar */}
      {autoRefreshInterval && (
        <div
          style={{
            flex: 1,
            height: "2px",
            background: "var(--occ-border-default)",
            borderRadius: "1px",
            overflow: "hidden",
            maxWidth: "60px",
          }}
        >
          <div
            style={{
              height: "100%",
              background: "var(--occ-color-info)",
              width: `${progress}%`,
              transition: "width 0.1s linear",
            }}
          />
        </div>
      )}
    </div>
  );
}


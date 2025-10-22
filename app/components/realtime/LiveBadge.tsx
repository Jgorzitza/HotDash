/**
 * Live Badge Component
 *
 * Real-time updating badge for approval queue count
 * Updates via SSE without page reload
 *
 * Features:
 * - Pulse animation on update
 * - Color-coded by urgency (gray/blue/yellow/red)
 * - Accessible count announcement
 *
 * Phase 5 - ENG-024
 */

import { useEffect, useState } from "react";

interface LiveBadgeProps {
  count: number;
  label?: string;
  showPulse?: boolean;
}

export function LiveBadge({
  count,
  label = "Pending",
  showPulse = false,
}: LiveBadgeProps) {
  const [isPulsing, setIsPulsing] = useState(false);
  const [prevCount, setPrevCount] = useState(count);

  useEffect(() => {
    if (count !== prevCount) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 1000);
      setPrevCount(count);
      return () => clearTimeout(timer);
    }
  }, [count, prevCount]);

  const getTone = () => {
    if (count === 0) return "success";
    if (count < 5) return "info";
    if (count < 10) return "warning";
    return "critical";
  };

  const getBackgroundColor = () => {
    switch (getTone()) {
      case "success":
        return "#E3F9E5";
      case "info":
        return "#E8F5FA";
      case "warning":
        return "#FFFAF0";
      case "critical":
        return "#FFF4F4";
      default:
        return "#F6F6F7";
    }
  };

  const getTextColor = () => {
    switch (getTone()) {
      case "success":
        return "#1A7F37";
      case "info":
        return "#0078D4";
      case "warning":
        return "#916A00";
      case "critical":
        return "#D82C0D";
      default:
        return "#637381";
    }
  };

  const getBorderColor = () => {
    switch (getTone()) {
      case "success":
        return "#2E844A";
      case "info":
        return "#0078D4";
      case "warning":
        return "#FFBF47";
      case "critical":
        return "#E85C4A";
      default:
        return "#D2D5D8";
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`${count} ${label.toLowerCase()}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--occ-space-2)",
        padding: "var(--occ-space-1) var(--occ-space-3)",
        background: getBackgroundColor(),
        color: getTextColor(),
        border: `1px solid ${getBorderColor()}`,
        borderRadius: "var(--occ-radius-full)",
        fontSize: "var(--occ-font-size-sm)",
        fontWeight: "var(--occ-font-weight-semibold)",
        position: "relative",
        animation:
          isPulsing || showPulse ? "occ-pulse 1s ease-in-out" : undefined,
      }}
    >
      {count > 0 && (
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: getTextColor(),
            animation: showPulse ? "occ-pulse 2s infinite" : undefined,
          }}
        />
      )}
      <span>
        {count} {label}
      </span>
    </div>
  );
}

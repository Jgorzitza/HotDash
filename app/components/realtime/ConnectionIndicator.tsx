/**
 * Connection Status Indicator
 * 
 * Visual indicator for SSE connection status
 * Shows in top-right of dashboard
 * 
 * States:
 * - Connected: Green dot with pulse
 * - Connecting: Yellow dot
 * - Disconnected: Gray dot
 * - Error: Red dot
 * 
 * Phase 5 - ENG-023
 */

import type { ConnectionStatus } from "~/hooks/useSSE";

interface ConnectionIndicatorProps {
  status: ConnectionStatus;
  lastHeartbeat: Date | null;
}

export function ConnectionIndicator({ status, lastHeartbeat }: ConnectionIndicatorProps) {
  const getStatusColor = () => {
    switch (status) {
      case "connected":
        return "#008060";
      case "connecting":
        return "#FFBF47";
      case "error":
        return "#D72828";
      case "disconnected":
      default:
        return "#A0A0A0";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "connected":
        return "Live";
      case "connecting":
        return "Connecting...";
      case "error":
        return "Connection Error";
      case "disconnected":
        return "Offline";
      default:
        return "Unknown";
    }
  };

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--occ-space-2)",
        padding: "var(--occ-space-2) var(--occ-space-3)",
        background: "var(--occ-bg-secondary)",
        borderRadius: "var(--occ-radius-sm)",
        fontSize: "var(--occ-font-size-xs)",
      }}
      title={lastHeartbeat ? `Last heartbeat: ${lastHeartbeat.toLocaleTimeString()}` : undefined}
    >
      <span
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: getStatusColor(),
          animation: status === "connected" ? "occ-pulse 2s infinite" : undefined,
        }}
      />
      <span style={{ color: "var(--occ-text-secondary)" }}>{getStatusText()}</span>
    </div>
  );
}


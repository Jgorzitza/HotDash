/**
 * Connection Status Indicator Component
 *
 * Displays SSE connection status with visual indicators and quality metrics.
 * Shows connection quality, last message time, and reconnection status.
 */

import React from "react";

interface ConnectionStatusIndicatorProps {
  status: "connecting" | "connected" | "disconnected" | "error";
  connectionQuality: "excellent" | "good" | "poor" | "disconnected";
  lastMessage?: { timestamp: string } | null;
  lastHeartbeat?: Date | null;
  showDetails?: boolean;
  size?: "small" | "medium" | "large";
}

export function ConnectionStatusIndicator({
  status,
  connectionQuality,
  lastMessage,
  lastHeartbeat,
  showDetails = false,
  size = "medium",
}: ConnectionStatusIndicatorProps) {
  const getStatusColor = () => {
    switch (status) {
      case "connected":
        switch (connectionQuality) {
          case "excellent":
            return "var(--occ-color-success)";
          case "good":
            return "var(--occ-color-warning)";
          case "poor":
            return "var(--occ-color-error)";
          default:
            return "var(--occ-color-success)";
        }
      case "connecting":
        return "var(--occ-color-info)";
      case "error":
        return "var(--occ-color-error)";
      default:
        return "var(--occ-color-border-subdued)";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "connected":
        return `Connected (${connectionQuality})`;
      case "connecting":
        return "Connecting...";
      case "error":
        return "Connection Error";
      default:
        return "Disconnected";
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          width: "8px",
          height: "8px",
          fontSize: "var(--occ-font-size-xs)",
        };
      case "large":
        return {
          width: "16px",
          height: "16px",
          fontSize: "var(--occ-font-size-sm)",
        };
      default:
        return {
          width: "12px",
          height: "12px",
          fontSize: "var(--occ-font-size-xs)",
        };
    }
  };

  const formatLastMessage = () => {
    if (!lastMessage) return null;
    
    const now = new Date();
    const messageTime = new Date(lastMessage.timestamp);
    const diffMs = now.getTime() - messageTime.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);

    if (diffSeconds < 10) {
      return "Just now";
    } else if (diffSeconds < 60) {
      return `${diffSeconds}s ago`;
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else {
      return messageTime.toLocaleTimeString();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--occ-space-2)",
        fontSize: getSizeStyles().fontSize,
      }}
    >
      {/* Status Dot */}
      <div
        style={{
          position: "relative",
          ...getSizeStyles(),
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            backgroundColor: getStatusColor(),
            transition: "background-color 0.3s ease",
          }}
        />
        {status === "connecting" && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              backgroundColor: getStatusColor(),
              animation: "pulse 1.5s infinite",
            }}
          />
        )}
      </div>

      {/* Status Text */}
      <span
        style={{
          color: getStatusColor(),
          fontWeight: "var(--occ-font-weight-medium)",
        }}
      >
        {getStatusText()}
      </span>

      {/* Details */}
      {showDetails && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--occ-space-1)",
            fontSize: "var(--occ-font-size-xs)",
            color: "var(--occ-text-secondary)",
          }}
        >
          {lastMessage && (
            <span>Last message: {formatLastMessage()}</span>
          )}
          {lastHeartbeat && (
            <span>
              Heartbeat: {lastHeartbeat.toLocaleTimeString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// CSS Animation (to be added to global styles)
export const connectionStatusStyles = `
  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.2);
      opacity: 0.7;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

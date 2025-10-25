/**
 * Live Update Indicator Component
 *
 * Displays pulse animation and timestamp for live updates.
 * Used to show when tiles have been refreshed or updated.
 */
import React from "react";
export function LiveUpdateIndicator({ isUpdating = false, lastUpdated, size = "medium", showTimestamp = true, className = "", }) {
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
    const formatTimestamp = (date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffSeconds < 10) {
            return "Just now";
        }
        else if (diffSeconds < 60) {
            return `${diffSeconds}s ago`;
        }
        else if (diffMinutes < 60) {
            return `${diffMinutes}m ago`;
        }
        else if (diffHours < 24) {
            return `${diffHours}h ago`;
        }
        else {
            return date.toLocaleDateString();
        }
    };
    return (<div className={`live-update-indicator ${className}`} style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--occ-space-1)",
        }}>
      {/* Pulse Animation */}
      <div style={{
            position: "relative",
            ...getSizeStyles(),
        }}>
        <div style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            backgroundColor: isUpdating
                ? "var(--occ-color-success)"
                : "var(--occ-color-border-subdued)",
            transition: "background-color 0.3s ease",
        }}/>
        {isUpdating && (<div style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                backgroundColor: "var(--occ-color-success)",
                animation: "pulse 1.5s infinite",
            }}/>)}
      </div>

      {/* Timestamp */}
      {showTimestamp && lastUpdated && (<span style={{
                color: "var(--occ-text-secondary)",
                fontSize: getSizeStyles().fontSize,
                whiteSpace: "nowrap",
            }}>
          {formatTimestamp(lastUpdated)}
        </span>)}
    </div>);
}
// CSS Animation (to be added to global styles)
export const liveUpdateStyles = `
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

  .live-update-indicator {
    display: inline-flex;
    align-items: center;
    gap: var(--occ-space-1);
  }
`;
// Hook for managing live update state
export function useLiveUpdate() {
    const [isUpdating, setIsUpdating] = React.useState(false);
    const [lastUpdated, setLastUpdated] = React.useState(null);
    const startUpdate = React.useCallback(() => {
        setIsUpdating(true);
        setLastUpdated(new Date());
    }, []);
    const endUpdate = React.useCallback(() => {
        setIsUpdating(false);
    }, []);
    const updateComplete = React.useCallback(() => {
        setIsUpdating(false);
        setLastUpdated(new Date());
    }, []);
    return {
        isUpdating,
        lastUpdated,
        startUpdate,
        endUpdate,
        updateComplete,
    };
}
//# sourceMappingURL=LiveUpdateIndicator.js.map
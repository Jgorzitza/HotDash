/**
 * Banner Alerts Component
 *
 * Displays persistent page-level alerts for:
 * - Queue backlog (>10 pending approvals)
 * - Performance degradation (<70% approval rate)
 * - System health (service down/degraded)
 * - Connection status (offline/reconnecting)
 *
 * Phase 4 - ENG-012
 */

import { useState, useCallback } from "react";

export type BannerTone = "info" | "success" | "warning" | "critical";

export interface BannerAlert {
  id: string;
  tone: BannerTone;
  title: string;
  message: string;
  action?: {
    label: string;
    url: string;
  };
  dismissible?: boolean;
}

interface BannerAlertsProps {
  alerts: BannerAlert[];
  onDismiss?: (id: string) => void;
}

export function BannerAlerts({ alerts, onDismiss }: BannerAlertsProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const handleDismiss = useCallback(
    (id: string) => {
      setDismissed((prev) => new Set([...prev, id]));
      onDismiss?.(id);
    },
    [onDismiss],
  );

  const visibleAlerts = alerts.filter((alert) => !dismissed.has(alert.id));

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--occ-space-2)",
        marginBottom: "var(--occ-space-4)",
      }}
    >
      {visibleAlerts.map((alert) => (
        <Banner key={alert.id} alert={alert} onDismiss={handleDismiss} />
      ))}
    </div>
  );
}

interface BannerProps {
  alert: BannerAlert;
  onDismiss: (id: string) => void;
}

function Banner({ alert, onDismiss }: BannerProps) {
  const getBackgroundColor = () => {
    switch (alert.tone) {
      case "critical":
        return "#FFF4F4";
      case "warning":
        return "#FFFAF0";
      case "success":
        return "#E3F9E5";
      case "info":
        return "#E8F5FA";
      default:
        return "#F6F6F7";
    }
  };

  const getBorderColor = () => {
    switch (alert.tone) {
      case "critical":
        return "#D82C0D";
      case "warning":
        return "#FFBF47";
      case "success":
        return "#008060";
      case "info":
        return "#0078D4";
      default:
        return "#D2D5D8";
    }
  };

  const getTextColor = () => {
    switch (alert.tone) {
      case "critical":
        return "#D82C0D";
      case "warning":
        return "#916A00";
      case "success":
        return "#1A7F37";
      case "info":
        return "#0078D4";
      default:
        return "#202223";
    }
  };

  return (
    <div
      role="alert"
      style={{
        background: getBackgroundColor(),
        border: `1px solid ${getBorderColor()}`,
        borderLeft: `4px solid ${getBorderColor()}`,
        borderRadius: "var(--occ-radius-md)",
        padding: "var(--occ-space-4)",
        display: "flex",
        alignItems: "flex-start",
        gap: "var(--occ-space-3)",
      }}
    >
      <div style={{ flex: 1 }}>
        <h3
          style={{
            margin: 0,
            marginBottom: "var(--occ-space-2)",
            fontSize: "var(--occ-font-size-md)",
            fontWeight: "var(--occ-font-weight-semibold)",
            color: getTextColor(),
          }}
        >
          {alert.title}
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: "var(--occ-font-size-sm)",
            color: "var(--occ-text-primary)",
          }}
        >
          {alert.message}
        </p>
        {alert.action && (
          <a
            href={alert.action.url}
            style={{
              display: "inline-block",
              marginTop: "var(--occ-space-3)",
              color: getTextColor(),
              textDecoration: "underline",
              fontSize: "var(--occ-font-size-sm)",
              fontWeight: "var(--occ-font-weight-medium)",
            }}
          >
            {alert.action.label} →
          </a>
        )}
      </div>
      {alert.dismissible !== false && (
        <button
          onClick={() => onDismiss(alert.id)}
          style={{
            background: "transparent",
            border: "none",
            color: getTextColor(),
            cursor: "pointer",
            fontSize: "1.5rem",
            padding: "0",
            opacity: 0.6,
            flexShrink: 0,
          }}
          aria-label="Dismiss alert"
        >
          ×
        </button>
      )}
    </div>
  );
}

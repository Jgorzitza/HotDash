/**
 * Banner Alerts Hook
 * 
 * Monitors system state and generates banner alerts for:
 * - Queue backlog (>10 pending approvals)
 * - Performance degradation (<70% approval rate)
 * - System health (service down/degraded)
 * - Connection status (offline/reconnecting)
 * 
 * Phase 4 - ENG-012
 */

import { useMemo } from "react";
import type { BannerAlert } from "~/components/notifications/BannerAlerts";

export interface SystemStatus {
  queueDepth?: number;
  approvalRate?: number;
  serviceHealth?: "healthy" | "degraded" | "down";
  connectionStatus?: "online" | "offline" | "reconnecting";
}

export function useBannerAlerts(status: SystemStatus): BannerAlert[] {
  return useMemo(() => {
    const alerts: BannerAlert[] = [];

    // Queue backlog alert
    if (status.queueDepth !== undefined && status.queueDepth > 10) {
      alerts.push({
        id: "queue-backlog",
        tone: "warning",
        title: "Approval Queue Backlog",
        message: `${status.queueDepth} approvals pending. Consider reviewing high-priority items first.`,
        action: {
          label: "View Queue",
          url: "/approvals",
        },
        dismissible: true,
      });
    }

    // Performance degradation alert
    if (status.approvalRate !== undefined && status.approvalRate < 0.7) {
      alerts.push({
        id: "performance-degradation",
        tone: "critical",
        title: "Agent Performance Below Target",
        message: `Approval rate dropped to ${(status.approvalRate * 100).toFixed(1)}% (target: 80%+). Review recent rejections to identify issues.`,
        action: {
          label: "View Metrics",
          url: "/app/agent-metrics",
        },
        dismissible: true,
      });
    }

    // System health alerts
    if (status.serviceHealth === "degraded") {
      alerts.push({
        id: "service-degraded",
        tone: "warning",
        title: "Agent Service Degraded",
        message: "Response times are higher than normal. Monitoring the situation.",
        dismissible: true,
      });
    }

    if (status.serviceHealth === "down") {
      alerts.push({
        id: "service-down",
        tone: "critical",
        title: "Agent Service Unavailable",
        message: "Agent service is currently unavailable. Manual support required.",
        action: {
          label: "Contact Support",
          url: "mailto:customer.support@hotrodan.com",
        },
        dismissible: false, // Critical - don't allow dismissing
      });
    }

    // Connection status alerts
    if (status.connectionStatus === "offline") {
      alerts.push({
        id: "connection-offline",
        tone: "critical",
        title: "Connection Lost",
        message: "Check your internet connection. The app will automatically reconnect when online.",
        dismissible: false,
      });
    }

    if (status.connectionStatus === "reconnecting") {
      alerts.push({
        id: "connection-reconnecting",
        tone: "info",
        title: "Reconnecting...",
        message: "Attempting to restore connection to server.",
        dismissible: false,
      });
    }

    return alerts;
  }, [status]);
}


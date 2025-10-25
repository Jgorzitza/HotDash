/**
 * Banner Alert Component
 * 
 * ENG-070: Banner Alerts System
 * 
 * Polaris-based banner alert component for page-level notifications.
 * Supports 4 types of alerts with dismissible actions.
 * 
 * Alert Types:
 * 1. Queue backlog (>10 pending approvals)
 * 2. Performance degradation (<70% approval rate)
 * 3. System health (service down/degraded)
 * 4. Connection status (offline/reconnecting)
 * 
 * Features:
 * - Dismissible with action buttons
 * - Polaris Banner component integration
 * - Follows Complete Vision specifications
 * - Accessible (ARIA roles)
 */

import { Banner, Button } from "@shopify/polaris";
import { useState, useCallback } from "react";

export type BannerTone = "info" | "success" | "warning" | "critical";

export interface BannerAlertProps {
  id: string;
  tone: BannerTone;
  title: string;
  message?: string;
  action?: {
    label: string;
    onAction: () => void;
  };
  dismissible?: boolean;
  onDismiss?: (id: string) => void;
}

/**
 * Banner Alert Component using Polaris Banner
 * 
 * @param id - Unique identifier for the banner
 * @param tone - Banner tone (info, success, warning, critical)
 * @param title - Banner title
 * @param message - Optional banner message
 * @param action - Optional action button
 * @param dismissible - Whether banner can be dismissed (default: true)
 * @param onDismiss - Callback when banner is dismissed
 */
export function BannerAlert({
  id,
  tone,
  title,
  message,
  action,
  dismissible = true,
  onDismiss,
}: BannerAlertProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
    onDismiss?.(id);
  }, [id, onDismiss]);

  if (isDismissed) return null;

  return (
    <Banner
      title={title}
      tone={tone}
      action={action}
      onDismiss={dismissible ? handleDismiss : undefined}
    >
      {message && <p>{message}</p>}
    </Banner>
  );
}

/**
 * System Status Interface
 * Used to determine which banners to show
 */
export interface SystemStatus {
  queueDepth?: number;
  approvalRate?: number;
  serviceHealth?: "healthy" | "degraded" | "down";
  connectionStatus?: "online" | "offline" | "reconnecting";
}

/**
 * Generate banner alerts based on system status
 * 
 * @param status - Current system status
 * @returns Array of banner alert props
 */
export function generateBannerAlerts(status: SystemStatus): BannerAlertProps[] {
  const alerts: BannerAlertProps[] = [];

  // 1. Queue backlog banner (>10 pending)
  if (status.queueDepth !== undefined && status.queueDepth > 10) {
    alerts.push({
      id: "queue-backlog",
      tone: "warning",
      title: "Approval Queue Backlog",
      message: `${status.queueDepth} approvals pending. Consider reviewing high-priority items first.`,
      action: {
        label: "View Queue",
        onAction: () => {
          window.location.href = "/approvals";
        },
      },
      dismissible: true,
    });
  }

  // 2. Performance degradation banner (<70% approval rate)
  if (status.approvalRate !== undefined && status.approvalRate < 0.7) {
    const percentage = Math.round(status.approvalRate * 100);
    alerts.push({
      id: "performance-degradation",
      tone: "warning",
      title: "Low Approval Rate",
      message: `Current approval rate is ${percentage}%. Review approval criteria or increase automation confidence.`,
      action: {
        label: "View Analytics",
        onAction: () => {
          window.location.href = "/analytics";
        },
      },
      dismissible: true,
    });
  }

  // 3. System health banner (service down)
  if (status.serviceHealth === "down") {
    alerts.push({
      id: "system-health-down",
      tone: "critical",
      title: "Service Unavailable",
      message: "The approval service is currently down. Approvals cannot be processed at this time.",
      action: {
        label: "Check Status",
        onAction: () => {
          window.location.href = "/system-status";
        },
      },
      dismissible: false, // Critical alerts should not be dismissible
    });
  } else if (status.serviceHealth === "degraded") {
    alerts.push({
      id: "system-health-degraded",
      tone: "warning",
      title: "Service Degraded",
      message: "The approval service is experiencing issues. Some features may be slower than usual.",
      action: {
        label: "Check Status",
        onAction: () => {
          window.location.href = "/system-status";
        },
      },
      dismissible: true,
    });
  }

  // 4. Connection status banner (offline/reconnecting)
  if (status.connectionStatus === "offline") {
    alerts.push({
      id: "connection-offline",
      tone: "critical",
      title: "Connection Lost",
      message: "You are currently offline. Changes will not be saved until connection is restored.",
      action: {
        label: "Retry Connection",
        onAction: () => {
          window.location.reload();
        },
      },
      dismissible: false, // Critical connection issues should not be dismissible
    });
  } else if (status.connectionStatus === "reconnecting") {
    alerts.push({
      id: "connection-reconnecting",
      tone: "info",
      title: "Reconnecting...",
      message: "Attempting to restore connection. Please wait.",
      dismissible: false, // Don't allow dismissing while reconnecting
    });
  }

  return alerts;
}

/**
 * Banner Alerts Container
 * 
 * Renders multiple banner alerts in a stack
 */
export function BannerAlerts({
  alerts,
  onDismiss,
}: {
  alerts: BannerAlertProps[];
  onDismiss?: (id: string) => void;
}) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const handleDismiss = useCallback(
    (id: string) => {
      setDismissedIds((prev) => new Set([...prev, id]));
      onDismiss?.(id);
    },
    [onDismiss]
  );

  const visibleAlerts = alerts.filter((alert) => !dismissedIds.has(alert.id));

  if (visibleAlerts.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1rem" }}>
      {visibleAlerts.map((alert) => (
        <BannerAlert key={alert.id} {...alert} onDismiss={handleDismiss} />
      ))}
    </div>
  );
}

/**
 * Hook to use banner alerts with system status
 * 
 * @param status - Current system status
 * @returns Banner alerts based on status
 */
export function useBannerAlerts(status: SystemStatus) {
  return generateBannerAlerts(status);
}

/**
 * Example Usage:
 * 
 * // In a route component
 * import { BannerAlerts, useBannerAlerts } from "~/components/BannerAlert";
 * 
 * export default function Dashboard() {
 *   const { queueDepth, approvalRate, serviceHealth, connectionStatus } = useLoaderData();
 *   
 *   const alerts = useBannerAlerts({
 *     queueDepth,
 *     approvalRate,
 *     serviceHealth,
 *     connectionStatus,
 *   });
 *   
 *   return (
 *     <Page>
 *       <BannerAlerts alerts={alerts} />
 *       {/* rest of page content *\/}
 *     </Page>
 *   );
 * }
 * 
 * // Or use individual banners
 * <BannerAlert
 *   id="custom-alert"
 *   tone="warning"
 *   title="Custom Alert"
 *   message="This is a custom alert message"
 *   action={{
 *     label: "Take Action",
 *     onAction: () => console.log("Action clicked"),
 *   }}
 *   dismissible={true}
 * />
 */


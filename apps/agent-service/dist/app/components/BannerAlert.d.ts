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
export declare function BannerAlert({ id, tone, title, message, action, dismissible, onDismiss, }: BannerAlertProps): React.JSX.Element;
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
export declare function generateBannerAlerts(status: SystemStatus): BannerAlertProps[];
/**
 * Banner Alerts Container
 *
 * Renders multiple banner alerts in a stack
 */
export declare function BannerAlerts({ alerts, onDismiss, }: {
    alerts: BannerAlertProps[];
    onDismiss?: (id: string) => void;
}): React.JSX.Element;
/**
 * Hook to use banner alerts with system status
 *
 * @param status - Current system status
 * @returns Banner alerts based on status
 */
export declare function useBannerAlerts(status: SystemStatus): BannerAlertProps[];
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
//# sourceMappingURL=BannerAlert.d.ts.map
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
export declare function BannerAlerts({ alerts, onDismiss }: BannerAlertsProps): React.JSX.Element;
export {};
//# sourceMappingURL=BannerAlerts.d.ts.map
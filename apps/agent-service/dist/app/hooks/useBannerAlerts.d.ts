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
import type { BannerAlert } from "~/components/notifications/BannerAlerts";
export interface SystemStatus {
    queueDepth?: number;
    approvalRate?: number;
    serviceHealth?: "healthy" | "degraded" | "down";
    connectionStatus?: "online" | "offline" | "reconnecting";
}
export declare function useBannerAlerts(status: SystemStatus): BannerAlert[];
//# sourceMappingURL=useBannerAlerts.d.ts.map
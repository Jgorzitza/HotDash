/**
 * Server-Sent Events (SSE) Hook
 *
 * Manages real-time connection to server for live updates:
 * - Approval queue count updates
 * - Tile refresh notifications
 * - System status changes
 *
 * Features:
 * - Auto-reconnection with exponential backoff
 * - Connection status tracking
 * - Event type filtering
 * - Cleanup on unmount
 *
 * Phase 5 - ENG-023
 */
export type SSEEventType = "approval-update" | "tile-refresh" | "system-status" | "heartbeat" | "growth-engine-update" | "analytics-refresh" | "performance-alert" | "budget-alert";
export interface SSEMessage<T = Record<string, unknown>> {
    type: SSEEventType;
    data: T;
    timestamp: string;
}
export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";
export declare function useSSE(url: string, enabled?: boolean): {
    status: ConnectionStatus;
    lastMessage: SSEMessage<Record<string, unknown>>;
    lastHeartbeat: Date;
    connectionQuality: "excellent" | "good" | "poor" | "disconnected";
    isConnected: boolean;
    connect: () => void;
    disconnect: () => void;
};
//# sourceMappingURL=useSSE.d.ts.map
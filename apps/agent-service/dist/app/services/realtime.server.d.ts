/**
 * Real-Time Service
 *
 * Server-side utilities for real-time updates and SSE management
 *
 * Task: ENG-075
 */
export interface TileRefreshEvent {
    tileId: string;
    timestamp: string;
    data?: any;
}
export interface ApprovalUpdateEvent {
    pendingCount: number;
    hasNewApprovals: boolean;
    timestamp: string;
}
export interface SystemStatusEvent {
    status: 'healthy' | 'degraded' | 'unhealthy';
    message?: string;
    timestamp: string;
}
/**
 * Broadcast tile refresh event to all connected clients
 */
export declare function broadcastTileRefresh(tileId: string, data?: any): TileRefreshEvent;
/**
 * Broadcast approval queue update to all connected clients
 */
export declare function broadcastApprovalUpdate(pendingCount: number, hasNewApprovals: boolean): ApprovalUpdateEvent;
/**
 * Broadcast system status change to all connected clients
 */
export declare function broadcastSystemStatus(status: 'healthy' | 'degraded' | 'unhealthy', message?: string): SystemStatusEvent;
/**
 * Get auto-refresh interval for a tile based on its type
 */
export declare function getTileRefreshInterval(tileType: string): number;
/**
 * Check if a tile should auto-refresh
 */
export declare function shouldAutoRefresh(tileType: string): boolean;
/**
 * Format time ago string
 */
export declare function formatTimeAgo(date: Date | string): string;
/**
 * Calculate refresh progress percentage
 */
export declare function calculateRefreshProgress(lastUpdated: Date | string, interval: number): number;
//# sourceMappingURL=realtime.server.d.ts.map
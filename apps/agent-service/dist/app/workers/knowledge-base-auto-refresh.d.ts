/**
 * Knowledge Base Auto-Refresh Integration
 * AI-KB-REFRESH-001: Implement Knowledge Base Auto-Refresh
 *
 * Integrates file watcher with refresh service to provide
 * automatic knowledge base refresh when files change.
 *
 * Usage:
 * ```typescript
 * import { startAutoRefresh, stopAutoRefresh } from '~/workers/knowledge-base-auto-refresh';
 *
 * // Start auto-refresh
 * await startAutoRefresh();
 *
 * // Stop auto-refresh
 * await stopAutoRefresh();
 * ```
 *
 * @module app/workers/knowledge-base-auto-refresh
 */
/**
 * Configuration for auto-refresh
 */
export interface AutoRefreshConfig {
    /** Directory to watch (default: data/support) */
    watchPath?: string;
    /** Debounce delay in milliseconds (default: 5000) */
    debounceMs?: number;
    /** Whether to enable auto-refresh (default: true) */
    enabled?: boolean;
}
/**
 * Start automatic knowledge base refresh
 *
 * Watches the knowledge base directory and triggers refresh
 * when files are added, changed, or deleted.
 *
 * @param config - Auto-refresh configuration
 */
export declare function startAutoRefresh(config?: AutoRefreshConfig): Promise<void>;
/**
 * Stop automatic knowledge base refresh
 */
export declare function stopAutoRefresh(): Promise<void>;
/**
 * Get auto-refresh status
 */
export declare function getAutoRefreshStatus(): {
    isRunning: boolean;
    watcherStatus: import("./knowledge-base-watcher").WatcherStatus;
    refreshStatus: import("./knowledge-base-refresh").RefreshStatus;
};
/**
 * Check if auto-refresh is running
 */
export declare function isAutoRefreshRunning(): boolean;
//# sourceMappingURL=knowledge-base-auto-refresh.d.ts.map
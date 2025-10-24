/**
 * Knowledge Base File Watcher
 * AI-KB-REFRESH-001: Implement Knowledge Base Auto-Refresh
 *
 * Watches the knowledge base directory for changes and triggers
 * automatic refresh via LlamaIndex MCP server.
 *
 * Features:
 * - File system monitoring with chokidar
 * - Debounced refresh triggers
 * - Async processing without blocking
 * - Status tracking and logging
 *
 * @module app/workers/knowledge-base-watcher
 */
export interface WatcherConfig {
    /** Directory to watch for changes */
    watchPath: string;
    /** Debounce delay in milliseconds (default: 5000) */
    debounceMs?: number;
    /** Whether to watch for file additions */
    watchAdd?: boolean;
    /** Whether to watch for file changes */
    watchChange?: boolean;
    /** Whether to watch for file deletions */
    watchUnlink?: boolean;
    /** Callback function when refresh is triggered */
    onRefreshTriggered?: (files: string[]) => Promise<void>;
}
export interface WatcherStatus {
    isWatching: boolean;
    watchPath: string;
    filesWatched: number;
    lastRefreshTrigger?: Date;
    refreshCount: number;
    errorCount: number;
}
/**
 * Knowledge Base File Watcher
 *
 * Monitors the knowledge base directory and triggers refresh
 * when files are added, changed, or deleted.
 */
export declare class KnowledgeBaseWatcher {
    private watcher;
    private config;
    private status;
    private debounceTimer;
    private pendingFiles;
    constructor(config: WatcherConfig);
    /**
     * Start watching the knowledge base directory
     */
    start(): Promise<void>;
    /**
     * Stop watching the knowledge base directory
     */
    stop(): Promise<void>;
    /**
     * Get current watcher status
     */
    getStatus(): WatcherStatus;
    /**
     * Handle file system events
     */
    private handleFileEvent;
    /**
     * Trigger knowledge base refresh
     */
    private triggerRefresh;
    /**
     * Handle watcher errors
     */
    private handleError;
}
/**
 * Create and start a knowledge base watcher
 */
export declare function createKnowledgeBaseWatcher(config: WatcherConfig): Promise<KnowledgeBaseWatcher>;
//# sourceMappingURL=knowledge-base-watcher.d.ts.map
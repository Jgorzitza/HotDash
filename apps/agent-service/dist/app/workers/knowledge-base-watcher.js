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
import chokidar from 'chokidar';
import path from 'node:path';
import { logDecision } from '~/services/decisions.server';
/**
 * Knowledge Base File Watcher
 *
 * Monitors the knowledge base directory and triggers refresh
 * when files are added, changed, or deleted.
 */
export class KnowledgeBaseWatcher {
    watcher = null;
    config;
    status;
    debounceTimer = null;
    pendingFiles = new Set();
    constructor(config) {
        this.config = {
            debounceMs: 5000,
            watchAdd: true,
            watchChange: true,
            watchUnlink: true,
            onRefreshTriggered: async () => { },
            ...config,
        };
        this.status = {
            isWatching: false,
            watchPath: this.config.watchPath,
            filesWatched: 0,
            refreshCount: 0,
            errorCount: 0,
        };
    }
    /**
     * Start watching the knowledge base directory
     */
    async start() {
        if (this.watcher) {
            console.log('[KB Watcher] Already watching');
            return;
        }
        console.log(`[KB Watcher] Starting watcher for: ${this.config.watchPath}`);
        // Initialize chokidar watcher
        this.watcher = chokidar.watch(this.config.watchPath, {
            ignored: /(^|[\/\\])\../, // Ignore dotfiles
            persistent: true,
            ignoreInitial: true, // Don't trigger on initial scan
            awaitWriteFinish: {
                stabilityThreshold: 2000,
                pollInterval: 100,
            },
        });
        // Set up event handlers
        if (this.config.watchAdd) {
            this.watcher.on('add', (filePath) => this.handleFileEvent('add', filePath));
        }
        if (this.config.watchChange) {
            this.watcher.on('change', (filePath) => this.handleFileEvent('change', filePath));
        }
        if (this.config.watchUnlink) {
            this.watcher.on('unlink', (filePath) => this.handleFileEvent('unlink', filePath));
        }
        this.watcher.on('error', (error) => this.handleError(error));
        this.watcher.on('ready', () => {
            const watched = this.watcher?.getWatched();
            const fileCount = watched ? Object.values(watched).flat().length : 0;
            this.status.filesWatched = fileCount;
            this.status.isWatching = true;
            console.log(`[KB Watcher] Ready - watching ${fileCount} files`);
            // Log startup to decision log
            logDecision({
                scope: 'build',
                actor: 'ai-knowledge',
                action: 'kb_watcher_started',
                rationale: `Knowledge base file watcher started for ${this.config.watchPath}`,
                payload: {
                    watchPath: this.config.watchPath,
                    filesWatched: fileCount,
                    config: {
                        debounceMs: this.config.debounceMs,
                        watchAdd: this.config.watchAdd,
                        watchChange: this.config.watchChange,
                        watchUnlink: this.config.watchUnlink,
                    },
                },
            }).catch(console.error);
        });
    }
    /**
     * Stop watching the knowledge base directory
     */
    async stop() {
        if (!this.watcher) {
            return;
        }
        console.log('[KB Watcher] Stopping watcher');
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }
        await this.watcher.close();
        this.watcher = null;
        this.status.isWatching = false;
        // Log shutdown to decision log
        await logDecision({
            scope: 'build',
            actor: 'ai-knowledge',
            action: 'kb_watcher_stopped',
            rationale: 'Knowledge base file watcher stopped',
            payload: {
                refreshCount: this.status.refreshCount,
                errorCount: this.status.errorCount,
            },
        });
    }
    /**
     * Get current watcher status
     */
    getStatus() {
        return { ...this.status };
    }
    /**
     * Handle file system events
     */
    handleFileEvent(event, filePath) {
        // Only watch markdown files
        if (!filePath.endsWith('.md')) {
            return;
        }
        console.log(`[KB Watcher] File ${event}: ${filePath}`);
        this.pendingFiles.add(filePath);
        // Clear existing debounce timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        // Set new debounce timer
        this.debounceTimer = setTimeout(() => {
            this.triggerRefresh();
        }, this.config.debounceMs);
    }
    /**
     * Trigger knowledge base refresh
     */
    async triggerRefresh() {
        const files = Array.from(this.pendingFiles);
        this.pendingFiles.clear();
        this.debounceTimer = null;
        if (files.length === 0) {
            return;
        }
        console.log(`[KB Watcher] Triggering refresh for ${files.length} file(s)`);
        this.status.lastRefreshTrigger = new Date();
        this.status.refreshCount++;
        try {
            // Call the refresh callback
            await this.config.onRefreshTriggered(files);
            // Log successful refresh trigger
            await logDecision({
                scope: 'build',
                actor: 'ai-knowledge',
                action: 'kb_refresh_triggered',
                rationale: `Knowledge base refresh triggered by ${files.length} file change(s)`,
                payload: {
                    files: files.map(f => path.relative(this.config.watchPath, f)),
                    refreshCount: this.status.refreshCount,
                },
            });
        }
        catch (error) {
            this.status.errorCount++;
            console.error('[KB Watcher] Error triggering refresh:', error);
            // Log error (without status field to avoid constraint violation)
            await logDecision({
                scope: 'build',
                actor: 'ai-knowledge',
                action: 'kb_refresh_error',
                rationale: `Error triggering knowledge base refresh: ${error.message}`,
                payload: {
                    files: files.map(f => path.relative(this.config.watchPath, f)),
                    error: error.message,
                    errorCount: this.status.errorCount,
                },
            });
        }
    }
    /**
     * Handle watcher errors
     */
    handleError(error) {
        this.status.errorCount++;
        console.error('[KB Watcher] Watcher error:', error);
        logDecision({
            scope: 'build',
            actor: 'ai-knowledge',
            action: 'kb_watcher_error',
            rationale: `Knowledge base watcher error: ${error.message}`,
            payload: {
                error: error.message,
                errorCount: this.status.errorCount,
            },
        }).catch(console.error);
    }
}
/**
 * Create and start a knowledge base watcher
 */
export async function createKnowledgeBaseWatcher(config) {
    const watcher = new KnowledgeBaseWatcher(config);
    await watcher.start();
    return watcher;
}
//# sourceMappingURL=knowledge-base-watcher.js.map
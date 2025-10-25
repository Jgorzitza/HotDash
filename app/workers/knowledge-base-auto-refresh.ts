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

import path from 'node:path';
import { createKnowledgeBaseWatcher, type KnowledgeBaseWatcher } from './knowledge-base-watcher';
import { getRefreshService } from './knowledge-base-refresh';
import { logDecision } from '~/services/decisions.server';

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
 * Auto-refresh state
 */
let watcher: KnowledgeBaseWatcher | null = null;
let isRunning: boolean = false;

/**
 * Start automatic knowledge base refresh
 * 
 * Watches the knowledge base directory and triggers refresh
 * when files are added, changed, or deleted.
 * 
 * @param config - Auto-refresh configuration
 */
export async function startAutoRefresh(config: AutoRefreshConfig = {}): Promise<void> {
  if (isRunning) {
    return;
  }

  const {
    watchPath = path.join(process.cwd(), 'data/support'),
    debounceMs = 5000,
    enabled = true,
  } = config;

  if (!enabled) {
    return;
  }


  // Get refresh service
  const refreshService = getRefreshService();

  // Test MCP server connectivity
  const isConnected = await refreshService.testConnection();
  if (!isConnected) {
    console.warn('[KB Auto-Refresh] MCP server not reachable - auto-refresh disabled');
    
    await logDecision({
      scope: 'build',
      actor: 'ai-knowledge',
      action: 'kb_auto_refresh_mcp_unreachable',
      rationale: 'LlamaIndex MCP server not reachable - auto-refresh disabled',
      payload: {
        watchPath,
      },
    });

    return;
  }

  // Create and start file watcher
  watcher = await createKnowledgeBaseWatcher({
    watchPath,
    debounceMs,
    watchAdd: true,
    watchChange: true,
    watchUnlink: true,
    onRefreshTriggered: async (files) => {
      
      // Queue refresh for async processing
      await refreshService.queueRefresh({
        files,
        manual: false,
        requestId: `auto-${Date.now()}`,
      });
    },
  });

  isRunning = true;


  // Log startup
  await logDecision({
    scope: 'build',
    actor: 'ai-knowledge',
    action: 'kb_auto_refresh_started',
    rationale: 'Knowledge base auto-refresh system started',
    payload: {
      watchPath,
      debounceMs,
      mcpServerConnected: true,
    },
  });
}

/**
 * Stop automatic knowledge base refresh
 */
export async function stopAutoRefresh(): Promise<void> {
  if (!isRunning || !watcher) {
    return;
  }


  await watcher.stop();
  watcher = null;
  isRunning = false;


  // Log shutdown
  await logDecision({
    scope: 'build',
    actor: 'ai-knowledge',
    action: 'kb_auto_refresh_stopped',
    rationale: 'Knowledge base auto-refresh system stopped',
  });
}

/**
 * Get auto-refresh status
 */
export function getAutoRefreshStatus() {
  return {
    isRunning,
    watcherStatus: watcher?.getStatus(),
    refreshStatus: getRefreshService().getStatus(),
  };
}

/**
 * Check if auto-refresh is running
 */
export function isAutoRefreshRunning(): boolean {
  return isRunning;
}


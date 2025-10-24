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
export function broadcastTileRefresh(tileId: string, data?: any): TileRefreshEvent {
  const event: TileRefreshEvent = {
    tileId,
    timestamp: new Date().toISOString(),
    data,
  };
  
  // In production, this would publish to a message queue or pub/sub system
  // For now, we'll rely on the SSE endpoint to poll for updates
  
  return event;
}

/**
 * Broadcast approval queue update to all connected clients
 */
export function broadcastApprovalUpdate(pendingCount: number, hasNewApprovals: boolean): ApprovalUpdateEvent {
  const event: ApprovalUpdateEvent = {
    pendingCount,
    hasNewApprovals,
    timestamp: new Date().toISOString(),
  };
  
  return event;
}

/**
 * Broadcast system status change to all connected clients
 */
export function broadcastSystemStatus(status: 'healthy' | 'degraded' | 'unhealthy', message?: string): SystemStatusEvent {
  const event: SystemStatusEvent = {
    status,
    message,
    timestamp: new Date().toISOString(),
  };
  
  return event;
}

/**
 * Get auto-refresh interval for a tile based on its type
 */
export function getTileRefreshInterval(tileType: string): number {
  const intervals: Record<string, number> = {
    // Real-time tiles (30 seconds)
    'approvals-queue': 30,
    'unread-messages': 30,
    'cx-escalations': 30,
    
    // Frequent updates (1 minute)
    'sales-pulse': 60,
    'ops-metrics': 60,
    'fulfillment-health': 60,
    
    // Moderate updates (5 minutes)
    'inventory-heatmap': 300,
    'seo-content': 300,
    'social-performance': 300,
    'ads-roas': 300,
    
    // Slow updates (15 minutes)
    'seo-impact': 900,
    'growth-metrics': 900,
    'growth-engine-analytics': 900,
    
    // Static tiles (no auto-refresh)
    'idea-pool': 0,
    'ceo-agent': 0,
  };
  
  return intervals[tileType] || 300; // Default: 5 minutes
}

/**
 * Check if a tile should auto-refresh
 */
export function shouldAutoRefresh(tileType: string): boolean {
  return getTileRefreshInterval(tileType) > 0;
}

/**
 * Format time ago string
 */
export function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSeconds < 5) {
    return 'Just now';
  } else if (diffSeconds < 60) {
    return `${diffSeconds}s ago`;
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else {
    return `${diffDays}d ago`;
  }
}

/**
 * Calculate refresh progress percentage
 */
export function calculateRefreshProgress(lastUpdated: Date | string, interval: number): number {
  const now = new Date();
  const then = new Date(lastUpdated);
  const elapsed = now.getTime() - then.getTime();
  const progress = (elapsed / (interval * 1000)) * 100;
  
  return Math.min(progress, 100);
}


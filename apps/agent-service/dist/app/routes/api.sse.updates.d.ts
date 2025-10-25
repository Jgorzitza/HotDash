/**
 * Server-Sent Events (SSE) API Route
 *
 * Provides real-time updates for:
 * - Approval queue count
 * - Tile refresh events
 * - System status changes
 *
 * Features:
 * - Heartbeat every 30s (keep-alive)
 * - Auto-reconnection on client
 * - Event types: approval-update, tile-refresh, system-status
 *
 * Phase 5 - ENG-023
 */
import type { LoaderFunctionArgs } from "react-router";
export interface SSEEvent {
    type: "approval-update" | "tile-refresh" | "system-status" | "heartbeat";
    data: Record<string, unknown>;
    timestamp: string;
}
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.sse.updates.d.ts.map
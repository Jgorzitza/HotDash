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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function loader({ request }: LoaderFunctionArgs) {
  // Create Server-Sent Events stream
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Send SSE message helper
      const sendEvent = (event: SSEEvent) => {
        const data = `event: ${event.type}\ndata: ${JSON.stringify(event.data)}\nid: ${Date.now()}\n\n`;
        controller.enqueue(encoder.encode(data));
      };

      // Initial connection message
      sendEvent({
        type: "system-status",
        data: { status: "connected", message: "SSE connection established" },
        timestamp: new Date().toISOString(),
      });

      // Heartbeat every 30 seconds to keep connection alive
      const heartbeatInterval = setInterval(() => {
        try {
          sendEvent({
            type: "heartbeat",
            data: { timestamp: new Date().toISOString() },
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          console.error("SSE heartbeat error:", error);
          clearInterval(heartbeatInterval);
        }
      }, 30000);

      // Simulate approval updates every 60 seconds (development)
      // TODO: Replace with real-time database listeners in production
      const approvalUpdateInterval = setInterval(() => {
        try {
          sendEvent({
            type: "approval-update",
            data: {
              pendingCount: Math.floor(Math.random() * 10),
              hasNewApprovals: Math.random() > 0.5,
            },
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          console.error("SSE approval update error:", error);
          clearInterval(approvalUpdateInterval);
        }
      }, 60000);

      // Cleanup on connection close
      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeatInterval);
        clearInterval(approvalUpdateInterval);
        controller.close();
      });
    },
  });

  // Return SSE response with proper headers
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    },
  });
}

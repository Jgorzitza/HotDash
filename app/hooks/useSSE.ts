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

import { useState, useEffect, useCallback, useRef } from "react";

export type SSEEventType = "approval-update" | "tile-refresh" | "system-status" | "heartbeat";

export interface SSEMessage<T = Record<string, unknown>> {
  type: SSEEventType;
  data: T;
  timestamp: string;
}

export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

export function useSSE(url: string, enabled = true) {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [lastMessage, setLastMessage] = useState<SSEMessage | null>(null);
  const [lastHeartbeat, setLastHeartbeat] = useState<Date | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const connect = useCallback(() => {
    if (!enabled || typeof window === "undefined") return;

    try {
      setStatus("connecting");

      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log("[SSE] Connection established");
        setStatus("connected");
        reconnectAttemptsRef.current = 0;
      };

      eventSource.onerror = () => {
        console.error("[SSE] Connection error");
        setStatus("error");

        // Auto-reconnect with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        reconnectAttemptsRef.current += 1;

        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        reconnectTimeoutRef.current = setTimeout(() => {
          console.log(`[SSE] Reconnecting... (attempt ${reconnectAttemptsRef.current})`);
          eventSource.close();
          connect();
        }, delay);
      };

      // Listen for approval updates
      eventSource.addEventListener("approval-update", (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage({
            type: "approval-update",
            data,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          console.error("[SSE] Failed to parse approval-update:", error);
        }
      });

      // Listen for tile refresh events
      eventSource.addEventListener("tile-refresh", (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage({
            type: "tile-refresh",
            data,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          console.error("[SSE] Failed to parse tile-refresh:", error);
        }
      });

      // Listen for system status events
      eventSource.addEventListener("system-status", (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage({
            type: "system-status",
            data,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          console.error("[SSE] Failed to parse system-status:", error);
        }
      });

      // Listen for heartbeat events
      eventSource.addEventListener("heartbeat", (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastHeartbeat(new Date(data.timestamp));
        } catch (error) {
          console.error("[SSE] Failed to parse heartbeat:", error);
        }
      });
    } catch (error) {
      console.error("[SSE] Failed to establish connection:", error);
      setStatus("error");
    }
  }, [url, enabled]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      console.log("[SSE] Disconnecting");
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setStatus("disconnected");
  }, []);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  // Monitor for page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Disconnect when tab hidden to save resources
        disconnect();
      } else {
        // Reconnect when tab visible
        connect();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [connect, disconnect]);

  return {
    status,
    lastMessage,
    lastHeartbeat,
    isConnected: status === "connected",
    connect,
    disconnect,
  };
}


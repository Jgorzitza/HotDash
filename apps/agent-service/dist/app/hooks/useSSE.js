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
export function useSSE(url, enabled = true) {
    const [status, setStatus] = useState("disconnected");
    const [lastMessage, setLastMessage] = useState(null);
    const [lastHeartbeat, setLastHeartbeat] = useState(null);
    const [connectionQuality, setConnectionQuality] = useState("disconnected");
    const eventSourceRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const reconnectAttemptsRef = useRef(0);
    const heartbeatIntervalRef = useRef(null);
    const lastMessageTimeRef = useRef(null);
    const connect = useCallback(() => {
        if (!enabled || typeof window === "undefined")
            return;
        try {
            setStatus("connecting");
            const eventSource = new EventSource(url);
            eventSourceRef.current = eventSource;
            eventSource.onopen = () => {
                console.log("[SSE] Connection established");
                setStatus("connected");
                setConnectionQuality("excellent");
                reconnectAttemptsRef.current = 0;
                lastMessageTimeRef.current = new Date();
                // Start heartbeat monitoring
                if (heartbeatIntervalRef.current) {
                    clearInterval(heartbeatIntervalRef.current);
                }
                heartbeatIntervalRef.current = setInterval(() => {
                    const now = new Date();
                    const lastMessage = lastMessageTimeRef.current;
                    if (lastMessage) {
                        const timeSinceLastMessage = now.getTime() - lastMessage.getTime();
                        if (timeSinceLastMessage > 30000) { // 30 seconds
                            setConnectionQuality("poor");
                        }
                        else if (timeSinceLastMessage > 10000) { // 10 seconds
                            setConnectionQuality("good");
                        }
                        else {
                            setConnectionQuality("excellent");
                        }
                    }
                }, 5000);
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
                    const now = new Date();
                    lastMessageTimeRef.current = now;
                    setLastMessage({
                        type: "approval-update",
                        data,
                        timestamp: now.toISOString(),
                    });
                }
                catch (error) {
                    console.error("[SSE] Failed to parse approval-update:", error);
                }
            });
            // Listen for tile refresh events
            eventSource.addEventListener("tile-refresh", (event) => {
                try {
                    const data = JSON.parse(event.data);
                    const now = new Date();
                    lastMessageTimeRef.current = now;
                    setLastMessage({
                        type: "tile-refresh",
                        data,
                        timestamp: now.toISOString(),
                    });
                }
                catch (error) {
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
                }
                catch (error) {
                    console.error("[SSE] Failed to parse system-status:", error);
                }
            });
            // Listen for heartbeat events
            eventSource.addEventListener("heartbeat", (event) => {
                try {
                    const data = JSON.parse(event.data);
                    setLastHeartbeat(new Date(data.timestamp));
                }
                catch (error) {
                    console.error("[SSE] Failed to parse heartbeat:", error);
                }
            });
            // Listen for Growth Engine updates (Phase 9-12)
            eventSource.addEventListener("growth-engine-update", (event) => {
                try {
                    const data = JSON.parse(event.data);
                    setLastMessage({
                        type: "growth-engine-update",
                        data,
                        timestamp: new Date().toISOString(),
                    });
                }
                catch (error) {
                    console.error("[SSE] Failed to parse growth-engine-update:", error);
                }
            });
            // Listen for analytics refresh events
            eventSource.addEventListener("analytics-refresh", (event) => {
                try {
                    const data = JSON.parse(event.data);
                    setLastMessage({
                        type: "analytics-refresh",
                        data,
                        timestamp: new Date().toISOString(),
                    });
                }
                catch (error) {
                    console.error("[SSE] Failed to parse analytics-refresh:", error);
                }
            });
            // Listen for performance alerts
            eventSource.addEventListener("performance-alert", (event) => {
                try {
                    const data = JSON.parse(event.data);
                    setLastMessage({
                        type: "performance-alert",
                        data,
                        timestamp: new Date().toISOString(),
                    });
                }
                catch (error) {
                    console.error("[SSE] Failed to parse performance-alert:", error);
                }
            });
            // Listen for budget alerts
            eventSource.addEventListener("budget-alert", (event) => {
                try {
                    const data = JSON.parse(event.data);
                    setLastMessage({
                        type: "budget-alert",
                        data,
                        timestamp: new Date().toISOString(),
                    });
                }
                catch (error) {
                    console.error("[SSE] Failed to parse budget-alert:", error);
                }
            });
        }
        catch (error) {
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
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
            heartbeatIntervalRef.current = null;
        }
        setStatus("disconnected");
        setConnectionQuality("disconnected");
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
            }
            else {
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
        connectionQuality,
        isConnected: status === "connected",
        connect,
        disconnect,
    };
}
//# sourceMappingURL=useSSE.js.map
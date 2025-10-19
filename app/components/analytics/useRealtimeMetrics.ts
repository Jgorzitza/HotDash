/**
 * useRealtimeMetrics Hook
 *
 * React hook for subscribing to real-time analytics metrics via SSE.
 * Gracefully falls back to polling if real-time is disabled.
 *
 * Usage:
 *   const { data, loading, error } = useRealtimeMetrics();
 */

import { useState, useEffect, useCallback } from "react";

// ============================================================================
// Types
// ============================================================================

interface RealtimeMetrics {
  revenue: {
    revenue: number;
    change: number;
    period: string;
  } | null;
  conversion: {
    conversionRate: number;
    change: number;
    period: string;
  } | null;
  traffic: {
    sessions: number;
    organicSessions: number;
    change: number;
    period: string;
  } | null;
}

interface UseRealtimeMetricsReturn {
  data: RealtimeMetrics | null;
  loading: boolean;
  error: string | null;
  lastUpdate: string | null;
}

// ============================================================================
// Hook
// ============================================================================

export function useRealtimeMetrics(): UseRealtimeMetricsReturn {
  const [data, setData] = useState<RealtimeMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const connect = useCallback(() => {
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource("/api/analytics/realtime");

      eventSource.onopen = () => {
        console.log("[Realtime Metrics] Connected");
        setLoading(false);
        setError(null);
      };

      eventSource.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === "connected") {
            console.log("[Realtime Metrics] Connection confirmed");
          } else if (message.type === "metrics") {
            setData(message.data);
            setLastUpdate(message.timestamp);
            setError(null);
          } else if (message.type === "error") {
            console.error("[Realtime Metrics] Error:", message.error);
            setError(message.error);
          }
        } catch (err) {
          console.error("[Realtime Metrics] Failed to parse message:", err);
        }
      };

      eventSource.onerror = (err) => {
        console.error("[Realtime Metrics] Connection error:", err);
        setError("Connection to real-time metrics failed");
        setLoading(false);

        // Close and attempt reconnect after delay
        eventSource?.close();
        setTimeout(() => {
          console.log("[Realtime Metrics] Attempting reconnect...");
          connect();
        }, 5000);
      };
    } catch (err: any) {
      console.error("[Realtime Metrics] Failed to connect:", err);
      setError(err.message || "Failed to connect to real-time metrics");
      setLoading(false);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  useEffect(() => {
    const cleanup = connect();
    return cleanup;
  }, [connect]);

  return {
    data,
    loading,
    error,
    lastUpdate,
  };
}

/**
 * usePolledMetrics Hook
 *
 * Fallback hook that polls metrics endpoints instead of using SSE.
 * Use when real-time is disabled or unavailable.
 */
export function usePolledMetrics(
  intervalMs: number = 60000,
): UseRealtimeMetricsReturn {
  const [data, setData] = useState<RealtimeMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      const [revenueRes, conversionRes, trafficRes] = await Promise.all([
        fetch("/api/analytics/revenue"),
        fetch("/api/analytics/conversion-rate"),
        fetch("/api/analytics/traffic"),
      ]);

      const [revenue, conversion, traffic] = await Promise.all([
        revenueRes.json(),
        conversionRes.json(),
        trafficRes.json(),
      ]);

      setData({
        revenue: {
          revenue: revenue.revenue,
          change: revenue.change || 0,
          period: revenue.period,
        },
        conversion: {
          conversionRate: conversion.conversionRate,
          change: conversion.change || 0,
          period: conversion.period,
        },
        traffic: {
          sessions: traffic.sessions,
          organicSessions: traffic.sessions * 0.6, // Estimate
          change: 0,
          period: traffic.period,
        },
      });

      setLastUpdate(new Date().toISOString());
      setError(null);
      setLoading(false);
    } catch (err: any) {
      console.error("[Polled Metrics] Error:", err);
      setError(err.message || "Failed to fetch metrics");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchMetrics();

    // Poll at interval
    const intervalId = setInterval(fetchMetrics, intervalMs);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchMetrics, intervalMs]);

  return {
    data,
    loading,
    error,
    lastUpdate,
  };
}

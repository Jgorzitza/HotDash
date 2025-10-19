/**
 * Real-time Analytics Metrics (SSE)
 *
 * GET /api/analytics/realtime
 *
 * Streams analytics metrics updates every 30 seconds using Server-Sent Events.
 * Opt-in feature flag: ANALYTICS_REALTIME_ENABLED (default: false)
 *
 * Usage:
 *   const eventSource = new EventSource('/api/analytics/realtime');
 *   eventSource.onmessage = (event) => {
 *     const data = JSON.parse(event.data);
 *     console.log('Metrics update:', data);
 *   };
 */

import { type LoaderFunctionArgs } from "react-router";
import {
  getRevenueMetrics,
  getConversionMetrics,
  getTrafficMetrics,
} from "../lib/analytics/ga4";

// ============================================================================
// Configuration
// ============================================================================

const UPDATE_INTERVAL_MS = 30 * 1000; // 30 seconds

function isRealtimeEnabled(): boolean {
  return process.env.ANALYTICS_REALTIME_ENABLED === "true";
}

// ============================================================================
// SSE Stream
// ============================================================================

export async function loader({ request }: LoaderFunctionArgs) {
  // Check feature flag
  if (!isRealtimeEnabled()) {
    return new Response(
      JSON.stringify({
        error: "Real-time analytics is not enabled",
        message: "Set ANALYTICS_REALTIME_ENABLED=true to enable this feature",
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  // Create SSE stream
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // Send initial connection message
      const connectionMessage = `data: ${JSON.stringify({
        type: "connected",
        timestamp: new Date().toISOString(),
        interval: UPDATE_INTERVAL_MS,
      })}\n\n`;
      controller.enqueue(encoder.encode(connectionMessage));

      // Send metrics updates every 30 seconds
      const intervalId = setInterval(async () => {
        try {
          const [revenue, conversion, traffic] = await Promise.all([
            getRevenueMetrics().catch(() => null),
            getConversionMetrics().catch(() => null),
            getTrafficMetrics().catch(() => null),
          ]);

          const update = {
            type: "metrics",
            timestamp: new Date().toISOString(),
            data: {
              revenue: revenue
                ? {
                    revenue: revenue.totalRevenue,
                    change: revenue.trend.revenueChange,
                    period: `${revenue.period.start} to ${revenue.period.end}`,
                  }
                : null,
              conversion: conversion
                ? {
                    conversionRate: conversion.conversionRate,
                    change: conversion.trend.conversionRateChange,
                    period: `${conversion.period.start} to ${conversion.period.end}`,
                  }
                : null,
              traffic: traffic
                ? {
                    sessions: traffic.totalSessions,
                    organicSessions: traffic.organicSessions,
                    change: traffic.trend.sessionsChange,
                    period: `${traffic.period.start} to ${traffic.period.end}`,
                  }
                : null,
            },
          };

          const message = `data: ${JSON.stringify(update)}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch (error) {
          console.error("[Analytics Realtime] Error fetching metrics:", error);

          const errorMessage = `data: ${JSON.stringify({
            type: "error",
            timestamp: new Date().toISOString(),
            error: "Failed to fetch metrics",
          })}\n\n`;
          controller.enqueue(encoder.encode(errorMessage));
        }
      }, UPDATE_INTERVAL_MS);

      // Cleanup on connection close
      request.signal.addEventListener("abort", () => {
        clearInterval(intervalId);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

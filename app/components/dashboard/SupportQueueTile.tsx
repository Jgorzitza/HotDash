/**
 * Support Queue Dashboard Tile
 *
 * Displays real-time support queue metrics:
 * - Pending conversation count
 * - Average wait time
 * - SLA status (15 minute target)
 */

import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  Badge,
  Spinner,
} from "@shopify/polaris";
import { useState, useEffect } from "react";

interface SupportQueueMetrics {
  queue: {
    pending: number;
    open: number;
    resolved_today: number;
    total_active: number;
  };
  sla: {
    adherence_percent: number;
    within_sla: number;
    breached: number;
    target_minutes: number;
  };
  timestamp: string;
}

interface SupportQueueTileProps {
  refreshInterval?: number; // milliseconds
}

export function SupportQueueTile({
  refreshInterval = 30000,
}: SupportQueueTileProps) {
  const [metrics, setMetrics] = useState<SupportQueueMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await fetch("/api/support.metrics?period=24");
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        setMetrics(data);
        setError(null);
      } catch (err) {
        console.error("[SupportQueueTile] Fetch error:", err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
    const interval = setInterval(fetchMetrics, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  if (loading) {
    return (
      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">
            Support Queue
          </Text>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "2rem",
            }}
          >
            <Spinner
              accessibilityLabel="Loading support metrics"
              size="large"
            />
          </div>
        </BlockStack>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">
            Support Queue
          </Text>
          <Text as="p" tone="critical">
            Error loading support metrics: {error}
          </Text>
        </BlockStack>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">
            Support Queue
          </Text>
          <Text as="p" tone="subdued">
            No data available
          </Text>
        </BlockStack>
      </Card>
    );
  }

  const getSLABadge = () => {
    const adherence = metrics.sla.adherence_percent;
    if (adherence >= 95) return <Badge tone="success">Excellent</Badge>;
    if (adherence >= 80) return <Badge tone="attention">Good</Badge>;
    return <Badge tone="critical">Needs Improvement</Badge>;
  };

  const getQueueBadge = () => {
    const pending = metrics.queue.total_active;
    if (pending === 0) return <Badge tone="success">Clear</Badge>;
    if (pending <= 10) return <Badge>Normal</Badge>;
    if (pending <= 25) return <Badge tone="attention">Busy</Badge>;
    return <Badge tone="critical">High Volume</Badge>;
  };

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between" blockAlign="center">
          <Text as="h2" variant="headingMd">
            Support Queue
          </Text>
          {getQueueBadge()}
        </InlineStack>

        <BlockStack gap="300">
          {/* Pending Count */}
          <InlineStack align="space-between">
            <Text as="p" variant="bodyMd">
              Pending Conversations
            </Text>
            <Text as="p" variant="headingLg" fontWeight="bold">
              {metrics.queue.total_active}
            </Text>
          </InlineStack>

          {/* SLA Status */}
          <InlineStack align="space-between" blockAlign="center">
            <Text as="p" variant="bodyMd">
              SLA Adherence (24h)
            </Text>
            <InlineStack gap="200" blockAlign="center">
              <Text as="p" variant="headingMd" fontWeight="bold">
                {metrics.sla.adherence_percent.toFixed(1)}%
              </Text>
              {getSLABadge()}
            </InlineStack>
          </InlineStack>

          {/* Resolved Today */}
          <InlineStack align="space-between">
            <Text as="p" variant="bodyMd">
              Resolved Today
            </Text>
            <Text as="p" variant="bodyLg" tone="success">
              {metrics.queue.resolved_today}
            </Text>
          </InlineStack>

          {/* SLA Breaches */}
          {metrics.sla.breached > 0 && (
            <InlineStack align="space-between">
              <Text as="p" variant="bodyMd" tone="critical">
                SLA Breaches (24h)
              </Text>
              <Text as="p" variant="bodyLg" tone="critical" fontWeight="bold">
                {metrics.sla.breached}
              </Text>
            </InlineStack>
          )}

          {/* Last Updated */}
          <Text as="p" variant="bodySm" tone="subdued">
            Updated: {new Date(metrics.timestamp).toLocaleTimeString()}
          </Text>
        </BlockStack>
      </BlockStack>
    </Card>
  );
}

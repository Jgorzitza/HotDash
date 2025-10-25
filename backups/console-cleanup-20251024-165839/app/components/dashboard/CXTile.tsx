/**
 * CX Queue Tile Component
 *
 * Displays pending conversations with SLA status
 * Polls every ~90s, surfaces SLA timers
 */

import { Text, BlockStack, InlineStack, Badge, Button } from "@shopify/polaris";
import { useState, useEffect } from "react";
import type { CXData } from "~/routes/dashboard";

export interface CXTileProps {
  data: CXData;
}

export function CXTile({ data }: CXTileProps) {
  const [liveData, setLiveData] = useState(data);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Poll every 90 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch("/api/cx/status");
        if (response.ok) {
          const newData = await response.json();
          setLiveData(newData);
          setLastUpdate(new Date());
        }
      } catch (error) {
        console.error("Failed to poll CX status:", error);
      }
    }, 90000); // 90 seconds

    return () => clearInterval(interval);
  }, []);

  const getSLABadge = () => {
    if (liveData.breachedSLA > 0) {
      return <Badge tone="critical">{liveData.breachedSLA} SLA breached</Badge>;
    }
    return <Badge tone="success">All within SLA</Badge>;
  };

  const formatResponseTime = (minutes: number) => {
    if (minutes < 60) return `${Math.floor(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${Math.floor(minutes % 60)}m`;
  };

  return (
    <BlockStack gap="400">
      <InlineStack align="space-between" blockAlign="center">
        <BlockStack gap="200">
          <Text as="p" variant="heading2xl" fontWeight="bold">
            {liveData.pendingCount}
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            Pending conversations
          </Text>
        </BlockStack>

        {getSLABadge()}
      </InlineStack>

      <BlockStack gap="200">
        <Text as="p" variant="bodySm" tone="subdued">
          Avg response time: {formatResponseTime(liveData.avgResponseTime)}
        </Text>
        <Text as="p" variant="bodySm" tone="subdued">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </Text>
      </BlockStack>

      <Button url="/cx/escalations" variant="primary">
        View Escalations
      </Button>
    </BlockStack>
  );
}

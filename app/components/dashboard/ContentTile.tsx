/**
 * Content Performance Tile Component
 *
 * Displays social media performance metrics:
 * - Posts published (7 days)
 * - Average engagement rate
 * - Top performers
 *
 * @see app/lib/content/tracking.ts
 * @see app/services/content/engagement-analyzer.ts
 */

import { Text, BlockStack, InlineStack, Badge, Button } from "@shopify/polaris";
import { useState, useEffect } from "react";
import type { SocialPlatform } from "~/adapters/publer/types";

export type ContentData = {
  postsPublished: number; // Last 7 days
  avgEngagementRate: number; // %
  avgClickThroughRate: number; // %
  totalConversions: number;
  topPerformers: Array<{
    platform: SocialPlatform;
    postId: string;
    engagementRate: number;
    snippet: string; // First 40 chars of post
  }>;
  pendingApprovals: number;
};

export interface ContentTileProps {
  data: ContentData;
}

export function ContentTile({ data }: ContentTileProps) {
  const [liveData, setLiveData] = useState(data);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Poll every 5 minutes (social metrics don't change as fast as CX)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          "/api/content/performance?type=aggregated&days=7",
        );
        if (response.ok) {
          const newData = await response.json();
          setLiveData(newData);
          setLastUpdate(new Date());
        }
      } catch (error) {
        console.error("Failed to poll content performance:", error);
      }
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  const getEngagementBadge = () => {
    const target = 3.5; // Average target across platforms

    if (liveData.avgEngagementRate >= target * 1.5) {
      return (
        <Badge tone="success">
          Exceptional ({liveData.avgEngagementRate.toFixed(1)}%)
        </Badge>
      );
    } else if (liveData.avgEngagementRate >= target) {
      return (
        <Badge tone="info">
          Above Target ({liveData.avgEngagementRate.toFixed(1)}%)
        </Badge>
      );
    } else if (liveData.avgEngagementRate >= target * 0.75) {
      return (
        <Badge tone="warning">
          At Target ({liveData.avgEngagementRate.toFixed(1)}%)
        </Badge>
      );
    }
    return (
      <Badge tone="critical">
        Below Target ({liveData.avgEngagementRate.toFixed(1)}%)
      </Badge>
    );
  };

  const getPlatformEmoji = (platform: SocialPlatform): string => {
    const emojis: Record<SocialPlatform, string> = {
      instagram: "📸",
      facebook: "👥",
      tiktok: "🎵",
    };
    return emojis[platform] || "📱";
  };

  return (
    <BlockStack gap="400">
      <InlineStack align="space-between" blockAlign="center">
        <BlockStack gap="200">
          <Text as="p" variant="heading2xl" fontWeight="bold">
            {liveData.postsPublished}
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            Posts published (7 days)
          </Text>
        </BlockStack>

        {getEngagementBadge()}
      </InlineStack>

      <BlockStack gap="200">
        <InlineStack align="space-between">
          <Text as="p" variant="bodySm" tone="subdued">
            Avg CTR:
          </Text>
          <Text as="p" variant="bodySm" fontWeight="semibold">
            {liveData.avgClickThroughRate.toFixed(2)}%
          </Text>
        </InlineStack>

        <InlineStack align="space-between">
          <Text as="p" variant="bodySm" tone="subdued">
            Conversions:
          </Text>
          <Text as="p" variant="bodySm" fontWeight="semibold">
            {liveData.totalConversions}
          </Text>
        </InlineStack>

        {liveData.pendingApprovals > 0 && (
          <InlineStack align="space-between">
            <Text as="p" variant="bodySm" tone="subdued">
              Pending approvals:
            </Text>
            <Badge tone="attention">{liveData.pendingApprovals}</Badge>
          </InlineStack>
        )}
      </BlockStack>

      {liveData.topPerformers.length > 0 && (
        <BlockStack gap="200">
          <Text as="p" variant="headingSm" fontWeight="semibold">
            Top Performers
          </Text>

          {liveData.topPerformers.slice(0, 3).map((post) => (
            <InlineStack
              key={post.postId}
              align="space-between"
              blockAlign="start"
              gap="200"
            >
              <BlockStack gap="100">
                <InlineStack gap="100" blockAlign="center">
                  <Text as="span" variant="bodySm">
                    {getPlatformEmoji(post.platform)}
                  </Text>
                  <Text as="span" variant="bodySm" tone="subdued">
                    {post.snippet}...
                  </Text>
                </InlineStack>
              </BlockStack>
              <Badge tone="success">{post.engagementRate.toFixed(1)}%</Badge>
            </InlineStack>
          ))}
        </BlockStack>
      )}

      <BlockStack gap="200">
        <Text as="p" variant="bodySm" tone="subdued">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </Text>

        <InlineStack gap="200">
          <Button
            size="slim"
            onClick={() => {
              // TODO: Open content analytics modal
              console.log("Open content analytics");
            }}
          >
            View Analytics
          </Button>

          {liveData.pendingApprovals > 0 && (
            <Button
              size="slim"
              variant="primary"
              onClick={() => {
                // TODO: Open approvals drawer filtered to content
                console.log("Open pending approvals");
              }}
            >
              Review ({liveData.pendingApprovals})
            </Button>
          )}
        </InlineStack>
      </BlockStack>
    </BlockStack>
  );
}

/**
 * Content Tile Mock Data (for development)
 */
export function getContentTileMockData(): ContentData {
  return {
    postsPublished: 12,
    avgEngagementRate: 4.8,
    avgClickThroughRate: 1.4,
    totalConversions: 28,
    topPerformers: [
      {
        platform: "instagram",
        postId: "post-001",
        engagementRate: 6.2,
        snippet: "New shift knobs are here! Limited run of",
      },
      {
        platform: "tiktok",
        postId: "post-002",
        engagementRate: 5.8,
        snippet: "Behind the scenes: Custom machining proces",
      },
      {
        platform: "facebook",
        postId: "post-003",
        engagementRate: 4.1,
        snippet: "Customer spotlight: '67 Mustang restorat",
      },
    ],
    pendingApprovals: 2,
  };
}

/**
 * Content Analytics Modal
 *
 * Detailed content performance analytics and insights.
 * Opens from ContentTile "View Analytics" button.
 *
 * @see app/components/dashboard/ContentTile.tsx
 * @see app/services/content/engagement-analyzer.ts
 */

import {
  Modal,
  Tabs,
  Card,
  Text,
  BlockStack,
  DataTable,
} from "@shopify/polaris";
import { useState, useEffect } from "react";
import type { ContentPerformance } from "~/lib/content/tracking";

export interface ContentAnalyticsModalProps {
  open: boolean;
  onClose: () => void;
}

export function ContentAnalyticsModal({
  open,
  onClose,
}: ContentAnalyticsModalProps) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [performanceData, setPerformanceData] = useState<ContentPerformance[]>(
    [],
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadPerformanceData();
    }
  }, [open]);

  const loadPerformanceData = async () => {
    setLoading(true);
    try {
      const endDate = new Date().toISOString();
      const startDate = new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000,
      ).toISOString();

      const response = await fetch(
        `/api/content/performance?type=top&startDate=${startDate}&endDate=${endDate}&limit=20`,
      );

      if (response.ok) {
        const data = await response.json();
        setPerformanceData(data.posts || []);
      }
    } catch (error) {
      console.error("Failed to load performance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    {
      id: "overview",
      content: "Overview",
      panelID: "overview-panel",
    },
    {
      id: "top-posts",
      content: "Top Posts",
      panelID: "top-posts-panel",
    },
    {
      id: "insights",
      content: "Insights",
      panelID: "insights-panel",
    },
  ];

  const formatPerformanceRows = () => {
    return performanceData.map((post) => [
      getPlatformEmoji(post.platform),
      post.postId.substring(0, 12),
      `${post.engagement.engagementRate}%`,
      `${post.clicks.clickThroughRate}%`,
      post.reach.impressions.toLocaleString(),
      post.engagement.likes.toLocaleString(),
    ]);
  };

  const getPlatformEmoji = (platform: string): string => {
    const emojis: Record<string, string> = {
      instagram: "📸",
      facebook: "👥",
      tiktok: "🎵",
    };
    return emojis[platform] || "📱";
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Content Performance Analytics"
      large
    >
      <Modal.Section>
        <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
          {selectedTab === 0 && (
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Last 7 Days Overview
                </Text>

                {loading ? (
                  <Text as="p" tone="subdued">
                    Loading...
                  </Text>
                ) : (
                  <BlockStack gap="200">
                    <Text as="p">
                      <strong>Total Posts:</strong> {performanceData.length}
                    </Text>
                    <Text as="p">
                      <strong>Avg Engagement Rate:</strong>{" "}
                      {performanceData.length > 0
                        ? (
                            performanceData.reduce(
                              (sum, p) => sum + p.engagement.engagementRate,
                              0,
                            ) / performanceData.length
                          ).toFixed(2)
                        : 0}
                      %
                    </Text>
                  </BlockStack>
                )}
              </BlockStack>
            </Card>
          )}

          {selectedTab === 1 && (
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Top Performing Posts
                </Text>

                {loading ? (
                  <Text as="p" tone="subdued">
                    Loading...
                  </Text>
                ) : performanceData.length > 0 ? (
                  <DataTable
                    columnContentTypes={[
                      "text",
                      "text",
                      "numeric",
                      "numeric",
                      "numeric",
                      "numeric",
                    ]}
                    headings={[
                      "Platform",
                      "Post ID",
                      "ER %",
                      "CTR %",
                      "Impressions",
                      "Likes",
                    ]}
                    rows={formatPerformanceRows()}
                  />
                ) : (
                  <Text as="p" tone="subdued">
                    No data available
                  </Text>
                )}
              </BlockStack>
            </Card>
          )}

          {selectedTab === 2 && (
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Insights & Recommendations
                </Text>

                <Text as="p" tone="subdued">
                  Performance insights will appear here based on post analysis.
                </Text>
              </BlockStack>
            </Card>
          )}
        </Tabs>
      </Modal.Section>
    </Modal>
  );
}

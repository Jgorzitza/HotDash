/**
 * RAG Sources List — Display RAG article attribution for transparency
 *
 * Shows which knowledge base articles informed the AI draft.
 * Helps reviewers understand draft context and verify accuracy.
 */

import { BlockStack, InlineStack, Text, Badge, Link } from "@shopify/polaris";

export interface RAGSource {
  id: string;
  title: string;
  excerpt?: string;
  url?: string;
  relevanceScore?: number; // 0-1
}

export interface RAGSourcesListProps {
  sources: RAGSource[];
  confidence?: number; // 0-1
  compact?: boolean;
}

export function RAGSourcesList({
  sources,
  confidence,
  compact = false,
}: RAGSourcesListProps) {
  if (sources.length === 0) {
    return (
      <BlockStack gap="200">
        <Text as="p" variant="bodyMd" tone="subdued">
          No knowledge base articles used
        </Text>
        <Text as="p" variant="bodySm" tone="subdued">
          This draft was generated without specific article context. Consider
          adding relevant articles to the knowledge base.
        </Text>
      </BlockStack>
    );
  }

  const confidenceBadge = () => {
    if (confidence === undefined) return null;

    const pct = Math.round(confidence * 100);
    let tone: "success" | "attention" | "critical" = "success";

    if (pct < 60) tone = "critical";
    else if (pct < 80) tone = "attention";

    return <Badge tone={tone}>{pct}% confidence</Badge>;
  };

  if (compact) {
    return (
      <BlockStack gap="200">
        <InlineStack align="space-between" blockAlign="center">
          <Text as="p" variant="bodyMd" fontWeight="semibold">
            Sources ({sources.length})
          </Text>
          {confidenceBadge()}
        </InlineStack>
        <BlockStack gap="100">
          {sources.map((source) => (
            <Text key={source.id} as="p" variant="bodySm">
              {source.url ? (
                <Link url={source.url} target="_blank">
                  {source.title}
                </Link>
              ) : (
                source.title
              )}
            </Text>
          ))}
        </BlockStack>
      </BlockStack>
    );
  }

  return (
    <BlockStack gap="300">
      <InlineStack align="space-between" blockAlign="center">
        <Text as="h3" variant="headingMd">
          Knowledge Base Sources
        </Text>
        {confidenceBadge()}
      </InlineStack>

      <BlockStack gap="300">
        {sources.map((source) => (
          <BlockStack key={source.id} gap="100">
            <InlineStack gap="200" blockAlign="center">
              {source.url ? (
                <Link url={source.url} target="_blank">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                    {source.title}
                  </Text>
                </Link>
              ) : (
                <Text as="p" variant="bodyMd" fontWeight="semibold">
                  {source.title}
                </Text>
              )}
              {source.relevanceScore !== undefined && (
                <Badge tone="info">
                  {Math.round(source.relevanceScore * 100)}% relevant
                </Badge>
              )}
            </InlineStack>

            {source.excerpt && (
              <Text as="p" variant="bodySm" tone="subdued">
                {source.excerpt}
              </Text>
            )}
          </BlockStack>
        ))}
      </BlockStack>

      <Text as="p" variant="bodySm" tone="subdued">
        These articles were used to generate the AI draft reply. Review them to
        verify the accuracy of the suggested response.
      </Text>
    </BlockStack>
  );
}

/**
 * Knowledge Base Admin Route
 * 
 * Provides UI for managing the AI knowledge base system:
 * - View all KB articles
 * - Search knowledge base
 * - Add new articles
 * - View KB statistics
 * 
 * Growth Engine: HITL Learning System
 */

import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  DataTable,
  Button,
  TextField,
  Select,
} from "@shopify/polaris";
import { useState } from "react";
import {
  getKnowledgeBaseStats,
  checkKnowledgeBaseHealth,
  listArticles,
  type KBArticle,
} from "~/services/knowledge";

/**
 * Loader - Fetch KB data
 */
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Get KB statistics
    const stats = await getKnowledgeBaseStats();

    // Get health status
    const health = await checkKnowledgeBaseHealth();

    // Get recent articles
    const articles = await listArticles({ limit: 20 });

    return Response.json({
      stats,
      health,
      articles,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[KB Route] Error loading data:", error);
    return Response.json({
      stats: {
        totalArticles: 0,
        articlesByCategory: {},
        recentArticles: 0,
        timestamp: new Date(),
      },
      health: {
        healthy: false,
        components: {
          embedding: false,
          database: false,
          search: false,
        },
        timestamp: new Date(),
      },
      articles: [],
      timestamp: new Date().toISOString(),
      error: (error as Error).message,
    }, { status: 500 });
  }
}

/**
 * Knowledge Base Admin Page
 */
export default function KnowledgeBasePage() {
  const { stats, health, articles } = useLoaderData<typeof loader>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Filter articles based on search and category
  const filteredArticles = articles.filter((article: KBArticle) => {
    const matchesSearch =
      searchQuery === "" ||
      article.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.answer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || article.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Prepare data for table
  const tableRows = filteredArticles.map((article: KBArticle) => [
    article.question,
    article.category,
    article.tags.join(", "),
    `${(article.confidenceScore * 100).toFixed(0)}%`,
    article.usageCount.toString(),
    new Date(article.createdAt).toLocaleDateString(),
  ]);

  // Category options for filter
  const categoryOptions = [
    { label: "All Categories", value: "all" },
    { label: "Orders", value: "orders" },
    { label: "Shipping", value: "shipping" },
    { label: "Returns", value: "returns" },
    { label: "Products", value: "products" },
    { label: "Technical", value: "technical" },
    { label: "Policies", value: "policies" },
  ];

  return (
    <Page
      title="Knowledge Base"
      subtitle="AI-powered knowledge base for customer support"
      primaryAction={{
        content: "Add Article",
        onAction: () => {
          // TODO: Implement add article modal
          console.log("Add article clicked");
        },
      }}
    >
      <Layout>
        {/* Health Status */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                System Health
              </Text>
              <InlineStack gap="400">
                <Badge tone={health.healthy ? "success" : "critical"}>
                  {health.healthy ? "Healthy" : "Unhealthy"}
                </Badge>
                <Badge tone={health.components.embedding ? "success" : "critical"}>
                  Embedding: {health.components.embedding ? "OK" : "Error"}
                </Badge>
                <Badge tone={health.components.database ? "success" : "critical"}>
                  Database: {health.components.database ? "OK" : "Error"}
                </Badge>
                <Badge tone={health.components.search ? "success" : "critical"}>
                  Search: {health.components.search ? "OK" : "Error"}
                </Badge>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Statistics */}
        <Layout.Section>
          <InlineStack gap="400">
            <Card>
              <BlockStack gap="200">
                <Text as="h3" variant="headingMd">
                  Total Articles
                </Text>
                <Text as="p" variant="heading2xl">
                  {stats.totalArticles}
                </Text>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="200">
                <Text as="h3" variant="headingMd">
                  Recent Articles
                </Text>
                <Text as="p" variant="heading2xl">
                  {stats.recentArticles}
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Last 7 days
                </Text>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="200">
                <Text as="h3" variant="headingMd">
                  Categories
                </Text>
                <Text as="p" variant="heading2xl">
                  {Object.keys(stats.articlesByCategory).length}
                </Text>
              </BlockStack>
            </Card>
          </InlineStack>
        </Layout.Section>

        {/* Category Breakdown */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Articles by Category
              </Text>
              <InlineStack gap="400">
                {Object.entries(stats.articlesByCategory).map(([category, count]) => (
                  <Badge key={category} tone="info">
                    {category}: {count}
                  </Badge>
                ))}
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Search and Filter */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack gap="400">
                <div style={{ flex: 1 }}>
                  <TextField
                    label="Search articles"
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search by question or answer..."
                    autoComplete="off"
                    clearButton
                    onClearButtonClick={() => setSearchQuery("")}
                  />
                </div>
                <div style={{ width: "200px" }}>
                  <Select
                    label="Category"
                    options={categoryOptions}
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                  />
                </div>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Articles Table */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Knowledge Base Articles ({filteredArticles.length})
              </Text>
              <DataTable
                columnContentTypes={["text", "text", "text", "numeric", "numeric", "text"]}
                headings={["Question", "Category", "Tags", "Confidence", "Usage", "Created"]}
                rows={tableRows}
                hoverable
              />
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

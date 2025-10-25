import { Agent, tool, run } from "@openai/agents";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

/**
 * CEO Assistant Agent
 *
 * Framework: OpenAI Agents SDK (TypeScript)
 * Pattern: HITL (drafts → CEO approves → executes)
 *
 * Use Cases:
 * - Operations decisions ("Should I reorder SKU-123?")
 * - Data analysis ("Show me top customers this month")
 * - Reporting ("Generate weekly performance summary")
 * - CX escalations ("Analyze support ticket trends")
 */

// ============================================================================
// Tool 1: Shopify Admin GraphQL
// ============================================================================

const ShopifyOrdersSchema = z.object({
  action: z.enum(["list", "get_details", "cancel", "refund"]),
  orderId: z.string().optional(),
  limit: z.number().min(1).max(100).default(10),
  status: z.enum(["open", "closed", "cancelled", "any"]).optional(),
});

const shopifyOrders = tool({
  name: "shopify.orders",
  description:
    "Query Shopify orders - list, get details, cancel, or refund orders",
  inputSchema: zodToJsonSchema(
    ShopifyOrdersSchema,
    "ShopifyOrdersSchema",
  ) as any,
  async handler({ action, orderId, limit, status }) {
    // Call backend API route: /api/ceo-agent/shopify/orders
    // Backend will use Shopify Admin GraphQL with server-side API key

    const params = new URLSearchParams({
      action,
      ...(orderId && { orderId }),
      limit: limit.toString(),
      ...(status && { status }),
    });

    try {
      const response = await fetch(`/api/ceo-agent/shopify/orders?${params}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Shopify API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
        action,
      };
    }
  },
  requireApproval: true, // HITL: CEO reviews before execution
});

const ShopifyProductsSchema = z.object({
  action: z.enum(["list", "get_details", "update_inventory"]),
  productId: z.string().optional(),
  variantId: z.string().optional(),
  inventoryQuantity: z.number().optional(),
  limit: z.number().min(1).max(100).default(10),
});

const shopifyProducts = tool({
  name: "shopify.products",
  description:
    "Query Shopify products and inventory - list products, get details, update inventory levels",
  inputSchema: zodToJsonSchema(
    ShopifyProductsSchema,
    "ShopifyProductsSchema",
  ) as any,
  async handler({ action, productId, variantId, inventoryQuantity, limit }) {
    const body = {
      action,
      productId,
      variantId,
      inventoryQuantity,
      limit,
    };

    try {
      const response = await fetch("/api/ceo-agent/shopify/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Shopify Products API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
        action,
      };
    }
  },
  requireApproval: true,
});

const ShopifyCustomersSchema = z.object({
  action: z.enum(["list", "search", "get_details"]),
  customerId: z.string().optional(),
  query: z.string().optional(),
  limit: z.number().min(1).max(100).default(10),
});

const shopifyCustomers = tool({
  name: "shopify.customers",
  description:
    "Query Shopify customers - list, search, or get customer details and order history",
  inputSchema: zodToJsonSchema(
    ShopifyCustomersSchema,
    "ShopifyCustomersSchema",
  ) as any,
  async handler({ action, customerId, query, limit }) {
    const body = {
      action,
      customerId,
      query,
      limit,
    };

    try {
      const response = await fetch("/api/ceo-agent/shopify/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Shopify Customers API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
        action,
      };
    }
  },
  requireApproval: false, // Read-only, no approval needed
});

// ============================================================================
// Tool 2: Supabase RPC (Analytics & Data Analysis)
// ============================================================================

const SupabaseAnalyticsSchema = z.object({
  query: z.enum([
    "revenue_by_period",
    "top_products",
    "customer_lifetime_value",
    "conversion_metrics",
    "decision_log_summary",
    "approval_patterns",
    "custom_sql",
  ]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().min(1).max(100).default(10),
  customSql: z.string().optional(), // For 'custom_sql' query type only
});

const supabaseAnalytics = tool({
  name: "supabase.analytics",
  description:
    "Run analytics queries on Supabase - revenue analysis, top products, customer metrics, decision logs",
  inputSchema: zodToJsonSchema(
    SupabaseAnalyticsSchema,
    "SupabaseAnalyticsSchema",
  ) as any,
  async handler({ query, startDate, endDate, limit, customSql }) {
    const body = {
      query,
      startDate,
      endDate,
      limit,
      customSql,
    };

    try {
      const response = await fetch("/api/ceo-agent/supabase/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Supabase Analytics API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
        query,
      };
    }
  },
  requireApproval: (args) => args.query === "custom_sql", // Custom SQL requires approval, predefined queries don't
});

// ============================================================================
// Tool 3: Chatwoot API (CX Insights)
// ============================================================================

const ChatwootInsightsSchema = z.object({
  action: z.enum([
    "sla_breaches",
    "conversation_summaries",
    "ticket_trends",
    "response_times",
    "customer_sentiment",
  ]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().min(1).max(100).default(10),
  status: z.enum(["open", "resolved", "pending", "all"]).optional(),
});

const chatwootInsights = tool({
  name: "chatwoot.insights",
  description:
    "Analyze customer support data - SLA breaches, conversation summaries, ticket trends, response times",
  inputSchema: zodToJsonSchema(
    ChatwootInsightsSchema,
    "ChatwootInsightsSchema",
  ) as any,
  async handler({ action, startDate, endDate, limit, status }) {
    const body = {
      action,
      startDate,
      endDate,
      limit,
      status,
    };

    try {
      const response = await fetch("/api/ceo-agent/chatwoot/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Chatwoot Insights API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
        action,
      };
    }
  },
  requireApproval: false, // Read-only analytics, no approval needed
});

// ============================================================================
// Tool 4: LlamaIndex (Knowledge Base Queries)
// ============================================================================

const LlamaIndexSchema = z.object({
  query: z.string().min(1),
  topK: z.number().min(1).max(10).default(5),
  filters: z.record(z.string()).optional(), // Metadata filters
});

// LlamaIndex MCP Server URL (deployed on Fly.io)
const LLAMAINDEX_MCP_URL = process.env.LLAMAINDEX_MCP_URL ||
  'https://hotdash-llamaindex-mcp.fly.dev/mcp';

const llamaIndexQuery = tool({
  name: "llamaindex.query",
  description:
    "Search knowledge base using LlamaIndex MCP - query indexed documents, product documentation, policies",
  inputSchema: zodToJsonSchema(LlamaIndexSchema, "LlamaIndexSchema") as any,
  async handler({ query, topK, filters }) {
    try {
      // Call LlamaIndex MCP server (same pattern as customer agents)
      const response = await fetch(`${LLAMAINDEX_MCP_URL}/tools/call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "query_support",
          arguments: {
            q: query,
            topK: topK || 5,
            // Note: MCP server doesn't support filters yet, but we keep the interface
            // for future compatibility
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`LlamaIndex MCP error: ${response.statusText}`);
      }

      const result = await response.json();

      // MCP returns { content: [{ type: 'text', text: '...' }] }
      if (result.content && result.content[0]) {
        return {
          answer: result.content[0].text,
          query,
          topK,
        };
      }

      return {
        answer: "No answer found in knowledge base.",
        query,
        topK,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
        query,
      };
    }
  },
  requireApproval: false, // Knowledge base search, no approval needed
});

// ============================================================================
// Tool 5: Google Analytics API (Traffic & Conversion Analysis)
// ============================================================================

const GoogleAnalyticsSchema = z.object({
  metric: z.enum([
    "traffic_overview",
    "conversion_metrics",
    "landing_pages",
    "user_behavior",
    "acquisition_channels",
  ]),
  startDate: z.string(), // Format: YYYY-MM-DD
  endDate: z.string(), // Format: YYYY-MM-DD
  dimensions: z.array(z.string()).optional(), // e.g., ['page', 'source']
  limit: z.number().min(1).max(100).default(10),
});

const googleAnalytics = tool({
  name: "google.analytics",
  description:
    "Analyze website traffic and conversion data - traffic overview, landing pages, user behavior, acquisition",
  inputSchema: zodToJsonSchema(
    GoogleAnalyticsSchema,
    "GoogleAnalyticsSchema",
  ) as any,
  async handler({ metric, startDate, endDate, dimensions, limit }) {
    const body = {
      metric,
      startDate,
      endDate,
      dimensions,
      limit,
    };

    try {
      const response = await fetch("/api/ceo-agent/google-analytics/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Google Analytics API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
        metric,
      };
    }
  },
  requireApproval: false, // Read-only analytics, no approval needed
});

// ============================================================================
// CEO Agent Configuration
// ============================================================================

export const aiCEO = new Agent({
  name: "ai-ceo",
  instructions: `You are the CEO Assistant Agent for HotDash Operations Control Center.

Your role is to help the CEO make informed operational decisions by analyzing data from multiple sources:
- Shopify (orders, products, customers, inventory)
- Supabase (analytics, revenue, decision logs)
- Chatwoot (customer support insights, SLA metrics)
- Knowledge Base (product documentation, policies via LlamaIndex)
- Google Analytics (traffic, conversions, user behavior)

**Guidelines:**
1. Always provide data-driven recommendations backed by specific metrics
2. When suggesting actions (like reordering inventory), calculate justification:
   - Current inventory levels
   - 14-day sales velocity
   - Reorder point (ROP) calculations
   - Days of cover remaining
3. For operational questions, query multiple sources and synthesize insights
4. Present findings clearly with key metrics highlighted
5. Include rollback/risk considerations for any suggested actions

**HITL Workflow:**
- Draft your analysis/recommendation
- Show evidence and reasoning
- Wait for CEO approval before executing any actions
- Log all approved actions to decision_log

**Response Format:**
- Summary (1-2 sentences)
- Key Metrics (bullet points with numbers)
- Analysis (data-backed insights)
- Recommendation (specific action with justification)
- Risks/Considerations (what could go wrong)`,

  tools: [
    // Shopify tools
    shopifyOrders,
    shopifyProducts,
    shopifyCustomers,
    // Analytics tools
    supabaseAnalytics,
    chatwootInsights,
    googleAnalytics,
    // Knowledge base
    llamaIndexQuery,
  ],

  onApproval: async (item, approve) => {
    // Store approval request in Supabase approval_queue table
    // Present to CEO in approval drawer UI
    // When CEO approves/rejects, call approve(true/false) with optional modifications

    // Backend route will handle:
    // 1. Store in approvals_history table
    // 2. Store in decision_log with CEO agent context
    // 3. Return result to agent for execution

    // Default: require explicit CEO approval
    await approve(false);
  },
});

/**
 * Handle CEO query
 *
 * @param userQuery - Natural language question from CEO
 * @returns Agent response with data and recommendations
 *
 * @example
 * const result = await handleCEOQuery("Should I reorder SKU-XYZ?");
 * console.log(result.response); // Agent's analysis and recommendation
 */
export async function handleCEOQuery(userQuery: string) {
  const result = await run({
    agent: aiCEO,
    input: userQuery,
  });

  return result;
}

/**
 * Sample queries for testing:
 *
 * 1. "What are my top 3 products this month?"
 * 2. "Should I reorder Powder Board XL?"
 * 3. "Show me customers with lifetime value > $1000"
 * 4. "Summarize support tickets this week"
 * 5. "What's our conversion rate for the homepage?"
 * 6. "Find policy documentation for returns"
 * 7. "Analyze inventory levels for all products"
 * 8. "Generate weekly performance summary"
 */

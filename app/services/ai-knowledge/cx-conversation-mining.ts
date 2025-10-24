/**
 * CX Conversation Mining Service
 *
 * Mines CX conversations to detect recurring themes and generate product improvement actions
 *
 * Growth Engine: CX → Product Loop
 *
 * Process:
 * 1. Extract Chatwoot conversations (last 30 days)
 * 2. Sanitize PII (remove emails, phones, addresses, etc.)
 * 3. Embed sanitized conversations into pgvector
 * 4. Detect recurring themes using similarity search
 * 5. Generate Action cards for Product agent
 *
 * Security: NO PII stored in embeddings (sanitized before embedding)
 */

import { OpenAI } from "openai";
import { sanitizeConversation } from "./pii-sanitizer";
import prisma from "~/db.server";

// OpenAI client for embeddings
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export interface ConversationTheme {
  theme: string;
  productId?: string;
  productHandle?: string;
  occurrences: number;
  exampleQueries: string[];
  firstSeen: Date;
  lastSeen: Date;
}

export interface ProductAction {
  type: "content" | "feature" | "support";
  title: string;
  description: string;
  expectedRevenue: number;
  confidence: number; // 0-1
  ease: number; // 0-1
  evidenceUrl: string;
  affectedEntities: string[]; // Product handles, collection handles, etc.
  metadata: Record<string, any>;
}

/**
 * Generate embedding vector for text using OpenAI
 *
 * @param text - Text to embed
 * @returns Embedding vector (1536 dimensions for text-embedding-3-small)
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  return response.data[0].embedding;
}

/**
 * Extract product handles mentioned in conversation text
 *
 * @param text - Conversation text
 * @returns Array of product handles found
 */
function extractProductMentions(text: string): string[] {
  const handles: string[] = [];

  // Simple product handle extraction (improve based on your product catalog)
  // This regex looks for patterns like /products/product-handle
  const productRegex = /\/products\/([a-z0-9-]+)/gi;
  const matches = text.matchAll(productRegex);

  for (const match of matches) {
    if (match[1]) {
      handles.push(match[1]);
    }
  }

  // Also check for common product name patterns
  // You can enhance this with actual product catalog lookup

  return [...new Set(handles)]; // Remove duplicates
}

/**
 * Extract Chatwoot conversations from the database
 *
 * @param days - Number of days to look back (default: 30)
 * @returns Array of conversations with messages
 */
async function extractChatwootConversations(days: number = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  // Query Chatwoot conversations from the last N days
  const conversations = await prisma.chatwootConversation.findMany({
    where: {
      createdAt: { gte: since },
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  return conversations;
}

/**
 * Embed sanitized conversations into pgvector
 *
 * Creates/updates records in cx_embeddings table
 *
 * @returns Number of conversations embedded
 */
export async function embedConversations(): Promise<number> {
  console.log("[CX Mining] Extracting conversations from Chatwoot");

  // 1. Extract last 30 days of conversations
  const conversations = await extractChatwootConversations(30);

  console.log(`[CX Mining] Found ${conversations.length} conversations`);

  if (conversations.length === 0) {
    console.log("[CX Mining] No conversations to embed");
    return 0;
  }

  // 2. Sanitize and embed each conversation
  let embeddedCount = 0;

  for (const conv of conversations) {
    // Sanitize messages (remove PII)
    const sanitizedMessages = sanitizeConversation(
      conv.messages.map((m) => ({
        content: m.content,
        messageType: m.messageType,
      })),
    );

    // Combine messages into single text for embedding
    const conversationText = sanitizedMessages
      .map((m) => `${m.messageType}: ${m.content}`)
      .join("\n");

    // Extract product mentions
    const productHandles = extractProductMentions(conversationText);

    // Generate embedding
    const embedding = await generateEmbedding(conversationText);

    // Store in pgvector (cx_embeddings table)
    // Note: This table should be created by the Data agent
    await prisma.$executeRaw`
      INSERT INTO cx_embeddings (
        conversation_id, text, embedding, product_handles, created_at
      )
      VALUES (
        ${conv.id}, ${conversationText}, ${JSON.stringify(embedding)}::vector,
        ${JSON.stringify(productHandles)}, ${conv.createdAt}
      )
      ON CONFLICT (conversation_id) DO UPDATE SET
        text = EXCLUDED.text,
        embedding = EXCLUDED.embedding,
        product_handles = EXCLUDED.product_handles
    `;

    embeddedCount++;

    // Rate limiting: Wait 100ms between API calls to avoid hitting OpenAI limits
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log(`[CX Mining] ✅ Embedded ${embeddedCount} conversations`);

  return embeddedCount;
}

/**
 * Detect recurring themes in conversations using pgvector similarity search
 *
 * @param minOccurrences - Minimum number of similar conversations to consider a theme (default: 3)
 * @param days - Number of days to analyze (default: 7)
 * @returns Array of detected themes
 */
export async function detectRecurringThemes(
  minOccurrences: number = 3,
  days: number = 7,
): Promise<ConversationTheme[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const themes: ConversationTheme[] = [];

  // Common query patterns to search for
  const queryPatterns = [
    "size chart",
    "sizing guide",
    "product dimensions",
    "how to install",
    "installation instructions",
    "warranty information",
    "return policy",
    "shipping time",
    "when will it ship",
    "in stock",
    "when restock",
    "out of stock",
    "product availability",
    "color options",
    "material information",
  ];

  for (const pattern of queryPatterns) {
    // Generate embedding for the pattern
    const patternEmbedding = await generateEmbedding(pattern);

    // Find similar conversations using pgvector similarity search
    // Using cosine distance (<=> operator)
    const similar = await prisma.$queryRaw<
      Array<{
        conversation_id: string;
        text: string;
        product_handles: string;
        created_at: Date;
        distance: number;
      }>
    >`
      SELECT conversation_id, text, product_handles, created_at,
             (embedding <=> ${JSON.stringify(patternEmbedding)}::vector) AS distance
      FROM cx_embeddings
      WHERE created_at >= ${since}
        AND (embedding <=> ${JSON.stringify(patternEmbedding)}::vector) < 0.35
      ORDER BY distance ASC
      LIMIT 50
    `;

    if (similar.length >= minOccurrences) {
      // Count product mentions
      const productCounts = new Map<string, number>();

      similar.forEach((s) => {
        const products = JSON.parse(s.product_handles || "[]");
        products.forEach((p: string) => {
          productCounts.set(p, (productCounts.get(p) || 0) + 1);
        });
      });

      // Get top product for this theme
      const topProduct = Array.from(productCounts.entries()).sort(
        (a, b) => b[1] - a[1],
      )[0];

      if (topProduct) {
        themes.push({
          theme: pattern,
          productHandle: topProduct[0],
          occurrences: similar.length,
          exampleQueries: similar
            .slice(0, 3)
            .map((s) => s.text.substring(0, 100) + "..."),
          firstSeen: new Date(
            Math.min(...similar.map((s) => s.created_at.getTime())),
          ),
          lastSeen: new Date(
            Math.max(...similar.map((s) => s.created_at.getTime())),
          ),
        });
      }
    }

    // Rate limiting between pattern queries
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Sort by occurrences (highest first)
  return themes.sort((a, b) => b.occurrences - a.occurrences);
}

/**
 * Get Shopify product by handle
 *
 * @param handle - Product handle
 * @returns Product details or null
 */
async function getShopifyProductByHandle(handle: string) {
  // Query from your Shopify product cache/database
  const product = await prisma.shopifyProduct.findFirst({
    where: {
      handle: handle,
    },
  });

  return product;
}

/**
 * Generate Action cards from detected themes
 *
 * Action cards are mini-tasks for the Product agent to improve the store
 *
 * @returns Array of product improvement actions
 */
export async function generateCXProductActions(): Promise<ProductAction[]> {
  const themes = await detectRecurringThemes(3, 7);

  const actions: ProductAction[] = [];

  for (const theme of themes.slice(0, 5)) {
    // Limit to top 5 themes
    if (!theme.productHandle) continue;

    // Get product details
    const product = await getShopifyProductByHandle(theme.productHandle);

    if (!product) continue;

    // Estimate impact
    const estimatedRevenue = theme.occurrences * 50; // $50 per resolved customer query

    actions.push({
      type: "content",
      title: `Add ${theme.theme} to ${product.title}`,
      description: `${theme.occurrences} customers asked about "${theme.theme}" in the last 7 days. Adding this information to the product page may reduce support volume and increase conversions.`,
      expectedRevenue: estimatedRevenue,
      confidence: 0.8, // High confidence (based on actual customer questions)
      ease: 0.6, // Medium ease (requires content update)
      evidenceUrl: `/admin/cx-themes/${encodeURIComponent(theme.theme)}`,
      affectedEntities: [theme.productHandle],
      metadata: {
        theme: theme.theme,
        occurrences: theme.occurrences,
        exampleQueries: theme.exampleQueries,
        firstSeen: theme.firstSeen.toISOString(),
        lastSeen: theme.lastSeen.toISOString(),
      },
    });
  }

  return actions;
}

/**
 * Nightly job: Mine CX conversations and generate product actions
 *
 * This job should run nightly to:
 * 1. Embed new conversations
 * 2. Detect recurring themes
 * 3. Generate Action cards for Product agent
 *
 * @returns Summary of mining results
 */
export async function runNightlyCXMining() {
  console.log(
    "[CX Mining] Starting nightly conversation analysis",
    new Date().toISOString(),
  );

  try {
    // 1. Embed new conversations
    const embedded = await embedConversations();

    // 2. Detect themes
    const themes = await detectRecurringThemes(3, 7);

    console.log(`[CX Mining] Found ${themes.length} recurring themes`);

    // 3. Generate actions (handed off to Product agent)
    const actions = await generateCXProductActions();

    console.log(`[CX Mining] Generated ${actions.length} Action cards`);

    // Log results
    const summary = {
      timestamp: new Date().toISOString(),
      embedded,
      themesDetected: themes.length,
      actionsGenerated: actions.length,
      topThemes: themes.slice(0, 5).map((t) => ({
        theme: t.theme,
        occurrences: t.occurrences,
        product: t.productHandle,
      })),
    };

    console.log("[CX Mining] Summary:", JSON.stringify(summary, null, 2));

    return summary;
  } catch (error) {
    console.error("[CX Mining] Error during nightly mining:", error);
    throw error;
  }
}

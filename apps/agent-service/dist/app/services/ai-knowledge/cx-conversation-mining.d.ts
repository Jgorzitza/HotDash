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
    confidence: number;
    ease: number;
    evidenceUrl: string;
    affectedEntities: string[];
    metadata: Record<string, any>;
}
/**
 * Embed sanitized conversations into pgvector
 *
 * Creates/updates records in cx_embeddings table
 *
 * @returns Number of conversations embedded
 */
export declare function embedConversations(): Promise<number>;
/**
 * Detect recurring themes in conversations using pgvector similarity search
 *
 * @param minOccurrences - Minimum number of similar conversations to consider a theme (default: 3)
 * @param days - Number of days to analyze (default: 7)
 * @returns Array of detected themes
 */
export declare function detectRecurringThemes(minOccurrences?: number, days?: number): Promise<ConversationTheme[]>;
/**
 * Generate Action cards from detected themes
 *
 * Action cards are mini-tasks for the Product agent to improve the store
 *
 * @returns Array of product improvement actions
 */
export declare function generateCXProductActions(): Promise<ProductAction[]>;
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
export declare function runNightlyCXMining(): Promise<{
    timestamp: string;
    embedded: number;
    themesDetected: number;
    actionsGenerated: number;
    topThemes: {
        theme: string;
        occurrences: number;
        product: string;
    }[];
}>;
//# sourceMappingURL=cx-conversation-mining.d.ts.map
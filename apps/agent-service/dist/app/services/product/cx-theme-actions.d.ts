import type { DashboardFact } from "@prisma/client";
/**
 * ConversationTheme interface (from AI-Knowledge agent)
 * Represents a recurring theme detected in customer conversations
 */
export interface ConversationTheme {
    theme: string;
    productHandle: string;
    occurrences: number;
    exampleQueries: string[];
    detectedAt: string;
}
/**
 * CXThemeAction interface
 * Represents an actionable task generated from a CX theme
 */
export interface CXThemeAction {
    type: "content" | "seo" | "product_update";
    title: string;
    description: string;
    expectedRevenue: number;
    confidence: number;
    ease: number;
    evidenceUrl: string;
    affectedEntities: string[];
    draftCopy?: string;
    metadata: {
        theme: string;
        occurrences: number;
        productHandle: string;
        exampleQueries: string[];
        implementationType: string;
    };
}
/**
 * Maps a theme to an implementation type
 * Returns the action type and specific implementation approach
 */
export declare function mapThemeToImplementationType(theme: string): {
    type: "content" | "seo" | "product_update";
    implementationType: string;
};
/**
 * Generates draft copy for implementation
 * Creates ready-to-use content based on the theme and product
 */
export declare function generateDraftCopy(theme: string, productTitle: string, occurrences: number): string;
/**
 * Generates an Action card from a CX theme
 * Converts customer conversation patterns into actionable product improvements
 */
export declare function generateCXThemeAction(theme: ConversationTheme, shopDomain: string): Promise<CXThemeAction | null>;
/**
 * Processes multiple CX themes and generates Action cards
 * Batch processes themes from AI-Knowledge agent
 */
export declare function processCXThemes(themes: ConversationTheme[], shopDomain: string): Promise<CXThemeAction[]>;
/**
 * Adds CX theme actions to the Action Queue (via DashboardFact)
 * Stores actions as dashboard facts for operator review
 */
export declare function addCXActionsToQueue(actions: CXThemeAction[], shopDomain: string): Promise<{
    added: number;
    facts: DashboardFact[];
}>;
//# sourceMappingURL=cx-theme-actions.d.ts.map
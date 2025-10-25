/**
 * Internal Linking Recommendations Service
 *
 * Analyzes internal linking structure and provides recommendations:
 * - Identifies orphan pages (no incoming links)
 * - Suggests relevant links based on content similarity
 * - Calculates page authority based on link graph
 * - Detects over-linked pages
 *
 * @module services/seo/internal-linking
 */
export interface PageLinkProfile {
    url: string;
    incomingLinks: number;
    outgoingLinks: number;
    pageAuthority: number;
    isOrphan: boolean;
    isOverLinked: boolean;
    recommendations: LinkRecommendation[];
}
export interface LinkRecommendation {
    type: "add-internal-link" | "remove-excessive-links" | "fix-broken-link" | "add-contextual-link";
    fromPage: string;
    toPage: string;
    reason: string;
    priority: "high" | "medium" | "low";
    anchorSuggestion: string | null;
}
export interface LinkingAnalysis {
    summary: {
        totalPages: number;
        orphanPages: number;
        overLinkedPages: number;
        avgIncomingLinks: number;
        avgOutgoingLinks: number;
        totalInternalLinks: number;
    };
    pages: PageLinkProfile[];
    orphans: PageLinkProfile[];
    topRecommendations: LinkRecommendation[];
    analyzedAt: string;
}
export interface PageContentSimilarity {
    page1: string;
    page2: string;
    similarity: number;
    commonKeywords: string[];
}
/**
 * Analyze internal linking structure across all pages
 */
export declare function analyzeInternalLinking(pages: Array<{
    url: string;
    links: string[];
    content?: string;
}>): Promise<LinkingAnalysis>;
/**
 * Get linking recommendations for a specific page
 */
export declare function getPageLinkingRecommendations(url: string, allPages: Array<{
    url: string;
    links: string[];
    content?: string;
}>): Promise<LinkRecommendation[]>;
//# sourceMappingURL=internal-linking.d.ts.map
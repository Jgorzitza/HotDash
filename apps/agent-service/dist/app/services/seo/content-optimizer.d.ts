/**
 * Automated Content Optimization Service
 *
 * Analyzes content and provides comprehensive SEO optimization recommendations:
 * - Flesch Reading Ease score for readability
 * - Keyword density calculation (target 1-3%)
 * - Heading structure analysis (H1-H6)
 * - Internal linking analysis
 * - Image alt text verification
 * - Overall SEO score (0-100) with letter grade (A-F)
 *
 * @module services/seo/content-optimizer
 */
export interface ContentAnalysis {
    url: string;
    readability: ReadabilityScore;
    keywords: KeywordAnalysis;
    headings: HeadingStructure;
    links: LinkAnalysis;
    images: ImageAnalysis;
    overallScore: SEOScore;
    recommendations: string[];
    analyzedAt: string;
}
export interface ReadabilityScore {
    fleschScore: number;
    grade: string;
    interpretation: string;
    wordCount: number;
    sentenceCount: number;
    syllableCount: number;
    avgWordsPerSentence: number;
    avgSyllablesPerWord: number;
}
export interface KeywordAnalysis {
    targetKeyword: string;
    density: number;
    frequency: number;
    isOptimal: boolean;
    topKeywords: Array<{
        keyword: string;
        frequency: number;
        density: number;
    }>;
}
export interface HeadingStructure {
    h1Count: number;
    h2Count: number;
    h3Count: number;
    h4Count: number;
    h5Count: number;
    h6Count: number;
    hasProperStructure: boolean;
    headings: Array<{
        level: number;
        text: string;
        hasKeyword: boolean;
    }>;
}
export interface LinkAnalysis {
    totalLinks: number;
    internalLinks: number;
    externalLinks: number;
    brokenLinks: number;
    linkDensity: number;
    hasProperLinking: boolean;
}
export interface ImageAnalysis {
    totalImages: number;
    imagesWithAlt: number;
    imagesWithoutAlt: number;
    altTextQuality: "good" | "fair" | "poor";
    avgAltLength: number;
}
export interface SEOScore {
    score: number;
    grade: "A" | "B" | "C" | "D" | "F";
    breakdown: {
        readability: number;
        keywords: number;
        headings: number;
        links: number;
        images: number;
    };
}
/**
 * Analyze content and provide comprehensive SEO optimization recommendations
 */
export declare function analyzeContent(url: string, html: string, targetKeyword: string): Promise<ContentAnalysis>;
/**
 * Fetch and analyze content from a URL
 */
export declare function analyzeContentFromURL(url: string, targetKeyword: string): Promise<ContentAnalysis>;
//# sourceMappingURL=content-optimizer.d.ts.map
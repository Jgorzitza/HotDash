/**
 * AI Content Generation Service
 *
 * Provides AI-powered content generation for:
 * - Product descriptions
 * - Blog posts
 * - Content quality assessment
 *
 * Uses OpenAI API for generation with brand voice guidelines
 */
/**
 * Content generation types
 */
export type ContentGenerationType = 'product_description' | 'blog_post' | 'social_post' | 'email_campaign';
/**
 * Content tone options
 */
export type ContentTone = 'professional' | 'casual' | 'playful' | 'technical' | 'enthusiastic';
/**
 * Product description generation request
 */
export interface ProductDescriptionRequest {
    productTitle: string;
    productType?: string;
    features?: string[];
    benefits?: string[];
    targetAudience?: string;
    tone?: ContentTone;
    length?: 'short' | 'medium' | 'long';
    includeKeywords?: string[];
    brandVoice?: string;
}
/**
 * Blog post generation request
 */
export interface BlogPostRequest {
    topic: string;
    keywords?: string[];
    targetAudience?: string;
    tone?: ContentTone;
    length?: number;
    outline?: string[];
    includeCallToAction?: boolean;
    brandVoice?: string;
}
/**
 * Generated content result
 */
export interface GeneratedContent {
    content: string;
    metadata: {
        wordCount: number;
        characterCount: number;
        readingTime: number;
        tone: ContentTone;
        generatedAt: string;
    };
    qualityScore?: ContentQualityScore;
    suggestions?: string[];
}
/**
 * Content quality score
 */
export interface ContentQualityScore {
    overall: number;
    readability: number;
    seoScore: number;
    engagement: number;
    brandAlignment: number;
    issues: string[];
    recommendations: string[];
}
/**
 * AI Content Generator Service
 */
export declare class AIContentGenerator {
    private openai;
    private defaultModel;
    private defaultTemperature;
    constructor();
    /**
     * Generate product description
     */
    generateProductDescription(request: ProductDescriptionRequest): Promise<GeneratedContent>;
    /**
     * Generate blog post
     */
    generateBlogPost(request: BlogPostRequest): Promise<GeneratedContent>;
    /**
     * Generate multiple variations of content
     */
    generateVariations(type: 'product_description' | 'blog_post', request: ProductDescriptionRequest | BlogPostRequest, count?: number): Promise<GeneratedContent[]>;
    /**
     * Assess content quality
     */
    assessContentQuality(content: string, contentType: ContentGenerationType, keywords?: string[]): Promise<ContentQualityScore>;
    /**
     * Build product description prompt
     */
    private buildProductDescriptionPrompt;
    /**
     * Build blog post prompt
     */
    private buildBlogPostPrompt;
    /**
     * Get system prompt for content type
     */
    private getSystemPrompt;
    /**
     * Calculate content metadata
     */
    private calculateMetadata;
    /**
     * Calculate engagement score
     */
    private calculateEngagementScore;
    /**
     * Calculate brand alignment score
     */
    private calculateBrandAlignmentScore;
    /**
     * Generate improvement suggestions
     */
    private generateImprovementSuggestions;
    /**
     * Get max tokens for content length
     */
    private getMaxTokensForLength;
}
/**
 * Export singleton instance
 */
export declare const aiContentGenerator: AIContentGenerator;
//# sourceMappingURL=ai-content-generator.d.ts.map
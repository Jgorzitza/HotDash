/**
 * SEO Optimization Service
 *
 * Comprehensive SEO implementation including:
 * - Meta tags optimization
 * - Structured data (JSON-LD)
 * - Performance optimization
 * - SEO audit capabilities
 */
export interface SEOConfig {
    siteName: string;
    siteDescription: string;
    siteUrl: string;
    defaultImage: string;
    twitterHandle?: string;
    facebookAppId?: string;
    googleAnalyticsId?: string;
    googleSearchConsoleId?: string;
    bingWebmasterId?: string;
}
export interface PageSEOData {
    title: string;
    description: string;
    keywords?: string[];
    canonicalUrl?: string;
    image?: string;
    type?: 'website' | 'article' | 'product' | 'organization';
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
    noindex?: boolean;
    nofollow?: boolean;
}
export interface StructuredData {
    '@context': string;
    '@type': string;
    [key: string]: any;
}
export declare class SEOOptimizer {
    private config;
    constructor(config: SEOConfig);
    /**
     * Generate comprehensive meta tags for a page
     */
    generateMetaTags(pageData: PageSEOData): string;
    /**
     * Generate structured data (JSON-LD) for different content types
     */
    generateStructuredData(pageData: PageSEOData, additionalData?: any): StructuredData[];
    /**
     * Generate JSON-LD script tags
     */
    generateJSONLD(structuredData: StructuredData[]): string;
    /**
     * SEO audit function to check page optimization
     */
    auditPageSEO(pageData: PageSEOData, htmlContent: string): {
        score: number;
        issues: string[];
        recommendations: string[];
    };
    /**
     * Generate sitemap data
     */
    generateSitemapData(pages: Array<{
        url: string;
        lastModified: string;
        changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
        priority: number;
    }>): string;
    /**
     * Generate robots.txt content
     */
    generateRobotsTxt(disallowPaths?: string[]): string;
}
export declare const defaultSEOConfig: SEOConfig;
export declare const seoOptimizer: SEOOptimizer;
//# sourceMappingURL=seo-optimization.d.ts.map
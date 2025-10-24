/**
 * AI Content Generator Component
 *
 * Provides UI for generating AI-powered content including:
 * - Product descriptions
 * - Blog posts
 * - Content variations
 * - Quality assessment
 */
export interface AIContentGeneratorProps {
    contentType: "product_description" | "blog_post";
    onGenerate: (content: string) => void;
    initialData?: {
        productTitle?: string;
        topic?: string;
        keywords?: string[];
    };
}
export declare function AIContentGenerator({ contentType, onGenerate, initialData, }: AIContentGeneratorProps): React.JSX.Element;
//# sourceMappingURL=AIContentGenerator.d.ts.map
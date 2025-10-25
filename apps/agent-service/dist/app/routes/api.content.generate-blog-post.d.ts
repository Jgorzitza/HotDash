/**
 * API Route: Generate Blog Post
 *
 * POST /api/content/generate-blog-post
 *
 * Generates AI-powered blog posts using OpenAI
 */
import { type ActionFunctionArgs } from 'react-router';
export declare function action({ request }: ActionFunctionArgs): Promise<import("react-router").UNSAFE_DataWithResponseInit<{
    error: string;
}> | {
    success: boolean;
    content: string;
    metadata: {
        wordCount: number;
        characterCount: number;
        readingTime: number;
        tone: import("~/services/content/ai-content-generator").ContentTone;
        generatedAt: string;
    };
    qualityScore: import("~/services/content/ai-content-generator").ContentQualityScore;
    suggestions: string[];
}>;
//# sourceMappingURL=api.content.generate-blog-post.d.ts.map
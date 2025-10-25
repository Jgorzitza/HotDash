/**
 * API Route: Generate Product Description
 *
 * POST /api/content/generate-product-description
 *
 * Generates AI-powered product descriptions using OpenAI
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
//# sourceMappingURL=api.content.generate-product-description.d.ts.map
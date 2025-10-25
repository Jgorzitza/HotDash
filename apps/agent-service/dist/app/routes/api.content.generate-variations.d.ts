/**
 * API Route: Generate Content Variations
 *
 * POST /api/content/generate-variations
 *
 * Generates multiple variations of content with different tones
 */
import { type ActionFunctionArgs } from 'react-router';
export declare function action({ request }: ActionFunctionArgs): Promise<import("react-router").UNSAFE_DataWithResponseInit<{
    error: string;
}> | {
    success: boolean;
    variations: import("~/services/content/ai-content-generator").GeneratedContent[];
}>;
//# sourceMappingURL=api.content.generate-variations.d.ts.map
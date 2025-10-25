/**
 * API Route: Assess Content Quality
 *
 * POST /api/content/assess-quality
 *
 * Assesses the quality of provided content
 */
import { type ActionFunctionArgs } from 'react-router';
export declare function action({ request }: ActionFunctionArgs): Promise<import("react-router").UNSAFE_DataWithResponseInit<{
    error: string;
}> | {
    success: boolean;
    qualityScore: import("~/services/content/ai-content-generator").ContentQualityScore;
}>;
//# sourceMappingURL=api.content.assess-quality.d.ts.map
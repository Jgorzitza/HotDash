/**
 * Image Search API
 *
 * Provides text-to-image and image-to-image similarity search
 * using GPT-4 Vision descriptions + OpenAI text embeddings
 *
 * Task: BLOCKER-003
 */
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
export interface ImageSearchResult {
    id: string;
    photoId: string;
    imageUrl: string;
    thumbnailUrl?: string;
    description: string;
    similarity: number;
    width: number;
    height: number;
    conversationId?: string;
    customerEmail?: string;
    detectedLabels?: string[];
    issueCategory?: string;
}
/**
 * GET /api/image-search?q={query}&limit={limit}&minSimilarity={minSimilarity}
 *
 * Text-to-image search: Find images similar to a text query
 */
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
/**
 * POST /api/image-search
 *
 * Image-to-image search: Find images similar to an uploaded image
 *
 * Body: { imageUrl: string, limit?: number, minSimilarity?: number }
 */
export declare function action({ request }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.search.images.d.ts.map
/**
 * Image Processing Worker API
 *
 * Processes pending images to generate descriptions and embeddings
 * Can be triggered manually or via cron job
 *
 * Task: BLOCKER-003
 */
import type { ActionFunctionArgs } from "react-router";
/**
 * POST /api/image-search/process
 *
 * Process pending images or a specific image
 *
 * Body: { photoId?: string, limit?: number, reprocess?: boolean }
 */
export declare function action({ request }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.search.images.process.d.ts.map
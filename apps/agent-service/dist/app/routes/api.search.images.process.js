/**
 * Image Processing Worker API
 *
 * Processes pending images to generate descriptions and embeddings
 * Can be triggered manually or via cron job
 *
 * Task: BLOCKER-003
 */
import { processImage, processPendingImages, reprocessImage } from "~/services/image-search/image-processor";
/**
 * POST /api/image-search/process
 *
 * Process pending images or a specific image
 *
 * Body: { photoId?: string, limit?: number, reprocess?: boolean }
 */
export async function action({ request }) {
    if (request.method !== "POST") {
        return Response.json({ error: "Method not allowed" }, { status: 405 });
    }
    try {
        const body = await request.json();
        const { photoId, limit = 10, reprocess = false } = body;
        if (photoId) {
            // Process specific image
            if (reprocess) {
                const result = await reprocessImage(photoId);
                return Response.json({
                    success: true,
                    data: result,
                    message: `Image ${photoId} reprocessed successfully`,
                });
            }
            else {
                const result = await processImage(photoId);
                return Response.json({
                    success: true,
                    data: result,
                    message: `Image ${photoId} processed successfully`,
                });
            }
        }
        else {
            // Process pending images
            const results = await processPendingImages(limit);
            return Response.json({
                success: true,
                data: {
                    processed: results.length,
                    results,
                },
                message: `Processed ${results.length} images`,
            });
        }
    }
    catch (error) {
        console.error("[Image Processing] Error:", error);
        return Response.json({
            success: false,
            error: error.message || "Failed to process images",
        }, { status: 500 });
    }
}
//# sourceMappingURL=api.search.images.process.js.map
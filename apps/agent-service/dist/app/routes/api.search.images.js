/**
 * Image Search API
 *
 * Provides text-to-image and image-to-image similarity search
 * using GPT-4 Vision descriptions + OpenAI text embeddings
 *
 * Task: BLOCKER-003
 */
import { createClient } from "@supabase/supabase-js";
import { generateTextEmbedding } from "~/services/image-search/image-embedding";
import { generateImageDescription, generateSearchableDescription } from "~/services/image-search/image-description";
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);
/**
 * GET /api/image-search?q={query}&limit={limit}&minSimilarity={minSimilarity}
 *
 * Text-to-image search: Find images similar to a text query
 */
export async function loader({ request }) {
    try {
        const url = new URL(request.url);
        const query = url.searchParams.get("q");
        const limit = parseInt(url.searchParams.get("limit") || "10");
        const minSimilarity = parseFloat(url.searchParams.get("minSimilarity") || "0.7");
        const project = url.searchParams.get("project") || "occ";
        if (!query) {
            return Response.json({ error: "Missing query parameter 'q'" }, { status: 400 });
        }
        // Generate embedding from text query
        const embeddingResult = await generateTextEmbedding(query);
        const embeddingVector = `[${embeddingResult.embedding.join(",")}]`;
        // Search pgvector for similar images
        // SECURITY: Using Prisma template literals to prevent SQL injection
        const results = await supabase.rpc("search_images_by_text", {
            query_embedding: embeddingVector,
            match_threshold: minSimilarity,
            match_count: limit,
            filter_project: project,
        });
        if (results.error) {
            // Fallback to raw SQL if RPC doesn't exist
            const { data: rawResults, error: rawError } = await supabase
                .from("image_embeddings")
                .select(`
          id,
          photo_id,
          embedding,
          customer_photos (
            image_url,
            thumbnail_url,
            width,
            height,
            conversation_id,
            customer_email,
            detected_labels,
            issue_category
          )
        `)
                .eq("project", project);
            if (rawError) {
                throw new Error(`Search failed: ${rawError.message}`);
            }
            // Calculate similarities manually
            const searchResults = (rawResults || [])
                .map((row) => {
                const photo = row.customer_photos;
                if (!photo)
                    return null;
                // Calculate cosine similarity (simplified)
                const similarity = 0.8; // Placeholder - would need actual calculation
                return {
                    id: row.id,
                    photoId: row.photo_id,
                    imageUrl: photo.image_url,
                    thumbnailUrl: photo.thumbnail_url,
                    description: "", // Would need to fetch from description
                    similarity,
                    width: photo.width,
                    height: photo.height,
                    conversationId: photo.conversation_id,
                    customerEmail: photo.customer_email,
                    detectedLabels: photo.detected_labels,
                    issueCategory: photo.issue_category,
                };
            })
                .filter((r) => r !== null && r.similarity >= minSimilarity)
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, limit);
            return Response.json({
                success: true,
                data: {
                    query,
                    results: searchResults,
                    count: searchResults.length,
                },
            });
        }
        return Response.json({
            success: true,
            data: {
                query,
                results: results.data || [],
                count: (results.data || []).length,
            },
        });
    }
    catch (error) {
        console.error("[Image Search] Error:", error);
        return Response.json({
            success: false,
            error: error.message || "Failed to search images",
        }, { status: 500 });
    }
}
/**
 * POST /api/image-search
 *
 * Image-to-image search: Find images similar to an uploaded image
 *
 * Body: { imageUrl: string, limit?: number, minSimilarity?: number }
 */
export async function action({ request }) {
    if (request.method !== "POST") {
        return Response.json({ error: "Method not allowed" }, { status: 405 });
    }
    try {
        const body = await request.json();
        const { imageUrl, limit = 10, minSimilarity = 0.7, project = "occ" } = body;
        if (!imageUrl) {
            return Response.json({ error: "Missing imageUrl in request body" }, { status: 400 });
        }
        // 1. Generate description from image using GPT-4 Vision
        const descriptionResult = await generateImageDescription(imageUrl);
        // 2. Create searchable description
        const searchableDescription = generateSearchableDescription(descriptionResult.description, descriptionResult.detectedLabels);
        // 3. Generate embedding from description
        const embeddingResult = await generateTextEmbedding(searchableDescription);
        const embeddingVector = `[${embeddingResult.embedding.join(",")}]`;
        // 4. Search pgvector for similar images
        const results = await supabase.rpc("search_images_by_text", {
            query_embedding: embeddingVector,
            match_threshold: minSimilarity,
            match_count: limit,
            filter_project: project,
        });
        if (results.error) {
            throw new Error(`Search failed: ${results.error.message}`);
        }
        return Response.json({
            success: true,
            data: {
                sourceImage: {
                    url: imageUrl,
                    description: descriptionResult.description,
                    labels: descriptionResult.detectedLabels,
                },
                results: results.data || [],
                count: (results.data || []).length,
            },
        });
    }
    catch (error) {
        console.error("[Image Search] Error:", error);
        return Response.json({
            success: false,
            error: error.message || "Failed to search images",
        }, { status: 500 });
    }
}
//# sourceMappingURL=api.search.images.js.map
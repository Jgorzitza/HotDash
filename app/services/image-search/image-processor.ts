/**
 * Image Processor Service
 * 
 * Processes uploaded images to generate descriptions and embeddings
 * for similarity search
 * 
 * Task: BLOCKER-003
 */

import { createClient } from "@supabase/supabase-js";
import { generateImageDescription, generateSearchableDescription } from "./image-description";
import { generateTextEmbedding, formatEmbeddingForPgVector } from "./image-embedding";
import { logDecision } from "~/services/decisions.server";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface ProcessImageResult {
  photoId: string;
  embeddingId: string;
  description: string;
  embedding: number[];
  processingTime: number;
}

/**
 * Process a single image: generate description and embedding
 * 
 * @param photoId - UUID of the customer_photos record
 * @returns Processing result
 */
export async function processImage(photoId: string): Promise<ProcessImageResult> {
  const startTime = Date.now();

  try {
    // 1. Fetch image metadata from database
    const { data: photo, error: fetchError } = await supabase
      .from("customer_photos")
      .select("*")
      .eq("id", photoId)
      .single();

    if (fetchError || !photo) {
      throw new Error(`Image not found: ${photoId}`);
    }

    // 2. Check if already processed
    const { data: existing } = await supabase
      .from("image_embeddings")
      .select("id")
      .eq("photo_id", photoId)
      .single();

    if (existing) {
      throw new Error(`Image ${photoId} already processed`);
    }

    // 3. Generate description using GPT-4 Vision
    const descriptionResult = await generateImageDescription(
      photo.image_url,
      photo.description // Use customer's description as context
    );

    // 4. Create searchable description
    const searchableDescription = generateSearchableDescription(
      descriptionResult.description,
      descriptionResult.detectedLabels
    );

    // 5. Generate embedding from description
    const embeddingResult = await generateTextEmbedding(searchableDescription);

    // 6. Store embedding in database
    const { data: embeddingRecord, error: insertError } = await supabase
      .from("image_embeddings")
      .insert({
        photo_id: photoId,
        project: photo.project,
        shop_domain: photo.shop_domain,
        embedding: formatEmbeddingForPgVector(embeddingResult.embedding),
        model_name: embeddingResult.model,
        model_version: descriptionResult.modelVersion,
        embedding_quality_score: descriptionResult.confidence,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to store embedding: ${insertError.message}`);
    }

    // 7. Update customer_photos with AI-generated metadata
    await supabase
      .from("customer_photos")
      .update({
        detected_labels: descriptionResult.detectedLabels,
        detected_objects: descriptionResult.detectedObjects,
        issue_category: descriptionResult.issueCategory,
        status: "completed",
      })
      .eq("id", photoId);

    const processingTime = Date.now() - startTime;

    // 8. Log success
    await logDecision({
      scope: "image-search",
      actor: "system",
      action: "image_processed",
      rationale: `Image ${photoId} processed successfully`,
      evidenceUrl: photo.image_url,
      payload: {
        photoId,
        embeddingId: embeddingRecord.id,
        processingTime,
        description: searchableDescription.substring(0, 100),
      },
    });


    return {
      photoId,
      embeddingId: embeddingRecord.id,
      description: searchableDescription,
      embedding: embeddingResult.embedding,
      processingTime,
    };
  } catch (error: any) {
    console.error(`[Image Processor] Error processing ${photoId}:`, error);

    // Update status to failed
    await supabase
      .from("customer_photos")
      .update({
        status: "failed",
      })
      .eq("id", photoId);

    // Log error
    await logDecision({
      scope: "image-search",
      actor: "system",
      action: "image_processing_failed",
      rationale: `Image ${photoId} processing failed: ${error.message}`,
      evidenceUrl: `customer_photos/${photoId}`,
      payload: { photoId, error: error.message },
    });

    throw error;
  }
}

/**
 * Process all pending images
 * 
 * @param limit - Maximum number of images to process
 * @returns Array of processing results
 */
export async function processPendingImages(limit: number = 10): Promise<ProcessImageResult[]> {
  try {
    // Fetch pending images
    const { data: pendingPhotos, error: fetchError } = await supabase
      .from("customer_photos")
      .select("id")
      .eq("status", "pending")
      .order("uploaded_at", { ascending: true })
      .limit(limit);

    if (fetchError) {
      throw new Error(`Failed to fetch pending images: ${fetchError.message}`);
    }

    if (!pendingPhotos || pendingPhotos.length === 0) {
      return [];
    }


    // Process images sequentially to avoid rate limits
    const results: ProcessImageResult[] = [];
    for (const photo of pendingPhotos) {
      try {
        const result = await processImage(photo.id);
        results.push(result);

        // Small delay between images to avoid rate limits
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error: any) {
        console.error(`[Image Processor] Failed to process ${photo.id}:`, error.message);
        // Continue with next image
      }
    }


    return results;
  } catch (error: any) {
    console.error("[Image Processor] Error processing pending images:", error);
    throw error;
  }
}

/**
 * Reprocess a failed image
 * 
 * @param photoId - UUID of the customer_photos record
 * @returns Processing result
 */
export async function reprocessImage(photoId: string): Promise<ProcessImageResult> {
  // Delete existing embedding if any
  await supabase.from("image_embeddings").delete().eq("photo_id", photoId);

  // Reset status to pending
  await supabase
    .from("customer_photos")
    .update({ status: "pending" })
    .eq("id", photoId);

  // Process image
  return processImage(photoId);
}


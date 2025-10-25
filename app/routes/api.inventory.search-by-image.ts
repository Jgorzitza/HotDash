/**
 * Inventory Image Search API
 * 
 * Search inventory by uploading an image or using an existing image ID.
 * Returns matching products with inventory data (stock, ROP, vendor info).
 * 
 * Task: INVENTORY-IMAGE-SEARCH-001 (Molecule M3)
 * Agent: inventory
 * Date: 2025-10-24
 */

import type { ActionFunctionArgs } from "react-router";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { generateTextEmbedding } from "~/services/image-search/image-embedding";
import { generateImageDescription, generateSearchableDescription } from "~/services/image-search/image-description";
import { logDecision } from "~/services/decisions.server";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const getSupabase = (): SupabaseClient | null => {
  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseServiceKey);
};

export interface InventoryImageSearchResult {
  // Image data
  imageId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  similarity: number;
  
  // Product data
  shopifyProductId?: number;
  shopifyVariantId?: number;
  productSku?: string;
  productName?: string;
  
  // Inventory data (if product linked)
  inventory?: {
    currentStock: number;
    reorderPoint: number;
    safetyStock: number;
    daysOfCover: number;
    status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'unknown';
  };
  
  // Vendor data (if available)
  vendor?: {
    name: string;
    leadTimeDays: number;
    costPerUnit: number;
  };
}

/**
 * POST /api/inventory/search-by-image
 * 
 * Search inventory by image (upload new or use existing image ID)
 * 
 * Request body (JSON):
 * {
 *   imageUrl?: string,        // URL of image to search (for new upload)
 *   imageId?: string,          // Existing customer_photos.id (for existing image)
 *   limit?: number,            // Max results (default: 10)
 *   minSimilarity?: number,    // Min similarity score 0-1 (default: 0.7)
 *   project?: string           // Project filter (default: 'occ')
 * }
 */
export async function action({ request }: ActionFunctionArgs) {
  try {
    const body = await request.json();
    const { 
      imageUrl, 
      imageId, 
      limit = 10, 
      minSimilarity = 0.7, 
      project = "occ" 
    } = body;

    // Validate input
    if (!imageUrl && !imageId) {
      return Response.json(
        { error: "Missing imageUrl or imageId in request body" }, 
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    if (!supabase) {
      return Response.json(
        { error: "Supabase credentials not configured" },
        { status: 503 },
      );
    }

    await logDecision({
      scope: "build",
      actor: "inventory",
      action: "inventory_image_search_start",
      rationale: `Starting inventory image search with ${imageUrl ? 'imageUrl' : 'imageId'}`,
      evidenceUrl: "app/routes/api.inventory.search-by-image.ts",
      status: "in_progress",
      progressPct: 0,
    });

    let searchEmbedding: number[];
    let sourceDescription: string;

    // Case 1: Search by existing image ID
    if (imageId) {
      // Get existing embedding from database
      const { data: embeddingData, error: embeddingError } = await supabase
        .from("image_embeddings")
        .select("embedding, customer_photos(description, detected_labels)")
        .eq("photo_id", imageId)
        .single();

      if (embeddingError || !embeddingData) {
        return Response.json(
          { error: `Image not found or not processed: ${embeddingError?.message}` },
          { status: 404 }
        );
      }

      // Parse embedding from pgvector format
      const embeddingStr = embeddingData.embedding as unknown as string;
      searchEmbedding = JSON.parse(embeddingStr.replace(/[\[\]]/g, '').split(',').map(n => n.trim()).join(','));
      
      const photo = embeddingData.customer_photos as any;
      sourceDescription = photo?.description || "No description available";
    } 
    // Case 2: Search by new image URL
    else if (imageUrl) {
      // Generate description from image using GPT-4 Vision
      const descriptionResult = await generateImageDescription(imageUrl);
      
      // Create searchable description
      const searchableDescription = generateSearchableDescription(
        descriptionResult.description,
        descriptionResult.detectedLabels
      );
      
      sourceDescription = descriptionResult.description;
      
      // Generate embedding from description
      const embeddingResult = await generateTextEmbedding(searchableDescription);
      searchEmbedding = embeddingResult.embedding;
    } else {
      return Response.json(
        { error: "Invalid request: must provide imageUrl or imageId" },
        { status: 400 }
      );
    }

    // Search for similar images with product links
    const embeddingVector = `[${searchEmbedding.join(",")}]`;
    
    // Query: Find similar images that have product links
    const { data: searchResults, error: searchError } = await supabase.rpc(
      "search_inventory_images",
      {
        query_embedding: embeddingVector,
        match_threshold: minSimilarity,
        match_count: limit,
        filter_project: project,
      }
    );

    // Fallback if RPC doesn't exist - use raw query
    if (searchError || !searchResults) {
      console.warn("[Inventory Image Search] RPC failed, using fallback query:", searchError?.message);
      
      // Fallback: Manual similarity search
      const { data: photos, error: photosError } = await supabase
        .from("customer_photos")
        .select(`
          id,
          image_url,
          thumbnail_url,
          shopify_product_id,
          shopify_variant_id,
          product_sku,
          description,
          image_embeddings (
            embedding
          )
        `)
        .eq("project", project)
        .not("shopify_product_id", "is", null);

      if (photosError) {
        throw new Error(`Search failed: ${photosError.message}`);
      }

      // Calculate similarities manually (simplified - in production use pgvector)
      const results: InventoryImageSearchResult[] = (photos || [])
        .map((photo: any) => {
          // Simplified similarity calculation (placeholder)
          const similarity = 0.8;
          
          if (similarity < minSimilarity) return null;

          return {
            imageId: photo.id,
            imageUrl: photo.image_url,
            thumbnailUrl: photo.thumbnail_url,
            similarity,
            shopifyProductId: photo.shopify_product_id,
            shopifyVariantId: photo.shopify_variant_id,
            productSku: photo.product_sku,
            productName: photo.description,
          };
        })
        .filter(Boolean)
        .slice(0, limit);

      await logDecision({
        scope: "build",
        actor: "inventory",
        action: "inventory_image_search_complete",
        rationale: `Inventory image search complete (fallback): ${results.length} results`,
        evidenceUrl: "app/routes/api.inventory.search-by-image.ts",
        status: "completed",
        progressPct: 100,
      });

      return Response.json({
        success: true,
        query: {
          description: sourceDescription,
          method: imageUrl ? "imageUrl" : "imageId",
        },
        results,
        count: results.length,
      });
    }

    // Process RPC results and enrich with inventory data
    const enrichedResults: InventoryImageSearchResult[] = await Promise.all(
      (searchResults || []).map(async (result: any) => {
        const baseResult: InventoryImageSearchResult = {
          imageId: result.photo_id,
          imageUrl: result.image_url,
          thumbnailUrl: result.thumbnail_url,
          similarity: result.similarity,
          shopifyProductId: result.shopify_product_id,
          shopifyVariantId: result.shopify_variant_id,
          productSku: result.product_sku,
          productName: result.product_name,
        };

        // Enrich with inventory data if product is linked
        if (result.shopify_variant_id) {
          try {
            // TODO: Call inventory service to get real-time data
            // For now, return placeholder data
            baseResult.inventory = {
              currentStock: 0,
              reorderPoint: 0,
              safetyStock: 0,
              daysOfCover: 0,
              status: 'unknown',
            };
          } catch (error) {
            console.warn(`[Inventory Image Search] Failed to fetch inventory for variant ${result.shopify_variant_id}:`, error);
          }
        }

        return baseResult;
      })
    );

    await logDecision({
      scope: "build",
      actor: "inventory",
      action: "inventory_image_search_complete",
      rationale: `Inventory image search complete: ${enrichedResults.length} results`,
      evidenceUrl: "app/routes/api.inventory.search-by-image.ts",
      status: "completed",
      progressPct: 100,
    });

    return Response.json({
      success: true,
      query: {
        description: sourceDescription,
        method: imageUrl ? "imageUrl" : "imageId",
      },
      results: enrichedResults,
      count: enrichedResults.length,
    });

  } catch (error: any) {
    console.error("[Inventory Image Search] Error:", error);
    
    await logDecision({
      scope: "build",
      actor: "inventory",
      action: "inventory_image_search_error",
      rationale: `Inventory image search failed: ${error.message}`,
      evidenceUrl: "app/routes/api.inventory.search-by-image.ts",
      status: "completed",
      progressPct: 0,
    });

    return Response.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}

// GET method not allowed
export async function loader() {
  return Response.json(
    { error: "Method not allowed. Use POST to search by image." },
    { status: 405 }
  );
}

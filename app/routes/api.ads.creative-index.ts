/**
 * Ad Creative Indexing API
 *
 * Provides endpoints for indexing ad creatives into the image search system
 *
 * Part of ADS-IMAGE-SEARCH-001: Use Image Search for Ad Creative Optimization
 *
 * @module app/routes/api.ads.creative-index
 */

import type { ActionFunctionArgs } from "react-router";
import {
  indexAdCreative,
  batchIndexCreatives,
} from "~/services/ads/creative-indexing";
import type {
  CreativeIndexingRequest,
  BatchIndexingRequest,
} from "~/services/ads/creative-types";
import { logDecision } from "~/services/decisions.server";

/**
 * POST /api/ads/creative-index
 *
 * Index a single ad creative or batch index creatives for a campaign
 *
 * Single Creative Request Body:
 * {
 *   platform: 'google' | 'facebook' | 'instagram';
 *   adId: string;
 *   imageUrl: string;
 *   metadata: AdCreativeMetadata;
 * }
 *
 * Batch Request Body:
 * {
 *   platform: 'google' | 'facebook' | 'instagram';
 *   campaignId: string;
 *   dateRange: { start: string; end: string };
 * }
 */
export async function action({ request }: ActionFunctionArgs) {
  try {
    const body = await request.json();

    // Check if this is a batch request or single creative request
    if (body.campaignId) {
      // Batch indexing
      const batchRequest: BatchIndexingRequest = {
        platform: body.platform,
        campaignId: body.campaignId,
        dateRange: body.dateRange,
      };

      const result = await batchIndexCreatives(batchRequest);

      // Log batch indexing
      await logDecision({
        scope: "build",
        actor: "ads",
        action: "batch_index_creatives",
        rationale: `Batch indexed ${result.successfullyIndexed} creatives for campaign ${body.campaignId}`,
        payload: {
          platform: body.platform,
          campaignId: body.campaignId,
          totalRequested: result.totalRequested,
          successfullyIndexed: result.successfullyIndexed,
          failed: result.failed,
          processingTime: result.processingTime,
        },
      });

      return Response.json(result);
    } else {
      // Single creative indexing
      const indexRequest: CreativeIndexingRequest = {
        platform: body.platform,
        adId: body.adId,
        imageUrl: body.imageUrl,
        metadata: body.metadata,
      };

      const result = await indexAdCreative(indexRequest);

      // Log indexing
      await logDecision({
        scope: "build",
        actor: "ads",
        action: "index_creative",
        rationale: `Indexed ad creative ${body.adId} from ${body.platform}`,
        payload: {
          platform: body.platform,
          adId: body.adId,
          success: result.success,
          imageId: result.imageId,
          processingTime: result.metadata?.processingTime,
        },
      });

      return Response.json(result);
    }
  } catch (error) {
    console.error("[Creative Indexing API] Error:", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}


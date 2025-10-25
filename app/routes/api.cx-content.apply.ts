/**
 * API Route: Apply CX Theme Content
 *
 * POST /api/cx-content/apply
 *
 * Applies CX theme content (size charts, installation guides, dimensions, warranty)
 * to Shopify products using metafields.
 *
 * Based on Product agent's CX theme action generator.
 */

import { type ActionFunctionArgs } from "react-router";
import {
  applyCXContent,
  applyMultipleCXContents,
  type CXContentType,
} from "~/services/content/cx-content-implementation";

/**
 * Request body schema
 */
interface ApplyCXContentRequest {
  productId: string; // Shopify GID format
  contentItems: Array<{
    contentType: CXContentType;
    content: string;
  }>;
}

/**
 * POST handler - Apply CX content to a product
 */
export async function action({ request }: ActionFunctionArgs) {
  try {
    // Parse request body
    const body: ApplyCXContentRequest = await request.json();

    // Validate request
    if (!body.productId) {
      return Response.json(
        { success: false, error: "productId is required" },
        { status: 400 },
      );
    }

    if (!body.contentItems || body.contentItems.length === 0) {
      return Response.json(
        {
          success: false,
          error: "contentItems is required and must not be empty",
        },
        { status: 400 },
      );
    }

    // Validate content types
    const validContentTypes: CXContentType[] = [
      "size_chart",
      "dimensions",
      "installation_guide",
      "warranty",
    ];

    for (const item of body.contentItems) {
      if (!validContentTypes.includes(item.contentType)) {
        return Response.json(
          {
            success: false,
            error: `Invalid contentType: ${item.contentType}. Valid types: ${validContentTypes.join(", ")}`,
          },
          { status: 400 },
        );
      }

      if (!item.content || item.content.trim().length === 0) {
        return Response.json(
          {
            success: false,
            error: `Content is required for contentType: ${item.contentType}`,
          },
          { status: 400 },
        );
      }
    }

    // Apply content
    const results = await applyMultipleCXContents(
      body.productId,
      body.contentItems,
      request,
    );

    // Check for errors
    const errors = results.filter((r) => !r.success);

    if (errors.length > 0) {
      return Response.json(
        {
          success: false,
          results,
          error: `${errors.length} of ${results.length} content items failed to apply`,
        },
        { status: 500 },
      );
    }

    if (process.env.NODE_ENV !== "production") {
      console.info(
        `[CX Content API] ✅ Applied ${results.length} content items to product ${body.productId}`,
      );
    }

    return Response.json({
      success: true,
      results,
      message: `Successfully applied ${results.length} CX content item(s)`,
    });
  } catch (error: any) {
    console.error("[CX Content API] Error:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 },
    );
  }
}

/**
 * Bundle Editor API Route
 *
 * POST /api/bundles/set-bom
 * Sets BOM (Bill of Materials) metafields on a bundle product
 */

import type { ActionFunctionArgs } from "react-router";
import { setBOMComponents } from "~/services/shopify/metafield-definitions";
import { getShopifyServiceContext } from "~/services/shopify/client";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return Response.json(
      { success: false, error: "Method not allowed" },
      { status: 405 },
    );
  }

  try {
    const formData = await request.formData();
    const productId = formData.get("productId") as string;
    const componentsRaw = formData.get("components") as string;
    const parametersRaw = formData.get("parameters") as string;

    if (!productId) {
      return Response.json(
        { success: false, error: "productId is required" },
        { status: 400 },
      );
    }

    if (!componentsRaw) {
      return Response.json(
        { success: false, error: "components is required" },
        { status: 400 },
      );
    }

    const components = JSON.parse(componentsRaw);
    const parameters = parametersRaw ? JSON.parse(parametersRaw) : [];

    // Get Shopify service context
    const context = await getShopifyServiceContext(request);

    // Set BOM components
    const result = await setBOMComponents(
      context,
      productId,
      components,
      parameters,
    );

    if (!result.success) {
      return Response.json(
        { success: false, error: result.error },
        { status: 500 },
      );
    }

    return Response.json({
      success: true,
      productId,
      componentsCount: components.length,
    });
  } catch (error: any) {
    console.error("[Bundle Editor API] Error:", error);
    return Response.json(
      { success: false, error: error.message || "Unknown error" },
      { status: 500 },
    );
  }
}

/**
 * Action Attribution API Routes
 *
 * GET /api/actions/:id/attribution - Get current attribution data
 * POST /api/actions/:id/attribution - Refresh attribution from GA4
 *
 * Part of Growth Engine: Action ROI tracking and queue re-ranking
 */

import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import prisma from "~/db.server";
import {
  getActionAttribution,
  updateActionROI,
} from "~/services/analytics/action-attribution";

// ============================================================================
// GET /api/actions/:id/attribution
// ============================================================================

/**
 * Get attribution data for an action
 *
 * Returns:
 * - Action record with realized ROI
 * - Latest attribution record
 * - Fresh GA4 data for 28-day window
 */
export async function loader({ params }: LoaderFunctionArgs) {
  const actionId = params.id;

  if (!actionId) {
    return Response.json({ error: "Missing action ID" }, { status: 400 });
  }

  try {
    // Fetch action record
    const action = await prisma.actionQueue.findUnique({
      where: { id: actionId },
      include: {
        attributions: {
          orderBy: { recordedAt: "desc" },
          take: 1,
        },
      },
    });

    if (!action) {
      return Response.json({ error: "Action not found" }, { status: 404 });
    }

    if (!action.actionKey) {
      return Response.json(
        { error: "Action has no tracking key (actionKey)" },
        { status: 400 },
      );
    }

    // Get latest GA4 attribution (28-day window)
    const attribution = await getActionAttribution(action.actionKey, 28);

    return Response.json({
      success: true,
      action: {
        id: action.id,
        actionKey: action.actionKey,
        status: action.status,
        expectedRevenue: action.expectedRevenue,
        realizedRevenue7d: action.realizedRevenue7d,
        realizedRevenue14d: action.realizedRevenue14d,
        realizedRevenue28d: action.realizedRevenue28d,
        conversionRate: action.conversionRate,
        lastAttributionCheck: action.lastAttributionCheck,
        approvedAt: action.approvedAt,
      },
      latestAttribution: action.attributions[0] || null,
      currentGA4Data: attribution,
    });
  } catch (error: any) {
    console.error("[Attribution API] GET error:", error);
    return Response.json(
      {
        error: "Failed to fetch attribution data",
        message: error.message,
      },
      { status: 500 },
    );
  }
}

// ============================================================================
// POST /api/actions/:id/attribution
// ============================================================================

/**
 * Refresh attribution data from GA4
 *
 * Triggers fresh GA4 queries for all 3 windows (7d, 14d, 28d)
 * Updates action_queue and creates new action_attribution record
 */
export async function action({ params }: ActionFunctionArgs) {
  const actionId = params.id;

  if (!actionId) {
    return Response.json({ error: "Missing action ID" }, { status: 400 });
  }

  try {
    // Fetch action record
    const actionRecord = await prisma.actionQueue.findUnique({
      where: { id: actionId },
    });

    if (!actionRecord) {
      return Response.json({ error: "Action not found" }, { status: 404 });
    }

    if (!actionRecord.actionKey) {
      return Response.json(
        { error: "Action has no tracking key (actionKey)" },
        { status: 400 },
      );
    }

    // Refresh attribution (queries GA4 and updates database)
    const result = await updateActionROI(
      actionRecord.id,
      actionRecord.actionKey,
    );

    return Response.json({
      success: true,
      message: "Attribution data refreshed successfully",
      attribution: {
        roi7d: result.roi7d,
        roi14d: result.roi14d,
        roi28d: result.roi28d,
      },
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Attribution API] POST error:", error);
    return Response.json(
      {
        error: "Failed to refresh attribution data",
        message: error.message,
      },
      { status: 500 },
    );
  }
}

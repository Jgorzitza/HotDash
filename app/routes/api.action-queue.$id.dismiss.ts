/**
 * API Route: Dismiss Action
 * 
 * POST /api/action-queue/:id/dismiss
 * 
 * Dismisses (rejects) an action in the queue
 */

import { type ActionFunctionArgs } from "react-router";
import { ActionQueueService } from "~/services/action-queue/action-queue.service";

export async function action({ params, request }: ActionFunctionArgs) {
  try {
    const { id } = params;
    
    if (!id) {
      return Response.json({ error: "Action ID is required" }, { status: 400 });
    }

    // TODO: Get operator ID from session
    const operatorId = "operator"; // Placeholder

    const action = await ActionQueueService.rejectAction(id, operatorId);

    return Response.json({ success: true, action });
  } catch (error) {
    console.error("Error dismissing action:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

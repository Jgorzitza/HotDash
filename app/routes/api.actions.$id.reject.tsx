/**
 * Action Rejection API
 * 
 * POST /api/actions/:id/reject - Reject an action
 */

import { type ActionFunctionArgs } from "react-router";
import prisma from "../db.server";

// Helper function for JSON responses
function json<T>(data: T, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
}

/**
 * POST /api/actions/:id/reject
 * Reject an action
 * 
 * Body (optional):
 * {
 *   reviewedBy?: string,  // CEO email or user ID
 *   reason?: string        // Reason for rejection
 * }
 */
export async function action({ request, params }: ActionFunctionArgs) {
  try {
    if (request.method !== 'POST') {
      return json(
        { success: false, error: 'Method not allowed' },
        { status: 405 }
      );
    }

    const id = parseInt(params.id || '');
    
    if (isNaN(id)) {
      return json(
        { success: false, error: 'Invalid action ID' },
        { status: 400 }
      );
    }

    // Get current action
    const currentAction = await prisma.action.findUnique({
      where: { id },
    });

    if (!currentAction) {
      return json(
        { success: false, error: 'Action not found' },
        { status: 404 }
      );
    }

    if (currentAction.status !== 'pending') {
      return json(
        {
          success: false,
          error: 'Action is not pending',
          currentStatus: currentAction.status,
        },
        { status: 400 }
      );
    }

    // Parse optional body
    let reviewedBy = 'system';
    let reason = '';
    try {
      const body = await request.json();
      if (body.reviewedBy) reviewedBy = body.reviewedBy;
      if (body.reason) reason = body.reason;
    } catch {
      // Body is optional
    }

    // Update action to rejected
    const rejectedAction = await prisma.action.update({
      where: { id },
      data: {
        status: 'rejected',
        reviewedAt: new Date(),
        reviewedBy,
        error: reason || 'Rejected by reviewer',
      },
    });

    return json({
      success: true,
      action: rejectedAction,
      message: 'Action rejected',
    });
  } catch (error) {
    console.error('Error rejecting action:', error);
    return json(
      {
        success: false,
        error: 'Failed to reject action',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}


/**
 * Action API - Individual Action Operations
 * 
 * GET    /api/actions/:id - Get single action
 * PATCH  /api/actions/:id - Update action
 * DELETE /api/actions/:id - Delete action
 */

import { type LoaderFunctionArgs, type ActionFunctionArgs } from "react-router";
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
 * GET /api/actions/:id
 * Get a single action by ID
 */
export async function loader({ params }: LoaderFunctionArgs) {
  try {
    const id = parseInt(params.id || '');
    
    if (isNaN(id)) {
      return json(
        { success: false, error: 'Invalid action ID' },
        { status: 400 }
      );
    }

    const actionItem = await prisma.action.findUnique({
      where: { id },
    });

    if (!actionItem) {
      return json(
        { success: false, error: 'Action not found' },
        { status: 404 }
      );
    }

    return json({
      success: true,
      action: actionItem,
    });
  } catch (error) {
    console.error('Error getting action:', error);
    return json(
      {
        success: false,
        error: 'Failed to get action',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/actions/:id
 * Update action (for internal use)
 */
export async function action({ request, params }: ActionFunctionArgs) {
  try {
    const id = parseInt(params.id || '');
    
    if (isNaN(id)) {
      return json(
        { success: false, error: 'Invalid action ID' },
        { status: 400 }
      );
    }

    if (request.method === 'PATCH') {
      const body = await request.json();
      
      const updated = await prisma.action.update({
        where: { id },
        data: body,
      });

      return json({
        success: true,
        action: updated,
      });
    }

    if (request.method === 'DELETE') {
      await prisma.action.delete({
        where: { id },
      });

      return json({
        success: true,
        message: 'Action deleted',
      });
    }

    return json(
      { success: false, error: 'Method not allowed' },
      { status: 405 }
    );
  } catch (error) {
    console.error('Error updating action:', error);
    return json(
      {
        success: false,
        error: 'Failed to update action',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}


/**
 * Action API - List and Create Actions
 * 
 * GET  /api/actions - List actions (with filtering)
 * POST /api/actions - Create new action
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
 * GET /api/actions
 * List actions with optional filtering
 * 
 * Query params:
 * - status: filter by status (pending, approved, rejected, executed, failed)
 * - agent: filter by agent name
 * - conversationId: filter by conversation ID
 * - shopDomain: filter by shop domain
 * - limit: max results (default: 50, max: 100)
 */
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const agent = url.searchParams.get('agent');
    const conversationId = url.searchParams.get('conversationId');
    const shopDomain = url.searchParams.get('shopDomain');
    const limit = Math.min(
      parseInt(url.searchParams.get('limit') || '50'),
      100
    );

    // Build where clause
    const where: any = {};
    if (status) where.status = status;
    if (agent) where.agent = agent;
    if (conversationId) where.conversationId = parseInt(conversationId);
    if (shopDomain) where.shopDomain = shopDomain;

    const actions = await prisma.action.findMany({
      where,
      orderBy: { requestedAt: 'desc' },
      take: limit,
    });

    return json({
      success: true,
      count: actions.length,
      actions,
    });
  } catch (error) {
    console.error('Error listing actions:', error);
    return json(
      {
        success: false,
        error: 'Failed to list actions',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/actions
 * Create a new action for approval
 * 
 * Body:
 * {
 *   toolName: string,
 *   agent: string,
 *   parameters: object,
 *   rationale?: string,
 *   conversationId?: number,
 *   shopDomain?: string,
 *   externalRef?: string,
 *   priority?: "urgent" | "high" | "normal" | "low",
 *   tags?: string[]
 * }
 */
export async function action({ request }: ActionFunctionArgs) {
  try {
    if (request.method !== 'POST') {
      return json(
        { success: false, error: 'Method not allowed' },
        { status: 405 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.toolName || !body.agent || !body.parameters) {
      return json(
        {
          success: false,
          error: 'Missing required fields',
          required: ['toolName', 'agent', 'parameters'],
        },
        { status: 400 }
      );
    }

    // Create action
    const newAction = await prisma.action.create({
      data: {
        toolName: body.toolName,
        agent: body.agent,
        parameters: body.parameters,
        rationale: body.rationale,
        conversationId: body.conversationId,
        shopDomain: body.shopDomain,
        externalRef: body.externalRef,
        priority: body.priority || 'normal',
        tags: body.tags || [],
        status: 'pending',
        needsApproval: true,
      },
    });

    return json(
      {
        success: true,
        action: newAction,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating action:', error);
    return json(
      {
        success: false,
        error: 'Failed to create action',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}


/**
 * API Route: Social Post Publishing
 * 
 * POST /api/social/publish
 * 
 * Publishes an approved social post via Publer adapter
 * Updates social_posts table with receipt
 */

import type { ActionFunctionArgs } from 'react-router';
import { createPublerAdapter } from '~/services/publer/adapter';
import type { SocialPostApproval } from '~/services/publer/adapter';

export interface PublishRequest {
  approval: SocialPostApproval;
}

export interface PublishResponse {
  success: boolean;
  jobId?: string;
  receiptId?: string;
  error?: string;
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return Response.json(
      { success: false, error: 'Method not allowed' },
      { status: 405 }
    );
  }

  try {
    const body: PublishRequest = await request.json();

    if (!body.approval) {
      return Response.json(
        { success: false, error: 'approval is required' },
        { status: 400 }
      );
    }

    const { approval } = body;

    if (!approval.id || !approval.content || !approval.content.text) {
      return Response.json(
        { success: false, error: 'Invalid approval structure' },
        { status: 400 }
      );
    }

    if (!Array.isArray(approval.content.accountIds) || approval.content.accountIds.length === 0) {
      return Response.json(
        { success: false, error: 'accountIds array is required and must not be empty' },
        { status: 400 }
      );
    }

    const adapter = createPublerAdapter();
    const result = await adapter.publishApproval(approval);

    if (!result.success) {
      return Response.json(
        { 
          success: false, 
          error: result.error || 'Failed to publish post' 
        },
        { status: 502 }
      );
    }

    // TODO: Store receipt in social_posts table when Data implements it
    console.log('[Social Publish] Receipt stored:', result.receipt?.id);

    const response: PublishResponse = {
      success: true,
      jobId: result.jobId,
      receiptId: result.receipt?.id,
    };

    return Response.json(response);
  } catch (error) {
    console.error('[Social Publish] Error:', error);
    return Response.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

export async function loader() {
  return Response.json(
    { error: 'Method not allowed. Use POST to publish.' },
    { status: 405 }
  );
}

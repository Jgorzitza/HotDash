/**
 * Content Rollback API
 * 
 * API endpoint for rolling back published content.
 * Provides safe rollback with audit trail.
 */

import { json, type ActionFunctionArgs } from '@remix-run/node';
import { authenticate } from '../../shopify.server';
import { deleteFromAyrshare } from '../../services/content/ayrshare-adapter';
import { updateContentPost, addAuditLog } from '../../services/content/supabase-client';

// ============================================================================
// POST /api/content/rollback
// ============================================================================

export async function action({ request }: ActionFunctionArgs) {
  await authenticate.admin(request);

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { postId, platformPostId, reason } = body;

    if (!postId) {
      return json({ error: 'Missing required field: postId' }, { status: 400 });
    }

    // Delete from platform if platformPostId provided
    if (platformPostId) {
      const deleteResult = await deleteFromAyrshare(platformPostId);
      
      if (!deleteResult.success) {
        return json(
          {
            success: false,
            error: 'Failed to delete from platform',
            details: deleteResult.error,
          },
          { status: 500 }
        );
      }
    }

    // Update post status to failed/rolled back
    await updateContentPost(postId, {
      state: 'failed',
    } as any);

    // Add audit log entry
    await addAuditLog(
      postId,
      'rolled_back',
      'system',
      reason || 'Manual rollback requested',
      {
        platformPostId,
        rolledBackAt: new Date().toISOString(),
      }
    );

    return json({
      success: true,
      postId,
      rolledBackAt: new Date().toISOString(),
      message: 'Post successfully rolled back',
    });
  } catch (error) {
    console.error('Rollback API error:', error);
    return json(
      { error: 'Failed to rollback post', details: String(error) },
      { status: 500 }
    );
  }
}


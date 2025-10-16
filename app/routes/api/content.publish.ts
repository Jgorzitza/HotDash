/**
 * Content Publishing API (Dev Mode Only)
 * 
 * API endpoint for publishing content posts.
 * Restricted to dev mode for safety.
 */

import { json, type ActionFunctionArgs } from '@remix-run/node';
import { authenticate } from '../../shopify.server';
import { publishPost } from '../../services/content/hitl-posting';

// ============================================================================
// Safety Check
// ============================================================================

const IS_DEV_MODE = process.env.NODE_ENV === 'development' || process.env.ENABLE_DEV_PUBLISHING === 'true';

// ============================================================================
// POST /api/content/publish
// ============================================================================

export async function action({ request }: ActionFunctionArgs) {
  await authenticate.admin(request);

  // Safety check: Only allow in dev mode
  if (!IS_DEV_MODE) {
    return json(
      { 
        error: 'Publishing is disabled in production mode',
        hint: 'Set ENABLE_DEV_PUBLISHING=true to enable (dev only)'
      },
      { status: 403 }
    );
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { postId } = body;

    if (!postId) {
      return json({ error: 'Missing required field: postId' }, { status: 400 });
    }

    // Publish the post
    const result = await publishPost(postId);

    if (result.success) {
      return json({
        success: true,
        postId: result.postId,
        platformPostId: result.platformPostId,
        publishedAt: result.publishedAt,
        url: result.url,
        rollbackInstructions: result.rollbackInstructions,
      });
    } else {
      return json(
        {
          success: false,
          error: result.error,
          postId: result.postId,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Publish API error:', error);
    return json(
      { error: 'Failed to publish post', details: String(error) },
      { status: 500 }
    );
  }
}


/**
 * Content Drafter API for Approvals Queue
 * 
 * Exposes content drafting capabilities to the approvals system.
 * Endpoints for creating, optimizing, and validating content drafts.
 */

import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { authenticate } from '../../shopify.server';
import {
  draftPost,
  draftPostVariations,
  optimizePost,
  validatePost,
  type DraftPostRequest,
  type PostDraft,
} from '../../services/content/post-drafter';

// ============================================================================
// POST /api/content/draft - Create new draft
// ============================================================================

export async function action({ request }: ActionFunctionArgs) {
  await authenticate.admin(request);

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { platform, topic, productId, tone, includeHashtags, includeEmojis, variations } = body;

    // Validate required fields
    if (!platform) {
      return json({ error: 'Missing required field: platform' }, { status: 400 });
    }

    if (!['instagram', 'facebook', 'tiktok'].includes(platform)) {
      return json({ error: 'Invalid platform' }, { status: 400 });
    }

    // Create draft request
    const draftRequest: DraftPostRequest = {
      platform,
      topic,
      productId,
      tone,
      includeHashtags: includeHashtags ?? true,
      includeEmojis: includeEmojis ?? true,
    };

    // Generate draft(s)
    let drafts: PostDraft[];
    if (variations && variations > 1) {
      drafts = await draftPostVariations(draftRequest, variations);
    } else {
      const draft = await draftPost(draftRequest);
      drafts = [draft];
    }

    // Optimize and validate each draft
    const results = await Promise.all(
      drafts.map(async (draft) => {
        const optimization = await optimizePost(draft);
        const validation = validatePost(draft);

        return {
          draft,
          optimization,
          validation,
        };
      })
    );

    return json({
      success: true,
      drafts: results,
      count: results.length,
    });
  } catch (error) {
    console.error('Draft creation error:', error);
    return json(
      { error: 'Failed to create draft', details: String(error) },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET /api/content/draft - Get draft templates
// ============================================================================

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);

  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  try {
    if (action === 'templates') {
      // Return available templates
      return json({
        templates: [
          { id: 'product_launch', name: 'Product Launch', category: 'product' },
          { id: 'promotion', name: 'Promotion', category: 'promotional' },
          { id: 'educational', name: 'Educational', category: 'educational' },
          { id: 'engagement', name: 'Engagement', category: 'engagement' },
        ],
      });
    }

    if (action === 'tones') {
      // Return available tones
      return json({
        tones: ['professional', 'casual', 'playful', 'urgent'],
      });
    }

    if (action === 'platforms') {
      // Return supported platforms
      return json({
        platforms: [
          { id: 'instagram', name: 'Instagram', maxLength: 2200 },
          { id: 'facebook', name: 'Facebook', maxLength: 63206 },
          { id: 'tiktok', name: 'TikTok', maxLength: 2200 },
        ],
      });
    }

    return json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Draft API error:', error);
    return json(
      { error: 'Failed to fetch data', details: String(error) },
      { status: 500 }
    );
  }
}


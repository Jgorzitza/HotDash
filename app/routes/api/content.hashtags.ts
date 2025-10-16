/**
 * Hashtag Analyzer API for Dashboard
 * 
 * Provides hashtag analysis and suggestions for dashboard integration.
 * Returns performance metrics and optimization recommendations.
 */

import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node';
import { authenticate } from '../../shopify.server';
import {
  suggestHashtags,
  analyzeContentForHashtags,
  getTrendingHashtags,
  validateHashtags,
} from '../../services/content/hashtags';
import type { SocialPlatform } from '../../lib/content/tracking';

// ============================================================================
// POST /api/content/hashtags - Analyze and suggest hashtags
// ============================================================================

export async function action({ request }: ActionFunctionArgs) {
  await authenticate.admin(request);

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { content, platform, action: actionType } = body;

    if (actionType === 'suggest' && content && platform) {
      // Suggest hashtags for content
      const optimization = await suggestHashtags(content, platform);

      return json({
        success: true,
        platform: optimization.platform,
        recommended: optimization.recommended,
        alternatives: optimization.alternatives,
        avoid: optimization.avoid,
        strategy: optimization.strategy,
      });
    }

    if (actionType === 'analyze' && content) {
      // Analyze content for all platforms
      const analysis = await analyzeContentForHashtags(content);

      return json({
        success: true,
        detectedTopics: analysis.detectedTopics,
        suggestedHashtags: analysis.suggestedHashtags,
        platformOptimized: analysis.platformOptimized,
      });
    }

    if (actionType === 'validate' && body.hashtags && platform) {
      // Validate hashtags
      const validation = validateHashtags(body.hashtags, platform);

      return json({
        success: true,
        valid: validation.valid,
        invalid: validation.invalid,
      });
    }

    return json({ error: 'Invalid action or missing parameters' }, { status: 400 });
  } catch (error) {
    console.error('Hashtag API error:', error);
    return json(
      { error: 'Failed to process hashtags', details: String(error) },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET /api/content/hashtags - Get trending hashtags
// ============================================================================

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);

  const url = new URL(request.url);
  const platform = url.searchParams.get('platform') as SocialPlatform;
  const limit = parseInt(url.searchParams.get('limit') || '20', 10);

  try {
    if (!platform) {
      return json({ error: 'Missing required parameter: platform' }, { status: 400 });
    }

    if (!['instagram', 'facebook', 'tiktok'].includes(platform)) {
      return json({ error: 'Invalid platform' }, { status: 400 });
    }

    const trending = await getTrendingHashtags(platform, limit);

    return json({
      success: true,
      platform,
      trending,
      count: trending.length,
      metadata: {
        generatedAt: new Date().toISOString(),
        ttl: 1800, // Cache for 30 minutes
      },
    });
  } catch (error) {
    console.error('Hashtag trending API error:', error);
    return json(
      { error: 'Failed to fetch trending hashtags', details: String(error) },
      { status: 500 }
    );
  }
}


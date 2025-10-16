/**
 * Content Recommendations API Feed
 * 
 * Provides content recommendations feed for Engineer to integrate into UI.
 * Returns prioritized, actionable content suggestions.
 */

import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { authenticate } from '../../shopify.server';
import {
  getContentRecommendations,
  getTopicRecommendations,
  getFormatRecommendations,
} from '../../services/content/recommendations';
import type { SocialPlatform } from '../../lib/content/tracking';

// ============================================================================
// GET /api/content/recommendations
// ============================================================================

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);

  const url = new URL(request.url);
  const platform = url.searchParams.get('platform') as SocialPlatform | null;
  const type = url.searchParams.get('type') || 'all';
  const limit = parseInt(url.searchParams.get('limit') || '10', 10);

  try {
    let recommendations;

    switch (type) {
      case 'topics':
        recommendations = await getTopicRecommendations(platform || undefined, limit);
        break;

      case 'formats':
        recommendations = await getFormatRecommendations(platform || undefined);
        break;

      case 'all':
      default:
        recommendations = await getContentRecommendations(platform || undefined, limit);
        break;
    }

    // Format for UI consumption
    const feed = recommendations.map(rec => ({
      id: rec.id,
      type: rec.type,
      title: rec.title,
      description: rec.description,
      priority: rec.priority,
      platform: rec.platform,
      estimatedEngagement: rec.estimatedEngagement,
      actionable: {
        action: rec.actionable.action,
        details: rec.actionable.details,
      },
      expiresAt: rec.expiresAt,
      metadata: {
        reasoning: rec.reasoning,
      },
    }));

    return json({
      success: true,
      recommendations: feed,
      count: feed.length,
      filters: {
        platform: platform || 'all',
        type,
        limit,
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        ttl: 3600, // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Recommendations API error:', error);
    return json(
      { error: 'Failed to fetch recommendations', details: String(error) },
      { status: 500 }
    );
  }
}


/**
 * KB Search API Routes
 * Exposes search functionality for agents and UI
 */

import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node';
import { semanticSearch, hybridSearch, contextualSearch } from '../../../lib/knowledge/search';
import { KBConfig } from '../../../lib/knowledge/config';
import { trackSearch } from '../../../lib/knowledge/telemetry';

/**
 * POST /api/kb/search
 * Hybrid search (semantic + keyword)
 */
export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { query, category, minConfidence, limit } = body;

    if (!query || typeof query !== 'string') {
      return json({ error: 'Query is required and must be a string' }, { status: 400 });
    }

    const startTime = Date.now();

    const results = await hybridSearch(query, {
      category,
      minConfidence: minConfidence || KBConfig.search.minConfidence,
      limit: limit || KBConfig.search.defaultLimit
    });

    const latency = Date.now() - startTime;

    // Track search telemetry
    await trackSearch({
      query,
      results_count: results.length,
      top_result_confidence: results[0]?.confidenceScore || 0,
      latency_ms: latency,
      category
    });

    return json({
      success: true,
      results,
      metadata: {
        query,
        count: results.length,
        latency_ms: latency,
        min_confidence: minConfidence || KBConfig.search.minConfidence
      }
    });
  } catch (error) {
    console.error('[KB Search API] Error:', error);
    return json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


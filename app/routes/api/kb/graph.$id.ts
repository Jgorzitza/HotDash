/**
 * KB Graph API Routes
 * Knowledge graph relationships and traversal
 */

import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { getLinkedArticles, findPath, suggestNextArticles } from '../../../lib/knowledge/graph';

/**
 * GET /api/kb/graph/:id
 * Get linked articles for a given article
 */
export async function loader({ params, request }: LoaderFunctionArgs) {
  const { id } = params;
  const url = new URL(request.url);
  const linkType = url.searchParams.get('type') as any;
  const action = url.searchParams.get('action');

  if (!id) {
    return json({ error: 'Article ID is required' }, { status: 400 });
  }

  try {
    const articleId = parseInt(id);

    // Handle different actions
    if (action === 'suggest-next') {
      const suggestions = await suggestNextArticles(articleId, 3);
      return json({
        success: true,
        suggestions
      });
    }

    if (action === 'find-path') {
      const targetId = url.searchParams.get('target');
      if (!targetId) {
        return json({ error: 'Target article ID required for path finding' }, { status: 400 });
      }

      const path = await findPath(articleId, parseInt(targetId));
      return json({
        success: true,
        path
      });
    }

    // Default: get linked articles
    const linked = await getLinkedArticles(articleId, linkType);

    return json({
      success: true,
      linked,
      count: linked.length
    });
  } catch (error) {
    console.error('[KB Graph API] Error:', error);
    return json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


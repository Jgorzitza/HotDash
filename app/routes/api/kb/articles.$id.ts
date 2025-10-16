/**
 * KB Article API Routes
 * CRUD operations for KB articles
 */

import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node';
import { createClient } from '@supabase/supabase-js';
import { calculateArticleQuality } from '../../../lib/knowledge/quality';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/kb/articles/:id
 * Get article by ID with quality metrics
 */
export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;

  if (!id) {
    return json({ error: 'Article ID is required' }, { status: 400 });
  }

  try {
    const { data: article, error } = await supabase
      .from('kb_articles')
      .select('*')
      .eq('id', parseInt(id))
      .single();

    if (error || !article) {
      return json({ error: 'Article not found' }, { status: 404 });
    }

    // Get quality metrics
    const quality = await calculateArticleQuality(parseInt(id));

    return json({
      success: true,
      article,
      quality
    });
  } catch (error) {
    console.error('[KB Article API] Error:', error);
    return json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/kb/articles/:id
 * Update article
 */
export async function action({ params, request }: ActionFunctionArgs) {
  const { id } = params;

  if (!id) {
    return json({ error: 'Article ID is required' }, { status: 400 });
  }

  if (request.method !== 'PATCH') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { question, answer, tags } = body;

    const updates: any = {};
    if (question) updates.question = question;
    if (answer) updates.answer = answer;
    if (tags) updates.tags = tags;
    updates.updated_at = new Date().toISOString();

    const { data: article, error } = await supabase
      .from('kb_articles')
      .update(updates)
      .eq('id', parseInt(id))
      .select()
      .single();

    if (error) {
      return json({ error: error.message }, { status: 400 });
    }

    return json({
      success: true,
      article
    });
  } catch (error) {
    console.error('[KB Article API] Error:', error);
    return json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


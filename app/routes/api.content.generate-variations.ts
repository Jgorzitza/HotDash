/**
 * API Route: Generate Content Variations
 * 
 * POST /api/content/generate-variations
 * 
 * Generates multiple variations of content with different tones
 */

import { json, type ActionFunctionArgs } from '@react-router/node';
import { aiContentGenerator } from '~/services/content/ai-content-generator';

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.type || !body.request) {
      return json(
        { error: 'Type and request are required' },
        { status: 400 }
      );
    }

    if (body.type !== 'product_description' && body.type !== 'blog_post') {
      return json(
        { error: 'Invalid content type' },
        { status: 400 }
      );
    }

    // Generate variations
    const variations = await aiContentGenerator.generateVariations(
      body.type,
      body.request,
      body.count || 3
    );

    return json({
      success: true,
      variations,
    });
  } catch (error) {
    console.error('Error generating variations:', error);
    return json(
      { 
        error: 'Failed to generate variations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}


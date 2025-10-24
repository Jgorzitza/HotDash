/**
 * API Route: Assess Content Quality
 * 
 * POST /api/content/assess-quality
 * 
 * Assesses the quality of provided content
 */

import { json, type ActionFunctionArgs } from 'react-router';
import { aiContentGenerator } from '~/services/content/ai-content-generator';
import type { ContentGenerationType } from '~/services/content/ai-content-generator';

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.content || !body.contentType) {
      return json(
        { error: 'Content and content type are required' },
        { status: 400 }
      );
    }

    // Assess quality
    const qualityScore = await aiContentGenerator.assessContentQuality(
      body.content,
      body.contentType as ContentGenerationType,
      body.keywords || []
    );

    return json({
      success: true,
      qualityScore,
    });
  } catch (error) {
    console.error('Error assessing content quality:', error);
    return json(
      { 
        error: 'Failed to assess content quality',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}


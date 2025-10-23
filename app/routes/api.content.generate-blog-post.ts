/**
 * API Route: Generate Blog Post
 * 
 * POST /api/content/generate-blog-post
 * 
 * Generates AI-powered blog posts using OpenAI
 */

import { json, type ActionFunctionArgs } from '@react-router/node';
import { aiContentGenerator } from '~/services/content/ai-content-generator';
import type { BlogPostRequest } from '~/services/content/ai-content-generator';

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.topic) {
      return json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Build request
    const generationRequest: BlogPostRequest = {
      topic: body.topic,
      keywords: body.keywords || [],
      targetAudience: body.targetAudience,
      tone: body.tone || 'professional',
      length: body.length || 800,
      outline: body.outline || [],
      includeCallToAction: body.includeCallToAction !== false,
      brandVoice: body.brandVoice,
    };

    // Generate content
    const result = await aiContentGenerator.generateBlogPost(generationRequest);

    return json({
      success: true,
      content: result.content,
      metadata: result.metadata,
      qualityScore: result.qualityScore,
      suggestions: result.suggestions,
    });
  } catch (error) {
    console.error('Error generating blog post:', error);
    return json(
      { 
        error: 'Failed to generate blog post',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}


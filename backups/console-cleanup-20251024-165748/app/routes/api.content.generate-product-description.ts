/**
 * API Route: Generate Product Description
 * 
 * POST /api/content/generate-product-description
 * 
 * Generates AI-powered product descriptions using OpenAI
 */

import { data, type ActionFunctionArgs } from 'react-router';
import { aiContentGenerator } from '~/services/content/ai-content-generator';
import type { ProductDescriptionRequest } from '~/services/content/ai-content-generator';

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return data({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.productTitle) {
      return data(
        { error: 'Product title is required' },
        { status: 400 }
      );
    }

    // Build request
    const generationRequest: ProductDescriptionRequest = {
      productTitle: body.productTitle,
      productType: body.productType,
      features: body.features || [],
      benefits: body.benefits || [],
      targetAudience: body.targetAudience,
      tone: body.tone || 'professional',
      length: body.length || 'medium',
      includeKeywords: body.includeKeywords || [],
      brandVoice: body.brandVoice,
    };

    // Generate content
    const result = await aiContentGenerator.generateProductDescription(generationRequest);

    return {
      success: true,
      content: result.content,
      metadata: result.metadata,
      qualityScore: result.qualityScore,
      suggestions: result.suggestions,
    };
  } catch (error) {
    console.error('Error generating product description:', error);
    return data(
      {
        error: 'Failed to generate product description',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}


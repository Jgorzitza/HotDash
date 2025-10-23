/**
 * API Route: Meta Tag Optimization
 * 
 * POST /api/seo/meta-optimize
 * 
 * Automatically optimizes meta tags for a page based on content analysis,
 * keyword research, and Search Console data.
 * 
 * Request body:
 * {
 *   url: string;
 *   title?: string;
 *   description?: string;
 *   content: string;
 * }
 * 
 * Response:
 * {
 *   success: boolean;
 *   data: MetaOptimizationResult;
 *   timestamp: string;
 * }
 */

import { type ActionFunctionArgs } from "react-router";
import { optimizeMetaTags, type PageContent } from "~/services/seo/meta-optimizer";
import { logDecision } from "~/services/decisions.server";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const body = await request.json();
    
    // Validate request
    if (!body.url || !body.content) {
      return Response.json(
        {
          success: false,
          error: 'Missing required fields: url and content are required',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    const pageContent: PageContent = {
      url: body.url,
      title: body.title,
      description: body.description,
      content: body.content,
      headings: [] // Will be extracted from content
    };

    // Optimize meta tags
    const result = await optimizeMetaTags(pageContent);

    // Log the optimization
    await logDecision({
      scope: 'seo',
      actor: 'seo-agent',
      action: 'meta_tag_optimization',
      rationale: `Optimized meta tags for ${body.url}. Score: ${result.score}/100`,
      payload: {
        url: body.url,
        improvements: result.improvements,
        score: result.score,
        originalTitle: result.originalTitle,
        optimizedTitle: result.optimizedTitle,
        originalDescription: result.originalDescription,
        optimizedDescription: result.optimizedDescription,
        keywords: result.keywords
      }
    });

    return Response.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[API] Meta optimization error:', error);

    return Response.json(
      {
        success: false,
        error: error.message || 'Failed to optimize meta tags',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to retrieve optimization suggestions for a URL
 */
export async function loader({ request }: ActionFunctionArgs) {
  try {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');

    if (!targetUrl) {
      return Response.json(
        {
          success: false,
          error: 'Missing required parameter: url',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // For GET requests, we can't optimize without content
    // Return guidance instead
    return Response.json({
      success: true,
      message: 'Use POST request with page content to optimize meta tags',
      example: {
        url: targetUrl,
        title: 'Your page title',
        description: 'Your page description',
        content: '<html>Your page HTML content</html>'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[API] Meta optimization error:', error);

    return Response.json(
      {
        success: false,
        error: error.message || 'Failed to process request',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}


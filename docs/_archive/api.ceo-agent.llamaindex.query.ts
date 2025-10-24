/**
 * API Route: CEO Agent - LlamaIndex Knowledge Base Query
 *
 * POST /api/ceo-agent/llamaindex/query
 *
 * Queries the knowledge base using LlamaIndex RAG for CEO agent.
 * Provides answers with sources and confidence scores.
 *
 * Request Body:
 * - query: string (required) - Natural language question
 * - topK: number (optional, default: 5) - Number of similar chunks to retrieve
 * - filters: Record<string, string> (optional) - Metadata filters
 *
 * @see docs/directions/ai-customer.md AI-CUSTOMER-007
 * @see packages/agents/src/ai-ceo.ts - CEO Agent tool integration
 * @see app/services/rag/ceo-knowledge-base.ts - KB query engine
 */

import { type ActionFunctionArgs } from "react-router";
import {
  queryKnowledgeBase,
  type QueryResult,
} from "../services/rag/ceo-knowledge-base";

/**
 * API Response structure
 */
interface KnowledgeBaseResponse {
  success: boolean;
  data?: QueryResult;
  error?: string;
  timestamp: string;
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const body = await request.json();
    const { query, topK, filters } = body;

    // Validate required parameters
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      const errorResponse: KnowledgeBaseResponse = {
        success: false,
        error:
          "Missing or invalid required parameter: query (must be non-empty string)",
        timestamp: new Date().toISOString(),
      };
      return Response.json(errorResponse, { status: 400 });
    }

    // Validate topK if provided
    if (
      topK !== undefined &&
      (typeof topK !== "number" || topK < 1 || topK > 10)
    ) {
      const errorResponse: KnowledgeBaseResponse = {
        success: false,
        error: "Invalid topK parameter. Must be a number between 1 and 10",
        timestamp: new Date().toISOString(),
      };
      return Response.json(errorResponse, { status: 400 });
    }

    // Query knowledge base
    const result = await queryKnowledgeBase(query, {
      similarityTopK: topK,
      includeSnippets: true,
    });

    const response: KnowledgeBaseResponse = {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };

    return Response.json(response);
  } catch (error: any) {
    console.error("[API] CEO Agent LlamaIndex query error:", error);

    const errorResponse: KnowledgeBaseResponse = {
      success: false,
      error: error.message || "Failed to query knowledge base",
      timestamp: new Date().toISOString(),
    };

    return Response.json(errorResponse, { status: 500 });
  }
}

import { z } from 'zod';
/**
 * Answer questions using internal docs/FAQs/policies via RAG.
 *
 * This tool wraps the LlamaIndex RAG MCP server deployed at hotdash-llamaindex-mcp.fly.dev.
 * It queries the knowledge base using semantic search and returns relevant documentation
 * with citations.
 */
export declare const answerFromDocs: import("@openai/agents").FunctionTool<unknown, z.ZodObject<{
    question: z.ZodString;
    topK: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    question?: string;
    topK?: number;
}, {
    question?: string;
    topK?: number;
}>, string>;
//# sourceMappingURL=rag.d.ts.map
import { tool } from '@openai/agents';
import { z } from 'zod';
import fetch from 'node-fetch';
const LLAMAINDEX_MCP_URL = process.env.LLAMAINDEX_MCP_URL || 'https://hotdash-llamaindex-mcp.fly.dev/mcp';
/**
 * Answer questions using internal docs/FAQs/policies via RAG.
 *
 * This tool wraps the LlamaIndex RAG MCP server deployed at hotdash-llamaindex-mcp.fly.dev.
 * It queries the knowledge base using semantic search and returns relevant documentation
 * with citations.
 */
export const answerFromDocs = tool({
    name: 'answer_from_docs',
    description: 'Answer questions using internal docs/FAQs/policies. Good for shipping, returns, warranties, troubleshooting.',
    parameters: z.object({
        question: z.string().describe('Question to search for in the knowledge base'),
        topK: z.number().default(5).describe('Number of top results to return (default: 5)'),
    }),
    // Read-only tool - no approval required
    async execute({ question, topK }) {
        try {
            const response = await fetch(`${LLAMAINDEX_MCP_URL}/tools/call`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'query_support',
                    arguments: {
                        q: question,
                        topK: topK || 5,
                    },
                }),
            });
            if (!response.ok) {
                throw new Error(`MCP server returned ${response.status}`);
            }
            const result = await response.json();
            // MCP returns { content: [{ type: 'text', text: '...' }] }
            if (result.content && result.content[0]) {
                return result.content[0].text;
            }
            return 'No answer found in knowledge base.';
        }
        catch (error) {
            console.error('[RAG Tool] Error:', error.message);
            return `Error querying knowledge base: ${error.message}`;
        }
    },
});
//# sourceMappingURL=rag.js.map
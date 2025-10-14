import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * Query Handler - Wraps llama-workflow query command
 *
 * Executes the query command from the existing llama-workflow CLI
 * and returns the results in MCP-compatible format.
 */
export async function queryHandler(args) {
    const { q, query, topK = 5 } = args;
    const searchQuery = q || query;
    // Validate that we have a query
    if (!searchQuery) {
        return {
            content: [
                {
                    type: 'text',
                    text: 'Error: Query parameter is required (use "q" or "query")',
                },
            ],
            isError: true,
        };
    }
    // Path to existing llama-workflow CLI (relative to this handler)
    const cliPath = path.resolve(__dirname, '../../../../scripts/ai/llama-workflow/dist/cli.js');
    try {
        // Execute the query command
        const result = execSync(`node ${cliPath} query -q "${searchQuery.replace(/"/g, '\\"')}" --topK ${topK}`, {
            encoding: 'utf-8',
            maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large responses
            cwd: path.resolve(__dirname, '../../../../'), // Execute from project root
        });
        return {
            content: [
                {
                    type: 'text',
                    text: result.trim(),
                },
            ],
        };
    }
    catch (error) {
        console.error('[query-handler] Error:', error.message);
        return {
            content: [
                {
                    type: 'text',
                    text: `Error querying knowledge base: ${error.message}`,
                },
            ],
            isError: true,
        };
    }
}
//# sourceMappingURL=query.js.map
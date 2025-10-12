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
export async function queryHandler(args: { q: string; topK?: number }) {
  const { q, topK = 5 } = args;
  
  // Path to existing llama-workflow CLI (relative to this handler)
  const cliPath = path.resolve(__dirname, '../../../../scripts/ai/llama-workflow/dist/cli.js');
  
  try {
    // Execute the query command with NODE_PATH set to find commander
    const nodeModulesPath = path.resolve(__dirname, '../../node_modules');
    const result = execSync(
      `node ${cliPath} query -q "${q.replace(/"/g, '\\"')}" --topK ${topK}`,
      { 
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large responses
        cwd: path.resolve(__dirname, '../../../../'), // Execute from project root
        env: { ...process.env, NODE_PATH: nodeModulesPath },
      }
    );
    
    return {
      content: [
        {
          type: 'text',
          text: result.trim(),
        },
      ],
    };
  } catch (error: any) {
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


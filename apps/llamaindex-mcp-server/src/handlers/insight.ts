import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Insight Handler - Wraps llama-workflow insight command
 * 
 * Generates AI insights from telemetry and curated replies.
 */
export async function insightHandler(args: { window?: string; format?: string }) {
  const { window = '7d', format = 'md' } = args;
  
  // Validate format
  if (!['md', 'json', 'txt'].includes(format)) {
    return {
      content: [
        {
          type: 'text',
          text: `Invalid format: ${format}. Must be one of: md, json, txt`,
        },
      ],
      isError: true,
    };
  }
  
  // Path to existing llama-workflow CLI
  const cliPath = path.resolve(__dirname, '../../../../scripts/ai/llama-workflow/dist/cli.js');
  
  try {
    // Build command with options
    const command = `node ${cliPath} insight --window ${window} --format ${format}`;
    
    // Execute the insight command
    const result = execSync(command, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024,
      cwd: path.resolve(__dirname, '../../../../'),
    });
    
    return {
      content: [
        {
          type: 'text',
          text: result.trim() || 'Insight generation completed',
        },
      ],
    };
  } catch (error: any) {
    console.error('[insight-handler] Error:', error.message);
    return {
      content: [
        {
          type: 'text',
          text: `Error generating insights: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}


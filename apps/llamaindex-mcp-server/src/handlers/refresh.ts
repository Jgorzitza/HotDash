import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildTimeoutError, getExecTimeoutMs, resolveWorkflowCliPath } from '../utils/cli.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Refresh Handler - Wraps llama-workflow refresh command
 * 
 * Rebuilds or updates the LlamaIndex over approved sources.
 */
export async function refreshHandler(args: { sources?: string; full?: boolean }) {
  const { sources = 'all', full = true } = args;
  
  // Resolve CLI path with fallback + env override
  let cliPath: string;
  try {
    cliPath = resolveWorkflowCliPath();
  } catch (err: any) {
    return {
      content: [
        { type: 'text', text: `Error resolving CLI path: ${err.message}` },
      ],
      isError: true,
    };
  }
  
  try {
    // Build command with options
    let command = `node ${cliPath} refresh`;
    if (full) {
      command += ' --full';
    }
    if (sources && sources !== 'all') {
      command += ` --sources ${sources}`;
    }
    
    // Execute the refresh command
    const result = execSync(command, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024,
      cwd: path.resolve(__dirname, '../../../../'),
      timeout: getExecTimeoutMs(),
      killSignal: 'SIGTERM',
    });
    
    return {
      content: [
        {
          type: 'text',
          text: result.trim() || 'Index refresh completed successfully',
        },
      ],
    };
  } catch (error: any) {
    if (error?.signal === 'SIGTERM' || error?.killed) {
      return buildTimeoutError('refresh_index', getExecTimeoutMs());
    }
    console.error('[refresh-handler] Error:', error.message);
    return {
      content: [
        {
          type: 'text',
          text: `Error refreshing index: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

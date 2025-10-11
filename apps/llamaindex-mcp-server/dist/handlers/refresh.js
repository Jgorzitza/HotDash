import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * Refresh Handler - Wraps llama-workflow refresh command
 *
 * Rebuilds or updates the LlamaIndex over approved sources.
 */
export async function refreshHandler(args) {
    const { sources = 'all', full = true } = args;
    // Path to existing llama-workflow CLI
    const cliPath = path.resolve(__dirname, '../../../../scripts/ai/llama-workflow/dist/cli.js');
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
        });
        return {
            content: [
                {
                    type: 'text',
                    text: result.trim() || 'Index refresh completed successfully',
                },
            ],
        };
    }
    catch (error) {
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
//# sourceMappingURL=refresh.js.map
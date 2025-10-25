import fs from 'node:fs';
import path from 'node:path';

export function resolveWorkflowCliPath(): string {
  // 1) Allow override via env
  const envPath = process.env.LLAMA_WORKFLOW_CLI_PATH;
  if (envPath && fs.existsSync(envPath)) return envPath;

  // 2) Primary location
  const primary = path.resolve(process.cwd(), 'scripts/ai/llama-workflow/dist/cli.js');
  if (fs.existsSync(primary)) return primary;

  // 3) Fallback to archived prebundle (read-only but suitable for basic ops)
  const archived = path.resolve(
    process.cwd(),
    'docs/_archive/2025-10-15-prebundle/scripts/ai/llama-workflow/dist/cli.js',
  );
  if (fs.existsSync(archived)) return archived;

  throw new Error(
    'llama-workflow CLI not found. Set LLAMA_WORKFLOW_CLI_PATH or build scripts/ai/llama-workflow.',
  );
}

export function getExecTimeoutMs(): number {
  const raw = process.env.MCP_TOOL_TIMEOUT_MS;
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) && n > 0 ? n : 120_000; // default 120s
}

export function buildTimeoutError(name: string, timeoutMs: number) {
  return {
    content: [
      {
        type: 'text',
        text: `Error: ${name} timed out after ${timeoutMs}ms. Try again with a smaller scope or increase MCP_TOOL_TIMEOUT_MS.`,
      },
    ],
    isError: true,
  };
}


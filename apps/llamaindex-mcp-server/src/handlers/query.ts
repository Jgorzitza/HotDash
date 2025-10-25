import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { buildTimeoutError, getExecTimeoutMs, resolveWorkflowCliPath } from '../utils/cli.js';

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
    // Execute the query command
    const result = execSync(
      `node ${cliPath} query -q "${q.replace(/"/g, '\\"')}" --topK ${topK}`,
      { 
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large responses
        cwd: path.resolve(__dirname, '../../../../'), // Execute from project root
        timeout: getExecTimeoutMs(),
        killSignal: 'SIGTERM',
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
    if (error?.signal === 'SIGTERM' || error?.killed) {
      return buildTimeoutError('query_support', getExecTimeoutMs());
    }
    console.warn('[query-handler] Primary query failed, attempting offline fallback:', error.message);

    // Offline fallback: use artifacts/qa/dev-kb/chunks.json for simple substring search
    try {
      const chunksPath = path.resolve(process.cwd(), 'artifacts/qa/dev-kb/chunks.json');
      if (!fs.existsSync(chunksPath)) {
        throw new Error('Offline chunks not found');
      }
      const raw = fs.readFileSync(chunksPath, 'utf-8');
      const allChunks: Array<{ title: string; content: string; sourcePath: string; sectionIndex: number }>= JSON.parse(raw);
      const qlc = q.toLowerCase();
      const scored = allChunks.map((c) => {
        const text = c.content.toLowerCase();
        const occurrences = (text.match(new RegExp(qlc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
        const firstIdx = text.indexOf(qlc);
        const proximity = firstIdx >= 0 ? 1 / (1 + firstIdx) : 0;
        const score = occurrences * 10 + proximity;
        return { c, score };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

      if (scored.length === 0) {
        return {
          content: [{ type: 'text', text: 'No results in offline fallback.' }],
          isError: false,
        };
      }

      const lines = scored.map(({ c, score }, i) => {
        const preview = c.content.replace(/\s+/g, ' ').slice(0, 180);
        return `${i + 1}. [${score.toFixed(2)}] ${c.title} — ${c.sourcePath}#${c.sectionIndex}\n   ${preview}...`;
      });
      return {
        content: [
          {
            type: 'text',
            text: `OFFLINE FALLBACK RESULTS (top ${lines.length})\n\n` + lines.join('\n'),
          },
        ],
        isError: false,
      };
    } catch (fallbackErr: any) {
      console.error('[query-handler] Offline fallback failed:', fallbackErr.message);
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
}

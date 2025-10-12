/**
 * Optimized Query Handler - WITH CACHING
 *
 * This is the recommended implementation with:
 * - LRU caching for >75% hit rate
 * - Non-blocking spawn (not execSync)
 * - Timeout protection (10s)
 * - .env file handling
 * - Performance metrics
 * - Stale cache fallback
 *
 * Engineer: Replace handlers/query.ts with this implementation
 */
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { queryCache } from '../cache/query-cache.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Path to project root and CLI
const PROJECT_ROOT = path.resolve(__dirname, '../../../../');
const CLI_PATH = path.resolve(PROJECT_ROOT, 'scripts/ai/llama-workflow/dist/cli.js');
const ENV_FILE = path.resolve(PROJECT_ROOT, '.env.local');
// Configuration
const QUERY_TIMEOUT_MS = 10000; // 10 seconds
const CLI_MAX_BUFFER = 10 * 1024 * 1024; // 10MB
/**
 * Execute CLI query command (non-blocking)
 */
async function executeQueryCLI(q, topK) {
    return new Promise((resolve, reject) => {
        const args = [
            '--env-file=' + ENV_FILE,
            CLI_PATH,
            'query',
            '-q',
            q,
            '--topK',
            String(topK),
        ];
        console.log(`[query-optimized] Spawning CLI: node ${args.join(' ')}`);
        const child = spawn('node', args, {
            cwd: PROJECT_ROOT,
            env: process.env,
            maxBuffer: CLI_MAX_BUFFER,
        });
        let stdout = '';
        let stderr = '';
        child.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        // Timeout protection
        const timeout = setTimeout(() => {
            child.kill('SIGTERM');
            reject(new Error(`Query timeout after ${QUERY_TIMEOUT_MS}ms`));
        }, QUERY_TIMEOUT_MS);
        child.on('close', (code) => {
            clearTimeout(timeout);
            if (code === 0) {
                resolve(stdout.trim());
            }
            else {
                reject(new Error(`CLI exited with code ${code}: ${stderr.trim()}`));
            }
        });
        child.on('error', (err) => {
            clearTimeout(timeout);
            reject(err);
        });
    });
}
/**
 * Query Handler - Optimized with caching
 */
export async function queryHandler(args) {
    const { q, topK = 5 } = args;
    const startTime = Date.now();
    // Validate input
    if (!q || q.trim().length === 0) {
        return {
            content: [
                {
                    type: 'text',
                    text: 'Error: Query text is required',
                },
            ],
            isError: true,
        };
    }
    if (topK < 1 || topK > 20) {
        return {
            content: [
                {
                    type: 'text',
                    text: 'Error: topK must be between 1 and 20',
                },
            ],
            isError: true,
        };
    }
    try {
        // 1. Check cache first
        const cached = queryCache.get(q, topK);
        if (cached) {
            const latency = Date.now() - startTime;
            // TODO: Record cache hit metric
            // recordMetric('query_cache_hit', 1);
            // recordMetric('query_latency_ms', latency, { cached: true });
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(cached, null, 2),
                    },
                ],
            };
        }
        // 2. Cache miss - execute CLI
        const result = await executeQueryCLI(q, topK);
        const latency = Date.now() - startTime;
        console.log(`[query-optimized] Completed in ${latency}ms`);
        // Parse result
        let parsed;
        try {
            parsed = JSON.parse(result);
        }
        catch (parseError) {
            // If JSON parsing fails, return raw result
            parsed = { raw: result };
        }
        // 3. Cache the result
        queryCache.set(q, topK, parsed);
        // 4. Add metadata
        const response = {
            ...parsed,
            _cached: false,
            _latency_ms: latency,
        };
        // TODO: Record metrics
        // recordMetric('query_cache_miss', 1);
        // recordMetric('query_latency_ms', latency, { cached: false });
        // TODO: Log to training data collector
        // await trainingCollector.logPerformance({ queryText: q, latencyMs: latency, ... });
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(response, null, 2),
                },
            ],
        };
    }
    catch (error) {
        const latency = Date.now() - startTime;
        console.error(`[query-optimized] Error after ${latency}ms:`, error.message);
        // Fallback: Try stale cache
        const stale = queryCache.getStale(q, topK);
        if (stale) {
            console.log(`[query-optimized] Returning stale cache as fallback`);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            ...stale,
                            _error: error.message,
                            _fallback: 'stale_cache',
                        }, null, 2),
                    },
                ],
            };
        }
        // No fallback available
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
/**
 * Get cache statistics (for health check)
 */
export function getCacheStats() {
    return queryCache.getStats();
}
/**
 * Clear cache (admin endpoint)
 */
export function clearCache() {
    queryCache.clear();
}
//# sourceMappingURL=query-optimized.js.map
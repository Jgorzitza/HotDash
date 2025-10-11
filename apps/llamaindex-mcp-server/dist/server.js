import express from 'express';
import { queryHandler } from './handlers/query.js';
import { refreshHandler } from './handlers/refresh.js';
import { insightHandler } from './handlers/insight.js';
import { metrics } from './metrics.js';
import { rateLimiter } from './rate-limiter.js';
const app = express();
app.use(express.json());
// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    const requestId = req.headers['x-request-id'] || `req-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${req.method}] ${req.path} - ${res.statusCode} (${duration}ms) [${requestId}]`);
    });
    next();
});
// Rate limiting middleware (apply to MCP endpoints only)
const rateLimitMiddleware = (req, res, next) => {
    // Get client identifier (IP or custom header)
    const clientId = req.headers['x-client-id'] ||
        req.ip ||
        req.socket.remoteAddress ||
        'unknown';
    if (!rateLimiter.checkLimit(clientId)) {
        const resetTime = rateLimiter.getResetTime(clientId);
        const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
        res.set('X-RateLimit-Limit', String(rateLimiter.getStats().maxRequests));
        res.set('X-RateLimit-Remaining', '0');
        res.set('X-RateLimit-Reset', String(Math.floor(resetTime / 1000)));
        res.set('Retry-After', String(retryAfter));
        return res.status(429).json({
            error: 'Rate limit exceeded',
            retryAfter,
        });
    }
    // Set rate limit headers
    res.set('X-RateLimit-Limit', String(rateLimiter.getStats().maxRequests));
    res.set('X-RateLimit-Remaining', String(rateLimiter.getRemaining(clientId)));
    res.set('X-RateLimit-Reset', String(Math.floor(rateLimiter.getResetTime(clientId) / 1000)));
    next();
};
// Tool definitions
const TOOLS = [
    {
        name: 'query_support',
        description: 'Query knowledge base for support information using semantic search. Returns relevant documentation, FAQs, and policy information with citations.',
        inputSchema: {
            type: 'object',
            properties: {
                q: {
                    type: 'string',
                    description: 'Search query text to find relevant information in the knowledge base',
                },
                topK: {
                    type: 'number',
                    description: 'Number of top results to return (default: 5, max: 20)',
                    default: 5,
                },
            },
            required: ['q'],
        },
    },
    {
        name: 'refresh_index',
        description: 'Rebuild or update the LlamaIndex vector store from all approved sources. Use this when new documentation has been added or content has been updated.',
        inputSchema: {
            type: 'object',
            properties: {
                sources: {
                    type: 'string',
                    description: 'Comma-separated list of sources to refresh, or "all" for all sources',
                    default: 'all',
                },
                full: {
                    type: 'boolean',
                    description: 'Whether to perform a full rebuild (true) or incremental update (false)',
                    default: true,
                },
            },
        },
    },
    {
        name: 'insight_report',
        description: 'Generate AI-powered insights report from telemetry data and curated customer support replies. Provides analysis of common issues, trends, and improvement opportunities.',
        inputSchema: {
            type: 'object',
            properties: {
                window: {
                    type: 'string',
                    description: 'Time window for analysis (e.g., "7d", "30d", "90d")',
                    default: '7d',
                },
                format: {
                    type: 'string',
                    description: 'Output format',
                    enum: ['md', 'json', 'txt'],
                    default: 'md',
                },
            },
        },
    },
];
// Execute tool by name
async function executeTool(name, args) {
    const startTime = Date.now();
    console.log(`[MCP] Tool call: ${name}`, args);
    let isError = false;
    try {
        let result;
        switch (name) {
            case 'query_support':
                result = await queryHandler(args);
                break;
            case 'refresh_index':
                result = await refreshHandler(args);
                break;
            case 'insight_report':
                result = await insightHandler(args);
                break;
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
        const latency = Date.now() - startTime;
        isError = result.isError || false;
        metrics.recordCall(name, latency, isError);
        console.log(`[MCP] Tool ${name} completed in ${latency}ms${isError ? ' (with error)' : ''}`);
        return result;
    }
    catch (error) {
        const latency = Date.now() - startTime;
        isError = true;
        metrics.recordCall(name, latency, isError);
        console.error(`[MCP] Error executing ${name} after ${latency}ms:`, error);
        return {
            content: [
                {
                    type: 'text',
                    text: `Error: ${error.message}`,
                },
            ],
            isError: true,
        };
    }
}
// Health check endpoint with detailed status
app.get('/health', (req, res) => {
    const summary = metrics.getSummary();
    res.json({
        status: 'ok',
        service: 'llamaindex-rag-mcp',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        uptime: summary.uptime,
        tools: TOOLS.map(t => t.name),
        metrics: summary.tools,
    });
});
// Metrics endpoint
app.get('/metrics', (req, res) => {
    res.json(metrics.getSummary());
});
// MCP HTTP endpoint - tools/list
app.post('/mcp/tools/list', rateLimitMiddleware, async (req, res) => {
    try {
        res.json({ tools: TOOLS });
    }
    catch (error) {
        console.error('[HTTP] tools/list error:', error);
        res.status(500).json({
            error: error.message || 'Internal server error',
        });
    }
});
// MCP HTTP endpoint - tools/call
app.post('/mcp/tools/call', rateLimitMiddleware, async (req, res) => {
    try {
        const { name, arguments: args } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Tool name is required' });
        }
        const result = await executeTool(name, args || {});
        res.json(result);
    }
    catch (error) {
        console.error('[HTTP] tools/call error:', error);
        res.status(500).json({
            error: error.message || 'Internal server error',
        });
    }
});
// Generic MCP endpoint (routes based on method)
app.post('/mcp', rateLimitMiddleware, async (req, res) => {
    try {
        const { method, params } = req.body;
        if (method === 'tools/list') {
            return res.json({ tools: TOOLS });
        }
        if (method === 'tools/call') {
            const { name, arguments: args } = params || {};
            if (!name) {
                return res.status(400).json({ error: 'Tool name is required' });
            }
            const result = await executeTool(name, args || {});
            return res.json(result);
        }
        res.status(400).json({ error: 'Invalid MCP method. Use tools/list or tools/call' });
    }
    catch (error) {
        console.error('[HTTP] MCP error:', error);
        res.status(500).json({
            error: error.message || 'Internal server error',
        });
    }
});
// Admin API endpoints
app.get('/admin/metrics/reset', (req, res) => {
    metrics.reset();
    res.json({ ok: true, message: 'Metrics reset successfully' });
});
app.get('/admin/status', (req, res) => {
    res.json({
        service: 'llamaindex-rag-mcp',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        metrics: metrics.getSummary(),
    });
});
// Start HTTP server
const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
    console.log(`[MCP] LlamaIndex RAG MCP server listening on :${port}`);
    console.log(`[MCP] Health check: http://localhost:${port}/health`);
    console.log(`[MCP] Metrics: http://localhost:${port}/metrics`);
    console.log(`[MCP] Admin: http://localhost:${port}/admin/status`);
    console.log(`[MCP] HTTP endpoint: http://localhost:${port}/mcp`);
    console.log(`[MCP] Available tools: ${TOOLS.map(t => t.name).join(', ')}`);
});
// Graceful shutdown handling
process.on('SIGTERM', () => {
    console.log('[MCP] SIGTERM received, shutting down gracefully...');
    server.close(() => {
        console.log('[MCP] Server closed');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    console.log('[MCP] SIGINT received, shutting down gracefully...');
    server.close(() => {
        console.log('[MCP] Server closed');
        process.exit(0);
    });
});
//# sourceMappingURL=server.js.map
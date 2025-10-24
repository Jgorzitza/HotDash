/**
 * Integration API Routes
 *
 * Provides REST endpoints for third-party API integrations:
 * - Health monitoring
 * - Bulk operations
 * - Analytics and metrics
 * - Integration management
 */
import { integrationManager } from '~/services/integrations/integration-manager';
import { shopifyAdapter } from '~/services/integrations/shopify-adapter';
import { publerAdapter } from '~/services/integrations/publer-adapter';
import { chatwootAdapter } from '~/services/integrations/chatwoot-adapter';
// Health endpoints
export async function loader({ request }) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    try {
        switch (pathname) {
            case '/api/integrations/health':
                return await handleHealthCheck();
            case '/api/integrations/metrics':
                return await handleGetMetrics();
            case '/api/integrations/shopify/health':
                return await handleShopifyHealth();
            case '/api/integrations/publer/health':
                return await handlePublerHealth();
            case '/api/integrations/chatwoot/health':
                return await handleChatwootHealth();
            default:
                return Response.json({ error: 'Not found' }, { status: 404 });
        }
    }
    catch (error) {
        console.error('Integration API error:', error);
        return Response.json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
export async function action({ request }) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method;
    try {
        switch (pathname) {
            case '/api/integrations/bulk':
                if (method === 'POST') {
                    return await handleBulkOperation(request);
                }
                break;
            case '/api/integrations/reset-metrics':
                if (method === 'POST') {
                    return await handleResetMetrics(request);
                }
                break;
            case '/api/integrations/circuit-breaker/reset':
                if (method === 'POST') {
                    return await handleResetCircuitBreaker(request);
                }
                break;
            default:
                return Response.json({ error: 'Not found' }, { status: 404 });
        }
    }
    catch (error) {
        console.error('Integration API action error:', error);
        return Response.json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
// Health check handlers
async function handleHealthCheck() {
    const healthStatus = await integrationManager.getHealthStatus();
    return Response.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        integrations: healthStatus,
        summary: {
            total: healthStatus.length,
            healthy: healthStatus.filter(h => h.healthy).length,
            unhealthy: healthStatus.filter(h => !h.healthy).length,
        },
    });
}
async function handleGetMetrics() {
    const metrics = integrationManager.getMetrics();
    return Response.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        metrics,
    });
}
async function handleShopifyHealth() {
    const health = await shopifyAdapter.getShop();
    return Response.json({
        status: health.success ? 'ok' : 'error',
        timestamp: new Date().toISOString(),
        service: 'shopify',
        data: health.data,
        error: health.error,
    });
}
async function handlePublerHealth() {
    const health = await publerAdapter.getWorkspaces();
    return Response.json({
        status: health.success ? 'ok' : 'error',
        timestamp: new Date().toISOString(),
        service: 'publer',
        data: health.data,
        error: health.error,
    });
}
async function handleChatwootHealth() {
    const health = await chatwootAdapter.getInboxes();
    return Response.json({
        status: health.success ? 'ok' : 'error',
        timestamp: new Date().toISOString(),
        service: 'chatwoot',
        data: health.data,
        error: health.error,
    });
}
// Action handlers
async function handleBulkOperation(request) {
    const body = await request.json();
    const { operations } = body;
    if (!Array.isArray(operations)) {
        return Response.json({ error: 'Operations must be an array' }, { status: 400 });
    }
    const results = await integrationManager.executeBulkOperation(operations);
    return Response.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        results,
    });
}
async function handleResetMetrics(request) {
    const body = await request.json();
    const { integrationName } = body;
    if (integrationName) {
        integrationManager.resetMetrics(integrationName);
        return Response.json({
            status: 'ok',
            message: `Metrics reset for ${integrationName}`,
            timestamp: new Date().toISOString(),
        });
    }
    else {
        integrationManager.resetMetrics();
        return Response.json({
            status: 'ok',
            message: 'All metrics reset',
            timestamp: new Date().toISOString(),
        });
    }
}
async function handleResetCircuitBreaker(request) {
    const body = await request.json();
    const { integrationName } = body;
    if (!integrationName) {
        return Response.json({ error: 'Integration name is required' }, { status: 400 });
    }
    integrationManager.resetCircuitBreaker(integrationName);
    return Response.json({
        status: 'ok',
        message: `Circuit breaker reset for ${integrationName}`,
        timestamp: new Date().toISOString(),
    });
}
//# sourceMappingURL=api.integrations.js.map
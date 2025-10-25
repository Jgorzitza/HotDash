/**
 * Growth Engine Core Infrastructure Service
 *
 * ENG-026: Core infrastructure for Growth Engine phases 9-12
 * Provides advanced routing, state management, and performance optimizations
 */
import { createClient } from "@supabase/supabase-js";
// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase credentials are not set.");
}
const supabase = createClient(supabaseUrl, supabaseAnonKey);
/**
 * Advanced Growth Engine Routing System
 */
export class GrowthEngineRouter {
    routes = new Map();
    cache = new Map();
    performanceMetrics = [];
    constructor() {
        this.initializeRoutes();
        this.startPerformanceMonitoring();
    }
    /**
     * Initialize Growth Engine routes
     */
    initializeRoutes() {
        const routes = [
            {
                id: 'growth-dashboard',
                path: '/growth-engine',
                component: 'GrowthEngineDashboard',
                permissions: ['growth:read'],
                phase: 9,
                priority: 'critical',
                cacheStrategy: 'medium',
                dependencies: ['analytics', 'actions']
            },
            {
                id: 'growth-analytics',
                path: '/growth-engine/analytics',
                component: 'GrowthEngineAnalytics',
                permissions: ['growth:read', 'analytics:read'],
                phase: 9,
                priority: 'high',
                cacheStrategy: 'long',
                dependencies: ['analytics']
            },
            {
                id: 'growth-actions',
                path: '/growth-engine/actions',
                component: 'GrowthEngineActions',
                permissions: ['growth:read', 'actions:read'],
                phase: 9,
                priority: 'high',
                cacheStrategy: 'short',
                dependencies: ['actions']
            },
            {
                id: 'growth-phases',
                path: '/growth-engine/phases',
                component: 'GrowthEnginePhases',
                permissions: ['growth:read', 'phases:read'],
                phase: 10,
                priority: 'medium',
                cacheStrategy: 'long',
                dependencies: ['phases']
            },
            {
                id: 'growth-optimization',
                path: '/growth-engine/optimization',
                component: 'GrowthEngineOptimization',
                permissions: ['growth:write', 'optimization:write'],
                phase: 11,
                priority: 'high',
                cacheStrategy: 'short',
                dependencies: ['optimization']
            },
            {
                id: 'growth-ai',
                path: '/growth-engine/ai',
                component: 'GrowthEngineAI',
                permissions: ['growth:write', 'ai:write'],
                phase: 12,
                priority: 'critical',
                cacheStrategy: 'none',
                dependencies: ['ai', 'ml']
            }
        ];
        routes.forEach(route => {
            this.routes.set(route.id, route);
        });
    }
    /**
     * Get route by ID with permission checking
     */
    getRoute(routeId, userPermissions) {
        const route = this.routes.get(routeId);
        if (!route)
            return null;
        // Check permissions
        const hasPermission = route.permissions.every(permission => userPermissions.includes(permission));
        if (!hasPermission)
            return null;
        return route;
    }
    /**
     * Get all routes for a specific phase
     */
    getRoutesForPhase(phase, userPermissions) {
        return Array.from(this.routes.values())
            .filter(route => route.phase <= phase)
            .filter(route => route.permissions.every(permission => userPermissions.includes(permission)))
            .sort((a, b) => {
            const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }
    /**
     * Check route dependencies
     */
    async checkDependencies(route) {
        for (const dependency of route.dependencies) {
            const isAvailable = await this.checkDependencyAvailability(dependency);
            if (!isAvailable)
                return false;
        }
        return true;
    }
    /**
     * Check if a dependency is available
     */
    async checkDependencyAvailability(dependency) {
        try {
            switch (dependency) {
                case 'analytics':
                    const { data: analytics } = await supabase
                        .from('analytics_health')
                        .select('status')
                        .eq('service', 'analytics')
                        .single();
                    return analytics?.status === 'healthy';
                case 'actions':
                    const { data: actions } = await supabase
                        .from('action_queue')
                        .select('id')
                        .limit(1);
                    return actions !== null;
                case 'phases':
                    const { data: phases } = await supabase
                        .from('growth_phases')
                        .select('id')
                        .limit(1);
                    return phases !== null;
                case 'optimization':
                    const { data: optimization } = await supabase
                        .from('optimization_engine')
                        .select('status')
                        .eq('status', 'active')
                        .single();
                    return optimization !== null;
                case 'ai':
                    const { data: ai } = await supabase
                        .from('ai_services')
                        .select('status')
                        .eq('service', 'growth_engine')
                        .single();
                    return ai?.status === 'active';
                case 'ml':
                    const { data: ml } = await supabase
                        .from('ml_models')
                        .select('status')
                        .eq('model_type', 'growth_prediction')
                        .single();
                    return ml?.status === 'trained';
                default:
                    return true;
            }
        }
        catch (error) {
            console.error(`Dependency check failed for ${dependency}:`, error);
            return false;
        }
    }
    /**
     * Cache management
     */
    setCache(key, data, ttl = 300000) {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl
        });
    }
    getCache(key) {
        const cached = this.cache.get(key);
        if (!cached)
            return null;
        const now = Date.now();
        if (now - cached.timestamp > cached.ttl) {
            this.cache.delete(key);
            return null;
        }
        return cached.data;
    }
    clearCache(pattern) {
        if (pattern) {
            for (const [key] of this.cache) {
                if (key.includes(pattern)) {
                    this.cache.delete(key);
                }
            }
        }
        else {
            this.cache.clear();
        }
    }
    /**
     * Performance monitoring
     */
    startPerformanceMonitoring() {
        // Monitor performance every 30 seconds
        setInterval(() => {
            this.cleanupOldMetrics();
        }, 30000);
    }
    recordPerformance(route, metrics) {
        const performanceMetric = {
            route,
            loadTime: metrics.loadTime || 0,
            renderTime: metrics.renderTime || 0,
            apiCalls: metrics.apiCalls || 0,
            cacheHits: metrics.cacheHits || 0,
            errors: metrics.errors || 0,
            timestamp: new Date().toISOString()
        };
        this.performanceMetrics.push(performanceMetric);
    }
    getPerformanceMetrics(route) {
        if (route) {
            return this.performanceMetrics.filter(m => m.route === route);
        }
        return this.performanceMetrics;
    }
    cleanupOldMetrics() {
        const oneHourAgo = Date.now() - 3600000; // 1 hour
        this.performanceMetrics = this.performanceMetrics.filter(metric => new Date(metric.timestamp).getTime() > oneHourAgo);
    }
    /**
     * Get performance insights
     */
    getPerformanceInsights() {
        if (this.performanceMetrics.length === 0) {
            return {
                averageLoadTime: 0,
                averageRenderTime: 0,
                cacheHitRate: 0,
                errorRate: 0,
                slowestRoutes: []
            };
        }
        const totalMetrics = this.performanceMetrics.length;
        const averageLoadTime = this.performanceMetrics.reduce((sum, m) => sum + m.loadTime, 0) / totalMetrics;
        const averageRenderTime = this.performanceMetrics.reduce((sum, m) => sum + m.renderTime, 0) / totalMetrics;
        const totalApiCalls = this.performanceMetrics.reduce((sum, m) => sum + m.apiCalls, 0);
        const totalCacheHits = this.performanceMetrics.reduce((sum, m) => sum + m.cacheHits, 0);
        const cacheHitRate = totalApiCalls > 0 ? (totalCacheHits / totalApiCalls) * 100 : 0;
        const totalErrors = this.performanceMetrics.reduce((sum, m) => sum + m.errors, 0);
        const errorRate = (totalErrors / totalMetrics) * 100;
        const routePerformance = new Map();
        this.performanceMetrics.forEach(metric => {
            const current = routePerformance.get(metric.route) || 0;
            routePerformance.set(metric.route, current + metric.loadTime);
        });
        const slowestRoutes = Array.from(routePerformance.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([route]) => route);
        return {
            averageLoadTime,
            averageRenderTime,
            cacheHitRate,
            errorRate,
            slowestRoutes
        };
    }
}
/**
 * Growth Engine State Manager
 */
export class GrowthEngineStateManager {
    state;
    listeners = new Map();
    persistence = new Map();
    constructor(initialState) {
        this.state = {
            currentPhase: 9,
            activeActions: [],
            completedActions: [],
            blockedActions: [],
            performance: {
                loadTime: 0,
                renderTime: 0,
                apiResponseTime: 0,
                cacheHitRate: 0
            },
            user: {
                permissions: [],
                preferences: {},
                session: ''
            },
            ...initialState
        };
    }
    /**
     * Get current state
     */
    getState() {
        return { ...this.state };
    }
    /**
     * Update state
     */
    updateState(updates) {
        const oldState = { ...this.state };
        this.state = { ...this.state, ...updates };
        // Notify listeners of changes
        this.notifyListeners('stateChange', { oldState, newState: this.state });
    }
    /**
     * Subscribe to state changes
     */
    subscribe(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    /**
     * Unsubscribe from state changes
     */
    unsubscribe(event, callback) {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            const index = eventListeners.indexOf(callback);
            if (index > -1) {
                eventListeners.splice(index, 1);
            }
        }
    }
    /**
     * Notify listeners
     */
    notifyListeners(event, data) {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.forEach(callback => {
                try {
                    callback(data);
                }
                catch (error) {
                    console.error('State listener error:', error);
                }
            });
        }
    }
    /**
     * Persist state to storage
     */
    async persistState(key, data) {
        this.persistence.set(key, data);
        try {
            await supabase
                .from('growth_engine_state')
                .upsert({
                key,
                data,
                updated_at: new Date().toISOString()
            });
        }
        catch (error) {
            console.error('Failed to persist state:', error);
        }
    }
    /**
     * Restore state from storage
     */
    async restoreState(key) {
        try {
            const { data } = await supabase
                .from('growth_engine_state')
                .select('data')
                .eq('key', key)
                .single();
            if (data) {
                this.persistence.set(key, data.data);
                return data.data;
            }
        }
        catch (error) {
            console.error('Failed to restore state:', error);
        }
        return null;
    }
    /**
     * Clear persisted state
     */
    async clearPersistedState(key) {
        this.persistence.delete(key);
        try {
            await supabase
                .from('growth_engine_state')
                .delete()
                .eq('key', key);
        }
        catch (error) {
            console.error('Failed to clear persisted state:', error);
        }
    }
}
/**
 * Performance Optimization Service
 */
export class GrowthEnginePerformanceOptimizer {
    router;
    stateManager;
    constructor(router, stateManager) {
        this.router = router;
        this.stateManager = stateManager;
    }
    /**
     * Optimize route loading
     */
    async optimizeRouteLoading(routeId, userPermissions) {
        const startTime = performance.now();
        try {
            const route = this.router.getRoute(routeId, userPermissions);
            if (!route) {
                throw new Error(`Route ${routeId} not found or access denied`);
            }
            // Check dependencies
            const dependenciesOk = await this.router.checkDependencies(route);
            if (!dependenciesOk) {
                throw new Error(`Dependencies not met for route ${routeId}`);
            }
            // Check cache first
            const cacheKey = `route:${routeId}:${userPermissions.join(',')}`;
            const cached = this.router.getCache(cacheKey);
            if (cached) {
                this.recordPerformance(routeId, { loadTime: performance.now() - startTime, cacheHits: 1 });
                return cached;
            }
            // Load route data
            const data = await this.loadRouteData(route);
            // Cache the result
            const ttl = this.getCacheTTL(route.cacheStrategy);
            this.router.setCache(cacheKey, data, ttl);
            this.recordPerformance(routeId, { loadTime: performance.now() - startTime });
            return data;
        }
        catch (error) {
            this.recordPerformance(routeId, {
                loadTime: performance.now() - startTime,
                errors: 1
            });
            throw error;
        }
    }
    /**
     * Load route data
     */
    async loadRouteData(route) {
        switch (route.id) {
            case 'growth-dashboard':
                return await this.loadDashboardData();
            case 'growth-analytics':
                return await this.loadAnalyticsData();
            case 'growth-actions':
                return await this.loadActionsData();
            case 'growth-phases':
                return await this.loadPhasesData();
            case 'growth-optimization':
                return await this.loadOptimizationData();
            case 'growth-ai':
                return await this.loadAIData();
            default:
                throw new Error(`Unknown route: ${route.id}`);
        }
    }
    /**
     * Load dashboard data
     */
    async loadDashboardData() {
        const { data: overview } = await supabase
            .from('growth_engine_overview')
            .select('*')
            .single();
        const { data: recentActions } = await supabase
            .from('growth_actions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
        return {
            overview,
            recentActions,
            timestamp: new Date().toISOString()
        };
    }
    /**
     * Load analytics data
     */
    async loadAnalyticsData() {
        const { data: analytics } = await supabase
            .from('growth_analytics')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);
        return {
            analytics,
            timestamp: new Date().toISOString()
        };
    }
    /**
     * Load actions data
     */
    async loadActionsData() {
        const { data: actions } = await supabase
            .from('growth_actions')
            .select('*')
            .order('priority', { ascending: false });
        return {
            actions,
            timestamp: new Date().toISOString()
        };
    }
    /**
     * Load phases data
     */
    async loadPhasesData() {
        const { data: phases } = await supabase
            .from('growth_phases')
            .select('*')
            .order('phase_number', { ascending: true });
        return {
            phases,
            timestamp: new Date().toISOString()
        };
    }
    /**
     * Load optimization data
     */
    async loadOptimizationData() {
        const { data: optimizations } = await supabase
            .from('growth_optimizations')
            .select('*')
            .eq('status', 'active');
        return {
            optimizations,
            timestamp: new Date().toISOString()
        };
    }
    /**
     * Load AI data
     */
    async loadAIData() {
        const { data: aiInsights } = await supabase
            .from('growth_ai_insights')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
        return {
            aiInsights,
            timestamp: new Date().toISOString()
        };
    }
    /**
     * Get cache TTL based on strategy
     */
    getCacheTTL(strategy) {
        switch (strategy) {
            case 'none': return 0;
            case 'short': return 60000; // 1 minute
            case 'medium': return 300000; // 5 minutes
            case 'long': return 1800000; // 30 minutes
            default: return 300000;
        }
    }
    /**
     * Record performance metrics
     */
    recordPerformance(route, metrics) {
        this.router.recordPerformance(route, metrics);
    }
    /**
     * Get optimization recommendations
     */
    getOptimizationRecommendations() {
        const insights = this.router.getPerformanceInsights();
        const recommendations = [];
        if (insights.averageLoadTime > 2000) {
            recommendations.push('Consider implementing route-level caching for slow routes');
        }
        if (insights.cacheHitRate < 50) {
            recommendations.push('Increase cache TTL for frequently accessed routes');
        }
        if (insights.errorRate > 5) {
            recommendations.push('Implement better error handling and retry logic');
        }
        if (insights.slowestRoutes.length > 0) {
            recommendations.push(`Optimize slowest routes: ${insights.slowestRoutes.join(', ')}`);
        }
        return recommendations;
    }
}
// Export singleton instances
export const growthEngineRouter = new GrowthEngineRouter();
export const growthEngineStateManager = new GrowthEngineStateManager();
export const growthEnginePerformanceOptimizer = new GrowthEnginePerformanceOptimizer(growthEngineRouter, growthEngineStateManager);
//# sourceMappingURL=core-infrastructure.js.map
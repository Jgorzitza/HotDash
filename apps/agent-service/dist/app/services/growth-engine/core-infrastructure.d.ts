/**
 * Growth Engine Core Infrastructure Service
 *
 * ENG-026: Core infrastructure for Growth Engine phases 9-12
 * Provides advanced routing, state management, and performance optimizations
 */
export interface GrowthEngineRoute {
    id: string;
    path: string;
    component: string;
    permissions: string[];
    phase: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
    cacheStrategy: 'none' | 'short' | 'medium' | 'long';
    dependencies: string[];
}
export interface GrowthEngineState {
    currentPhase: number;
    activeActions: string[];
    completedActions: string[];
    blockedActions: string[];
    performance: {
        loadTime: number;
        renderTime: number;
        apiResponseTime: number;
        cacheHitRate: number;
    };
    user: {
        permissions: string[];
        preferences: Record<string, any>;
        session: string;
    };
}
export interface PerformanceMetrics {
    route: string;
    loadTime: number;
    renderTime: number;
    apiCalls: number;
    cacheHits: number;
    errors: number;
    timestamp: string;
}
/**
 * Advanced Growth Engine Routing System
 */
export declare class GrowthEngineRouter {
    private routes;
    private cache;
    private performanceMetrics;
    constructor();
    /**
     * Initialize Growth Engine routes
     */
    private initializeRoutes;
    /**
     * Get route by ID with permission checking
     */
    getRoute(routeId: string, userPermissions: string[]): GrowthEngineRoute | null;
    /**
     * Get all routes for a specific phase
     */
    getRoutesForPhase(phase: number, userPermissions: string[]): GrowthEngineRoute[];
    /**
     * Check route dependencies
     */
    checkDependencies(route: GrowthEngineRoute): Promise<boolean>;
    /**
     * Check if a dependency is available
     */
    private checkDependencyAvailability;
    /**
     * Cache management
     */
    setCache(key: string, data: any, ttl?: number): void;
    getCache(key: string): any | null;
    clearCache(pattern?: string): void;
    /**
     * Performance monitoring
     */
    private startPerformanceMonitoring;
    recordPerformance(route: string, metrics: Partial<PerformanceMetrics>): void;
    getPerformanceMetrics(route?: string): PerformanceMetrics[];
    private cleanupOldMetrics;
    /**
     * Get performance insights
     */
    getPerformanceInsights(): {
        averageLoadTime: number;
        averageRenderTime: number;
        cacheHitRate: number;
        errorRate: number;
        slowestRoutes: string[];
    };
}
/**
 * Growth Engine State Manager
 */
export declare class GrowthEngineStateManager {
    private state;
    private listeners;
    private persistence;
    constructor(initialState?: Partial<GrowthEngineState>);
    /**
     * Get current state
     */
    getState(): GrowthEngineState;
    /**
     * Update state
     */
    updateState(updates: Partial<GrowthEngineState>): void;
    /**
     * Subscribe to state changes
     */
    subscribe(event: string, callback: Function): void;
    /**
     * Unsubscribe from state changes
     */
    unsubscribe(event: string, callback: Function): void;
    /**
     * Notify listeners
     */
    private notifyListeners;
    /**
     * Persist state to storage
     */
    persistState(key: string, data: any): Promise<void>;
    /**
     * Restore state from storage
     */
    restoreState(key: string): Promise<any>;
    /**
     * Clear persisted state
     */
    clearPersistedState(key: string): Promise<void>;
}
/**
 * Performance Optimization Service
 */
export declare class GrowthEnginePerformanceOptimizer {
    private router;
    private stateManager;
    constructor(router: GrowthEngineRouter, stateManager: GrowthEngineStateManager);
    /**
     * Optimize route loading
     */
    optimizeRouteLoading(routeId: string, userPermissions: string[]): Promise<any>;
    /**
     * Load route data
     */
    private loadRouteData;
    /**
     * Load dashboard data
     */
    private loadDashboardData;
    /**
     * Load analytics data
     */
    private loadAnalyticsData;
    /**
     * Load actions data
     */
    private loadActionsData;
    /**
     * Load phases data
     */
    private loadPhasesData;
    /**
     * Load optimization data
     */
    private loadOptimizationData;
    /**
     * Load AI data
     */
    private loadAIData;
    /**
     * Get cache TTL based on strategy
     */
    private getCacheTTL;
    /**
     * Record performance metrics
     */
    private recordPerformance;
    /**
     * Get optimization recommendations
     */
    getOptimizationRecommendations(): string[];
}
export declare const growthEngineRouter: GrowthEngineRouter;
export declare const growthEngineStateManager: GrowthEngineStateManager;
export declare const growthEnginePerformanceOptimizer: GrowthEnginePerformanceOptimizer;
//# sourceMappingURL=core-infrastructure.d.ts.map
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
export class GrowthEngineRouter {
  private routes: Map<string, GrowthEngineRoute> = new Map();
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private performanceMetrics: PerformanceMetrics[] = [];

  constructor() {
    this.initializeRoutes();
    this.startPerformanceMonitoring();
  }

  /**
   * Initialize Growth Engine routes
   */
  private initializeRoutes() {
    const routes: GrowthEngineRoute[] = [
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
  getRoute(routeId: string, userPermissions: string[]): GrowthEngineRoute | null {
    const route = this.routes.get(routeId);
    if (!route) return null;

    // Check permissions
    const hasPermission = route.permissions.every(permission => 
      userPermissions.includes(permission)
    );
    
    if (!hasPermission) return null;

    return route;
  }

  /**
   * Get all routes for a specific phase
   */
  getRoutesForPhase(phase: number, userPermissions: string[]): GrowthEngineRoute[] {
    return Array.from(this.routes.values())
      .filter(route => route.phase <= phase)
      .filter(route => route.permissions.every(permission => 
        userPermissions.includes(permission)
      ))
      .sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
  }

  /**
   * Check route dependencies
   */
  async checkDependencies(route: GrowthEngineRoute): Promise<boolean> {
    for (const dependency of route.dependencies) {
      const isAvailable = await this.checkDependencyAvailability(dependency);
      if (!isAvailable) return false;
    }
    return true;
  }

  /**
   * Check if a dependency is available
   */
  private async checkDependencyAvailability(dependency: string): Promise<boolean> {
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
    } catch (error) {
      console.error(`Dependency check failed for ${dependency}:`, error);
      return false;
    }
  }

  /**
   * Cache management
   */
  setCache(key: string, data: any, ttl: number = 300000) { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  getCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clearCache(pattern?: string) {
    if (pattern) {
      for (const [key] of this.cache) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  /**
   * Performance monitoring
   */
  private startPerformanceMonitoring() {
    // Monitor performance every 30 seconds
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 30000);
  }

  recordPerformance(route: string, metrics: Partial<PerformanceMetrics>) {
    const performanceMetric: PerformanceMetrics = {
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

  getPerformanceMetrics(route?: string): PerformanceMetrics[] {
    if (route) {
      return this.performanceMetrics.filter(m => m.route === route);
    }
    return this.performanceMetrics;
  }

  private cleanupOldMetrics() {
    const oneHourAgo = Date.now() - 3600000; // 1 hour
    this.performanceMetrics = this.performanceMetrics.filter(
      metric => new Date(metric.timestamp).getTime() > oneHourAgo
    );
  }

  /**
   * Get performance insights
   */
  getPerformanceInsights(): {
    averageLoadTime: number;
    averageRenderTime: number;
    cacheHitRate: number;
    errorRate: number;
    slowestRoutes: string[];
  } {
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

    const routePerformance = new Map<string, number>();
    this.performanceMetrics.forEach(metric => {
      const current = routePerformance.get(metric.route) || 0;
      routePerformance.set(metric.route, current + metric.loadTime);
    });

    const slowestRoutes = Array.from(routePerformance.entries())
      .sort(([,a], [,b]) => b - a)
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
  private state: GrowthEngineState;
  private listeners: Map<string, Function[]> = new Map();
  private persistence: Map<string, any> = new Map();

  constructor(initialState?: Partial<GrowthEngineState>) {
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
  getState(): GrowthEngineState {
    return { ...this.state };
  }

  /**
   * Update state
   */
  updateState(updates: Partial<GrowthEngineState>) {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...updates };
    
    // Notify listeners of changes
    this.notifyListeners('stateChange', { oldState, newState: this.state });
  }

  /**
   * Subscribe to state changes
   */
  subscribe(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * Unsubscribe from state changes
   */
  unsubscribe(event: string, callback: Function) {
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
  private notifyListeners(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('State listener error:', error);
        }
      });
    }
  }

  /**
   * Persist state to storage
   */
  async persistState(key: string, data: any) {
    this.persistence.set(key, data);
    
    try {
      await supabase
        .from('growth_engine_state')
        .upsert({
          key,
          data,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to persist state:', error);
    }
  }

  /**
   * Restore state from storage
   */
  async restoreState(key: string): Promise<any> {
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
    } catch (error) {
      console.error('Failed to restore state:', error);
    }
    
    return null;
  }

  /**
   * Clear persisted state
   */
  async clearPersistedState(key: string) {
    this.persistence.delete(key);
    
    try {
      await supabase
        .from('growth_engine_state')
        .delete()
        .eq('key', key);
    } catch (error) {
      console.error('Failed to clear persisted state:', error);
    }
  }
}

/**
 * Performance Optimization Service
 */
export class GrowthEnginePerformanceOptimizer {
  private router: GrowthEngineRouter;
  private stateManager: GrowthEngineStateManager;

  constructor(router: GrowthEngineRouter, stateManager: GrowthEngineStateManager) {
    this.router = router;
    this.stateManager = stateManager;
  }

  /**
   * Optimize route loading
   */
  async optimizeRouteLoading(routeId: string, userPermissions: string[]): Promise<any> {
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

    } catch (error) {
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
  private async loadRouteData(route: GrowthEngineRoute): Promise<any> {
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
  private async loadDashboardData(): Promise<any> {
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
  private async loadAnalyticsData(): Promise<any> {
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
  private async loadActionsData(): Promise<any> {
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
  private async loadPhasesData(): Promise<any> {
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
  private async loadOptimizationData(): Promise<any> {
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
  private async loadAIData(): Promise<any> {
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
  private getCacheTTL(strategy: string): number {
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
  private recordPerformance(route: string, metrics: Partial<PerformanceMetrics>) {
    this.router.recordPerformance(route, metrics);
  }

  /**
   * Get optimization recommendations
   */
  getOptimizationRecommendations(): string[] {
    const insights = this.router.getPerformanceInsights();
    const recommendations: string[] = [];

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
export const growthEnginePerformanceOptimizer = new GrowthEnginePerformanceOptimizer(
  growthEngineRouter,
  growthEngineStateManager
);

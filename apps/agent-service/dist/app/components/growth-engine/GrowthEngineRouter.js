/**
 * Growth Engine Router Component
 *
 * ENG-026: Advanced routing component for Growth Engine infrastructure
 * Provides intelligent routing, caching, and performance optimization
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { growthEngineRouter, growthEngineStateManager, growthEnginePerformanceOptimizer } from '~/services/growth-engine/core-infrastructure';
export const RouteContext = React.createContext(null);
export function useGrowthEngineRoute() {
    const context = React.useContext(RouteContext);
    if (!context) {
        throw new Error('useGrowthEngineRoute must be used within GrowthEngineRouter');
    }
    return context;
}
export function GrowthEngineRouter({ children, userPermissions, currentPhase }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentRoute, setCurrentRoute] = useState(null);
    const [availableRoutes, setAvailableRoutes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [performance, setPerformance] = useState({
        loadTime: 0,
        cacheHitRate: 0,
        errorRate: 0
    });
    // Get available routes for current phase
    const routes = useMemo(() => {
        return growthEngineRouter.getRoutesForPhase(currentPhase, userPermissions);
    }, [currentPhase, userPermissions]);
    // Update available routes when routes change
    useEffect(() => {
        setAvailableRoutes(routes);
    }, [routes]);
    // Find current route based on location
    useEffect(() => {
        const path = location.pathname;
        const route = routes.find(r => r.path === path);
        setCurrentRoute(route || null);
    }, [location.pathname, routes]);
    // Performance monitoring
    useEffect(() => {
        const updatePerformance = () => {
            const insights = growthEngineRouter.getPerformanceInsights();
            setPerformance({
                loadTime: insights.averageLoadTime,
                cacheHitRate: insights.cacheHitRate,
                errorRate: insights.errorRate
            });
        };
        updatePerformance();
        const interval = setInterval(updatePerformance, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, []);
    // Navigate to route with optimization
    const navigateToRoute = useCallback(async (routeId) => {
        setIsLoading(true);
        setError(null);
        try {
            const startTime = performance.now();
            // Optimize route loading
            await growthEnginePerformanceOptimizer.optimizeRouteLoading(routeId, userPermissions);
            const loadTime = performance.now() - startTime;
            // Update performance metrics
            setPerformance(prev => ({
                ...prev,
                loadTime: (prev.loadTime + loadTime) / 2 // Rolling average
            }));
            // Navigate to route
            const route = growthEngineRouter.getRoute(routeId, userPermissions);
            if (route) {
                navigate(route.path);
            }
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Navigation failed';
            setError(errorMessage);
            console.error('Route navigation error:', err);
        }
        finally {
            setIsLoading(false);
        }
    }, [navigate, userPermissions]);
    // Refresh current route
    const refreshRoute = useCallback(async () => {
        if (!currentRoute)
            return;
        setIsLoading(true);
        setError(null);
        try {
            // Clear cache for current route
            growthEngineRouter.clearCache(`route:${currentRoute.id}`);
            // Reload route data
            await growthEnginePerformanceOptimizer.optimizeRouteLoading(currentRoute.id, userPermissions);
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Refresh failed';
            setError(errorMessage);
            console.error('Route refresh error:', err);
        }
        finally {
            setIsLoading(false);
        }
    }, [currentRoute, userPermissions]);
    // Clear cache
    const clearCache = useCallback((pattern) => {
        growthEngineRouter.clearCache(pattern);
    }, []);
    // State management integration
    useEffect(() => {
        const handleStateChange = (data) => {
            // Update local state based on global state changes
            if (data.newState.currentPhase !== currentPhase) {
                // Phase changed, update available routes
                const newRoutes = growthEngineRouter.getRoutesForPhase(data.newState.currentPhase, userPermissions);
                setAvailableRoutes(newRoutes);
            }
        };
        growthEngineStateManager.subscribe('stateChange', handleStateChange);
        return () => {
            growthEngineStateManager.unsubscribe('stateChange', handleStateChange);
        };
    }, [currentPhase, userPermissions]);
    const contextValue = {
        currentRoute,
        availableRoutes,
        isLoading,
        error,
        performance,
        navigateToRoute,
        refreshRoute,
        clearCache
    };
    return (<RouteContext.Provider value={contextValue}>
      {children}
    </RouteContext.Provider>);
}
export function RouteGuard({ routeId, children, fallback }) {
    const { userPermissions } = useGrowthEngineRoute();
    const [hasAccess, setHasAccess] = useState(null);
    const [dependenciesOk, setDependenciesOk] = useState(null);
    useEffect(() => {
        const checkAccess = async () => {
            try {
                // Check route access
                const route = growthEngineRouter.getRoute(routeId, userPermissions);
                setHasAccess(!!route);
                if (route) {
                    // Check dependencies
                    const depsOk = await growthEngineRouter.checkDependencies(route);
                    setDependenciesOk(depsOk);
                }
            }
            catch (error) {
                console.error('Route guard check failed:', error);
                setHasAccess(false);
                setDependenciesOk(false);
            }
        };
        checkAccess();
    }, [routeId, userPermissions]);
    if (hasAccess === null || dependenciesOk === null) {
        return <div>Checking access...</div>;
    }
    if (!hasAccess) {
        return fallback || <div>Access denied</div>;
    }
    if (!dependenciesOk) {
        return fallback || <div>Dependencies not available</div>;
    }
    return <>{children}</>;
}
/**
 * Performance Monitor Component
 * Shows real-time performance metrics
 */
export function PerformanceMonitor() {
    const { performance, clearCache } = useGrowthEngineRoute();
    const [recommendations, setRecommendations] = useState([]);
    useEffect(() => {
        const getRecommendations = () => {
            return growthEnginePerformanceOptimizer.getOptimizationRecommendations();
        };
        setRecommendations(getRecommendations());
        const interval = setInterval(() => {
            setRecommendations(getRecommendations());
        }, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);
    return (<div style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            background: 'var(--occ-bg-primary)',
            color: 'var(--occ-text-on-primary)',
            padding: 'var(--occ-space-3)',
            borderRadius: 'var(--occ-radius-md)',
            fontSize: 'var(--occ-font-size-sm)',
            zIndex: 1000,
            minWidth: '200px'
        }}>
      <h4 style={{ margin: '0 0 var(--occ-space-2) 0', fontSize: 'var(--occ-font-size-sm)' }}>
        Performance Monitor
      </h4>
      
      <div style={{ marginBottom: 'var(--occ-space-2)' }}>
        <div>Load Time: {performance.loadTime.toFixed(0)}ms</div>
        <div>Cache Hit Rate: {performance.cacheHitRate.toFixed(1)}%</div>
        <div>Error Rate: {performance.errorRate.toFixed(1)}%</div>
      </div>

      {recommendations.length > 0 && (<div style={{ marginBottom: 'var(--occ-space-2)' }}>
          <strong>Recommendations:</strong>
          <ul style={{ margin: 'var(--occ-space-1) 0', paddingLeft: 'var(--occ-space-4)' }}>
            {recommendations.map((rec, index) => (<li key={index} style={{ fontSize: 'var(--occ-font-size-xs)' }}>
                {rec}
              </li>))}
          </ul>
        </div>)}

      <button onClick={() => clearCache()} style={{
            background: 'var(--occ-bg-secondary)',
            color: 'var(--occ-text-on-secondary)',
            border: 'none',
            padding: 'var(--occ-space-1) var(--occ-space-2)',
            borderRadius: 'var(--occ-radius-sm)',
            fontSize: 'var(--occ-font-size-xs)',
            cursor: 'pointer'
        }}>
        Clear Cache
      </button>
    </div>);
}
/**
 * Route Navigation Component
 * Provides navigation between Growth Engine routes
 */
export function RouteNavigation() {
    const { availableRoutes, currentRoute, navigateToRoute, isLoading } = useGrowthEngineRoute();
    return (<nav style={{
            display: 'flex',
            gap: 'var(--occ-space-2)',
            padding: 'var(--occ-space-3)',
            background: 'var(--occ-bg-secondary)',
            borderRadius: 'var(--occ-radius-md)',
            marginBottom: 'var(--occ-space-4)'
        }}>
      {availableRoutes.map(route => (<button key={route.id} onClick={() => navigateToRoute(route.id)} disabled={isLoading} style={{
                padding: 'var(--occ-space-2) var(--occ-space-3)',
                background: currentRoute?.id === route.id
                    ? 'var(--occ-bg-primary)'
                    : 'var(--occ-bg-default)',
                color: currentRoute?.id === route.id
                    ? 'var(--occ-text-on-primary)'
                    : 'var(--occ-text-default)',
                border: '1px solid var(--occ-border-default)',
                borderRadius: 'var(--occ-radius-sm)',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
                fontSize: 'var(--occ-font-size-sm)',
                fontWeight: currentRoute?.id === route.id ? 'var(--occ-font-weight-semibold)' : 'var(--occ-font-weight-normal)'
            }}>
          {route.component}
          {route.priority === 'critical' && (<span style={{
                    marginLeft: 'var(--occ-space-1)',
                    color: 'var(--occ-text-error)',
                    fontSize: 'var(--occ-font-size-xs)'
                }}>
              ⚠️
            </span>)}
        </button>))}
    </nav>);
}
//# sourceMappingURL=GrowthEngineRouter.js.map
/**
 * Growth Engine Router Component
 *
 * ENG-026: Advanced routing component for Growth Engine infrastructure
 * Provides intelligent routing, caching, and performance optimization
 */
import React from 'react';
import { type GrowthEngineRoute } from '~/services/growth-engine/core-infrastructure';
interface GrowthEngineRouterProps {
    children: React.ReactNode;
    userPermissions: string[];
    currentPhase: number;
}
interface RouteContextType {
    currentRoute: GrowthEngineRoute | null;
    availableRoutes: GrowthEngineRoute[];
    isLoading: boolean;
    error: string | null;
    performance: {
        loadTime: number;
        cacheHitRate: number;
        errorRate: number;
    };
    navigateToRoute: (routeId: string) => Promise<void>;
    refreshRoute: () => Promise<void>;
    clearCache: (pattern?: string) => void;
}
export declare const RouteContext: React.Context<RouteContextType>;
export declare function useGrowthEngineRoute(): RouteContextType;
export declare function GrowthEngineRouter({ children, userPermissions, currentPhase }: GrowthEngineRouterProps): React.JSX.Element;
/**
 * Route Guard Component
 * Protects routes based on permissions and dependencies
 */
interface RouteGuardProps {
    routeId: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}
export declare function RouteGuard({ routeId, children, fallback }: RouteGuardProps): string | number | true | Iterable<React.ReactNode> | React.JSX.Element;
/**
 * Performance Monitor Component
 * Shows real-time performance metrics
 */
export declare function PerformanceMonitor(): React.JSX.Element;
/**
 * Route Navigation Component
 * Provides navigation between Growth Engine routes
 */
export declare function RouteNavigation(): React.JSX.Element;
export {};
//# sourceMappingURL=GrowthEngineRouter.d.ts.map
/**
 * Feature Flags
 *
 * Simple feature flag system using environment variables
 * Flags can be enabled via environment variables or query parameters
 */
export interface FeatureFlags {
    ideaPool: boolean;
    socialPosting: boolean;
    advancedAnalytics: boolean;
    aiSuggestions: boolean;
    betaFeatures: boolean;
}
/**
 * Get feature flags from environment
 */
export declare function getFeatureFlags(): FeatureFlags;
/**
 * Check if a feature is enabled
 */
export declare function isFeatureEnabled(feature: keyof FeatureFlags, flags?: FeatureFlags): boolean;
/**
 * Get feature flags with query parameter overrides
 * Useful for testing/preview
 */
export declare function getFeatureFlagsWithOverrides(searchParams: URLSearchParams): FeatureFlags;
//# sourceMappingURL=feature-flags.d.ts.map
/**
 * Feature Flags
 *
 * Simple feature flag system using environment variables
 * Flags can be enabled via environment variables or query parameters
 */
/**
 * Get feature flags from environment
 */
export function getFeatureFlags() {
    return {
        ideaPool: process.env.FEATURE_IDEA_POOL === "true",
        socialPosting: process.env.FEATURE_SOCIAL_POSTING === "true",
        advancedAnalytics: process.env.FEATURE_ADVANCED_ANALYTICS === "true",
        aiSuggestions: process.env.FEATURE_AI_SUGGESTIONS === "true",
        betaFeatures: process.env.FEATURE_BETA === "true",
    };
}
/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature, flags) {
    const featureFlags = flags || getFeatureFlags();
    return featureFlags[feature] || false;
}
/**
 * Get feature flags with query parameter overrides
 * Useful for testing/preview
 */
export function getFeatureFlagsWithOverrides(searchParams) {
    const baseFlags = getFeatureFlags();
    return {
        ideaPool: searchParams.get("feature_idea_pool") === "1" || baseFlags.ideaPool,
        socialPosting: searchParams.get("feature_social_posting") === "1" ||
            baseFlags.socialPosting,
        advancedAnalytics: searchParams.get("feature_advanced_analytics") === "1" ||
            baseFlags.advancedAnalytics,
        aiSuggestions: searchParams.get("feature_ai_suggestions") === "1" ||
            baseFlags.aiSuggestions,
        betaFeatures: searchParams.get("feature_beta") === "1" || baseFlags.betaFeatures,
    };
}
//# sourceMappingURL=feature-flags.js.map
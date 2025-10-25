/**
 * Feature Flag Management Service
 *
 * Manages feature flags for gradual rollout and user targeting.
 * Enables/disables features dynamically without code deployments.
 *
 * Features:
 * - Feature flag enable/disable
 * - Gradual rollout (percentage-based)
 * - User targeting (specific users or segments)
 * - Environment-specific flags
 */
export interface FeatureFlag {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    rolloutPercentage: number;
    targetUsers?: string[];
    targetSegments?: string[];
    environment?: "development" | "staging" | "production" | "all";
    createdAt: Date;
    updatedAt: Date;
}
export interface FeatureFlagCheck {
    flagId: string;
    userId: string;
    isEnabled: boolean;
    reason: string;
    checkedAt: Date;
}
export declare class FeatureFlagService {
    /**
     * Check if feature is enabled for user
     *
     * Decision logic (in order):
     * 1. Check if flag exists and master switch is enabled
     * 2. Check if user is in target users list
     * 3. Check if user is in target segments
     * 4. Check rollout percentage (deterministic hashing)
     * 5. Check environment match
     *
     * @param flagId - Feature flag identifier
     * @param userId - User identifier (shop domain)
     * @param userSegment - Optional user segment
     * @returns Whether feature is enabled for this user
     */
    isFeatureEnabled(flagId: string, userId: string, userSegment?: string): Promise<boolean>;
    /**
     * Check feature with detailed reasoning
     *
     * Returns both the enabled status and the reason why.
     * Useful for debugging and analytics.
     *
     * @param flagId - Feature flag identifier
     * @param userId - User identifier
     * @param userSegment - Optional user segment
     * @returns Feature flag check result with reason
     */
    checkFeature(flagId: string, userId: string, userSegment?: string): Promise<FeatureFlagCheck>;
    /**
     * Get feature flag by ID
     *
     * @param flagId - Feature flag identifier
     * @returns Feature flag or null
     */
    getFeatureFlag(flagId: string): Promise<FeatureFlag | null>;
    /**
     * Get all feature flags
     *
     * @returns Array of all feature flags
     */
    getAllFeatureFlags(): Promise<FeatureFlag[]>;
    /**
     * Create or update feature flag
     *
     * @param flag - Feature flag data
     * @returns Created/updated feature flag
     */
    upsertFeatureFlag(flag: Partial<FeatureFlag> & {
        id: string;
    }): Promise<FeatureFlag>;
    /**
     * Enable feature flag
     *
     * Sets master switch to enabled (does not affect rollout percentage).
     *
     * @param flagId - Feature flag identifier
     */
    enableFeature(flagId: string): Promise<void>;
    /**
     * Disable feature flag
     *
     * Sets master switch to disabled (overrides all other settings).
     *
     * @param flagId - Feature flag identifier
     */
    disableFeature(flagId: string): Promise<void>;
    /**
     * Update rollout percentage
     *
     * Gradually increase/decrease % of users who see the feature.
     *
     * @param flagId - Feature flag identifier
     * @param percentage - New rollout percentage (0-100)
     */
    updateRolloutPercentage(flagId: string, percentage: number): Promise<void>;
    /**
     * Add user to target users list
     *
     * Explicitly enable feature for specific user.
     *
     * @param flagId - Feature flag identifier
     * @param userId - User identifier to add
     */
    addTargetUser(flagId: string, userId: string): Promise<void>;
    /**
     * Remove user from target users list
     *
     * @param flagId - Feature flag identifier
     * @param userId - User identifier to remove
     */
    removeTargetUser(flagId: string, userId: string): Promise<void>;
    /**
     * Check if user is in rollout percentage
     *
     * Uses deterministic hashing to ensure consistent experience.
     * Same user always gets same result for same flag.
     *
     * @param userId - User identifier
     * @param flagId - Feature flag identifier
     * @param percentage - Rollout percentage (0-100)
     * @returns Whether user is in rollout
     */
    private isUserInRollout;
    /**
     * Hash user ID with flag ID
     *
     * Creates deterministic hash for consistent rollout.
     *
     * @param userId - User identifier
     * @param flagId - Feature flag identifier
     * @returns Numeric hash value
     */
    private hashUserFlag;
    /**
     * Get current environment
     *
     * Determines environment from NODE_ENV or defaults to development.
     *
     * @returns Current environment
     */
    private getCurrentEnvironment;
}
export declare const featureFlagService: FeatureFlagService;
//# sourceMappingURL=feature-flags.d.ts.map
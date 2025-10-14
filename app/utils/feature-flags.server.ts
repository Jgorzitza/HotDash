/**
 * Feature flag system for gradual rollouts and A/B testing
 * 
 * Supports:
 * - Boolean flags (on/off)
 * - Percentage rollouts (0-100%)
 * - User targeting (by shop domain, email, etc.)
 * - Environment-based flags
 */

interface FeatureFlag {
  key: string;
  enabled: boolean;
  rolloutPercentage?: number; // 0-100
  targetShops?: string[]; // Specific shops to enable for
  targetEmails?: string[]; // Specific users to enable for
  environments?: string[]; // Environments where flag is enabled
}

class FeatureFlagManager {
  private flags = new Map<string, FeatureFlag>();

  /**
   * Register a feature flag
   */
  register(flag: FeatureFlag): void {
    this.flags.set(flag.key, flag);
  }

  /**
   * Check if a feature is enabled for a given context
   * 
   * @param key - Feature flag key
   * @param context - Context for evaluation (shop, user, etc.)
   * @returns true if feature is enabled
   */
  isEnabled(
    key: string,
    context?: { shopDomain?: string; email?: string; userId?: string },
  ): boolean {
    const flag = this.flags.get(key);

    if (!flag) {
      // Default to disabled if flag not found
      return false;
    }

    // Check if globally disabled
    if (!flag.enabled) {
      return false;
    }

    // Check environment
    if (flag.environments && flag.environments.length > 0) {
      const currentEnv = process.env.NODE_ENV || "development";
      if (!flag.environments.includes(currentEnv)) {
        return false;
      }
    }

    // Check specific shop targeting
    if (flag.targetShops && flag.targetShops.length > 0 && context?.shopDomain) {
      return flag.targetShops.includes(context.shopDomain);
    }

    // Check specific user targeting
    if (flag.targetEmails && flag.targetEmails.length > 0 && context?.email) {
      return flag.targetEmails.includes(context.email);
    }

    // Check percentage rollout
    if (flag.rolloutPercentage !== undefined) {
      const hash = this.hashString(context?.shopDomain || context?.email || context?.userId || "");
      const percentage = hash % 100;
      return percentage < flag.rolloutPercentage;
    }

    // Default to enabled if no targeting rules
    return true;
  }

  /**
   * Get all registered flags
   */
  getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  /**
   * Get flag configuration
   */
  getFlag(key: string): FeatureFlag | undefined {
    return this.flags.get(key);
  }

  /**
   * Simple string hash for consistent percentage rollouts
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

// Singleton instance
export const featureFlags = new FeatureFlagManager();

// Register feature flags
featureFlags.register({
  key: "picker-payments",
  enabled: true,
  environments: ["development", "staging"],
});

featureFlags.register({
  key: "seo-pulse-refinement",
  enabled: false, // Not ready yet
  rolloutPercentage: 0,
});

featureFlags.register({
  key: "performance-monitoring",
  enabled: true,
  environments: ["development", "staging", "production"],
});

featureFlags.register({
  key: "advanced-analytics",
  enabled: false,
  rolloutPercentage: 10, // 10% rollout
});

featureFlags.register({
  key: "live-chat-widget",
  enabled: true,
  targetShops: ["hotroddash.myshopify.com"],
});

/**
 * Helper to wrap feature-flagged code
 * 
 * @example
 * ```typescript
 * export async function loader({ request }: LoaderFunctionArgs) {
 *   return withFeatureFlag('new-feature', context, async () => {
 *     // New feature code
 *     return Response.json({ data: 'new' });
 *   }, async () => {
 *     // Fallback code
 *     return Response.json({ data: 'old' });
 *   });
 * }
 * ```
 */
export async function withFeatureFlag<T>(
  key: string,
  context: { shopDomain?: string; email?: string; userId?: string },
  enabledHandler: () => Promise<T>,
  disabledHandler?: () => Promise<T>,
): Promise<T> {
  const enabled = featureFlags.isEnabled(key, context);

  if (enabled) {
    return enabledHandler();
  }

  if (disabledHandler) {
    return disabledHandler();
  }

  throw new Error(`Feature ${key} is disabled and no fallback provided`);
}


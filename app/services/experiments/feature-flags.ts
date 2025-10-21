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

import { createHash } from "crypto";
import { db } from "~/lib/db.server";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface FeatureFlag {
  id: string;                    // "FEATURE_DARK_MODE"
  name: string;                  // "Dark Mode"
  description: string;           // "Enable dark theme for users"
  enabled: boolean;              // Master on/off switch
  rolloutPercentage: number;     // 0-100 (% of users who see feature)
  targetUsers?: string[];        // Specific users to enable for
  targetSegments?: string[];     // User segments to enable for
  environment?: "development" | "staging" | "production" | "all";
  createdAt: Date;
  updatedAt: Date;
}

export interface FeatureFlagCheck {
  flagId: string;
  userId: string;
  isEnabled: boolean;
  reason: string;               // Why enabled/disabled
  checkedAt: Date;
}

// ============================================================================
// Feature Flag Service Class
// ============================================================================

export class FeatureFlagService {
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
  async isFeatureEnabled(
    flagId: string,
    userId: string,
    userSegment?: string
  ): Promise<boolean> {
    const check = await this.checkFeature(flagId, userId, userSegment);
    return check.isEnabled;
  }

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
  async checkFeature(
    flagId: string,
    userId: string,
    userSegment?: string
  ): Promise<FeatureFlagCheck> {
    const flag = await this.getFeatureFlag(flagId);
    const checkedAt = new Date();

    // Flag doesn't exist
    if (!flag) {
      return {
        flagId,
        userId,
        isEnabled: false,
        reason: "Flag not found",
        checkedAt
      };
    }

    // Master switch is off
    if (!flag.enabled) {
      return {
        flagId,
        userId,
        isEnabled: false,
        reason: "Flag disabled (master switch off)",
        checkedAt
      };
    }

    // Check environment
    const currentEnv = this.getCurrentEnvironment();
    if (flag.environment && flag.environment !== "all" && flag.environment !== currentEnv) {
      return {
        flagId,
        userId,
        isEnabled: false,
        reason: `Environment mismatch (current: ${currentEnv}, required: ${flag.environment})`,
        checkedAt
      };
    }

    // Check target users (explicit whitelist)
    if (flag.targetUsers && flag.targetUsers.length > 0) {
      if (flag.targetUsers.includes(userId)) {
        return {
          flagId,
          userId,
          isEnabled: true,
          reason: "User in target users list",
          checkedAt
        };
      }
      // If targetUsers is defined but user not in list, disabled
      return {
        flagId,
        userId,
        isEnabled: false,
        reason: "User not in target users list",
        checkedAt
      };
    }

    // Check target segments
    if (flag.targetSegments && flag.targetSegments.length > 0 && userSegment) {
      if (flag.targetSegments.includes(userSegment)) {
        // Still need to check rollout percentage
        const isInRollout = this.isUserInRollout(userId, flagId, flag.rolloutPercentage);
        return {
          flagId,
          userId,
          isEnabled: isInRollout,
          reason: isInRollout
            ? `User in target segment "${userSegment}" and rollout (${flag.rolloutPercentage}%)`
            : `User in target segment "${userSegment}" but not in rollout`,
          checkedAt
        };
      }
      // Segment specified but user not in any target segment
      return {
        flagId,
        userId,
        isEnabled: false,
        reason: `User segment "${userSegment}" not in target segments`,
        checkedAt
      };
    }

    // Check rollout percentage (deterministic)
    const isInRollout = this.isUserInRollout(userId, flagId, flag.rolloutPercentage);
    return {
      flagId,
      userId,
      isEnabled: isInRollout,
      reason: isInRollout
        ? `User in rollout (${flag.rolloutPercentage}%)`
        : `User not in rollout (${flag.rolloutPercentage}%)`,
      checkedAt
    };
  }

  /**
   * Get feature flag by ID
   * 
   * @param flagId - Feature flag identifier
   * @returns Feature flag or null
   */
  async getFeatureFlag(flagId: string): Promise<FeatureFlag | null> {
    // TODO: Query from database
    // For now, return hardcoded flags for common features
    const hardcodedFlags: Record<string, FeatureFlag> = {
      FEATURE_DARK_MODE: {
        id: "FEATURE_DARK_MODE",
        name: "Dark Mode",
        description: "Enable dark theme for users",
        enabled: true,
        rolloutPercentage: 100,
        environment: "all",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      FEATURE_REALTIME_UPDATES: {
        id: "FEATURE_REALTIME_UPDATES",
        name: "Real-time Updates",
        description: "Enable SSE for real-time dashboard updates",
        enabled: true,
        rolloutPercentage: 50, // 50% rollout
        environment: "all",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      FEATURE_CEO_AGENT: {
        id: "FEATURE_CEO_AGENT",
        name: "CEO Agent",
        description: "Enable CEO AI assistant",
        enabled: false, // Not ready yet
        rolloutPercentage: 0,
        environment: "development",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      FEATURE_ADVANCED_CHARTS: {
        id: "FEATURE_ADVANCED_CHARTS",
        name: "Advanced Charts",
        description: "Enable Polaris Viz charts",
        enabled: true,
        rolloutPercentage: 100,
        environment: "all",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    return hardcodedFlags[flagId] || null;
  }

  /**
   * Get all feature flags
   * 
   * @returns Array of all feature flags
   */
  async getAllFeatureFlags(): Promise<FeatureFlag[]> {
    // TODO: Query from database
    const flags = [
      await this.getFeatureFlag("FEATURE_DARK_MODE"),
      await this.getFeatureFlag("FEATURE_REALTIME_UPDATES"),
      await this.getFeatureFlag("FEATURE_CEO_AGENT"),
      await this.getFeatureFlag("FEATURE_ADVANCED_CHARTS")
    ];
    return flags.filter(Boolean) as FeatureFlag[];
  }

  /**
   * Create or update feature flag
   * 
   * @param flag - Feature flag data
   * @returns Created/updated feature flag
   */
  async upsertFeatureFlag(flag: Partial<FeatureFlag> & { id: string }): Promise<FeatureFlag> {
    // TODO: Implement database upsert
    // For now, return the input as-is
    return {
      ...flag,
      name: flag.name || flag.id,
      description: flag.description || "",
      enabled: flag.enabled ?? true,
      rolloutPercentage: flag.rolloutPercentage ?? 100,
      environment: flag.environment || "all",
      createdAt: flag.createdAt || new Date(),
      updatedAt: new Date()
    } as FeatureFlag;
  }

  /**
   * Enable feature flag
   * 
   * Sets master switch to enabled (does not affect rollout percentage).
   * 
   * @param flagId - Feature flag identifier
   */
  async enableFeature(flagId: string): Promise<void> {
    const flag = await this.getFeatureFlag(flagId);
    if (flag) {
      await this.upsertFeatureFlag({ ...flag, enabled: true });
    }
  }

  /**
   * Disable feature flag
   * 
   * Sets master switch to disabled (overrides all other settings).
   * 
   * @param flagId - Feature flag identifier
   */
  async disableFeature(flagId: string): Promise<void> {
    const flag = await this.getFeatureFlag(flagId);
    if (flag) {
      await this.upsertFeatureFlag({ ...flag, enabled: false });
    }
  }

  /**
   * Update rollout percentage
   * 
   * Gradually increase/decrease % of users who see the feature.
   * 
   * @param flagId - Feature flag identifier
   * @param percentage - New rollout percentage (0-100)
   */
  async updateRolloutPercentage(flagId: string, percentage: number): Promise<void> {
    if (percentage < 0 || percentage > 100) {
      throw new Error("Rollout percentage must be between 0 and 100");
    }

    const flag = await this.getFeatureFlag(flagId);
    if (flag) {
      await this.upsertFeatureFlag({ ...flag, rolloutPercentage: percentage });
    }
  }

  /**
   * Add user to target users list
   * 
   * Explicitly enable feature for specific user.
   * 
   * @param flagId - Feature flag identifier
   * @param userId - User identifier to add
   */
  async addTargetUser(flagId: string, userId: string): Promise<void> {
    const flag = await this.getFeatureFlag(flagId);
    if (flag) {
      const targetUsers = flag.targetUsers || [];
      if (!targetUsers.includes(userId)) {
        targetUsers.push(userId);
        await this.upsertFeatureFlag({ ...flag, targetUsers });
      }
    }
  }

  /**
   * Remove user from target users list
   * 
   * @param flagId - Feature flag identifier
   * @param userId - User identifier to remove
   */
  async removeTargetUser(flagId: string, userId: string): Promise<void> {
    const flag = await this.getFeatureFlag(flagId);
    if (flag && flag.targetUsers) {
      const targetUsers = flag.targetUsers.filter(id => id !== userId);
      await this.upsertFeatureFlag({ ...flag, targetUsers });
    }
  }

  // ==========================================================================
  // Private Helper Methods
  // ==========================================================================

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
  private isUserInRollout(userId: string, flagId: string, percentage: number): boolean {
    // 0% = nobody, 100% = everybody
    if (percentage === 0) return false;
    if (percentage === 100) return true;

    // Hash user + flag to get deterministic value
    const hash = this.hashUserFlag(userId, flagId);
    const userPercentile = (hash % 10000) / 100; // 0-100
    
    return userPercentile < percentage;
  }

  /**
   * Hash user ID with flag ID
   * 
   * Creates deterministic hash for consistent rollout.
   * 
   * @param userId - User identifier
   * @param flagId - Feature flag identifier
   * @returns Numeric hash value
   */
  private hashUserFlag(userId: string, flagId: string): number {
    const hash = createHash("md5")
      .update(userId + flagId)
      .digest("hex");
    return parseInt(hash.substring(0, 8), 16);
  }

  /**
   * Get current environment
   * 
   * Determines environment from NODE_ENV or defaults to development.
   * 
   * @returns Current environment
   */
  private getCurrentEnvironment(): "development" | "staging" | "production" {
    const env = process.env.NODE_ENV;
    if (env === "production") return "production";
    if (env === "staging") return "staging";
    return "development";
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================

export const featureFlagService = new FeatureFlagService();

/**
 * Feature Flags Service
 * 
 * Manages feature flag state and user preferences for gradual feature rollout.
 * Integrates with user_preferences table (Data agent - pending migration).
 * 
 * @module app/services/experiments/feature-flags
 * @see docs/directions/product.md PRODUCT-001
 * @see docs/manager/PROJECT_PLAN.md Phase 6 (Settings)
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Available feature flags for HotDash Option A build
 */
export type FeatureFlagKey =
  | 'FEATURE_SUPABASE_IDEA_POOL' // Existing - Idea pool integration
  | 'FEATURE_REALTIME_UPDATES'   // Phase 5 - SSE live updates
  | 'FEATURE_DARK_MODE'           // Phase 6 - Theme switcher
  | 'FEATURE_ADVANCED_CHARTS'     // Phase 7-8 - Data visualization
  | 'FEATURE_CEO_AGENT';          // Phase 11 - CEO assistant agent

/**
 * Feature flag configuration
 */
export interface FeatureFlag {
  key: FeatureFlagKey;
  name: string;
  description: string;
  defaultEnabled: boolean;
  experimental: boolean; // Shows "Experimental" badge in UI
  availableFrom: string; // Phase when feature becomes available
}

/**
 * All available feature flags with metadata
 */
export const FEATURE_FLAGS: Record<FeatureFlagKey, FeatureFlag> = {
  FEATURE_SUPABASE_IDEA_POOL: {
    key: 'FEATURE_SUPABASE_IDEA_POOL',
    name: 'Idea Pool',
    description: 'Always-on product suggestion pipeline with 5 active ideas',
    defaultEnabled: true, // Already implemented and stable
    experimental: false,
    availableFrom: 'Phase 1',
  },
  FEATURE_REALTIME_UPDATES: {
    key: 'FEATURE_REALTIME_UPDATES',
    name: 'Real-Time Updates',
    description: 'Live dashboard updates via Server-Sent Events (SSE)',
    defaultEnabled: false,
    experimental: true,
    availableFrom: 'Phase 5',
  },
  FEATURE_DARK_MODE: {
    key: 'FEATURE_DARK_MODE',
    name: 'Dark Mode',
    description: 'Dark theme with WCAG AA contrast compliance',
    defaultEnabled: false,
    experimental: true,
    availableFrom: 'Phase 6',
  },
  FEATURE_ADVANCED_CHARTS: {
    key: 'FEATURE_ADVANCED_CHARTS',
    name: 'Advanced Charts',
    description: 'Interactive data visualizations with @shopify/polaris-viz',
    defaultEnabled: false,
    experimental: true,
    availableFrom: 'Phase 7-8',
  },
  FEATURE_CEO_AGENT: {
    key: 'FEATURE_CEO_AGENT',
    name: 'CEO Assistant Agent',
    description: 'AI-powered operations assistant (OpenAI Agents SDK)',
    defaultEnabled: false,
    experimental: true,
    availableFrom: 'Phase 11',
  },
};

/**
 * User's feature flag preferences
 */
export interface UserFeatureFlags {
  userId: string;
  flags: Partial<Record<FeatureFlagKey, boolean>>;
  updatedAt: Date;
}

/**
 * Get all available feature flags
 */
export function getAllFeatureFlags(): FeatureFlag[] {
  return Object.values(FEATURE_FLAGS);
}

/**
 * Check if a specific feature flag is enabled for a user
 * 
 * @param userId - Shopify shop owner ID
 * @param flagKey - Feature flag key to check
 * @param supabaseUrl - Supabase project URL (from env)
 * @param supabaseKey - Supabase anon key (from env)
 * @returns true if flag is enabled, false otherwise
 */
export async function isFeatureEnabled(
  userId: string,
  flagKey: FeatureFlagKey,
  supabaseUrl: string,
  supabaseKey: string
): Promise<boolean> {
  const flag = FEATURE_FLAGS[flagKey];
  
  if (!flag) {
    console.warn(`Unknown feature flag: ${flagKey}`);
    return false;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Query user_preferences table for this user's flags
    const { data, error } = await supabase
      .from('user_preferences')
      .select('feature_flags')
      .eq('user_id', userId)
      .single();

    if (error) {
      // User preferences don't exist yet, use default
      console.debug(`No user preferences found for ${userId}, using default: ${flag.defaultEnabled}`);
      return flag.defaultEnabled;
    }

    if (!data || !data.feature_flags) {
      return flag.defaultEnabled;
    }

    // Check if user has explicitly set this flag
    const userFlags = data.feature_flags as Record<string, boolean>;
    return userFlags[flagKey] !== undefined ? userFlags[flagKey] : flag.defaultEnabled;
  } catch (err) {
    console.error(`Error checking feature flag ${flagKey}:`, err);
    return flag.defaultEnabled; // Fail safe to default
  }
}

/**
 * Get all feature flags for a user (merges defaults with user preferences)
 * 
 * @param userId - Shopify shop owner ID
 * @param supabaseUrl - Supabase project URL
 * @param supabaseKey - Supabase anon key
 * @returns User's feature flag state for all flags
 */
export async function getUserFeatureFlags(
  userId: string,
  supabaseUrl: string,
  supabaseKey: string
): Promise<UserFeatureFlags> {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    const { data } = await supabase
      .from('user_preferences')
      .select('feature_flags, updated_at')
      .eq('user_id', userId)
      .single();

    const userFlags: Partial<Record<FeatureFlagKey, boolean>> = {};
    
    // Merge defaults with user preferences
    for (const flagKey of Object.keys(FEATURE_FLAGS) as FeatureFlagKey[]) {
      const flag = FEATURE_FLAGS[flagKey];
      
      if (data && data.feature_flags) {
        const userPrefs = data.feature_flags as Record<string, boolean>;
        userFlags[flagKey] = userPrefs[flagKey] !== undefined 
          ? userPrefs[flagKey] 
          : flag.defaultEnabled;
      } else {
        userFlags[flagKey] = flag.defaultEnabled;
      }
    }

    return {
      userId,
      flags: userFlags,
      updatedAt: data?.updated_at ? new Date(data.updated_at) : new Date(),
    };
  } catch (err) {
    console.error('Error fetching user feature flags:', err);
    
    // Return defaults on error
    const defaultFlags: Partial<Record<FeatureFlagKey, boolean>> = {};
    for (const flagKey of Object.keys(FEATURE_FLAGS) as FeatureFlagKey[]) {
      defaultFlags[flagKey] = FEATURE_FLAGS[flagKey].defaultEnabled;
    }
    
    return {
      userId,
      flags: defaultFlags,
      updatedAt: new Date(),
    };
  }
}

/**
 * Update user's feature flag preferences
 * 
 * @param userId - Shopify shop owner ID
 * @param flags - Flags to update (partial, only changed flags needed)
 * @param supabaseUrl - Supabase project URL
 * @param supabaseKey - Supabase anon key
 * @returns Success status
 */
export async function updateUserFeatureFlags(
  userId: string,
  flags: Partial<Record<FeatureFlagKey, boolean>>,
  supabaseUrl: string,
  supabaseKey: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Check if user preferences exist
    const { data: existing } = await supabase
      .from('user_preferences')
      .select('feature_flags')
      .eq('user_id', userId)
      .single();

    const updatedFlags = {
      ...(existing?.feature_flags || {}),
      ...flags,
    };

    if (existing) {
      // Update existing preferences
      const { error } = await supabase
        .from('user_preferences')
        .update({
          feature_flags: updatedFlags,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      // Create new preferences
      const { error } = await supabase
        .from('user_preferences')
        .insert({
          user_id: userId,
          feature_flags: updatedFlags,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) {
        return { success: false, error: error.message };
      }
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error updating feature flags:', err);
    return { success: false, error: message };
  }
}

/**
 * Reset user's feature flags to defaults
 * 
 * @param userId - Shopify shop owner ID
 * @param supabaseUrl - Supabase project URL
 * @param supabaseKey - Supabase anon key
 */
export async function resetUserFeatureFlags(
  userId: string,
  supabaseUrl: string,
  supabaseKey: string
): Promise<{ success: boolean; error?: string }> {
  const defaultFlags: Partial<Record<FeatureFlagKey, boolean>> = {};
  
  for (const flagKey of Object.keys(FEATURE_FLAGS) as FeatureFlagKey[]) {
    defaultFlags[flagKey] = FEATURE_FLAGS[flagKey].defaultEnabled;
  }
  
  return updateUserFeatureFlags(userId, defaultFlags, supabaseUrl, supabaseKey);
}


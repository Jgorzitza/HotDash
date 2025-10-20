/**
 * Product Analytics Service
 * 
 * Tracks product metrics for data-driven decision making:
 * - Feature adoption rates
 * - Tile engagement (clicks per tile)
 * - Modal actions (approve vs reject rates)
 * - Settings changes
 * - A/B test results
 * 
 * @module app/services/analytics/product-analytics
 * @see docs/directions/product.md PRODUCT-004
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Feature adoption metric
 */
export interface FeatureAdoption {
  featureKey: string;
  featureName: string;
  totalUsers: number;
  activeUsers: number;
  adoptionRate: number; // 0-1
  firstUsedAt?: Date;
  lastUsedAt?: Date;
}

/**
 * Tile engagement metric
 */
export interface TileEngagement {
  tileId: string;
  tileName: string;
  clicks: number;
  uniqueUsers: number;
  avgClicksPerUser: number;
  lastInteraction: Date;
}

/**
 * Modal action metric
 */
export interface ModalActionMetric {
  modalType: string;
  approvals: number;
  rejections: number;
  approvalRate: number; // 0-1
  avgTimeToAction: number; // milliseconds
}

/**
 * Settings change tracking
 */
export interface SettingsChange {
  userId: string;
  settingKey: string;
  oldValue: unknown;
  newValue: unknown;
  changedAt: Date;
}

/**
 * Product metrics summary
 */
export interface ProductMetrics {
  featureAdoption: FeatureAdoption[];
  tileEngagement: TileEngagement[];
  modalActions: ModalActionMetric[];
  activeExperiments: number;
}

/**
 * Get feature adoption rates
 * 
 * Calculates what % of users are using each feature
 * 
 * @param supabaseUrl - Supabase project URL
 * @param supabaseKey - Supabase anon key
 * @returns Feature adoption metrics
 */
export async function getFeatureAdoption(
  supabaseUrl: string,
  supabaseKey: string
): Promise<FeatureAdoption[]> {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Query decision_log to see which features users have interacted with
    const { data: decisions } = await supabase
      .from('decision_log')
      .select('shop_owner, tool_name, created_at')
      .order('created_at', { ascending: false });

    if (!decisions || decisions.length === 0) {
      return [];
    }

    // Get total unique users
    const totalUsers = new Set(decisions.map(d => d.shop_owner)).size;

    // Group by feature (tool_name)
    const featureUsage: Record<string, { users: Set<string>; firstUsed?: Date; lastUsed?: Date }> = {};
    
    for (const decision of decisions) {
      const feature = decision.tool_name;
      
      if (!featureUsage[feature]) {
        featureUsage[feature] = {
          users: new Set(),
          firstUsed: new Date(decision.created_at),
          lastUsed: new Date(decision.created_at),
        };
      }
      
      featureUsage[feature].users.add(decision.shop_owner);
      
      const decisionDate = new Date(decision.created_at);
      if (featureUsage[feature].firstUsed && decisionDate < featureUsage[feature].firstUsed) {
        featureUsage[feature].firstUsed = decisionDate;
      }
      if (featureUsage[feature].lastUsed && decisionDate > featureUsage[feature].lastUsed) {
        featureUsage[feature].lastUsed = decisionDate;
      }
    }

    // Calculate adoption rates
    return Object.entries(featureUsage).map(([featureKey, data]) => ({
      featureKey,
      featureName: formatFeatureName(featureKey),
      totalUsers,
      activeUsers: data.users.size,
      adoptionRate: data.users.size / totalUsers,
      firstUsedAt: data.firstUsed,
      lastUsedAt: data.lastUsed,
    }));
  } catch (err) {
    console.error('Error fetching feature adoption:', err);
    return [];
  }
}

/**
 * Get tile engagement metrics
 * 
 * Tracks which tiles users interact with most
 * 
 * @param supabaseUrl - Supabase project URL
 * @param supabaseKey - Supabase anon key
 * @returns Tile engagement metrics
 */
export async function getTileEngagement(
  supabaseUrl: string,
  supabaseKey: string
): Promise<TileEngagement[]> {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Query decision_log for tile interactions
    // Tile clicks would be logged as tool interactions
    const { data: interactions } = await supabase
      .from('decision_log')
      .select('shop_owner, tool_name, created_at')
      .order('created_at', { ascending: false });

    if (!interactions || interactions.length === 0) {
      return [];
    }

    // Map tool names to tile IDs
    const tileMapping: Record<string, string> = {
      'sales_pulse': 'Sales Pulse',
      'cx_pulse': 'CX Pulse',
      'inventory_status': 'Inventory Status',
      'seo_content_watch': 'SEO & Content Watch',
      'social_pulse': 'Social Pulse',
      'ads_pulse': 'Ads Pulse',
      'idea_pool': 'Idea Pool',
      'approvals_queue': 'Approvals Queue',
    };

    const tileStats: Record<string, { clicks: number; users: Set<string>; lastInteraction: Date }> = {};
    
    for (const interaction of interactions) {
      const tileId = interaction.tool_name;
      
      if (!tileStats[tileId]) {
        tileStats[tileId] = {
          clicks: 0,
          users: new Set(),
          lastInteraction: new Date(interaction.created_at),
        };
      }
      
      tileStats[tileId].clicks++;
      tileStats[tileId].users.add(interaction.shop_owner);
      
      const interactionDate = new Date(interaction.created_at);
      if (interactionDate > tileStats[tileId].lastInteraction) {
        tileStats[tileId].lastInteraction = interactionDate;
      }
    }

    return Object.entries(tileStats).map(([tileId, stats]) => ({
      tileId,
      tileName: tileMapping[tileId] || tileId,
      clicks: stats.clicks,
      uniqueUsers: stats.users.size,
      avgClicksPerUser: stats.clicks / stats.users.size,
      lastInteraction: stats.lastInteraction,
    }));
  } catch (err) {
    console.error('Error fetching tile engagement:', err);
    return [];
  }
}

/**
 * Get modal action metrics
 * 
 * Tracks approval vs rejection rates for different modal types
 * 
 * @param supabaseUrl - Supabase project URL
 * @param supabaseKey - Supabase anon key
 * @returns Modal action metrics
 */
export async function getModalActionMetrics(
  supabaseUrl: string,
  supabaseKey: string
): Promise<ModalActionMetric[]> {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Query approvals_history for modal actions
    const { data: actions } = await supabase
      .from('approvals_history')
      .select('approval_type, action, created_at')
      .order('created_at', { ascending: false });

    if (!actions || actions.length === 0) {
      return [];
    }

    const modalStats: Record<string, { approvals: number; rejections: number; times: number[] }> = {};
    
    for (const action of actions) {
      const modalType = action.approval_type;
      
      if (!modalStats[modalType]) {
        modalStats[modalType] = {
          approvals: 0,
          rejections: 0,
          times: [],
        };
      }
      
      if (action.action === 'approved') {
        modalStats[modalType].approvals++;
      } else if (action.action === 'rejected') {
        modalStats[modalType].rejections++;
      }
      
      // TODO: Calculate time to action from approval created_at to action created_at
      // For now, use placeholder
      modalStats[modalType].times.push(5000); // 5 seconds placeholder
    }

    return Object.entries(modalStats).map(([modalType, stats]) => {
      const total = stats.approvals + stats.rejections;
      const avgTime = stats.times.length > 0
        ? stats.times.reduce((sum, t) => sum + t, 0) / stats.times.length
        : 0;
      
      return {
        modalType,
        approvals: stats.approvals,
        rejections: stats.rejections,
        approvalRate: total > 0 ? stats.approvals / total : 0,
        avgTimeToAction: avgTime,
      };
    });
  } catch (err) {
    console.error('Error fetching modal action metrics:', err);
    return [];
  }
}

/**
 * Track settings change
 * 
 * Logs when users change settings (for analytics, not enforcement)
 * 
 * @param change - Settings change event
 * @param supabaseUrl - Supabase project URL
 * @param supabaseKey - Supabase anon key
 */
export async function trackSettingsChange(
  change: SettingsChange,
  supabaseUrl: string,
  supabaseKey: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    const { error } = await supabase
      .from('settings_changes_log')
      .insert({
        user_id: change.userId,
        setting_key: change.settingKey,
        old_value: change.oldValue,
        new_value: change.newValue,
        changed_at: change.changedAt.toISOString(),
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error tracking settings change:', err);
    return { success: false, error: message };
  }
}

/**
 * Get product metrics summary
 * 
 * Aggregates all product analytics metrics
 * 
 * @param supabaseUrl - Supabase project URL
 * @param supabaseKey - Supabase anon key
 * @returns Product metrics summary
 */
export async function getProductMetrics(
  supabaseUrl: string,
  supabaseKey: string
): Promise<ProductMetrics> {
  const [featureAdoption, tileEngagement, modalActions] = await Promise.all([
    getFeatureAdoption(supabaseUrl, supabaseKey),
    getTileEngagement(supabaseUrl, supabaseKey),
    getModalActionMetrics(supabaseUrl, supabaseKey),
  ]);

  // Count active experiments
  const supabase = createClient(supabaseUrl, supabaseKey);
  let activeExperiments = 0;
  
  try {
    const { data } = await supabase
      .from('experiment_assignments')
      .select('experiment_id', { count: 'exact', head: true });
    
    activeExperiments = data ? new Set(data.map(e => e.experiment_id)).size : 0;
  } catch {
    // Gracefully handle if table doesn't exist yet
    activeExperiments = 0;
  }

  return {
    featureAdoption,
    tileEngagement,
    modalActions,
    activeExperiments,
  };
}

/**
 * Format feature name for display
 */
function formatFeatureName(featureKey: string): string {
  return featureKey
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get feature adoption insights
 * 
 * Generates actionable insights from feature adoption data
 * 
 * @param adoption - Feature adoption metrics
 * @returns Insights array
 */
export function generateAdoptionInsights(adoption: FeatureAdoption[]): string[] {
  const insights: string[] = [];
  
  // Sort by adoption rate
  const sorted = [...adoption].sort((a, b) => b.adoptionRate - a.adoptionRate);
  
  if (sorted.length > 0) {
    const mostUsed = sorted[0];
    insights.push(`Most adopted feature: ${mostUsed.featureName} (${(mostUsed.adoptionRate * 100).toFixed(1)}% of users)`);
    
    const leastUsed = sorted[sorted.length - 1];
    if (leastUsed.adoptionRate < 0.2) {
      insights.push(`Low adoption alert: ${leastUsed.featureName} used by only ${(leastUsed.adoptionRate * 100).toFixed(1)}% of users`);
    }
  }
  
  // Check for recent features
  const recentFeatures = adoption.filter(f => {
    if (!f.firstUsedAt) return false;
    const daysSinceFirstUse = (Date.now() - f.firstUsedAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceFirstUse < 7;
  });
  
  if (recentFeatures.length > 0) {
    insights.push(`${recentFeatures.length} new feature(s) added in the last 7 days`);
  }
  
  return insights;
}


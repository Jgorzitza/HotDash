/**
 * A/B Testing Infrastructure
 * 
 * Framework for running A/B experiments with variant assignment, metrics tracking,
 * and statistical significance calculation.
 * 
 * @module app/services/experiments/ab-testing
 * @see docs/directions/product.md PRODUCT-002
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Experiment status
 */
export type ExperimentStatus = 'draft' | 'running' | 'paused' | 'completed';

/**
 * Variant configuration
 */
export interface Variant {
  id: string;
  name: string;
  weight: number; // 0-1, must sum to 1 across all variants
  description?: string;
}

/**
 * Metric to track for the experiment
 */
export interface Metric {
  key: string;
  name: string;
  type: 'conversion' | 'numeric' | 'duration';
  unit?: string; // e.g., 'ms', '%', 'count'
}

/**
 * Experiment definition
 */
export interface Experiment {
  id: string;
  name: string;
  description: string;
  hypothesis: string;
  variants: Variant[];
  metrics: Metric[];
  status: ExperimentStatus;
  startDate?: Date;
  endDate?: Date;
  targetSampleSize?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User assignment to experiment variant
 */
export interface VariantAssignment {
  userId: string;
  experimentId: string;
  variantId: string;
  assignedAt: Date;
}

/**
 * Metric event for tracking
 */
export interface MetricEvent {
  userId: string;
  experimentId: string;
  variantId: string;
  metricKey: string;
  value: number | boolean;
  timestamp: Date;
}

/**
 * Statistical test result
 */
export interface SignificanceTest {
  pValue: number;
  significant: boolean; // p < 0.05
  confidenceLevel: number; // 0-1
  effect: string; // 'positive', 'negative', 'none'
}

/**
 * Experiment results summary
 */
export interface ExperimentResults {
  experimentId: string;
  variants: {
    variantId: string;
    sampleSize: number;
    metrics: Record<string, number>; // metricKey -> average value
  }[];
  significance: Record<string, SignificanceTest>; // metricKey -> test result
  winner?: string; // variantId of winning variant
}

/**
 * Example experiments for HotDash
 */
export const EXAMPLE_EXPERIMENTS: Experiment[] = [
  {
    id: 'approval_cta_test',
    name: 'Approval Button Text Test',
    description: 'Test different CTA text for approval actions',
    hypothesis: 'More explicit action text ("Approve & Send") will increase approval rate',
    variants: [
      { id: 'control', name: 'Approve', weight: 0.5, description: 'Current default text' },
      { id: 'variant', name: 'Approve & Send', weight: 0.5, description: 'More explicit action' },
    ],
    metrics: [
      { key: 'click_rate', name: 'Click Rate', type: 'conversion', unit: '%' },
      { key: 'time_to_approve', name: 'Time to Approve', type: 'duration', unit: 'ms' },
    ],
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

/**
 * Hash function for consistent variant assignment
 * Uses simple hash of userId + experimentId to ensure consistency
 * 
 * @param userId - User identifier
 * @param experimentId - Experiment identifier
 * @returns Hash value 0-1
 */
function hashUserExperiment(userId: string, experimentId: string): number {
  const str = `${userId}:${experimentId}`;
  let hash = 0;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Normalize to 0-1
  return Math.abs(hash) / 2147483647;
}

/**
 * Assign user to a variant based on experiment weights
 * Uses consistent hashing to ensure same user always gets same variant
 * 
 * @param userId - User identifier
 * @param experiment - Experiment definition
 * @returns Assigned variant ID
 */
export function assignVariant(userId: string, experiment: Experiment): string {
  // Validate weights sum to 1
  const totalWeight = experiment.variants.reduce((sum, v) => sum + v.weight, 0);
  if (Math.abs(totalWeight - 1.0) > 0.001) {
    console.warn(`Experiment ${experiment.id} weights don't sum to 1 (${totalWeight})`);
  }

  const hash = hashUserExperiment(userId, experiment.id);
  
  // Find variant based on cumulative weight
  let cumulative = 0;
  for (const variant of experiment.variants) {
    cumulative += variant.weight;
    if (hash < cumulative) {
      return variant.id;
    }
  }
  
  // Fallback to last variant (should never happen with valid weights)
  return experiment.variants[experiment.variants.length - 1].id;
}

/**
 * Get or create user's variant assignment for an experiment
 * 
 * @param userId - User identifier
 * @param experiment - Experiment definition
 * @param supabaseUrl - Supabase project URL
 * @param supabaseKey - Supabase anon key
 * @returns Variant assignment
 */
export async function getUserVariant(
  userId: string,
  experiment: Experiment,
  supabaseUrl: string,
  supabaseKey: string
): Promise<VariantAssignment> {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Check if user already has assignment
    const { data: existing } = await supabase
      .from('experiment_assignments')
      .select('*')
      .eq('user_id', userId)
      .eq('experiment_id', experiment.id)
      .single();

    if (existing) {
      return {
        userId,
        experimentId: experiment.id,
        variantId: existing.variant_id,
        assignedAt: new Date(existing.assigned_at),
      };
    }

    // Create new assignment
    const variantId = assignVariant(userId, experiment);
    
    const { error } = await supabase
      .from('experiment_assignments')
      .insert({
        user_id: userId,
        experiment_id: experiment.id,
        variant_id: variantId,
        assigned_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error creating variant assignment:', error);
      // Return assignment without persisting (graceful degradation)
    }

    return {
      userId,
      experimentId: experiment.id,
      variantId,
      assignedAt: new Date(),
    };
  } catch (err) {
    console.error('Error in getUserVariant:', err);
    
    // Fallback: assign variant without persistence
    return {
      userId,
      experimentId: experiment.id,
      variantId: assignVariant(userId, experiment),
      assignedAt: new Date(),
    };
  }
}

/**
 * Track a metric event for an experiment
 * 
 * @param event - Metric event to track
 * @param supabaseUrl - Supabase project URL
 * @param supabaseKey - Supabase anon key
 */
export async function trackMetric(
  event: MetricEvent,
  supabaseUrl: string,
  supabaseKey: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    const { error } = await supabase
      .from('experiment_metrics')
      .insert({
        user_id: event.userId,
        experiment_id: event.experimentId,
        variant_id: event.variantId,
        metric_key: event.metricKey,
        value: event.value,
        timestamp: event.timestamp.toISOString(),
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error tracking metric:', err);
    return { success: false, error: message };
  }
}

/**
 * Calculate chi-square test for significance
 * 
 * @param observed - Observed values [control, variant]
 * @param expected - Expected values [control, variant]
 * @returns p-value
 */
function chiSquareTest(observed: number[], expected: number[]): number {
  if (observed.length !== expected.length || observed.length !== 2) {
    throw new Error('Chi-square test requires exactly 2 groups');
  }

  let chiSquare = 0;
  for (let i = 0; i < observed.length; i++) {
    if (expected[i] === 0) continue;
    chiSquare += Math.pow(observed[i] - expected[i], 2) / expected[i];
  }

  // For df=1, approximate p-value from chi-square value
  // This is a simplified calculation - production should use proper stats library
  if (chiSquare < 0.004) return 0.95;  // p > 0.05
  if (chiSquare < 1.642) return 0.20;  // p ≈ 0.20
  if (chiSquare < 2.706) return 0.10;  // p ≈ 0.10
  if (chiSquare < 3.841) return 0.07;  // p ≈ 0.07
  if (chiSquare < 5.024) return 0.025; // p ≈ 0.025
  if (chiSquare < 6.635) return 0.01;  // p ≈ 0.01
  return 0.001; // p < 0.001
}

/**
 * Calculate statistical significance for experiment results
 * 
 * @param experimentId - Experiment ID
 * @param supabaseUrl - Supabase project URL
 * @param supabaseKey - Supabase anon key
 * @returns Experiment results with significance tests
 */
export async function calculateSignificance(
  experimentId: string,
  supabaseUrl: string,
  supabaseKey: string
): Promise<ExperimentResults | null> {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Get all metric events for this experiment
    const { data: events } = await supabase
      .from('experiment_metrics')
      .select('*')
      .eq('experiment_id', experimentId);

    if (!events || events.length === 0) {
      return null;
    }

    // Group by variant
    const variantData: Record<string, { events: typeof events; metrics: Record<string, number[]> }> = {};
    
    for (const event of events) {
      const variantId = event.variant_id;
      
      if (!variantData[variantId]) {
        variantData[variantId] = {
          events: [],
          metrics: {},
        };
      }
      
      variantData[variantId].events.push(event);
      
      if (!variantData[variantId].metrics[event.metric_key]) {
        variantData[variantId].metrics[event.metric_key] = [];
      }
      
      variantData[variantId].metrics[event.metric_key].push(Number(event.value));
    }

    // Calculate averages and significance
    const variants = Object.entries(variantData).map(([variantId, data]) => {
      const metrics: Record<string, number> = {};
      
      for (const [metricKey, values] of Object.entries(data.metrics)) {
        metrics[metricKey] = values.reduce((sum, v) => sum + v, 0) / values.length;
      }
      
      return {
        variantId,
        sampleSize: data.events.length,
        metrics,
      };
    });

    // Simple significance test (control vs first variant)
    const significance: Record<string, SignificanceTest> = {};
    
    if (variants.length === 2) {
      const control = variants[0];
      const variant = variants[1];
      
      for (const metricKey of Object.keys(control.metrics)) {
        if (!variant.metrics[metricKey]) continue;
        
        const controlValue = control.metrics[metricKey];
        const variantValue = variant.metrics[metricKey];
        
        // Calculate p-value (simplified - use proper stats in production)
        const pValue = chiSquareTest(
          [control.sampleSize, variant.sampleSize],
          [control.sampleSize / 2, variant.sampleSize / 2]
        );
        
        significance[metricKey] = {
          pValue,
          significant: pValue < 0.05,
          confidenceLevel: 1 - pValue,
          effect: variantValue > controlValue ? 'positive' : variantValue < controlValue ? 'negative' : 'none',
        };
      }
    }

    return {
      experimentId,
      variants,
      significance,
      winner: undefined, // TODO: Determine winner based on significance
    };
  } catch (err) {
    console.error('Error calculating significance:', err);
    return null;
  }
}

/**
 * Get all experiments
 */
export function getAllExperiments(): Experiment[] {
  return EXAMPLE_EXPERIMENTS;
}

/**
 * Get experiment by ID
 */
export function getExperiment(experimentId: string): Experiment | undefined {
  return EXAMPLE_EXPERIMENTS.find(exp => exp.id === experimentId);
}


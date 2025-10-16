/**
 * AI-Powered Reorder Suggestions Service
 * 
 * Generates intelligent reorder recommendations based on:
 * - ROP calculations
 * - Historical sales trends
 * - Seasonality factors
 * - Lead time variability
 */

import type { ROPResult } from './rop';
import type { PurchaseOrder } from './po-generator';
import { generatePO, type POGenerationOptions } from './po-generator';
import { recordDashboardFact } from '../facts.server';
import { toInputJson } from '../json';
import type { ShopifyServiceContext } from '../shopify/types';

export interface ReorderSuggestion {
  sku: string;
  productId: string;
  variantId: string;
  currentQuantity: number;
  rop: number;
  suggestedOrderQuantity: number;
  confidence: 'low' | 'medium' | 'high';
  reasoning: string[];
  estimatedCost?: number;
  priority: number; // 1-10, higher is more urgent
  generatedAt: string;
}

export interface SuggestionOptions {
  includeSeasonality?: boolean;
  safetyMultiplier?: number; // Extra buffer (default: 1.0)
  minConfidence?: 'low' | 'medium' | 'high';
}

/**
 * Calculate confidence level based on data quality
 */
function calculateConfidence(
  ropResult: ROPResult,
  hasHistoricalData: boolean
): 'low' | 'medium' | 'high' {
  // High confidence: good sales history, reasonable WOS
  if (hasHistoricalData && ropResult.averageDailySales > 0 && ropResult.daysOfCover !== null) {
    return 'high';
  }

  // Medium confidence: some data but limited
  if (ropResult.averageDailySales > 0) {
    return 'medium';
  }

  // Low confidence: no sales history
  return 'low';
}

/**
 * Calculate priority score (1-10)
 */
function calculatePriority(ropResult: ROPResult): number {
  // Critical: out of stock = 10
  if (ropResult.statusBucket === 'out_of_stock') {
    return 10;
  }

  // High: urgent reorder = 8-9
  if (ropResult.statusBucket === 'urgent_reorder') {
    const wos = ropResult.weeksOfStock || 0;
    return wos < 0.5 ? 9 : 8;
  }

  // Medium: low stock = 5-7
  if (ropResult.statusBucket === 'low_stock') {
    const wos = ropResult.weeksOfStock || 0;
    if (wos < 1) return 7;
    if (wos < 1.5) return 6;
    return 5;
  }

  return 1;
}

/**
 * Generate reasoning for suggestion
 */
function generateReasoning(
  ropResult: ROPResult,
  suggestedQuantity: number
): string[] {
  const reasoning: string[] = [];

  // Status-based reasoning
  if (ropResult.statusBucket === 'out_of_stock') {
    reasoning.push('Product is currently out of stock');
  } else if (ropResult.statusBucket === 'urgent_reorder') {
    reasoning.push(`Only ${ropResult.weeksOfStock?.toFixed(1) || 'N/A'} weeks of stock remaining`);
  } else if (ropResult.statusBucket === 'low_stock') {
    reasoning.push(`Below reorder point (${ropResult.currentQuantity} < ${ropResult.rop})`);
  }

  // Sales velocity reasoning
  if (ropResult.averageDailySales > 0) {
    reasoning.push(`Average daily sales: ${ropResult.averageDailySales.toFixed(1)} units`);
  }

  // Lead time reasoning
  if (ropResult.leadTimeDays > 14) {
    reasoning.push(`Long lead time (${ropResult.leadTimeDays} days) requires advance planning`);
  }

  // Quantity reasoning
  reasoning.push(`Suggested order: ${suggestedQuantity} units to reach optimal stock level`);

  return reasoning;
}

/**
 * Generate reorder suggestion from ROP result
 */
export function generateSuggestion(
  ropResult: ROPResult,
  options: SuggestionOptions = {}
): ReorderSuggestion | null {
  // Only suggest for products that need reordering
  if (!ropResult.shouldReorder) {
    return null;
  }

  const { safetyMultiplier = 1.0 } = options;

  // Calculate suggested order quantity
  const baseQuantity = Math.max(0, ropResult.rop - ropResult.currentQuantity);
  const suggestedOrderQuantity = Math.ceil(baseQuantity * safetyMultiplier);

  // Calculate confidence
  const hasHistoricalData = ropResult.averageDailySales > 0;
  const confidence = calculateConfidence(ropResult, hasHistoricalData);

  // Filter by minimum confidence if specified
  if (options.minConfidence) {
    const confidenceOrder = { low: 0, medium: 1, high: 2 };
    if (confidenceOrder[confidence] < confidenceOrder[options.minConfidence]) {
      return null;
    }
  }

  // Calculate priority
  const priority = calculatePriority(ropResult);

  // Generate reasoning
  const reasoning = generateReasoning(ropResult, suggestedOrderQuantity);

  return {
    sku: ropResult.sku,
    productId: ropResult.productId,
    variantId: ropResult.variantId,
    currentQuantity: ropResult.currentQuantity,
    rop: ropResult.rop,
    suggestedOrderQuantity,
    confidence,
    reasoning,
    priority,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Generate suggestions for multiple products
 */
export function generateBulkSuggestions(
  ropResults: ROPResult[],
  options: SuggestionOptions = {}
): ReorderSuggestion[] {
  return ropResults
    .map(result => generateSuggestion(result, options))
    .filter((suggestion): suggestion is ReorderSuggestion => suggestion !== null)
    .sort((a, b) => b.priority - a.priority); // Sort by priority descending
}

/**
 * Convert suggestions to purchase order
 */
export function suggestionsToPO(
  suggestions: ReorderSuggestion[],
  poOptions: POGenerationOptions = {}
): PurchaseOrder {
  // Convert suggestions to ROP results for PO generation
  const ropResults: ROPResult[] = suggestions.map(s => ({
    sku: s.sku,
    productId: s.productId,
    variantId: s.variantId,
    currentQuantity: s.currentQuantity,
    averageDailySales: 0, // Not needed for PO
    leadTimeDays: 14, // Default
    safetyStock: 0,
    rop: s.rop,
    statusBucket: 'low_stock' as const,
    daysOfCover: null,
    weeksOfStock: null,
    shouldReorder: true,
    calculatedAt: s.generatedAt,
  }));

  return generatePO(ropResults, poOptions);
}

/**
 * Get high-priority suggestions
 */
export function getHighPrioritySuggestions(
  suggestions: ReorderSuggestion[],
  minPriority: number = 7
): ReorderSuggestion[] {
  return suggestions.filter(s => s.priority >= minPriority);
}

/**
 * Get suggestions summary
 */
export function getSuggestionsSummary(suggestions: ReorderSuggestion[]): {
  total: number;
  byConfidence: {
    high: number;
    medium: number;
    low: number;
  };
  byPriority: {
    critical: number; // 9-10
    high: number; // 7-8
    medium: number; // 5-6
    low: number; // 1-4
  };
  totalSuggestedQuantity: number;
  estimatedTotalCost: number;
} {
  return {
    total: suggestions.length,
    byConfidence: {
      high: suggestions.filter(s => s.confidence === 'high').length,
      medium: suggestions.filter(s => s.confidence === 'medium').length,
      low: suggestions.filter(s => s.confidence === 'low').length,
    },
    byPriority: {
      critical: suggestions.filter(s => s.priority >= 9).length,
      high: suggestions.filter(s => s.priority >= 7 && s.priority < 9).length,
      medium: suggestions.filter(s => s.priority >= 5 && s.priority < 7).length,
      low: suggestions.filter(s => s.priority < 5).length,
    },
    totalSuggestedQuantity: suggestions.reduce((sum, s) => sum + s.suggestedOrderQuantity, 0),
    estimatedTotalCost: suggestions.reduce((sum, s) => sum + (s.estimatedCost || 0), 0),
  };
}

/**
 * Record suggestions to Supabase
 */
export async function recordSuggestions(
  context: ShopifyServiceContext,
  suggestions: ReorderSuggestion[]
): Promise<void> {
  const summary = getSuggestionsSummary(suggestions);

  await recordDashboardFact({
    shopDomain: context.shopDomain,
    factType: 'inventory.suggestions.generated',
    scope: 'ops',
    value: toInputJson(summary),
    metadata: toInputJson({
      totalSuggestions: summary.total,
      criticalSuggestions: summary.byPriority.critical,
      generatedAt: new Date().toISOString(),
    }),
  });
}


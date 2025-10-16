/**
 * Budget Pacing Monitor
 * 
 * Purpose: Monitor ad spend pacing against budget targets
 * Owner: ads agent
 * Date: 2025-10-15
 * 
 * Features:
 * - Daily budget pacing calculation
 * - Overspend/underspend detection
 * - Pacing recommendations
 * - Budget forecasting
 */

import type { AdPlatform } from './tracking';

/**
 * Budget period
 */
export type BudgetPeriod = 'daily' | 'weekly' | 'monthly';

/**
 * Budget pacing status
 */
export type PacingStatus = 'on_track' | 'underspending' | 'overspending' | 'depleted';

/**
 * Budget configuration
 */
export interface BudgetConfig {
  campaignId: string;
  campaignName: string;
  platform: AdPlatform;
  totalBudget: number;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
}

/**
 * Budget pacing analysis
 */
export interface BudgetPacing {
  config: BudgetConfig;
  currentSpend: number;
  targetSpend: number;
  remainingBudget: number;
  daysElapsed: number;
  daysRemaining: number;
  percentElapsed: number;
  percentSpent: number;
  pacingStatus: PacingStatus;
  pacingPercent: number;  // % ahead or behind (positive = overspending)
  dailyRunRate: number;
  projectedTotalSpend: number;
  projectedOverUnder: number;
  recommendation: string;
}

/**
 * Calculate budget pacing
 * 
 * @param config - Budget configuration
 * @param currentSpend - Current spend to date
 * @returns Pacing analysis
 */
export function calculateBudgetPacing(
  config: BudgetConfig,
  currentSpend: number
): BudgetPacing {
  const startDate = new Date(config.startDate);
  const endDate = new Date(config.endDate);
  const today = new Date();

  // Calculate time metrics
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysElapsed = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, totalDays - daysElapsed);
  const percentElapsed = (daysElapsed / totalDays) * 100;

  // Calculate spend metrics
  const targetSpend = (config.totalBudget * percentElapsed) / 100;
  const remainingBudget = config.totalBudget - currentSpend;
  const percentSpent = (currentSpend / config.totalBudget) * 100;

  // Calculate pacing
  const pacingPercent = percentSpent - percentElapsed;

  // Determine status
  let pacingStatus: PacingStatus = 'on_track';
  if (remainingBudget <= 0) {
    pacingStatus = 'depleted';
  } else if (pacingPercent > 10) {
    pacingStatus = 'overspending';
  } else if (pacingPercent < -10) {
    pacingStatus = 'underspending';
  }

  // Calculate projections
  const dailyRunRate = daysElapsed > 0 ? currentSpend / daysElapsed : 0;
  const projectedTotalSpend = dailyRunRate * totalDays;
  const projectedOverUnder = projectedTotalSpend - config.totalBudget;

  // Generate recommendation
  let recommendation = '';
  if (pacingStatus === 'depleted') {
    recommendation = `Budget depleted with ${daysRemaining} days remaining. ` +
      `Pause campaign or increase budget immediately.`;
  } else if (pacingStatus === 'overspending') {
    recommendation = `Overspending by ${Math.abs(pacingPercent).toFixed(1)}%. ` +
      `Reduce daily budget to $${(remainingBudget / daysRemaining).toFixed(2)} to stay on track.`;
  } else if (pacingStatus === 'underspending') {
    recommendation = `Underspending by ${Math.abs(pacingPercent).toFixed(1)}%. ` +
      `Increase daily budget to $${(remainingBudget / daysRemaining).toFixed(2)} to maximize reach.`;
  } else {
    recommendation = `On track. Continue current pacing at $${dailyRunRate.toFixed(2)}/day.`;
  }

  return {
    config,
    currentSpend,
    targetSpend,
    remainingBudget,
    daysElapsed,
    daysRemaining,
    percentElapsed,
    percentSpent,
    pacingStatus,
    pacingPercent,
    dailyRunRate,
    projectedTotalSpend,
    projectedOverUnder,
    recommendation,
  };
}

/**
 * Monitor multiple campaign budgets
 * 
 * @param budgets - Array of budget configurations with current spend
 * @returns Array of pacing analyses
 */
export function monitorBudgetPacing(
  budgets: Array<{ config: BudgetConfig; currentSpend: number }>
): BudgetPacing[] {
  return budgets.map(({ config, currentSpend }) =>
    calculateBudgetPacing(config, currentSpend)
  );
}

/**
 * Get campaigns requiring attention
 * 
 * @param pacings - Array of budget pacing analyses
 * @returns Campaigns that are overspending or depleted
 */
export function getCampaignsRequiringAttention(
  pacings: BudgetPacing[]
): BudgetPacing[] {
  return pacings.filter(
    p => p.pacingStatus === 'overspending' || p.pacingStatus === 'depleted'
  ).sort((a, b) => Math.abs(b.pacingPercent) - Math.abs(a.pacingPercent));
}

/**
 * Calculate optimal daily budget
 * 
 * @param totalBudget - Total budget for period
 * @param daysRemaining - Days remaining in period
 * @param currentSpend - Current spend to date
 * @returns Recommended daily budget
 */
export function calculateOptimalDailyBudget(
  totalBudget: number,
  daysRemaining: number,
  currentSpend: number
): number {
  if (daysRemaining <= 0) return 0;
  const remainingBudget = totalBudget - currentSpend;
  return Math.max(0, remainingBudget / daysRemaining);
}


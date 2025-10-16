/**
 * Channel Breakdown Analysis
 * 
 * Purpose: Detailed breakdown of performance by channel/platform
 * Owner: ads agent
 * Date: 2025-10-15
 */

import type { AdPlatform, CampaignMetrics } from './tracking';
import { aggregateCampaignPerformance } from './tracking';

export interface ChannelBreakdown {
  platform: AdPlatform;
  campaigns: number;
  adSpend: number;
  revenue: number;
  roas: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cpm: number;
  cpa: number;
  conversionRate: number;
  marketShare: number;
  efficiency: 'high' | 'medium' | 'low';
  recommendation: string;
}

export interface ChannelComparison {
  channels: ChannelBreakdown[];
  topPerformer: ChannelBreakdown;
  worstPerformer: ChannelBreakdown;
  totalSpend: number;
  totalRevenue: number;
  overallRoas: number;
  recommendation: string;
}

export function analyzeChannelBreakdown(campaigns: CampaignMetrics[]): ChannelComparison {
  const aggregated = aggregateCampaignPerformance(campaigns);
  const channels: ChannelBreakdown[] = [];

  for (const [platform, data] of Object.entries(aggregated.byPlatform)) {
    const marketShare = (data.adSpend / aggregated.totalAdSpend) * 100;
    
    let efficiency: 'high' | 'medium' | 'low' = 'medium';
    if (data.roas >= 4.0) {
      efficiency = 'high';
    } else if (data.roas < 2.5) {
      efficiency = 'low';
    }

    let recommendation = '';
    if (efficiency === 'high') {
      recommendation = `${platform} is highly efficient (${data.roas.toFixed(2)}x ROAS). Consider increasing budget by 25-50%.`;
    } else if (efficiency === 'low') {
      recommendation = `${platform} is underperforming (${data.roas.toFixed(2)}x ROAS). Optimize or reduce budget by 25%.`;
    } else {
      recommendation = `${platform} is performing adequately (${data.roas.toFixed(2)}x ROAS). Maintain current budget and optimize.`;
    }

    channels.push({
      platform: platform as AdPlatform,
      campaigns: data.campaigns,
      adSpend: data.adSpend,
      revenue: data.revenue,
      roas: data.roas,
      impressions: 0, // Would need to aggregate from campaigns
      clicks: 0,
      conversions: 0,
      ctr: data.ctr,
      cpc: data.cpc,
      cpm: data.cpm,
      cpa: data.cpa,
      conversionRate: data.conversionRate,
      marketShare,
      efficiency,
      recommendation,
    });
  }

  const sortedChannels = [...channels].sort((a, b) => b.roas - a.roas);
  const topPerformer = sortedChannels[0];
  const worstPerformer = sortedChannels[sortedChannels.length - 1];

  const overallRecommendation = `Top channel: ${topPerformer.platform} (${topPerformer.roas.toFixed(2)}x ROAS, ${topPerformer.marketShare.toFixed(1)}% share). ` +
    `Consider reallocating ${Math.min(10, worstPerformer.marketShare / 2).toFixed(0)}% from ${worstPerformer.platform} to ${topPerformer.platform}.`;

  return {
    channels: sortedChannels,
    topPerformer,
    worstPerformer,
    totalSpend: aggregated.totalAdSpend,
    totalRevenue: aggregated.totalRevenue,
    overallRoas: aggregated.aggregatedRoas,
    recommendation: overallRecommendation,
  };
}

export function compareChannels(
  channelA: ChannelBreakdown,
  channelB: ChannelBreakdown
): {
  winner: AdPlatform;
  roasDiff: number;
  cpaDiff: number;
  recommendation: string;
} {
  const roasDiff = ((channelA.roas - channelB.roas) / channelB.roas) * 100;
  const cpaDiff = ((channelA.cpa - channelB.cpa) / channelB.cpa) * 100;

  const winner = channelA.roas > channelB.roas ? channelA.platform : channelB.platform;

  const recommendation = `${winner} outperforms with ${Math.abs(roasDiff).toFixed(1)}% better ROAS. ` +
    `Shift ${Math.min(15, Math.abs(roasDiff) / 2).toFixed(0)}% of budget to ${winner}.`;

  return { winner, roasDiff, cpaDiff, recommendation };
}

export function recommendChannelMix(channels: ChannelBreakdown[], totalBudget: number): {
  platform: AdPlatform;
  currentBudget: number;
  recommendedBudget: number;
  change: number;
  changePercent: number;
}[] {
  const totalRoasWeight = channels.reduce((sum, c) => sum + c.roas, 0);

  return channels.map(channel => {
    const roasWeight = channel.roas / totalRoasWeight;
    const recommendedBudget = totalBudget * roasWeight;
    const change = recommendedBudget - channel.adSpend;
    const changePercent = (change / channel.adSpend) * 100;

    return {
      platform: channel.platform,
      currentBudget: channel.adSpend,
      recommendedBudget,
      change,
      changePercent,
    };
  });
}


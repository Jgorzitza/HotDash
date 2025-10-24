/**
 * Production Launch Metrics Service
 * 
 * Provides functions for calculating and tracking production launch metrics
 * including adoption, satisfaction, feature usage, and business impact.
 * 
 * @see docs/metrics/production-launch-metrics.md
 */

import prisma from "~/db.server";
import { getGaConfig } from "~/config/ga.server";

// ============================================================================
// Type Definitions
// ============================================================================

export interface DAUMAUMetric {
  date: string;
  dau: number;
  mau: number;
  ratio: number;
  trend: 'up' | 'down' | 'stable';
}

export interface SignupMetric {
  period: string;
  signups: number;
  target: number;
  percentOfTarget: number;
  trend: 'up' | 'down' | 'stable';
}

export interface ActivationMetric {
  cohort: string;
  totalUsers: number;
  activatedUsers: number;
  activationRate: number;
  milestoneCompletion: {
    profileSetup: number;
    firstIntegration: number;
    viewDashboard: number;
    firstApproval: number;
    firstWorkflow: number;
  };
}

export interface TTFVMetric {
  median: number;
  p50: number;
  p75: number;
  p90: number;
  p99: number;
  distribution: {
    under15min: number;
    under30min: number;
    under60min: number;
    over60min: number;
  };
}

export interface FeatureAdoptionMetric {
  feature: string;
  week: number;
  adoptionRate: number;
  activeUsers: number;
  totalUsers: number;
  trend: 'accelerating' | 'steady' | 'slowing';
}

export interface NPSMetric {
  period: string;
  totalResponses: number;
  promoters: number;
  passives: number;
  detractors: number;
  npsScore: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface CSATMetric {
  interactionType: string;
  period: string;
  totalRatings: number;
  averageRating: number;
  satisfactionRate: number;
  distribution: {
    rating5: number;
    rating4: number;
    rating3: number;
    rating2: number;
    rating1: number;
  };
}

export interface LaunchMetrics {
  adoption: {
    dauMau: DAUMAUMetric;
    signups: SignupMetric;
    activation: ActivationMetric;
    ttfv: TTFVMetric;
    featureAdoption: FeatureAdoptionMetric[];
  };
  satisfaction: {
    nps: NPSMetric;
    csat: CSATMetric[];
    sentiment: {
      positive: number;
      neutral: number;
      negative: number;
      averageSentiment: number;
    };
  };
  usage: {
    engagement: any[];
    retention: any[];
    powerUsers: any;
  };
  businessImpact: {
    revenue: any;
    costSavings: any;
    timeSavings: any;
    roi: any;
  };
}

// ============================================================================
// Adoption Metrics
// ============================================================================

/**
 * Calculate DAU/MAU ratio
 */
export async function getDAUMAUMetric(): Promise<DAUMAUMetric> {
  // TODO: Implement with GA4 API
  // For now, return mock data
  const today = new Date().toISOString().split('T')[0];
  
  return {
    date: today,
    dau: 42,
    mau: 100,
    ratio: 42,
    trend: 'up'
  };
}

/**
 * Get new user signups for a period
 */
export async function getSignupMetric(
  period: 'daily' | 'weekly' | 'monthly' = 'weekly'
): Promise<SignupMetric> {
  const now = new Date();
  let startDate: Date;
  let target: number;
  
  switch (period) {
    case 'daily':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      target = 2;
      break;
    case 'weekly':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      target = 10;
      break;
    case 'monthly':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      target = 40;
      break;
  }
  
  // Query Supabase auth.users table
  // For now, return mock data
  const signups = 15;
  
  return {
    period,
    signups,
    target,
    percentOfTarget: (signups / target) * 100,
    trend: signups > target ? 'up' : 'down'
  };
}

/**
 * Calculate activation rate for a cohort
 */
export async function getActivationMetric(cohort: string): Promise<ActivationMetric> {
  // TODO: Implement with user_milestones table
  // For now, return mock data
  
  return {
    cohort,
    totalUsers: 100,
    activatedUsers: 65,
    activationRate: 65,
    milestoneCompletion: {
      profileSetup: 85,
      firstIntegration: 75,
      viewDashboard: 70,
      firstApproval: 65,
      firstWorkflow: 60
    }
  };
}

/**
 * Calculate Time to First Value
 */
export async function getTTFVMetric(): Promise<TTFVMetric> {
  // TODO: Implement with GA4 events + decision_log
  // For now, return mock data
  
  return {
    median: 25,
    p50: 25,
    p75: 40,
    p90: 55,
    p99: 90,
    distribution: {
      under15min: 35,
      under30min: 60,
      under60min: 85,
      over60min: 15
    }
  };
}

/**
 * Get feature adoption curve
 */
export async function getFeatureAdoptionCurve(): Promise<FeatureAdoptionMetric[]> {
  // TODO: Implement with GA4 events
  // For now, return mock data
  
  const features = [
    { name: 'Dashboard', target: 100 },
    { name: 'Approval Queue', target: 80 },
    { name: 'Action Queue', target: 70 },
    { name: 'CX Agent', target: 60 },
    { name: 'Inventory', target: 50 },
    { name: 'Growth Engine', target: 40 }
  ];
  
  return features.map(feature => ({
    feature: feature.name,
    week: 4,
    adoptionRate: feature.target - 10 + Math.random() * 20,
    activeUsers: 80,
    totalUsers: 100,
    trend: 'steady' as const
  }));
}

// ============================================================================
// Satisfaction Metrics
// ============================================================================

/**
 * Calculate NPS score
 */
export async function getNPSMetric(period: string = 'current'): Promise<NPSMetric> {
  // TODO: Implement with user_feedback table
  // For now, return mock data
  
  const promoters = 60;
  const passives = 32;
  const detractors = 8;
  const total = promoters + passives + detractors;
  
  return {
    period,
    totalResponses: total,
    promoters,
    passives,
    detractors,
    npsScore: ((promoters - detractors) / total) * 100,
    trend: 'improving'
  };
}

/**
 * Get CSAT metrics by interaction type
 */
export async function getCSATMetrics(): Promise<CSATMetric[]> {
  // TODO: Implement with interaction_ratings table
  // For now, return mock data
  
  const interactionTypes = [
    'Approval Workflow',
    'CX Agent Interaction',
    'Support Ticket',
    'Feature Usage'
  ];
  
  return interactionTypes.map(type => ({
    interactionType: type,
    period: 'last_30_days',
    totalRatings: 50,
    averageRating: 4.2 + Math.random() * 0.6,
    satisfactionRate: 85 + Math.random() * 10,
    distribution: {
      rating5: 30,
      rating4: 15,
      rating3: 3,
      rating2: 1,
      rating1: 1
    }
  }));
}

/**
 * Get sentiment analysis
 */
export async function getSentimentMetric() {
  // TODO: Implement with sentiment analysis on feedback
  // For now, return mock data
  
  return {
    positive: 70,
    neutral: 20,
    negative: 10,
    averageSentiment: 0.75,
    trend: 'improving' as const
  };
}

// ============================================================================
// Consolidated Metrics
// ============================================================================

/**
 * Get all launch metrics
 */
export async function getLaunchMetrics(): Promise<LaunchMetrics> {
  const [
    dauMau,
    signups,
    activation,
    ttfv,
    featureAdoption,
    nps,
    csat,
    sentiment
  ] = await Promise.all([
    getDAUMAUMetric(),
    getSignupMetric('weekly'),
    getActivationMetric('week_1'),
    getTTFVMetric(),
    getFeatureAdoptionCurve(),
    getNPSMetric(),
    getCSATMetrics(),
    getSentimentMetric()
  ]);
  
  return {
    adoption: {
      dauMau,
      signups,
      activation,
      ttfv,
      featureAdoption
    },
    satisfaction: {
      nps,
      csat,
      sentiment
    },
    usage: {
      engagement: [],
      retention: [],
      powerUsers: {}
    },
    businessImpact: {
      revenue: {},
      costSavings: {},
      timeSavings: {},
      roi: {}
    }
  };
}


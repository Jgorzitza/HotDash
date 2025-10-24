/**
 * AI Customer Service Satisfaction Tracking System
 * 
 * Implements customer satisfaction tracking, feedback collection,
 * and satisfaction analytics for the AI customer service system.
 * 
 * @module app/services/ai-customer/satisfaction-tracking.service
 */

import { createClient } from '@supabase/supabase-js';
import { logDecision } from '../decisions.server.js';

export interface CustomerFeedback {
  id: string;
  inquiryId: string;
  responseId: string;
  customerId: string;
  rating: number; // 1-5 scale
  category: 'response_quality' | 'response_time' | 'resolution_effectiveness' | 'overall_satisfaction';
  comment?: string;
  tags?: string[];
  followUpRequired: boolean;
  sentiment: 'positive' | 'neutral' | 'negative';
  createdAt: string;
}

export interface SatisfactionMetrics {
  overallSatisfaction: number;
  averageRating: number;
  responseQuality: number;
  responseTime: number;
  resolutionEffectiveness: number;
  totalResponses: number;
  satisfiedCustomers: number;
  neutralCustomers: number;
  unsatisfiedCustomers: number;
  trendDirection: 'improving' | 'stable' | 'declining';
  periodComparison: {
    current: number;
    previous: number;
    change: number;
  };
}

export interface SatisfactionAlert {
  id: string;
  type: 'low_satisfaction' | 'negative_trend' | 'critical_feedback';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metrics: Record<string, any>;
  createdAt: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface SatisfactionReport {
  period: string;
  metrics: SatisfactionMetrics;
  topIssues: Array<{
    issue: string;
    frequency: number;
    impact: number;
  }>;
  improvementRecommendations: string[];
  alerts: SatisfactionAlert[];
}

export class SatisfactionTrackingService {
  private supabase: ReturnType<typeof createClient>;
  private satisfactionThresholds = {
    excellent: 4.5,
    good: 3.5,
    average: 2.5,
    poor: 1.5,
  };

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
  }

  /**
   * Record customer feedback for a response
   */
  async recordFeedback(
    inquiryId: string,
    responseId: string,
    customerId: string,
    feedback: {
      rating: number;
      category: CustomerFeedback['category'];
      comment?: string;
      tags?: string[];
    }
  ): Promise<CustomerFeedback> {
    try {
      // Analyze sentiment from comment
      const sentiment = await this.analyzeSentiment(feedback.comment || '');
      
      // Determine if follow-up is required
      const followUpRequired = this.requiresFollowUp(feedback.rating, feedback.comment);

      // Create feedback record
      const { data: customerFeedback, error } = await this.supabase
        .from('customer_feedback')
        .insert({
          inquiry_id: inquiryId,
          response_id: responseId,
          customer_id: customerId,
          rating: feedback.rating,
          category: feedback.category,
          comment: feedback.comment,
          tags: feedback.tags || [],
          follow_up_required: followUpRequired,
          sentiment,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to record feedback: ${error.message}`);
      }

      // Check for satisfaction alerts
      await this.checkSatisfactionAlerts(customerFeedback);

      // Log decision
      await logDecision({
        scope: 'build',
        actor: 'ai-customer',
        taskId: 'AI-CUSTOMER-001',
        status: 'in_progress',
        progressPct: 60,
        action: 'feedback_recorded',
        rationale: `Recorded customer feedback with rating ${feedback.rating}/5 for ${feedback.category}`,
        evidenceUrl: `app/services/ai-customer/satisfaction-tracking.service.ts`,
        payload: {
          feedbackId: customerFeedback.id,
          rating: feedback.rating,
          category: feedback.category,
          followUpRequired,
          sentiment,
        },
      });

      return customerFeedback;
    } catch (error) {
      console.error('Error recording feedback:', error);
      throw error;
    }
  }

  /**
   * Send satisfaction survey to customer
   */
  async sendSatisfactionSurvey(inquiryId: string, responseId: string): Promise<void> {
    try {
      // Get inquiry details
      const { data: inquiry, error: inquiryError } = await this.supabase
        .from('customer_inquiries')
        .select('customer_email, customer_name, channel')
        .eq('id', inquiryId)
        .single();

      if (inquiryError || !inquiry) {
        throw new Error('Inquiry not found');
      }

      // Generate survey link
      const surveyLink = this.generateSurveyLink(inquiryId, responseId);
      
      // Send survey based on channel
      switch (inquiry.channel) {
        case 'email':
          await this.sendEmailSurvey(inquiry.customer_email, surveyLink, inquiry.customer_name);
          break;
        case 'chat':
          await this.sendChatSurvey(inquiryId, surveyLink);
          break;
        case 'sms':
          await this.sendSMSSurvey(inquiry.customer_email, surveyLink);
          break;
      }

      // Log survey sent
      await logDecision({
        scope: 'build',
        actor: 'ai-customer',
        taskId: 'AI-CUSTOMER-001',
        status: 'in_progress',
        progressPct: 65,
        action: 'satisfaction_survey_sent',
        rationale: `Sent satisfaction survey to customer via ${inquiry.channel}`,
        evidenceUrl: `app/services/ai-customer/satisfaction-tracking.service.ts`,
        payload: {
          inquiryId,
          responseId,
          channel: inquiry.channel,
          customerEmail: inquiry.customer_email,
        },
      });
    } catch (error) {
      console.error('Error sending satisfaction survey:', error);
      throw error;
    }
  }

  /**
   * Get satisfaction metrics for a period
   */
  async getSatisfactionMetrics(
    startDate: string,
    endDate: string
  ): Promise<SatisfactionMetrics> {
    try {
      const { data: feedback, error } = await this.supabase
        .from('customer_feedback')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (error) {
        throw new Error(`Failed to fetch feedback: ${error.message}`);
      }

      const totalResponses = feedback?.length || 0;
      
      if (totalResponses === 0) {
        return this.getEmptyMetrics();
      }

      // Calculate average ratings
      const averageRating = feedback!.reduce((sum, f) => sum + f.rating, 0) / totalResponses;
      
      // Calculate category-specific metrics
      const responseQuality = this.calculateCategoryMetric(feedback!, 'response_quality');
      const responseTime = this.calculateCategoryMetric(feedback!, 'response_time');
      const resolutionEffectiveness = this.calculateCategoryMetric(feedback!, 'resolution_effectiveness');
      const overallSatisfaction = this.calculateCategoryMetric(feedback!, 'overall_satisfaction');

      // Categorize customers
      const satisfiedCustomers = feedback!.filter(f => f.rating >= 4).length;
      const neutralCustomers = feedback!.filter(f => f.rating === 3).length;
      const unsatisfiedCustomers = feedback!.filter(f => f.rating <= 2).length;

      // Calculate trend (compare with previous period)
      const previousPeriod = await this.getPreviousPeriodMetrics(startDate, endDate);
      const trendDirection = this.calculateTrendDirection(averageRating, previousPeriod.averageRating);

      return {
        overallSatisfaction,
        averageRating,
        responseQuality,
        responseTime,
        resolutionEffectiveness,
        totalResponses,
        satisfiedCustomers,
        neutralCustomers,
        unsatisfiedCustomers,
        trendDirection,
        periodComparison: {
          current: averageRating,
          previous: previousPeriod.averageRating,
          change: averageRating - previousPeriod.averageRating,
        },
      };
    } catch (error) {
      console.error('Error calculating satisfaction metrics:', error);
      throw error;
    }
  }

  /**
   * Generate satisfaction report
   */
  async generateSatisfactionReport(
    startDate: string,
    endDate: string
  ): Promise<SatisfactionReport> {
    try {
      const metrics = await this.getSatisfactionMetrics(startDate, endDate);
      const topIssues = await this.identifyTopIssues(startDate, endDate);
      const recommendations = await this.generateRecommendations(metrics, topIssues);
      const alerts = await this.getSatisfactionAlerts(startDate, endDate);

      return {
        period: `${startDate} to ${endDate}`,
        metrics,
        topIssues,
        improvementRecommendations: recommendations,
        alerts,
      };
    } catch (error) {
      console.error('Error generating satisfaction report:', error);
      throw error;
    }
  }

  /**
   * Analyze sentiment from customer comment
   */
  private async analyzeSentiment(comment: string): Promise<'positive' | 'neutral' | 'negative'> {
    if (!comment) return 'neutral';

    // Simple sentiment analysis based on keywords
    const positiveKeywords = ['great', 'excellent', 'good', 'helpful', 'thank', 'satisfied', 'happy'];
    const negativeKeywords = ['terrible', 'awful', 'bad', 'horrible', 'disappointed', 'frustrated', 'angry'];

    const commentLower = comment.toLowerCase();
    
    const positiveCount = positiveKeywords.filter(keyword => commentLower.includes(keyword)).length;
    const negativeCount = negativeKeywords.filter(keyword => commentLower.includes(keyword)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  /**
   * Determine if follow-up is required based on feedback
   */
  private requiresFollowUp(rating: number, comment?: string): boolean {
    // Require follow-up for low ratings
    if (rating <= 2) return true;

    // Require follow-up for negative comments
    if (comment) {
      const negativeKeywords = ['issue', 'problem', 'complaint', 'concern', 'dissatisfied'];
      const hasNegativeKeywords = negativeKeywords.some(keyword =>
        comment.toLowerCase().includes(keyword)
      );
      if (hasNegativeKeywords) return true;
    }

    return false;
  }

  /**
   * Check for satisfaction alerts
   */
  private async checkSatisfactionAlerts(feedback: CustomerFeedback): Promise<void> {
    try {
      // Check for low satisfaction alert
      if (feedback.rating <= 2) {
        await this.createAlert({
          type: 'low_satisfaction',
          severity: feedback.rating === 1 ? 'critical' : 'high',
          message: `Customer rated satisfaction ${feedback.rating}/5 for ${feedback.category}`,
          metrics: { rating: feedback.rating, category: feedback.category },
        });
      }

      // Check for negative sentiment alert
      if (feedback.sentiment === 'negative' && feedback.comment) {
        await this.createAlert({
          type: 'critical_feedback',
          severity: 'medium',
          message: `Negative feedback received: ${feedback.comment.substring(0, 100)}...`,
          metrics: { sentiment: feedback.sentiment, comment: feedback.comment },
        });
      }
    } catch (error) {
      console.error('Error checking satisfaction alerts:', error);
    }
  }

  /**
   * Create satisfaction alert
   */
  private async createAlert(alert: Omit<SatisfactionAlert, 'id' | 'createdAt' | 'acknowledged'>): Promise<void> {
    try {
      await this.supabase
        .from('satisfaction_alerts')
        .insert({
          type: alert.type,
          severity: alert.severity,
          message: alert.message,
          metrics: alert.metrics,
          created_at: new Date().toISOString(),
          acknowledged: false,
        });
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  }

  /**
   * Calculate category-specific metric
   */
  private calculateCategoryMetric(
    feedback: CustomerFeedback[],
    category: CustomerFeedback['category']
  ): number {
    const categoryFeedback = feedback.filter(f => f.category === category);
    if (categoryFeedback.length === 0) return 0;
    
    return categoryFeedback.reduce((sum, f) => sum + f.rating, 0) / categoryFeedback.length;
  }

  /**
   * Get previous period metrics for comparison
   */
  private async getPreviousPeriodMetrics(
    startDate: string,
    endDate: string
  ): Promise<{ averageRating: number }> {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const periodLength = end.getTime() - start.getTime();
      
      const previousStart = new Date(start.getTime() - periodLength);
      const previousEnd = new Date(end.getTime() - periodLength);

      const { data: feedback, error } = await this.supabase
        .from('customer_feedback')
        .select('rating')
        .gte('created_at', previousStart.toISOString())
        .lte('created_at', previousEnd.toISOString());

      if (error || !feedback || feedback.length === 0) {
        return { averageRating: 0 };
      }

      const averageRating = feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length;
      return { averageRating };
    } catch (error) {
      console.error('Error getting previous period metrics:', error);
      return { averageRating: 0 };
    }
  }

  /**
   * Calculate trend direction
   */
  private calculateTrendDirection(current: number, previous: number): 'improving' | 'stable' | 'declining' {
    const change = current - previous;
    if (change > 0.1) return 'improving';
    if (change < -0.1) return 'declining';
    return 'stable';
  }

  /**
   * Identify top issues from feedback
   */
  private async identifyTopIssues(
    startDate: string,
    endDate: string
  ): Promise<Array<{ issue: string; frequency: number; impact: number }>> {
    try {
      const { data: feedback, error } = await this.supabase
        .from('customer_feedback')
        .select('tags, rating, comment')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (error || !feedback) {
        return [];
      }

      // Analyze tags and comments for common issues
      const issueFrequency: Record<string, number> = {};
      const issueImpact: Record<string, number[]> = {};

      feedback.forEach(f => {
        // Count tag-based issues
        f.tags?.forEach(tag => {
          if (!issueFrequency[tag]) issueFrequency[tag] = 0;
          issueFrequency[tag]++;
          
          if (!issueImpact[tag]) issueImpact[tag] = [];
          issueImpact[tag].push(f.rating);
        });

        // Extract issues from comments
        if (f.comment && f.rating <= 3) {
          const issues = this.extractIssuesFromComment(f.comment);
          issues.forEach(issue => {
            if (!issueFrequency[issue]) issueFrequency[issue] = 0;
            issueFrequency[issue]++;
            
            if (!issueImpact[issue]) issueImpact[issue] = [];
            issueImpact[issue].push(f.rating);
          });
        }
      });

      // Calculate impact scores
      const topIssues = Object.keys(issueFrequency).map(issue => ({
        issue,
        frequency: issueFrequency[issue],
        impact: issueImpact[issue].reduce((sum, rating) => sum + (5 - rating), 0) / issueImpact[issue].length,
      }));

      return topIssues.sort((a, b) => (b.frequency * b.impact) - (a.frequency * a.impact)).slice(0, 5);
    } catch (error) {
      console.error('Error identifying top issues:', error);
      return [];
    }
  }

  /**
   * Extract issues from customer comment
   */
  private extractIssuesFromComment(comment: string): string[] {
    const issueKeywords = [
      'slow', 'delayed', 'response time', 'waiting',
      'bcorrect', 'wrong', 'inaccurate', 'error',
      'unhelpful', 'confusing', 'unclear',
      'rude', 'unprofessional', 'poor service',
      'technical', 'bug', 'not working',
      'refund', 'cancel', 'billing', 'charge',
    ];

    const issues: string[] = [];
    const commentLower = comment.toLowerCase();

    issueKeywords.forEach(keyword => {
      if (commentLower.includes(keyword)) {
        issues.push(keyword);
      }
    });

    return issues;
  }

  /**
   * Generate improvement recommendations
   */
  private async generateRecommendations(
    metrics: SatisfactionMetrics,
    topIssues: Array<{ issue: string; frequency: number; impact: number }>
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // Overall satisfaction recommendations
    if (metrics.averageRating < 3.5) {
      recommendations.push('Focus on improving overall customer satisfaction - consider additional training for support agents');
    }

    // Response time recommendations
    if (metrics.responseTime < 3.5) {
      recommendations.push('Improve response time by optimizing ticket routing and agent availability');
    }

    // Response quality recommendations
    if (metrics.responseQuality < 3.5) {
      recommendations.push('Enhance response quality through better templates and agent training');
    }

    // Top issues recommendations
    topIssues.forEach(issue => {
      if (issue.impact > 2 && issue.frequency > 3) {
        recommendations.push(`Address recurring issue: "${issue.issue}" - consider process improvements or additional resources`);
      }
    });

    return recommendations;
  }

  /**
   * Get satisfaction alerts
   */
  private async getSatisfactionAlerts(
    startDate: string,
    endDate: string
  ): Promise<SatisfactionAlert[]> {
    try {
      const { data: alerts, error } = await this.supabase
        .from('satisfaction_alerts')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch alerts: ${error.message}`);
      }

      return (alerts || []).map(alert => ({
        id: alert.id,
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
        metrics: alert.metrics,
        createdAt: alert.created_at,
        acknowledged: alert.acknowledged,
        acknowledgedBy: alert.acknowledged_by,
        acknowledgedAt: alert.acknowledged_at,
      }));
    } catch (error) {
      console.error('Error fetching satisfaction alerts:', error);
      return [];
    }
  }

  /**
   * Generate survey link
   */
  private generateSurveyLink(inquiryId: string, responseId: string): string {
    const baseUrl = process.env.APP_URL || 'https://hotdash.com';
    return `${baseUrl}/survey/satisfaction?inquiry=${inquiryId}&response=${responseId}`;
  }

  /**
   * Send email survey
   */
  private async sendEmailSurvey(email: string, surveyLink: string, customerName?: string): Promise<void> {
    // This would integrate with email service
  }

  /**
   * Send chat survey
   */
  private async sendChatSurvey(inquiryId: string, surveyLink: string): Promise<void> {
    // This would integrate with chat system
  }

  /**
   * Send SMS survey
   */
  private async sendSMSSurvey(phone: string, surveyLink: string): Promise<void> {
    // This would integrate with SMS service
  }

  /**
   * Get empty metrics for periods with no data
   */
  private getEmptyMetrics(): SatisfactionMetrics {
    return {
      overallSatisfaction: 0,
      averageRating: 0,
      responseQuality: 0,
      responseTime: 0,
      resolutionEffectiveness: 0,
      totalResponses: 0,
      satisfiedCustomers: 0,
      neutralCustomers: 0,
      unsatisfiedCustomers: 0,
      trendDirection: 'stable',
      periodComparison: {
        current: 0,
        previous: 0,
        change: 0,
      },
    };
  }
}

/**
 * Default satisfaction tracking service instance
 */
export const satisfactionTrackingService = new SatisfactionTrackingService();

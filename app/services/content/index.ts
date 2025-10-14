/**
 * Content Generation System - Main Entry Point
 * 
 * Automated marketing content generation with CEO approval workflows.
 * 
 * Usage:
 *   import { contentGenerationSystem } from '~/services/content';
 *   
 *   // Generate 50 blog posts from SEO opportunities
 *   await contentGenerationSystem.generateBlogPosts(seoRecommendations, 50);
 *   
 *   // Generate social posts from blog
 *   await contentGenerationSystem.generateSocialFromBlog(blogPost);
 *   
 *   // Generate email campaigns for segments
 *   await contentGenerationSystem.generateEmailCampaigns(segment);
 */

// ============================================================================
// Exports - Generators
// ============================================================================

export { BlogPostGenerator, blogGenerator, publishBlogPostTool, generateBlogPostBatchTool } from './generators/blog-generator.server';
export { SocialMediaGenerator, socialGenerator, publishSocialPostTool, generateSocialFromBlogTool } from './generators/social-generator.server';
export { EmailCampaignGenerator, emailGenerator, sendEmailCampaignTool } from './generators/email-generator.server';

// ============================================================================
// Exports - Publishers
// ============================================================================

export { MultiChannelPublisher, multiChannelPublisher, PublicationQueue, publicationQueue } from './publishers/multi-channel-publisher.server';

// ============================================================================
// Exports - Analytics
// ============================================================================

export { ContentAnalyticsTracker, analyticsTracker, ContentOptimizer, contentOptimizer, ContentAnalyticsDashboard, analyticsDashboard } from './analytics/content-analytics.server';

// ============================================================================
// Exports - Validation & Learning
// ============================================================================

export { BrandVoiceValidator, brandVoiceValidator, CEOApprovalLearner, ceoApprovalLearner, promptGenerator } from './brand-voice-validator.server';

// ============================================================================
// Exports - Schemas & Templates
// ============================================================================

export { ContentSchemas, ContentTemplates, BlogPostSchema, SocialPostSchema, EmailCampaignSchema } from './templates/content-schemas';

// ============================================================================
// Main Content Generation System
// ============================================================================

export class ContentGenerationSystem {
  /**
   * Generate blog posts from SEO recommendations
   * Creates approval Actions for CEO
   */
  async generateBlogPosts(
    recommendations: Array<{ topic: string; keywords: string[]; seoOpportunity: number }>,
    limit: number = 50
  ) {
    const { blogGenerator } = await import('./generators/blog-generator.server');
    return blogGenerator.generateBatch(recommendations, limit);
  }

  /**
   * Generate social posts from blog content
   * Creates approval Actions for CEO
   */
  async generateSocialFromBlog(
    blogPost: any,
    platforms: Array<'twitter' | 'linkedin' | 'instagram'>
  ) {
    const { socialGenerator } = await import('./generators/social-generator.server');
    return socialGenerator.generateFromBlog(blogPost, platforms);
  }

  /**
   * Generate email campaigns for customer segments
   * Creates approval Actions for CEO
   */
  async generateEmailCampaigns(
    segment: any,
    templateType: 'welcome' | 'activation' | 'feature_announcement' | 'upsell'
  ) {
    const { emailGenerator } = await import('./generators/email-generator.server');
    return emailGenerator.generateForSegment(segment, templateType);
  }

  /**
   * Publish CEO-approved content across channels
   */
  async publishApprovedContent(
    contentId: string,
    content: any,
    channels: string[]
  ) {
    const { multiChannelPublisher } = await import('./publishers/multi-channel-publisher.server');
    
    return multiChannelPublisher.publish({
      contentId,
      contentType: 'blog', // TODO: Infer from content
      content,
      channels,
      priority: 'normal',
    });
  }

  /**
   * Track content performance
   */
  async trackPerformance(contentId: string) {
    const { analyticsTracker } = await import('./analytics/content-analytics.server');
    return analyticsTracker.collectMetrics(contentId);
  }

  /**
   * Get optimization recommendations
   */
  async getOptimizations() {
    const { analyticsTracker, contentOptimizer } = await import('./analytics/content-analytics.server');
    
    // Get all content metrics (TODO: paginate for large datasets)
    const allMetrics: any[] = []; // TODO: Fetch from database
    
    return contentOptimizer.generateRecommendations(allMetrics);
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const contentGenerationSystem = new ContentGenerationSystem();

// ============================================================================
// OpenAI Agent Tools (For Integration)
// ============================================================================

export const contentGenerationTools = [
  // From blog-generator
  async () => (await import('./generators/blog-generator.server')).publishBlogPostTool,
  async () => (await import('./generators/blog-generator.server')).generateBlogPostBatchTool,
  
  // From social-generator
  async () => (await import('./generators/social-generator.server')).publishSocialPostTool,
  async () => (await import('./generators/social-generator.server')).generateSocialFromBlogTool,
  
  // From email-generator
  async () => (await import('./generators/email-generator.server')).sendEmailCampaignTool,
];

/**
 * Load all content generation tools for OpenAI Agent
 */
export async function loadContentGenerationTools() {
  const tools = await Promise.all(contentGenerationTools.map(loader => loader()));
  return tools;
}


/**
 * Blog Post Generation Pipeline
 * 
 * Automated blog post creation from SEO data and content recommendations.
 * CEO approval required for all posts (needsApproval: true)
 * 
 * Usage:
 *   const generator = new BlogPostGenerator();
 *   const posts = await generator.generateBatch(recommendations, 50);
 *   // Creates Actions for CEO approval queue
 */

import { tool } from '@openai/agents';
import { z } from 'zod';
import type { BlogPost } from '../templates/content-schemas';
import { BlogPostSchema, BLOG_POST_TEMPLATE } from '../templates/content-schemas';
import { brandVoiceValidator, ceoApprovalLearner, promptGenerator } from '../brand-voice-validator.server';

// ============================================================================
// Types
// ============================================================================

interface ContentRecommendation {
  topic: string;
  keywords: string[];
  seoOpportunity: number; // 0-100 score
  priority: 'high' | 'medium' | 'low';
  sourceData?: {
    gscPosition?: number;
    gscImpressions?: number;
    gscClicks?: number;
  };
}

interface GenerationConfig {
  parallel: number; // How many to generate concurrently
  qualityThreshold: number; // Min quality score to submit for CEO approval
  retryOnLowQuality: boolean;
  maxRetries: number;
}

// ============================================================================
// Blog Post Generator
// ============================================================================

export class BlogPostGenerator {
  private config: GenerationConfig = {
    parallel: 10,
    qualityThreshold: 70,
    retryOnLowQuality: true,
    maxRetries: 2,
  };

  /**
   * Generate blog posts in batch from recommendations
   */
  async generateBatch(
    recommendations: ContentRecommendation[],
    limit: number = 50
  ): Promise<BlogPost[]> {
    const topRecs = recommendations
      .sort((a, b) => b.seoOpportunity - a.seoOpportunity)
      .slice(0, limit);

    // Generate in parallel batches
    const batches = this.chunkArray(topRecs, this.config.parallel);
    const allPosts: BlogPost[] = [];

    for (const batch of batches) {
      const posts = await Promise.all(
        batch.map(rec => this.generateSingle(rec))
      );
      
      allPosts.push(...posts.filter(p => p !== null) as BlogPost[]);
    }

    return allPosts;
  }

  /**
   * Generate a single blog post from recommendation
   */
  async generateSingle(
    recommendation: ContentRecommendation,
    retryCount: number = 0
  ): Promise<BlogPost | null> {
    try {
      // 1. Get context from LlamaIndex MCP (if available)
      const context = await this.getKnowledgeContext(recommendation.topic, recommendation.keywords);
      
      // 2. Generate content using OpenAI
      const systemPrompt = promptGenerator.generatePrompt('blog');
      const draft = await this.generateWithOpenAI(recommendation, context, systemPrompt);
      
      // 3. Validate brand voice
      const voiceCheck = await brandVoiceValidator.validate(draft.content);
      
      if (!voiceCheck.passes) {
        if (this.config.retryOnLowQuality && retryCount < this.config.maxRetries) {
          // Auto-correct and retry
          const { corrected } = await this.autoCorrectBrandVoice(draft.content);
          draft.content = corrected;
          return this.generateSingle(recommendation, retryCount + 1);
        }
      }
      
      // 4. Calculate SEO score
      const seoScore = this.calculateSEOScore(draft, recommendation.keywords);
      
      // 5. Calculate overall quality score
      const qualityScore = this.calculateQualityScore(voiceCheck, seoScore);
      
      if (qualityScore < this.config.qualityThreshold) {
        // Don't submit low-quality content to CEO
        console.log(`Blog post "${draft.title}" below quality threshold (${qualityScore}/100)`);
        return null;
      }
      
      // 6. Create final blog post with approval requirement
      const blogPost: BlogPost = {
        title: draft.title,
        slug: this.generateSlug(draft.title),
        excerpt: this.generateExcerpt(draft.content),
        content: draft.content,
        keywords: recommendation.keywords,
        category: this.categorizeContent(draft.content),
        seoScore,
        readingTime: this.calculateReadingTime(draft.content),
        author: 'HotDash Team',
        publishDate: new Date().toISOString(),
        needsApproval: true, // CEO MUST approve
      };
      
      return blogPost;
    } catch (error) {
      console.error(`Error generating blog post for "${recommendation.topic}":`, error);
      return null;
    }
  }

  /**
   * Get context from LlamaIndex MCP knowledge base
   */
  private async getKnowledgeContext(topic: string, keywords: string[]): Promise<string> {
    // This would integrate with LlamaIndex MCP server
    // For now, return placeholder
    
    // TODO: Implement LlamaIndex MCP integration
    // const context = await llamaIndexMCP.tools.query_support({
    //   query: `${topic} ${keywords.join(' ')}`,
    //   max_results: 5,
    // });
    
    return `Context about ${topic} will be retrieved from LlamaIndex MCP when available.`;
  }

  /**
   * Generate content using OpenAI with learned prompts
   */
  private async generateWithOpenAI(
    recommendation: ContentRecommendation,
    context: string,
    systemPrompt: string
  ): Promise<{ title: string; content: string }> {
    // This would call OpenAI API
    // For now, return structure
    
    // TODO: Implement OpenAI API integration
    // const completion = await openai.chat.completions.create({
    //   model: "gpt-4",
    //   messages: [
    //     { role: "system", content: systemPrompt },
    //     { role: "user", content: this.buildUserPrompt(recommendation, context) },
    //   ],
    // });
    
    return {
      title: `How to ${recommendation.topic}: A Complete Guide`,
      content: `[Generated content about ${recommendation.topic} using keywords: ${recommendation.keywords.join(', ')}]\n\nThis is a placeholder. Real content will be generated by OpenAI GPT-4 using the learned system prompts and LlamaIndex context.`,
    };
  }

  private buildUserPrompt(rec: ContentRecommendation, context: string): string {
    return `
Write a blog post optimized for SEO about: ${rec.topic}

Keywords to target: ${rec.keywords.join(', ')}
SEO Opportunity Score: ${rec.seoOpportunity}/100

Context from our knowledge base:
${context}

Requirements:
- Follow the structure: ${BLOG_POST_TEMPLATE.structure.join(' → ')}
- Length: 800-1200 words
- Tone: ${BLOG_POST_TEMPLATE.tone.voice} (Hot Rod AN voice)
- Include specific operator benefits with examples
- Use metrics (not vague claims like "much better")
- Include internal links (2-5) and external links (1-3)
- Meta description (120-160 chars)

Title must: Contain primary keyword, be compelling, be under 70 chars
First paragraph must: Hook reader, state problem, hint at solution
Examples must: Be specific to operators (not generic)
CTA must: Be clear what action to take next

Generate:
`;
  }

  /**
   * Auto-correct common brand voice issues
   */
  private async autoCorrectBrandVoice(content: string): Promise<{ corrected: string; changes: string[] }> {
    // Replace corporate jargon
    let corrected = content;
    const changes: string[] = [];
    
    const replacements: Record<string, string> = {
      'utilize': 'use',
      'leverage': 'use',
      'robust': 'reliable',
      'cutting-edge': 'modern',
      'paradigm': 'approach',
      'synergize': 'work together',
    };
    
    for (const [banned, preferred] of Object.entries(replacements)) {
      const regex = new RegExp(`\\b${banned}\\b`, 'gi');
      if (regex.test(corrected)) {
        corrected = corrected.replace(regex, preferred);
        changes.push(`"${banned}" → "${preferred}"`);
      }
    }
    
    return { corrected, changes };
  }

  /**
   * Calculate SEO score based on keyword optimization
   */
  private calculateSEOScore(draft: { title: string; content: string }, keywords: string[]): number {
    let score = 0;
    const content = draft.content.toLowerCase();
    const title = draft.title.toLowerCase();
    
    // Title contains keyword (+30 points)
    if (keywords.some(k => title.includes(k.toLowerCase()))) {
      score += 30;
    }
    
    // Keyword density (target: 1-3%)
    const wordCount = draft.content.split(/\s+/).length;
    const keywordCount = keywords.reduce((sum, keyword) => {
      const matches = (content.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
      return sum + matches;
    }, 0);
    
    const density = keywordCount / wordCount;
    if (density >= 0.01 && density <= 0.03) {
      score += 30;
    } else if (density > 0 && density < 0.05) {
      score += 15;
    }
    
    // Content length (800-1200 words = optimal) (+20 points)
    if (wordCount >= 800 && wordCount <= 1200) {
      score += 20;
    } else if (wordCount >= 600 && wordCount <= 1500) {
      score += 10;
    }
    
    // Has internal/external links (+20 points)
    const hasLinks = /\[.*\]\(.*\)|\<a href/.test(draft.content);
    if (hasLinks) {
      score += 20;
    }
    
    return Math.min(100, score);
  }

  /**
   * Calculate overall quality score
   */
  private calculateQualityScore(
    voiceCheck: { score: number },
    seoScore: number
  ): number {
    // Weighted average: brand voice 60%, SEO 40%
    return Math.round(voiceCheck.score * 60 + seoScore * 0.4);
  }

  /**
   * Generate URL-friendly slug
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Extract excerpt from content (first 150-200 chars)
   */
  private generateExcerpt(content: string): string {
    // Remove markdown, get first paragraph
    const plain = content.replace(/[#*`\[\]]/g, '');
    const firstPara = plain.split('\n\n')[0];
    
    if (firstPara.length <= 200) return firstPara;
    
    // Trim to 150 chars at word boundary
    return firstPara.substring(0, 150).replace(/\s+\S*$/, '') + '...';
  }

  /**
   * Categorize content based on keywords/topic
   */
  private categorizeContent(content: string): BlogPost['category'] {
    const lower = content.toLowerCase();
    
    if (lower.includes('customer success') || lower.includes('case study')) {
      return 'customer_success';
    }
    if (lower.includes('how to') || lower.includes('guide') || lower.includes('tutorial')) {
      return 'how_to';
    }
    if (lower.includes('update') || lower.includes('new feature') || lower.includes('release')) {
      return 'product_updates';
    }
    if (lower.includes('technical') || lower.includes('architecture') || lower.includes('API')) {
      return 'technical';
    }
    if (lower.includes('industry') || lower.includes('trend') || lower.includes('market')) {
      return 'industry_insights';
    }
    
    return 'how_to'; // Default
  }

  /**
   * Calculate reading time (words / 200 wpm)
   */
  private calculateReadingTime(content: string): number {
    const words = content.split(/\s+/).length;
    return Math.ceil(words / 200);
  }

  /**
   * Utility: Chunk array into batches
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

// ============================================================================
// OpenAI Agent Tool: Publish Blog Post (CEO Approval Required)
// ============================================================================

export const publishBlogPostTool = tool({
  name: 'publish_blog_post',
  description: 'Publish a generated blog post to the Shopify blog. Requires CEO approval.',
  parameters: BlogPostSchema,
  needsApproval: true, // CEO MUST approve before publishing
  
  async execute({ title, content, slug, keywords, ...rest }) {
    // This only executes AFTER CEO approval
    
    // TODO: Implement Shopify Blog API integration
    // const published = await shopify.graphql(`
    //   mutation createBlogPost($input: BlogPostInput!) {
    //     blogPostCreate(input: $input) {
    //       blogPost { id title handle publishedAt }
    //     }
    //   }
    // `, {
    //   input: { title, content, tags: keywords, publishedAt: new Date().toISOString() }
    // });
    
    // For now, log the approval
    console.log(`[CEO APPROVED] Publishing blog post: "${title}"`);
    
    // Learn from CEO approval
    await ceoApprovalLearner.learnFromApproval(
      content,
      null, // No edits if approved as-is
      true,
      'blog'
    );
    
    return {
      success: true,
      url: `https://hotdash.com/blog/${slug}`,
      publishedAt: new Date().toISOString(),
    };
  },
});

// ============================================================================
// Batch Generation Tool (Creates Multiple Actions for CEO)
// ============================================================================

export const generateBlogPostBatchTool = tool({
  name: 'generate_blog_post_batch',
  description: 'Generate multiple blog posts from SEO recommendations. Each post becomes a separate approval action for CEO.',
  parameters: z.object({
    recommendations: z.array(z.object({
      topic: z.string(),
      keywords: z.array(z.string()),
      seoOpportunity: z.number(),
      priority: z.enum(['high', 'medium', 'low']),
    })),
    limit: z.number().int().positive().max(100).default(50),
  }),
  needsApproval: false, // Generation itself doesn't need approval
  
  async execute({ recommendations, limit }) {
    const generator = new BlogPostGenerator();
    const posts = await generator.generateBatch(recommendations, limit);
    
    // Each post will create a separate approval Action
    const actionsCreated = posts.map(post => ({
      type: 'publish_blog_post',
      data: post,
      needsApproval: true,
    }));
    
    return {
      generated: posts.length,
      pendingApproval: actionsCreated.length,
      averageQualityScore: posts.reduce((sum, p) => sum + p.seoScore, 0) / posts.length,
    };
  },
});

// ============================================================================
// Helper: SEO Recommendation Fetcher (Integration Point)
// ============================================================================

/**
 * Fetch SEO opportunities from Google Search Console
 * This would be called by content recommender system (AI agent)
 */
export async function fetchSEOOpportunities(): Promise<ContentRecommendation[]> {
  // TODO: Integrate with Google Search Console API
  // const opportunities = await gscAPI.getTopQueries({
  //   position: { min: 4, max: 20 },  // We rank 4-20 (improvement opportunity)
  //   impressions: { min: 100 },      // Decent search volume
  //   clicks: { min: 10 },            // Some interest
  // });
  
  // Placeholder recommendations
  return [
    {
      topic: 'AI customer support automation',
      keywords: ['ai support', 'customer service automation', 'shopify support'],
      seoOpportunity: 85,
      priority: 'high',
      sourceData: {
        gscPosition: 8,
        gscImpressions: 1200,
        gscClicks: 45,
      },
    },
    {
      topic: 'Human-in-loop AI systems',
      keywords: ['human in loop', 'ai approval workflow', 'ai safety'],
      seoOpportunity: 78,
      priority: 'high',
      sourceData: {
        gscPosition: 12,
        gscImpressions: 800,
        gscClicks: 28,
      },
    },
    // ... more recommendations from GSC data
  ];
}

// ============================================================================
// Learning from CEO Approvals
// ============================================================================

/**
 * Track CEO approval patterns to improve future generation
 */
export async function trackCEOApproval(
  blogPost: BlogPost,
  approved: boolean,
  ceoEdits?: string[]
): Promise<void> {
  await ceoApprovalLearner.learnFromApproval(
    blogPost.content,
    ceoEdits || null,
    approved,
    'blog'
  );
  
  // Update generation prompts based on patterns
  const patterns = ceoApprovalLearner.getLearnedPatterns(0.7);
  
  if (patterns.length > 10) {
    // Enough data to improve prompts
    console.log(`Learned ${patterns.length} CEO approval patterns. Updating generation prompts.`);
    
    // TODO: Persist learned patterns to database
    // await db.ceoApprovalPatterns.upsert(patterns);
  }
}

// ============================================================================
// Export
// ============================================================================

export const blogGenerator = new BlogPostGenerator();
export { BlogPostGenerator, publishBlogPostTool, generateBlogPostBatchTool };


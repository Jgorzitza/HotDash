/**
 * Content Generation Templates & Schemas
 * 
 * Defines structure for automated content generation systems.
 * CEO approval required for all marketing content (needsApproval: true)
 */

import { z } from 'zod';

// ============================================================================
// Blog Post Schema
// ============================================================================

export const BlogPostSchema = z.object({
  title: z.string().min(10).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  excerpt: z.string().min(50).max(200),
  content: z.string().min(500),
  keywords: z.array(z.string()).min(1).max(10),
  category: z.enum([
    'product_updates',
    'customer_success',
    'industry_insights',
    'how_to',
    'case_studies',
    'technical',
  ]),
  seoScore: z.number().min(0).max(100),
  readingTime: z.number().int().positive(),
  author: z.string(),
  publishDate: z.string().datetime(),
  needsApproval: z.literal(true), // CEO must approve
});

export type BlogPost = z.infer<typeof BlogPostSchema>;

// Blog Post Template
export const BLOG_POST_TEMPLATE = {
  structure: [
    'hook',          // First 2 sentences - grab attention
    'problem',       // What pain point are we solving?
    'solution',      // How does our product help?
    'how_it_works',  // Step-by-step or technical explanation
    'benefits',      // Key advantages
    'social_proof',  // Customer quote or data
    'call_to_action', // What should reader do next?
  ],
  tone: {
    voice: 'conversational', // Not corporate
    style: 'enthusiastic_but_clear', // Excited but not pushy
    technical_level: 'accessible', // Explain jargon
  },
  seo_requirements: {
    title_contains_keyword: true,
    keyword_density: { min: 0.01, max: 0.03 },
    internal_links: { min: 2, max: 5 },
    external_links: { min: 1, max: 3 },
    meta_description: { min: 120, max: 160 },
  },
};

// ============================================================================
// Social Media Post Schema
// ============================================================================

export const SocialPostSchema = z.object({
  platform: z.enum(['twitter', 'linkedin', 'instagram', 'facebook']),
  content: z.string().min(10).max(2000),
  mediaUrls: z.array(z.string().url()).optional(),
  hashtags: z.array(z.string()).max(10),
  scheduledFor: z.string().datetime(),
  sourceContentId: z.string().optional(), // Link to blog post if derived
  engagementScore: z.number().min(0).max(100),
  needsApproval: z.literal(true), // CEO must approve
});

export type SocialPost = z.infer<typeof SocialPostSchema>;

// Platform-Specific Templates
export const SOCIAL_TEMPLATES = {
  twitter: {
    max_length: 280,
    optimal_hashtags: 2,
    link_position: 'end',
    tone: 'punchy_informative',
  },
  linkedin: {
    max_length: 1300,
    optimal_length: 500,
    format: 'storytelling',
    tone: 'professional_helpful',
  },
  instagram: {
    max_length: 2200,
    optimal_hashtags: 8,
    visual_required: true,
    tone: 'visual_storytelling',
  },
};

// ============================================================================
// Email Campaign Schema
// ============================================================================

export const EmailCampaignSchema = z.object({
  subject: z.string().min(10).max(80),
  preheader: z.string().min(20).max(100),
  content: z.object({
    greeting: z.string(),
    body: z.string().min(100),
    cta: z.object({
      text: z.string(),
      url: z.string().url(),
    }),
    footer: z.string(),
  }),
  segment: z.enum([
    'new_signups',
    'active_users',
    'churned_users',
    'enterprise_prospects',
    'pilot_customers',
  ]),
  personalization: z.record(z.string()), // Dynamic variables
  abTestVariant: z.enum(['A', 'B', 'control']).optional(),
  needsApproval: z.literal(true), // CEO must approve
});

export type EmailCampaign = z.infer<typeof EmailCampaignSchema>;

// Email Templates by Type
export const EMAIL_TEMPLATES = {
  welcome: {
    subject_formula: 'Welcome to [Product] - [Key Benefit]',
    cta: 'Get Started',
    timing: 'immediate',
  },
  activation: {
    subject_formula: 'You\'re almost there! [Next Step]',
    cta: 'Complete Setup',
    timing: '+24 hours if not activated',
  },
  feature_announcement: {
    subject_formula: 'New: [Feature Name] - [Benefit]',
    cta: 'Try It Now',
    timing: 'feature launch + 1 day',
  },
  upsell: {
    subject_formula: 'You\'ve hit [Limit] - Time to upgrade?',
    cta: 'View Plans',
    timing: 'usage threshold - 10%',
  },
};

// ============================================================================
// Content Generation Request Schema
// ============================================================================

export const ContentGenerationRequestSchema = z.object({
  type: z.enum(['blog', 'social', 'email']),
  inputData: z.object({
    keywords: z.array(z.string()).optional(),
    gscData: z.any().optional(), // Google Search Console data
    sourceUrl: z.string().url().optional(),
    customerSegment: z.string().optional(),
    productUpdate: z.string().optional(),
  }),
  quantity: z.number().int().positive().max(100),
  parameters: z.object({
    tone: z.enum(['conversational', 'professional', 'technical', 'enthusiastic']),
    length: z.enum(['short', 'medium', 'long']),
    seoOptimize: z.boolean(),
    includeVisuals: z.boolean(),
  }),
});

export type ContentGenerationRequest = z.infer<typeof ContentGenerationRequestSchema>;

// ============================================================================
// Content Quality Score Schema
// ============================================================================

export const ContentQualityScoreSchema = z.object({
  overall: z.number().min(0).max(100),
  components: z.object({
    brandVoice: z.number().min(0).max(100),
    seoOptimization: z.number().min(0).max(100),
    readability: z.number().min(0).max(100),
    technicalAccuracy: z.number().min(0).max(100),
    engagementPotential: z.number().min(0).max(100),
  }),
  issues: z.array(z.object({
    type: z.string(),
    severity: z.enum(['low', 'medium', 'high']),
    description: z.string(),
    suggestion: z.string(),
  })),
  approved: z.boolean(),
  approvedBy: z.string().optional(),
  approvedAt: z.string().datetime().optional(),
});

export type ContentQualityScore = z.infer<typeof ContentQualityScoreSchema>;

// ============================================================================
// Brand Voice Validation Schema
// ============================================================================

export const BrandVoiceCheckSchema = z.object({
  passes: z.boolean(),
  score: z.number().min(0).max(1),
  violations: z.array(z.object({
    rule: z.string(),
    severity: z.enum(['warning', 'error']),
    location: z.string(),
    suggestion: z.string(),
  })),
});

// Brand Voice Rules (Hot Rod AN voice)
export const BRAND_VOICE_RULES = {
  conversational: {
    avoid: ['leverage', 'synergize', 'paradigm', 'utilize', 'robust solution', 'cutting-edge'],
    prefer: ['use', 'work with', 'change', 'help', 'better way', 'modern'],
  },
  enthusiastic_not_pushy: {
    avoid: ['must buy now', 'limited time only', 'act now or miss out', 'exclusive offer'],
    prefer: ['check it out', 'give it a try', 'see if it helps', 'worth exploring'],
  },
  clear_not_jargon: {
    explain_terms: true,
    max_technical_terms_per_paragraph: 2,
    provide_examples: true,
    avoid: ['best-in-class', 'revolutionary', 'game-changing', 'disruptive'],
  },
  operator_first: {
    focus: 'operator benefits and outcomes',
    avoid: 'generic feature lists',
    include: 'specific use cases and results',
    examples_required: true,
  },
};

// ============================================================================
// Content Distribution Schema
// ============================================================================

export const ContentDistributionSchema = z.object({
  contentId: z.string(),
  contentType: z.enum(['blog', 'social', 'email']),
  channels: z.array(z.object({
    platform: z.string(),
    published: z.boolean(),
    publishedAt: z.string().datetime().optional(),
    url: z.string().url().optional(),
    metrics: z.object({
      views: z.number().optional(),
      clicks: z.number().optional(),
      conversions: z.number().optional(),
    }).optional(),
  })),
  status: z.enum(['draft', 'pending_approval', 'approved', 'published', 'archived']),
});

export type ContentDistribution = z.infer<typeof ContentDistributionSchema>;

// ============================================================================
// Export All Schemas
// ============================================================================

export const ContentSchemas = {
  BlogPost: BlogPostSchema,
  SocialPost: SocialPostSchema,
  EmailCampaign: EmailCampaignSchema,
  ContentGenerationRequest: ContentGenerationRequestSchema,
  ContentQualityScore: ContentQualityScoreSchema,
  BrandVoiceCheck: BrandVoiceCheckSchema,
  ContentDistribution: ContentDistributionSchema,
};

// Export Templates
export const ContentTemplates = {
  blog: BLOG_POST_TEMPLATE,
  social: SOCIAL_TEMPLATES,
  email: EMAIL_TEMPLATES,
  brandVoice: BRAND_VOICE_RULES,
};


/**
 * Draft Templates Library
 * 
 * Pre-built content templates for common post types:
 * - Product launches
 * - Sales and promotions
 * - Educational content
 * - Behind-the-scenes
 * - User-generated content
 * - Seasonal/holiday posts
 */

import type { SocialPlatform } from '../../lib/content/tracking';

// ============================================================================
// Types
// ============================================================================

/**
 * Content template
 */
export interface ContentTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  platforms: SocialPlatform[];
  template: string; // Template with placeholders
  placeholders: {
    key: string;
    description: string;
    required: boolean;
    example: string;
  }[];
  hashtags: string[];
  bestPractices: string[];
  estimatedEngagement: number;
}

/**
 * Template categories
 */
export type TemplateCategory = 
  | 'product_launch'
  | 'promotion'
  | 'educational'
  | 'behind_the_scenes'
  | 'user_generated'
  | 'seasonal'
  | 'engagement'
  | 'announcement';

/**
 * Filled template
 */
export interface FilledTemplate {
  content: string;
  hashtags: string[];
  platform: SocialPlatform;
  metadata: {
    templateId: string;
    templateName: string;
    category: TemplateCategory;
  };
}

// ============================================================================
// Template Library
// ============================================================================

const TEMPLATES: ContentTemplate[] = [
  // Product Launch Templates
  {
    id: 'product_launch_1',
    name: 'New Product Announcement',
    category: 'product_launch',
    description: 'Announce a new product with excitement',
    platforms: ['instagram', 'facebook', 'tiktok'],
    template: '🎉 Introducing {{product_name}}! {{description}} \n\n{{key_features}}\n\nAvailable now at {{link}}',
    placeholders: [
      { key: 'product_name', description: 'Name of the product', required: true, example: 'Premium Widget' },
      { key: 'description', description: 'Brief product description', required: true, example: 'The ultimate solution for...' },
      { key: 'key_features', description: 'Key features (bullet points)', required: false, example: '✨ Feature 1\n✨ Feature 2' },
      { key: 'link', description: 'Product link', required: true, example: 'hotrodan.com/products/widget' },
    ],
    hashtags: ['#newproduct', '#launch', '#shopnow'],
    bestPractices: [
      'Use high-quality product images',
      'Post during peak engagement hours',
      'Include a clear call-to-action',
    ],
    estimatedEngagement: 75,
  },
  
  // Promotion Templates
  {
    id: 'promotion_sale',
    name: 'Sale Announcement',
    category: 'promotion',
    description: 'Announce a sale or discount',
    platforms: ['instagram', 'facebook', 'tiktok'],
    template: '🔥 {{sale_type}} SALE! 🔥\n\nGet {{discount}}% OFF {{products}}!\n\n⏰ Limited time: {{duration}}\n\nShop now: {{link}}',
    placeholders: [
      { key: 'sale_type', description: 'Type of sale', required: true, example: 'FLASH' },
      { key: 'discount', description: 'Discount percentage', required: true, example: '25' },
      { key: 'products', description: 'Products on sale', required: true, example: 'all products' },
      { key: 'duration', description: 'Sale duration', required: true, example: '48 hours only' },
      { key: 'link', description: 'Shop link', required: true, example: 'hotrodan.com/sale' },
    ],
    hashtags: ['#sale', '#discount', '#limitedtime', '#shopnow'],
    bestPractices: [
      'Create urgency with time limits',
      'Use eye-catching visuals',
      'Post multiple times during sale period',
    ],
    estimatedEngagement: 85,
  },

  // Educational Templates
  {
    id: 'educational_howto',
    name: 'How-To Guide',
    category: 'educational',
    description: 'Share educational content or tips',
    platforms: ['instagram', 'facebook', 'tiktok'],
    template: '💡 How to {{topic}}\n\n{{steps}}\n\n{{cta}}\n\nSave this for later! 📌',
    placeholders: [
      { key: 'topic', description: 'Topic of the guide', required: true, example: 'care for your leather products' },
      { key: 'steps', description: 'Step-by-step instructions', required: true, example: '1. Clean gently\n2. Apply conditioner\n3. Store properly' },
      { key: 'cta', description: 'Call to action', required: false, example: 'Shop our care products →' },
    ],
    hashtags: ['#howto', '#tips', '#tutorial', '#educational'],
    bestPractices: [
      'Use carousel format for step-by-step',
      'Include visuals for each step',
      'Encourage saves for reference',
    ],
    estimatedEngagement: 70,
  },

  // Behind-the-Scenes Templates
  {
    id: 'bts_process',
    name: 'Behind the Scenes',
    category: 'behind_the_scenes',
    description: 'Show your process or team',
    platforms: ['instagram', 'facebook', 'tiktok'],
    template: '👀 Behind the scenes: {{activity}}\n\n{{description}}\n\n{{fun_fact}}\n\n#BehindTheScenes',
    placeholders: [
      { key: 'activity', description: 'What you\'re showing', required: true, example: 'Making our signature product' },
      { key: 'description', description: 'Details about the process', required: true, example: 'Each piece is handcrafted with care...' },
      { key: 'fun_fact', description: 'Interesting fact', required: false, example: 'Did you know? Each piece takes 3 hours to complete!' },
    ],
    hashtags: ['#behindthescenes', '#process', '#handmade', '#craftsmanship'],
    bestPractices: [
      'Show authentic, unpolished moments',
      'Introduce team members',
      'Use video format for better engagement',
    ],
    estimatedEngagement: 68,
  },

  // User-Generated Content Templates
  {
    id: 'ugc_repost',
    name: 'Customer Feature',
    category: 'user_generated',
    description: 'Feature customer content',
    platforms: ['instagram', 'facebook', 'tiktok'],
    template: '❤️ We love seeing {{customer_name}} enjoying their {{product}}!\n\n{{quote}}\n\nThank you for sharing! 📸\n\nTag us to be featured!',
    placeholders: [
      { key: 'customer_name', description: 'Customer name or handle', required: true, example: '@customer' },
      { key: 'product', description: 'Product they purchased', required: true, example: 'new leather bag' },
      { key: 'quote', description: 'Customer quote or testimonial', required: false, example: '"Best purchase ever!"' },
    ],
    hashtags: ['#customerlove', '#testimonial', '#community'],
    bestPractices: [
      'Always get permission before reposting',
      'Credit the original creator',
      'Encourage more UGC with contests',
    ],
    estimatedEngagement: 72,
  },

  // Seasonal Templates
  {
    id: 'seasonal_holiday',
    name: 'Holiday Greeting',
    category: 'seasonal',
    description: 'Holiday or seasonal post',
    platforms: ['instagram', 'facebook', 'tiktok'],
    template: '{{emoji}} Happy {{holiday}}! {{emoji}}\n\n{{message}}\n\n{{offer}}',
    placeholders: [
      { key: 'emoji', description: 'Holiday emoji', required: false, example: '🎄' },
      { key: 'holiday', description: 'Holiday name', required: true, example: 'Holidays' },
      { key: 'message', description: 'Holiday message', required: true, example: 'Wishing you joy and warmth this season!' },
      { key: 'offer', description: 'Special offer (optional)', required: false, example: 'Enjoy 20% off with code HOLIDAY20' },
    ],
    hashtags: ['#holiday', '#seasonal', '#celebration'],
    bestPractices: [
      'Post 1-2 weeks before major holidays',
      'Use festive visuals',
      'Include limited-time offers',
    ],
    estimatedEngagement: 65,
  },

  // Engagement Templates
  {
    id: 'engagement_question',
    name: 'Question Post',
    category: 'engagement',
    description: 'Ask audience a question',
    platforms: ['instagram', 'facebook', 'tiktok'],
    template: '❓ {{question}}\n\n{{context}}\n\nComment below! 👇',
    placeholders: [
      { key: 'question', description: 'Question to ask', required: true, example: 'What\'s your favorite product?' },
      { key: 'context', description: 'Additional context', required: false, example: 'We\'re curious to know what you love most!' },
    ],
    hashtags: ['#question', '#community', '#engagement'],
    bestPractices: [
      'Ask open-ended questions',
      'Respond to all comments',
      'Use polls in Stories',
    ],
    estimatedEngagement: 80,
  },

  // Announcement Templates
  {
    id: 'announcement_general',
    name: 'General Announcement',
    category: 'announcement',
    description: 'Make an announcement',
    platforms: ['instagram', 'facebook', 'tiktok'],
    template: '📢 Announcement: {{title}}\n\n{{details}}\n\n{{cta}}',
    placeholders: [
      { key: 'title', description: 'Announcement title', required: true, example: 'New Store Hours' },
      { key: 'details', description: 'Announcement details', required: true, example: 'We\'re now open 7 days a week!' },
      { key: 'cta', description: 'Call to action', required: false, example: 'Visit us today!' },
    ],
    hashtags: ['#announcement', '#news', '#update'],
    bestPractices: [
      'Be clear and concise',
      'Include important dates/times',
      'Pin important announcements',
    ],
    estimatedEngagement: 60,
  },
];

// ============================================================================
// Template Functions
// ============================================================================

/**
 * Get all templates
 */
export function getAllTemplates(): ContentTemplate[] {
  return TEMPLATES;
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: TemplateCategory): ContentTemplate[] {
  return TEMPLATES.filter(t => t.category === category);
}

/**
 * Get templates by platform
 */
export function getTemplatesByPlatform(platform: SocialPlatform): ContentTemplate[] {
  return TEMPLATES.filter(t => t.platforms.includes(platform));
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): ContentTemplate | null {
  return TEMPLATES.find(t => t.id === id) || null;
}

/**
 * Fill template with data
 */
export function fillTemplate(
  templateId: string,
  data: Record<string, string>,
  platform: SocialPlatform
): FilledTemplate | null {
  const template = getTemplateById(templateId);
  
  if (!template) {
    return null;
  }

  // Check required placeholders
  const missingRequired = template.placeholders
    .filter(p => p.required && !data[p.key])
    .map(p => p.key);

  if (missingRequired.length > 0) {
    throw new Error(`Missing required placeholders: ${missingRequired.join(', ')}`);
  }

  // Replace placeholders
  let content = template.template;
  template.placeholders.forEach(placeholder => {
    const value = data[placeholder.key] || '';
    const regex = new RegExp(`{{${placeholder.key}}}`, 'g');
    content = content.replace(regex, value);
  });

  return {
    content,
    hashtags: template.hashtags,
    platform,
    metadata: {
      templateId: template.id,
      templateName: template.name,
      category: template.category,
    },
  };
}

/**
 * Search templates
 */
export function searchTemplates(query: string): ContentTemplate[] {
  const lowerQuery = query.toLowerCase();
  return TEMPLATES.filter(t => 
    t.name.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery) ||
    t.category.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get recommended templates based on context
 */
export function getRecommendedTemplates(
  context: {
    platform?: SocialPlatform;
    hasPromotion?: boolean;
    isHoliday?: boolean;
    hasNewProduct?: boolean;
  }
): ContentTemplate[] {
  let recommended = TEMPLATES;

  if (context.platform) {
    recommended = recommended.filter(t => t.platforms.includes(context.platform!));
  }

  if (context.hasPromotion) {
    recommended = recommended.filter(t => t.category === 'promotion');
  }

  if (context.isHoliday) {
    recommended = recommended.filter(t => t.category === 'seasonal');
  }

  if (context.hasNewProduct) {
    recommended = recommended.filter(t => t.category === 'product_launch');
  }

  // Sort by estimated engagement
  return recommended.sort((a, b) => b.estimatedEngagement - a.estimatedEngagement);
}


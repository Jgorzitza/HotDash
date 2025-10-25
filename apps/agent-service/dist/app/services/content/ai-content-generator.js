/**
 * AI Content Generation Service
 *
 * Provides AI-powered content generation for:
 * - Product descriptions
 * - Blog posts
 * - Content quality assessment
 *
 * Uses OpenAI API for generation with brand voice guidelines
 */
import OpenAI from 'openai';
import { analyzeContent } from '~/services/seo/content-optimizer';
/**
 * AI Content Generator Service
 */
export class AIContentGenerator {
    openai;
    defaultModel = 'gpt-4o-mini';
    defaultTemperature = 0.7;
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY || '',
        });
    }
    /**
     * Generate product description
     */
    async generateProductDescription(request) {
        const prompt = this.buildProductDescriptionPrompt(request);
        try {
            const completion = await this.openai.chat.completions.create({
                model: this.defaultModel,
                messages: [
                    {
                        role: 'system',
                        content: this.getSystemPrompt('product_description', request.tone, request.brandVoice),
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: this.defaultTemperature,
                max_tokens: this.getMaxTokensForLength(request.length || 'medium'),
            });
            const content = completion.choices[0]?.message?.content || '';
            // Calculate metadata
            const metadata = this.calculateMetadata(content, request.tone || 'professional');
            // Assess quality
            const qualityScore = await this.assessContentQuality(content, 'product_description', request.includeKeywords);
            return {
                content,
                metadata,
                qualityScore,
                suggestions: this.generateImprovementSuggestions(qualityScore),
            };
        }
        catch (error) {
            console.error('Error generating product description:', error);
            throw new Error('Failed to generate product description');
        }
    }
    /**
     * Generate blog post
     */
    async generateBlogPost(request) {
        const prompt = this.buildBlogPostPrompt(request);
        try {
            const completion = await this.openai.chat.completions.create({
                model: this.defaultModel,
                messages: [
                    {
                        role: 'system',
                        content: this.getSystemPrompt('blog_post', request.tone, request.brandVoice),
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: this.defaultTemperature,
                max_tokens: Math.min(4000, (request.length || 800) * 2), // Rough token estimate
            });
            const content = completion.choices[0]?.message?.content || '';
            // Calculate metadata
            const metadata = this.calculateMetadata(content, request.tone || 'professional');
            // Assess quality
            const qualityScore = await this.assessContentQuality(content, 'blog_post', request.keywords);
            return {
                content,
                metadata,
                qualityScore,
                suggestions: this.generateImprovementSuggestions(qualityScore),
            };
        }
        catch (error) {
            console.error('Error generating blog post:', error);
            throw new Error('Failed to generate blog post');
        }
    }
    /**
     * Generate multiple variations of content
     */
    async generateVariations(type, request, count = 3) {
        const variations = [];
        const tones = ['professional', 'casual', 'enthusiastic'];
        for (let i = 0; i < Math.min(count, 3); i++) {
            const modifiedRequest = {
                ...request,
                tone: tones[i % tones.length],
            };
            if (type === 'product_description') {
                const variation = await this.generateProductDescription(modifiedRequest);
                variations.push(variation);
            }
            else {
                const variation = await this.generateBlogPost(modifiedRequest);
                variations.push(variation);
            }
        }
        return variations;
    }
    /**
     * Assess content quality
     */
    async assessContentQuality(content, contentType, keywords) {
        // Use SEO content optimizer for readability and SEO scoring
        const seoAnalysis = await analyzeContent('https://hotrodan.com/temp', // Placeholder URL
        content, keywords?.[0] || '');
        // Calculate engagement score based on content characteristics
        const engagementScore = this.calculateEngagementScore(content);
        // Calculate brand alignment score
        const brandAlignmentScore = this.calculateBrandAlignmentScore(content);
        // Overall score is weighted average
        const overall = Math.round((seoAnalysis.overallScore.score * 0.3) +
            (engagementScore * 0.3) +
            (brandAlignmentScore * 0.2) +
            (seoAnalysis.readability.score * 0.2));
        const issues = [];
        const recommendations = [];
        // Collect issues and recommendations
        if (seoAnalysis.readability.score < 60) {
            issues.push('Content readability is below target');
            recommendations.push('Simplify sentence structure and use shorter paragraphs');
        }
        if (seoAnalysis.overallScore.score < 70) {
            issues.push('SEO score needs improvement');
            recommendations.push(...seoAnalysis.recommendations);
        }
        if (engagementScore < 60) {
            issues.push('Content may not be engaging enough');
            recommendations.push('Add more compelling hooks, questions, or calls-to-action');
        }
        return {
            overall,
            readability: seoAnalysis.readability.score,
            seoScore: seoAnalysis.overallScore.score,
            engagement: engagementScore,
            brandAlignment: brandAlignmentScore,
            issues,
            recommendations,
        };
    }
    /**
     * Build product description prompt
     */
    buildProductDescriptionPrompt(request) {
        const parts = [
            `Generate a compelling product description for: ${request.productTitle}`,
        ];
        if (request.productType) {
            parts.push(`Product Type: ${request.productType}`);
        }
        if (request.features && request.features.length > 0) {
            parts.push(`Key Features:\n${request.features.map(f => `- ${f}`).join('\n')}`);
        }
        if (request.benefits && request.benefits.length > 0) {
            parts.push(`Benefits:\n${request.benefits.map(b => `- ${b}`).join('\n')}`);
        }
        if (request.targetAudience) {
            parts.push(`Target Audience: ${request.targetAudience}`);
        }
        if (request.includeKeywords && request.includeKeywords.length > 0) {
            parts.push(`Include these keywords naturally: ${request.includeKeywords.join(', ')}`);
        }
        const lengthGuide = {
            short: '50-100 words',
            medium: '100-200 words',
            long: '200-300 words',
        };
        parts.push(`Length: ${lengthGuide[request.length || 'medium']}`);
        return parts.join('\n\n');
    }
    /**
     * Build blog post prompt
     */
    buildBlogPostPrompt(request) {
        const parts = [
            `Write a blog post about: ${request.topic}`,
        ];
        if (request.keywords && request.keywords.length > 0) {
            parts.push(`Target Keywords: ${request.keywords.join(', ')}`);
        }
        if (request.targetAudience) {
            parts.push(`Target Audience: ${request.targetAudience}`);
        }
        if (request.outline && request.outline.length > 0) {
            parts.push(`Outline:\n${request.outline.map((item, i) => `${i + 1}. ${item}`).join('\n')}`);
        }
        if (request.length) {
            parts.push(`Target Length: ${request.length} words`);
        }
        if (request.includeCallToAction) {
            parts.push('Include a compelling call-to-action at the end');
        }
        return parts.join('\n\n');
    }
    /**
     * Get system prompt for content type
     */
    getSystemPrompt(contentType, tone, brandVoice) {
        const baseBrandVoice = brandVoice ||
            'Hot Rodan: Automotive enthusiast brand focused on quality parts and expert advice. ' +
                'Voice is knowledgeable, passionate, and customer-focused.';
        const toneGuidance = {
            professional: 'Use professional, authoritative language while remaining approachable.',
            casual: 'Use conversational, friendly language that feels natural and relatable.',
            playful: 'Use energetic, fun language with appropriate humor and enthusiasm.',
            technical: 'Use precise, technical language appropriate for knowledgeable audiences.',
            enthusiastic: 'Use passionate, exciting language that conveys genuine enthusiasm.',
        };
        return `You are an expert content writer for ${baseBrandVoice}

Tone: ${toneGuidance[tone || 'professional']}

Guidelines:
- Write clear, compelling content that engages the target audience
- Use active voice and strong verbs
- Include specific details and benefits
- Maintain brand voice consistency
- Optimize for readability and SEO
- Avoid jargon unless appropriate for the audience
- Focus on customer value and benefits

${contentType === 'product_description' ?
            'For product descriptions: Highlight unique features, benefits, and value proposition. Make it scannable with short paragraphs.' :
            'For blog posts: Use engaging headlines, clear structure with subheadings, and include actionable insights.'}`;
    }
    /**
     * Calculate content metadata
     */
    calculateMetadata(content, tone) {
        const wordCount = content.split(/\s+/).length;
        const characterCount = content.length;
        const readingTime = Math.ceil(wordCount / 200); // Average reading speed
        return {
            wordCount,
            characterCount,
            readingTime,
            tone,
            generatedAt: new Date().toISOString(),
        };
    }
    /**
     * Calculate engagement score
     */
    calculateEngagementScore(content) {
        let score = 70; // Base score
        // Check for engaging elements
        const hasQuestions = /\?/.test(content);
        const hasNumbers = /\d+/.test(content);
        const hasBulletPoints = /[-•*]/.test(content);
        const hasEmphasis = /\*\*|__/.test(content);
        if (hasQuestions)
            score += 5;
        if (hasNumbers)
            score += 5;
        if (hasBulletPoints)
            score += 5;
        if (hasEmphasis)
            score += 5;
        // Check sentence variety
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const avgSentenceLength = content.length / sentences.length;
        if (avgSentenceLength < 100)
            score += 5; // Shorter sentences are more engaging
        return Math.min(100, score);
    }
    /**
     * Calculate brand alignment score
     */
    calculateBrandAlignmentScore(content) {
        let score = 75; // Base score
        // Check for brand-appropriate language
        const automotiveTerms = ['quality', 'performance', 'reliable', 'expert', 'precision'];
        const foundTerms = automotiveTerms.filter(term => content.toLowerCase().includes(term));
        score += foundTerms.length * 5;
        return Math.min(100, score);
    }
    /**
     * Generate improvement suggestions
     */
    generateImprovementSuggestions(qualityScore) {
        const suggestions = [];
        if (qualityScore.overall < 70) {
            suggestions.push('Consider revising content to improve overall quality');
        }
        if (qualityScore.readability < 60) {
            suggestions.push('Simplify language and sentence structure for better readability');
        }
        if (qualityScore.seoScore < 70) {
            suggestions.push('Add more relevant keywords and improve SEO optimization');
        }
        if (qualityScore.engagement < 60) {
            suggestions.push('Add more engaging elements like questions, numbers, or bullet points');
        }
        return suggestions;
    }
    /**
     * Get max tokens for content length
     */
    getMaxTokensForLength(length) {
        const tokenMap = {
            short: 200,
            medium: 400,
            long: 600,
        };
        return tokenMap[length];
    }
}
/**
 * Export singleton instance
 */
export const aiContentGenerator = new AIContentGenerator();
//# sourceMappingURL=ai-content-generator.js.map
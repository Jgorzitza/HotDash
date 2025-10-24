/**
 * Post Drafter Service
 *
 * AI-powered social media post drafting for HITL approval workflow.
 * Generates platform-optimized content based on:
 * - Product information
 * - Historical performance data
 * - Platform best practices
 * - Brand voice guidelines
 */
import type { SocialPlatform } from "../../lib/content/tracking";
import type { Approval } from "../../components/approvals/ApprovalsDrawer";
/**
 * Post draft request parameters
 */
export interface DraftPostRequest {
    platform: SocialPlatform;
    topic?: string;
    productId?: string;
    tone?: "professional" | "casual" | "playful" | "urgent";
    includeHashtags?: boolean;
    includeEmojis?: boolean;
    maxLength?: number;
}
/**
 * Generated post draft with metadata
 */
export interface PostDraft {
    content: string;
    platform: SocialPlatform;
    metadata: {
        hashtags: string[];
        mentions: string[];
        estimatedEngagement?: number;
        characterCount: number;
        wordCount: number;
    };
    reasoning: {
        strategy: string;
        expectedPerformance: string;
        basedOn: string[];
    };
    alternatives?: string[];
}
/**
 * Post optimization suggestions
 */
export interface OptimizationSuggestions {
    timing: {
        bestDayOfWeek: string;
        bestTimeOfDay: string;
        reasoning: string;
    };
    hashtags: {
        recommended: string[];
        trending: string[];
        reasoning: string;
    };
    content: {
        suggestions: string[];
        warnings: string[];
    };
}
/**
 * HITL approval creation options
 */
export interface CreateApprovalOptions {
    draft: PostDraft;
    scheduledTime?: string;
    targetAudience?: string;
    campaignId?: string;
    isDev?: boolean;
}
/**
 * Generate a post draft for the specified platform
 *
 * NOTE: This is a placeholder implementation. In production, this would:
 * 1. Call OpenAI API with platform-specific prompts
 * 2. Incorporate historical performance data
 * 3. Apply brand voice guidelines
 * 4. Use engagement insights for optimization
 */
export declare function draftPost(request: DraftPostRequest): Promise<PostDraft>;
/**
 * Generate multiple post variations for A/B testing
 */
export declare function draftPostVariations(request: DraftPostRequest, count?: number): Promise<PostDraft[]>;
/**
 * Optimize an existing post draft
 */
export declare function optimizePost(draft: PostDraft): Promise<OptimizationSuggestions>;
/**
 * Validate post draft against platform requirements
 */
export declare function validatePost(draft: PostDraft): {
    valid: boolean;
    errors: string[];
    warnings: string[];
};
/**
 * Create an approval record for a post draft (HITL workflow)
 *
 * This function creates a structured approval following the HITL pattern:
 * - Evidence: Post content, platform, timing, engagement forecast
 * - Impact: Estimated reach, engagement, conversions
 * - Risk: Brand reputation, timing concerns
 * - Rollback: Delete post capability
 * - Actions: Social publishing endpoint
 *
 * In dev mode, creates fixtures with provenance.mode="dev:test" and Apply disabled.
 */
export declare function createPostDraftApproval(options: CreateApprovalOptions): Promise<Approval>;
//# sourceMappingURL=post-drafter.d.ts.map
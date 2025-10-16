/**
 * HITL (Human-in-the-Loop) Posting Workflow Service
 * 
 * Implements the complete HITL workflow for social media posting:
 * Draft → Review → Approve → Post → Track → Learn
 * 
 * Ensures all posts go through human approval before publishing.
 */

import type { SocialPlatform, ContentPost } from '../../lib/content/tracking';
import { draftPost, optimizePost, validatePost, type PostDraft } from './post-drafter';
import { getContentPerformance } from '../../lib/content/tracking';

// ============================================================================
// Types
// ============================================================================

/**
 * HITL workflow states
 */
export type HITLState = 
  | 'draft' 
  | 'pending_review' 
  | 'approved' 
  | 'rejected' 
  | 'scheduled' 
  | 'published' 
  | 'failed';

/**
 * HITL post with workflow metadata
 */
export interface HITLPost {
  id: string;
  draft: PostDraft;
  state: HITLState;
  createdAt: string;
  createdBy: string; // AI agent
  reviewedAt?: string;
  reviewedBy?: string; // Human reviewer
  approvedAt?: string;
  publishedAt?: string;
  scheduledFor?: string;
  feedback?: {
    tone: number; // 1-5 grade
    accuracy: number; // 1-5 grade
    policy: number; // 1-5 grade
    comments: string;
    edits?: {
      field: string;
      original: string;
      edited: string;
    }[];
  };
  evidence: {
    reasoning: string;
    projectedImpact: string;
    risks: string[];
    rollbackPlan: string;
  };
  auditLog: {
    timestamp: string;
    action: string;
    actor: string;
    details: string;
  }[];
}

/**
 * Approval request
 */
export interface ApprovalRequest {
  postId: string;
  approved: boolean;
  feedback?: HITLPost['feedback'];
  edits?: Partial<PostDraft>;
  scheduledFor?: string;
}

/**
 * Publishing result
 */
export interface PublishingResult {
  success: boolean;
  postId: string;
  platformPostId?: string;
  publishedAt?: string;
  url?: string;
  error?: string;
  rollbackInstructions?: string;
}

// ============================================================================
// Workflow Functions
// ============================================================================

/**
 * Step 1: Draft - Create initial post draft
 */
export async function createDraft(
  platform: SocialPlatform,
  topic?: string,
  productId?: string
): Promise<HITLPost> {
  // Generate draft using AI
  const draft = await draftPost({
    platform,
    topic,
    productId,
    includeHashtags: true,
    includeEmojis: true,
  });

  // Get optimization suggestions
  const optimization = await optimizePost(draft);

  // Validate draft
  const validation = validatePost(draft);

  // Create HITL post
  const hitlPost: HITLPost = {
    id: generateId(),
    draft,
    state: 'draft',
    createdAt: new Date().toISOString(),
    createdBy: 'ai-content-agent',
    evidence: {
      reasoning: draft.reasoning.strategy,
      projectedImpact: draft.reasoning.expectedPerformance,
      risks: validation.warnings,
      rollbackPlan: 'Post can be deleted from platform within 24 hours',
    },
    auditLog: [{
      timestamp: new Date().toISOString(),
      action: 'draft_created',
      actor: 'ai-content-agent',
      details: `Created draft for ${platform}`,
    }],
  };

  // TODO: Save to Supabase
  
  return hitlPost;
}

/**
 * Step 2: Review - Submit for human review
 */
export async function submitForReview(postId: string): Promise<HITLPost> {
  // TODO: Fetch from Supabase
  const post = await getHITLPost(postId);
  
  if (!post) {
    throw new Error('Post not found');
  }

  if (post.state !== 'draft') {
    throw new Error(`Cannot submit post in state: ${post.state}`);
  }

  // Update state
  post.state = 'pending_review';
  post.auditLog.push({
    timestamp: new Date().toISOString(),
    action: 'submitted_for_review',
    actor: 'ai-content-agent',
    details: 'Post submitted for human review',
  });

  // TODO: Save to Supabase
  // TODO: Send notification to reviewer

  return post;
}

/**
 * Step 3: Approve - Human approves or rejects
 */
export async function processApproval(
  request: ApprovalRequest
): Promise<HITLPost> {
  const post = await getHITLPost(request.postId);
  
  if (!post) {
    throw new Error('Post not found');
  }

  if (post.state !== 'pending_review') {
    throw new Error(`Cannot approve post in state: ${post.state}`);
  }

  const now = new Date().toISOString();

  if (request.approved) {
    // Apply edits if provided
    if (request.edits) {
      const originalDraft = { ...post.draft };
      post.draft = { ...post.draft, ...request.edits };
      
      // Track edits for learning
      if (request.feedback) {
        request.feedback.edits = Object.keys(request.edits).map(field => ({
          field,
          original: JSON.stringify((originalDraft as any)[field]),
          edited: JSON.stringify((request.edits as any)[field]),
        }));
      }
    }

    post.state = request.scheduledFor ? 'scheduled' : 'approved';
    post.approvedAt = now;
    post.scheduledFor = request.scheduledFor;
    post.feedback = request.feedback;
    
    post.auditLog.push({
      timestamp: now,
      action: 'approved',
      actor: 'human-reviewer',
      details: `Post approved${request.scheduledFor ? ` and scheduled for ${request.scheduledFor}` : ''}`,
    });
  } else {
    post.state = 'rejected';
    post.feedback = request.feedback;
    
    post.auditLog.push({
      timestamp: now,
      action: 'rejected',
      actor: 'human-reviewer',
      details: request.feedback?.comments || 'Post rejected',
    });
  }

  post.reviewedAt = now;
  post.reviewedBy = 'human-reviewer'; // TODO: Get actual reviewer ID

  // TODO: Save to Supabase
  
  return post;
}

/**
 * Step 4: Post - Publish to platform
 */
export async function publishPost(postId: string): Promise<PublishingResult> {
  const post = await getHITLPost(postId);
  
  if (!post) {
    throw new Error('Post not found');
  }

  if (post.state !== 'approved' && post.state !== 'scheduled') {
    throw new Error(`Cannot publish post in state: ${post.state}`);
  }

  try {
    // TODO: Integrate with Ayrshare API to publish
    // For now, simulate publishing
    
    const result: PublishingResult = {
      success: true,
      postId: post.id,
      platformPostId: `platform_${Date.now()}`,
      publishedAt: new Date().toISOString(),
      url: `https://${post.draft.platform}.com/post/${Date.now()}`,
      rollbackInstructions: 'Delete post from platform dashboard or use API',
    };

    // Update post state
    post.state = 'published';
    post.publishedAt = result.publishedAt;
    post.auditLog.push({
      timestamp: result.publishedAt,
      action: 'published',
      actor: 'system',
      details: `Published to ${post.draft.platform}. URL: ${result.url}`,
    });

    // TODO: Save to Supabase

    return result;
  } catch (error) {
    // Mark as failed
    post.state = 'failed';
    post.auditLog.push({
      timestamp: new Date().toISOString(),
      action: 'publish_failed',
      actor: 'system',
      details: `Publishing failed: ${error}`,
    });

    // TODO: Save to Supabase

    return {
      success: false,
      postId: post.id,
      error: String(error),
    };
  }
}

/**
 * Step 5: Track - Monitor post performance
 */
export async function trackPostPerformance(postId: string): Promise<{
  post: HITLPost;
  performance: any; // ContentPerformance from tracking.ts
}> {
  const post = await getHITLPost(postId);
  
  if (!post) {
    throw new Error('Post not found');
  }

  if (post.state !== 'published') {
    throw new Error('Post not yet published');
  }

  // Fetch performance metrics
  const performance = await getContentPerformance(
    post.id,
    post.draft.platform
  );

  return { post, performance };
}

/**
 * Step 6: Learn - Capture insights for improvement
 */
export async function captureLearnings(postId: string): Promise<{
  humanEdits: string[];
  grades: { tone: number; accuracy: number; policy: number };
  performanceVsProjected: number;
  insights: string[];
}> {
  const post = await getHITLPost(postId);
  
  if (!post) {
    throw new Error('Post not found');
  }

  const humanEdits = post.feedback?.edits?.map(edit => 
    `${edit.field}: ${edit.original} → ${edit.edited}`
  ) || [];

  const grades = {
    tone: post.feedback?.tone || 0,
    accuracy: post.feedback?.accuracy || 0,
    policy: post.feedback?.policy || 0,
  };

  // TODO: Compare actual performance vs projected
  const performanceVsProjected = 0;

  const insights: string[] = [];
  
  if (humanEdits.length > 0) {
    insights.push(`Human made ${humanEdits.length} edits to improve the draft`);
  }

  if (grades.tone < 4) {
    insights.push('Tone needs improvement - review brand voice guidelines');
  }

  if (grades.accuracy < 4) {
    insights.push('Accuracy needs improvement - verify facts before drafting');
  }

  return {
    humanEdits,
    grades,
    performanceVsProjected,
    insights,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get HITL post by ID
 */
async function getHITLPost(id: string): Promise<HITLPost | null> {
  // TODO: Fetch from Supabase
  return null;
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return `hitl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get all posts in a specific state
 */
export async function getPostsByState(state: HITLState): Promise<HITLPost[]> {
  // TODO: Query Supabase
  return [];
}

/**
 * Get posts pending review
 */
export async function getPendingReviews(): Promise<HITLPost[]> {
  return getPostsByState('pending_review');
}

/**
 * Get scheduled posts
 */
export async function getScheduledPosts(): Promise<HITLPost[]> {
  return getPostsByState('scheduled');
}


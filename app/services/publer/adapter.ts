/**
 * Publer HITL (Human-In-The-Loop) Adapter
 *
 * Handles the flow: Draft → Pending Review → Approved → Published
 * Integrates with approval system for social posts
 * Stores receipts in database after publishing
 */

import { createPublerClient } from "./client";
import type { PublerPost, PublerJobResponse, PublerJobStatus } from "./types";

export interface SocialPostApproval {
  id: string;
  type: "social_post";
  status: "draft" | "pending_review" | "approved" | "rejected";
  content: {
    text: string;
    accountIds: string[];
    scheduledAt?: string;
    media?: Array<{ url: string; type: "image" | "video"; alt_text?: string }>;
  };
  metadata: {
    platform?: string;
    estimated_reach?: number;
    estimated_engagement_rate?: number;
  };
  created_at: string;
  approved_at?: string;
  approved_by?: string;
}

export interface PublishResult {
  success: boolean;
  jobId?: string;
  error?: string;
  receipt?: SocialPostReceipt;
}

export interface SocialPostReceipt {
  id: string;
  approval_id: string;
  publer_job_id: string;
  platform: string;
  content: string;
  published_at: string;
  status: "pending" | "processing" | "complete" | "failed";
  post_url?: string;
  performance_metrics?: {
    reach?: number;
    engagement?: number;
    clicks?: number;
  };
}

export class PublerAdapter {
  private client: ReturnType<typeof createPublerClient>;

  constructor() {
    this.client = createPublerClient();
  }

  /**
   * Convert approval to Publer post format
   */
  private convertApprovalToPost(approval: SocialPostApproval): PublerPost {
    return {
      text: approval.content.text,
      accountIds: approval.content.accountIds,
      scheduledAt: approval.content.scheduledAt,
      media: approval.content.media,
    };
  }

  /**
   * Publish an approved social post
   */
  async publishApproval(approval: SocialPostApproval): Promise<PublishResult> {
    if (approval.status !== "approved") {
      return {
        success: false,
        error: `Cannot publish post with status: ${approval.status}. Must be 'approved'`,
      };
    }

    const post = this.convertApprovalToPost(approval);
    const isScheduled = !!post.scheduledAt;

    try {
      const response = isScheduled
        ? await this.client.schedulePost(post)
        : await this.client.publishPost(post);

      if (!response.success || !response.data) {
        return {
          success: false,
          error: response.error?.message || "Failed to publish post",
        };
      }

      const receipt: SocialPostReceipt = {
        id: crypto.randomUUID(),
        approval_id: approval.id,
        publer_job_id: response.data.job_id,
        platform: approval.metadata.platform || "unknown",
        content: post.text,
        published_at: new Date().toISOString(),
        status: "pending",
      };

      return {
        success: true,
        jobId: response.data.job_id,
        receipt,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error during publishing",
      };
    }
  }

  async checkPublishStatus(jobId: string): Promise<PublerJobStatus | null> {
    try {
      const response = await this.client.getJobStatus(jobId);
      return response.success && response.data ? response.data : null;
    } catch (error) {
      console.error("[PublerAdapter] Error checking status:", error);
      return null;
    }
  }

  updateReceiptFromJobStatus(
    receipt: SocialPostReceipt,
    jobStatus: PublerJobStatus,
  ): SocialPostReceipt {
    const updated = { ...receipt };
    updated.status = jobStatus.status;
    if (jobStatus.posts && jobStatus.posts.length > 0) {
      const firstPost = jobStatus.posts[0];
      updated.post_url = firstPost.url;
      updated.published_at = firstPost.published_at || updated.published_at;
    }
    return updated;
  }

  async listAccounts() {
    const response = await this.client.listAccounts();
    return response.success && response.data ? response.data : [];
  }

  getRateLimitInfo() {
    return this.client.getRateLimitInfo();
  }

  isRateLimitApproaching() {
    return this.client.isRateLimitApproaching();
  }
}

export function createPublerAdapter(): PublerAdapter {
  return new PublerAdapter();
}

/**
 * MOCK Publer API Client
 *
 * This is a mock implementation for development/testing.
 * Real OAuth integration requires:
 * 1. Publer Developer Account
 * 2. OAuth App Registration
 * 3. Workspace ID and API Key
 *
 * @see docs/integrations/publer-oauth-setup.md for production setup
 */

import type {
  PublerScheduleRequest,
  PublerScheduleResponse,
  PublerPostMetrics,
  PublerConnectedAccount,
} from "./types";

/**
 * Feature Flag: Enable Live Publer Posting
 *
 * Set to `false` by default. Only enable when:
 * - OAuth credentials configured in environment
 * - Workspace ID obtained
 * - Connected social accounts verified
 * - CEO approval for production posting
 */
export const PUBLER_LIVE_POSTING_ENABLED = false;

/**
 * Mock Publer Client
 * Returns simulated responses for development
 */
export class PublerClientMock {
  private workspace_id: string;

  constructor(workspace_id: string = "mock-workspace-id") {
    this.workspace_id = workspace_id;

    if (PUBLER_LIVE_POSTING_ENABLED) {
      console.warn(
        "⚠️  PUBLER_LIVE_POSTING_ENABLED=true but using mock client. " +
          "Switch to PublerClientLive for production.",
      );
    }
  }

  /**
   * Mock: Schedule a Post
   *
   * In production, this sends POST /api/v1/posts/schedule
   * and returns a job_id for async tracking.
   */
  async schedulePost(
    request: PublerScheduleRequest,
  ): Promise<PublerScheduleResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Validate basic structure
    if (!request.bulk?.posts || request.bulk.posts.length === 0) {
      throw new Error("Invalid request: no posts provided");
    }

    const post = request.bulk.posts[0];
    const platform = Object.keys(post.networks)[0];
    const account = post.accounts[0];

    console.log("📱 [MOCK] Publer.schedulePost:", {
      platform,
      account_id: account.id,
      scheduled_at: account.scheduled_at,
      text: post.networks[
        platform as keyof typeof post.networks
      ]?.text?.substring(0, 50),
      state: request.bulk.state,
    });

    // Return mock job_id
    return {
      success: true,
      data: {
        job_id: `mock-job-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      },
    };
  }

  /**
   * Mock: Get Post Metrics
   *
   * In production, fetches actual analytics from Publer.
   */
  async getPostMetrics(post_id: string): Promise<PublerPostMetrics> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    console.log("📊 [MOCK] Publer.getPostMetrics:", { post_id });

    // Return mock metrics
    return {
      post_id,
      platform: "instagram",
      published_at: new Date().toISOString(),
      impressions: Math.floor(Math.random() * 10000) + 1000,
      reach: Math.floor(Math.random() * 8000) + 800,
      engagement: {
        likes: Math.floor(Math.random() * 500) + 50,
        comments: Math.floor(Math.random() * 100) + 10,
        shares: Math.floor(Math.random() * 50) + 5,
        saves: Math.floor(Math.random() * 200) + 20,
      },
      clicks: Math.floor(Math.random() * 300) + 30,
      click_through_rate: parseFloat((Math.random() * 3 + 0.5).toFixed(2)),
      engagement_rate: parseFloat((Math.random() * 6 + 2).toFixed(2)),
    };
  }

  /**
   * Mock: List Connected Accounts
   *
   * In production, fetches accounts from workspace.
   */
  async listConnectedAccounts(): Promise<PublerConnectedAccount[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));

    console.log("🔗 [MOCK] Publer.listConnectedAccounts");

    return [
      {
        id: "mock-instagram-account-001",
        platform: "instagram",
        name: "Hot Rod AN",
        username: "@hotrodan",
        avatar: "https://via.placeholder.com/150",
        is_active: true,
        requires_reauth: false,
      },
      {
        id: "mock-facebook-account-001",
        platform: "facebook",
        name: "Hot Rod AN",
        username: "hotrodan",
        is_active: true,
        requires_reauth: false,
      },
      {
        id: "mock-tiktok-account-001",
        platform: "tiktok",
        name: "Hot Rod AN",
        username: "@hotrodan",
        is_active: true,
        requires_reauth: false,
      },
    ];
  }

  /**
   * Mock: Check Job Status
   *
   * In production, polls job status until complete.
   */
  async checkJobStatus(job_id: string): Promise<{
    status: "pending" | "processing" | "completed" | "failed";
    post_id?: string;
    error?: string;
  }> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    console.log("⏳ [MOCK] Publer.checkJobStatus:", { job_id });

    // Simulate successful completion
    return {
      status: "completed",
      post_id: `mock-post-${Date.now()}`,
    };
  }
}

/**
 * Get Publer Client Instance
 *
 * Returns mock client by default.
 * For production, swap to PublerClientLive when OAuth configured.
 */
export function getPublerClient(workspace_id?: string): PublerClientMock {
  if (PUBLER_LIVE_POSTING_ENABLED) {
    throw new Error(
      "PUBLER_LIVE_POSTING_ENABLED=true but PublerClientLive not implemented. " +
        "Configure OAuth credentials first. See docs/integrations/publer-oauth-setup.md",
    );
  }

  return new PublerClientMock(workspace_id);
}

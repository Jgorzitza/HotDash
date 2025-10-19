/**
 * Publer Adapter Stub
 *
 * Mock adapter for Publer social media scheduling API
 * Feature-flagged stub until real API credentials are configured
 *
 * @module app/lib/ads/publer-adapter.stub
 *
 * @see https://publer.com/docs/posting
 * @see https://publer.com/docs/posting/create-posts/publishing-methods
 */

// import type { PublerCampaignPost } from "./types";

/**
 * Feature flag for using real Publer API
 * Set to true once API credentials are configured
 * Controlled by PUBLER_LIVE environment variable
 */
const USE_REAL_PUBLER_API =
  process.env.PUBLER_LIVE === "true" ||
  process.env.FEATURE_ADS_PUBLER_ENABLED === "true";

/**
 * Publer API configuration
 */
interface PublerConfig {
  /** Publer API key (Bearer-API format) */
  apiKey: string;

  /** Workspace ID for scheduling posts */
  workspaceId: string;

  /** Base API URL */
  baseUrl: string;
}

/**
 * Publer post schedule request
 * @see https://publer.com/docs/posting/create-posts/publishing-methods/manual-scheduling
 */
interface PublerScheduleRequest {
  bulk: {
    /** Scheduling mode: scheduled, auto, recycle, draft */
    state:
      | "scheduled"
      | "auto"
      | "recycle"
      | "draft"
      | "draft_public"
      | "draft_private";

    /** Array of up to 500 post objects */
    posts: Array<{
      /** Networks and their post data */
      networks: {
        [network: string]: {
          /** Post type (status, photo, video, poll, link) */
          type: string;

          /** Post text content */
          text: string;

          /** Optional media array */
          media?: Array<{
            id: string;
            name?: string;
            path: string;
            type: string;
            thumbnail?: string;
          }>;

          /** Optional post details */
          details?: Record<string, unknown>;
        };
      };

      /** Target accounts and scheduling */
      accounts: Array<{
        /** Account ID */
        id: string;

        /** ISO 8601 scheduled time (optional for auto) */
        scheduled_at?: string;

        /** Optional labels */
        labels?: string[];
      }>;

      /** Optional recurring config */
      recurring?: {
        start_date: string;
        end_date?: string;
        repeat: "daily" | "weekly" | "monthly";
        days_of_week?: number[];
        repeat_rate?: number;
      };
    }>;
  };
}

/**
 * Publer API response
 */
interface PublerScheduleResponse {
  /** Unique job ID for tracking */
  job_id: string;
}

/**
 * Publer job status response
 */
interface PublerJobStatus {
  /** Job ID */
  id: string;

  /** Job status */
  status: "pending" | "processing" | "completed" | "failed";

  /** Created timestamp */
  created_at: string;

  /** Updated timestamp */
  updated_at: string;

  /** Published post IDs (if completed) */
  post_ids?: string[];

  /** Error message (if failed) */
  error?: string;
}

/**
 * Campaign export format for HITL approval
 */
interface CampaignExportData {
  /** Campaign name */
  campaignName: string;

  /** Post content */
  content: string;

  /** Target social platforms */
  platforms: string[];

  /** Scheduled publish time */
  scheduledTime: string;

  /** Optional media URLs */
  mediaUrls?: string[];

  /** Estimated reach */
  estimatedReach?: number;

  /** Projected metrics */
  projectedMetrics?: {
    impressions: number;
    clicks: number;
    engagement: number;
  };
}

/**
 * Mock Publer configuration (stub mode)
 */
const MOCK_CONFIG: PublerConfig = {
  apiKey: "STUB_API_KEY",
  workspaceId: "STUB_WORKSPACE_ID",
  baseUrl: "https://app.publer.com/api/v1",
};

/**
 * Initialize Publer adapter with configuration
 *
 * @param config - Optional Publer configuration (uses mock in stub mode)
 * @returns Configured Publer adapter
 */
export function createPublerAdapter(config?: Partial<PublerConfig>) {
  const adapterConfig = USE_REAL_PUBLER_API
    ? {
        apiKey: config?.apiKey || process.env.PUBLER_API_KEY || "",
        workspaceId:
          config?.workspaceId || process.env.PUBLER_WORKSPACE_ID || "",
        baseUrl: config?.baseUrl || "https://app.publer.com/api/v1",
      }
    : MOCK_CONFIG;

  /**
   * Schedule a campaign post via Publer
   *
   * @param request - Publer schedule request
   * @returns Schedule response with job ID
   */
  async function scheduleCampaignPost(
    request: PublerScheduleRequest,
  ): Promise<PublerScheduleResponse> {
    if (!USE_REAL_PUBLER_API) {
      // Stub mode: return mock job ID
      return {
        job_id: `mock-job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
    }

    // Real API mode
    const response = await fetch(`${adapterConfig.baseUrl}/posts/schedule`, {
      method: "POST",
      headers: {
        Authorization: `Bearer-API ${adapterConfig.apiKey}`,
        "Publer-Workspace-Id": adapterConfig.workspaceId,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(
        `Publer API error: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  }

  /**
   * Publish a campaign post immediately
   *
   * @param request - Publer schedule request (without scheduled_at)
   * @returns Schedule response with job ID
   */
  async function publishCampaignPostNow(
    request: PublerScheduleRequest,
  ): Promise<PublerScheduleResponse> {
    if (!USE_REAL_PUBLER_API) {
      // Stub mode: return mock job ID
      return {
        job_id: `mock-publish-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
    }

    // Real API mode
    const response = await fetch(
      `${adapterConfig.baseUrl}/posts/schedule/publish`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer-API ${adapterConfig.apiKey}`,
          "Publer-Workspace-Id": adapterConfig.workspaceId,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(request),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Publer API error: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  }

  /**
   * Get job status
   *
   * @param jobId - Job ID from schedule/publish response
   * @returns Job status
   */
  async function getJobStatus(jobId: string): Promise<PublerJobStatus> {
    if (!USE_REAL_PUBLER_API) {
      // Stub mode: return mock completed status
      return {
        id: jobId,
        status: "completed",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        post_ids: [`mock-post-${Math.random().toString(36).substr(2, 9)}`],
      };
    }

    // Real API mode
    const response = await fetch(
      `${adapterConfig.baseUrl}/job_status/${jobId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer-API ${adapterConfig.apiKey}`,
          "Publer-Workspace-Id": adapterConfig.workspaceId,
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Publer API error: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  }

  /**
   * Export campaign plan for HITL approval
   *
   * @param campaignData - Campaign export data
   * @returns Formatted campaign plan with Publer payload
   */
  function exportCampaignPlan(campaignData: CampaignExportData): {
    plan: CampaignExportData;
    publlerPayload: PublerScheduleRequest;
  } {
    // Create Publer payload from campaign data
    const publlerPayload: PublerScheduleRequest = {
      bulk: {
        state: "scheduled",
        posts: [
          {
            networks: Object.fromEntries(
              campaignData.platforms.map((platform) => [
                platform.toLowerCase(),
                {
                  type: "status",
                  text: campaignData.content,
                  ...(campaignData.mediaUrls &&
                    campaignData.mediaUrls.length > 0 && {
                      media: campaignData.mediaUrls.map((url, idx) => ({
                        id: `external-${idx}`,
                        path: url,
                        type: "photo",
                      })),
                    }),
                },
              ]),
            ),
            accounts: campaignData.platforms.map((platform) => ({
              id: `ACCOUNT_ID_${platform.toUpperCase()}`,
              scheduled_at: campaignData.scheduledTime,
            })),
          },
        ],
      },
    };

    return {
      plan: campaignData,
      publlerPayload,
    };
  }

  /**
   * Health check: Verify Publer API connectivity
   *
   * @returns Health status
   */
  async function healthCheck(): Promise<{
    status: "ok" | "error";
    mode: "stub" | "real";
    message: string;
  }> {
    if (!USE_REAL_PUBLER_API) {
      return {
        status: "ok",
        mode: "stub",
        message:
          "Publer adapter running in stub mode (USE_REAL_PUBLER_API=false)",
      };
    }

    try {
      // Real API mode: check if credentials are configured
      if (!adapterConfig.apiKey || !adapterConfig.workspaceId) {
        return {
          status: "error",
          mode: "real",
          message:
            "Missing Publer API credentials (PUBLER_API_KEY or PUBLER_WORKSPACE_ID)",
        };
      }

      return {
        status: "ok",
        mode: "real",
        message: "Publer adapter configured with real API credentials",
      };
    } catch (error) {
      return {
        status: "error",
        mode: "real",
        message: `Publer health check failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  return {
    scheduleCampaignPost,
    publishCampaignPostNow,
    getJobStatus,
    exportCampaignPlan,
    healthCheck,
    config: adapterConfig,
    isStubMode: !USE_REAL_PUBLER_API,
  };
}

/**
 * Default Publer adapter instance (stub mode)
 */
export const publlerAdapter = createPublerAdapter();

/**
 * Mock campaign data for testing
 */
export const MOCK_CAMPAIGN_DATA: CampaignExportData = {
  campaignName: "Summer Sale 2025",
  content: "Check out our amazing summer discounts! 🌞 #SummerSale",
  platforms: ["facebook", "instagram", "twitter"],
  scheduledTime: "2025-06-15T10:00:00Z",
  mediaUrls: ["https://cdn.example.com/summer-sale-banner.jpg"],
  estimatedReach: 50000,
  projectedMetrics: {
    impressions: 75000,
    clicks: 3750,
    engagement: 1500,
  },
};

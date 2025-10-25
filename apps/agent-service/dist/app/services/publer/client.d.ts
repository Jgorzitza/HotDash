/**
 * Publer API Client
 *
 * Features:
 * - OAuth authentication with Bearer-API token
 * - Comprehensive error handling
 * - Exponential backoff retry logic
 * - Rate limiting handling
 * - Type-safe API responses
 *
 * Official API Docs: https://publer.com/docs
 */
import type { PublerConfig, PublerWorkspace, PublerAccount, PublerPost, PublerJobResponse, PublerJobStatus, PublerRetryConfig, PublerRateLimitInfo, PublerAPIResponse } from "./types";
export declare class PublerClient {
    private config;
    private retryConfig;
    private rateLimitInfo?;
    constructor(config: PublerConfig, retryConfig?: Partial<PublerRetryConfig>);
    /**
     * Makes authenticated API request with retry logic
     */
    private request;
    /**
     * Extract rate limit information from response headers
     */
    private extractRateLimitInfo;
    /**
     * Calculate exponential backoff delay
     */
    private calculateBackoffDelay;
    /**
     * Sleep utility for retry delays
     */
    private sleep;
    /**
     * Create standardized error object
     */
    private createError;
    /**
     * List workspaces accessible to the authenticated user
     */
    listWorkspaces(): Promise<PublerAPIResponse<PublerWorkspace[]>>;
    /**
     * List social media accounts in the workspace
     */
    listAccounts(): Promise<PublerAPIResponse<PublerAccount[]>>;
    /**
     * Get account info by ID
     */
    getAccount(accountId: string): Promise<PublerAPIResponse<PublerAccount>>;
    /**
     * Schedule a post to be published
     */
    schedulePost(post: PublerPost): Promise<PublerAPIResponse<PublerJobResponse>>;
    /**
     * Get job status by job ID
     */
    getJobStatus(jobId: string): Promise<PublerAPIResponse<PublerJobStatus>>;
    /**
     * Publish a post immediately (no scheduling)
     */
    publishPost(post: PublerPost): Promise<PublerAPIResponse<PublerJobResponse>>;
    /**
     * Get current rate limit info
     */
    getRateLimitInfo(): PublerRateLimitInfo | undefined;
    /**
     * Check if rate limit is approaching
     */
    isRateLimitApproaching(): boolean;
}
/**
 * Factory function to create Publer client from environment variables
 */
export declare function createPublerClient(config?: Partial<PublerConfig>, retryConfig?: Partial<PublerRetryConfig>): PublerClient;
//# sourceMappingURL=client.d.ts.map
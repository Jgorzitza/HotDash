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

import type {
  PublerConfig,
  PublerWorkspace,
  PublerAccount,
  PublerPost,
  PublerJobResponse,
  PublerJobStatus,
  PublerError,
  PublerRetryConfig,
  PublerRateLimitInfo,
  PublerAPIResponse,
} from './types';

const DEFAULT_BASE_URL = 'https://app.publer.com/api/v1';

const DEFAULT_RETRY_CONFIG: PublerRetryConfig = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
};

export class PublerClient {
  private config: PublerConfig;
  private retryConfig: PublerRetryConfig;
  private rateLimitInfo?: PublerRateLimitInfo;

  constructor(config: PublerConfig, retryConfig?: Partial<PublerRetryConfig>) {
    this.config = {
      ...config,
      baseUrl: config.baseUrl || DEFAULT_BASE_URL,
    };
    this.retryConfig = {
      ...DEFAULT_RETRY_CONFIG,
      ...retryConfig,
    };
  }

  /**
   * Makes authenticated API request with retry logic
   */
  private async request<T>(
    path: string,
    options: RequestInit = {},
    retryCount = 0,
  ): Promise<PublerAPIResponse<T>> {
    const url = `${this.config.baseUrl}/${path}`;
    const headers = {
      'Authorization': `Bearer-API ${this.config.apiKey}`,
      'Publer-Workspace-Id': this.config.workspaceId,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Extract rate limit info from headers
      this.extractRateLimitInfo(response.headers);

      // Handle rate limiting (429)
      if (response.status === 429) {
        if (retryCount < this.retryConfig.maxRetries) {
          const delay = this.calculateBackoffDelay(retryCount);
          console.warn(`[Publer] Rate limited. Retrying in ${delay}ms (attempt ${retryCount + 1}/${this.retryConfig.maxRetries})`);
          await this.sleep(delay);
          return this.request<T>(path, options, retryCount + 1);
        }
        throw this.createError('RATE_LIMIT_EXCEEDED', 'Rate limit exceeded', 429, response);
      }

      // Handle server errors (500-599) with retry
      if (response.status >= 500 && response.status < 600) {
        if (retryCount < this.retryConfig.maxRetries) {
          const delay = this.calculateBackoffDelay(retryCount);
          console.warn(`[Publer] Server error ${response.status}. Retrying in ${delay}ms (attempt ${retryCount + 1}/${this.retryConfig.maxRetries})`);
          await this.sleep(delay);
          return this.request<T>(path, options, retryCount + 1);
        }
        const errorText = await response.text();
        throw this.createError('SERVER_ERROR', `Server error: ${errorText}`, response.status, response);
      }

      // Handle client errors (400-499)
      if (response.status >= 400 && response.status < 500) {
        const errorText = await response.text();
        throw this.createError('CLIENT_ERROR', errorText || 'Client error', response.status, response);
      }

      // Success response
      const data = await response.json() as T;
      return {
        success: true,
        data,
        rateLimitInfo: this.rateLimitInfo,
      };
    } catch (error) {
      if (error instanceof PublerError) {
        return {
          success: false,
          error: error as PublerError,
          rateLimitInfo: this.rateLimitInfo,
        };
      }

      // Network error or unexpected error - retry
      if (retryCount < this.retryConfig.maxRetries) {
        const delay = this.calculateBackoffDelay(retryCount);
        console.warn(`[Publer] Network error. Retrying in ${delay}ms (attempt ${retryCount + 1}/${this.retryConfig.maxRetries})`, error);
        await this.sleep(delay);
        return this.request<T>(path, options, retryCount + 1);
      }

      const networkError: PublerError = {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Unknown network error',
        status: 0,
        details: error,
      };
      return {
        success: false,
        error: networkError,
      };
    }
  }

  /**
   * Extract rate limit information from response headers
   */
  private extractRateLimitInfo(headers: Headers): void {
    const limit = headers.get('X-RateLimit-Limit');
    const remaining = headers.get('X-RateLimit-Remaining');
    const reset = headers.get('X-RateLimit-Reset');

    if (limit && remaining && reset) {
      this.rateLimitInfo = {
        limit: parseInt(limit, 10),
        remaining: parseInt(remaining, 10),
        reset: parseInt(reset, 10),
      };
    }
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateBackoffDelay(retryCount: number): number {
    const delay = this.retryConfig.initialDelay * Math.pow(this.retryConfig.backoffMultiplier, retryCount);
    return Math.min(delay, this.retryConfig.maxDelay);
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create standardized error object
   */
  private createError(code: string, message: string, status: number, response?: Response): PublerError {
    return {
      code,
      message,
      status,
      details: response ? {
        url: response.url,
        statusText: response.statusText,
      } : undefined,
    };
  }

  /**
   * List workspaces accessible to the authenticated user
   */
  async listWorkspaces(): Promise<PublerAPIResponse<PublerWorkspace[]>> {
    return this.request<PublerWorkspace[]>('workspaces', {
      method: 'GET',
    });
  }

  /**
   * List social media accounts in the workspace
   */
  async listAccounts(): Promise<PublerAPIResponse<PublerAccount[]>> {
    return this.request<PublerAccount[]>('accounts', {
      method: 'GET',
    });
  }

  /**
   * Get account info by ID
   */
  async getAccount(accountId: string): Promise<PublerAPIResponse<PublerAccount>> {
    return this.request<PublerAccount>(`accounts/${encodeURIComponent(accountId)}`, {
      method: 'GET',
    });
  }

  /**
   * Schedule a post to be published
   */
  async schedulePost(post: PublerPost): Promise<PublerAPIResponse<PublerJobResponse>> {
    const body = {
      bulk: {
        state: 'scheduled',
        posts: [
          {
            networks: {},
            text: post.text,
            accounts: post.accountIds.map((id) => ({
              id,
              scheduled_at: post.scheduledAt || null,
            })),
            media: post.media || [],
          },
        ],
      },
    };

    return this.request<PublerJobResponse>('posts/schedule', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * Get job status by job ID
   */
  async getJobStatus(jobId: string): Promise<PublerAPIResponse<PublerJobStatus>> {
    return this.request<PublerJobStatus>(`job_status/${encodeURIComponent(jobId)}`, {
      method: 'GET',
    });
  }

  /**
   * Publish a post immediately (no scheduling)
   */
  async publishPost(post: PublerPost): Promise<PublerAPIResponse<PublerJobResponse>> {
    const body = {
      bulk: {
        state: 'published',
        posts: [
          {
            networks: {},
            text: post.text,
            accounts: post.accountIds.map((id) => ({ id })),
            media: post.media || [],
          },
        ],
      },
    };

    return this.request<PublerJobResponse>('posts/publish', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * Get current rate limit info
   */
  getRateLimitInfo(): PublerRateLimitInfo | undefined {
    return this.rateLimitInfo;
  }

  /**
   * Check if rate limit is approaching
   */
  isRateLimitApproaching(): boolean {
    if (!this.rateLimitInfo) return false;
    const remaining = this.rateLimitInfo.remaining;
    const limit = this.rateLimitInfo.limit;
    return remaining / limit < 0.2; // Less than 20% remaining
  }
}

/**
 * Factory function to create Publer client from environment variables
 */
export function createPublerClient(
  config?: Partial<PublerConfig>,
  retryConfig?: Partial<PublerRetryConfig>,
): PublerClient {
  const apiKey = config?.apiKey || process.env.PUBLER_API_KEY;
  const workspaceId = config?.workspaceId || process.env.PUBLER_WORKSPACE_ID;

  if (!apiKey) {
    throw new Error('PUBLER_API_KEY is required');
  }

  if (!workspaceId) {
    throw new Error('PUBLER_WORKSPACE_ID is required');
  }

  return new PublerClient(
    {
      apiKey,
      workspaceId,
      baseUrl: config?.baseUrl,
    },
    retryConfig,
  );
}

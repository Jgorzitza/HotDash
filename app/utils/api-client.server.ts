/**
 * Standardized API client with retry logic and error handling
 */

interface ApiClientOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
  timeout?: number;
}

export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;
  private retries: number;
  private retryDelay: number;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl || "";
    this.defaultHeaders = options.headers || {};
    this.timeout = options.timeout || 30000; // 30s default
    this.retries = options.retries || 2;
    this.retryDelay = options.retryDelay || 1000; // 1s default
  }

  /**
   * Make a GET request
   */
  async get<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  /**
   * Make a POST request
   */
  async post<T>(path: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Make a PUT request
   */
  async put<T>(path: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }

  /**
   * Make a request with retry logic
   */
  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = this.buildUrl(path, options.params);
    const headers = { ...this.defaultHeaders, ...options.headers };

    // Add Content-Type for POST/PUT if not specified
    if ((options.method === "POST" || options.method === "PUT") && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options.timeout || this.timeout);

        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data as T;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on client errors (4xx)
        if (lastError.message.includes("HTTP 4")) {
          throw lastError;
        }

        // Retry on timeout or server errors
        if (attempt < this.retries) {
          await this.delay(this.retryDelay * (attempt + 1));
          continue;
        }
      }
    }

    throw lastError || new Error("Request failed");
  }

  /**
   * Build full URL with query parameters
   */
  private buildUrl(path: string, params?: Record<string, string>): string {
    const url = this.baseUrl + path;

    if (!params) return url;

    const searchParams = new URLSearchParams(params);
    return `${url}?${searchParams.toString()}`;
  }

  /**
   * Delay helper for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Create a Chatwoot API client
 */
export function createChatwootClient(apiToken: string, baseUrl: string): ApiClient {
  return new ApiClient({
    baseUrl,
    headers: {
      "api-access-token": apiToken,
    },
  });
}

/**
 * Create a Google Analytics API client
 */
export function createGAClient(accessToken: string): ApiClient {
  return new ApiClient({
    baseUrl: "https://analyticsdata.googleapis.com/v1beta",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

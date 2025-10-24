/**
 * Publer API Type Definitions
 *
 * Official API Docs: https://publer.com/docs
 * Authentication: Bearer-API token + Workspace-ID header
 */
export interface PublerConfig {
    apiKey: string;
    workspaceId: string;
    baseUrl?: string;
}
export interface PublerWorkspace {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
}
export interface PublerAccount {
    id: string;
    name: string;
    username?: string;
    platform: "facebook" | "twitter" | "instagram" | "linkedin" | "pinterest" | "tiktok" | "youtube";
    avatar_url?: string;
    is_active: boolean;
}
export interface PublerPost {
    text: string;
    accountIds: string[];
    scheduledAt?: string;
    media?: PublerMedia[];
}
export interface PublerMedia {
    url: string;
    type: "image" | "video";
    alt_text?: string;
}
export interface PublerJobResponse {
    job_id: string;
    status: "pending" | "processing" | "complete" | "failed";
    created_at: string;
}
export interface PublerJobStatus {
    job_id: string;
    status: "pending" | "processing" | "complete" | "failed";
    progress: number;
    error?: string;
    posts?: PublerPostResult[];
}
export interface PublerPostResult {
    post_id: string;
    account_id: string;
    platform: string;
    url?: string;
    published_at?: string;
    error?: string;
}
export interface PublerError {
    code: string;
    message: string;
    status: number;
    details?: unknown;
}
export interface PublerRetryConfig {
    maxRetries: number;
    initialDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
}
export interface PublerRateLimitInfo {
    limit: number;
    remaining: number;
    reset: number;
}
export interface PublerAPIResponse<T> {
    success: boolean;
    data?: T;
    error?: PublerError;
    rateLimitInfo?: PublerRateLimitInfo;
}
//# sourceMappingURL=types.d.ts.map
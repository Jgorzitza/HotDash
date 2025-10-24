/**
 * Publer Webhook Handler
 *
 * Handles webhooks from Publer for job status updates
 * Verifies HMAC-SHA256 signatures
 * Updates approval status and stores post URLs
 */
export interface PublerWebhookPayload {
    event: "job.completed" | "job.failed" | "job.started" | "job.progress";
    job_id: string;
    status: "pending" | "processing" | "complete" | "failed";
    progress?: number;
    posts?: Array<{
        post_id: string;
        account_id: string;
        platform: string;
        url?: string;
        published_at?: string;
        error?: string;
    }>;
    timestamp: string;
}
export interface WebhookVerificationResult {
    valid: boolean;
    error?: string;
}
export interface WebhookProcessingResult {
    success: boolean;
    jobId?: string;
    approvalId?: string;
    postUrls?: string[];
    error?: string;
}
/**
 * Verify Publer webhook signature using HMAC-SHA256
 *
 * @param payload - Raw webhook payload body
 * @param signature - Signature from X-Publer-Signature header
 * @param secret - Webhook secret (from environment)
 * @returns Verification result
 */
export declare function verifyWebhookSignature(payload: string, signature: string, secret: string): WebhookVerificationResult;
/**
 * Process Publer webhook event
 *
 * @param payload - Parsed webhook payload
 * @returns Processing result
 */
export declare function processWebhookEvent(payload: PublerWebhookPayload): Promise<WebhookProcessingResult>;
/**
 * Validate webhook payload structure
 */
export declare function validateWebhookPayload(payload: unknown): payload is PublerWebhookPayload;
//# sourceMappingURL=webhooks.d.ts.map
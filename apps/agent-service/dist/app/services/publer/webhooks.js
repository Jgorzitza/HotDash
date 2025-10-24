/**
 * Publer Webhook Handler
 *
 * Handles webhooks from Publer for job status updates
 * Verifies HMAC-SHA256 signatures
 * Updates approval status and stores post URLs
 */
import { createHmac, timingSafeEqual } from "crypto";
/**
 * Verify Publer webhook signature using HMAC-SHA256
 *
 * @param payload - Raw webhook payload body
 * @param signature - Signature from X-Publer-Signature header
 * @param secret - Webhook secret (from environment)
 * @returns Verification result
 */
export function verifyWebhookSignature(payload, signature, secret) {
    try {
        // Remove "sha256=" prefix if present
        const signatureValue = signature.startsWith("sha256=")
            ? signature.substring(7)
            : signature;
        // Calculate expected signature
        const hmac = createHmac("sha256", secret);
        hmac.update(payload);
        const expectedSignature = hmac.digest("hex");
        // Timing-safe comparison to prevent timing attacks
        const signatureBuffer = Buffer.from(signatureValue, "hex");
        const expectedBuffer = Buffer.from(expectedSignature, "hex");
        if (signatureBuffer.length !== expectedBuffer.length) {
            return {
                valid: false,
                error: "Signature length mismatch",
            };
        }
        const isValid = timingSafeEqual(signatureBuffer, expectedBuffer);
        return {
            valid: isValid,
            error: isValid ? undefined : "Invalid signature",
        };
    }
    catch (error) {
        return {
            valid: false,
            error: error instanceof Error ? error.message : "Verification error",
        };
    }
}
/**
 * Process Publer webhook event
 *
 * @param payload - Parsed webhook payload
 * @returns Processing result
 */
export async function processWebhookEvent(payload) {
    try {
        const { event, job_id, status, posts } = payload;
        console.log(`[Publer Webhook] Event: ${event}, Job: ${job_id}, Status: ${status}`);
        // Extract post URLs if available
        const postUrls = posts?.filter((post) => post.url).map((post) => post.url) || [];
        // TODO: Update approval status in database
        // const { data, error } = await supabase
        //   .from('social_posts')
        //   .update({
        //     status: status,
        //     post_urls: postUrls,
        //     updated_at: new Date().toISOString(),
        //   })
        //   .eq('publer_job_id', job_id);
        // TODO: Find and update related approval
        // const approvalUpdate = await supabase
        //   .from('approvals')
        //   .update({
        //     status: status === 'complete' ? 'completed' : status === 'failed' ? 'failed' : 'processing',
        //   })
        //   .eq('id', approvalId);
        return {
            success: true,
            jobId: job_id,
            postUrls,
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}
/**
 * Validate webhook payload structure
 */
export function validateWebhookPayload(payload) {
    if (typeof payload !== "object" || payload === null) {
        return false;
    }
    const p = payload;
    if (typeof p.event !== "string") {
        return false;
    }
    if (typeof p.job_id !== "string") {
        return false;
    }
    if (typeof p.status !== "string") {
        return false;
    }
    return true;
}
//# sourceMappingURL=webhooks.js.map
/**
 * API Route: Publer Webhooks
 *
 * POST /api/webhooks/publer
 *
 * Receives webhook events from Publer
 * Verifies HMAC-SHA256 signature
 * Updates approval and post status
 */
import { verifyWebhookSignature, processWebhookEvent, validateWebhookPayload, } from "~/services/publer/webhooks";
export async function action({ request }) {
    if (request.method !== "POST") {
        return Response.json({ error: "Method not allowed" }, { status: 405 });
    }
    try {
        // Get signature from header
        const signature = request.headers.get("X-Publer-Signature");
        if (!signature) {
            return Response.json({ error: "Missing X-Publer-Signature header" }, { status: 401 });
        }
        // Get webhook secret from environment
        const webhookSecret = process.env.PUBLER_WEBHOOK_SECRET;
        if (!webhookSecret) {
            console.error("[Publer Webhook] PUBLER_WEBHOOK_SECRET not configured");
            return Response.json({ error: "Webhook not configured" }, { status: 500 });
        }
        // Get raw body for signature verification
        const rawBody = await request.text();
        // Verify signature
        const verificationResult = verifyWebhookSignature(rawBody, signature, webhookSecret);
        if (!verificationResult.valid) {
            console.warn("[Publer Webhook] Invalid signature:", verificationResult.error);
            return Response.json({ error: "Invalid signature" }, { status: 401 });
        }
        // Parse payload
        let payload;
        try {
            payload = JSON.parse(rawBody);
        }
        catch (error) {
            return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
        }
        // Validate payload structure
        if (!validateWebhookPayload(payload)) {
            return Response.json({ error: "Invalid payload structure" }, { status: 400 });
        }
        // Process webhook event
        const result = await processWebhookEvent(payload);
        if (!result.success) {
            return Response.json({ error: result.error || "Processing failed" }, { status: 500 });
        }
        // Return success
        return Response.json({
            success: true,
            jobId: result.jobId,
            postUrls: result.postUrls,
        });
    }
    catch (error) {
        console.error("[Publer Webhook] Error:", error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}
export async function loader() {
    return Response.json({ error: "Method not allowed. Use POST for webhooks." }, { status: 405 });
}
//# sourceMappingURL=api.webhooks.publer.js.map
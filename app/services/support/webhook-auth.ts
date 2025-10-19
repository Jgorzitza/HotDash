/**
 * Chatwoot Webhook Signature Verification
 *
 * HMAC-SHA256 signature verification for Chatwoot webhooks
 */

import { createHmac } from "crypto";
import { logger } from "../../utils/logger.server";

/**
 * Verify Chatwoot webhook HMAC-SHA256 signature
 *
 * @param payload - Raw webhook payload string
 * @param signature - Signature from X-Chatwoot-Signature header
 * @returns true if signature is valid or verification disabled
 */
export async function verifyWebhookSignature(
  payload: string,
  signature: string | null,
): Promise<boolean> {
  const webhookSecret = process.env.CHATWOOT_WEBHOOK_SECRET;

  // Skip verification if no secret configured (development mode)
  if (!webhookSecret) {
    logger.debug(
      "[webhook-auth] Signature verification disabled (no secret configured)",
    );
    return true;
  }

  // Require signature when secret is configured
  if (!signature) {
    logger.warn(
      "[webhook-auth] Missing signature header but secret is configured",
    );
    return false;
  }

  try {
    // Generate expected signature
    const expectedSignature = createHmac("sha256", webhookSecret)
      .update(payload)
      .digest("hex");

    // Constant-time comparison to prevent timing attacks
    const isValid = signature === expectedSignature;

    if (!isValid) {
      logger.error("[webhook-auth] Signature mismatch", {
        receivedLength: signature.length,
        expectedLength: expectedSignature.length,
      });
    }

    return isValid;
  } catch (error) {
    logger.error("[webhook-auth] Signature verification error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

/**
 * Generate HMAC-SHA256 signature for testing
 *
 * @param payload - Payload to sign
 * @param secret - Secret key
 * @returns HMAC-SHA256 hex signature
 */
export function generateWebhookSignature(
  payload: string,
  secret: string,
): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

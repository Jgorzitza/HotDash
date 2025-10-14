import { createHmac, timingSafeEqual } from 'crypto';
import db from '../../db.server';

/**
 * Webhook Security Middleware
 *
 * Provides comprehensive security for webhook endpoints including:
 * - HMAC signature validation
 * - Idempotency key handling (prevents duplicate processing)
 * - Replay attack protection (timestamp validation)
 *
 * @module services/webhooks/security.server
 *
 * ## Usage
 *
 * ```typescript
 * export const action: ActionFunction = async ({ request }) => {
 *   const security = createWebhookSecurity({
 *     source: 'shopify',
 *     secret: process.env.SHOPIFY_API_SECRET!,
 *   });
 *
 *   const validation = await security.validate(request);
 *   if (!validation.valid) {
 *     return new Response(validation.error, { status: validation.status });
 *   }
 *
 *   // Process webhook safely...
 * };
 * ```
 */

export interface WebhookSecurityConfig {
  /** Webhook source (shopify, chatwoot, etc.) */
  source: 'shopify' | 'chatwoot' | 'stripe' | 'sendgrid' | 'other';
  /** Secret key for HMAC validation */
  secret: string;
  /** Signature header name (default: X-Shopify-Hmac-SHA256) */
  signatureHeader?: string;
  /** Timestamp header name for replay protection */
  timestampHeader?: string;
  /** Max age for webhooks in seconds (default: 300 = 5 minutes) */
  maxAgeSeconds?: number;
  /** HMAC algorithm (default: sha256) */
  algorithm?: 'sha256' | 'sha1';
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  status?: number;
  idempotencyKey?: string;
}

interface ProcessedWebhook {
  id: string;
  source: string;
  idempotencyKey: string;
  processedAt: Date;
  expiresAt: Date;
}

/**
 * Create webhook security validator
 */
export function createWebhookSecurity(config: WebhookSecurityConfig) {
  const {
    source,
    secret,
    signatureHeader = getDefaultSignatureHeader(source),
    timestampHeader = getDefaultTimestampHeader(source),
    maxAgeSeconds = 300, // 5 minutes
    algorithm = 'sha256',
  } = config;

  if (!secret) {
    throw new Error(`Webhook secret required for source: ${source}`);
  }

  /**
   * Validate webhook request
   * - Checks HMAC signature
   * - Validates timestamp (replay protection)
   * - Checks idempotency (prevents duplicate processing)
   */
  async function validate(request: Request): Promise<ValidationResult> {
    // Get raw body (needed for signature verification)
    const rawBody = await request.text();
    const headers = request.headers;

    // 1. HMAC Signature Validation
    const signature = headers.get(signatureHeader);
    if (!signature) {
      return {
        valid: false,
        error: `Missing signature header: ${signatureHeader}`,
        status: 401,
      };
    }

    const isValidSignature = verifyHmac(rawBody, signature, secret, algorithm);
    if (!isValidSignature) {
      console.error(`[Webhook Security] Invalid HMAC signature for ${source}`);
      return {
        valid: false,
        error: 'Invalid signature',
        status: 401,
      };
    }

    // 2. Replay Protection (timestamp validation)
    const timestamp = headers.get(timestampHeader);
    if (timestamp) {
      const isValidTimestamp = validateTimestamp(timestamp, maxAgeSeconds);
      if (!isValidTimestamp) {
        console.error(`[Webhook Security] Timestamp validation failed for ${source}`);
        return {
          valid: false,
          error: 'Webhook too old or timestamp invalid',
          status: 401,
        };
      }
    }

    // 3. Idempotency Check
    const idempotencyKey = extractIdempotencyKey(headers, rawBody, source);
    const alreadyProcessed = await checkIdempotency(source, idempotencyKey);
    if (alreadyProcessed) {
      console.log(
        `[Webhook Security] Duplicate webhook detected: ${source}/${idempotencyKey}`
      );
      return {
        valid: false,
        error: 'Webhook already processed',
        status: 200, // Return 200 to prevent retries
      };
    }

    return {
      valid: true,
      idempotencyKey,
    };
  }

  /**
   * Mark webhook as processed (for idempotency)
   */
  async function markProcessed(idempotencyKey: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Keep for 7 days

    try {
      await db.processedWebhook.create({
        data: {
          source,
          idempotencyKey,
          processedAt: new Date(),
          expiresAt,
        },
      });
    } catch (error: any) {
      // Ignore duplicate key errors (race condition)
      if (error.code !== 'P2002') {
        console.error('[Webhook Security] Failed to mark webhook as processed:', error);
      }
    }
  }

  return {
    validate,
    markProcessed,
  };
}

/**
 * Verify HMAC signature using timing-safe comparison
 */
function verifyHmac(
  payload: string,
  signature: string,
  secret: string,
  algorithm: 'sha256' | 'sha1'
): boolean {
  const expectedSignature = createHmac(algorithm, secret)
    .update(payload)
    .digest('base64');

  // Also try hex encoding (some providers use hex)
  const expectedSignatureHex = createHmac(algorithm, secret)
    .update(payload)
    .digest('hex');

  try {
    // Timing-safe comparison to prevent timing attacks
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);
    const expectedHexBuffer = Buffer.from(expectedSignatureHex);

    // Try both base64 and hex
    if (signatureBuffer.length === expectedBuffer.length) {
      return timingSafeEqual(signatureBuffer, expectedBuffer);
    } else if (signatureBuffer.length === expectedHexBuffer.length) {
      return timingSafeEqual(signatureBuffer, expectedHexBuffer);
    }

    return false;
  } catch {
    // Buffer lengths don't match, not equal
    return false;
  }
}

/**
 * Validate webhook timestamp for replay protection
 */
function validateTimestamp(timestamp: string, maxAgeSeconds: number): boolean {
  try {
    const webhookTime = parseInt(timestamp, 10);
    if (isNaN(webhookTime)) {
      return false;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const age = currentTime - webhookTime;

    // Check if webhook is within acceptable age
    return age >= 0 && age <= maxAgeSeconds;
  } catch {
    return false;
  }
}

/**
 * Extract idempotency key from webhook
 */
function extractIdempotencyKey(
  headers: Headers,
  body: string,
  source: string
): string {
  // Try to get idempotency key from header
  const headerKey = headers.get('X-Webhook-Id') || headers.get('X-Request-Id');
  if (headerKey) {
    return `${source}:${headerKey}`;
  }

  // For Shopify, use X-Shopify-Webhook-Id
  if (source === 'shopify') {
    const shopifyId = headers.get('X-Shopify-Webhook-Id');
    if (shopifyId) {
      return `shopify:${shopifyId}`;
    }
  }

  // Fallback: hash the body (not ideal but better than nothing)
  const bodyHash = createHmac('sha256', 'idempotency-fallback')
    .update(body)
    .digest('hex')
    .slice(0, 32);

  return `${source}:hash:${bodyHash}`;
}

/**
 * Check if webhook was already processed
 */
async function checkIdempotency(
  source: string,
  idempotencyKey: string
): Promise<boolean> {
  try {
    const existing = await db.processedWebhook.findUnique({
      where: {
        source_idempotencyKey: {
          source,
          idempotencyKey,
        },
      },
    });

    return existing !== null;
  } catch (error) {
    console.error('[Webhook Security] Idempotency check failed:', error);
    // Fail open (allow processing) if check fails
    return false;
  }
}

/**
 * Get default signature header for webhook source
 */
function getDefaultSignatureHeader(source: string): string {
  const defaults: Record<string, string> = {
    shopify: 'X-Shopify-Hmac-SHA256',
    chatwoot: 'X-Chatwoot-Signature',
    stripe: 'Stripe-Signature',
    sendgrid: 'X-Twilio-Email-Event-Webhook-Signature',
  };

  return defaults[source] || 'X-Webhook-Signature';
}

/**
 * Get default timestamp header for webhook source
 */
function getDefaultTimestampHeader(source: string): string {
  const defaults: Record<string, string> = {
    shopify: 'X-Shopify-Webhook-Timestamp',
    stripe: 'X-Stripe-Webhook-Timestamp',
  };

  return defaults[source] || 'X-Webhook-Timestamp';
}

/**
 * Cleanup expired processed webhooks (call periodically)
 */
export async function cleanupExpiredWebhooks(): Promise<number> {
  try {
    const result = await db.processedWebhook.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    console.log(`[Webhook Security] Cleaned up ${result.count} expired webhooks`);
    return result.count;
  } catch (error) {
    console.error('[Webhook Security] Cleanup failed:', error);
    return 0;
  }
}


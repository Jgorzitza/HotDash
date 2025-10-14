import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * HMAC Validation Middleware
 * 
 * Validates webhook signatures to prevent spoofing and replay attacks.
 * Implements HMAC-SHA256 validation with timestamp verification.
 * 
 * Usage:
 * app.post('/webhooks/chatwoot', hmacValidation('CHATWOOT_WEBHOOK_SECRET'), handler);
 */

interface HMACValidationOptions {
  algorithm?: string;
  header?: string;
  timestampHeader?: string;
  timestampTolerance?: number; // seconds
  nonceStore?: Set<string>; // For replay protection
}

const defaultOptions: HMACValidationOptions = {
  algorithm: 'sha256',
  header: 'x-webhook-signature',
  timestampHeader: 'x-webhook-timestamp',
  timestampTolerance: 300, // 5 minutes
  nonceStore: new Set(),
};

/**
 * Create HMAC validation middleware
 * @param secretEnvVar - Environment variable name containing the webhook secret
 * @param options - Optional configuration
 */
export function hmacValidation(
  secretEnvVar: string,
  options: HMACValidationOptions = {}
) {
  const opts = { ...defaultOptions, ...options };
  
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get secret from environment
      const secret = process.env[secretEnvVar];
      if (!secret) {
        console.error(`[HMAC] Missing secret: ${secretEnvVar}`);
        return res.status(500).json({ error: 'Webhook validation not configured' });
      }
      
      // Get signature from headers
      const signature = req.headers[opts.header!] as string;
      if (!signature) {
        console.warn('[HMAC] Missing signature header');
        return res.status(401).json({ error: 'Missing signature' });
      }
      
      // Get timestamp (for replay protection)
      const timestamp = req.headers[opts.timestampHeader!] as string;
      if (timestamp) {
        const requestTime = parseInt(timestamp, 10);
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (Math.abs(currentTime - requestTime) > opts.timestampTolerance!) {
          console.warn('[HMAC] Request timestamp outside tolerance');
          return res.status(401).json({ error: 'Request expired' });
        }
      }
      
      // Get raw body for signature verification
      const rawBody = JSON.stringify(req.body);
      
      // Compute expected signature
      const hmac = crypto
        .createHmac(opts.algorithm!, secret)
        .update(rawBody)
        .digest('hex');
      
      // Compare signatures (timing-safe)
      const expected = Buffer.from(hmac, 'utf8');
      const actual = Buffer.from(signature, 'utf8');
      
      if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) {
        console.warn('[HMAC] Signature mismatch');
        return res.status(401).json({ error: 'Invalid signature' });
      }
      
      // Replay protection (if nonce provided)
      const nonce = req.headers['x-webhook-nonce'] as string;
      if (nonce && opts.nonceStore) {
        if (opts.nonceStore.has(nonce)) {
          console.warn('[HMAC] Duplicate nonce detected (replay attack)');
          return res.status(401).json({ error: 'Duplicate request' });
        }
        opts.nonceStore.add(nonce);
        
        // Clean up old nonces (optional: implement TTL)
        if (opts.nonceStore.size > 10000) {
          opts.nonceStore.clear();
        }
      }
      
      // Signature valid
      console.log('[HMAC] Signature validated successfully');
      next();
      
    } catch (err) {
      console.error('[HMAC] Validation error:', err);
      return res.status(500).json({ error: 'Validation failed' });
    }
  };
}

/**
 * Chatwoot-specific HMAC validation
 * Validates Chatwoot webhook signatures using their format
 */
export function chatwootHMACValidation() {
  return hmacValidation('CHATWOOT_WEBHOOK_SECRET', {
    header: 'x-chatwoot-signature',
    algorithm: 'sha256',
  });
}

/**
 * Shopify-specific HMAC validation
 * Validates Shopify webhook signatures using their format
 */
export function shopifyHMACValidation() {
  return hmacValidation('SHOPIFY_WEBHOOK_SECRET', {
    header: 'x-shopify-hmac-sha256',
    algorithm: 'sha256',
  });
}

/**
 * Generic webhook HMAC validation
 * For custom webhooks or testing
 */
export function genericHMACValidation(secretEnvVar: string) {
  return hmacValidation(secretEnvVar, {
    header: 'x-webhook-signature',
    timestampHeader: 'x-webhook-timestamp',
    timestampTolerance: 300,
  });
}

/**
 * Rate limiting middleware (basic implementation)
 * Prevents webhook spam/DoS
 */
interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const rateLimitStore: RateLimitStore = {};

export function webhookRateLimit(
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    
    if (!rateLimitStore[ip]) {
      rateLimitStore[ip] = { count: 1, resetTime: now + windowMs };
      return next();
    }
    
    const record = rateLimitStore[ip];
    
    if (now > record.resetTime) {
      // Reset window
      record.count = 1;
      record.resetTime = now + windowMs;
      return next();
    }
    
    if (record.count >= maxRequests) {
      console.warn(`[RateLimit] IP ${ip} exceeded limit`);
      return res.status(429).json({ error: 'Too many requests' });
    }
    
    record.count++;
    next();
  };
}

/**
 * IP allowlist middleware
 * Only allow webhooks from specific IPs
 */
export function ipAllowlist(allowedIPs: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress;
    
    if (!ip || !allowedIPs.includes(ip)) {
      console.warn(`[IPAllowlist] Blocked IP: ${ip}`);
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    next();
  };
}


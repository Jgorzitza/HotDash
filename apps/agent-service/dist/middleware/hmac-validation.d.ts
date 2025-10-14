import { Request, Response, NextFunction } from 'express';
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
    timestampTolerance?: number;
    nonceStore?: Set<string>;
}
/**
 * Create HMAC validation middleware
 * @param secretEnvVar - Environment variable name containing the webhook secret
 * @param options - Optional configuration
 */
export declare function hmacValidation(secretEnvVar: string, options?: HMACValidationOptions): (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Chatwoot-specific HMAC validation
 * Validates Chatwoot webhook signatures using their format
 */
export declare function chatwootHMACValidation(): (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Shopify-specific HMAC validation
 * Validates Shopify webhook signatures using their format
 */
export declare function shopifyHMACValidation(): (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Generic webhook HMAC validation
 * For custom webhooks or testing
 */
export declare function genericHMACValidation(secretEnvVar: string): (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare function webhookRateLimit(maxRequests?: number, windowMs?: number): (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
/**
 * IP allowlist middleware
 * Only allow webhooks from specific IPs
 */
export declare function ipAllowlist(allowedIPs: string[]): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export {};
//# sourceMappingURL=hmac-validation.d.ts.map
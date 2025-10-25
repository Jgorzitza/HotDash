/**
 * Validation utilities for common data validation patterns
 */
/**
 * Validate email format
 */
export declare function isValidEmail(email: string): boolean;
/**
 * Validate Shopify GID format
 */
export declare function isValidShopifyGid(gid: string, resourceType?: string): boolean;
/**
 * Extract numeric ID from Shopify GID
 */
export declare function extractIdFromGid(gid: string): string | null;
/**
 * Validate URL format
 */
export declare function isValidUrl(url: string): boolean;
/**
 * Sanitize user input (remove potential XSS)
 */
export declare function sanitizeInput(input: string): string;
/**
 * Validate positive number
 */
export declare function isPositiveNumber(value: any): value is number;
/**
 * Validate integer
 */
export declare function isInteger(value: any): value is number;
/**
 * Clamp number to range
 */
export declare function clamp(value: number, min: number, max: number): number;
//# sourceMappingURL=validation.server.d.ts.map
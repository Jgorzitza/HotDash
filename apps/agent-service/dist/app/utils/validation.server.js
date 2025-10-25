/**
 * Validation utilities for common data validation patterns
 */
/**
 * Validate email format
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
/**
 * Validate Shopify GID format
 */
export function isValidShopifyGid(gid, resourceType) {
    const gidRegex = /^gid:\/\/shopify\/\w+\/\d+$/;
    if (!gidRegex.test(gid))
        return false;
    if (resourceType) {
        return gid.includes(`gid://shopify/${resourceType}/`);
    }
    return true;
}
/**
 * Extract numeric ID from Shopify GID
 */
export function extractIdFromGid(gid) {
    const match = gid.match(/gid:\/\/shopify\/\w+\/(\d+)$/);
    return match ? match[1] : null;
}
/**
 * Validate URL format
 */
export function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Sanitize user input (remove potential XSS)
 */
export function sanitizeInput(input) {
    return input
        .replace(/[<>]/g, "") // Remove angle brackets
        .trim();
}
/**
 * Validate positive number
 */
export function isPositiveNumber(value) {
    return typeof value === "number" && value > 0 && isFinite(value);
}
/**
 * Validate integer
 */
export function isInteger(value) {
    return typeof value === "number" && Number.isInteger(value);
}
/**
 * Clamp number to range
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
//# sourceMappingURL=validation.server.js.map
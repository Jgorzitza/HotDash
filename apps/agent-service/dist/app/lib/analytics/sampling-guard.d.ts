/**
 * GA4 Sampling Detection and Guard
 *
 * Detects when Google Analytics 4 data is sampled and enforces
 * unsampled data requirements for critical metrics.
 */
/**
 * Check if error indicates GA4 sampling
 */
export declare function isSamplingError(error: any): boolean;
/**
 * Validate that GA4 response is not sampled
 */
export declare function validateUnsampled(response: any): void;
//# sourceMappingURL=sampling-guard.d.ts.map
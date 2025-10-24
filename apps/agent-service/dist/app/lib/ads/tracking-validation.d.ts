/**
 * Ad Tracking Validation Library
 *
 * ADS-007: Validates UTM parameters, conversion tracking, and data accuracy
 * Ensures all ad tracking is working correctly across platforms
 */
/**
 * UTM Parameter Structure
 */
export interface UTMParameters {
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
    utm_term?: string;
    utm_content?: string;
}
/**
 * Validation Result
 */
export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
/**
 * Conversion Event
 */
export interface ConversionEvent {
    eventId: string;
    campaignId: string;
    timestamp: string;
    value: number;
    currency: string;
    utmParams: UTMParameters;
    conversionType: 'purchase' | 'signup' | 'lead' | 'add_to_cart';
}
/**
 * Tracking Pixel Data
 */
export interface TrackingPixelData {
    pixelId: string;
    platform: 'google' | 'facebook' | 'tiktok' | 'linkedin';
    eventType: string;
    eventData: Record<string, any>;
    timestamp: string;
}
/**
 * Validate UTM parameters
 *
 * @param params - UTM parameters to validate
 * @returns Validation result
 */
export declare function validateUTMParameters(params: Partial<UTMParameters>): ValidationResult;
/**
 * Parse UTM parameters from URL
 *
 * @param url - URL to parse
 * @returns UTM parameters or null if none found
 */
export declare function parseUTMFromURL(url: string): Partial<UTMParameters> | null;
/**
 * Build URL with UTM parameters
 *
 * @param baseUrl - Base URL
 * @param params - UTM parameters to add
 * @returns URL with UTM parameters
 */
export declare function buildURLWithUTM(baseUrl: string, params: UTMParameters): string;
/**
 * Validate conversion event data
 *
 * @param event - Conversion event to validate
 * @returns Validation result
 */
export declare function validateConversionEvent(event: Partial<ConversionEvent>): ValidationResult;
/**
 * Validate tracking pixel data
 *
 * @param pixelData - Tracking pixel data to validate
 * @returns Validation result
 */
export declare function validateTrackingPixel(pixelData: Partial<TrackingPixelData>): ValidationResult;
/**
 * Calculate ROAS and validate against expected value
 *
 * @param revenue - Revenue in cents
 * @param spend - Spend in cents
 * @param expectedROAS - Expected ROAS (optional)
 * @param tolerance - Tolerance percentage (default: 10%)
 * @returns Validation result with ROAS calculation
 */
export declare function validateROASCalculation(revenue: number, spend: number, expectedROAS?: number, tolerance?: number): ValidationResult & {
    calculatedROAS: number | null;
};
/**
 * Test UTM parameter tracking end-to-end
 *
 * @param testURL - URL to test
 * @param expectedParams - Expected UTM parameters
 * @returns Validation result
 */
export declare function testUTMTracking(testURL: string, expectedParams: UTMParameters): ValidationResult;
//# sourceMappingURL=tracking-validation.d.ts.map
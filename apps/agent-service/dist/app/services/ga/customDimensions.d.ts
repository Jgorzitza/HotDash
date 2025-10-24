/**
 * GA4 Custom Dimensions Service
 *
 * Manages custom dimensions for Growth Engine action attribution.
 * ANALYTICS-100: GA4 Custom Dimension Setup (hd_action_key)
 *
 * Features:
 * - Create custom dimensions via GA4 Admin API
 * - Validate dimension configuration
 * - Test dimension tracking
 * - Documentation generation
 */
export interface CustomDimensionConfig {
    parameterName: string;
    displayName: string;
    description: string;
    scope: "EVENT" | "USER" | "ITEM";
    disallowAdsPersonalization?: boolean;
}
export interface CustomDimensionResult {
    name: string;
    parameterName: string;
    displayName: string;
    description: string;
    scope: string;
    active: boolean;
    created: boolean;
}
/**
 * Create GA4 custom dimension for action attribution
 *
 * ANALYTICS-100: Creates hd_action_key custom dimension (event scope)
 * for tracking Growth Engine action attribution.
 *
 * @param config - Custom dimension configuration
 * @returns Promise<CustomDimensionResult>
 */
export declare function createActionAttributionDimension(config: CustomDimensionConfig): Promise<CustomDimensionResult>;
/**
 * Get existing custom dimensions for a property
 *
 * @param propertyId - GA4 property ID
 * @returns Promise<CustomDimensionResult[]>
 */
export declare function listCustomDimensions(propertyId: string): Promise<CustomDimensionResult[]>;
/**
 * Validate that hd_action_key custom dimension exists and is configured correctly
 *
 * ANALYTICS-100: Validation for action attribution setup
 *
 * @param propertyId - GA4 property ID
 * @returns Promise<boolean>
 */
export declare function validateActionAttributionDimension(propertyId: string): Promise<boolean>;
/**
 * Create the standard action attribution dimension configuration
 *
 * ANALYTICS-100: Standard configuration for hd_action_key
 */
export declare function getActionAttributionConfig(): CustomDimensionConfig;
/**
 * Test custom dimension tracking
 *
 * ANALYTICS-100: Validates that events with hd_action_key are being tracked
 *
 * @param propertyId - GA4 property ID
 * @param testActionKey - Test action key to send
 * @returns Promise<boolean>
 */
export declare function testActionAttributionTracking(propertyId: string, testActionKey?: string): Promise<boolean>;
//# sourceMappingURL=customDimensions.d.ts.map
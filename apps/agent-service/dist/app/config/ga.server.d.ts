export type GaMode = "mock" | "direct";
export interface GaConfig {
    propertyId: string;
    mode: GaMode;
}
/**
 * Get Google Analytics configuration from environment variables.
 *
 * Modes:
 * - 'mock': Use mock data for development (GA_USE_MOCK=1 or GA_MODE=mock)
 * - 'direct': Use direct Google Analytics Data API (GA_MODE=direct)
 *
 * Default behavior:
 * - If GA_USE_MOCK=1 or no mode specified: mock mode
 * - If GA_MODE is set: use that mode
 *
 * @returns {GaConfig} Configuration object
 */
export declare function getGaConfig(): GaConfig;
//# sourceMappingURL=ga.server.d.ts.map
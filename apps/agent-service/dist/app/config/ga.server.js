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
export function getGaConfig() {
    const propertyId = process.env.GA_PROPERTY_ID ?? "mock-property";
    const useMockLegacy = (process.env.GA_USE_MOCK ?? "1") === "1";
    const modeEnv = (process.env.GA_MODE || "").toLowerCase();
    // Determine mode
    let mode;
    if (modeEnv === "direct") {
        mode = "direct";
    }
    else if (modeEnv === "mock" || useMockLegacy) {
        mode = "mock";
    }
    else {
        // Default to direct if credentials are available, otherwise mock
        mode = process.env.GOOGLE_APPLICATION_CREDENTIALS ? "direct" : "mock";
    }
    return {
        propertyId,
        mode,
    };
}
//# sourceMappingURL=ga.server.js.map
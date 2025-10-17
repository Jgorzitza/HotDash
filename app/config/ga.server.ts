export type GaMode = "mock" | "direct" | "mcp";

export interface GaConfig {
  propertyId: string;
  mode: GaMode;
  mcpHost?: string;
}

/**
 * Get Google Analytics configuration from environment variables.
 *
 * Modes:
 * - 'mock': Use mock data for development (GA_USE_MOCK=1 or GA_MODE=mock)
 * - 'direct': Use direct Google Analytics Data API (GA_MODE=direct)
 * - 'mcp': Use MCP server (GA_MODE=mcp, requires GA_MCP_HOST)
 *
 * Default behavior:
 * - If GA_USE_MOCK=1 or no mode specified: mock mode
 * - If GA_MODE is set: use that mode
 *
 * @returns {GaConfig} Configuration object
 */
export function getGaConfig(): GaConfig {
  const propertyId = process.env.GA_PROPERTY_ID ?? "mock-property";
  const useMockLegacy = (process.env.GA_USE_MOCK ?? "1") === "1";
  const modeEnv = (process.env.GA_MODE || "").toLowerCase();
  const mcpHost = process.env.GA_MCP_HOST;

  // Determine mode
  let mode: GaMode;
  if (modeEnv === "direct") {
    mode = "direct";
  } else if (modeEnv === "mcp") {
    mode = "mcp";
  } else if (modeEnv === "mock" || useMockLegacy) {
    mode = "mock";
  } else {
    // Default to direct if credentials are available, otherwise mock
    mode = process.env.GOOGLE_APPLICATION_CREDENTIALS ? "direct" : "mock";
  }

  return {
    propertyId,
    mode,
    mcpHost,
  };
}

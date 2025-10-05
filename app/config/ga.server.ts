export interface GaConfig {
  propertyId: string;
  useMock: boolean;
  mcpHost?: string;
}

export function getGaConfig(): GaConfig {
  const propertyId = process.env.GA_PROPERTY_ID ?? "mock-property";
  const useMock = (process.env.GA_USE_MOCK ?? "1") === "1";
  const mcpHost = process.env.GA_MCP_HOST;

  return {
    propertyId,
    useMock,
    mcpHost,
  };
}

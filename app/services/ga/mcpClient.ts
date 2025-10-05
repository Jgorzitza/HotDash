import type { DateRange, GaClient, GaSession } from "./client";

interface McpResponse {
  data: GaSession[];
}

export function createMcpGaClient(host: string): GaClient {
  if (!host) {
    throw new Error("GA MCP host is not configured");
  }

  const baseUrl = host.replace(/\/$/, "");

  return {
    async fetchLandingPageSessions(range: DateRange): Promise<GaSession[]> {
      const response = await fetch(`${baseUrl}/landing-pages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(range),
      });

      if (!response.ok) {
        throw new Error(`GA MCP request failed with status ${response.status}`);
      }

      const payload = (await response.json()) as McpResponse;
      return payload.data ?? [];
    },
  };
}

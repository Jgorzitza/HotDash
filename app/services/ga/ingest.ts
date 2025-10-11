import { getGaConfig } from "../../config/ga.server";
import { setCached, getCached } from "../cache.server";
import { recordDashboardFact } from "../facts.server";
import { toInputJson } from "../json";
import { ServiceError, type ServiceResult } from "../types";
import type { DateRange, GaSession } from "./client";
import { createMockGaClient } from "./mockClient";
import { createMcpGaClient } from "./mcpClient";
import { createDirectGaClient } from "./directClient";

export interface LandingPageAnomaly extends GaSession {
  isAnomaly: boolean;
}

interface GetAnomaliesOptions {
  shopDomain: string;
  range?: DateRange;
}

const CACHE_TTL_MS = Number(process.env.GA_CACHE_TTL_MS ?? 5 * 60 * 1000);

function defaultRange(): DateRange {
  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(end.getUTCDate() - 7);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

function selectClient() {
  const config = getGaConfig();
  
  switch (config.mode) {
    case 'direct':
      console.log('[GA] Using direct API client');
      return { client: createDirectGaClient(config.propertyId), config };
    
    case 'mcp':
      if (!config.mcpHost) {
        throw new Error('GA_MCP_HOST required when GA_MODE=mcp');
      }
      console.log('[GA] Using MCP client');
      return { client: createMcpGaClient(config.mcpHost), config };
    
    case 'mock':
    default:
      console.log('[GA] Using mock client');
      return { client: createMockGaClient(), config };
  }
}

function flagAnomalies(sessions: GaSession[]): LandingPageAnomaly[] {
  return sessions
    .map((session) => ({
      ...session,
      isAnomaly: session.wowDelta <= -0.2,
    }))
    .sort((a, b) => a.wowDelta - b.wowDelta);
}

export async function getLandingPageAnomalies(
  options: GetAnomaliesOptions,
): Promise<ServiceResult<LandingPageAnomaly[]>> {
  const { client, config } = selectClient();
  const range = options.range ?? defaultRange();
  const cacheKey = `ga:landing-pages:${config.propertyId}:${range.start}:${range.end}`;
  const cached = getCached<ServiceResult<LandingPageAnomaly[]>>(cacheKey);
  if (cached) {
    return { ...cached, source: "cache" };
  }

  let sessions: GaSession[];
  try {
    sessions = await client.fetchLandingPageSessions(range);
  } catch (error) {
    throw new ServiceError("Failed to retrieve GA sessions", {
      scope: "ga.sessions",
      retryable: true,
      cause: error,
    });
  }

  const anomalies = flagAnomalies(sessions);

  const fact = await recordDashboardFact({
    shopDomain: options.shopDomain,
    factType: "ga.sessions.anomalies",
    scope: "ops",
    value: toInputJson(anomalies),
    metadata: toInputJson({
      propertyId: config.propertyId,
      range,
      generatedAt: new Date().toISOString(),
    }),
  });

  const result: ServiceResult<LandingPageAnomaly[]> = {
    data: anomalies,
    fact,
    source: "fresh",
  };

  setCached(cacheKey, result, CACHE_TTL_MS);

  return result;
}

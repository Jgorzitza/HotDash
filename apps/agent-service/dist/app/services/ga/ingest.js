import { getGaConfig } from "../../config/ga.server";
import { setCached, getCached } from "../cache.server";
import { recordDashboardFact } from "../facts.server";
import { toInputJson } from "../json";
import { ServiceError } from "../types";
import { createMockGaClient } from "./mockClient";
import { createDirectGaClient } from "./directClient";
const CACHE_TTL_MS = Number(process.env.GA_CACHE_TTL_MS ?? 5 * 60 * 1000);
function defaultRange() {
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
        case "direct":
            console.log("[GA] Using direct API client");
            return { client: createDirectGaClient(config.propertyId), config };
        case "mock":
        default:
            console.log("[GA] Using mock client");
            return { client: createMockGaClient(), config };
    }
}
function flagAnomalies(sessions) {
    return sessions
        .map((session) => ({
        ...session,
        isAnomaly: session.wowDelta <= -0.2,
    }))
        .sort((a, b) => a.wowDelta - b.wowDelta);
}
export async function getLandingPageAnomalies(options) {
    const { client, config } = selectClient();
    const range = options.range ?? defaultRange();
    const cacheKey = `ga:landing-pages:${config.propertyId}:${range.start}:${range.end}`;
    const cached = getCached(cacheKey);
    if (cached) {
        return { ...cached, source: "cache" };
    }
    let sessions;
    try {
        sessions = await client.fetchLandingPageSessions(range);
    }
    catch (error) {
        throw new ServiceError("Failed to retrieve GA sessions", {
            scope: "ga.sessions",
            retryable: true,
            cause: error,
        });
    }
    const anomalies = flagAnomalies(sessions);
    // Try to record fact, but don't fail if DashboardFact table doesn't exist
    let fact;
    try {
        fact = await recordDashboardFact({
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
    }
    catch (error) {
        // If DashboardFact table doesn't exist, create a mock fact
        console.warn("[GA] Failed to record dashboard fact (table may not exist):", error);
        fact = {
            id: Date.now(),
            shopDomain: options.shopDomain,
            factType: "ga.sessions.anomalies",
            scope: "ops",
            value: toInputJson(anomalies),
            metadata: toInputJson({
                propertyId: config.propertyId,
                range,
                generatedAt: new Date().toISOString(),
            }),
            evidenceUrl: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }
    const result = {
        data: anomalies,
        fact,
        source: "fresh",
    };
    setCached(cacheKey, result, CACHE_TTL_MS);
    return result;
}
//# sourceMappingURL=ingest.js.map
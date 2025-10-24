import { supabaseMemory } from "../../packages/memory/supabase";
let cachedMemory;
let cachedConfig;
export function getSupabaseConfig() {
    if (cachedConfig !== undefined) {
        return cachedConfig;
    }
    const url = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;
    cachedConfig = url && serviceKey ? { url, serviceKey } : null;
    return cachedConfig;
}
export function getMemory() {
    if (cachedMemory) {
        return cachedMemory;
    }
    const config = getSupabaseConfig();
    if (config) {
        cachedMemory = supabaseMemory(config.url, config.serviceKey);
        return cachedMemory;
    }
    cachedMemory = createFallbackMemory();
    return cachedMemory;
}
function createFallbackMemory() {
    console.warn("Supabase credentials missing; using in-memory Memory fallback. Decisions will not persist across requests.");
    const decisions = [];
    const facts = [];
    return {
        async putDecision(decision) {
            decisions.unshift(decision);
        },
        async listDecisions(scope) {
            return scope
                ? decisions.filter((d) => d.scope === scope)
                : [...decisions];
        },
        async putFact(fact) {
            facts.unshift(fact);
        },
        async getFacts(topic, key) {
            return facts.filter((fact) => {
                if (topic && fact.topic !== topic)
                    return false;
                if (key && fact.key !== key)
                    return false;
                return true;
            });
        },
    };
}
//# sourceMappingURL=supabase.server.js.map
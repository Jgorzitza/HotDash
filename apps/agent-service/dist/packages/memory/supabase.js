import { createClient } from "@supabase/supabase-js";
const RETRYABLE_ERROR_CODES = new Set([
    "408",
    "425",
    "429",
    "500",
    "502",
    "503",
    "504",
]);
const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);
const RETRYABLE_MESSAGE_TOKENS = [
    "ETIMEDOUT",
    "timeout",
    "ECONNRESET",
    "fetch failed",
];
const DECISION_TABLE_PRIMARY = "DecisionLog";
const DECISION_TABLE_LEGACY = "DecisionLog"; // Fixed: use same table name as primary
const FACTS_TABLE = "facts";
const MAX_RETRIES = 2;
const INITIAL_DELAY_MS = 250;
function stripUndefined(payload) {
    for (const key of Object.keys(payload)) {
        if (payload[key] === undefined) {
            delete payload[key];
        }
    }
    return payload;
}
function buildDecisionInsertPayload(decision, schema) {
    if (schema === "actor") {
        return stripUndefined({
            scope: decision.scope,
            actor: decision.who,
            action: decision.what,
            rationale: decision.why,
            evidence_url: decision.evidenceUrl, // Fixed: use snake_case to match database schema
            externalRef: decision.sha,
            created_at: decision.createdAt, // Fixed: use snake_case to match database schema
        });
    }
    return stripUndefined({
        scope: decision.scope,
        who: decision.who,
        what: decision.what,
        why: decision.why,
        evidence_url: decision.evidenceUrl,
        sha: decision.sha,
        created_at: decision.createdAt,
    });
}
function mapDecisionRows(rows, schema) {
    return rows.map((row) => {
        const scope = (row?.scope ?? "ops");
        if (schema === "actor") {
            return {
                id: String(row?.id ?? ""),
                scope,
                who: String(row?.actor ?? ""),
                what: String(row?.action ?? ""),
                why: String(row?.rationale ?? ""),
                sha: row?.externalRef ? String(row.externalRef) : undefined,
                evidenceUrl: row?.evidence_url ? String(row.evidence_url) : undefined, // Fixed: use snake_case to match database schema
                createdAt: String(row?.created_at ?? ""), // Fixed: use snake_case to match database schema
            };
        }
        return {
            id: String(row?.id ?? ""),
            scope,
            who: String(row?.who ?? ""),
            what: String(row?.what ?? ""),
            why: String(row?.why ?? ""),
            sha: row?.sha ? String(row.sha) : undefined,
            evidenceUrl: row?.evidence_url ? String(row.evidence_url) : undefined,
            createdAt: String(row?.created_at ?? ""),
        };
    });
}
function getMessage(error) {
    if (!error)
        return undefined;
    if (typeof error === "string")
        return error;
    if (error instanceof Error)
        return error.message;
    if (typeof error === "object" && error.message) {
        return error.message ?? undefined;
    }
    return undefined;
}
function isUnknownColumnError(error) {
    if (!error) {
        return false;
    }
    const code = error.code;
    if (code && String(code) === "42703") {
        return true;
    }
    const message = getMessage(error);
    if (!message) {
        return false;
    }
    const lower = message.toLowerCase();
    return lower.includes("column") && lower.includes("does not exist");
}
function shouldFallbackToLegacy(error) {
    if (!error) {
        return false;
    }
    if (isUnknownColumnError(error)) {
        return true;
    }
    const code = error.code;
    if (code && String(code).toUpperCase() === "42P01") {
        return true;
    }
    const message = getMessage(error);
    if (!message) {
        return false;
    }
    const lower = message.toLowerCase();
    if (lower.includes("relation") && lower.includes("does not exist")) {
        return true;
    }
    if (lower.includes("table") &&
        lower.includes("not") &&
        lower.includes("found")) {
        return true;
    }
    return false;
}
function isRetryable(error) {
    if (!error) {
        return false;
    }
    if (error instanceof Error) {
        const message = error.message.toLowerCase();
        return RETRYABLE_MESSAGE_TOKENS.some((token) => message.includes(token.toLowerCase()));
    }
    if (typeof error === "string") {
        const lower = error.toLowerCase();
        return RETRYABLE_MESSAGE_TOKENS.some((token) => lower.includes(token.toLowerCase()));
    }
    if (typeof error === "object") {
        const { code, status, message } = error;
        if (code && RETRYABLE_ERROR_CODES.has(String(code))) {
            return true;
        }
        if (typeof status === "number" && RETRYABLE_STATUS.has(status)) {
            return true;
        }
        if (typeof message === "string") {
            const lower = message.toLowerCase();
            return RETRYABLE_MESSAGE_TOKENS.some((token) => lower.includes(token.toLowerCase()));
        }
    }
    return false;
}
async function wait(ms) {
    await new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
let sleepImpl = wait;
async function executeWithRetry(operation) {
    let attempt = 0;
    let delay = INITIAL_DELAY_MS;
    let lastError;
    while (attempt <= MAX_RETRIES) {
        try {
            const result = await operation();
            if (result && typeof result === "object" && "error" in result) {
                const { error } = result;
                if (error) {
                    if (attempt === MAX_RETRIES || !isRetryable(error)) {
                        throw error;
                    }
                    lastError = error;
                }
                else {
                    return result;
                }
            }
            else {
                return result;
            }
        }
        catch (error) {
            if (attempt === MAX_RETRIES || !isRetryable(error)) {
                throw error;
            }
            lastError = error;
        }
        attempt += 1;
        await sleepImpl(delay);
        delay *= 2;
    }
    throw lastError ?? new Error("Supabase operation failed after retries");
}
function setWaitImplementation(fn) {
    sleepImpl = fn;
}
function resetWaitImplementation() {
    sleepImpl = wait;
}
export function supabaseMemory(url, key) {
    const sb = createClient(url, key);
    return {
        async putDecision(decision) {
            try {
                await executeWithRetry(async () => {
                    return await sb
                        .from(DECISION_TABLE_PRIMARY)
                        .insert(buildDecisionInsertPayload(decision, "actor"));
                });
            }
            catch (error) {
                if (!shouldFallbackToLegacy(error)) {
                    throw error;
                }
                await executeWithRetry(async () => {
                    return await sb
                        .from(DECISION_TABLE_LEGACY)
                        .insert(buildDecisionInsertPayload(decision, "legacy"));
                });
            }
        },
        async listDecisions(scope) {
            try {
                const result = await executeWithRetry(async () => {
                    let query = sb
                        .from(DECISION_TABLE_PRIMARY)
                        .select("id,scope,actor,action,rationale,evidence_url,externalRef,created_at");
                    if (scope) {
                        query = query.eq("scope", scope);
                    }
                    return await query.order("created_at", { ascending: false }); // Fixed: use snake_case
                });
                const { data, error } = result;
                if (error) {
                    throw error;
                }
                return mapDecisionRows(data ?? [], "actor");
            }
            catch (error) {
                if (!shouldFallbackToLegacy(error)) {
                    throw error;
                }
            }
            // Apply retry logic to legacy fallback as well
            const legacyResult = await executeWithRetry(async () => {
                let legacyQuery = sb.from(DECISION_TABLE_LEGACY).select("*");
                if (scope) {
                    legacyQuery = legacyQuery.eq("scope", scope);
                }
                return await legacyQuery.order("created_at", { ascending: false });
            });
            const { data: legacyData, error: legacyError } = legacyResult;
            if (legacyError) {
                throw legacyError;
            }
            return mapDecisionRows(legacyData ?? [], "legacy");
        },
        async putFact(fact) {
            await executeWithRetry(async () => {
                return await sb.from(FACTS_TABLE).insert({
                    project: fact.project,
                    topic: fact.topic,
                    key: fact.key,
                    value: fact.value,
                    created_at: fact.createdAt,
                });
            });
        },
        async getFacts(topic, key) {
            const result = await executeWithRetry(async () => {
                let query = sb.from(FACTS_TABLE).select("*");
                if (topic) {
                    query = query.eq("topic", topic);
                }
                if (key) {
                    query = query.eq("key", key);
                }
                return await query.order("created_at", { ascending: false });
            });
            const { data, error } = result;
            if (error) {
                throw error;
            }
            return (data || []).map((row) => ({
                project: String(row?.project ?? ""),
                topic: String(row?.topic ?? ""),
                key: String(row?.key ?? ""),
                value: String(row?.value ?? ""),
                createdAt: String(row?.created_at ?? ""),
            }));
        },
    };
}
export const __internal = {
    executeWithRetry,
    isRetryable,
    setWaitForTests: setWaitImplementation,
    resetWaitForTests: resetWaitImplementation,
};
//# sourceMappingURL=supabase.js.map
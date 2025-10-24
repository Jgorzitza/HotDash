const FLAG_PREFIXES = ["FEATURE_", "FEATURE_FLAG_"];
const MATCH_PREFIXES = [...FLAG_PREFIXES].sort((a, b) => b.length - a.length);
function normalizeFlag(flag) {
    return flag.replace(/[^a-z0-9]/gi, "_").toUpperCase();
}
function getEnvKeys(flag) {
    const normalized = normalizeFlag(flag);
    const keys = FLAG_PREFIXES.map((prefix) => `${prefix}${normalized}`);
    return Array.from(new Set(keys));
}
function findMatchingPrefix(envKey) {
    return MATCH_PREFIXES.find((prefix) => envKey.startsWith(prefix));
}
function truthy(value) {
    if (!value) {
        return false;
    }
    return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}
export function isFeatureEnabled(flag, defaultValue = false) {
    for (const key of getEnvKeys(flag)) {
        const value = process.env[key];
        if (value !== undefined) {
            return truthy(value);
        }
    }
    return defaultValue;
}
export function getFeatureFlag(flag) {
    for (const key of getEnvKeys(flag)) {
        const value = process.env[key];
        if (value !== undefined) {
            return value;
        }
    }
    return undefined;
}
export function getAllFeatureFlags() {
    const result = {};
    for (const [envKey, value] of Object.entries(process.env)) {
        const prefix = findMatchingPrefix(envKey);
        if (!prefix) {
            continue;
        }
        const flagName = envKey.substring(prefix.length).toLowerCase();
        result[flagName] = value ?? "";
    }
    return result;
}
//# sourceMappingURL=featureFlags.js.map
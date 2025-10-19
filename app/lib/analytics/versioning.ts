/**
 * API Versioning Strategy
 *
 * Handles API versioning for analytics endpoints.
 * Supports backward compatibility and gradual migration.
 */

export type APIVersion = "v1" | "v2";

export interface VersionedResponse<T> {
  version: APIVersion;
  data: T;
  deprecationNotice?: string;
}

/**
 * Get API version from request
 */
export function getAPIVersion(request: Request): APIVersion {
  const url = new URL(request.url);

  // Check header first
  const headerVersion = request.headers.get("x-api-version");
  if (headerVersion === "v2") return "v2";

  // Check query param
  const queryVersion = url.searchParams.get("version");
  if (queryVersion === "v2") return "v2";

  // Default to v1
  return "v1";
}

/**
 * Transform data for specific API version
 */
export function transformForVersion<T>(
  data: T,
  targetVersion: APIVersion,
): any {
  if (targetVersion === "v1") {
    // V1: Wrapped response with success/error/timestamp
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      version: "v1",
    };
  }

  // V2: Simplified response (current)
  return data;
}

/**
 * Check if version is deprecated
 */
export function isDeprecated(version: APIVersion): {
  deprecated: boolean;
  sunsetDate?: string;
  migrationGuide?: string;
} {
  if (version === "v1") {
    return {
      deprecated: false, // Not yet, but will be
      sunsetDate: "2026-01-01",
      migrationGuide: "/docs/api/migration-v1-to-v2",
    };
  }

  return {
    deprecated: false,
  };
}

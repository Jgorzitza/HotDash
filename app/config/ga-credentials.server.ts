/**
 * Google Analytics Credentials Initialization
 *
 * Handles loading GA4 service account credentials from environment variables.
 * Supports both file-based credentials (local) and base64-encoded credentials (Fly.io).
 */

import { writeFileSync, existsSync } from "fs";
import { join } from "path";

let credentialsInitialized = false;

/**
 * Initialize Google Analytics credentials
 *
 * This function should be called early in the application lifecycle.
 * It handles two scenarios:
 *
 * 1. Local development: GOOGLE_APPLICATION_CREDENTIALS points to a file
 * 2. Production (Fly.io): GOOGLE_APPLICATION_CREDENTIALS_BASE64 contains base64-encoded JSON
 */
export function initializeGACredentials(): void {
  if (credentialsInitialized) {
    return;
  }

  // Check if base64-encoded credentials are provided (Fly.io)
  const base64Credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;

  if (base64Credentials) {
    try {
      // Decode base64 credentials
      const credentialsJson = Buffer.from(base64Credentials, "base64").toString(
        "utf-8",
      );

      // Write to temp file
      const tmpPath = join("/tmp", "ga-credentials.json");
      writeFileSync(tmpPath, credentialsJson);

      // Set environment variable to point to temp file
      process.env.GOOGLE_APPLICATION_CREDENTIALS = tmpPath;

      credentialsInitialized = true;
      return;
    } catch (error) {
      console.error("[GA] Failed to decode base64 credentials:", error);
      throw new Error("Failed to initialize GA credentials from base64");
    }
  }

  // Check if file-based credentials are provided (local development)
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (credentialsPath) {
    if (existsSync(credentialsPath)) {
      credentialsInitialized = true;
      return;
    } else {
      console.warn("[GA] Credentials file not found:", credentialsPath);
    }
  }

  // No credentials provided - will fall back to mock mode
  credentialsInitialized = true;
}

// Initialize credentials when this module is imported
initializeGACredentials();

/**
 * GA4 Sampling Detection and Guard
 *
 * Detects when Google Analytics 4 data is sampled and enforces
 * unsampled data requirements for critical metrics.
 */

/**
 * Check if error indicates GA4 sampling
 */
export function isSamplingError(error: any): boolean {
  if (!error) return false;

  const message = error.message || error.toString();
  const lowerMessage = message.toLowerCase();

  // Check for common sampling error indicators
  return (
    lowerMessage.includes("sampled") ||
    lowerMessage.includes("sampling") ||
    lowerMessage.includes("exceeded quota") ||
    lowerMessage.includes("data quality")
  );
}

/**
 * Validate that GA4 response is not sampled
 */
export function validateUnsampled(response: any): void {
  if (response?.metadata?.dataQuality === "SAMPLED") {
    throw new Error("GA4 data is sampled - unsampled data required");
  }

  if (response?.samplingMetadatas && response.samplingMetadatas.length > 0) {
    throw new Error("GA4 data is sampled - unsampled data required");
  }
}

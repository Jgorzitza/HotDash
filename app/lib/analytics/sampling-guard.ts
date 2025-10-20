/**
 * GA4 Sampling Detection Guard
 *
 * Detects if a GA4 API error is due to data sampling
 */

/**
 * Check if an error is a GA4 sampling error
 *
 * @param error - The error to check
 * @returns true if the error indicates sampling, false otherwise
 */
export function isSamplingError(error: unknown): boolean {
  if (!error) return false;

  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();

  // GA4 sampling error indicators
  const samplingIndicators = [
    "sampled",
    "sampling",
    "data sample",
    "sample rate",
    "sampling threshold",
  ];

  return samplingIndicators.some((indicator) => message.includes(indicator));
}

/**
 * Ad Tracking Validation Library
 * 
 * ADS-007: Validates UTM parameters, conversion tracking, and data accuracy
 * Ensures all ad tracking is working correctly across platforms
 */

/**
 * UTM Parameter Structure
 */
export interface UTMParameters {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term?: string;
  utm_content?: string;
}

/**
 * Validation Result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Conversion Event
 */
export interface ConversionEvent {
  eventId: string;
  campaignId: string;
  timestamp: string;
  value: number; // in cents
  currency: string;
  utmParams: UTMParameters;
  conversionType: 'purchase' | 'signup' | 'lead' | 'add_to_cart';
}

/**
 * Tracking Pixel Data
 */
export interface TrackingPixelData {
  pixelId: string;
  platform: 'google' | 'facebook' | 'tiktok' | 'linkedin';
  eventType: string;
  eventData: Record<string, any>;
  timestamp: string;
}

/**
 * Validate UTM parameters
 * 
 * @param params - UTM parameters to validate
 * @returns Validation result
 */
export function validateUTMParameters(params: Partial<UTMParameters>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required parameters
  if (!params.utm_source || params.utm_source.length === 0) {
    errors.push(params.utm_source === '' ? 'utm_source cannot be empty' : 'utm_source is required');
  } else if (params.utm_source.length > 100) {
    warnings.push('utm_source is longer than 100 characters');
  }

  if (!params.utm_medium || params.utm_medium.length === 0) {
    errors.push(params.utm_medium === '' ? 'utm_medium cannot be empty' : 'utm_medium is required');
  } else if (params.utm_medium.length > 100) {
    warnings.push('utm_medium is longer than 100 characters');
  }

  if (!params.utm_campaign || params.utm_campaign.length === 0) {
    errors.push(params.utm_campaign === '' ? 'utm_campaign cannot be empty' : 'utm_campaign is required');
  } else if (params.utm_campaign.length > 100) {
    warnings.push('utm_campaign is longer than 100 characters');
  }

  // Optional parameters validation
  if (params.utm_term && params.utm_term.length > 100) {
    warnings.push('utm_term is longer than 100 characters');
  }

  if (params.utm_content && params.utm_content.length > 100) {
    warnings.push('utm_content is longer than 100 characters');
  }

  // Check for special characters that might cause issues
  const specialCharsRegex = /[<>'"]/;
  Object.entries(params).forEach(([key, value]) => {
    if (value && specialCharsRegex.test(value)) {
      warnings.push(`${key} contains special characters that may cause tracking issues`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Parse UTM parameters from URL
 * 
 * @param url - URL to parse
 * @returns UTM parameters or null if none found
 */
export function parseUTMFromURL(url: string): Partial<UTMParameters> | null {
  try {
    const urlObj = new URL(url);
    const params: Partial<UTMParameters> = {};

    const utmSource = urlObj.searchParams.get('utm_source');
    const utmMedium = urlObj.searchParams.get('utm_medium');
    const utmCampaign = urlObj.searchParams.get('utm_campaign');
    const utmTerm = urlObj.searchParams.get('utm_term');
    const utmContent = urlObj.searchParams.get('utm_content');

    if (utmSource) params.utm_source = utmSource;
    if (utmMedium) params.utm_medium = utmMedium;
    if (utmCampaign) params.utm_campaign = utmCampaign;
    if (utmTerm) params.utm_term = utmTerm;
    if (utmContent) params.utm_content = utmContent;

    return Object.keys(params).length > 0 ? params : null;
  } catch (error) {
    return null;
  }
}

/**
 * Build URL with UTM parameters
 * 
 * @param baseUrl - Base URL
 * @param params - UTM parameters to add
 * @returns URL with UTM parameters
 */
export function buildURLWithUTM(baseUrl: string, params: UTMParameters): string {
  try {
    const url = new URL(baseUrl);
    
    url.searchParams.set('utm_source', params.utm_source);
    url.searchParams.set('utm_medium', params.utm_medium);
    url.searchParams.set('utm_campaign', params.utm_campaign);
    
    if (params.utm_term) {
      url.searchParams.set('utm_term', params.utm_term);
    }
    
    if (params.utm_content) {
      url.searchParams.set('utm_content', params.utm_content);
    }

    return url.toString();
  } catch (error) {
    throw new Error(`Invalid base URL: ${baseUrl}`);
  }
}

/**
 * Validate conversion event data
 * 
 * @param event - Conversion event to validate
 * @returns Validation result
 */
export function validateConversionEvent(event: Partial<ConversionEvent>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!event.eventId) {
    errors.push('eventId is required');
  }

  if (!event.campaignId) {
    errors.push('campaignId is required');
  }

  if (!event.timestamp) {
    errors.push('timestamp is required');
  } else {
    const timestamp = new Date(event.timestamp);
    if (isNaN(timestamp.getTime())) {
      errors.push('timestamp is not a valid date');
    }
  }

  if (event.value === undefined || event.value === null) {
    errors.push('value is required');
  } else if (event.value < 0) {
    errors.push('value cannot be negative');
  }

  if (!event.currency) {
    errors.push('currency is required');
  } else if (event.currency.length !== 3) {
    errors.push('currency must be a 3-letter ISO code (e.g., USD, EUR)');
  }

  if (!event.conversionType) {
    errors.push('conversionType is required');
  } else if (!['purchase', 'signup', 'lead', 'add_to_cart'].includes(event.conversionType)) {
    errors.push('conversionType must be one of: purchase, signup, lead, add_to_cart');
  }

  if (event.utmParams) {
    const utmValidation = validateUTMParameters(event.utmParams);
    errors.push(...utmValidation.errors);
    warnings.push(...utmValidation.warnings);
  } else {
    warnings.push('No UTM parameters provided - attribution may be incomplete');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate tracking pixel data
 * 
 * @param pixelData - Tracking pixel data to validate
 * @returns Validation result
 */
export function validateTrackingPixel(pixelData: Partial<TrackingPixelData>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!pixelData.pixelId) {
    errors.push('pixelId is required');
  }

  if (!pixelData.platform) {
    errors.push('platform is required');
  } else if (!['google', 'facebook', 'tiktok', 'linkedin'].includes(pixelData.platform)) {
    errors.push('platform must be one of: google, facebook, tiktok, linkedin');
  }

  if (!pixelData.eventType) {
    errors.push('eventType is required');
  }

  if (!pixelData.eventData) {
    warnings.push('No event data provided');
  } else if (Object.keys(pixelData.eventData).length === 0) {
    warnings.push('Event data is empty');
  }

  if (!pixelData.timestamp) {
    errors.push('timestamp is required');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Calculate ROAS and validate against expected value
 * 
 * @param revenue - Revenue in cents
 * @param spend - Spend in cents
 * @param expectedROAS - Expected ROAS (optional)
 * @param tolerance - Tolerance percentage (default: 10%)
 * @returns Validation result with ROAS calculation
 */
export function validateROASCalculation(
  revenue: number,
  spend: number,
  expectedROAS?: number,
  tolerance: number = 10
): ValidationResult & { calculatedROAS: number | null } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (revenue < 0) {
    errors.push('Revenue cannot be negative');
  }

  if (spend < 0) {
    errors.push('Spend cannot be negative');
  }

  let calculatedROAS: number | null = null;

  if (spend === 0) {
    warnings.push('Spend is zero - ROAS cannot be calculated');
  } else {
    calculatedROAS = revenue / spend;

    if (expectedROAS !== undefined) {
      const difference = Math.abs(calculatedROAS - expectedROAS);
      const percentDifference = (difference / expectedROAS) * 100;

      if (percentDifference > tolerance) {
        warnings.push(
          `Calculated ROAS (${calculatedROAS.toFixed(2)}) differs from expected (${expectedROAS.toFixed(2)}) by ${percentDifference.toFixed(1)}%`
        );
      }
    }

    if (calculatedROAS < 1.0) {
      warnings.push(`ROAS is below 1.0 (${calculatedROAS.toFixed(2)}) - campaign is losing money`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    calculatedROAS,
  };
}

/**
 * Test UTM parameter tracking end-to-end
 * 
 * @param testURL - URL to test
 * @param expectedParams - Expected UTM parameters
 * @returns Validation result
 */
export function testUTMTracking(
  testURL: string,
  expectedParams: UTMParameters
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Parse UTM from URL
  const parsedParams = parseUTMFromURL(testURL);

  if (!parsedParams) {
    errors.push('No UTM parameters found in URL');
    return { valid: false, errors, warnings };
  }

  // Validate parsed parameters
  const validation = validateUTMParameters(parsedParams);
  errors.push(...validation.errors);
  warnings.push(...validation.warnings);

  // Compare with expected parameters
  if (parsedParams.utm_source !== expectedParams.utm_source) {
    errors.push(`utm_source mismatch: expected "${expectedParams.utm_source}", got "${parsedParams.utm_source}"`);
  }

  if (parsedParams.utm_medium !== expectedParams.utm_medium) {
    errors.push(`utm_medium mismatch: expected "${expectedParams.utm_medium}", got "${parsedParams.utm_medium}"`);
  }

  if (parsedParams.utm_campaign !== expectedParams.utm_campaign) {
    errors.push(`utm_campaign mismatch: expected "${expectedParams.utm_campaign}", got "${parsedParams.utm_campaign}"`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}


/**
 * UTM Enforcement Helper
 * 
 * Purpose: Validate and enforce UTM parameter standards
 * Owner: ads agent
 * Date: 2025-10-15
 */

export interface UtmParameters {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term?: string;
  utm_content?: string;
}

export interface UtmValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  url: string;
}

const VALID_SOURCES = ['meta', 'facebook', 'instagram', 'google', 'tiktok', 'twitter', 'linkedin'];
const VALID_MEDIUMS = ['cpc', 'cpm', 'social', 'email', 'display', 'video'];

export function validateUtmParameters(params: Partial<UtmParameters>): UtmValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required parameters
  if (!params.utm_source) {
    errors.push('utm_source is required');
  } else if (!VALID_SOURCES.includes(params.utm_source.toLowerCase())) {
    warnings.push(`utm_source "${params.utm_source}" is not a standard source`);
  }

  if (!params.utm_medium) {
    errors.push('utm_medium is required');
  } else if (!VALID_MEDIUMS.includes(params.utm_medium.toLowerCase())) {
    warnings.push(`utm_medium "${params.utm_medium}" is not a standard medium`);
  }

  if (!params.utm_campaign) {
    errors.push('utm_campaign is required');
  }

  // Check for spaces (should use underscores or hyphens)
  Object.entries(params).forEach(([key, value]) => {
    if (value && value.includes(' ')) {
      warnings.push(`${key} contains spaces. Use underscores or hyphens instead.`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    url: buildUtmUrl('https://example.com', params as UtmParameters),
  };
}

export function buildUtmUrl(baseUrl: string, params: UtmParameters): string {
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
}

export function parseUtmFromUrl(url: string): Partial<UtmParameters> {
  const urlObj = new URL(url);
  
  return {
    utm_source: urlObj.searchParams.get('utm_source') || undefined,
    utm_medium: urlObj.searchParams.get('utm_medium') || undefined,
    utm_campaign: urlObj.searchParams.get('utm_campaign') || undefined,
    utm_term: urlObj.searchParams.get('utm_term') || undefined,
    utm_content: urlObj.searchParams.get('utm_content') || undefined,
  };
}

export function generateCampaignUtm(
  platform: string,
  campaignName: string,
  adSetName?: string
): UtmParameters {
  const source = platform.toLowerCase();
  const medium = 'cpc';
  const campaign = campaignName.toLowerCase().replace(/\s+/g, '_');
  const content = adSetName?.toLowerCase().replace(/\s+/g, '_');

  return {
    utm_source: source,
    utm_medium: medium,
    utm_campaign: campaign,
    utm_content: content,
  };
}


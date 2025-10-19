/**
 * Campaign Service
 *
 * Business logic layer for campaign management
 *
 * @module app/services/ads/campaign.service
 */

import type {
  Campaign,
  CampaignFilters,
  CampaignSort,
  CampaignListResponse,
  fetchMetaCampaigns,
  fetchGoogleCampaigns,
  createMetaCampaign,
  createGoogleCampaign,
  AdPlatform,
  type MetaCampaign,
  type GoogleCampaign,
} from "~/lib/ads";

/**
 * List campaigns with filtering and sorting
 *
 * @param filters - Campaign filters
 * @param sort - Sort options
 * @param page - Page number (1-indexed)
 * @param pageSize - Items per page
 * @returns Paginated campaign list
 */
export async function listCampaigns(
  filters?: CampaignFilters,
  sort?: CampaignSort,
  page: number = 1,
  pageSize: number = 20,
): Promise<CampaignListResponse> {
  // Fetch from all platforms
  const [metaCampaigns, googleCampaigns] = await Promise.all([
    fetchMetaCampaigns(),
    fetchGoogleCampaigns(),
  ]);

  let allCampaigns: Campaign[] = [...metaCampaigns, ...googleCampaigns];

  // Apply filters
  if (filters) {
    allCampaigns = applyCampaignFilters(allCampaigns, filters);
  }

  // Apply sorting
  if (sort) {
    allCampaigns = sortCampaigns(allCampaigns, sort);
  }

  // Calculate pagination
  const totalCount = allCampaigns.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCampaigns = allCampaigns.slice(startIndex, endIndex);
  const hasMore = endIndex < totalCount;

  return {
    campaigns: paginatedCampaigns,
    totalCount,
    page,
    pageSize,
    hasMore,
  };
}

/**
 * Get campaign by ID
 *
 * @param campaignId - Campaign ID to fetch
 * @returns Campaign or null if not found
 */
export async function getCampaignById(
  campaignId: string,
): Promise<Campaign | null> {
  const [metaCampaigns, googleCampaigns] = await Promise.all([
    fetchMetaCampaigns(),
    fetchGoogleCampaigns(),
  ]);

  const allCampaigns = [...metaCampaigns, ...googleCampaigns];
  return allCampaigns.find((c) => c.id === campaignId) || null;
}

/**
 * Create new campaign
 *
 * @param platform - Target platform (meta or google)
 * @param campaignData - Campaign configuration
 * @returns Created campaign
 */
export async function createCampaign(
  platform: AdPlatform,
  campaignData: Partial<Campaign>,
): Promise<Campaign> {
  if (platform === AdPlatform.META) {
    return createMetaCampaign(campaignData as Partial<MetaCampaign>);
  } else if (platform === AdPlatform.GOOGLE) {
    return createGoogleCampaign(campaignData as Partial<GoogleCampaign>);
  } else {
    throw new Error(`Unsupported platform: ${platform}`);
  }
}

/**
 * Apply filters to campaign list
 */
function applyCampaignFilters(
  campaigns: Campaign[],
  filters: CampaignFilters,
): Campaign[] {
  let filtered = campaigns;

  if (filters.platform) {
    filtered = filtered.filter((c) => c.platform === filters.platform);
  }

  if (filters.status) {
    filtered = filtered.filter((c) => c.status === filters.status);
  }

  if (filters.startDate) {
    filtered = filtered.filter((c) => c.startDate >= filters.startDate!);
  }

  if (filters.endDate) {
    filtered = filtered.filter(
      (c) => !c.endDate || c.endDate <= filters.endDate!,
    );
  }

  if (filters.minROAS !== undefined) {
    filtered = filtered.filter((c) => c.metrics.roas >= filters.minROAS!);
  }

  if (filters.maxCPA !== undefined) {
    filtered = filtered.filter((c) => c.metrics.cpa <= filters.maxCPA!);
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter((c) =>
      c.name.toLowerCase().includes(searchLower),
    );
  }

  return filtered;
}

/**
 * Sort campaigns by specified field
 */
function sortCampaigns(campaigns: Campaign[], sort: CampaignSort): Campaign[] {
  const sorted = [...campaigns];

  sorted.sort((a, b) => {
    let comparison = 0;

    switch (sort.field) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "spend":
        comparison = a.metrics.spend - b.metrics.spend;
        break;
      case "roas":
        comparison = a.metrics.roas - b.metrics.roas;
        break;
      case "cpc":
        comparison = a.metrics.cpc - b.metrics.cpc;
        break;
      case "cpa":
        comparison = a.metrics.cpa - b.metrics.cpa;
        break;
      case "startDate":
        comparison =
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        break;
      case "updatedAt":
        comparison =
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
    }

    return sort.direction === "asc" ? comparison : -comparison;
  });

  return sorted;
}

/**
 * Get underperforming campaigns based on ROAS threshold
 *
 * @param campaigns - List of campaigns to filter
 * @param threshold - Minimum ROAS threshold (default: 2.0)
 * @returns List of underperforming campaigns
 */
export function getUnderperformingCampaigns(
  campaigns: Campaign[],
  threshold: number = 2.0,
): Campaign[] {
  return campaigns.filter((c) => c.metrics.roas < threshold);
}

/**
 * Get top performing campaigns
 *
 * @param campaigns - List of campaigns to sort
 * @param limit - Number of top campaigns to return (default: 3)
 * @returns Top performing campaigns sorted by ROAS
 */
export function getTopPerformingCampaigns(
  campaigns: Campaign[],
  limit: number = 3,
): Campaign[] {
  return [...campaigns]
    .sort((a, b) => b.metrics.roas - a.metrics.roas)
    .slice(0, limit);
}

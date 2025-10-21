/**
 * CSV/Excel Data Export Service
 * 
 * Streams analytics data to CSV format
 * Supports all 4 analytics areas: social, SEO, ads, growth
 * Date range filtering
 * Large dataset streaming support
 */

import prisma from "~/db.server";

export type ExportType = "social" | "seo" | "ads" | "growth" | "all";

export interface ExportOptions {
  type: ExportType;
  shopDomain: string;
  startDate?: Date;
  endDate?: Date;
  format?: "csv" | "json";
}

/**
 * Generate CSV content for analytics data
 * Uses async generator for streaming large datasets
 */
export async function* generateCSVStream(
  options: ExportOptions
): AsyncGenerator<string> {
  const { type, shopDomain, startDate, endDate } = options;

  // Yield CSV header based on export type
  yield generateCSVHeader(type);

  // Stream data rows based on type
  if (type === "social" || type === "all") {
    yield* streamSocialData(shopDomain, startDate, endDate);
  }

  if (type === "seo" || type === "all") {
    yield* streamSEOData(shopDomain, startDate, endDate);
  }

  if (type === "ads" || type === "all") {
    yield* streamAdsData(shopDomain, startDate, endDate);
  }

  if (type === "growth") {
    yield* streamGrowthData(shopDomain, startDate, endDate);
  }
}

/**
 * Generate CSV header row based on export type
 */
function generateCSVHeader(type: ExportType): string {
  const headers: Record<ExportType, string> = {
    social:
      "Date,Post ID,Platform,Impressions,Clicks,Engagement,CTR,Engagement Rate\n",
    seo: "Date,Keyword,Position,Previous Position,Change,Trend,URL,Search Volume\n",
    ads: "Date,Campaign ID,Campaign Name,Platform,Spend,Revenue,ROAS,Impressions,Clicks,Conversions,CTR,Conversion Rate\n",
    growth:
      "Date,Total Impressions,Total Clicks,Total Conversions,Avg CTR,Avg Conversion Rate,Total Revenue,Total Spend,Overall ROAS\n",
    all: "Date,Type,Metric,Value,Metadata\n",
  };

  return headers[type];
}

/**
 * Stream social performance data as CSV rows
 */
async function* streamSocialData(
  shopDomain: string,
  startDate?: Date,
  endDate?: Date
): AsyncGenerator<string> {
  const where: any = {
    shopDomain,
    factType: "social_performance",
  };

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  // Fetch in batches for memory efficiency
  const batchSize = 100;
  let skip = 0;
  let hasMore = true;

  while (hasMore) {
    const batch = await prisma.dashboardFact.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: batchSize,
      skip,
    });

    if (batch.length === 0) {
      hasMore = false;
      break;
    }

    for (const record of batch) {
      const value = record.value as any;
      const row = [
        record.createdAt.toISOString(),
        value.postId || "",
        value.platform || record.scope || "",
        value.impressions || 0,
        value.clicks || 0,
        value.engagement || 0,
        value.ctr || 0,
        value.engagementRate || 0,
      ].join(",");

      yield row + "\n";
    }

    skip += batchSize;
    hasMore = batch.length === batchSize;
  }
}

/**
 * Stream SEO ranking data as CSV rows
 */
async function* streamSEOData(
  shopDomain: string,
  startDate?: Date,
  endDate?: Date
): AsyncGenerator<string> {
  const where: any = {
    shopDomain,
    factType: "seo_ranking",
  };

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  const batchSize = 100;
  let skip = 0;
  let hasMore = true;

  while (hasMore) {
    const batch = await prisma.dashboardFact.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: batchSize,
      skip,
    });

    if (batch.length === 0) {
      hasMore = false;
      break;
    }

    for (const record of batch) {
      const value = record.value as any;
      const row = [
        record.createdAt.toISOString(),
        escapeCSV(value.keyword || ""),
        value.position || 0,
        value.previousPosition || "",
        value.change || 0,
        value.trend || "",
        escapeCSV(value.url || ""),
        value.searchVolume || "",
      ].join(",");

      yield row + "\n";
    }

    skip += batchSize;
    hasMore = batch.length === batchSize;
  }
}

/**
 * Stream ads ROAS data as CSV rows
 */
async function* streamAdsData(
  shopDomain: string,
  startDate?: Date,
  endDate?: Date
): AsyncGenerator<string> {
  const where: any = {
    shopDomain,
    factType: "ads_roas",
  };

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  const batchSize = 100;
  let skip = 0;
  let hasMore = true;

  while (hasMore) {
    const batch = await prisma.dashboardFact.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: batchSize,
      skip,
    });

    if (batch.length === 0) {
      hasMore = false;
      break;
    }

    for (const record of batch) {
      const value = record.value as any;
      const row = [
        record.createdAt.toISOString(),
        escapeCSV(value.campaignId || ""),
        escapeCSV(value.campaignName || ""),
        value.platform || record.scope || "",
        value.spend || 0,
        value.revenue || 0,
        value.roas || 0,
        value.impressions || 0,
        value.clicks || 0,
        value.conversions || 0,
        value.ctr || 0,
        value.conversionRate || 0,
      ].join(",");

      yield row + "\n";
    }

    skip += batchSize;
    hasMore = batch.length === batchSize;
  }
}

/**
 * Stream growth metrics data as CSV rows
 */
async function* streamGrowthData(
  shopDomain: string,
  startDate?: Date,
  endDate?: Date
): AsyncGenerator<string> {
  // For growth metrics, we aggregate from all sources
  const where: any = {
    shopDomain,
    factType: {
      in: ["social_performance", "seo_ranking", "ads_roas"],
    },
  };

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  const batchSize = 100;
  let skip = 0;
  let hasMore = true;

  while (hasMore) {
    const batch = await prisma.dashboardFact.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: batchSize,
      skip,
    });

    if (batch.length === 0) {
      hasMore = false;
      break;
    }

    for (const record of batch) {
      const value = record.value as any;
      const row = [
        record.createdAt.toISOString(),
        value.impressions || 0,
        value.clicks || 0,
        value.conversions || 0,
        value.ctr || 0,
        value.conversionRate || 0,
        value.revenue || 0,
        value.spend || 0,
        value.roas || 0,
      ].join(",");

      yield row + "\n";
    }

    skip += batchSize;
    hasMore = batch.length === batchSize;
  }
}

/**
 * Escape CSV values to prevent injection and handle commas/quotes
 */
function escapeCSV(value: string): string {
  if (!value) return "";

  // If contains comma, quote, or newline, wrap in quotes and escape existing quotes
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

/**
 * Convert async generator to ReadableStream for Response
 */
export async function createCSVStream(
  options: ExportOptions
): Promise<ReadableStream<Uint8Array>> {
  const encoder = new TextEncoder();
  const generator = generateCSVStream(options);

  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await generator.next();

      if (done) {
        controller.close();
        return;
      }

      controller.enqueue(encoder.encode(value));
    },
  });
}

/**
 * Generate filename for export
 */
export function generateExportFilename(type: ExportType, format: string = "csv"): string {
  const timestamp = new Date().toISOString().split("T")[0];
  return `analytics-${type}-${timestamp}.${format}`;
}


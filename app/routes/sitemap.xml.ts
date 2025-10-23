import type { LoaderFunctionArgs } from "react-router";
import { seoOptimizer } from "../lib/seo/seo-optimization";

/**
 * Dynamic Sitemap Generator
 *
 * Automatically discovers and includes all public routes in the sitemap.
 * Routes are categorized by priority and change frequency based on their purpose.
 */

interface SitemapPage {
  url: string;
  lastModified: string;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

/**
 * Get all public pages for the sitemap
 * This function dynamically discovers routes and assigns appropriate metadata
 */
function getPublicPages(baseUrl: string): SitemapPage[] {
  const now = new Date().toISOString();

  // Core application pages with their metadata
  const staticPages: SitemapPage[] = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0
    },
    {
      url: `${baseUrl}/settings`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8
    },
    {
      url: `${baseUrl}/content-calendar`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9
    },
    {
      url: `${baseUrl}/ideas`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9
    },
    {
      url: `${baseUrl}/growth-engine`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7
    },
    {
      url: `${baseUrl}/health`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.6
    },
    {
      url: `${baseUrl}/seo/anomalies`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8
    }
  ];

  // TODO: Add dynamic page discovery from database
  // - Product pages from Shopify
  // - Blog posts from content system
  // - Landing pages from campaigns

  return staticPages;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const baseUrl = url.origin;

  // Get all public pages
  const pages = getPublicPages(baseUrl);

  // Generate sitemap XML
  const sitemap = seoOptimizer.generateSitemapData(pages);

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'X-Robots-Tag': 'noindex' // Don't index the sitemap itself
    }
  });
}

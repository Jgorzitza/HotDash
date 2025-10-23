import type { LoaderFunctionArgs } from "react-router";
import { seoOptimizer } from "../lib/seo/seo-optimization";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const baseUrl = url.origin;

  // Define your site's pages
  const pages = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily' as const,
      priority: 1.0
    },
    {
      url: `${baseUrl}/settings`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.8
    },
    {
      url: `${baseUrl}/content-calendar`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily' as const,
      priority: 0.9
    },
    {
      url: `${baseUrl}/ideas`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily' as const,
      priority: 0.9
    },
    {
      url: `${baseUrl}/growth-engine`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.7
    },
    {
      url: `${baseUrl}/health`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'hourly' as const,
      priority: 0.6
    }
  ];

  const sitemap = seoOptimizer.generateSitemapData(pages);

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
    }
  });
}

import type { LoaderFunctionArgs } from "react-router";
import { seoOptimizer } from "../lib/seo/seo-optimization";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const baseUrl = url.origin;

  // Define paths to disallow (admin, API, etc.)
  const disallowPaths = [
    '/api/',
    '/admin/',
    '/_internal/',
    '/.well-known/',
    '/health' // Health check endpoint
  ];

  const robotsTxt = seoOptimizer.generateRobotsTxt(disallowPaths);

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
    }
  });
}

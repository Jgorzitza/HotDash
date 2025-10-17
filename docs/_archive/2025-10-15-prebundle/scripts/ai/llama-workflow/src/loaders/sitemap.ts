import { Document } from "llamaindex";
import { getConfig } from "../config.js";
import fs from "node:fs/promises";
import path from "node:path";

// Fallback web page reader implementation since LlamaIndex readers might not be available
async function fetchWebPage(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "HotDash-AI-Bot/1.0 (support@hotrodan.com)",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // Basic HTML to text extraction (remove scripts, styles, and tags)
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return text;
  } catch (error) {
    console.warn(
      `Failed to fetch ${url}:`,
      error instanceof Error ? error.message : error,
    );
    return "";
  }
}

async function fetchSitemap(url: string): Promise<string[]> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "HotDash-AI-Bot/1.0 (support@hotrodan.com)",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const xml = await response.text();

    // Check if this is a sitemap index (contains <sitemap> tags) or a regular sitemap (contains <url> tags)
    const isSitemapIndex = xml.includes("<sitemap>");

    if (isSitemapIndex) {
      // This is a sitemap index - fetch child sitemaps
      console.log("  → Sitemap index detected, fetching child sitemaps...");
      const sitemapMatches = xml.match(/<loc>(.*?)<\/loc>/g);
      if (!sitemapMatches) {
        return [];
      }

      const childSitemaps = sitemapMatches
        .map((match) => match.replace(/<\/?loc>/g, ""))
        .filter((url) => url && url.startsWith("http"))
        .filter(
          (url) =>
            !url.endsWith(".xml") ||
            url.includes("sitemap_pages") ||
            url.includes("sitemap_blogs"),
        ); // Focus on pages and blogs

      console.log(
        `  → Found ${childSitemaps.length} child sitemaps, fetching URLs...`,
      );

      // Fetch URLs from each child sitemap
      const allUrls: string[] = [];
      for (const childUrl of childSitemaps.slice(0, 3)) {
        // Limit to first 3 child sitemaps
        const childUrls = await fetchSitemap(childUrl);
        allUrls.push(...childUrls);
        await new Promise((resolve) => setTimeout(resolve, 200)); // Rate limit
      }

      return allUrls.slice(0, 50); // Overall limit of 50 URLs
    }

    // Regular sitemap - extract URLs
    const urlMatches = xml.match(
      /<url>[\s\S]*?<loc>(.*?)<\/loc>[\s\S]*?<\/url>/g,
    );
    if (!urlMatches) {
      return [];
    }

    return urlMatches
      .map((match) => {
        const locMatch = match.match(/<loc>(.*?)<\/loc>/);
        return locMatch ? locMatch[1] : null;
      })
      .filter(
        (url): url is string =>
          url !== null && url.startsWith("http") && !url.endsWith(".xml"),
      )
      .slice(0, 50); // Limit to first 50 URLs to avoid overwhelming the system
  } catch (error) {
    console.warn(
      `Failed to fetch sitemap ${url}:`,
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

export async function fetchHotrodanContent(): Promise<Document[]> {
  const config = getConfig();
  const documents: Document[] = [];
  const timestamp = new Date().toISOString().replace(/[:]/g, "").slice(0, 15);
  const outputDir = path.join(config.LOG_DIR, "ingestion", "web", timestamp);

  try {
    await fs.mkdir(outputDir, { recursive: true });

    let urls: string[] = [];

    // Try sitemap first
    try {
      console.log("Attempting to fetch sitemap from hotrodan.com...");
      urls = await fetchSitemap("https://hotrodan.com/sitemap.xml");
      console.log(`Found ${urls.length} URLs in sitemap`);
    } catch (error) {
      console.warn(
        "Sitemap fetch failed, falling back to seed URLs:",
        error instanceof Error ? error.message : error,
      );
    }

    // Fallback to seed pages if sitemap failed or returned no results
    if (urls.length === 0) {
      urls = [
        "https://hotrodan.com/",
        "https://hotrodan.com/blog",
        "https://hotrodan.com/pricing",
        "https://hotrodan.com/docs",
        "https://hotrodan.com/about",
        "https://hotrodan.com/contact",
      ];
      console.log("Using seed URLs as fallback");
    }

    // Fetch content from each URL
    console.log(`Fetching content from ${urls.length} URLs...`);
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      console.log(`[${i + 1}/${urls.length}] Fetching: ${url}`);

      const content = await fetchWebPage(url);

      if (content.length > 100) {
        // Only include pages with substantial content
        const doc = new Document({
          id_: `web:${url}`,
          text: content,
          metadata: {
            source: "web",
            url: url,
            fetched_at: new Date().toISOString(),
            content_length: content.length,
          },
        });

        documents.push(doc);
      }

      // Rate limiting - wait 500ms between requests
      if (i < urls.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    console.log(
      `Successfully fetched ${documents.length} documents from web sources`,
    );

    // Write sample output for validation
    const sampleDoc = documents[0];
    if (sampleDoc) {
      const sample = {
        id: sampleDoc.id_,
        metadata: sampleDoc.metadata,
        text_preview: sampleDoc.getText().slice(0, 500) + "...",
        full_text_length: sampleDoc.getText().length,
        timestamp: new Date().toISOString(),
      };

      await fs.writeFile(
        path.join(outputDir, "sample.json"),
        JSON.stringify(sample, null, 2),
      );
    }

    // Write manifest
    const manifest = {
      source: "web",
      timestamp: new Date().toISOString(),
      urls_attempted: urls.length,
      documents_created: documents.length,
      total_content_length: documents.reduce(
        (sum, doc) => sum + doc.getText().length,
        0,
      ),
    };

    await fs.writeFile(
      path.join(outputDir, "manifest.json"),
      JSON.stringify(manifest, null, 2),
    );

    return documents;
  } catch (error) {
    // Write error log
    const errorLog = {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    };

    try {
      await fs.mkdir(outputDir, { recursive: true });
      await fs.writeFile(
        path.join(outputDir, "errors.log"),
        JSON.stringify(errorLog, null, 2),
      );
    } catch (writeError) {
      console.error("Failed to write error log:", writeError);
    }

    console.error("Web content fetching failed:", error);
    return []; // Return empty array instead of throwing
  }
}

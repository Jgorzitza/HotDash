#!/usr/bin/env tsx
/**
 * Scrape hotrodan.com to Staging
 * 
 * Extracts policies, FAQ, and product information from hotrodan.com
 * Stores in staging directory for CEO review (NO commits to knowledge base)
 * 
 * Usage:
 *   npx tsx scripts/knowledge-base/scrape-hotrodan.ts
 * 
 * Output:
 *   staging/knowledge-base/hotrodan-scrape-YYYY-MM-DD.json
 */

import { promises as fs } from "fs";
import { join } from "path";

interface ScrapedPage {
  url: string;
  title: string;
  content: string;
  scrapedAt: string;
  category: 'policy' | 'faq' | 'product' | 'about' | 'support';
  error?: string;
}

interface ScrapeResult {
  scrapedAt: string;
  totalPages: number;
  successfulPages: number;
  failedPages: number;
  pages: ScrapedPage[];
}

// Pages to scrape from hotrodan.com
const PAGES_TO_SCRAPE = [
  // Policies
  { url: 'https://hotrodan.com/pages/shipping-policy', category: 'policy' as const },
  { url: 'https://hotrodan.com/pages/refund-policy', category: 'policy' as const },
  { url: 'https://hotrodan.com/pages/privacy-policy', category: 'policy' as const },
  { url: 'https://hotrodan.com/pages/terms-of-service', category: 'policy' as const },
  
  // FAQ and Support
  { url: 'https://hotrodan.com/pages/faq', category: 'faq' as const },
  { url: 'https://hotrodan.com/pages/contact', category: 'support' as const },
  
  // About
  { url: 'https://hotrodan.com/pages/about', category: 'about' as const },
  
  // Products (main collections)
  { url: 'https://hotrodan.com/collections/all', category: 'product' as const },
  { url: 'https://hotrodan.com/collections/hose', category: 'product' as const },
  { url: 'https://hotrodan.com/collections/fittings', category: 'product' as const },
  { url: 'https://hotrodan.com/collections/tools', category: 'product' as const },
];

/**
 * Fetch and extract text content from a URL
 */
async function fetchPage(url: string): Promise<string> {
  console.log(`  Fetching: ${url}`);
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'HotDash-Knowledge-Base-Scraper/1.0',
    },
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const html = await response.text();
  
  // Extract text content (remove HTML tags)
  // This is a simple extraction - you may want to use a proper HTML parser
  const text = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove styles
    .replace(/<[^>]+>/g, ' ') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  return text;
}

/**
 * Extract title from HTML
 */
function extractTitle(html: string): string {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return titleMatch ? titleMatch[1].trim() : 'Untitled';
}

/**
 * Scrape a single page
 */
async function scrapePage(url: string, category: ScrapedPage['category']): Promise<ScrapedPage> {
  try {
    const html = await fetch(url, {
      headers: { 'User-Agent': 'HotDash-Knowledge-Base-Scraper/1.0' },
    }).then(r => r.text());
    
    const title = extractTitle(html);
    const content = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    return {
      url,
      title,
      content,
      scrapedAt: new Date().toISOString(),
      category,
    };
  } catch (error) {
    console.error(`  ❌ Error scraping ${url}:`, (error as Error).message);
    return {
      url,
      title: 'Error',
      content: '',
      scrapedAt: new Date().toISOString(),
      category,
      error: (error as Error).message,
    };
  }
}

/**
 * Main scraping function
 */
async function main() {
  console.log('🌐 Scraping hotrodan.com to staging\n');
  console.log('='.repeat(80));
  
  const startTime = Date.now();
  const scrapedAt = new Date().toISOString();
  const dateStr = scrapedAt.split('T')[0];
  
  // Ensure staging directory exists
  const stagingDir = join(process.cwd(), 'staging', 'knowledge-base');
  await fs.mkdir(stagingDir, { recursive: true });
  
  console.log(`\n📁 Staging directory: ${stagingDir}`);
  console.log(`📅 Scrape date: ${dateStr}\n`);
  
  // Scrape all pages
  const pages: ScrapedPage[] = [];
  let successCount = 0;
  let failCount = 0;
  
  for (const { url, category } of PAGES_TO_SCRAPE) {
    console.log(`\n📄 Scraping: ${url}`);
    console.log(`   Category: ${category}`);
    
    const page = await scrapePage(url, category);
    pages.push(page);
    
    if (page.error) {
      failCount++;
      console.log(`   ❌ Failed: ${page.error}`);
    } else {
      successCount++;
      console.log(`   ✅ Success: ${page.content.length} characters`);
      console.log(`   Title: ${page.title}`);
    }
    
    // Be nice to the server
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Create result object
  const result: ScrapeResult = {
    scrapedAt,
    totalPages: pages.length,
    successfulPages: successCount,
    failedPages: failCount,
    pages,
  };
  
  // Save to staging
  const outputPath = join(stagingDir, `hotrodan-scrape-${dateStr}.json`);
  await fs.writeFile(outputPath, JSON.stringify(result, null, 2));
  
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  
  console.log('\n' + '='.repeat(80));
  console.log('\n✅ Scraping complete!\n');
  console.log(`📊 Results:`);
  console.log(`   Total pages: ${result.totalPages}`);
  console.log(`   Successful: ${result.successfulPages}`);
  console.log(`   Failed: ${result.failedPages}`);
  console.log(`   Time: ${elapsed}s`);
  console.log(`\n💾 Saved to: ${outputPath}`);
  console.log(`\n📋 Next step: Generate CEO preview`);
  console.log(`   npx tsx scripts/knowledge-base/generate-preview.ts ${outputPath}\n`);
}

main().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});


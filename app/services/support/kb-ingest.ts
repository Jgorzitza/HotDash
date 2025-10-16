/**
 * KB Article Ingestion Service
 * 
 * Ingests support KB articles from data/support/ into the system
 * for use by RAG queries and support agents.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { glob } from 'glob';

export interface KBArticle {
  id: string;
  fileName: string;
  filePath: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  wordCount: number;
  charCount: number;
  lastModified: Date;
  metadata: Record<string, any>;
}

export interface IngestionResult {
  success: boolean;
  articlesProcessed: number;
  articles: KBArticle[];
  errors: Array<{ file: string; error: string }>;
  duration: number;
}

/**
 * Extract title from markdown content
 */
function extractTitle(content: string, fileName: string): string {
  // Look for first H1 heading
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    return h1Match[1].trim();
  }
  
  // Fallback to filename without extension
  return fileName.replace(/\.md$/, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Determine category from filename or content
 */
function determineCategory(fileName: string, content: string): string {
  const lowerName = fileName.toLowerCase();
  
  if (lowerName.includes('shipping')) return 'shipping';
  if (lowerName.includes('refund') || lowerName.includes('return')) return 'refunds';
  if (lowerName.includes('exchange')) return 'exchanges';
  if (lowerName.includes('order') || lowerName.includes('tracking')) return 'orders';
  if (lowerName.includes('product') || lowerName.includes('troubleshoot')) return 'products';
  if (lowerName.includes('faq') || lowerName.includes('question')) return 'general';
  if (lowerName.includes('policy')) return 'policies';
  
  return 'general';
}

/**
 * Extract tags from content
 */
function extractTags(content: string, category: string): string[] {
  const tags: Set<string> = new Set([category]);
  
  const lowerContent = content.toLowerCase();
  
  // Common support topics
  if (lowerContent.includes('shipping')) tags.add('shipping');
  if (lowerContent.includes('return')) tags.add('returns');
  if (lowerContent.includes('refund')) tags.add('refunds');
  if (lowerContent.includes('exchange')) tags.add('exchanges');
  if (lowerContent.includes('order')) tags.add('orders');
  if (lowerContent.includes('tracking')) tags.add('tracking');
  if (lowerContent.includes('cancel')) tags.add('cancellation');
  if (lowerContent.includes('warranty')) tags.add('warranty');
  if (lowerContent.includes('defect')) tags.add('defects');
  if (lowerContent.includes('damage')) tags.add('damage');
  if (lowerContent.includes('leak')) tags.add('leaks');
  if (lowerContent.includes('fitting')) tags.add('fittings');
  if (lowerContent.includes('hose')) tags.add('hoses');
  if (lowerContent.includes('ptfe')) tags.add('ptfe');
  if (lowerContent.includes('policy')) tags.add('policy');
  
  return Array.from(tags);
}

/**
 * Generate unique ID from filename
 */
function generateId(fileName: string): string {
  return fileName.replace(/\.md$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

/**
 * Ingest a single KB article
 */
async function ingestArticle(filePath: string): Promise<KBArticle> {
  const content = await fs.readFile(filePath, 'utf-8');
  const fileName = path.basename(filePath);
  const stats = await fs.stat(filePath);
  
  const title = extractTitle(content, fileName);
  const category = determineCategory(fileName, content);
  const tags = extractTags(content, category);
  const wordCount = content.split(/\s+/).length;
  const charCount = content.length;
  
  return {
    id: generateId(fileName),
    fileName,
    filePath,
    title,
    content,
    category,
    tags,
    wordCount,
    charCount,
    lastModified: stats.mtime,
    metadata: {
      source: 'data/support',
      format: 'markdown',
    },
  };
}

/**
 * Ingest all KB articles from directory
 */
export async function ingestKBArticles(sourcesDir: string = 'data/support'): Promise<IngestionResult> {
  const startTime = Date.now();
  const articles: KBArticle[] = [];
  const errors: Array<{ file: string; error: string }> = [];
  
  try {
    console.log(`📂 Ingesting KB articles from: ${sourcesDir}`);
    
    // Find all markdown files
    const files = await glob('**/*.md', { cwd: sourcesDir, absolute: true });
    
    console.log(`Found ${files.length} markdown files`);
    
    // Process each file
    for (const filePath of files) {
      try {
        const article = await ingestArticle(filePath);
        articles.push(article);
        console.log(`  ✓ ${article.fileName} - "${article.title}" (${article.category})`);
      } catch (error) {
        const errorMsg = (error as Error).message;
        errors.push({ file: path.basename(filePath), error: errorMsg });
        console.error(`  ✗ ${path.basename(filePath)}: ${errorMsg}`);
      }
    }
    
    const duration = Date.now() - startTime;
    
    console.log(`\n✅ Ingestion complete!`);
    console.log(`  Articles: ${articles.length}`);
    console.log(`  Errors: ${errors.length}`);
    console.log(`  Duration: ${duration}ms`);
    
    return {
      success: errors.length === 0,
      articlesProcessed: articles.length,
      articles,
      errors,
      duration,
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMsg = (error as Error).message;
    
    console.error(`\n❌ Ingestion failed: ${errorMsg}`);
    
    return {
      success: false,
      articlesProcessed: articles.length,
      articles,
      errors: [{ file: 'system', error: errorMsg }],
      duration,
    };
  }
}

/**
 * Get article by ID
 */
export async function getArticleById(id: string, articles: KBArticle[]): Promise<KBArticle | null> {
  return articles.find(a => a.id === id) || null;
}

/**
 * Search articles by category
 */
export async function getArticlesByCategory(category: string, articles: KBArticle[]): Promise<KBArticle[]> {
  return articles.filter(a => a.category === category);
}

/**
 * Search articles by tag
 */
export async function getArticlesByTag(tag: string, articles: KBArticle[]): Promise<KBArticle[]> {
  return articles.filter(a => a.tags.includes(tag));
}

/**
 * Search articles by text query
 */
export async function searchArticles(query: string, articles: KBArticle[]): Promise<KBArticle[]> {
  const lowerQuery = query.toLowerCase();
  
  return articles.filter(article => {
    const titleMatch = article.title.toLowerCase().includes(lowerQuery);
    const contentMatch = article.content.toLowerCase().includes(lowerQuery);
    const tagMatch = article.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
    
    return titleMatch || contentMatch || tagMatch;
  });
}

/**
 * Get ingestion statistics
 */
export function getIngestionStats(articles: KBArticle[]) {
  const totalWords = articles.reduce((sum, a) => sum + a.wordCount, 0);
  const totalChars = articles.reduce((sum, a) => sum + a.charCount, 0);
  
  const categoryCounts = articles.reduce((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const allTags = articles.flatMap(a => a.tags);
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    totalArticles: articles.length,
    totalWords,
    totalChars,
    avgWordsPerArticle: Math.round(totalWords / articles.length),
    avgCharsPerArticle: Math.round(totalChars / articles.length),
    categories: categoryCounts,
    tags: tagCounts,
  };
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const sourcesDir = process.argv[2] || 'data/support';
  
  ingestKBArticles(sourcesDir)
    .then((result) => {
      if (result.success) {
        console.log('\n📊 Statistics:');
        const stats = getIngestionStats(result.articles);
        console.log(JSON.stringify(stats, null, 2));
        process.exit(0);
      } else {
        console.error('\n❌ Ingestion had errors');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}


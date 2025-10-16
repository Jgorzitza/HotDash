/**
 * KB Search Optimization
 * Semantic search with embeddings, ranking, and relevance scoring
 */

import { createClient } from '@supabase/supabase-js';
import { kbSearchDuration, kbSearchResultsCount, kbSearchTopConfidence } from '../../metrics/prometheus.server';


// Lazily configure Supabase for tests: don't throw at import time if env is missing
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : (process.env.NODE_ENV === 'test'
      ? createClient('http://localhost', 'test-key')
      : (() => { throw new Error('Supabase not configured'); })());

type ArticleRecord = {
  id: number;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  confidence_score: number;
  embedding?: number[];
  archived_at?: string | null;
};

interface SearchResult {
  id: number;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  confidenceScore: number;
  relevanceScore: number;
  combinedScore: number;
}

interface SearchOptions {
  category?: string;
  minConfidence?: number;
  limit?: number;
  includeArchived?: boolean;
}

function recordSearchMetrics(
  type: 'semantic' | 'keyword' | 'hybrid' | 'contextual',
  startMs: number,
  error: unknown,
  results: SearchResult[]
) {
  try {
    const duration = (Date.now() - startMs) / 1000;
    const success = error ? 'false' : 'true';
    kbSearchDuration.observe({ type, success }, duration);
    kbSearchResultsCount.observe({ type }, results.length);
    if (results[0]) {
      kbSearchTopConfidence.observe({ type }, results[0].confidenceScore);
    }
  } catch {
    // metrics are best-effort; do not throw
  }
}

/**
 * Generate embedding for text using OpenAI
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text
    })
  });

  const data = await response.json();
  return data.data[0].embedding;
}

/**
 * Semantic search using embeddings
 */
export async function semanticSearch(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const start = Date.now();
  let err: unknown = undefined;
  let results: SearchResult[] = [];
  try {
    const {
      category,
      minConfidence = 0.6,
      limit = 5,
      includeArchived = false,
    } = options;

    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(query);

    const articles = await fetchArticles({
      category,
      minConfidence,
      includeArchived,
    });

    // Calculate similarity scores
    results = articles
      .map((article) => {
        const similarity = article.embedding
          ? cosineSimilarity(queryEmbedding, article.embedding)
          : 0;

        // Combined score: similarity * confidence
        const combinedScore = similarity * article.confidence_score;

        return {
          id: article.id,
          question: article.question,
          answer: article.answer,
          category: article.category,
          tags: article.tags,
          confidenceScore: article.confidence_score,
          relevanceScore: similarity,
          combinedScore,
        };
      })
      .sort((a, b) => b.combinedScore - a.combinedScore)
      .slice(0, limit);

    return results;
  } catch (e) {
    err = e;
    throw e;
  } finally {
    recordSearchMetrics('semantic', start, err, results);
  }
}

/**
 * Hybrid search (semantic + keyword)
 */
export async function hybridSearch(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const start = Date.now();
  let err: unknown = undefined;
  let results: SearchResult[] = [];
  try {
    const semanticResults = await semanticSearch(query, options);
    const keywordResults = await keywordSearch(query, options);

    // Merge and re-rank results
    const merged = mergeSearchResults(semanticResults, keywordResults);
    results = merged.slice(0, options.limit || 5);
    return results;
  } catch (e) {
    err = e;
    throw e;
  } finally {
    recordSearchMetrics('hybrid', start, err, results);
  }
}

/**
 * Keyword search using tags and text matching
 */
async function keywordSearch(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const start = Date.now();
  let err: unknown = undefined;
  let results: SearchResult[] = [];
  try {
    const {
      category,
      minConfidence = 0.6,
      limit = 5,
      includeArchived = false,
    } = options;

    const keywords = query.toLowerCase().split(/\s+/);

    const articles = await fetchArticles({
      category,
      minConfidence,
      includeArchived,
    });

    // Score articles based on keyword matches
    results = articles
      .map((article) => {
        let score = 0;
        const articleText = `${article.question} ${article.answer} ${article.tags.join(' ')}`.toLowerCase();

        keywords.forEach((keyword) => {
          if (articleText.includes(keyword)) {
            score += 1;
          }
        });

        // Normalize score
        const relevanceScore = score / keywords.length;
        const combinedScore = relevanceScore * article.confidence_score;

        return {
          id: article.id,
          question: article.question,
          answer: article.answer,
          category: article.category,
          tags: article.tags,
          confidenceScore: article.confidence_score,
          relevanceScore,
          combinedScore,
        };
      })
      .filter((r) => r.relevanceScore > 0)
      .sort((a, b) => b.combinedScore - a.combinedScore)
      .slice(0, limit);

    return results;
  } catch (e) {
    err = e;
    throw e;
  } finally {
    recordSearchMetrics('keyword', start, err, results);
  }
}

async function fetchArticles(options: {
  category?: string;
  minConfidence: number;
  includeArchived: boolean;
}): Promise<ArticleRecord[]> {
  const { category, minConfidence, includeArchived } = options;
  const baseQuery = supabase.from('kb_articles').select('*');
  const supportsQueryBuilder = typeof (baseQuery as any).gte === 'function';

  if (supportsQueryBuilder) {
    let builder = (baseQuery as any).gte('confidence_score', minConfidence);

    if (category) {
      builder = builder.eq('category', category);
    }

    if (!includeArchived) {
      builder = builder.is('archived_at', null);
    }

    const { data = [], error } = await builder;
    if (error) {
      console.error('[Search] Error fetching articles:', error);
    }
    return data ?? [];
  }

  const { data = [], error } = await (baseQuery as any);
  if (error) {
    console.error('[Search] Error fetching articles:', error);
    return [];
  }

  return (data ?? [])
    .filter((article: ArticleRecord) => includeArchived || !article.archived_at)
    .filter((article: ArticleRecord) => !category || article.category === category)
    .filter((article: ArticleRecord) => article.confidence_score >= minConfidence);
}

/**
 * Merge semantic and keyword search results
 */
function mergeSearchResults(
  semanticResults: SearchResult[],
  keywordResults: SearchResult[]
): SearchResult[] {
  const merged = new Map<number, SearchResult>();

  // Add semantic results with weight 0.7
  semanticResults.forEach(result => {
    merged.set(result.id, {
      ...result,
      combinedScore: result.combinedScore * 0.7
    });
  });

  // Add/merge keyword results with weight 0.3
  keywordResults.forEach(result => {
    const existing = merged.get(result.id);
    if (existing) {
      existing.combinedScore += result.combinedScore * 0.3;
    } else {
      merged.set(result.id, {
        ...result,
        combinedScore: result.combinedScore * 0.3
      });
    }
  });

  return Array.from(merged.values())
    .sort((a, b) => b.combinedScore - a.combinedScore);
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) return 0;

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }

  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

/**
 * Update article embedding
 */
export async function updateArticleEmbedding(articleId: number): Promise<void> {
  const { data: article } = await supabase
    .from('kb_articles')
    .select('question, answer')
    .eq('id', articleId)
    .single();

  if (!article) return;

  const text = `${article.question} ${article.answer}`;
  const embedding = await generateEmbedding(text);

  await supabase
    .from('kb_articles')
    .update({ embedding })
    .eq('id', articleId);

  console.log('[Search] Updated embedding for article:', articleId);
}

/**
 * Batch update embeddings for all articles
 */
export async function batchUpdateEmbeddings(): Promise<number> {
  const { data: articles } = await supabase
    .from('kb_articles')
    .select('id, question, answer')
    .is('embedding', null)
    .is('archived_at', null);

  if (!articles || articles.length === 0) return 0;

  let updated = 0;

  for (const article of articles) {
    try {
      await updateArticleEmbedding(article.id);
      updated++;

      // Rate limit: wait 100ms between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('[Search] Error updating embedding:', article.id, error);
    }
  }

  console.log('[Search] Batch updated embeddings:', updated);
  return updated;
}

/**
 * Search with context (considers recent conversation)
 */
export async function contextualSearch(
  query: string,
  conversationHistory: string[],
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const start = Date.now();
  let err: unknown = undefined;
  let results: SearchResult[] = [];
  try {
    // Combine query with recent context
    const contextualQuery = [...conversationHistory.slice(-3), query].join(' ');
    results = await hybridSearch(contextualQuery, options);
    return results;
  } catch (e) {
    err = e;
    throw e;
  } finally {
    recordSearchMetrics('contextual', start, err, results);
  }
}

/**
 * Get related articles based on article ID
 */
export async function getRelatedArticles(
  articleId: number,
  limit: number = 5
): Promise<SearchResult[]> {
  const { data: article } = await supabase
    .from('kb_articles')
    .select('question, answer, category, embedding')
    .eq('id', articleId)
    .single();

  if (!article || !article.embedding) return [];

  // Find similar articles
  const { data: articles } = await supabase
    .from('kb_articles')
    .select('*')
    .eq('category', article.category)
    .neq('id', articleId)
    .is('archived_at', null);

  if (!articles) return [];

  const results: SearchResult[] = articles
    .map(a => {
      const similarity = a.embedding
        ? cosineSimilarity(article.embedding, a.embedding)
        : 0;

      return {
        id: a.id,
        question: a.question,
        answer: a.answer,
        category: a.category,
        tags: a.tags,
        confidenceScore: a.confidence_score,
        relevanceScore: similarity,
        combinedScore: similarity * a.confidence_score
      };
    })
    .sort((a, b) => b.combinedScore - a.combinedScore)
    .slice(0, limit);

  return results;
}

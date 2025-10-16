/**
 * Knowledge Graph
 * Build and traverse relationships between KB articles
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ArticleNode {
  id: number;
  question: string;
  category: string;
  tags: string[];
}

interface ArticleLink {
  fromId: number;
  toId: number;
  linkType: 'related' | 'prerequisite' | 'alternative' | 'followup';
  strength: number;
}

interface GraphPath {
  articles: ArticleNode[];
  totalStrength: number;
}

/**
 * Create link between two articles
 */
export async function createArticleLink(
  fromArticleId: number,
  toArticleId: number,
  linkType: ArticleLink['linkType'],
  strength: number = 0.5
): Promise<void> {
  await supabase
    .from('kb_article_links')
    .insert({
      from_article_id: fromArticleId,
      to_article_id: toArticleId,
      link_type: linkType,
      strength
    });

  console.log('[Graph] Created link:', { fromArticleId, toArticleId, linkType });
}

/**
 * Auto-discover and create links between related articles
 */
export async function autoDiscoverLinks(): Promise<number> {
  const { data: articles } = await supabase
    .from('kb_articles')
    .select('id, question, answer, category, tags, embedding')
    .is('archived_at', null);

  if (!articles || articles.length < 2) return 0;

  let linksCreated = 0;

  for (let i = 0; i < articles.length; i++) {
    for (let j = i + 1; j < articles.length; j++) {
      const article1 = articles[i];
      const article2 = articles[j];

      // Check if link already exists
      const { data: existing } = await supabase
        .from('kb_article_links')
        .select('*')
        .eq('from_article_id', article1.id)
        .eq('to_article_id', article2.id)
        .single();

      if (existing) continue;

      // Calculate relationship strength
      const relationship = analyzeRelationship(article1, article2);

      if (relationship.strength > 0.6) {
        await createArticleLink(
          article1.id,
          article2.id,
          relationship.type,
          relationship.strength
        );
        linksCreated++;
      }
    }
  }

  console.log('[Graph] Auto-discovered links:', linksCreated);
  return linksCreated;
}

/**
 * Analyze relationship between two articles
 */
function analyzeRelationship(article1: any, article2: any): {
  type: ArticleLink['linkType'];
  strength: number;
} {
  // Same category increases strength
  let strength = article1.category === article2.category ? 0.3 : 0.1;

  // Shared tags increase strength
  const sharedTags = article1.tags.filter((tag: string) => article2.tags.includes(tag));
  strength += sharedTags.length * 0.15;

  // Embedding similarity (if available)
  if (article1.embedding && article2.embedding) {
    const similarity = cosineSimilarity(article1.embedding, article2.embedding);
    strength += similarity * 0.4;
  }

  // Determine link type based on content
  let type: ArticleLink['linkType'] = 'related';

  const q1 = article1.question.toLowerCase();
  const q2 = article2.question.toLowerCase();

  if (q1.includes('how') && q2.includes('what')) {
    type = 'prerequisite';
  } else if (q1.includes('or') || q2.includes('alternative')) {
    type = 'alternative';
  } else if (q1.includes('next') || q1.includes('after')) {
    type = 'followup';
  }

  return { type, strength: Math.min(strength, 1.0) };
}

/**
 * Calculate cosine similarity
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
 * Get linked articles for a given article
 */
export async function getLinkedArticles(
  articleId: number,
  linkType?: ArticleLink['linkType']
): Promise<Array<ArticleNode & { linkType: string; strength: number }>> {
  let query = supabase
    .from('kb_article_links')
    .select(`
      to_article_id,
      link_type,
      strength,
      kb_articles!kb_article_links_to_article_id_fkey (
        id,
        question,
        category,
        tags
      )
    `)
    .eq('from_article_id', articleId);

  if (linkType) {
    query = query.eq('link_type', linkType);
  }

  const { data: links } = await query;

  if (!links) return [];

  return links.map(link => ({
    id: link.kb_articles.id,
    question: link.kb_articles.question,
    category: link.kb_articles.category,
    tags: link.kb_articles.tags,
    linkType: link.link_type,
    strength: link.strength
  }));
}

/**
 * Find path between two articles
 */
export async function findPath(
  startArticleId: number,
  endArticleId: number,
  maxDepth: number = 3
): Promise<GraphPath | null> {
  const visited = new Set<number>();
  const queue: Array<{ articleId: number; path: number[]; strength: number }> = [
    { articleId: startArticleId, path: [startArticleId], strength: 1.0 }
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.articleId === endArticleId) {
      // Found path, fetch article details
      const { data: articles } = await supabase
        .from('kb_articles')
        .select('id, question, category, tags')
        .in('id', current.path);

      if (!articles) return null;

      return {
        articles: articles.map(a => ({
          id: a.id,
          question: a.question,
          category: a.category,
          tags: a.tags
        })),
        totalStrength: current.strength
      };
    }

    if (current.path.length >= maxDepth) continue;

    visited.add(current.articleId);

    // Get linked articles
    const linked = await getLinkedArticles(current.articleId);

    for (const link of linked) {
      if (!visited.has(link.id)) {
        queue.push({
          articleId: link.id,
          path: [...current.path, link.id],
          strength: current.strength * link.strength
        });
      }
    }
  }

  return null;
}

/**
 * Get article clusters (groups of highly connected articles)
 */
export async function getArticleClusters(): Promise<Array<{
  category: string;
  articles: ArticleNode[];
  avgConnectivity: number;
}>> {
  const { data: articles } = await supabase
    .from('kb_articles')
    .select('id, question, category, tags')
    .is('archived_at', null);

  if (!articles) return [];

  // Group by category
  const clusters = new Map<string, ArticleNode[]>();

  articles.forEach(article => {
    if (!clusters.has(article.category)) {
      clusters.set(article.category, []);
    }
    clusters.get(article.category)!.push({
      id: article.id,
      question: article.question,
      category: article.category,
      tags: article.tags
    });
  });

  // Calculate connectivity for each cluster
  const result: Array<{
    category: string;
    articles: ArticleNode[];
    avgConnectivity: number;
  }> = [];

  for (const [category, clusterArticles] of clusters) {
    let totalLinks = 0;

    for (const article of clusterArticles) {
      const links = await getLinkedArticles(article.id);
      totalLinks += links.length;
    }

    const avgConnectivity = clusterArticles.length > 0 
      ? totalLinks / clusterArticles.length 
      : 0;

    result.push({
      category,
      articles: clusterArticles,
      avgConnectivity
    });
  }

  return result.sort((a, b) => b.avgConnectivity - a.avgConnectivity);
}

/**
 * Suggest next articles based on current article
 */
export async function suggestNextArticles(
  currentArticleId: number,
  limit: number = 3
): Promise<ArticleNode[]> {
  // Get followup links first
  const followups = await getLinkedArticles(currentArticleId, 'followup');

  if (followups.length >= limit) {
    return followups.slice(0, limit);
  }

  // Get related links
  const related = await getLinkedArticles(currentArticleId, 'related');

  const combined = [...followups, ...related]
    .sort((a, b) => b.strength - a.strength)
    .slice(0, limit);

  return combined.map(({ linkType, strength, ...article }) => article);
}

/**
 * Build topic hierarchy
 */
export async function buildTopicHierarchy(): Promise<any> {
  const { data: topics } = await supabase
    .from('kb_topics')
    .select('*')
    .order('name');

  if (!topics) return null;

  // Build tree structure
  const topicMap = new Map();
  const roots: any[] = [];

  topics.forEach(topic => {
    topicMap.set(topic.id, { ...topic, children: [] });
  });

  topics.forEach(topic => {
    const node = topicMap.get(topic.id);
    if (topic.parent_topic_id) {
      const parent = topicMap.get(topic.parent_topic_id);
      if (parent) {
        parent.children.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
}


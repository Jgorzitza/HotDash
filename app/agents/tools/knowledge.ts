/**
 * Knowledge Base Tool for AI-Customer Agent
 * Integrates KB search and retrieval into agent workflow
 */

import { tool } from 'ai';
import { z } from 'zod';
import { hybridSearch, contextualSearch } from '../../lib/knowledge/search';
import { updateArticleConfidence } from '../../lib/knowledge/quality';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Search knowledge base tool
 */
export const searchKnowledgeBase = tool({
  description: 'Search the knowledge base for relevant customer support articles. Use this before drafting replies to find proven answers.',
  parameters: z.object({
    query: z.string().describe('The customer question or search query'),
    category: z.enum(['orders', 'shipping', 'returns', 'products', 'technical', 'policies']).optional().describe('Filter by category'),
    limit: z.number().optional().default(5).describe('Maximum number of results to return')
  }),
  execute: async ({ query, category, limit }) => {
    try {
      const results = await hybridSearch(query, {
        category,
        minConfidence: 0.60,
        limit
      });

      if (results.length === 0) {
        return {
          found: false,
          message: 'No relevant KB articles found. Draft a reply based on general knowledge and policies.',
          articles: []
        };
      }

      return {
        found: true,
        message: `Found ${results.length} relevant KB articles. Use these as context for your reply.`,
        articles: results.map(r => ({
          id: r.id,
          question: r.question,
          answer: r.answer,
          category: r.category,
          tags: r.tags,
          confidence: r.confidenceScore,
          relevance: r.relevanceScore
        }))
      };
    } catch (error) {
      console.error('[KB Tool] Search error:', error);
      return {
        found: false,
        message: 'Error searching knowledge base. Draft reply without KB context.',
        articles: []
      };
    }
  }
});

/**
 * Search with conversation context
 */
export const searchKnowledgeWithContext = tool({
  description: 'Search knowledge base using conversation history for better context. Use when the customer question references previous messages.',
  parameters: z.object({
    query: z.string().describe('The current customer question'),
    conversationHistory: z.array(z.string()).describe('Recent messages from the conversation'),
    category: z.enum(['orders', 'shipping', 'returns', 'products', 'technical', 'policies']).optional()
  }),
  execute: async ({ query, conversationHistory, category }) => {
    try {
      const results = await contextualSearch(query, conversationHistory, {
        category,
        minConfidence: 0.60,
        limit: 5
      });

      return {
        found: results.length > 0,
        articles: results.map(r => ({
          id: r.id,
          question: r.question,
          answer: r.answer,
          confidence: r.confidenceScore,
          relevance: r.relevanceScore
        }))
      };
    } catch (error) {
      console.error('[KB Tool] Contextual search error:', error);
      return { found: false, articles: [] };
    }
  }
});

/**
 * Track KB article usage in draft
 */
export const trackKBUsage = tool({
  description: 'Track which KB articles were used in drafting a reply. Call this after using KB articles to draft.',
  parameters: z.object({
    articleIds: z.array(z.number()).describe('IDs of KB articles used in the draft'),
    approvalId: z.number().optional().describe('Approval ID if available'),
    wasHelpful: z.boolean().optional().describe('Whether the KB articles were helpful')
  }),
  execute: async ({ articleIds, approvalId, wasHelpful }) => {
    try {
      // Log usage for each article
      for (const articleId of articleIds) {
        await supabase
          .from('kb_usage_log')
          .insert({
            article_id: articleId,
            approval_id: approvalId,
            used_in_draft: true,
            was_helpful: wasHelpful
          });
      }

      return {
        success: true,
        message: `Tracked usage of ${articleIds.length} KB articles`
      };
    } catch (error) {
      console.error('[KB Tool] Usage tracking error:', error);
      return {
        success: false,
        message: 'Error tracking KB usage'
      };
    }
  }
});

/**
 * Get related articles for follow-up
 */
export const getRelatedArticles = tool({
  description: 'Get related KB articles for follow-up questions or additional context.',
  parameters: z.object({
    articleId: z.number().describe('ID of the current KB article'),
    limit: z.number().optional().default(3).describe('Number of related articles to return')
  }),
  execute: async ({ articleId, limit }) => {
    try {
      const { data: links } = await supabase
        .from('kb_article_links')
        .select(`
          to_article_id,
          link_type,
          strength,
          kb_articles!kb_article_links_to_article_id_fkey (
            id,
            question,
            answer,
            category,
            confidence_score
          )
        `)
        .eq('from_article_id', articleId)
        .order('strength', { ascending: false })
        .limit(limit);

      if (!links || links.length === 0) {
        return {
          found: false,
          articles: []
        };
      }

      return {
        found: true,
        articles: links.map(link => ({
          id: link.kb_articles.id,
          question: link.kb_articles.question,
          answer: link.kb_articles.answer,
          category: link.kb_articles.category,
          confidence: link.kb_articles.confidence_score,
          linkType: link.link_type,
          strength: link.strength
        }))
      };
    } catch (error) {
      console.error('[KB Tool] Related articles error:', error);
      return { found: false, articles: [] };
    }
  }
});

/**
 * Format KB context for agent prompt
 */
export function formatKBContext(articles: any[]): string {
  if (articles.length === 0) {
    return 'No KB articles found. Draft based on general knowledge and company policies.';
  }

  let context = 'KNOWLEDGE BASE CONTEXT:\n\n';
  context += 'Use the following proven answers as reference. Adapt the language to match the customer\'s tone while maintaining accuracy and policy compliance.\n\n';

  articles.forEach((article, index) => {
    context += `[Article ${index + 1} - Confidence: ${(article.confidence * 100).toFixed(0)}%]\n`;
    context += `Q: ${article.question}\n`;
    context += `A: ${article.answer}\n`;
    if (article.tags && article.tags.length > 0) {
      context += `Tags: ${article.tags.join(', ')}\n`;
    }
    context += '\n';
  });

  return context;
}

/**
 * Update KB based on approval feedback
 */
export async function updateKBFromApproval(
  approvalId: number,
  articleIds: number[],
  wasSuccessful: boolean,
  grades?: { tone: number; accuracy: number; policy: number }
): Promise<void> {
  for (const articleId of articleIds) {
    await updateArticleConfidence(articleId, wasSuccessful, grades);
  }

  console.log('[KB Integration] Updated KB from approval:', {
    approvalId,
    articleCount: articleIds.length,
    wasSuccessful
  });
}

/**
 * AI-Customer agent KB integration workflow
 */
export async function aiCustomerKBWorkflow(
  customerMessage: string,
  conversationHistory: string[] = [],
  category?: string
): Promise<{
  kbArticles: any[];
  context: string;
  articleIds: number[];
}> {
  // Search KB with context
  const results = conversationHistory.length > 0
    ? await contextualSearch(customerMessage, conversationHistory, { category, minConfidence: 0.60, limit: 5 })
    : await hybridSearch(customerMessage, { category, minConfidence: 0.60, limit: 5 });

  const kbArticles = results.map(r => ({
    id: r.id,
    question: r.question,
    answer: r.answer,
    category: r.category,
    tags: r.tags,
    confidence: r.confidenceScore,
    relevance: r.relevanceScore
  }));

  const context = formatKBContext(kbArticles);
  const articleIds = kbArticles.map(a => a.id);

  return {
    kbArticles,
    context,
    articleIds
  };
}

/**
 * Export all KB tools for agent
 */
export const knowledgeBaseTools = {
  searchKnowledgeBase,
  searchKnowledgeWithContext,
  trackKBUsage,
  getRelatedArticles
};


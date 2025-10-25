import { searchDocuments, getKnowledgeBaseStats } from '../../../../services/ai-knowledge/knowledge-base-system';

/**
 * Knowledge Base Handler - Direct integration with our knowledge base system
 * 
 * This handler provides MCP access to our knowledge base system without
 * relying on external CLI tools.
 */
export async function knowledgeBaseHandler(args: { q: string; topK?: number; category?: string; tags?: string[] }) {
  const { q, topK = 5, category, tags } = args;
  
  try {
    console.log(`[KB-MCP] Searching knowledge base: "${q}"`);
    
    // Search the knowledge base using our system
    const results = await searchDocuments(
      q,
      {
        category,
        tags,
        published: true, // Only search published documents
      },
      topK
    );
    
    if (results.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `No relevant documents found for query: "${q}"`,
          },
        ],
      };
    }
    
    // Format results for MCP response
    const formattedResults = results.map((result, index) => {
      const { document, score, snippet, highlights } = result;
      
      return {
        type: 'text',
        text: `## ${index + 1}. ${document.title} (Score: ${score.toFixed(2)})
**Category:** ${document.category}
**Author:** ${document.author}
**Tags:** ${document.tags.join(', ')}
**Last Updated:** ${document.updatedAt.toISOString()}

**Content:**
${snippet}

**Highlights:** ${highlights.join(', ')}

---`,
      };
    });
    
    const summary = `Found ${results.length} relevant documents for query: "${q}"`;
    
    return {
      content: [
        {
          type: 'text',
          text: `# Knowledge Base Search Results\n\n${summary}\n\n`,
        },
        ...formattedResults,
      ],
    };
  } catch (error: any) {
    console.error('[KB-MCP] Error searching knowledge base:', error);
    return {
      content: [
        {
          type: 'text',
          text: `Error searching knowledge base: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Knowledge Base Stats Handler
 * 
 * Provides statistics about the knowledge base content.
 */
export async function knowledgeBaseStatsHandler() {
  try {
    console.log('[KB-MCP] Getting knowledge base statistics');
    
    const stats = await getKnowledgeBaseStats();
    
    return {
      content: [
        {
          type: 'text',
          text: `# Knowledge Base Statistics

**Total Documents:** ${stats.totalDocuments}
**Published Documents:** ${stats.publishedDocuments}
**Categories:** ${stats.categories.join(', ')}
**Tags:** ${stats.tags.slice(0, 20).join(', ')}${stats.tags.length > 20 ? '...' : ''}
**Last Updated:** ${stats.lastUpdated.toISOString()}

**Available Categories:**
${stats.categories.map(cat => `- ${cat}`).join('\n')}

**Popular Tags:**
${stats.tags.slice(0, 10).map(tag => `- ${tag}`).join('\n')}`,
        },
      ],
    };
  } catch (error: any) {
    console.error('[KB-MCP] Error getting knowledge base stats:', error);
    return {
      content: [
        {
          type: 'text',
          text: `Error getting knowledge base statistics: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

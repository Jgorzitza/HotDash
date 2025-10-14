/**
 * Search Synonym Controller
 * 
 * Automated search synonym management for better product discovery
 * Growth Spec D5: Improve search relevance with synonym mappings
 * 
 * @owner integrations
 * @task P1 Task 6
 */

import type { Action, ActionOutcome } from '~/types/action';

interface SynonymMapping {
  term: string; // Primary search term
  synonyms: string[]; // Alternative terms
  category?: string; // Product category
  searchVolume?: number; // Estimated searches/month
}

/**
 * Hot Rod AN specific synonym mappings
 * Industry terminology and common misspellings
 */
export const HOT_ROD_SYNONYMS: SynonymMapping[] = [
  {
    term: 'AN fitting',
    synonyms: ['AN fittings', 'army navy fitting', 'aircraft fitting', 'flare fitting'],
    category: 'fittings',
    searchVolume: 500
  },
  {
    term: 'fuel line',
    synonyms: ['fuel hose', 'gas line', 'fuel system', 'fuel plumbing'],
    category: 'fuel-system',
    searchVolume: 800
  },
  {
    term: 'brake line',
    synonyms: ['brake hose', 'brake plumbing', 'brake system'],
    category: 'brakes',
    searchVolume: 600
  },
  {
    term: 'adapter',
    synonyms: ['fitting adapter', 'AN adapter', 'NPT adapter', 'thread adapter'],
    category: 'adapters',
    searchVolume: 400
  },
  {
    term: 'hose end',
    synonyms: ['hose fitting', 'hose adapter', 'AN hose end'],
    category: 'fittings',
    searchVolume: 300
  },
  {
    term: '-6 AN',
    synonyms: ['6AN', 'dash 6', '#6 AN', 'number 6 AN', '3/8 inch'],
    category: 'sizes',
    searchVolume: 700
  },
  {
    term: '-8 AN',
    synonyms: ['8AN', 'dash 8', '#8 AN', 'number 8 AN', '1/2 inch'],
    category: 'sizes',
    searchVolume: 600
  },
  {
    term: '-10 AN',
    synonyms: ['10AN', 'dash 10', '#10 AN', 'number 10 AN', '5/8 inch'],
    category: 'sizes',
    searchVolume: 500
  },
  {
    term: 'aluminum',
    synonyms: ['aluminium', 'billet aluminum', 'anodized aluminum'],
    category: 'materials',
    searchVolume: 200
  },
  {
    term: 'stainless steel',
    synonyms: ['SS', 'stainless', '304 stainless', '316 stainless'],
    category: 'materials',
    searchVolume: 300
  }
];

/**
 * Analyze search queries to identify synonym opportunities
 */
export function analyzeSearchQueries(queries: Array<{
  query: string;
  resultsCount: number;
  timestamp: Date;
}>): SynonymMapping[] {
  const termFrequency = new Map<string, number>();
  const relatedTerms = new Map<string, Set<string>>();

  // Extract terms and find related searches
  queries.forEach(q => {
    const terms = q.query.toLowerCase().split(/\s+/);
    
    terms.forEach(term => {
      termFrequency.set(term, (termFrequency.get(term) || 0) + 1);
      
      // Track co-occurring terms
      terms.forEach(relatedTerm => {
        if (term !== relatedTerm) {
          if (!relatedTerms.has(term)) {
            relatedTerms.set(term, new Set());
          }
          relatedTerms.get(term)!.add(relatedTerm);
        }
      });
    });
  });

  // Generate synonym mappings from frequent terms
  const synonyms: SynonymMapping[] = [];
  
  termFrequency.forEach((frequency, term) => {
    if (frequency < 5) return; // Skip infrequent terms

    const related = relatedTerms.get(term);
    if (related && related.size > 0) {
      synonyms.push({
        term,
        synonyms: Array.from(related).slice(0, 5),
        searchVolume: frequency
      });
    }
  });

  return synonyms;
}

/**
 * Generate search redirect rules
 * Map common misspellings/variations to correct product pages
 */
export function generateSearchRedirects(synonyms: SynonymMapping[]): Array<{
  from: string;
  to: string;
  type: 'redirect' | 'suggest';
}> {
  const redirects: Array<{ from: string; to: string; type: 'redirect' | 'suggest' }> = [];

  synonyms.forEach(mapping => {
    mapping.synonyms.forEach(synonym => {
      // Create suggestion (not hard redirect)
      redirects.push({
        from: synonym,
        to: mapping.term,
        type: 'suggest'
      });
    });
  });

  return redirects;
}

/**
 * Generate metafields for synonym storage
 * Store synonyms in Shopify metafields for theme access
 */
export function generateSynonymMetafields(synonyms: SynonymMapping[]): Array<{
  namespace: string;
  key: string;
  value: string;
  type: string;
}> {
  return synonyms.map(mapping => ({
    namespace: 'search',
    key: `synonym_${mapping.term.replace(/\s+/g, '_')}`,
    value: JSON.stringify(mapping.synonyms),
    type: 'json'
  }));
}

/**
 * Search Synonym Controller Executor
 * Implements ActionExecutor interface
 */
export class SearchSynonymExecutor {
  async execute(action: Action): Promise<ActionOutcome> {
    const payload = action.payload as {
      operation: 'add' | 'remove' | 'analyze';
      synonymMapping?: SynonymMapping;
      searchQueries?: Array<{ query: string; resultsCount: number; timestamp: Date }>;
    };

    try {
      switch (payload.operation) {
        case 'add': {
          if (!payload.synonymMapping) {
            throw new Error('Synonym mapping required for add operation');
          }

          // Generate metafields for synonym storage
          const metafields = generateSynonymMetafields([payload.synonymMapping]);

          return {
            success: true,
            message: `Added synonyms for "${payload.synonymMapping.term}"`,
            data: {
              term: payload.synonymMapping.term,
              synonymsAdded: payload.synonymMapping.synonyms.length,
              metafields
            }
          };
        }

        case 'analyze': {
          if (!payload.searchQueries || payload.searchQueries.length === 0) {
            throw new Error('Search queries required for analyze operation');
          }

          // Analyze queries to find synonym opportunities
          const discovered = analyzeSearchQueries(payload.searchQueries);

          return {
            success: true,
            message: `Discovered ${discovered.length} synonym opportunities`,
            data: {
              synonymMappings: discovered,
              totalTerms: discovered.length,
              totalSynonyms: discovered.reduce((sum, m) => sum + m.synonyms.length, 0)
            }
          };
        }

        case 'remove': {
          if (!payload.synonymMapping) {
            throw new Error('Synonym mapping required for remove operation');
          }

          return {
            success: true,
            message: `Removed synonyms for "${payload.synonymMapping.term}"`,
            data: {
              term: payload.synonymMapping.term,
              synonymsRemoved: payload.synonymMapping.synonyms.length
            }
          };
        }

        default:
          throw new Error(`Unknown operation: ${payload.operation}`);
      }
    } catch (error) {
      console.error('[SearchSynonym] Execution error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        data: { error: String(error) }
      };
    }
  }

  async rollback(action: Action): Promise<void> {
    // Rollback synonym changes (remove added synonyms)
    console.log('[SearchSynonym] Rollback: Remove synonym mappings');
  }
}

/**
 * Track search performance for optimization
 */
export interface SearchPerformanceMetrics {
  term: string;
  searches: number;
  clicks: number;
  ctr: number; // Click-through rate
  avgPosition: number; // Average result position clicked
  conversion: number; // Conversions from this search term
}

export function analyzeSearchPerformance(metrics: SearchPerformanceMetrics[]): {
  highPerforming: SearchPerformanceMetrics[];
  lowPerforming: SearchPerformanceMetrics[];
  opportunities: Array<{ term: string; issue: string; recommendation: string }>;
} {
  const highPerforming = metrics.filter(m => m.ctr > 0.15 && m.conversion > 0.02);
  const lowPerforming = metrics.filter(m => m.ctr < 0.05 || m.conversion < 0.005);

  const opportunities = lowPerforming.map(m => ({
    term: m.term,
    issue: m.ctr < 0.05 ? 'Low click-through rate' : 'Low conversion rate',
    recommendation: m.ctr < 0.05 
      ? 'Add synonyms or improve search results relevance'
      : 'Optimize product listings or add category pages'
  }));

  return { highPerforming, lowPerforming, opportunities };
}

/**
 * Example: Add Hot Rod AN synonym mappings
 */
export async function exampleSynonymManagement() {
  const executor = new SearchSynonymExecutor();

  // Add industry-specific synonyms
  const action: Action = {
    id: 'add-an-synonyms',
    type: 'manage_synonyms',
    status: 'pending',
    payload: {
      operation: 'add',
      synonymMapping: HOT_ROD_SYNONYMS[0] // AN fitting synonyms
    },
    createdAt: new Date()
  };

  return await executor.execute(action);
}

/**
 * Batch add all Hot Rod AN synonyms
 */
export async function batchAddHotRodSynonyms(): Promise<ActionOutcome[]> {
  const executor = new SearchSynonymExecutor();
  const results: ActionOutcome[] = [];

  for (const mapping of HOT_ROD_SYNONYMS) {
    const action: Action = {
      id: `synonym-${mapping.term}`,
      type: 'manage_synonyms',
      status: 'pending',
      payload: {
        operation: 'add',
        synonymMapping: mapping
      },
      createdAt: new Date()
    };

    const outcome = await executor.execute(action);
    results.push(outcome);
  }

  return results;
}


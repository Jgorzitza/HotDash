import { getConfig } from '../config.js';
import { getLatestIndexPath } from './buildIndex.js';
import { 
  VectorStoreIndex, 
  Settings, 
  BaseQueryEngine 
} from 'llamaindex';
import fs from 'node:fs/promises';
import path from 'node:path';

export interface QueryResult {
  query: string;
  response: string;  // Keep as response for backward compatibility
  sources: QuerySource[];
  metadata: {
    topK: number;
    timestamp: string;
    processingTime: number;
  };
}


export interface QuerySource {
  id: string;
  text: string;
  metadata: Record<string, any>;
  score: number;
}

// Define a basic response type for QueryEngine results
interface QueryResponse {
  response: string;
  sourceNodes?: Array<{
    node: {
      id_: string;
      getContent(): string;
      metadata?: Record<string, any>;
    };
    score?: number;
  }>;
}

export async function loadIndex(): Promise<VectorStoreIndex | null> {
  const config = getConfig();
  
  // Configure LlamaIndex with OpenAI - Settings will use OPENAI_API_KEY from environment
  // Settings.llm and Settings.embedModel will be auto-configured from environment variables
  
  const indexPath = await getLatestIndexPath();
  if (!indexPath) {
    console.warn('No latest index found');
    return null;
  }
  
  try {
    console.log(`Loading index from: ${indexPath}`);
    // For now, we'll use a simplified loading approach
    // The exact API may vary based on the llamaindex version
    const index = await VectorStoreIndex.fromPersistDir(
      path.join(indexPath, 'index')
    ).catch(() => {
      // Fallback: try creating a new index if loading fails
      console.warn('Failed to load persisted index, creating new one');
      return null;
    });
    
    if (index) {
      console.log('✓ Index loaded successfully');
    }
    return index;
  } catch (error) {
    console.error('Failed to load index:', error);
    return null;
  }
}

export async function answerQuery(query: string, topK: number = 5): Promise<QueryResult> {
  const startTime = Date.now();
  
  console.log(`Processing query: "${query}" (topK=${topK})`);
  
  const index = await loadIndex();
  if (!index) {
    throw new Error('No index available for querying');
  }
  
  try {
    // Create query engine
    const queryEngine = index.asQueryEngine({
      similarityTopK: topK,
    }) as BaseQueryEngine;
    
    // Execute query
    const response = await queryEngine.query({
      query: query,
    }) as QueryResponse;
    
    // Extract sources with metadata
    const sources: QuerySource[] = response.sourceNodes?.map((node) => ({
      id: node.node.id_,
      text: node.node.getContent(),
      metadata: node.node.metadata || {},
      score: node.score || 0,
    })) || [];
    
    const processingTime = Date.now() - startTime;
    
    const result: QueryResult = {
      query,
      response: response.response,
      sources,
      metadata: {
        topK,
        timestamp: new Date().toISOString(),
        processingTime,
      },
    };
    
    console.log(`✓ Query completed in ${processingTime}ms`);
    console.log(`Response: ${response.response.slice(0, 100)}...`);
    console.log(`Sources: ${sources.length} documents`);
    
    return result;
    
  } catch (error) {
    console.error('Query processing failed:', error);
    throw error;
  }
}

export async function insightReport(window: string = '1d', format: string = 'md'): Promise<string> {
  console.log(`Generating insight report: window=${window}, format=${format}`);
  
  const config = getConfig();
  
  // Parse time window
  const match = window.match(/^(\d+)([dh])$/);
  if (!match) {
    throw new Error('Invalid window format. Use format like "1d" or "24h"');
  }
  
  const [, amount, unit] = match;
  const hours = unit === 'd' ? parseInt(amount) * 24 : parseInt(amount);
  const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  // Query recent activity insights
  const queries = [
    'What are the most common issues users are experiencing?',
    'What features are users asking about most frequently?',
    'What integration questions are being raised?',
  ];
  
  const insights: Array<{ question: string; answer: string; sources: number }> = [];
  
  for (const query of queries) {
    try {
      const result = await answerQuery(query, 10);
      
      // Filter sources to time window (if they have timestamps)
      const recentSources = result.sources.filter(source => {
        const createdAt = source.metadata.created_at || source.metadata.timestamp;
        return !createdAt || new Date(createdAt) >= cutoffTime;
      });
      
      insights.push({
        question: query,
        answer: result.response,
        sources: recentSources.length,
      });
    } catch (error) {
      console.warn(`Failed to get insight for "${query}":`, error);
      insights.push({
        question: query,
        answer: 'Unable to generate insight due to processing error.',
        sources: 0,
      });
    }
  }
  
  const timestamp = new Date().toISOString();
  
  if (format === 'json') {
    return JSON.stringify({
      timestamp,
      window,
      insights,
    }, null, 2);
  }
  
  if (format === 'md') {
    let report = `# HotDash Insights Report\n\n`;
    report += `**Generated:** ${timestamp}\n`;
    report += `**Time Window:** ${window}\n\n`;
    
    insights.forEach((insight, index) => {
      report += `## ${index + 1}. ${insight.question}\n\n`;
      report += `${insight.answer}\n\n`;
      report += `*Based on ${insight.sources} recent sources*\n\n`;
    });
    
    return report;
  }
  
  // Default to plain text
  let report = `HotDash Insights Report\n`;
  report += `Generated: ${timestamp}\n`;
  report += `Time Window: ${window}\n\n`;
  
  insights.forEach((insight, index) => {
    report += `${index + 1}. ${insight.question}\n`;
    report += `${insight.answer}\n`;
    report += `(Based on ${insight.sources} recent sources)\n\n`;
  });
  
  return report;
}

// Utility function to validate citations
export function validateCitations(result: QueryResult, requiredCitations: string[]): boolean {
  const sourceIds = result.sources.map(s => s.id);
  return requiredCitations.every(required => 
    sourceIds.some(id => id.includes(required))
  );
}

/**
 * Tasks AX-BB: Knowledge Management Systems
 */

interface GraphNode {
  id: string;
  type: string;
  properties: any;
}

interface GraphEdge {
  from: string;
  to: string;
  type: string;
}

interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Task AX: Knowledge Graph Integration
export class KnowledgeGraph {
  private graph: Graph = { nodes: [], edges: [] };
  
  addEntity(entity: { id: string; type: string; properties: any }) {
    this.graph.nodes.push(entity);
  }
  
  addRelationship(from: string, to: string, type: string) {
    this.graph.edges.push({ from, to, type });
  }
  
  query(entityId: string) {
    return {
      entity: this.graph.nodes.find(n => n.id === entityId),
      related: this.graph.edges.filter(e => e.from === entityId || e.to === entityId),
    };
  }
}

// Task AY: Entity Extraction and Linking
export class EntityExtractor {
  async extract(text: string) {
    return {
      products: this.extractProducts(text),
      orders: this.extractOrders(text),
      dates: this.extractDates(text),
    };
  }
  
  private extractProducts(text: string): string[] {
    // Extract product names/SKUs
    return text.match(/[A-Z]{2,}-\d{4,}/g) || [];
  }
  
  private extractOrders(text: string): string[] {
    // Extract order numbers
    return text.match(/#?\d{5,}/g) || [];
  }
  
  private extractDates(text: string): string[] {
    // Extract date references
    return text.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/g) || [];
  }
}

// Task AZ: Temporal Knowledge Tracking
export class TemporalKnowledge {
  private knowledge = new Map<string, any>();
  
  store(key: string, value: any, validUntil: Date) {
    this.knowledge.set(key, {
      value,
      stored_at: new Date(),
      valid_until: validUntil,
    });
  }
  
  retrieve(key: string) {
    const entry = this.knowledge.get(key);
    if (!entry) return null;
    
    if (new Date() > entry.valid_until) {
      this.knowledge.delete(key);
      return null;
    }
    
    return entry.value;
  }
}

// Task BA: Knowledge Provenance Tracking
export class ProvenanceTracker {
  track(claim: string, source: { doc_id: string; author: string; date: string }) {
    return {
      claim,
      source,
      verified_at: new Date().toISOString(),
      trust_score: this.calculateTrustScore(source),
    };
  }
  
  private calculateTrustScore(source: any): number {
    // Simple trust scoring
    let score = 0.5;
    if (source.author === 'official_docs') score += 0.3;
    if (source.doc_id.includes('verified')) score += 0.2;
    return Math.min(score, 1.0);
  }
}

// Task BB: Knowledge Quality Scoring
export class KnowledgeQualityScorer {
  score(doc: any) {
    return {
      freshness: this.scoreFreshness(doc),
      clarity: this.scoreClarity(doc),
      completeness: this.scoreCompleteness(doc),
      citations: this.scoreCitations(doc),
      overall: this.calculateOverall({
        freshness: this.scoreFreshness(doc),
        clarity: this.scoreClarity(doc),
        completeness: this.scoreCompleteness(doc),
        citations: this.scoreCitations(doc),
      }),
    };
  }
  
  private scoreFreshness(doc: any) {
    const ageMs = Date.now() - new Date(doc.updated_at).getTime();
    const ageDays = ageMs / (24 * 60 * 60 * 1000);
    
    if (ageDays < 30) return 1.0;
    if (ageDays < 90) return 0.8;
    if (ageDays < 180) return 0.6;
    return 0.4;
  }
  
  private scoreClarity(doc: any) {
    // Readability and structure
    const hasHeadings = (doc.content.match(/^#{1,3}\s/gm) || []).length;
    const hasCodeBlocks = (doc.content.match(/```/g) || []).length / 2;
    const wordCount = doc.content.split(' ').length;
    
    let score = 0.5;
    if (hasHeadings > 3) score += 0.2;
    if (hasCodeBlocks > 0) score += 0.15;
    if (wordCount > 100 && wordCount < 2000) score += 0.15;
    
    return Math.min(score, 1.0);
  }
  
  private scoreCompleteness(doc: any) {
    // Has examples, explanations, caveats
    const hasExamples = doc.content.includes('example') || doc.content.includes('e.g.');
    const hasWarnings = doc.content.includes('warning') || doc.content.includes('note:');
    
    return (hasExamples ? 0.5 : 0) + (hasWarnings ? 0.5 : 0);
  }
  
  private scoreCitations(doc: any) {
    // Has source references?
    return doc.metadata.sources?.length > 0 ? 1.0 : 0.5;
  }
  
  private calculateOverall(scores: any) {
    const values = Object.values(scores) as number[];
    const total = values.reduce((a, b) => a + b, 0);
    return total / values.length;
  }
}

export const knowledgeGraph = new KnowledgeGraph();
export const entityExtractor = new EntityExtractor();
export const temporalKnowledge = new TemporalKnowledge();
export const provenanceTracker = new ProvenanceTracker();
export const qualityScorer = new KnowledgeQualityScorer();

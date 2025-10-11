export interface QueryResult {
    query: string;
    answer: string;
    citations: QuerySource[];
    confidence: number;
}
export interface QuerySource {
    id: string;
    text: string;
    metadata: Record<string, any>;
    score: number;
}
export declare function loadIndex(): Promise<VectorStoreIndex | null>;
export declare function answerQuery(query: string, topK?: number): Promise<QueryResult>;
export declare function insightReport(window?: string, format?: string): Promise<string>;
export declare function validateCitations(result: QueryResult, requiredCitations: string[]): boolean;
//# sourceMappingURL=query.d.ts.map
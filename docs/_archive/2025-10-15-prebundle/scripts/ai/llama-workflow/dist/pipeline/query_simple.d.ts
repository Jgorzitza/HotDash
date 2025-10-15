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
export declare function answerQuery(query: string, topK?: number): Promise<QueryResult>;
export declare function insightReport(window?: string, format?: string): Promise<string>;
//# sourceMappingURL=query_simple.d.ts.map
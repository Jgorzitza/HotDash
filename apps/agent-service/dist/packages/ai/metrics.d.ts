export declare function tokenize(text: string): string[];
export declare function bleu1(referenceTokens: string[], candidateTokens: string[]): number;
export declare function rougeL(referenceTokens: string[], candidateTokens: string[]): number;
export declare function evaluateText(reference: string, candidate: string): {
    bleu1: number;
    rougeL: number;
    referenceTokens: string[];
    candidateTokens: string[];
};
//# sourceMappingURL=metrics.d.ts.map
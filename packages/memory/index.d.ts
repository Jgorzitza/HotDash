export interface DecisionLog {
    id: string;
    scope: "build" | "ops";
    who: string;
    what: string;
    why: string;
    sha?: string;
    evidenceUrl?: string;
    createdAt: string;
}
export interface Fact {
    project: string;
    topic: string;
    key: string;
    value: string;
    createdAt: string;
}
export interface Memory {
    putDecision(d: DecisionLog): Promise<void>;
    listDecisions(scope?: "build" | "ops"): Promise<DecisionLog[]>;
    putFact(f: Fact): Promise<void>;
    getFacts(topic?: string, key?: string): Promise<Fact[]>;
}
//# sourceMappingURL=index.d.ts.map
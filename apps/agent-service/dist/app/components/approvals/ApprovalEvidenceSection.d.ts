type Evidence = {
    what_changes?: string;
    why_now?: string;
    impact_forecast?: string;
    diffs?: Array<{
        path: string;
        before: string;
        after: string;
    }>;
    samples?: Array<{
        label: string;
        content: string;
    }>;
    queries?: Array<{
        label: string;
        query: string;
        result?: string;
    }>;
    screenshots?: Array<{
        label: string;
        url: string;
    }>;
};
export declare function ApprovalEvidenceSection({ evidence }: {
    evidence: Evidence;
}): React.JSX.Element;
export {};
//# sourceMappingURL=ApprovalEvidenceSection.d.ts.map
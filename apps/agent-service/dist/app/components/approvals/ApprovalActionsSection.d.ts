export declare function ApprovalActionsSection({ state, canApprove, onApprove, onReject, onRequestChanges, onApply, }: {
    state: "draft" | "pending_review" | "approved" | "applied" | "audited" | "learned";
    canApprove: boolean;
    onApprove: () => void;
    onReject: (reason: string) => void;
    onRequestChanges: (note: string) => void;
    onApply?: () => void;
}): React.JSX.Element;
//# sourceMappingURL=ApprovalActionsSection.d.ts.map
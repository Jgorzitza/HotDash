/**
 * Refresh Handler - Wraps llama-workflow refresh command
 *
 * Rebuilds or updates the LlamaIndex over approved sources.
 */
export declare function refreshHandler(args: {
    sources?: string;
    full?: boolean;
}): Promise<{
    content: {
        type: string;
        text: string;
    }[];
    isError?: undefined;
} | {
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
}>;
//# sourceMappingURL=refresh.d.ts.map
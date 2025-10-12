/**
 * Query Handler - Wraps llama-workflow query command
 *
 * Executes the query command from the existing llama-workflow CLI
 * and returns the results in MCP-compatible format.
 */
export declare function queryHandler(args: {
    q: string;
    topK?: number;
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
//# sourceMappingURL=query.d.ts.map
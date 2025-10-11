/**
 * Insight Handler - Wraps llama-workflow insight command
 *
 * Generates AI insights from telemetry and curated replies.
 */
export declare function insightHandler(args: {
    window?: string;
    format?: string;
}): Promise<{
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
} | {
    content: {
        type: string;
        text: string;
    }[];
    isError?: undefined;
}>;
//# sourceMappingURL=insight.d.ts.map
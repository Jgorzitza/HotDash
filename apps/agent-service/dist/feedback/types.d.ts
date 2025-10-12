import { z } from 'zod';
export declare const FeedbackSchema: z.ZodObject<{
    conversationId: z.ZodNumber;
    inputText: z.ZodString;
    modelDraft: z.ZodDefault<z.ZodString>;
    safeToSend: z.ZodDefault<z.ZodBoolean>;
    labels: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    rubric: z.ZodDefault<z.ZodObject<{
        factuality: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
        helpfulness: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
        tone: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
        policyAlignment: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
        firstTimeResolution: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        factuality?: number | undefined;
        helpfulness?: number | undefined;
        tone?: number | undefined;
        policyAlignment?: number | undefined;
        firstTimeResolution?: number | undefined;
    }, {
        factuality?: number | undefined;
        helpfulness?: number | undefined;
        tone?: number | undefined;
        policyAlignment?: number | undefined;
        firstTimeResolution?: number | undefined;
    }>>;
    annotator: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    conversationId: number;
    inputText: string;
    modelDraft: string;
    safeToSend: boolean;
    labels: string[];
    rubric: {
        factuality?: number | undefined;
        helpfulness?: number | undefined;
        tone?: number | undefined;
        policyAlignment?: number | undefined;
        firstTimeResolution?: number | undefined;
    };
    annotator?: string | undefined;
    notes?: string | undefined;
    meta?: Record<string, any> | undefined;
}, {
    conversationId: number;
    inputText: string;
    modelDraft?: string | undefined;
    safeToSend?: boolean | undefined;
    labels?: string[] | undefined;
    rubric?: {
        factuality?: number | undefined;
        helpfulness?: number | undefined;
        tone?: number | undefined;
        policyAlignment?: number | undefined;
        firstTimeResolution?: number | undefined;
    } | undefined;
    annotator?: string | undefined;
    notes?: string | undefined;
    meta?: Record<string, any> | undefined;
}>;
export type Feedback = z.infer<typeof FeedbackSchema>;
export type ApprovalRow = {
    id: string;
    conversationId: number;
    serialized: string;
    lastInterruptions: any[];
    lastInput?: string;
    createdAt: string;
};
//# sourceMappingURL=types.d.ts.map
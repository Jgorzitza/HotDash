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
        factuality?: number;
        helpfulness?: number;
        tone?: number;
        policyAlignment?: number;
        firstTimeResolution?: number;
    }, {
        factuality?: number;
        helpfulness?: number;
        tone?: number;
        policyAlignment?: number;
        firstTimeResolution?: number;
    }>>;
    annotator: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    conversationId?: number;
    meta?: Record<string, any>;
    labels?: string[];
    rubric?: {
        factuality?: number;
        helpfulness?: number;
        tone?: number;
        policyAlignment?: number;
        firstTimeResolution?: number;
    };
    annotator?: string;
    notes?: string;
    inputText?: string;
    modelDraft?: string;
    safeToSend?: boolean;
}, {
    conversationId?: number;
    meta?: Record<string, any>;
    labels?: string[];
    rubric?: {
        factuality?: number;
        helpfulness?: number;
        tone?: number;
        policyAlignment?: number;
        firstTimeResolution?: number;
    };
    annotator?: string;
    notes?: string;
    inputText?: string;
    modelDraft?: string;
    safeToSend?: boolean;
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
/**
 * Input Validation Schemas
 *
 * Zod schemas for validating user inputs, API requests, and data structures.
 */
import { z } from "zod";
/**
 * Common validation schemas
 */
export declare const EmailSchema: z.ZodString;
export declare const ShopifyGidSchema: z.ZodString;
export declare const DateRangeSchema: z.ZodObject<{
    start: z.ZodString;
    end: z.ZodString;
}, "strip", z.ZodTypeAny, {
    end?: string;
    start?: string;
}, {
    end?: string;
    start?: string;
}>;
export declare const PaginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit?: number;
    page?: number;
}, {
    limit?: number;
    page?: number;
}>;
/**
 * Shopify-specific schemas
 */
export declare const OrderQuerySchema: z.ZodObject<{
    query: z.ZodString;
    first: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    query?: string;
    first?: number;
}, {
    query?: string;
    first?: number;
}>;
export declare const ProductVariantSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    sku: z.ZodOptional<z.ZodString>;
    price: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    title?: string;
    sku?: string;
    price?: string;
}, {
    id?: string;
    title?: string;
    sku?: string;
    price?: string;
}>;
/**
 * Google Analytics schemas
 */
export declare const GAPropertyIdSchema: z.ZodString;
export declare const GADateRangeSchema: z.ZodObject<{
    start: z.ZodString;
    end: z.ZodString;
} & {
    name: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    end?: string;
    start?: string;
}, {
    name?: string;
    end?: string;
    start?: string;
}>;
export declare const GAMetricsQuerySchema: z.ZodObject<{
    propertyId: z.ZodString;
    dateRanges: z.ZodArray<z.ZodObject<{
        start: z.ZodString;
        end: z.ZodString;
    } & {
        name: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        end?: string;
        start?: string;
    }, {
        name?: string;
        end?: string;
        start?: string;
    }>, "many">;
    dimensions: z.ZodArray<z.ZodString, "many">;
    metrics: z.ZodArray<z.ZodString, "many">;
    limit: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit?: number;
    metrics?: string[];
    propertyId?: string;
    dimensions?: string[];
    dateRanges?: {
        name?: string;
        end?: string;
        start?: string;
    }[];
}, {
    limit?: number;
    metrics?: string[];
    propertyId?: string;
    dimensions?: string[];
    dateRanges?: {
        name?: string;
        end?: string;
        start?: string;
    }[];
}>;
/**
 * Chatwoot schemas
 */
export declare const ChatwootMessageSchema: z.ZodObject<{
    conversationId: z.ZodNumber;
    content: z.ZodString;
    private: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    conversationId?: number;
    content?: string;
    private?: boolean;
}, {
    conversationId?: number;
    content?: string;
    private?: boolean;
}>;
export declare const ChatwootWebhookSchema: z.ZodObject<{
    event: z.ZodString;
    conversation: z.ZodObject<{
        id: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id?: number;
    }, {
        id?: number;
    }>;
    content: z.ZodOptional<z.ZodString>;
    message_type: z.ZodOptional<z.ZodNumber>;
    sender: z.ZodOptional<z.ZodObject<{
        type: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type?: string;
    }, {
        type?: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    content?: string;
    conversation?: {
        id?: number;
    };
    message_type?: number;
    event?: string;
    sender?: {
        type?: string;
    };
}, {
    content?: string;
    conversation?: {
        id?: number;
    };
    message_type?: number;
    event?: string;
    sender?: {
        type?: string;
    };
}>;
/**
 * Supabase schemas
 */
export declare const SubabaseApprovalQuerySchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    offset: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    status: z.ZodDefault<z.ZodOptional<z.ZodEnum<["pending", "approved", "rejected", "expired"]>>>;
}, "strip", z.ZodTypeAny, {
    status?: "expired" | "approved" | "pending" | "rejected";
    limit?: number;
    offset?: number;
}, {
    status?: "expired" | "approved" | "pending" | "rejected";
    limit?: number;
    offset?: number;
}>;
export declare const SupabaseMetricsQuerySchema: z.ZodObject<{
    tiles: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tiles?: string;
}, {
    tiles?: string;
}>;
export declare const SupabaseAuditLogSchema: z.ZodObject<{
    scope: z.ZodString;
    actor: z.ZodString;
    action: z.ZodString;
    rationale: z.ZodOptional<z.ZodString>;
    evidence_url: z.ZodOptional<z.ZodString>;
    shop_domain: z.ZodOptional<z.ZodString>;
    external_ref: z.ZodOptional<z.ZodString>;
    payload: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    actor?: string;
    scope?: string;
    action?: string;
    rationale?: string;
    evidence_url?: string;
    payload?: Record<string, any>;
    shop_domain?: string;
    external_ref?: string;
}, {
    actor?: string;
    scope?: string;
    action?: string;
    rationale?: string;
    evidence_url?: string;
    payload?: Record<string, any>;
    shop_domain?: string;
    external_ref?: string;
}>;
/**
 * Chatwoot schemas (extended)
 */
export declare const ChatwootConversationsQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    status: z.ZodDefault<z.ZodOptional<z.ZodEnum<["open", "pending", "resolved"]>>>;
}, "strip", z.ZodTypeAny, {
    status?: "pending" | "open" | "resolved";
    page?: number;
}, {
    status?: "pending" | "open" | "resolved";
    page?: number;
}>;
export declare const ChatwootReplySchema: z.ZodObject<{
    conversationId: z.ZodNumber;
    content: z.ZodString;
    private: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    actor: z.ZodOptional<z.ZodString>;
    rationale: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    conversationId?: number;
    content?: string;
    actor?: string;
    rationale?: string;
    private?: boolean;
}, {
    conversationId?: number;
    content?: string;
    actor?: string;
    rationale?: string;
    private?: boolean;
}>;
/**
 * Social/Publer schemas
 */
export declare const SocialPlatformSchema: z.ZodEnum<["facebook", "instagram", "twitter", "linkedin", "pinterest", "tiktok", "youtube", "reddit", "telegram", "google"]>;
export declare const SocialPostSchema: z.ZodObject<{
    platforms: z.ZodArray<z.ZodEnum<["facebook", "instagram", "twitter", "linkedin", "pinterest", "tiktok", "youtube", "reddit", "telegram", "google"]>, "many">;
    content: z.ZodString;
    media: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    scheduledTime: z.ZodOptional<z.ZodString>;
    firstComment: z.ZodOptional<z.ZodString>;
    actor: z.ZodOptional<z.ZodString>;
    rationale: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    content?: string;
    actor?: string;
    rationale?: string;
    media?: string[];
    platforms?: ("facebook" | "instagram" | "twitter" | "linkedin" | "tiktok" | "google" | "pinterest" | "youtube" | "telegram" | "reddit")[];
    scheduledTime?: string;
    firstComment?: string;
}, {
    content?: string;
    actor?: string;
    rationale?: string;
    media?: string[];
    platforms?: ("facebook" | "instagram" | "twitter" | "linkedin" | "tiktok" | "google" | "pinterest" | "youtube" | "telegram" | "reddit")[];
    scheduledTime?: string;
    firstComment?: string;
}>;
/**
 * Agent SDK schemas
 */
export declare const ToolExecutionSchema: z.ZodObject<{
    toolName: z.ZodString;
    arguments: z.ZodRecord<z.ZodString, z.ZodAny>;
    agentName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    agentName?: string;
    arguments?: Record<string, any>;
    toolName?: string;
}, {
    agentName?: string;
    arguments?: Record<string, any>;
    toolName?: string;
}>;
export declare const FeedbackSchema: z.ZodObject<{
    conversationId: z.ZodNumber;
    inputText: z.ZodString;
    modelDraft: z.ZodOptional<z.ZodString>;
    safeToSend: z.ZodDefault<z.ZodBoolean>;
    labels: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    rubric: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    annotator: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    meta: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    conversationId?: number;
    meta?: Record<string, any>;
    labels?: string[];
    rubric?: Record<string, number>;
    annotator?: string;
    notes?: string;
    inputText?: string;
    modelDraft?: string;
    safeToSend?: boolean;
}, {
    conversationId?: number;
    meta?: Record<string, any>;
    labels?: string[];
    rubric?: Record<string, number>;
    annotator?: string;
    notes?: string;
    inputText?: string;
    modelDraft?: string;
    safeToSend?: boolean;
}>;
export declare const ApprovalActionSchema: z.ZodObject<{
    id: z.ZodString;
    idx: z.ZodNumber;
    action: z.ZodEnum<["approve", "reject"]>;
}, "strip", z.ZodTypeAny, {
    action?: "approve" | "reject";
    id?: string;
    idx?: number;
}, {
    action?: "approve" | "reject";
    id?: string;
    idx?: number;
}>;
/**
 * Configuration schemas
 */
export declare const GaConfigSchema: z.ZodObject<{
    propertyId: z.ZodString;
    mode: z.ZodEnum<["mock", "direct"]>;
}, "strip", z.ZodTypeAny, {
    mode?: "mock" | "direct";
    propertyId?: string;
}, {
    mode?: "mock" | "direct";
    propertyId?: string;
}>;
export declare const ShopifyConfigSchema: z.ZodObject<{
    domain: z.ZodString;
    adminToken: z.ZodString;
    apiVersion: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    domain?: string;
    adminToken?: string;
    apiVersion?: string;
}, {
    domain?: string;
    adminToken?: string;
    apiVersion?: string;
}>;
/**
 * Utility function to validate and parse data
 */
export declare function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): {
    success: true;
    data: T;
} | {
    success: false;
    errors: string[];
};
/**
 * Utility to create error response for validation failures
 */
export declare function validationErrorResponse(errors: string[]): {
    error: string;
    details: string[];
    timestamp: string;
};
//# sourceMappingURL=validation.d.ts.map
/**
 * Input Validation Schemas
 * 
 * Zod schemas for validating user inputs, API requests, and data structures.
 */

import { z } from 'zod';

/**
 * Common validation schemas
 */
export const EmailSchema = z.string().email('Invalid email address');

export const ShopifyGidSchema = z.string().regex(
  /^gid:\/\/shopify\/\w+\/\d+$/,
  'Invalid Shopify GID format'
);

export const DateRangeSchema = z.object({
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
});

export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

/**
 * Shopify-specific schemas
 */
export const OrderQuerySchema = z.object({
  query: z.string().min(1, 'Query cannot be empty'),
  first: z.number().int().min(1).max(50).default(10),
});

export const ProductVariantSchema = z.object({
  id: ShopifyGidSchema,
  title: z.string(),
  sku: z.string().optional(),
  price: z.string().optional(),
});

/**
 * Google Analytics schemas
 */
export const GAPropertyIdSchema = z.string().regex(
  /^\d+$/,
  'Property ID must be numeric'
);

export const GADateRangeSchema = DateRangeSchema.extend({
  name: z.string().optional(),
});

export const GAMetricsQuerySchema = z.object({
  propertyId: GAPropertyIdSchema,
  dateRanges: z.array(GADateRangeSchema).min(1),
  dimensions: z.array(z.string()).min(1),
  metrics: z.array(z.string()).min(1),
  limit: z.number().int().min(1).max(1000).optional(),
});

/**
 * Chatwoot schemas
 */
export const ChatwootMessageSchema = z.object({
  conversationId: z.number().int().positive(),
  content: z.string().min(1, 'Content cannot be empty').max(5000),
  private: z.boolean().default(false),
});

export const ChatwootWebhookSchema = z.object({
  event: z.string(),
  conversation: z.object({
    id: z.number().int(),
  }),
  content: z.string().optional(),
  message_type: z.number().optional(),
  sender: z.object({
    type: z.string(),
  }).optional(),
});

/**
 * Agent SDK schemas
 */
export const ToolExecutionSchema = z.object({
  toolName: z.string().min(1),
  arguments: z.record(z.any()),
  agentName: z.string().optional(),
});

export const FeedbackSchema = z.object({
  conversationId: z.number().int().positive(),
  inputText: z.string().min(1),
  modelDraft: z.string().optional(),
  safeToSend: z.boolean().default(false),
  labels: z.array(z.string()).default([]),
  rubric: z.record(z.number().min(0).max(5)).default({}),
  annotator: z.string().optional(),
  notes: z.string().optional(),
  meta: z.record(z.any()).default({}),
});

export const ApprovalActionSchema = z.object({
  id: z.string().min(1),
  idx: z.number().int().min(0),
  action: z.enum(['approve', 'reject']),
});

/**
 * Configuration schemas
 */
export const GaConfigSchema = z.object({
  propertyId: z.string().min(1),
  mode: z.enum(['mock', 'direct', 'mcp']),
  mcpHost: z.string().url().optional(),
});

export const ShopifyConfigSchema = z.object({
  domain: z.string().min(1),
  adminToken: z.string().min(1),
  apiVersion: z.string().regex(/^\d{4}-\d{2}$/).default('2025-10'),
});

/**
 * Utility function to validate and parse data
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const parsed = schema.parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
}

/**
 * Utility to create error response for validation failures
 */
export function validationErrorResponse(errors: string[]) {
  return {
    error: 'Validation failed',
    details: errors,
    timestamp: new Date().toISOString(),
  };
}


import { z } from 'zod';

export const FeedbackSchema = z.object({
  conversationId: z.number(),
  inputText: z.string(),
  modelDraft: z.string().default(''),
  safeToSend: z.boolean().default(false),
  // operator labels/tags — keep it compact but consistent
  labels: z.array(z.string()).default([]),
  // optional structured rubric
  rubric: z.object({
    factuality: z.number().min(1).max(5).optional(),
    helpfulness: z.number().min(1).max(5).optional(),
    tone: z.number().min(1).max(5).optional(),
    policyAlignment: z.number().min(1).max(5).optional(),
    firstTimeResolution: z.number().min(1).max(5).optional(),
  }).partial().default({}),
  annotator: z.string().optional(),
  notes: z.string().optional(),
  // keep raw telemetry for training
  meta: z.record(z.any()).optional(),
});

export type Feedback = z.infer<typeof FeedbackSchema>;

export type ApprovalRow = {
  id: string;
  conversationId: number;
  serialized: string;
  lastInterruptions: any[];
  lastInput?: string;
  createdAt: string;
};


/**
 * Feedback Submission API
 *
 * Handles user feedback submissions from the feedback widget.
 * Stores feedback in Supabase feedback table.
 *
 * @module app/routes/api.feedback.submit
 * @see docs/directions/product.md PRODUCT-003
 */
import type { ActionFunctionArgs } from "react-router";
/**
 * Feedback category types
 */
export type FeedbackCategory = "bug" | "feature_request" | "ux_issue" | "other";
/**
 * Feedback submission data
 */
export interface FeedbackSubmission {
    userId: string;
    feedbackText: string;
    rating: number;
    category: FeedbackCategory;
    userAgent?: string;
    url?: string;
}
/**
 * POST /api/feedback/submit
 *
 * Submit user feedback
 *
 * Body:
 * {
 *   userId: string;
 *   feedbackText: string;
 *   rating: number; // 1-5
 *   category: 'bug' | 'feature_request' | 'ux_issue' | 'other';
 *   url?: string;
 * }
 *
 * Returns:
 * {
 *   success: boolean;
 *   feedbackId?: string;
 *   error?: string;
 * }
 */
export declare function action({ request }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.feedback.submit.d.ts.map
/**
 * Feedback Submission API
 * 
 * Handles user feedback submissions from the feedback widget.
 * Stores feedback in Supabase feedback table.
 * 
 * @module app/routes/api.feedback.submit
 * @see docs/directions/product.md PRODUCT-003
 */

import { json, type ActionFunctionArgs } from 'react-router';
import { createClient } from '@supabase/supabase-js';

/**
 * Feedback category types
 */
export type FeedbackCategory = 'bug' | 'feature_request' | 'ux_issue' | 'other';

/**
 * Feedback submission data
 */
export interface FeedbackSubmission {
  userId: string;
  feedbackText: string;
  rating: number; // 1-5 stars
  category: FeedbackCategory;
  userAgent?: string;
  url?: string; // Page where feedback was submitted
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
export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await request.json();
    const submission: FeedbackSubmission = {
      userId: body.userId,
      feedbackText: body.feedbackText,
      rating: body.rating,
      category: body.category,
      userAgent: request.headers.get('user-agent') || undefined,
      url: body.url || undefined,
    };

    // Validate input
    if (!submission.userId) {
      return json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    if (!submission.feedbackText || submission.feedbackText.trim().length === 0) {
      return json({ success: false, error: 'Feedback text is required' }, { status: 400 });
    }

    if (!submission.rating || submission.rating < 1 || submission.rating > 5) {
      return json({ success: false, error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    if (!['bug', 'feature_request', 'ux_issue', 'other'].includes(submission.category)) {
      return json({ success: false, error: 'Invalid category' }, { status: 400 });
    }

    // Get Supabase credentials from environment
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase credentials not configured');
      return json({ success: false, error: 'Service temporarily unavailable' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insert feedback into Supabase
    const { data, error } = await supabase
      .from('user_feedback')
      .insert({
        user_id: submission.userId,
        feedback_text: submission.feedbackText,
        rating: submission.rating,
        category: submission.category,
        user_agent: submission.userAgent,
        url: submission.url,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting feedback:', error);
      return json({ success: false, error: 'Failed to save feedback' }, { status: 500 });
    }

    // Log submission for monitoring
    console.log(`Feedback submitted: ${data.id} - ${submission.category} - Rating: ${submission.rating}/5`);

    return json({
      success: true,
      feedbackId: data.id,
    });
  } catch (err) {
    console.error('Error processing feedback:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return json({ success: false, error: message }, { status: 500 });
  }
}


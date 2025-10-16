/**
 * Content Scheduling API
 * 
 * API endpoints for scheduling content posts across platforms.
 * Integrates with cross-channel scheduler and calendar.
 */

import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { authenticate } from '../../shopify.server';
import {
  scheduleAcrossPlatforms,
  batchSchedule,
  getScheduledPosts,
  cancelScheduledPost,
  reschedulePost,
  getSchedulingConflicts,
} from '../../services/content/cross-channel-scheduler';
import type { SocialPlatform } from '../../lib/content/tracking';

export async function action({ request }: ActionFunctionArgs) {
  await authenticate.admin(request);

  const body = await request.json();
  const { action: actionType } = body;

  try {
    if (actionType === 'schedule') {
      const { content, platforms, scheduledFor, strategy, staggerDelay } = body;
      
      const schedule = await scheduleAcrossPlatforms(
        content,
        platforms,
        scheduledFor,
        strategy,
        staggerDelay
      );

      return json({ success: true, schedule });
    }

    if (actionType === 'batch') {
      const { posts, strategy, staggerDelay } = body;
      
      const schedules = await batchSchedule({
        posts,
        strategy,
        staggerDelay,
      });

      return json({ success: true, schedules, count: schedules.length });
    }

    if (actionType === 'cancel') {
      const { scheduleId } = body;
      await cancelScheduledPost(scheduleId);
      return json({ success: true });
    }

    if (actionType === 'reschedule') {
      const { scheduleId, newScheduledFor } = body;
      const schedule = await reschedulePost(scheduleId, newScheduledFor);
      return json({ success: true, schedule });
    }

    if (actionType === 'check-conflicts') {
      const { scheduledFor, platforms } = body;
      const conflicts = await getSchedulingConflicts(scheduledFor, platforms);
      return json({ success: true, conflicts });
    }

    return json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Schedule API error:', error);
    return json({ error: String(error) }, { status: 500 });
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);

  const url = new URL(request.url);
  const startDate = url.searchParams.get('startDate');
  const endDate = url.searchParams.get('endDate');

  try {
    const scheduled = await getScheduledPosts(startDate || undefined, endDate || undefined);
    return json({ success: true, scheduled, count: scheduled.length });
  } catch (error) {
    console.error('Schedule loader error:', error);
    return json({ error: String(error) }, { status: 500 });
  }
}


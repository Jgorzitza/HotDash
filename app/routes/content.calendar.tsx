/**
 * Content Calendar Route
 *
 * Production-ready content calendar with scheduling and publishing.
 * Features:
 * - Calendar view of scheduled content
 * - Schedule content for future publishing
 * - Multi-platform support
 * - Status tracking (scheduled, publishing, published, failed)
 * - Approval workflow integration
 */

import { data, type LoaderFunctionArgs, type ActionFunctionArgs } from "@react-router/node";
import { useLoaderData, useActionData, useSubmit, useNavigation } from "react-router";
import { Page, Card, Text, Button, Badge, InlineStack, BlockStack, Banner, Modal, TextField, Select } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { SchedulingService } from "~/services/content/scheduling.service";

// ============================================================================
// Types
// ============================================================================

interface CalendarDay {
  date: string;
  items: any[];
  isToday: boolean;
  isPast: boolean;
}

interface CalendarWeek {
  weekNumber: number;
  days: CalendarDay[];
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);

  const url = new URL(request.url);
  const month = url.searchParams.get("month") || new Date().getMonth().toString();
  const year = url.searchParams.get("year") || new Date().getFullYear().toString();

  try {
    // Get first and last day of month
    const firstDay = new Date(parseInt(year), parseInt(month), 1);
    const lastDay = new Date(parseInt(year), parseInt(month) + 1, 0);

    // Fetch scheduled content for the month
    const { items } = await SchedulingService.getContentForDateRange(
      firstDay.toISOString(),
      lastDay.toISOString()
    );

    // Get scheduling stats
    const stats = await SchedulingService.getSchedulingStats();

    // Generate calendar structure
    const calendar = generateCalendar(parseInt(year), parseInt(month), items);

    return {
      calendar,
      month: parseInt(month),
      year: parseInt(year),
      stats,
      scheduledItems: items
    };
  } catch (error: any) {
    console.error("Error loading content calendar:", error);
    return data({
      calendar: [],
      month: parseInt(month),
      year: parseInt(year),
      stats: {
        total_scheduled: 0,
        scheduled_today: 0,
        scheduled_this_week: 0,
        published_today: 0,
        failed_today: 0,
        by_platform: {},
        by_status: {}
      },
      scheduledItems: [],
      error: error.message || "Failed to load calendar"
    }, { status: 500 });
  }
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: ActionFunctionArgs) {
  await authenticate.admin(request);

  const formData = await request.formData();
  const actionType = formData.get("_action") as string;

  try {
    switch (actionType) {
      case "schedule":
        const scheduleData = {
          content_type: formData.get("content_type") as any,
          platform: formData.get("platform") as string,
          title: formData.get("title") as string,
          content: formData.get("content") as string,
          scheduled_for: formData.get("scheduled_for") as string,
          created_by: "content-agent",
          metadata: JSON.parse(formData.get("metadata") as string || "{}")
        };

        const scheduled = await SchedulingService.scheduleContent(scheduleData);
        return { success: true, message: "Content scheduled successfully!", data: scheduled };

      case "cancel":
        const cancelId = formData.get("id") as string;
        await SchedulingService.cancelScheduledContent(cancelId);
        return { success: true, message: "Scheduled content cancelled" };

      case "reschedule":
        const rescheduleId = formData.get("id") as string;
        const newTime = formData.get("scheduled_for") as string;
        await SchedulingService.updateScheduledContent(rescheduleId, {
          scheduled_for: newTime
        });
        return { success: true, message: "Content rescheduled successfully!" };

      default:
        return data({ success: false, error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error(`Error performing ${actionType} action:`, error);
    return data({ success: false, error: error.message || `Failed to ${actionType}` }, { status: 400 });
  }
}

// ============================================================================
// Component
// ============================================================================

export default function ContentCalendarPage() {
  const { calendar, month, year, stats, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();

  const handleNavigate = (newMonth: number, newYear: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set('month', newMonth.toString());
    url.searchParams.set('year', newYear.toString());
    window.location.href = url.toString();
  };

  const handleSchedule = (data: any) => {
    const formData = new FormData();
    formData.append('_action', 'schedule');
    Object.keys(data).forEach(key => {
      formData.append(key, typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key]);
    });
    submit(formData, { method: 'post' });
  };

  const handleCancel = (id: string) => {
    const formData = new FormData();
    formData.append('_action', 'cancel');
    formData.append('id', id);
    submit(formData, { method: 'post' });
  };

  const handleReschedule = (id: string, newTime: string) => {
    const formData = new FormData();
    formData.append('_action', 'reschedule');
    formData.append('id', id);
    formData.append('scheduled_for', newTime);
    submit(formData, { method: 'post' });
  };

  return (
    <Page title="Content Calendar">
      <BlockStack gap="400">
        {error && (
          <Banner tone="critical">
            <Text as="p">{error}</Text>
          </Banner>
        )}

        {actionData?.success && (
          <Banner tone="success">
            <Text as="p">{actionData.message}</Text>
          </Banner>
        )}

        {actionData?.error && (
          <Banner tone="critical">
            <Text as="p">{actionData.error}</Text>
          </Banner>
        )}

        <ContentCalendar
          calendar={calendar}
          month={month}
          year={year}
          stats={stats}
          onNavigate={handleNavigate}
          onSchedule={handleSchedule}
          onCancel={handleCancel}
          onReschedule={handleReschedule}
        />
      </BlockStack>
    </Page>
  );
}

import { ContentCalendar } from "~/components/content/ContentCalendar";



// ============================================================================
// Helper Functions
// ============================================================================

function generateCalendar(
  year: number,
  month: number,
  items: any[],
): CalendarWeek[] {
  const weeks: CalendarWeek[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let currentWeek: CalendarDay[] = [];
  let weekNumber = 1;

  // Add padding days from previous month
  const firstDayOfWeek = firstDay.getDay();
  for (let i = 0; i < firstDayOfWeek; i++) {
    const date = new Date(year, month, 1 - (firstDayOfWeek - i));
    currentWeek.push({
      date: date.toISOString().split("T")[0],
      items: [],
      isToday: false,
      isPast: date < today,
    });
  }

  // Add days of current month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split("T")[0];

    currentWeek.push({
      date: dateStr,
      items: items.filter((item) => item.scheduled_for?.startsWith(dateStr)),
      isToday: dateStr === today.toISOString().split("T")[0],
      isPast: date < today,
    });

    if (currentWeek.length === 7) {
      weeks.push({ weekNumber, days: currentWeek });
      currentWeek = [];
      weekNumber++;
    }
  }

  // Add padding days from next month
  if (currentWeek.length > 0) {
    const remaining = 7 - currentWeek.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i);
      currentWeek.push({
        date: date.toISOString().split("T")[0],
        items: [],
        isToday: false,
        isPast: date < today,
      });
    }
    weeks.push({ weekNumber, days: currentWeek });
  }

  return weeks;
}


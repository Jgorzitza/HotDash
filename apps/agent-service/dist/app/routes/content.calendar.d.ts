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
import { type LoaderFunctionArgs, type ActionFunctionArgs } from "react-router";
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
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("react-router").UNSAFE_DataWithResponseInit<{
    calendar: any[];
    month: number;
    year: number;
    stats: {
        total_scheduled: number;
        scheduled_today: number;
        scheduled_this_week: number;
        published_today: number;
        failed_today: number;
        by_platform: {};
        by_status: {};
    };
    scheduledItems: any[];
    error: any;
}> | {
    calendar: CalendarWeek[];
    month: number;
    year: number;
    stats: import("~/services/content/scheduling.service").SchedulingStats;
    scheduledItems: any;
}>;
export declare function action({ request }: ActionFunctionArgs): Promise<import("react-router").UNSAFE_DataWithResponseInit<{
    success: boolean;
    error: any;
}> | {
    success: boolean;
    message: string;
    data: import("~/services/content/scheduling.service").ScheduledContent;
} | {
    success: boolean;
    message: string;
    data?: undefined;
}>;
export default function ContentCalendarPage(): React.JSX.Element;
export {};
//# sourceMappingURL=content.calendar.d.ts.map
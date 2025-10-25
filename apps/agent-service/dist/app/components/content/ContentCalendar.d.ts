/**
 * Content Calendar Component
 *
 * Displays scheduled content in a calendar view with Polaris UI
 */
import type { ScheduledContent } from '~/services/content/scheduling.service';
interface CalendarDay {
    date: string;
    items: ScheduledContent[];
    isToday: boolean;
    isPast: boolean;
}
interface CalendarWeek {
    weekNumber: number;
    days: CalendarDay[];
}
interface ContentCalendarProps {
    calendar: CalendarWeek[];
    month: number;
    year: number;
    stats: any;
    onNavigate: (month: number, year: number) => void;
    onSchedule: (data: any) => void;
    onCancel: (id: string) => void;
    onReschedule: (id: string, newTime: string) => void;
}
export declare function ContentCalendar({ calendar, month, year, stats, onNavigate, onSchedule, onCancel, onReschedule, }: ContentCalendarProps): React.JSX.Element;
export {};
//# sourceMappingURL=ContentCalendar.d.ts.map
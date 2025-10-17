/**
 * Content Calendar Route
 *
 * Schedule and track social media posts across platforms.
 * Features:
 * - Calendar view of scheduled posts
 * - Drag-and-drop scheduling
 * - Multi-platform publishing
 * - Status tracking (draft, scheduled, published, failed)
 */

import { type LoaderFunctionArgs } from "react-router";
import { json } from "~/utils/http.server";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import type { ContentPost, SocialPlatform } from "../lib/content/tracking";

// ============================================================================
// Types
// ============================================================================

interface CalendarPost extends ContentPost {
  scheduledFor?: string;
  approvedBy?: string;
  approvedAt?: string;
}

interface CalendarDay {
  date: string;
  posts: CalendarPost[];
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
  const month =
    url.searchParams.get("month") || new Date().getMonth().toString();
  const year =
    url.searchParams.get("year") || new Date().getFullYear().toString();

  // TODO: Fetch scheduled posts from Supabase
  const posts: CalendarPost[] = [];

  // Generate calendar structure
  const calendar = generateCalendar(parseInt(year), parseInt(month), posts);

  return json({
    calendar,
    month: parseInt(month),
    year: parseInt(year),
    stats: {
      totalScheduled: posts.filter((p) => p.status === "scheduled").length,
      totalDrafts: posts.filter((p) => p.status === "draft").length,
      totalPublished: posts.filter((p) => p.status === "published").length,
      totalFailed: posts.filter((p) => p.status === "failed").length,
    },
  });
}

// ============================================================================
// Component
// ============================================================================

export default function ContentCalendar() {
  const { calendar, month, year, stats } = useLoaderData<typeof loader>();

  return (
    <div className="content-calendar">
      <div className="calendar-header">
        <h1>Content Calendar</h1>
        <div className="calendar-nav">
          <button>← Previous Month</button>
          <span>
            {getMonthName(month)} {year}
          </span>
          <button>Next Month →</button>
        </div>
      </div>

      <div className="calendar-stats">
        <div className="stat">
          <span className="stat-label">Scheduled</span>
          <span className="stat-value">{stats.totalScheduled}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Drafts</span>
          <span className="stat-value">{stats.totalDrafts}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Published</span>
          <span className="stat-value">{stats.totalPublished}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Failed</span>
          <span className="stat-value">{stats.totalFailed}</span>
        </div>
      </div>

      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="weekday">
              {day}
            </div>
          ))}
        </div>

        {calendar.map((week, weekIdx) => (
          <div key={weekIdx} className="calendar-week">
            {week.days.map((day, dayIdx) => (
              <CalendarDayCell key={dayIdx} day={day} />
            ))}
          </div>
        ))}
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <span className="badge badge-draft">Draft</span>
          <span className="badge badge-scheduled">Scheduled</span>
          <span className="badge badge-published">Published</span>
          <span className="badge badge-failed">Failed</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function CalendarDayCell({ day }: { day: CalendarDay }) {
  return (
    <div
      className={`calendar-day ${day.isToday ? "today" : ""} ${day.isPast ? "past" : ""}`}
      data-date={day.date}
    >
      <div className="day-header">
        <span className="day-number">{new Date(day.date).getDate()}</span>
        {day.posts.length > 0 && (
          <span className="post-count">{day.posts.length}</span>
        )}
      </div>

      <div className="day-posts">
        {day.posts.slice(0, 3).map((post, idx) => (
          <PostPreview key={idx} post={post} />
        ))}
        {day.posts.length > 3 && (
          <div className="more-posts">+{day.posts.length - 3} more</div>
        )}
      </div>
    </div>
  );
}

function PostPreview({ post }: { post: CalendarPost }) {
  return (
    <div className={`post-preview status-${post.status}`}>
      <span className="platform-icon">{getPlatformIcon(post.platform)}</span>
      <span className="post-snippet">{post.content.slice(0, 30)}...</span>
    </div>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function generateCalendar(
  year: number,
  month: number,
  posts: CalendarPost[],
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
      posts: [],
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
      posts: posts.filter((p) => p.scheduledFor?.startsWith(dateStr)),
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
        posts: [],
        isToday: false,
        isPast: date < today,
      });
    }
    weeks.push({ weekNumber, days: currentWeek });
  }

  return weeks;
}

function getMonthName(month: number): string {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[month] || "Unknown";
}

function getPlatformIcon(platform: SocialPlatform): string {
  const icons = {
    instagram: "📷",
    facebook: "👥",
    tiktok: "🎵",
  };
  return icons[platform] || "📱";
}

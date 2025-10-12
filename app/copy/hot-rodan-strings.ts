/**
 * Hot Rod AN Brand Copy Strings
 * Automotive-themed language for Operator Control Center
 * 
 * Source: docs/design/hot-rodan-brand-integration.md
 * Copy Deck: docs/design/copy-decks.md
 * 
 * Usage: Import constants instead of hardcoding strings
 * Example: import { HOT_ROD_STATUS } from '~/copy/hot-rodan-strings';
 */

/**
 * Status Labels - Automotive Theme
 * Maps to TileStatus: "ok" | "error" | "unconfigured"
 */
export const HOT_ROD_STATUS = {
  ok: "All systems ready",        // Automotive: engine idling, ready to go
  error: "Attention needed",       // Keep professional, not overly themed
  unconfigured: "Tune-up required", // Automotive: needs configuration
} as const;

/**
 * Empty State Messages - Encouraging + Automotive
 */
export const HOT_ROD_EMPTY_STATES = {
  cxEscalations: {
    title: "All systems ready",
    message: "No escalations detected. Excellent customer service performance!",
  },
  salesPulse: {
    title: "Revenue tracking online",
    message: "Sales data will appear here once orders start coming in.",
  },
  fulfillment: {
    title: "Full speed ahead",
    message: "No fulfillment blockers detected. All orders on track.",
  },
  inventory: {
    title: "Stock levels healthy",
    message: "No inventory alerts. All products well-stocked.",
  },
  seo: {
    title: "Monitoring active",
    message: "All systems monitoring your site traffic and content.",
  },
} as const;

/**
 * Loading State Messages - Automotive Theme
 */
export const HOT_ROD_LOADING = {
  tiles: "Starting engines...",
  dashboard: "Warming up...",
  data: "Loading latest data...",
  action: "Processing...",
} as const;

/**
 * Success Messages - "Full Speed Ahead" Theme
 */
export const HOT_ROD_SUCCESS = {
  replySent: "Full speed ahead! Reply sent to customer.",
  escalated: "Full speed ahead! Escalation sent to manager.",
  resolved: "Full speed ahead! Case marked as resolved.",
  followUpLogged: "Full speed ahead! Follow-up action logged.",
  poCreated: "Full speed ahead! Purchase order created.",
  dataRefreshed: "Full speed ahead! Data refreshed.",
} as const;

/**
 * Error Messages - "Engine Trouble" Theme
 */
export const HOT_ROD_ERROR = {
  sendFailed: "Engine trouble - unable to send reply. Please try again.",
  escalationFailed: "Engine trouble - failed to escalate. Please try again.",
  loadFailed: "Engine trouble - unable to load data. Please refresh.",
  networkError: "Engine trouble - connection lost. Check your internet.",
  saveFailed: "Engine trouble - unable to save changes. Please try again.",
} as const;

/**
 * Page Titles - Command Center Theme
 */
export const HOT_ROD_PAGES = {
  approvalQueue: "Mission Control",     // Not "Approval Queue"
  dashboard: "Command Center",          // Not "Dashboard"
  cxEscalations: "Customer Command",    // Not "CX Escalations"
  salesPulse: "Revenue Radar",          // Not "Sales Pulse"
  inventory: "Stock Control",           // Not "Inventory"
} as const;

/**
 * Action Button Labels - Active Voice
 */
export const HOT_ROD_ACTIONS = {
  approve: "Approve",
  reject: "Reject",
  viewDetails: "View Details",
  takeAction: "Take Action",
  refresh: "Tune-up",                   // Automotive: refresh/reload
  retry: "Restart Engine",              // Automotive: try again
} as const;

/**
 * Metric Labels - Keep Professional
 */
export const HOT_ROD_METRICS = {
  revenue: "Revenue",
  orders: "orders",
  fulfillment: "fulfillment",
  stock: "stock",
  alerts: "alerts",
  escalations: "escalations",
} as const;

/**
 * Time Indicators - Relative
 */
export const HOT_ROD_TIME = {
  lastRefreshed: "Last refreshed",
  ago: "ago",
  breached: "breached",
  remaining: "remaining",
} as const;

/**
 * Brand Voice Guidelines
 * 
 * DO:
 * - ✅ Use automotive metaphors sparingly (1-2 per screen)
 * - ✅ Keep professional tone (this is a business tool)
 * - ✅ Use "systems" language (all systems ready, monitoring active)
 * - ✅ Use "speed" language (full speed ahead, fast, quick)
 * - ✅ Use encouraging language (excellent, great work, optimized)
 * 
 * DON'T:
 * - ❌ Overuse car metaphors (no literal car imagery)
 * - ❌ Use informal language (no "vroom vroom")
 * - ❌ Break professional tone (operators need trust)
 * - ❌ Use slang or jargon (clear > clever)
 */


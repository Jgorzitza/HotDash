---
epoch: 2025.10.E1
doc: docs/design/copy-decks.md
owner: designer
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-25
---

# Copy Decks - Tile Summaries & Action CTAs

## Overview

**Created**: 2025-10-11T05:25:18Z  
**Purpose**: Centralized copy deck for dashboard tiles, modals, and CTAs  
**Language**: English-only (US English)  
**Marketing Coordination**: Ready for team review and updates  
**Brand Voice**: Clear, actionable, professional

## Tile Summaries

### Sales Pulse Tile

```typescript
export const SALES_PULSE_COPY = {
  title: "Sales Pulse",
  description: "Revenue and order tracking for current window",

  // Status variations
  statusHealthy: "Healthy",
  statusAttention: "Attention needed",
  statusUnconfigured: "Configuration required",

  // Metric labels
  revenueLabel: "Revenue",
  ordersLabel: "orders",
  averageOrderLabel: "Avg order value",
  topSkusLabel: "Top SKUs",

  // Empty states
  emptyState: {
    heading: "No sales data available",
    description:
      "Revenue tracking will appear here once orders start coming in.",
    action: "Configure Shopify",
  },

  // Error states
  errorState: {
    heading: "Unable to load sales data",
    description: "There was an issue connecting to your sales data source.",
    action: "Retry",
    secondaryAction: "Check connection",
  },

  // Loading state
  loadingState: "Loading latest sales data...",

  // Meta information
  lastRefreshed: "Last refreshed",
  dataSource: "Shopify",

  // Accessibility
  ariaLabel: "Sales performance summary for current time window",
  statusAriaLabel: (status: string) => `Sales pulse status: ${status}`,
} as const;
```

### Fulfillment Health Tile

```typescript
export const FULFILLMENT_HEALTH_COPY = {
  title: "Fulfillment Health",
  description: "Order fulfillment status and tracking",

  // Status messages
  allOnTrack: "All orders on track",
  delaysDetected: "Delays detected",
  issuesFound: "Issues found",

  // Metric labels
  ordersLabel: "orders",
  fulfillmentIssuesLabel: "fulfillment issues",
  onTimePerformanceLabel: "On-time performance",

  // Issue categories
  delayedShipments: "delayed shipments",
  inventoryBlocks: "inventory blocks",
  shippingIssues: "shipping issues",

  // Empty states
  emptyState: {
    heading: "No fulfillment issues",
    description: "All orders are processing normally and on schedule.",
    encouragement: "Great work keeping operations smooth!",
  },

  // Error states
  errorState: {
    heading: "Unable to check fulfillment status",
    description: "Connection to fulfillment system unavailable.",
    action: "Retry",
    supportHint: "If issues persist, contact support",
  },

  // Accessibility
  ariaLabel: "Order fulfillment health and performance metrics",
  issueCountAriaLabel: (count: number) =>
    `${count} fulfillment ${count === 1 ? "issue" : "issues"} requiring attention`,
} as const;
```

### Inventory Heatmap Tile

```typescript
export const INVENTORY_HEATMAP_COPY = {
  title: "Inventory Heatmap",
  description: "Stock levels and reorder alerts",

  // Alert levels
  lowStockAlert: "Low stock alert",
  outOfStockAlert: "Out of stock",
  reorderNeeded: "Reorder needed",
  stockHealthy: "Stock levels healthy",

  // Metric labels
  alertsLabel: "alerts",
  itemsLabel: "items",
  skuLabel: "SKU",
  unitsLeftLabel: "left",
  daysOfCoverLabel: "days of cover",

  // Alert descriptions
  alertDescriptions: {
    lowStock: "Below minimum threshold",
    outOfStock: "Currently unavailable",
    reorderPoint: "Time to reorder",
    overstocked: "Above maximum threshold",
  },

  // Empty states
  emptyState: {
    heading: "No inventory alerts",
    description: "All products are well-stocked and within healthy ranges.",
    encouragement: "Inventory levels are optimized!",
  },

  // Error states
  errorState: {
    heading: "Unable to load inventory data",
    description: "Inventory system connection interrupted.",
    action: "Retry",
    alternativeAction: "Manual check",
  },

  // Actions
  actions: {
    takeAction: "Take Action",
    viewDetails: "View Details",
    createPO: "Create PO",
    adjustThresholds: "Adjust Thresholds",
  },

  // Accessibility
  ariaLabel: "Inventory stock levels and reorder alerts",
  alertAriaLabel: (product: string, level: string) =>
    `${product} inventory alert: ${level}`,
} as const;
```

### CX Escalations Tile

```typescript
export const CX_ESCALATIONS_COPY = {
  title: "CX Escalations",
  description: "Customer service escalations requiring attention",

  // Status indicators
  slaBreached: "SLA breached",
  priorityEscalation: "Priority escalation",
  awaitingResponse: "Awaiting response",
  resolved: "Resolved",

  // Escalation labels
  escalationCount: (count: number) =>
    count === 1 ? "1 escalation" : `${count} escalations`,
  slaBreachLabel: "SLA breach",
  customerLabel: "Customer",
  priorityLabel: "Priority",
  timeAgoLabel: "ago",

  // Customer context
  customerPriority: {
    high: "High-value customer",
    vip: "VIP customer",
    repeat: "Repeat customer",
    new: "New customer",
  },

  // Empty states
  emptyState: {
    heading: "No escalations",
    description:
      "All customer conversations are on track with no SLA breaches detected.",
    encouragement: "Excellent customer service performance!",
  },

  // Error states
  errorState: {
    heading: "Unable to load escalation data",
    description: "Customer service system temporarily unavailable.",
    action: "Retry",
    urgentNote: "For urgent issues, check directly in Chatwoot",
  },

  // Actions
  actions: {
    viewAndReply: "View & Reply",
    escalateToManager: "Escalate to Manager",
    markResolved: "Mark Resolved",
    viewConversation: "View Conversation",
  },

  // Accessibility
  ariaLabel: "Customer service escalations requiring immediate attention",
  escalationAriaLabel: (customer: string, timeframe: string) =>
    `Escalation for ${customer}, ${timeframe}`,
} as const;
```

### SEO & Content Watch Tile

```typescript
export const SEO_CONTENT_COPY = {
  title: "SEO & Content Watch",
  description: "Website traffic and content performance monitoring",

  // Traffic indicators
  trafficStable: "Traffic stable",
  trafficGrowing: "Traffic growing",
  trafficDeclining: "Traffic declining",
  issuesDetected: "Issues detected",

  // Metric labels
  visitorsLabel: "visitors",
  pageViewsLabel: "page views",
  conversionRateLabel: "conversion rate",
  rankingChangesLabel: "ranking changes",

  // Performance indicators
  weekOverWeek: "WoW",
  monthOverMonth: "MoM",
  trending: {
    up: "trending up",
    down: "trending down",
    stable: "stable",
  },

  // Content alerts
  contentAlerts: {
    brokenLinks: "broken links detected",
    slowPages: "slow page load times",
    rankingDrops: "ranking decreases",
    missingMeta: "missing meta descriptions",
  },

  // Empty states
  emptyState: {
    heading: "SEO monitoring active",
    description:
      "Traffic and content performance tracking is running normally.",
    status: "All systems monitoring your site",
  },

  // Error states
  errorState: {
    heading: "Unable to fetch SEO data",
    description: "Connection to analytics services interrupted.",
    action: "Retry",
    checkDirectly: "Check Google Analytics directly",
  },

  // Recent changes section
  recentChanges: {
    heading: "Recent changes",
    noChanges: "No significant changes detected",
    viewAll: "View all changes",
  },

  // Accessibility
  ariaLabel: "SEO and content performance monitoring dashboard",
  changeAriaLabel: (page: string, change: string) =>
    `${page} page traffic ${change}`,
} as const;
```

## Modal Copy

### CX Escalation Modal

```typescript
export const CX_ESCALATION_MODAL_COPY = {
  title: "CX Escalation",

  // Header information
  customerLabel: "Customer",
  statusLabel: "Status",
  priorityLabel: "Priority",
  slaLabel: "SLA",
  lastMessageLabel: "Last message",

  // Status indicators
  statuses: {
    open: "Open",
    inProgress: "In Progress",
    breached: "Breached",
    resolved: "Resolved",
  },

  // Time indicators
  timeLabels: {
    ago: "ago",
    breached: "breached",
    remaining: "remaining",
  },

  // Conversation section
  conversationPreview: "Conversation Preview",
  fullConversationLink: "View full conversation",

  // Form labels
  suggestedReplyLabel: "Suggested Reply",
  suggestedReplyHelp: "AI-generated response based on conversation context",
  internalNotesLabel: "Internal Notes",
  internalNotesHelp: "Add context for audit trail",
  actionRequiredLabel: "Action Required",

  // Action options
  actionOptions: {
    sendReply: "Send Reply",
    escalateToManager: "Escalate to Manager",
    markResolved: "Mark Resolved",
    requestMoreInfo: "Request More Info",
  },

  // Button labels
  buttons: {
    sendReply: "Send Reply",
    cancel: "Cancel",
    escalate: "Escalate",
    resolve: "Resolve",
  },

  // Success messages
  successMessages: {
    replySent: "Reply sent to customer. Decision logged to audit trail.",
    escalated: "Escalation sent to manager with full conversation context.",
    resolved: "Case marked as resolved. Customer will be notified.",
  },

  // Error messages
  errorMessages: {
    sendFailed: "Unable to send reply. Please try again.",
    escalationFailed: "Failed to escalate. Contact support if this persists.",
    networkError: "Network error occurred. Check your connection.",
  },

  // Accessibility
  modalAriaLabel: "Customer escalation response modal",
  closeAriaLabel: "Close escalation modal",
} as const;
```

### Sales Pulse Modal

```typescript
export const SALES_PULSE_MODAL_COPY = {
  title: "Sales Pulse Review",

  // Snapshot section
  snapshotTitle: "24-Hour Snapshot",
  snapshotDescription: "Key performance metrics for the current window",

  // Metric labels
  metrics: {
    revenue: "Revenue",
    orders: "Orders",
    averageOrder: "Average Order",
    conversion: "Conversion Rate",
    traffic: "Traffic",
  },

  // Performance indicators
  performanceLabels: {
    weekOverWeek: "WoW",
    dayOverDay: "DoD",
    vsTarget: "vs Target",
    trending: "Trending",
  },

  // Top performers section
  topPerformersTitle: "Top Performing SKUs",
  performanceHeaders: {
    product: "Product",
    unitsSold: "Units Sold",
    revenue: "Revenue",
    margin: "Margin",
  },

  // Action section
  actionRequiredLabel: "Action Required",
  notesLabel: "Notes (Audit Trail)",
  notesPlaceholder: "Add context for this decision...",

  // Action options
  actionOptions: {
    logFollowUp: "Log follow-up",
    escalateToOps: "Escalate to ops",
    adjustTargets: "Adjust targets",
    noActionNeeded: "No action needed",
  },

  // Button labels that change based on selection
  dynamicButtons: {
    logFollowUp: "Log Follow-up",
    escalateToOps: "Escalate to Ops",
    adjustTargets: "Adjust Targets",
    confirm: "Confirm Action",
  },

  // Static buttons
  buttons: {
    cancel: "Cancel",
    viewFullReport: "View Full Report",
  },

  // Success messages
  successMessages: {
    followUpLogged: "Follow-up action logged. Team has been notified.",
    escalatedToOps: "Issue escalated to operations team with context.",
    targetsAdjusted: "Performance targets updated for next period.",
  },

  // Accessibility
  modalAriaLabel: "Sales performance review and action modal",
  tableAriaLabel: "Top performing products data table",
} as const;
```

## Toast Notifications

### Success Toasts

```typescript
export const SUCCESS_TOAST_COPY = {
  // CX Escalations
  cxEscalations: {
    replySent: "Reply sent to customer. Decision logged to audit trail.",
    escalatedToManager:
      "Escalation sent to manager with full conversation context.",
    markedResolved: "Case marked as resolved. Customer has been notified.",
  },

  // Sales Pulse
  salesPulse: {
    followUpLogged: "Follow-up action logged. Team has been notified.",
    escalatedToOps: "Issue escalated to operations team with full context.",
    targetsAdjusted: "Performance targets updated for next reporting period.",
  },

  // Inventory
  inventory: {
    poCreated: "Purchase order created and sent to supplier.",
    alertSnoozed: "Inventory alert snoozed for 24 hours.",
    thresholdsUpdated: "Stock level thresholds updated successfully.",
  },

  // General
  general: {
    changesSaved: "Changes saved successfully.",
    dataRefreshed: "Data refreshed with latest information.",
    settingsUpdated: "Settings updated and applied.",
  },
} as const;
```

### Error Toasts

```typescript
export const ERROR_TOAST_COPY = {
  // Network errors
  network: {
    connectionLost:
      "Connection lost. Please check your internet and try again.",
    timeout: "Request timed out. Please try again.",
    serverError: "Server error occurred. Please try again later.",
  },

  // Action failures
  actionFailures: {
    sendReplyFailed: "Unable to send reply. Network error occurred.",
    escalationFailed: "Failed to escalate case. Please try again.",
    dataLoadFailed: "Unable to load data. Please refresh and try again.",
    saveActionFailed: "Failed to save action. Your changes were not recorded.",
  },

  // Permission errors
  permissions: {
    accessDenied: "Access denied. You don't have permission for this action.",
    sessionExpired: "Your session has expired. Please log in again.",
    insufficientRights: "Insufficient permissions to perform this action.",
  },

  // Validation errors
  validation: {
    requiredFieldEmpty: "Please fill in all required fields.",
    invalidFormat: "Please check the format of your input.",
    exceedsLimit: "Input exceeds maximum character limit.",
  },
} as const;
```

## Loading States

### Loading Messages

```typescript
export const LOADING_COPY = {
  // Data loading
  dataLoading: {
    salesPulse: "Loading latest sales data...",
    fulfillmentHealth: "Checking fulfillment status...",
    inventoryHeatmap: "Loading inventory levels...",
    cxEscalations: "Checking for escalations...",
    seoContent: "Refreshing traffic data...",
  },

  // Action processing
  actionProcessing: {
    sendingReply: "Sending reply...",
    escalating: "Creating escalation...",
    savingAction: "Saving action...",
    updatingData: "Updating data...",
    processingRequest: "Processing request...",
  },

  // Initial load
  initialLoad: {
    dashboardLoading: "Loading dashboard...",
    connectingToServices: "Connecting to data sources...",
    retrievingLatestData: "Retrieving latest information...",
  },
} as const;
```

## Empty States

### Empty State Messages

```typescript
export const EMPTY_STATE_COPY = {
  // Tile empty states
  tiles: {
    salesPulse: {
      heading: "No sales data yet",
      description:
        "Sales tracking will appear here once your first orders come in.",
      actionText: "Connect Shopify",
      encouragement: "Ready to start tracking your success!",
    },

    fulfillmentHealth: {
      heading: "No orders to fulfill",
      description:
        "Fulfillment tracking will appear here when you have active orders.",
      encouragement: "All systems ready for your first orders!",
    },

    inventoryHeatmap: {
      heading: "No inventory alerts",
      description: "All products are well-stocked and within healthy ranges.",
      encouragement: "Inventory levels are optimized!",
    },

    cxEscalations: {
      heading: "No escalations",
      description:
        "All customer conversations are on track with no SLA breaches detected.",
      encouragement: "Excellent customer service performance!",
    },

    seoContent: {
      heading: "SEO monitoring active",
      description:
        "Traffic and content performance tracking is running normally.",
      status: "All systems monitoring your site",
    },
  },

  // Modal empty states
  modals: {
    noConversationHistory: {
      heading: "No conversation history",
      description: "This customer hasn't had any previous conversations.",
    },

    noTopProducts: {
      heading: "No product data available",
      description:
        "Product performance data will appear here once orders are processed.",
    },
  },
} as const;
```

## Help Text & Descriptions

### Field Help Text

```typescript
export const HELP_TEXT_COPY = {
  // Form field helpers
  formFields: {
    suggestedReply:
      "AI-generated response based on conversation context and best practices",
    internalNotes:
      "Add context for audit trail. This will not be visible to customers",
    actionSelection:
      "Choose the most appropriate action based on the situation",
    auditTrailNotes: "Provide context for this decision for future reference",
  },

  // Feature descriptions
  features: {
    salesPulse:
      "Track revenue, orders, and top-performing products in real-time",
    fulfillmentHealth:
      "Monitor order processing and identify fulfillment bottlenecks",
    inventoryHeatmap: "Get alerts for low stock and optimize reorder timing",
    cxEscalations:
      "Manage customer service issues that need immediate attention",
    seoContent: "Monitor website traffic and content performance changes",
  },

  // Status explanations
  statusExplanations: {
    healthy: "All systems operating normally with no issues detected",
    attention: "Action required to resolve identified issues or alerts",
    unconfigured: "Integration setup needed to enable monitoring and alerts",
  },
} as const;
```

## Accessibility Labels

### Screen Reader Labels

```typescript
export const ACCESSIBILITY_COPY = {
  // ARIA labels for screen readers
  ariaLabels: {
    // Tiles
    salesPulseTile: "Sales performance summary for current time window",
    fulfillmentHealthTile: "Order fulfillment status and performance metrics",
    inventoryHeatmapTile: "Inventory stock levels and reorder alerts",
    cxEscalationsTile: "Customer service escalations requiring attention",
    seoContentTile: "SEO and content performance monitoring dashboard",

    // Modal elements
    closeModal: "Close modal and return to dashboard",
    modalOverlay: "Modal dialog overlay",

    // Status indicators
    healthyStatus: "Status: Healthy - no issues detected",
    attentionStatus: "Status: Attention needed - action required",
    unconfiguredStatus: "Status: Configuration required - setup needed",

    // Interactive elements
    viewDetailsButton: "View detailed information and take action",
    refreshDataButton: "Refresh data to get latest information",
    settingsButton: "Open settings and configuration options",
  },

  // Live region announcements
  liveRegionAnnouncements: {
    dataRefreshed: "Dashboard data has been refreshed with latest information",
    actionCompleted: "Action completed successfully",
    errorOccurred: "An error occurred, please try again",
    statusChanged: (component: string, status: string) =>
      `${component} status changed to ${status}`,
  },

  // Form field descriptions
  fieldDescriptions: {
    requiredField: "This field is required",
    optionalField: "This field is optional",
    characterLimit: (current: number, max: number) =>
      `${current} of ${max} characters used`,
    validationError: "Please correct the error in this field",
  },
} as const;
```

## Brand Voice Guidelines

### Tone & Style

```typescript
export const BRAND_VOICE = {
  // Core principles
  principles: {
    clear: "Use simple, direct language that's easy to understand",
    actionable: "Focus on what users can do, not just what's happening",
    professional: "Maintain business-appropriate tone without being stuffy",
    helpful: "Provide context and guidance when users need to take action",
    consistent: "Use the same terms for the same concepts throughout",
  },

  // Writing guidelines
  guidelines: {
    // Preferred terms
    preferredTerms: {
      "customer service": "not 'support' or 'help desk'",
      escalation: "not 'issue' or 'problem'",
      inventory: "not 'stock' unless in compound terms like 'low stock'",
      revenue: "not 'sales' when referring to dollar amounts",
      orders: "not 'purchases' or 'transactions'",
    },

    // Capitalization rules
    capitalization: {
      titles: "Sentence case for headings and labels",
      buttons: "Sentence case for button text",
      status: "Title case for status badges",
      brands: "Proper case for brand names (Shopify, Chatwoot)",
    },

    // Number formatting
    numbers: {
      currency: "Use appropriate currency symbols and formatting",
      percentages: "Always include % symbol, use + for positive changes",
      counts: "Spell out one through nine, use numerals for 10+",
      dates: "Use relative time when recent (2 hours ago), absolute for older",
    },
  },

  // Error message style
  errorMessageStyle: {
    structure: "State the problem, then provide solution or next step",
    tone: "Apologetic but not overly dramatic",
    actionable: "Always include what the user should do next",
    examples: {
      good: "Unable to send reply. Please check your connection and try again.",
      avoid:
        "ERROR: Reply transmission failed due to network connectivity issues.",
    },
  },
} as const;
```

## Marketing Coordination Notes

### Update Process

```typescript
export const MARKETING_COORDINATION = {
  updateProcess: {
    owner: "Designer agent maintains technical implementation",
    marketingReview: "Marketing team reviews for brand voice alignment",
    approvalRequired: "Customer-facing copy requires marketing sign-off",
    implementationFlow: "Design → Marketing Review → Engineering → QA → Deploy",
  },

  reviewSchedule: {
    regular: "Monthly copy review meetings",
    urgent: "Slack channel for immediate copy questions",
    seasonal: "Quarterly voice and tone guideline updates",
  },

  changeRequests: {
    process: "Submit via marketing team Slack or email",
    timeline: "Allow 2-3 business days for review",
    implementation: "Designer agent updates code after approval",
    testing: "QA validates copy changes in all states",
  },

  brandAlignment: {
    voice: "Professional but approachable",
    customerFirst: "Always focus on user needs and clear actions",
    consistency: "Maintain terminology across all touchpoints",
    accessibility:
      "Language must be clear for all users including screen readers",
  },
} as const;
```

---

**Copy Status**: Ready for marketing team review  
**Language**: US English only  
**Total Copy Elements**: 150+ text strings with accessibility variants  
**Brand Voice**: Professional, clear, actionable  
**Marketing Coordination**: Process established for updates  
**Contact**: customer.support@hotrodan.com

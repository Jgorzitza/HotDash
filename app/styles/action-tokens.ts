/**
 * Design Tokens for Action System UI
 * 
 * Polaris-aligned tokens for Action Dock, Detail Views, and Dashboards
 * Created: 2025-10-14
 */

// Color Tokens
export const ActionColors = {
  priority: {
    urgent: {
      bg: 'var(--p-color-bg-critical-subdued)',
      border: 'var(--p-color-border-critical)',
      text: 'var(--p-color-text-critical)'
    },
    high: {
      bg: 'var(--p-color-bg-caution-subdued)',
      border: 'var(--p-color-border-caution)',
      text: 'var(--p-color-text-caution)'
    },
    normal: {
      bg: 'var(--p-color-bg-info-subdued)',
      border: 'var(--p-color-border-info)',
      text: 'var(--p-color-text-info)'
    },
    low: {
      bg: 'var(--p-color-bg-surface-secondary)',
      border: 'var(--p-color-border-secondary)',
      text: 'var(--p-color-text-subdued)'
    }
  },
  
  status: {
    pending: 'info',
    approved: 'success',
    rejected: 'critical',
    executed: 'success',
    failed: 'critical'
  } as const,
  
  platform: {
    chatwoot: 'info',
    shopify: 'success',
    default: 'subdued'
  } as const
};

// Spacing Tokens (Polaris system)
export const ActionSpacing = {
  card: 'var(--p-space-400)',           // 16px - card padding
  cardGap: 'var(--p-space-300)',        // 12px - gap between cards
  section: 'var(--p-space-500)',        // 20px - section spacing
  inline: 'var(--p-space-200)',         // 8px - inline elements
  inlineSmall: 'var(--p-space-150)',    // 6px - tight inline
  divider: 'var(--p-space-300)',        // 12px - around dividers
};

// Typography Variants (Polaris)
export const ActionTypography = {
  title: 'headingMd',           // Component titles
  subtitle: 'bodySm',           // Subtitles, metadata
  label: 'headingXs',           // Form labels, section headers
  body: 'bodyMd',               // Body text
  timestamp: 'bodySm',          // Timestamps
  hero: 'heading2xl'            // Large numbers, KPIs
} as const;

// Border Radius
export const ActionBorderRadius = {
  card: 'var(--p-border-radius-200)',       // 8px
  badge: 'var(--p-border-radius-full)',     // Full radius
  input: 'var(--p-border-radius-100)'       // 4px
};

// Border Widths for Priority Indicators
export const PriorityBorderWidth = {
  urgent: '4px',
  high: '4px',
  normal: '2px',
  low: '1px'
} as const;

// Chart Colors (matching Polaris theme)
export const ChartColors = {
  primary: '#008060',       // Polaris green
  secondary: '#5C6AC4',     // Polaris purple
  success: '#00A47C',       // Success green
  warning: '#EEC200',       // Warning yellow
  critical: '#D72C0D',      // Critical red
  neutral: '#202223'        // Text primary
};

// Icon Sizes
export const ActionIconSize = {
  small: '16px',
  medium: '20px',
  large: '24px'
} as const;

// Z-Index Layers
export const ActionZIndex = {
  card: 1,
  dropdown: 100,
  modal: 1000,
  toast: 2000
} as const;

// Transitions
export const ActionTransitions = {
  fast: '150ms ease-in-out',
  normal: '300ms ease-in-out',
  slow: '500ms ease-in-out'
};

// Breakpoints (Mobile-first)
export const ActionBreakpoints = {
  mobile: '320px',
  tablet: '768px',
  desktop: '1280px',
  wide: '1920px'
} as const;

// Component-specific Tokens

// ActionCard
export const ActionCardTokens = {
  minHeight: '120px',
  maxWidth: '100%',
  hoverShadow: 'var(--p-shadow-200)',
  activeShadow: 'var(--p-shadow-100)'
};

// ActionDock
export const ActionDockTokens = {
  maxActions: 10,
  gridGap: ActionSpacing.cardGap,
  gridColumns: {
    mobile: 1,
    tablet: 2,
    desktop: 1  // List view
  }
};

// Modal
export const ModalTokens = {
  maxWidth: '800px',
  padding: ActionSpacing.section,
  backdrop: 'rgba(0, 0, 0, 0.5)'
};

// Charts
export const ChartTokens = {
  height: {
    small: '200px',
    medium: '300px',
    large: '400px'
  },
  strokeWidth: '2px',
  gridColor: 'var(--p-color-border-secondary)',
  tooltipBg: 'var(--p-color-bg-surface)',
  tooltipBorder: 'var(--p-color-border)'
};

// Gauge (for approval rate, etc)
export const GaugeTokens = {
  size: '120px',
  strokeWidth: '12px',
  colors: {
    high: ChartColors.success,      // >= 80%
    medium: ChartColors.warning,    // 60-79%
    low: ChartColors.critical       // < 60%
  }
};

// Helper Functions

/**
 * Get priority color set based on priority level
 */
export function getPriorityColors(priority: 'urgent' | 'high' | 'normal' | 'low') {
  return ActionColors.priority[priority];
}

/**
 * Get status badge tone
 */
export function getStatusTone(status: string): 'info' | 'success' | 'critical' {
  return (ActionColors.status[status as keyof typeof ActionColors.status] || 'info') as 'info' | 'success' | 'critical';
}

/**
 * Get platform badge tone
 */
export function getPlatformTone(toolName: string): 'info' | 'success' | 'subdued' {
  const platform = toolName.split('_')[0];
  return (ActionColors.platform[platform as keyof typeof ActionColors.platform] || ActionColors.platform.default) as 'info' | 'success' | 'subdued';
}

/**
 * Get gauge color based on percentage
 */
export function getGaugeColor(percentage: number): string {
  if (percentage >= 80) return GaugeTokens.colors.high;
  if (percentage >= 60) return GaugeTokens.colors.medium;
  return GaugeTokens.colors.low;
}

/**
 * Format action type display name
 */
export function formatActionType(toolName: string): string {
  const parts = toolName.split('_');
  const platform = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  const action = parts.slice(1).join(' ').replace(/\b\w/g, l => l.toUpperCase());
  return `${action} (${platform})`;
}

/**
 * Get responsive column count for grid
 */
export function getGridColumns(breakpoint: 'mobile' | 'tablet' | 'desktop'): number {
  return ActionDockTokens.gridColumns[breakpoint];
}

// Export all tokens as default
export default {
  colors: ActionColors,
  spacing: ActionSpacing,
  typography: ActionTypography,
  borderRadius: ActionBorderRadius,
  priorityBorderWidth: PriorityBorderWidth,
  chartColors: ChartColors,
  iconSize: ActionIconSize,
  zIndex: ActionZIndex,
  transitions: ActionTransitions,
  breakpoints: ActionBreakpoints,
  card: ActionCardTokens,
  dock: ActionDockTokens,
  modal: ModalTokens,
  chart: ChartTokens,
  gauge: GaugeTokens
};


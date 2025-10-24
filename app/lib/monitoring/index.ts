/**
 * Production Monitoring Library
 * 
 * Provides comprehensive monitoring capabilities:
 * - Error tracking and reporting
 * - Performance monitoring
 * - Uptime monitoring
 * - Automated alerting
 * 
 * @see DEVOPS-017
 */

export { ErrorTracker, type ErrorReport, type ErrorContext } from './error-tracker';
export { PerformanceMonitor, type PerformanceMetric, type PerformanceReport } from './performance-monitor';
export { UptimeMonitor, type UptimeCheck, type UptimeReport } from './uptime-monitor';
export { AlertManager, type Alert, type AlertConfig } from './alert-manager';
export { MonitoringDashboard, type DashboardMetrics } from './dashboard';

/**
 * Initialize all monitoring systems
 */
export function initializeMonitoring() {
  // Error tracking is initialized on first use
  // Performance monitoring is passive
  // Uptime monitoring runs on schedule
  // Alerting is event-driven
  
}


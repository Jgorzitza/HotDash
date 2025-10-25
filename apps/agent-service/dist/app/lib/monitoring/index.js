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
export { ErrorTracker } from './error-tracker';
export { PerformanceMonitor } from './performance-monitor';
export { UptimeMonitor } from './uptime-monitor';
export { AlertManager } from './alert-manager';
export { MonitoringDashboard } from './dashboard';
/**
 * Initialize all monitoring systems
 */
export function initializeMonitoring() {
    // Error tracking is initialized on first use
    // Performance monitoring is passive
    // Uptime monitoring runs on schedule
    // Alerting is event-driven
    console.log('[Monitoring] Production monitoring initialized');
}
//# sourceMappingURL=index.js.map
# Performance Monitoring Setup

## Overview
This runbook documents the performance monitoring setup for HotDash, focusing on Tile P95 tracking and overall application performance metrics.

## Performance Metrics

### Core Web Vitals (CWV)
- **Largest Contentful Paint (LCP)**: < 2.5s (Good), < 4.0s (Needs Improvement)
- **First Input Delay (FID)**: < 100ms (Good), < 300ms (Needs Improvement)
- **Cumulative Layout Shift (CLS)**: < 0.1 (Good), < 0.25 (Needs Improvement)

### Tile Performance Metrics
- **P95 Load Time**: 95th percentile tile load time
- **P99 Load Time**: 99th percentile tile load time
- **Average Load Time**: Mean tile load time
- **Error Rate**: Percentage of failed tile loads

### Application Performance
- **Page Load Time**: Overall page load performance
- **API Response Time**: Backend API performance
- **Database Query Time**: Database performance metrics
- **Memory Usage**: Application memory consumption

## Monitoring Implementation

### 1. Google Analytics 4 Integration
- **Property ID**: 339826228
- **Custom Dimensions**: Performance metrics tracking
- **Event Tracking**: Performance-related events
- **Real-time Monitoring**: Live performance data

### 2. Fly.io Monitoring
- **Machine Metrics**: CPU, memory, network usage
- **Application Logs**: Performance-related log analysis
- **Health Checks**: Automated health monitoring
- **Alerting**: Performance threshold alerts

### 3. Custom Performance Tracking
- **Tile Load Times**: Individual tile performance
- **API Latency**: Backend service performance
- **Database Performance**: Query execution times
- **User Experience**: Real user monitoring (RUM)

## Performance Monitoring Setup

### 1. GA4 Performance Tracking
```typescript
// Performance tracking implementation
export function trackPerformance(metric: string, value: number, tile?: string) {
  gtag('event', 'performance_metric', {
    metric_name: metric,
    metric_value: value,
    tile_name: tile,
    custom_parameter_1: 'performance_monitoring'
  });
}
```

### 2. Tile Performance Monitoring
```typescript
// Tile load time tracking
export function trackTilePerformance(tileName: string, loadTime: number) {
  const performanceData = {
    tile: tileName,
    loadTime: loadTime,
    timestamp: new Date().toISOString(),
    p95Threshold: 2000, // 2 seconds
    p99Threshold: 5000  // 5 seconds
  };
  
  // Track in GA4
  trackPerformance('tile_load_time', loadTime, tileName);
  
  // Log to console for debugging
  console.log(`Tile Performance: ${tileName} loaded in ${loadTime}ms`);
}
```

### 3. API Performance Monitoring
```typescript
// API response time tracking
export async function trackAPIPerformance<T>(
  apiCall: () => Promise<T>,
  endpoint: string
): Promise<T> {
  const startTime = performance.now();
  
  try {
    const result = await apiCall();
    const duration = performance.now() - startTime;
    
    trackPerformance('api_response_time', duration, endpoint);
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    trackPerformance('api_error_time', duration, endpoint);
    throw error;
  }
}
```

## Performance Thresholds

### Tile Performance Targets
- **P95 Load Time**: < 2 seconds
- **P99 Load Time**: < 5 seconds
- **Error Rate**: < 1%
- **Availability**: > 99.9%

### API Performance Targets
- **P95 Response Time**: < 500ms
- **P99 Response Time**: < 1s
- **Error Rate**: < 0.1%
- **Availability**: > 99.95%

### Database Performance Targets
- **P95 Query Time**: < 100ms
- **P99 Query Time**: < 500ms
- **Connection Pool**: < 80% utilization
- **Query Success Rate**: > 99.9%

## Monitoring Dashboard

### 1. Real-time Performance Dashboard
- **Live Metrics**: Current performance indicators
- **Tile Status**: Individual tile performance
- **API Health**: Backend service status
- **Database Status**: Database performance metrics

### 2. Historical Performance Analysis
- **Trend Analysis**: Performance over time
- **Anomaly Detection**: Performance deviations
- **Capacity Planning**: Resource utilization trends
- **Performance Reports**: Regular performance summaries

### 3. Alerting Configuration
- **Performance Alerts**: Threshold-based notifications
- **Error Rate Alerts**: High error rate notifications
- **Availability Alerts**: Service availability issues
- **Capacity Alerts**: Resource utilization warnings

## Performance Optimization

### 1. Tile Optimization
- **Lazy Loading**: Load tiles on demand
- **Caching**: Cache tile data appropriately
- **Compression**: Optimize data transfer
- **Parallel Loading**: Load multiple tiles simultaneously

### 2. API Optimization
- **Response Caching**: Cache API responses
- **Database Optimization**: Optimize database queries
- **Connection Pooling**: Efficient database connections
- **Rate Limiting**: Prevent API abuse

### 3. Frontend Optimization
- **Code Splitting**: Load code on demand
- **Image Optimization**: Optimize image assets
- **Bundle Optimization**: Minimize JavaScript bundles
- **CDN Usage**: Use content delivery networks

## Performance Testing

### 1. Load Testing
- **Concurrent Users**: Test with multiple users
- **Peak Load**: Test under high load conditions
- **Stress Testing**: Test system limits
- **Endurance Testing**: Test over extended periods

### 2. Performance Benchmarks
- **Baseline Metrics**: Establish performance baselines
- **Regression Testing**: Detect performance regressions
- **Comparative Analysis**: Compare performance improvements
- **Goal Setting**: Set performance improvement targets

## Monitoring Tools

### 1. Google Analytics 4
- **Real-time Reports**: Live performance data
- **Custom Reports**: Performance-specific reports
- **Audience Insights**: User behavior analysis
- **Conversion Tracking**: Performance impact on conversions

### 2. Fly.io Monitoring
- **Machine Metrics**: Infrastructure performance
- **Application Logs**: Application performance logs
- **Health Checks**: Automated health monitoring
- **Alerting**: Performance threshold alerts

### 3. Custom Monitoring
- **Performance APIs**: Custom performance endpoints
- **Monitoring Scripts**: Automated performance checks
- **Dashboard Integration**: Custom performance dashboards
- **Reporting Tools**: Performance report generation

## Success Criteria

- [ ] P95 tile load time < 2 seconds
- [ ] P99 tile load time < 5 seconds
- [ ] API response time < 500ms (P95)
- [ ] Database query time < 100ms (P95)
- [ ] Error rate < 1%
- [ ] Availability > 99.9%
- [ ] Performance monitoring dashboard operational
- [ ] Automated alerting configured
- [ ] Performance optimization implemented
- [ ] Performance testing procedures established

## Configuration Files

### Performance Tracking
- `app/lib/performance.ts`: Performance tracking utilities
- `app/lib/analytics.ts`: GA4 integration
- `app/routes/api.performance.ts`: Performance API endpoints

### Monitoring Configuration
- `docs/runbooks/performance-monitoring.md`: This runbook
- `scripts/monitoring/performance-check.ts`: Performance monitoring scripts
- `tests/performance/`: Performance test suites

### Dashboard Configuration
- `app/routes/app.performance.tsx`: Performance dashboard
- `app/components/PerformanceTile.tsx`: Performance tile component
- `app/lib/performance-dashboard.ts`: Dashboard utilities
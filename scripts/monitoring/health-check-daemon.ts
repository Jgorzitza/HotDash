/**
 * Health Check Daemon
 * 
 * Continuously monitors critical services and APIs
 * Sends alerts when services become unhealthy
 * 
 * Run with: npx tsx scripts/monitoring/health-check-daemon.ts
 * Or as a background service: npx tsx scripts/monitoring/health-check-daemon.ts &
 */

import { createClient } from '@supabase/supabase-js';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

interface ServiceConfig {
  name: string;
  url: string;
  healthEndpoint: string;
  timeout: number;
  critical: boolean;
}

interface HealthStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  timestamp: string;
  error?: string;
  details?: any;
}

interface MonitoringStats {
  checks: number;
  healthy: number;
  degraded: number;
  down: number;
  avgResponseTime: number;
  uptime: number;
}

// Configuration
const services: ServiceConfig[] = [
  {
    name: 'Agent SDK',
    url: 'https://hotdash-agent-service.fly.dev',
    healthEndpoint: '/health',
    timeout: 5000,
    critical: true
  },
  {
    name: 'LlamaIndex MCP',
    url: 'https://hotdash-llamaindex-mcp.fly.dev',
    healthEndpoint: '/health',
    timeout: 5000,
    critical: true
  }
];

const CHECK_INTERVAL = 30000; // 30 seconds
const ALERT_THRESHOLD = 3; // Alert after 3 consecutive failures
const LOG_DIR = '/home/justin/HotDash/hot-dash/logs/monitoring';
const STATS_FILE = `${LOG_DIR}/health-stats.json`;

const failureCount = new Map<string, number>();
const stats = new Map<string, MonitoringStats>();
const startTime = Date.now();

/**
 * Check health of a single service
 */
async function checkServiceHealth(service: ServiceConfig): Promise<HealthStatus> {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), service.timeout);
    
    const response = await fetch(`${service.url}${service.healthEndpoint}`, {
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      return {
        service: service.name,
        status: 'down',
        responseTime,
        timestamp: new Date().toISOString(),
        error: `HTTP ${response.status}`
      };
    }
    
    const data = await response.json();
    
    // Determine status
    let status: 'healthy' | 'degraded' | 'down' = 'healthy';
    if (responseTime > 2000) {
      status = 'degraded';
    }
    if (data.status !== 'ok' && data.status !== 'healthy') {
      status = 'degraded';
    }
    
    return {
      service: service.name,
      status,
      responseTime,
      timestamp: new Date().toISOString(),
      details: data
    };
  } catch (error) {
    return {
      service: service.name,
      status: 'down',
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Update statistics for a service
 */
function updateStats(service: string, health: HealthStatus) {
  const current = stats.get(service) || {
    checks: 0,
    healthy: 0,
    degraded: 0,
    down: 0,
    avgResponseTime: 0,
    uptime: 0
  };
  
  current.checks++;
  
  if (health.status === 'healthy') current.healthy++;
  else if (health.status === 'degraded') current.degraded++;
  else current.down++;
  
  // Update average response time
  current.avgResponseTime = 
    (current.avgResponseTime * (current.checks - 1) + health.responseTime) / current.checks;
  
  // Calculate uptime percentage
  current.uptime = ((current.healthy + current.degraded) / current.checks) * 100;
  
  stats.set(service, current);
}

/**
 * Handle service failure
 */
async function handleFailure(service: ServiceConfig, health: HealthStatus) {
  const count = (failureCount.get(service.name) || 0) + 1;
  failureCount.set(service.name, count);
  
  if (count >= ALERT_THRESHOLD) {
    await sendAlert(service, health, count);
  }
}

/**
 * Handle service recovery
 */
async function handleRecovery(service: ServiceConfig, health: HealthStatus) {
  const previousCount = failureCount.get(service.name) || 0;
  
  if (previousCount >= ALERT_THRESHOLD) {
    await sendRecoveryAlert(service, health);
  }
  
  failureCount.set(service.name, 0);
}

/**
 * Send alert (log to file and console)
 */
async function sendAlert(service: ServiceConfig, health: HealthStatus, failureCount: number) {
  const alert = {
    type: 'ALERT',
    severity: service.critical ? 'CRITICAL' : 'WARNING',
    service: service.name,
    status: health.status,
    failureCount,
    timestamp: health.timestamp,
    error: health.error,
    message: `${service.name} has been ${health.status} for ${failureCount} consecutive checks`
  };
  
  console.error('🚨 ALERT:', JSON.stringify(alert, null, 2));
  
  // Log to file
  await appendLog('alerts', alert);
  
  // TODO: Send to Supabase or external alerting service
  // await logToSupabase(alert);
}

/**
 * Send recovery alert
 */
async function sendRecoveryAlert(service: ServiceConfig, health: HealthStatus) {
  const alert = {
    type: 'RECOVERY',
    severity: 'INFO',
    service: service.name,
    status: health.status,
    timestamp: health.timestamp,
    responseTime: health.responseTime,
    message: `${service.name} has recovered and is now ${health.status}`
  };
  
  console.log('✅ RECOVERY:', JSON.stringify(alert, null, 2));
  
  // Log to file
  await appendLog('alerts', alert);
}

/**
 * Append to log file
 */
async function appendLog(type: string, data: any) {
  const logFile = `${LOG_DIR}/${type}-${new Date().toISOString().split('T')[0]}.json`;
  
  // Ensure directory exists
  if (!existsSync(LOG_DIR)) {
    await mkdir(LOG_DIR, { recursive: true });
  }
  
  // Append to file (simple approach - one JSON object per line)
  const logEntry = JSON.stringify(data) + '\n';
  await writeFile(logFile, logEntry, { flag: 'a' });
}

/**
 * Save current statistics
 */
async function saveStats() {
  const statsData = {
    timestamp: new Date().toISOString(),
    uptimeSince: new Date(startTime).toISOString(),
    services: Array.from(stats.entries()).map(([name, data]) => ({
      name,
      ...data,
      avgResponseTime: Math.round(data.avgResponseTime),
      uptime: data.uptime.toFixed(2)
    }))
  };
  
  await writeFile(STATS_FILE, JSON.stringify(statsData, null, 2));
}

/**
 * Main monitoring loop
 */
async function monitoringLoop() {
  console.log('🔍 Health Check Daemon Started');
  console.log(`Monitoring ${services.length} services every ${CHECK_INTERVAL / 1000}s`);
  console.log('Critical services:', services.filter(s => s.critical).map(s => s.name).join(', '));
  console.log('Logs directory:', LOG_DIR);
  console.log('Press Ctrl+C to stop\n');
  
  // Ensure log directory exists
  if (!existsSync(LOG_DIR)) {
    await mkdir(LOG_DIR, { recursive: true });
  }
  
  while (true) {
    const checkStartTime = Date.now();
    console.log(`[${new Date().toISOString()}] Running health checks...`);
    
    // Check all services in parallel
    const results = await Promise.all(
      services.map(service => checkServiceHealth(service))
    );
    
    // Process results
    for (let i = 0; i < services.length; i++) {
      const service = services[i];
      const health = results[i];
      
      // Update statistics
      updateStats(service.name, health);
      
      // Log result
      const icon = health.status === 'healthy' ? '✅' : health.status === 'degraded' ? '⚠️' : '❌';
      console.log(
        `  ${icon} ${service.name}: ${health.status} (${health.responseTime}ms)` +
        (health.error ? ` - ${health.error}` : '')
      );
      
      // Handle failures and recoveries
      if (health.status === 'down') {
        await handleFailure(service, health);
      } else {
        await handleRecovery(service, health);
      }
      
      // Log to file
      await appendLog('health-checks', health);
    }
    
    // Save statistics
    await saveStats();
    
    const checkDuration = Date.now() - checkStartTime;
    console.log(`Health checks completed in ${checkDuration}ms\n`);
    
    // Wait before next check
    await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
  }
}

/**
 * Graceful shutdown
 */
function setupGracefulShutdown() {
  process.on('SIGINT', async () => {
    console.log('\n\n🛑 Shutting down health check daemon...');
    await saveStats();
    console.log('✅ Statistics saved');
    console.log('Goodbye!');
    process.exit(0);
  });
}

// Start monitoring
setupGracefulShutdown();
monitoringLoop().catch(error => {
  console.error('Fatal error in monitoring loop:', error);
  process.exit(1);
});


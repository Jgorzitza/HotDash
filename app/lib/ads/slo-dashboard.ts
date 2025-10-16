/**
 * SLO Dashboard for Ads APIs
 * 
 * Purpose: Service Level Objective monitoring for ads services
 * Owner: ads agent
 * Date: 2025-10-15
 */

export interface SLO {
  name: string;
  description: string;
  target: number;
  current: number;
  unit: 'percent' | 'ms' | 'count';
  status: 'healthy' | 'warning' | 'critical';
  threshold: {
    warning: number;
    critical: number;
  };
}

export interface SLODashboard {
  service: string;
  timestamp: string;
  slos: SLO[];
  overallHealth: 'healthy' | 'degraded' | 'down';
  incidents: SLOIncident[];
}

export interface SLOIncident {
  incidentId: string;
  sloName: string;
  severity: 'warning' | 'critical';
  startTime: string;
  endTime?: string;
  duration?: number;
  description: string;
  resolution?: string;
}

export const ADS_SLOS: SLO[] = [
  {
    name: 'API Availability',
    description: 'Percentage of successful API requests',
    target: 99.9,
    current: 99.95,
    unit: 'percent',
    status: 'healthy',
    threshold: { warning: 99.5, critical: 99.0 },
  },
  {
    name: 'API Latency P95',
    description: '95th percentile response time',
    target: 500,
    current: 350,
    unit: 'ms',
    status: 'healthy',
    threshold: { warning: 750, critical: 1000 },
  },
  {
    name: 'API Latency P99',
    description: '99th percentile response time',
    target: 1000,
    current: 650,
    unit: 'ms',
    status: 'healthy',
    threshold: { warning: 1500, critical: 2000 },
  },
  {
    name: 'Error Rate',
    description: 'Percentage of failed requests',
    target: 0.1,
    current: 0.05,
    unit: 'percent',
    status: 'healthy',
    threshold: { warning: 0.5, critical: 1.0 },
  },
  {
    name: 'Cache Hit Rate',
    description: 'Percentage of requests served from cache',
    target: 80,
    current: 85,
    unit: 'percent',
    status: 'healthy',
    threshold: { warning: 70, critical: 60 },
  },
  {
    name: 'Data Freshness',
    description: 'Age of cached data in minutes',
    target: 5,
    current: 3,
    unit: 'count',
    status: 'healthy',
    threshold: { warning: 10, critical: 15 },
  },
];

export function calculateSLOStatus(slo: SLO): 'healthy' | 'warning' | 'critical' {
  if (slo.unit === 'percent') {
    if (slo.name === 'Error Rate') {
      // Lower is better for error rate
      if (slo.current >= slo.threshold.critical) return 'critical';
      if (slo.current >= slo.threshold.warning) return 'warning';
      return 'healthy';
    } else {
      // Higher is better for availability and cache hit rate
      if (slo.current <= slo.threshold.critical) return 'critical';
      if (slo.current <= slo.threshold.warning) return 'warning';
      return 'healthy';
    }
  } else if (slo.unit === 'ms' || slo.unit === 'count') {
    // Lower is better for latency and data age
    if (slo.current >= slo.threshold.critical) return 'critical';
    if (slo.current >= slo.threshold.warning) return 'warning';
    return 'healthy';
  }
  return 'healthy';
}

export function updateSLOStatus(slos: SLO[]): SLO[] {
  return slos.map(slo => ({
    ...slo,
    status: calculateSLOStatus(slo),
  }));
}

export function calculateOverallHealth(slos: SLO[]): 'healthy' | 'degraded' | 'down' {
  const criticalCount = slos.filter(s => s.status === 'critical').length;
  const warningCount = slos.filter(s => s.status === 'warning').length;

  if (criticalCount > 0) return 'down';
  if (warningCount > 0) return 'degraded';
  return 'healthy';
}

export function generateSLODashboard(
  service: string = 'ads-api',
  slos: SLO[] = ADS_SLOS,
  incidents: SLOIncident[] = []
): SLODashboard {
  const updatedSlos = updateSLOStatus(slos);
  const overallHealth = calculateOverallHealth(updatedSlos);

  return {
    service,
    timestamp: new Date().toISOString(),
    slos: updatedSlos,
    overallHealth,
    incidents,
  };
}

export function recordSLOIncident(
  sloName: string,
  severity: 'warning' | 'critical',
  description: string
): SLOIncident {
  return {
    incidentId: `incident_${Date.now()}`,
    sloName,
    severity,
    startTime: new Date().toISOString(),
    description,
  };
}

export function resolveSLOIncident(
  incident: SLOIncident,
  resolution: string
): SLOIncident {
  const endTime = new Date().toISOString();
  const duration = new Date(endTime).getTime() - new Date(incident.startTime).getTime();

  return {
    ...incident,
    endTime,
    duration,
    resolution,
  };
}

export function getSLOCompliance(slo: SLO): {
  isCompliant: boolean;
  deviation: number;
  deviationPercent: number;
} {
  let deviation: number;
  let isCompliant: boolean;

  if (slo.unit === 'percent') {
    if (slo.name === 'Error Rate') {
      deviation = slo.current - slo.target;
      isCompliant = slo.current <= slo.target;
    } else {
      deviation = slo.current - slo.target;
      isCompliant = slo.current >= slo.target;
    }
  } else {
    deviation = slo.current - slo.target;
    isCompliant = slo.current <= slo.target;
  }

  const deviationPercent = (deviation / slo.target) * 100;

  return { isCompliant, deviation, deviationPercent };
}

export function generateSLOReport(dashboard: SLODashboard): {
  summary: string;
  compliantSlos: number;
  totalSlos: number;
  complianceRate: number;
  recommendations: string[];
} {
  const compliantSlos = dashboard.slos.filter(slo => {
    const compliance = getSLOCompliance(slo);
    return compliance.isCompliant;
  }).length;

  const totalSlos = dashboard.slos.length;
  const complianceRate = (compliantSlos / totalSlos) * 100;

  const recommendations: string[] = [];

  for (const slo of dashboard.slos) {
    if (slo.status === 'critical') {
      recommendations.push(`CRITICAL: ${slo.name} is ${slo.current}${slo.unit} (target: ${slo.target}${slo.unit}). Immediate action required.`);
    } else if (slo.status === 'warning') {
      recommendations.push(`WARNING: ${slo.name} is ${slo.current}${slo.unit} (target: ${slo.target}${slo.unit}). Monitor closely.`);
    }
  }

  const summary = `${dashboard.service} is ${dashboard.overallHealth}. ${compliantSlos}/${totalSlos} SLOs compliant (${complianceRate.toFixed(1)}%).`;

  return {
    summary,
    compliantSlos,
    totalSlos,
    complianceRate,
    recommendations,
  };
}

export function monitorSLOs(
  currentMetrics: {
    availability: number;
    latencyP95: number;
    latencyP99: number;
    errorRate: number;
    cacheHitRate: number;
    dataFreshnessMinutes: number;
  }
): SLODashboard {
  const slos: SLO[] = [
    {
      name: 'API Availability',
      description: 'Percentage of successful API requests',
      target: 99.9,
      current: currentMetrics.availability,
      unit: 'percent',
      status: 'healthy',
      threshold: { warning: 99.5, critical: 99.0 },
    },
    {
      name: 'API Latency P95',
      description: '95th percentile response time',
      target: 500,
      current: currentMetrics.latencyP95,
      unit: 'ms',
      status: 'healthy',
      threshold: { warning: 750, critical: 1000 },
    },
    {
      name: 'API Latency P99',
      description: '99th percentile response time',
      target: 1000,
      current: currentMetrics.latencyP99,
      unit: 'ms',
      status: 'healthy',
      threshold: { warning: 1500, critical: 2000 },
    },
    {
      name: 'Error Rate',
      description: 'Percentage of failed requests',
      target: 0.1,
      current: currentMetrics.errorRate,
      unit: 'percent',
      status: 'healthy',
      threshold: { warning: 0.5, critical: 1.0 },
    },
    {
      name: 'Cache Hit Rate',
      description: 'Percentage of requests served from cache',
      target: 80,
      current: currentMetrics.cacheHitRate,
      unit: 'percent',
      status: 'healthy',
      threshold: { warning: 70, critical: 60 },
    },
    {
      name: 'Data Freshness',
      description: 'Age of cached data in minutes',
      target: 5,
      current: currentMetrics.dataFreshnessMinutes,
      unit: 'count',
      status: 'healthy',
      threshold: { warning: 10, critical: 15 },
    },
  ];

  return generateSLODashboard('ads-api', slos);
}


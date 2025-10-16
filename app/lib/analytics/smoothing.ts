/**
 * Trends Smoothing Utilities
 * 
 * Smooth noisy time-series data for better trend visualization.
 */

export interface DataPoint {
  date: string;
  value: number;
}

/**
 * Simple Moving Average (SMA)
 */
export function movingAverage(data: DataPoint[], window: number = 7): DataPoint[] {
  if (data.length < window) return data;

  const smoothed: DataPoint[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < window - 1) {
      smoothed.push(data[i]);
      continue;
    }

    const windowData = data.slice(i - window + 1, i + 1);
    const avg = windowData.reduce((sum, d) => sum + d.value, 0) / window;

    smoothed.push({
      date: data[i].date,
      value: avg,
    });
  }

  return smoothed;
}

/**
 * Exponential Moving Average (EMA)
 */
export function exponentialMovingAverage(data: DataPoint[], alpha: number = 0.3): DataPoint[] {
  if (data.length === 0) return [];

  const smoothed: DataPoint[] = [data[0]];

  for (let i = 1; i < data.length; i++) {
    const ema = alpha * data[i].value + (1 - alpha) * smoothed[i - 1].value;
    smoothed.push({
      date: data[i].date,
      value: ema,
    });
  }

  return smoothed;
}

/**
 * Remove outliers using IQR method
 */
export function removeOutliers(data: DataPoint[]): DataPoint[] {
  const values = data.map(d => d.value).sort((a, b) => a - b);
  const q1 = values[Math.floor(values.length * 0.25)];
  const q3 = values[Math.floor(values.length * 0.75)];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  return data.filter(d => d.value >= lowerBound && d.value <= upperBound);
}

/**
 * Calculate trend direction
 */
export function calculateTrend(data: DataPoint[]): 'up' | 'down' | 'flat' {
  if (data.length < 2) return 'flat';

  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));

  const firstAvg = firstHalf.reduce((sum, d) => sum + d.value, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, d) => sum + d.value, 0) / secondHalf.length;

  const change = ((secondAvg - firstAvg) / firstAvg) * 100;

  if (change > 5) return 'up';
  if (change < -5) return 'down';
  return 'flat';
}


/**
 * Performance profiling tools for detailed analysis
 * 
 * Provides CPU and memory profiling capabilities
 * for identifying performance bottlenecks.
 */

interface ProfileSnapshot {
  timestamp: Date;
  memory: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
  cpu?: {
    user: number;
    system: number;
  };
}

interface ProfileResult {
  name: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  snapshots: ProfileSnapshot[];
  summary: {
    avgMemoryUsed: number;
    maxMemoryUsed: number;
    memoryGrowth: number;
  };
}

class Profiler {
  private profiles: ProfileResult[] = [];
  private activeProfiles = new Map<
    string,
    {
      name: string;
      startTime: Date;
      startMemory: ProfileSnapshot;
      snapshots: ProfileSnapshot[];
      intervalId?: NodeJS.Timeout;
    }
  >();

  /**
   * Start profiling an operation
   * 
   * @param name - Name of the operation to profile
   * @param sampleIntervalMs - How often to sample (default: 100ms)
   * @returns Profile ID
   */
  startProfile(name: string, sampleIntervalMs = 100): string {
    const profileId = `profile-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const startSnapshot = this.captureSnapshot();

    const profile = {
      name,
      startTime: new Date(),
      startMemory: startSnapshot,
      snapshots: [startSnapshot],
      intervalId: undefined as NodeJS.Timeout | undefined,
    };

    // Sample periodically
    if (typeof setInterval !== "undefined") {
      profile.intervalId = setInterval(() => {
        profile.snapshots.push(this.captureSnapshot());
      }, sampleIntervalMs);
    }

    this.activeProfiles.set(profileId, profile);
    return profileId;
  }

  /**
   * End profiling and get results
   */
  endProfile(profileId: string): ProfileResult | null {
    const profile = this.activeProfiles.get(profileId);
    if (!profile) return null;

    // Stop sampling
    if (profile.intervalId) {
      clearInterval(profile.intervalId);
    }

    // Final snapshot
    const endSnapshot = this.captureSnapshot();
    profile.snapshots.push(endSnapshot);

    // Calculate summary
    const memoryUsages = profile.snapshots.map((s) => s.memory.heapUsed);
    const avgMemoryUsed = memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length;
    const maxMemoryUsed = Math.max(...memoryUsages);
    const memoryGrowth = endSnapshot.memory.heapUsed - profile.startMemory.memory.heapUsed;

    const result: ProfileResult = {
      name: profile.name,
      startTime: profile.startTime,
      endTime: new Date(),
      duration: Date.now() - profile.startTime.getTime(),
      snapshots: profile.snapshots,
      summary: {
        avgMemoryUsed: Math.round(avgMemoryUsed / 1024 / 1024), // MB
        maxMemoryUsed: Math.round(maxMemoryUsed / 1024 / 1024), // MB
        memoryGrowth: Math.round(memoryGrowth / 1024 / 1024), // MB
      },
    };

    this.activeProfiles.delete(profileId);
    this.profiles.push(result);

    // Log results
    console.log(`[Profiler] ${result.name} completed:`, {
      duration: `${result.duration}ms`,
      avgMemory: `${result.summary.avgMemoryUsed}MB`,
      maxMemory: `${result.summary.maxMemoryUsed}MB`,
      growth: `${result.summary.memoryGrowth}MB`,
      samples: result.snapshots.length,
    });

    return result;
  }

  /**
   * Capture current system snapshot
   */
  private captureSnapshot(): ProfileSnapshot {
    const mem = process.memoryUsage();

    return {
      timestamp: new Date(),
      memory: {
        heapUsed: mem.heapUsed,
        heapTotal: mem.heapTotal,
        external: mem.external,
        rss: mem.rss,
      },
      cpu: process.cpuUsage
        ? {
            user: process.cpuUsage().user,
            system: process.cpuUsage().system,
          }
        : undefined,
    };
  }

  /**
   * Get all profile results
   */
  getProfiles(): ProfileResult[] {
    return this.profiles;
  }

  /**
   * Clear all profiles
   */
  clear(): void {
    this.profiles = [];
    this.activeProfiles.clear();
  }
}

// Singleton instance
export const profiler = new Profiler();

/**
 * Helper to profile an async operation
 * 
 * @example
 * ```typescript
 * const result = await withProfiling('expensive-operation', async () => {
 *   // Your expensive operation
 *   return await complexCalculation();
 * });
 * ```
 */
export async function withProfiling<T>(
  name: string,
  operation: () => Promise<T>,
  sampleIntervalMs = 100,
): Promise<T> {
  const profileId = profiler.startProfile(name, sampleIntervalMs);

  try {
    const result = await operation();
    profiler.endProfile(profileId);
    return result;
  } catch (error) {
    profiler.endProfile(profileId);
    throw error;
  }
}


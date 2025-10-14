/**
 * Query optimization framework
 * 
 * Provides tools and utilities for optimizing database queries,
 * detecting N+1 problems, and analyzing query performance.
 */

interface QueryLog {
  id: string;
  query: string;
  duration: number;
  rowCount?: number;
  timestamp: Date;
  stackTrace?: string;
}

interface QueryAnalysis {
  totalQueries: number;
  totalDuration: number;
  avgDuration: number;
  slowQueries: QueryLog[]; // >100ms
  duplicateQueries: Map<string, QueryLog[]>;
  nPlusOnePatterns: string[];
}

class QueryOptimizer {
  private queryLogs: QueryLog[] = [];
  private maxLogs = 10000;
  private slowQueryThreshold = 100; // ms

  /**
   * Log a query execution
   */
  logQuery(query: string, duration: number, rowCount?: number, stackTrace?: string): void {
    const log: QueryLog = {
      id: `query-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      query: this.normalizeQuery(query),
      duration,
      rowCount,
      timestamp: new Date(),
      stackTrace,
    };

    this.queryLogs.push(log);

    // Keep only last N logs
    if (this.queryLogs.length > this.maxLogs) {
      this.queryLogs.shift();
    }

    // Warn on slow queries
    if (duration > this.slowQueryThreshold) {
      console.warn(`[Query Optimizer] Slow query (${duration}ms):`, {
        query: query.substring(0, 100),
        rowCount,
      });
    }
  }

  /**
   * Analyze query patterns
   */
  analyze(timeWindowMs = 60000): QueryAnalysis {
    const cutoff = Date.now() - timeWindowMs;
    const recentLogs = this.queryLogs.filter((log) => log.timestamp.getTime() > cutoff);

    // Find slow queries
    const slowQueries = recentLogs.filter((log) => log.duration > this.slowQueryThreshold);

    // Find duplicate queries
    const duplicateQueries = new Map<string, QueryLog[]>();
    for (const log of recentLogs) {
      const existing = duplicateQueries.get(log.query) || [];
      existing.push(log);
      duplicateQueries.set(log.query, existing);
    }

    // Keep only duplicates (>1 occurrence)
    for (const [query, logs] of duplicateQueries.entries()) {
      if (logs.length <= 1) {
        duplicateQueries.delete(query);
      }
    }

    // Detect N+1 patterns (many similar queries in short time)
    const nPlusOnePatterns: string[] = [];
    for (const [query, logs] of duplicateQueries.entries()) {
      if (logs.length > 10) {
        // More than 10 occurrences likely indicates N+1
        const timeSpan = logs[logs.length - 1].timestamp.getTime() - logs[0].timestamp.getTime();
        if (timeSpan < 5000) {
          // Within 5 seconds
          nPlusOnePatterns.push(query);
        }
      }
    }

    return {
      totalQueries: recentLogs.length,
      totalDuration: recentLogs.reduce((sum, log) => sum + log.duration, 0),
      avgDuration: recentLogs.length > 0
        ? recentLogs.reduce((sum, log) => sum + log.duration, 0) / recentLogs.length
        : 0,
      slowQueries,
      duplicateQueries,
      nPlusOnePatterns,
    };
  }

  /**
   * Get optimization suggestions
   */
  getSuggestions(timeWindowMs = 60000): string[] {
    const analysis = this.analyze(timeWindowMs);
    const suggestions: string[] = [];

    // Slow queries
    if (analysis.slowQueries.length > 0) {
      suggestions.push(
        `Found ${analysis.slowQueries.length} slow queries (>${this.slowQueryThreshold}ms). Consider adding indexes or optimizing queries.`,
      );
    }

    // N+1 patterns
    if (analysis.nPlusOnePatterns.length > 0) {
      suggestions.push(
        `Detected ${analysis.nPlusOnePatterns.length} potential N+1 query patterns. Consider using joins or eager loading.`,
      );
      for (const pattern of analysis.nPlusOnePatterns.slice(0, 3)) {
        suggestions.push(`  - ${pattern.substring(0, 80)}...`);
      }
    }

    // High duplicate rate
    const duplicateRate = (analysis.duplicateQueries.size / analysis.totalQueries) * 100;
    if (duplicateRate > 30) {
      suggestions.push(
        `High duplicate query rate (${duplicateRate.toFixed(1)}%). Consider implementing caching or query batching.`,
      );
    }

    // High average duration
    if (analysis.avgDuration > 50) {
      suggestions.push(
        `Average query duration is ${analysis.avgDuration.toFixed(1)}ms. Consider query optimization or database tuning.`,
      );
    }

    return suggestions;
  }

  /**
   * Normalize query for comparison (remove literals)
   */
  private normalizeQuery(query: string): string {
    return query
      .replace(/\d+/g, "?") // Replace numbers with ?
      .replace(/'[^']*'/g, "?") // Replace string literals with ?
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();
  }

  /**
   * Get recent query logs
   */
  getRecentLogs(limit = 100): QueryLog[] {
    return this.queryLogs.slice(-limit);
  }

  /**
   * Clear all logs
   */
  clear(): void {
    this.queryLogs = [];
  }
}

// Singleton instance
export const queryOptimizer = new QueryOptimizer();

/**
 * Middleware wrapper for query profiling
 * 
 * @example
 * ```typescript
 * const result = await withQueryProfiling('get-sales', async () => {
 *   return await prisma.order.findMany();
 * });
 * ```
 */
export async function withQueryProfiling<T>(
  name: string,
  operation: () => Promise<T>,
): Promise<T> {
  const start = Date.now();
  let error: Error | undefined;

  try {
    const result = await operation();
    return result;
  } catch (e) {
    error = e instanceof Error ? e : new Error(String(e));
    throw error;
  } finally {
    const duration = Date.now() - start;

    // Log the operation (not individual queries, but the overall operation)
    queryOptimizer.logQuery(name, duration);

    if (error) {
      console.error(`[Query Profiler] Operation failed: ${name}`, {
        duration: `${duration}ms`,
        error: error.message,
      });
    }
  }
}

/**
 * Prisma middleware for automatic query logging
 * 
 * Add to Prisma client:
 * ```typescript
 * prisma.$use(prismaQueryLogger);
 * ```
 */
export async function prismaQueryLogger(
  params: { model?: string; action: string; args: unknown },
  next: (params: unknown) => Promise<unknown>,
): Promise<unknown> {
  const start = Date.now();
  const queryName = `${params.model}.${params.action}`;

  try {
    const result = await next(params);
    const duration = Date.now() - start;

    queryOptimizer.logQuery(queryName, duration, Array.isArray(result) ? result.length : 1);

    return result;
  } catch (error) {
    const duration = Date.now() - start;
    queryOptimizer.logQuery(queryName, duration);
    throw error;
  }
}


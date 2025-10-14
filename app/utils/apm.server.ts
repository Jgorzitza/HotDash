/**
 * Application Performance Monitoring (APM)
 * 
 * Comprehensive monitoring for application performance,
 * errors, and user experience metrics.
 */

interface Transaction {
  id: string;
  type: "http" | "db" | "external_api";
  name: string;
  startTime: number;
  duration?: number;
  status: "success" | "error";
  spans: Span[];
  metadata: Record<string, unknown>;
  error?: string;
}

interface Span {
  id: string;
  parentId?: string;
  name: string;
  type: string;
  startTime: number;
  duration: number;
  metadata: Record<string, unknown>;
}

class APM {
  private transactions: Transaction[] = [];
  private activeTransactions = new Map<string, Transaction>();
  private maxTransactions = 1000;

  /**
   * Start a new transaction
   */
  startTransaction(
    type: Transaction["type"],
    name: string,
    metadata: Record<string, unknown> = {},
  ): string {
    const id = `txn-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const transaction: Transaction = {
      id,
      type,
      name,
      startTime: Date.now(),
      status: "success",
      spans: [],
      metadata,
    };

    this.activeTransactions.set(id, transaction);
    return id;
  }

  /**
   * Add a span to a transaction
   */
  startSpan(
    transactionId: string,
    name: string,
    type: string,
    metadata: Record<string, unknown> = {},
  ): string {
    const transaction = this.activeTransactions.get(transactionId);
    if (!transaction) {
      console.warn(`Transaction ${transactionId} not found for span ${name}`);
      return "";
    }

    const spanId = `span-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const span: Span = {
      id: spanId,
      name,
      type,
      startTime: Date.now(),
      duration: 0,
      metadata,
    };

    transaction.spans.push(span);
    return spanId;
  }

  /**
   * End a span
   */
  endSpan(transactionId: string, spanId: string): void {
    const transaction = this.activeTransactions.get(transactionId);
    if (!transaction) return;

    const span = transaction.spans.find((s) => s.id === spanId);
    if (span) {
      span.duration = Date.now() - span.startTime;
    }
  }

  /**
   * End a transaction
   */
  endTransaction(
    transactionId: string,
    status: "success" | "error" = "success",
    error?: string,
  ): void {
    const transaction = this.activeTransactions.get(transactionId);
    if (!transaction) return;

    transaction.duration = Date.now() - transaction.startTime;
    transaction.status = status;
    if (error) {
      transaction.error = error;
    }

    this.transactions.push(transaction);
    this.activeTransactions.delete(transactionId);

    // Keep only last N transactions
    if (this.transactions.length > this.maxTransactions) {
      this.transactions.shift();
    }

    // Log slow transactions (>1s)
    if (transaction.duration > 1000) {
      console.warn(
        `[APM] Slow transaction: ${transaction.name} took ${transaction.duration}ms`,
        { spans: transaction.spans.length, type: transaction.type },
      );
    }

    // Log errors
    if (status === "error") {
      console.error(`[APM] Transaction error: ${transaction.name}`, {
        error,
        duration: transaction.duration,
      });
    }
  }

  /**
   * Get transactions
   */
  getTransactions(filter?: {
    type?: Transaction["type"];
    status?: Transaction["status"];
    minDuration?: number;
  }): Transaction[] {
    let filtered = this.transactions;

    if (filter?.type) {
      filtered = filtered.filter((t) => t.type === filter.type);
    }

    if (filter?.status) {
      filtered = filtered.filter((t) => t.status === filter.status);
    }

    if (filter?.minDuration) {
      filtered = filtered.filter((t) => (t.duration || 0) >= filter.minDuration);
    }

    return filtered;
  }

  /**
   * Get aggregated metrics
   */
  getMetrics(): {
    totalTransactions: number;
    successRate: number;
    avgDuration: number;
    p95Duration: number;
    p99Duration: number;
    errorRate: number;
    slowRequests: number;
  } {
    const total = this.transactions.length;
    if (total === 0) {
      return {
        totalTransactions: 0,
        successRate: 100,
        avgDuration: 0,
        p95Duration: 0,
        p99Duration: 0,
        errorRate: 0,
        slowRequests: 0,
      };
    }

    const successes = this.transactions.filter((t) => t.status === "success").length;
    const durations = this.transactions
      .map((t) => t.duration || 0)
      .sort((a, b) => a - b);

    const p95Index = Math.floor(durations.length * 0.95);
    const p99Index = Math.floor(durations.length * 0.99);

    return {
      totalTransactions: total,
      successRate: (successes / total) * 100,
      avgDuration: durations.reduce((a, b) => a + b, 0) / total,
      p95Duration: durations[p95Index] || 0,
      p99Duration: durations[p99Index] || 0,
      errorRate: ((total - successes) / total) * 100,
      slowRequests: durations.filter((d) => d > 1000).length,
    };
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.transactions = [];
    this.activeTransactions.clear();
  }
}

// Singleton instance
export const apm = new APM();

/**
 * Middleware wrapper for APM tracking
 * 
 * @example
 * ```typescript
 * export async function loader({ request }: LoaderFunctionArgs) {
 *   return withAPM(request, 'dashboard.load', async (txnId) => {
 *     const spanId = apm.startSpan(txnId, 'fetch-sales', 'db');
 *     const sales = await getSales();
 *     apm.endSpan(txnId, spanId);
 *     
 *     return Response.json({ sales });
 *   });
 * }
 * ```
 */
export async function withAPM(
  request: Request,
  name: string,
  handler: (transactionId: string) => Promise<Response>,
): Promise<Response> {
  const url = new URL(request.url);
  const txnId = apm.startTransaction("http", name, {
    method: request.method,
    path: url.pathname,
    query: Object.fromEntries(url.searchParams),
  });

  try {
    const response = await handler(txnId);
    apm.endTransaction(txnId, "success");
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    apm.endTransaction(txnId, "error", errorMessage);
    throw error;
  }
}


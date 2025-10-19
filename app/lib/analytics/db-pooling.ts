/**
 * Database Query Pooling
 *
 * Connection pooling for analytics Supabase queries.
 * Improves performance and prevents connection exhaustion.
 */

export interface PoolConfig {
  min: number;
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

export const DEFAULT_POOL_CONFIG: PoolConfig = {
  min: 2,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

/**
 * Get pool configuration
 * TODO: Implement with pg-pool or Supabase connection pooler
 */
export function getPoolConfig(): PoolConfig {
  return {
    min: parseInt(process.env.DB_POOL_MIN || "2", 10),
    max: parseInt(process.env.DB_POOL_MAX || "10", 10),
    idleTimeoutMillis: parseInt(
      process.env.DB_POOL_IDLE_TIMEOUT || "30000",
      10,
    ),
    connectionTimeoutMillis: parseInt(
      process.env.DB_POOL_CONNECT_TIMEOUT || "5000",
      10,
    ),
  };
}

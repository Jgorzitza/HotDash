/**
 * Comprehensive Health Check API
 *
 * Provides detailed health information for smoke tests and monitoring.
 *
 * Endpoints:
 * - GET /api/health - Overall health status
 * - GET /api/health/database - Database connectivity and performance
 * - GET /api/health/schema - Database schema validation
 * - GET /api/health/rls - RLS policy verification
 * - GET /api/health/data - Critical table data checks
 * - GET /api/health/backup - Backup status
 * - GET /api/health/orphans - Orphaned record detection
 * - GET /api/health/consistency - Data consistency checks
 * - GET /api/health/migrations - Migration status
 * - GET /api/health/performance - Performance metrics
 * - GET /api/health/locks - Database lock detection
 * - GET /api/health/tasks - Task assignment validation
 * - GET /api/health/decisions - Decision log integrity
 */
import { type LoaderFunctionArgs } from "react-router";
export declare function loader({ request, params }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.health.$.d.ts.map
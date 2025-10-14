import { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';

/**
 * Role-Based Access Control (RBAC) Middleware
 * 
 * Enforces permissions on Action approvals and admin operations.
 * Goes beyond Shopify defaults with custom role/permission system.
 * 
 * Usage:
 * app.post('/approvals/:id/:action', requireRole('operator'), handler);
 */

export enum Role {
  SYSTEM = 'system',      // Automated systems, full access
  ADMIN = 'admin',        // Full access to all operations
  OPERATOR = 'operator',  // Can approve/reject actions, limited admin
  VIEWER = 'viewer',      // Read-only access
}

export enum Permission {
  // Approval permissions
  APPROVE_ACTION = 'approve:action',
  REJECT_ACTION = 'reject:action',
  VIEW_APPROVALS = 'view:approvals',
  
  // Admin permissions
  MANAGE_ROLES = 'manage:roles',
  MANAGE_USERS = 'manage:users',
  VIEW_AUDIT = 'view:audit',
  MANAGE_CONFIG = 'manage:config',
  
  // Data permissions
  VIEW_DATA = 'view:data',
  EXPORT_DATA = 'export:data',
}

// Role-Permission mapping
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.SYSTEM]: Object.values(Permission), // Full access
  [Role.ADMIN]: [
    Permission.APPROVE_ACTION,
    Permission.REJECT_ACTION,
    Permission.VIEW_APPROVALS,
    Permission.MANAGE_ROLES,
    Permission.MANAGE_USERS,
    Permission.VIEW_AUDIT,
    Permission.MANAGE_CONFIG,
    Permission.VIEW_DATA,
    Permission.EXPORT_DATA,
  ],
  [Role.OPERATOR]: [
    Permission.APPROVE_ACTION,
    Permission.REJECT_ACTION,
    Permission.VIEW_APPROVALS,
    Permission.VIEW_AUDIT,
    Permission.VIEW_DATA,
  ],
  [Role.VIEWER]: [
    Permission.VIEW_APPROVALS,
    Permission.VIEW_DATA,
  ],
};

interface User {
  id: string;
  email: string;
  role: Role;
  shopifyId?: string;
  createdAt: Date;
}

// User store (in production, use database)
const userStore = new Map<string, User>();

// Database pool
let pool: Pool | null = null;

export function initializeRBAC(pgUrl?: string) {
  if (pgUrl) {
    pool = new Pool({ connectionString: pgUrl });
  }
}

if (process.env.PG_URL) {
  initializeRBAC(process.env.PG_URL);
}

/**
 * Get user from request (via session, token, etc.)
 */
async function getUserFromRequest(req: Request): Promise<User | null> {
  // In production, extract from JWT, session, or auth header
  const userId = req.headers['x-user-id'] as string;
  const userEmail = req.headers['x-user-email'] as string;
  
  if (!userId) {
    return null;
  }
  
  // Try database first
  if (pool) {
    try {
      const { rows } = await pool.query(
        `SELECT id, email, role, shopify_id, created_at FROM users WHERE id = $1`,
        [userId]
      );
      
      if (rows[0]) {
        return {
          id: rows[0].id,
          email: rows[0].email,
          role: rows[0].role as Role,
          shopifyId: rows[0].shopify_id,
          createdAt: rows[0].created_at,
        };
      }
    } catch (err) {
      console.error('[RBAC] DB error:', err);
    }
  }
  
  // Fallback to in-memory store
  if (userStore.has(userId)) {
    return userStore.get(userId)!;
  }
  
  // Create temporary user (for testing/demo)
  if (process.env.NODE_ENV === 'development' && userEmail) {
    const user: User = {
      id: userId,
      email: userEmail,
      role: Role.OPERATOR, // Default role
      createdAt: new Date(),
    };
    userStore.set(userId, user);
    return user;
  }
  
  return null;
}

/**
 * Check if user has specific permission
 */
function hasPermission(user: User, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[user.role] || [];
  return permissions.includes(permission);
}

/**
 * Middleware: Require specific role
 */
export function requireRole(...roles: Role[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await getUserFromRequest(req);
      
      if (!user) {
        await logAccessAttempt(req, null, 'DENIED', 'No user found');
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      if (!roles.includes(user.role)) {
        await logAccessAttempt(req, user, 'DENIED', `Role ${user.role} not in [${roles.join(', ')}]`);
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          requiredRole: roles,
          userRole: user.role,
        });
      }
      
      await logAccessAttempt(req, user, 'GRANTED', `Role ${user.role} authorized`);
      
      // Attach user to request
      (req as any).user = user;
      next();
      
    } catch (err) {
      console.error('[RBAC] Error:', err);
      return res.status(500).json({ error: 'Authorization failed' });
    }
  };
}

/**
 * Middleware: Require specific permission
 */
export function requirePermission(...permissions: Permission[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await getUserFromRequest(req);
      
      if (!user) {
        await logAccessAttempt(req, null, 'DENIED', 'No user found');
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const hasAllPermissions = permissions.every(p => hasPermission(user, p));
      
      if (!hasAllPermissions) {
        await logAccessAttempt(req, user, 'DENIED', `Missing permissions: ${permissions.join(', ')}`);
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          requiredPermissions: permissions,
          userRole: user.role,
        });
      }
      
      await logAccessAttempt(req, user, 'GRANTED', `Permissions granted: ${permissions.join(', ')}`);
      
      // Attach user to request
      (req as any).user = user;
      next();
      
    } catch (err) {
      console.error('[RBAC] Error:', err);
      return res.status(500).json({ error: 'Authorization failed' });
    }
  };
}

/**
 * Log access attempts for audit
 */
async function logAccessAttempt(
  req: Request,
  user: User | null,
  result: 'GRANTED' | 'DENIED',
  reason: string
): Promise<void> {
  const logEntry = {
    timestamp: new Date().toISOString(),
    userId: user?.id || 'anonymous',
    userEmail: user?.email || 'unknown',
    userRole: user?.role || 'none',
    method: req.method,
    path: req.path,
    ip: req.ip || req.socket.remoteAddress,
    result,
    reason,
  };
  
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO access_logs (user_id, user_email, user_role, method, path, ip, result, reason, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [logEntry.userId, logEntry.userEmail, logEntry.userRole, logEntry.method, 
         logEntry.path, logEntry.ip, logEntry.result, logEntry.reason, logEntry.timestamp]
      );
    } catch (err) {
      console.error('[RBAC] Failed to log access:', err);
    }
  }
  
  // Also log to console
  console.log(`[RBAC] ${result} - ${user?.email || 'anonymous'} (${user?.role || 'none'}) - ${req.method} ${req.path} - ${reason}`);
}

/**
 * Admin API: Create user
 */
export async function createUser(userData: Omit<User, 'createdAt'>): Promise<User> {
  const user: User = {
    ...userData,
    createdAt: new Date(),
  };
  
  if (pool) {
    await pool.query(
      `INSERT INTO users (id, email, role, shopify_id, created_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, user.email, user.role, user.shopifyId, user.createdAt]
    );
  } else {
    userStore.set(user.id, user);
  }
  
  return user;
}

/**
 * Admin API: Update user role
 */
export async function updateUserRole(userId: string, newRole: Role): Promise<void> {
  if (pool) {
    await pool.query(
      `UPDATE users SET role = $1 WHERE id = $2`,
      [newRole, userId]
    );
  } else {
    const user = userStore.get(userId);
    if (user) {
      user.role = newRole;
    }
  }
}

/**
 * Admin API: List users
 */
export async function listUsers(): Promise<User[]> {
  if (pool) {
    const { rows } = await pool.query(
      `SELECT id, email, role, shopify_id, created_at FROM users ORDER BY created_at DESC`
    );
    return rows.map(r => ({
      id: r.id,
      email: r.email,
      role: r.role as Role,
      shopifyId: r.shopify_id,
      createdAt: r.created_at,
    }));
  }
  
  return Array.from(userStore.values());
}

/**
 * Migration SQL for RBAC tables
 */
export const RBAC_MIGRATION = `
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL,
  shopify_id VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create access_logs table (audit trail)
CREATE TABLE IF NOT EXISTS access_logs (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  user_role VARCHAR(50) NOT NULL,
  method VARCHAR(10) NOT NULL,
  path TEXT NOT NULL,
  ip VARCHAR(45),
  result VARCHAR(20) NOT NULL,
  reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON access_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_access_logs_result ON access_logs(result);

-- Comments
COMMENT ON TABLE users IS 'User accounts with role-based access control';
COMMENT ON TABLE access_logs IS 'Audit log of all access attempts (granted and denied)';
`;


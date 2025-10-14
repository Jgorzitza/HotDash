import express from 'express';
import { 
  Role, 
  Permission,
  requireRole, 
  requirePermission,
  createUser,
  updateUserRole,
  listUsers,
} from '../middleware/rbac.js';

const router = express.Router();

/**
 * Admin API Routes
 * All routes require admin role or specific permissions
 */

// List all users
router.get('/users', 
  requirePermission(Permission.MANAGE_USERS),
  async (req, res) => {
    try {
      const users = await listUsers();
      res.json({ users });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Create new user
router.post('/users',
  requirePermission(Permission.MANAGE_USERS),
  async (req, res) => {
    try {
      const { id, email, role, shopifyId } = req.body;
      
      if (!id || !email || !role) {
        return res.status(400).json({ error: 'Missing required fields: id, email, role' });
      }
      
      if (!Object.values(Role).includes(role)) {
        return res.status(400).json({ error: 'Invalid role', validRoles: Object.values(Role) });
      }
      
      const user = await createUser({ id, email, role, shopifyId });
      res.status(201).json({ user });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Update user role
router.patch('/users/:userId/role',
  requirePermission(Permission.MANAGE_ROLES),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      
      if (!role) {
        return res.status(400).json({ error: 'Missing required field: role' });
      }
      
      if (!Object.values(Role).includes(role)) {
        return res.status(400).json({ error: 'Invalid role', validRoles: Object.values(Role) });
      }
      
      await updateUserRole(userId, role);
      res.json({ success: true, userId, newRole: role });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Get current user info
router.get('/me',
  async (req, res) => {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    res.json({ user });
  }
);

// List all roles and permissions
router.get('/roles',
  requireRole(Role.ADMIN, Role.OPERATOR),
  (req, res) => {
    res.json({
      roles: Object.values(Role),
      permissions: Object.values(Permission),
      rolePermissions: {
        [Role.SYSTEM]: Object.values(Permission),
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
      },
    });
  }
);

export default router;


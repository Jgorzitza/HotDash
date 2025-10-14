import express from 'express';
import { 
  Role,
  Permission,
  requirePermission,
} from '../middleware/rbac.js';
import {
  AuditEventType,
  queryAuditTrail,
  verifyAuditIntegrity,
  generateComplianceReport,
} from '../services/audit-trail.js';

const router = express.Router();

/**
 * Audit API Routes
 * All routes require VIEW_AUDIT permission
 */

// Query audit trail
router.get('/events',
  requirePermission(Permission.VIEW_AUDIT),
  async (req, res) => {
    try {
      const {
        userId,
        eventType,
        resource,
        startDate,
        endDate,
        limit,
      } = req.query;
      
      const events = await queryAuditTrail({
        userId: userId as string,
        eventType: eventType as AuditEventType,
        resource: resource as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        limit: limit ? parseInt(limit as string, 10) : 100,
      });
      
      res.json({
        events,
        count: events.length,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Verify audit trail integrity
router.get('/verify',
  requirePermission(Permission.VIEW_AUDIT),
  async (req, res) => {
    try {
      const result = await verifyAuditIntegrity();
      
      res.json({
        valid: result.valid,
        errorCount: result.errors.length,
        errors: result.errors,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Generate compliance report
router.get('/report',
  requirePermission(Permission.VIEW_AUDIT),
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'startDate and endDate are required' });
      }
      
      const report = await generateComplianceReport(
        new Date(startDate as string),
        new Date(endDate as string)
      );
      
      if (!report) {
        return res.status(500).json({ error: 'Failed to generate report' });
      }
      
      res.json(report);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Get audit statistics
router.get('/stats',
  requirePermission(Permission.VIEW_AUDIT),
  async (req, res) => {
    try {
      const { rows } = await (await import('pg')).Pool.prototype.query.call(
        pool,
        `SELECT 
          COUNT(*) as total_events,
          COUNT(DISTINCT user_id) as unique_users,
          COUNT(DISTINCT event_type) as event_types,
          MIN(created_at) as first_event,
          MAX(created_at) as last_event
         FROM audit_trail`
      );
      
      const stats = rows[0];
      
      res.json({
        totalEvents: parseInt(stats.total_events, 10),
        uniqueUsers: parseInt(stats.unique_users, 10),
        eventTypes: parseInt(stats.event_types, 10),
        firstEvent: stats.first_event,
        lastEvent: stats.last_event,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;


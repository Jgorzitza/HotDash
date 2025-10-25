/**
 * Data Integrity Smoke Tests
 * 
 * Verifies database health, schema integrity, and data consistency.
 * These tests ensure the data layer is functioning correctly.
 */

import { test, expect } from '@playwright/test';
import { SMOKE_TEST_CONFIG } from './config';

const config = SMOKE_TEST_CONFIG;
const baseURL = config.urls.production;

test.describe('Data Integrity Smoke Tests', () => {
  test.describe.configure({ mode: 'parallel' });

  test('Database schema is valid', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/health/schema`, {
      timeout: config.timeouts.medium,
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    
    // Verify critical tables exist
    for (const table of config.criticalTables) {
      expect(body.tables).toContain(table);
    }
    
    console.log(`✅ Schema valid: ${body.tables.length} tables found`);
  });

  test('RLS policies are enforced', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/health/rls`, {
      timeout: config.timeouts.medium,
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('rlsEnabled', true);
    expect(body).toHaveProperty('policiesCount');
    expect(body.policiesCount).toBeGreaterThan(0);
    
    console.log(`✅ RLS enabled: ${body.policiesCount} policies active`);
  });

  test('Database connections are healthy', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/health/database`, {
      timeout: config.timeouts.medium,
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('connected', true);
    expect(body).toHaveProperty('poolSize');
    expect(body).toHaveProperty('activeConnections');
    
    // Verify we're not at connection limit
    expect(body.activeConnections).toBeLessThan(body.poolSize);
    
    console.log(`✅ DB connections: ${body.activeConnections}/${body.poolSize}`);
  });

  test('Critical tables have data', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/health/data`, {
      timeout: config.timeouts.medium,
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    
    // Verify critical tables are not empty
    expect(body.DecisionLog).toBeGreaterThan(0);
    expect(body.Session).toBeGreaterThan(0);
    
    console.log(`✅ Data present: DecisionLog=${body.DecisionLog}, Session=${body.Session}`);
  });

  test('Database backup is recent', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/health/backup`, {
      timeout: config.timeouts.medium,
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('lastBackup');
    
    const lastBackup = new Date(body.lastBackup);
    const now = new Date();
    const hoursSinceBackup = (now.getTime() - lastBackup.getTime()) / (1000 * 60 * 60);
    
    // Backup should be within last 24 hours
    expect(hoursSinceBackup).toBeLessThan(24);
    
    console.log(`✅ Last backup: ${hoursSinceBackup.toFixed(1)} hours ago`);
  });

  test('No orphaned records', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/health/orphans`, {
      timeout: config.timeouts.medium,
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('orphanedRecords', 0);
    
    console.log(`✅ No orphaned records found`);
  });

  test('Data consistency checks pass', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/health/consistency`, {
      timeout: config.timeouts.medium,
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('consistent', true);
    expect(body).toHaveProperty('checks');
    
    // All consistency checks should pass
    for (const check of body.checks) {
      expect(check.passed).toBe(true);
    }
    
    console.log(`✅ ${body.checks.length} consistency checks passed`);
  });

  test('Database migrations are up to date', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/health/migrations`, {
      timeout: config.timeouts.medium,
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('upToDate', true);
    expect(body).toHaveProperty('appliedMigrations');
    expect(body).toHaveProperty('pendingMigrations', 0);
    
    console.log(`✅ Migrations up to date: ${body.appliedMigrations} applied`);
  });

  test('Database performance is acceptable', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/health/performance`, {
      timeout: config.timeouts.medium,
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('queryTime');
    expect(body.queryTime).toBeLessThan(config.performance.databaseQuery);
    
    console.log(`✅ DB query time: ${body.queryTime}ms`);
  });

  test('No database locks detected', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/health/locks`, {
      timeout: config.timeouts.medium,
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(body).toHaveProperty('locks', 0);
    
    console.log(`✅ No database locks detected`);
  });
});

test.describe('Data Integrity - Critical Validations', () => {
  test('Task assignments are valid', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/health/tasks`, {
      timeout: config.timeouts.medium,
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    
    // Verify no tasks with invalid status
    expect(body).toHaveProperty('invalidTasks', 0);
    
    // Verify no tasks with circular dependencies
    expect(body).toHaveProperty('circularDependencies', 0);
    
    console.log(`✅ Task assignments valid`);
  });

  test('Decision log integrity maintained', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/health/decisions`, {
      timeout: config.timeouts.medium,
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    
    // Verify all decisions have required fields
    expect(body).toHaveProperty('invalidDecisions', 0);
    
    console.log(`✅ Decision log integrity maintained`);
  });
});


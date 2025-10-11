#!/usr/bin/env node
/**
 * Rollback utility for switching to previous successful index
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { getConfig } from '../config.js';
async function symlinkExists(symlinkPath) {
    try {
        await fs.lstat(symlinkPath);
        return true;
    }
    catch {
        return false;
    }
}
async function symlinkTarget(symlinkPath) {
    try {
        return await fs.readlink(symlinkPath);
    }
    catch {
        return null;
    }
}
export async function rollbackIndex() {
    const config = getConfig();
    const indexesDir = path.join(config.LOG_DIR, 'indexes');
    const latestPath = path.join(indexesDir, 'latest');
    const prevPath = path.join(indexesDir, 'prev');
    console.log('🔄 Starting index rollback process...');
    try {
        // Check if prev symlink exists
        if (!(await symlinkExists(prevPath))) {
            return {
                success: false,
                message: 'No previous index available - prev symlink does not exist'
            };
        }
        const prevTarget = await symlinkTarget(prevPath);
        if (!prevTarget) {
            return {
                success: false,
                message: 'Previous index symlink is invalid'
            };
        }
        console.log(`📍 Previous index target: ${prevTarget}`);
        // Verify the previous index directory exists
        const prevIndexPath = path.resolve(path.join(indexesDir, 'prev'));
        try {
            const stats = await fs.stat(prevIndexPath);
            if (!stats.isDirectory()) {
                return {
                    success: false,
                    message: 'Previous index path is not a directory'
                };
            }
        }
        catch {
            return {
                success: false,
                message: `Previous index directory does not exist: ${prevIndexPath}`
            };
        }
        // Save current latest as temp backup
        const currentTarget = await symlinkTarget(latestPath);
        console.log(`💾 Current latest target: ${currentTarget || 'none'}`);
        // Perform the rollback by updating the latest symlink
        if (await symlinkExists(latestPath)) {
            await fs.unlink(latestPath);
            console.log('🗑️  Removed current latest symlink');
        }
        // Create new latest symlink pointing to prev target
        await fs.symlink(prevTarget, latestPath);
        console.log(`✅ Updated latest symlink to point to: ${prevTarget}`);
        // Verify the rollback worked
        const newLatestTarget = await symlinkTarget(latestPath);
        if (newLatestTarget === prevTarget) {
            return {
                success: true,
                message: `Successfully rolled back to index: ${prevTarget}`,
                prevIndex: prevTarget
            };
        }
        else {
            return {
                success: false,
                message: 'Rollback verification failed - symlink not updated correctly'
            };
        }
    }
    catch (error) {
        console.error('❌ Rollback failed:', error);
        return {
            success: false,
            message: `Rollback failed: ${error instanceof Error ? error.message : String(error)}`
        };
    }
}
export async function verifyRollback() {
    console.log('🔍 Verifying rollback status...');
    const config = loadConfig();
    const indexesDir = path.join(config.LOG_DIR, 'indexes');
    const latestPath = path.join(indexesDir, 'latest');
    const prevPath = path.join(indexesDir, 'prev');
    try {
        const latestTarget = await symlinkTarget(latestPath);
        const prevTarget = await symlinkTarget(prevPath);
        const details = {
            latest_points_to: latestTarget,
            prev_points_to: prevTarget,
            rollback_active: latestTarget === prevTarget,
            timestamp: new Date().toISOString()
        };
        if (latestTarget === prevTarget) {
            return {
                success: true,
                message: 'System is in rollback state - latest points to previous index',
                details
            };
        }
        else {
            return {
                success: true,
                message: 'System is in normal state - latest points to current index',
                details
            };
        }
    }
    catch (error) {
        return {
            success: false,
            message: `Verification failed: ${error instanceof Error ? error.message : String(error)}`
        };
    }
}
// CLI interface
async function main() {
    const command = process.argv[2];
    switch (command) {
        case 'rollback':
            {
                const result = await rollbackIndex();
                console.log(result.message);
                if (result.success) {
                    console.log('\\n🎯 Next steps:');
                    console.log('1. Run evaluation to verify rollback: npm run ai:eval');
                    console.log('2. Check system stability before proceeding');
                }
                process.exit(result.success ? 0 : 1);
            }
            break;
        case 'verify':
            {
                const result = await verifyRollback();
                console.log(result.message);
                if (result.details) {
                    console.log('\\nDetails:', JSON.stringify(result.details, null, 2));
                }
                process.exit(result.success ? 0 : 1);
            }
            break;
        default:
            console.log('LlamaIndex Rollback Utility');
            console.log('Usage:');
            console.log('  node rollback.js rollback    - Switch latest to prev index');
            console.log('  node rollback.js verify      - Check current rollback status');
            process.exit(1);
    }
}
// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('💥 Rollback utility failed:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=rollback.js.map
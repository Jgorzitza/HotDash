/**
 * KB DATABASE CLIENT
 *
 * This client connects to the Knowledge Base database for:
 * - Agent task assignments (TaskAssignment)
 * - Agent decision logging (DecisionLog)
 * - Development/coordination data
 *
 * This keeps development data separate from production business data.
 */
import { PrismaClient } from '@prisma/kb-client';
import * as fs from 'fs';
import * as path from 'path';
// Load KB DB credentials from vault
function getKbDatabaseUrl() {
    const vaultPath = path.join(process.cwd(), 'vault/dev-kb/supabase.env');
    if (!fs.existsSync(vaultPath)) {
        throw new Error('KB DB credentials not found in vault/dev-kb/supabase.env');
    }
    const envContent = fs.readFileSync(vaultPath, 'utf-8');
    const lines = envContent.split('\n');
    for (const line of lines) {
        if (line.startsWith('SUPABASE_DEV_KB_DATABASE_URL=')) {
            return line.substring('SUPABASE_DEV_KB_DATABASE_URL='.length).trim();
        }
    }
    throw new Error('SUPABASE_DEV_KB_DATABASE_URL not found in vault file');
}
const kbDatabaseUrl = getKbDatabaseUrl();
console.log('🔒 KB Database client initialized for task/feedback system');
const kbPrisma = new PrismaClient({
    datasources: {
        db: {
            url: kbDatabaseUrl,
        },
    },
    log: ['warn', 'error'],
});
export default kbPrisma;
//# sourceMappingURL=kb-db.server.js.map
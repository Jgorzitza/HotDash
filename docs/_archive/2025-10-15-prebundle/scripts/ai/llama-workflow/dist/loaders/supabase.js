import { createClient } from '@supabase/supabase-js';
import { Document } from 'llamaindex';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getConfig, getSupabaseKey } from '../config.js';
import { sanitizeTelemetry } from '../util/sanitize.js';
async function fetchTable(client, tableName, limit = 1000) {
    try {
        const { data, error } = await client
            .from(tableName)
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);
        if (error) {
            console.warn(`Supabase query error for ${tableName}:`, error);
            return [];
        }
        return data || [];
    }
    catch (error) {
        console.warn(`Failed to fetch from ${tableName}:`, error instanceof Error ? error.message : error);
        return [];
    }
}
export async function fetchDecisionDocs() {
    const config = getConfig();
    const documents = [];
    const timestamp = new Date().toISOString().replace(/[:]/g, '').slice(0, 15);
    const outputDir = path.join(config.LOG_DIR, 'ingestion', 'supabase', timestamp);
    try {
        await fs.mkdir(outputDir, { recursive: true });
        const supabase = createClient(config.SUPABASE_URL, getSupabaseKey());
        console.log('Fetching decision log data from Supabase...');
        const rows = await fetchTable(supabase, 'decision_log', 2000);
        console.log(`Found ${rows.length} decision log entries`);
        for (const row of rows) {
            const text = row.summary || row.detail || row.description || JSON.stringify(row);
            if (text && text.length > 10) { // Only include entries with substantial content
                const doc = new Document({
                    id_: `decision:${row.id}`,
                    text: text,
                    metadata: {
                        source: 'supabase',
                        table: 'decision_log',
                        created_at: row.created_at,
                        id: row.id,
                        type: row.type || 'unknown',
                        status: row.status || 'unknown',
                    }
                });
                documents.push(doc);
            }
        }
        // Write sample output for validation
        if (documents.length > 0) {
            const sampleDoc = documents[0];
            const sample = {
                id: sampleDoc.id_,
                metadata: sampleDoc.metadata,
                text_preview: sampleDoc.getText().slice(0, 300) + '...',
                full_text_length: sampleDoc.getText().length,
                timestamp: new Date().toISOString(),
            };
            await fs.writeFile(path.join(outputDir, 'decision_sample.json'), JSON.stringify(sample, null, 2));
        }
        // Write manifest
        const manifest = {
            source: 'supabase',
            table: 'decision_log',
            timestamp: new Date().toISOString(),
            rows_fetched: rows.length,
            documents_created: documents.length,
            total_content_length: documents.reduce((sum, doc) => sum + doc.getText().length, 0),
        };
        await fs.writeFile(path.join(outputDir, 'decision_manifest.json'), JSON.stringify(manifest, null, 2));
        console.log(`Successfully processed ${documents.length} decision log documents`);
        return documents;
    }
    catch (error) {
        // Write error log
        const errorLog = {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString(),
            table: 'decision_log',
        };
        try {
            await fs.mkdir(outputDir, { recursive: true });
            await fs.writeFile(path.join(outputDir, 'decision_errors.log'), JSON.stringify(errorLog, null, 2));
        }
        catch (writeError) {
            console.error('Failed to write error log:', writeError);
        }
        console.error('Decision log fetching failed:', error);
        return []; // Return empty array instead of throwing
    }
}
export async function fetchTelemetryDocs() {
    const config = getConfig();
    const documents = [];
    const timestamp = new Date().toISOString().replace(/[:]/g, '').slice(0, 15);
    const outputDir = path.join(config.LOG_DIR, 'ingestion', 'supabase', timestamp);
    try {
        await fs.mkdir(outputDir, { recursive: true });
        const supabase = createClient(config.SUPABASE_URL, getSupabaseKey());
        console.log('Fetching telemetry events data from Supabase...');
        const rows = await fetchTable(supabase, 'telemetry_events', 5000);
        console.log(`Found ${rows.length} telemetry events`);
        for (const row of rows) {
            // Create text from event name and payload
            let text = row.event_name || 'unknown_event';
            if (row.payload_text) {
                text += ': ' + row.payload_text;
            }
            else if (row.payload) {
                text += ': ' + JSON.stringify(row.payload);
            }
            if (row.user_id) {
                text += ` (user: ${row.user_id})`;
            }
            // Sanitize PII from telemetry data
            const { sanitized: sanitizedPayload, redacted } = sanitizeTelemetry(text);
            const cleanText = typeof sanitizedPayload === 'string' ? sanitizedPayload : JSON.stringify(sanitizedPayload);
            if (cleanText.length > 5) { // Only include events with some content
                const doc = new Document({
                    id_: `telemetry:${row.id}`,
                    text: cleanText,
                    metadata: {
                        source: 'supabase',
                        table: 'telemetry_events',
                        created_at: row.created_at,
                        event_name: row.event_name,
                        user_id: row.user_id ? '[REDACTED]' : undefined, // Redact user_id in metadata too
                        session_id: row.session_id ? '[REDACTED]' : undefined, // Redact session_id in metadata too
                        id: row.id,
                        sanitization: {
                            redacted_count: redacted.redactedCount,
                            redacted_types: redacted.redactedTypes
                        }
                    }
                });
                documents.push(doc);
            }
        }
        // Write sample output for validation
        if (documents.length > 0) {
            const sampleDoc = documents[0];
            const sample = {
                id: sampleDoc.id_,
                metadata: sampleDoc.metadata,
                text_preview: sampleDoc.getText().slice(0, 300) + '...',
                full_text_length: sampleDoc.getText().length,
                timestamp: new Date().toISOString(),
            };
            await fs.writeFile(path.join(outputDir, 'telemetry_sample.json'), JSON.stringify(sample, null, 2));
        }
        // Write manifest
        const manifest = {
            source: 'supabase',
            table: 'telemetry_events',
            timestamp: new Date().toISOString(),
            rows_fetched: rows.length,
            documents_created: documents.length,
            total_content_length: documents.reduce((sum, doc) => sum + doc.getText().length, 0),
        };
        await fs.writeFile(path.join(outputDir, 'telemetry_manifest.json'), JSON.stringify(manifest, null, 2));
        console.log(`Successfully processed ${documents.length} telemetry documents`);
        return documents;
    }
    catch (error) {
        // Write error log
        const errorLog = {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString(),
            table: 'telemetry_events',
        };
        try {
            await fs.mkdir(outputDir, { recursive: true });
            await fs.writeFile(path.join(outputDir, 'telemetry_errors.log'), JSON.stringify(errorLog, null, 2));
        }
        catch (writeError) {
            console.error('Failed to write error log:', writeError);
        }
        console.error('Telemetry fetching failed:', error);
        return []; // Return empty array instead of throwing
    }
}
//# sourceMappingURL=supabase.js.map
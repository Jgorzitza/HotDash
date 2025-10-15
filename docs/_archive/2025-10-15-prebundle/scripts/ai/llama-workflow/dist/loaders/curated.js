import { createClient } from '@supabase/supabase-js';
import { Document } from 'llamaindex';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getConfig, getSupabaseKey } from '../config.js';
import { sanitizeCuratedReply } from '../util/sanitize.js';
export async function fetchCuratedDocs() {
    const config = getConfig();
    const documents = [];
    const timestamp = new Date().toISOString().replace(/[:]/g, '').slice(0, 15);
    const outputDir = path.join(config.LOG_DIR, 'ingestion', 'curated', timestamp);
    try {
        await fs.mkdir(outputDir, { recursive: true });
        const supabase = createClient(config.SUPABASE_URL, getSupabaseKey());
        console.log('Fetching curated support replies from Supabase...');
        // Try to fetch from the expected table
        const { data, error } = await supabase
            .from('support_curated_replies')
            .select('*')
            .order('updated_at', { ascending: false });
        if (error) {
            console.warn('Failed to fetch from support_curated_replies table:', error);
            console.log('Table may not exist yet - returning empty document set');
            // Write error log but don't fail completely
            const errorLog = {
                error: error.message,
                table: 'support_curated_replies',
                note: 'Table may not exist yet or schema differs',
                timestamp: new Date().toISOString(),
            };
            await fs.writeFile(path.join(outputDir, 'curated_errors.log'), JSON.stringify(errorLog, null, 2));
            // Return empty array with a placeholder document explaining the situation
            const placeholderDoc = new Document({
                id_: 'curated:placeholder',
                text: 'Curated support replies table not yet available. This placeholder will be replaced when Support team creates the support_curated_replies table with schema: id, question, answer, tags, updated_at.',
                metadata: {
                    source: 'curated',
                    table: 'support_curated_replies',
                    status: 'placeholder',
                    note: 'Table does not exist yet',
                    timestamp: new Date().toISOString(),
                }
            });
            documents.push(placeholderDoc);
            console.log('Added placeholder document for curated replies');
        }
        else {
            const rows = data || [];
            console.log(`Found ${rows.length} curated support replies`);
            for (const row of rows) {
                if (row.question && row.answer) {
                    const questionText = String(row.question).trim();
                    const answerText = String(row.answer).trim();
                    if (questionText.length > 0 && answerText.length > 0) {
                        // Sanitize PII from support content
                        const { question: cleanQuestion, answer: cleanAnswer, redacted } = sanitizeCuratedReply(questionText, answerText);
                        const text = `Q: ${cleanQuestion}\nA: ${cleanAnswer}`;
                        const doc = new Document({
                            id_: `curated:${row.id}`,
                            text: text,
                            metadata: {
                                source: 'curated',
                                table: 'support_curated_replies',
                                id: row.id,
                                tags: row.tags || [],
                                updated_at: row.updated_at,
                                question_length: cleanQuestion.length,
                                answer_length: cleanAnswer.length,
                                sanitization: {
                                    redacted_count: redacted.redactedCount,
                                    redacted_types: redacted.redactedTypes
                                }
                            }
                        });
                        documents.push(doc);
                    }
                }
            }
            console.log(`Successfully processed ${documents.length} curated support documents`);
        }
        // Write sample output for validation
        if (documents.length > 0) {
            const sampleDoc = documents[0];
            const sample = {
                id: sampleDoc.id_,
                metadata: sampleDoc.metadata,
                text_preview: sampleDoc.getText().slice(0, 400) + '...',
                full_text_length: sampleDoc.getText().length,
                timestamp: new Date().toISOString(),
            };
            await fs.writeFile(path.join(outputDir, 'curated_sample.json'), JSON.stringify(sample, null, 2));
        }
        // Write manifest
        const manifest = {
            source: 'curated',
            table: 'support_curated_replies',
            timestamp: new Date().toISOString(),
            documents_created: documents.length,
            total_content_length: documents.reduce((sum, doc) => sum + doc.getText().length, 0),
            is_placeholder: documents.length === 1 && documents[0].id_ === 'curated:placeholder',
        };
        await fs.writeFile(path.join(outputDir, 'curated_manifest.json'), JSON.stringify(manifest, null, 2));
        return documents;
    }
    catch (error) {
        // Write error log
        const errorLog = {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString(),
            table: 'support_curated_replies',
        };
        try {
            await fs.mkdir(outputDir, { recursive: true });
            await fs.writeFile(path.join(outputDir, 'curated_errors.log'), JSON.stringify(errorLog, null, 2));
        }
        catch (writeError) {
            console.error('Failed to write error log:', writeError);
        }
        console.error('Curated replies fetching failed:', error);
        // Return a placeholder document instead of failing completely
        const placeholderDoc = new Document({
            id_: 'curated:error_placeholder',
            text: 'Error occurred while fetching curated support replies. Check logs for details. This system will retry on next refresh cycle.',
            metadata: {
                source: 'curated',
                table: 'support_curated_replies',
                status: 'error',
                error_occurred: true,
                timestamp: new Date().toISOString(),
            }
        });
        return [placeholderDoc];
    }
}
//# sourceMappingURL=curated.js.map
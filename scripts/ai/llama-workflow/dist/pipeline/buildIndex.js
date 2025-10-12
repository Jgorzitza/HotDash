import { VectorStoreIndex, SimpleNodeParser, Settings, Document as LlamaDocument, OpenAI, OpenAIEmbedding } from 'llamaindex';
import { getConfig } from '../config.js';
import { fetchHotrodanContent } from '../loaders/sitemap.js';
import { fetchDecisionDocs, fetchTelemetryDocs } from '../loaders/supabase.js';
import { fetchCuratedDocs } from '../loaders/curated.js';
import fs from 'node:fs/promises';
import path from 'node:path';
export async function buildAll(logDirOverride, options = {}) {
    const startTime = Date.now();
    const config = getConfig();
    const logDir = logDirOverride || config.LOG_DIR;
    // Configure LlamaIndex with OpenAI
    Settings.llm = new OpenAI({
        apiKey: config.OPENAI_API_KEY,
        model: 'gpt-3.5-turbo',
    });
    Settings.embedModel = new OpenAIEmbedding({
        apiKey: config.OPENAI_API_KEY,
        model: 'text-embedding-ada-002',
    });
    const timestamp = new Date().toISOString().replace(/[:]/g, '').slice(0, 15);
    const runDir = path.join(logDir, 'indexes', timestamp);
    try {
        console.log(`Starting index build: ${timestamp}`);
        await fs.mkdir(runDir, { recursive: true });
        // Collect documents from selected sources
        const docs = [];
        const sources = {
            web: 0,
            supabase_decisions: 0,
            supabase_telemetry: 0,
            curated: 0,
        };
        const sourceFilter = options.sources || 'all';
        if (sourceFilter === 'all' || sourceFilter === 'web') {
            console.log('Fetching web content...');
            const webDocs = await fetchHotrodanContent();
            docs.push(...webDocs);
            sources.web = webDocs.length;
            console.log(`✓ Loaded ${webDocs.length} web documents`);
        }
        if (sourceFilter === 'all' || sourceFilter === 'supabase') {
            console.log('Fetching Supabase data...');
            const decisionDocs = await fetchDecisionDocs();
            docs.push(...decisionDocs);
            sources.supabase_decisions = decisionDocs.length;
            console.log(`✓ Loaded ${decisionDocs.length} decision documents`);
            const telemetryDocs = await fetchTelemetryDocs();
            docs.push(...telemetryDocs);
            sources.supabase_telemetry = telemetryDocs.length;
            console.log(`✓ Loaded ${telemetryDocs.length} telemetry documents`);
        }
        if (sourceFilter === 'all' || sourceFilter === 'curated') {
            console.log('Fetching curated replies...');
            const curatedDocs = await fetchCuratedDocs();
            docs.push(...curatedDocs);
            sources.curated = curatedDocs.length;
            console.log(`✓ Loaded ${curatedDocs.length} curated documents`);
        }
        console.log(`Total documents collected: ${docs.length}`);
        if (docs.length === 0) {
            throw new Error('No documents collected from any source');
        }
        // Parse documents into nodes with chunking
        console.log('Processing documents into nodes...');
        const parser = new SimpleNodeParser({
            chunkSize: 1024,
            chunkOverlap: 128,
        });
        const nodes = parser.getNodesFromDocuments(docs);
        console.log(`✓ Created ${nodes.length} nodes from documents`);
        // Build the vector index
        console.log('Building vector index...');
        const index = await VectorStoreIndex.fromDocuments(docs);
        console.log('✓ Vector index built successfully');
        // Persist the index - using index.storage instead of storageContext
        const indexPath = path.join(runDir, 'index');
        await index.storage?.persist?.(indexPath);
        console.log(`✓ Index persisted to: ${indexPath}`);
        // Update symlinks for rollback capability
        const latestPath = path.join(logDir, 'indexes', 'latest');
        const prevPath = path.join(logDir, 'indexes', 'prev');
        // Move current latest to prev (if exists)
        try {
            const currentLatest = await fs.readlink(latestPath);
            await fs.unlink(prevPath).catch(() => { }); // Remove old prev link
            await fs.symlink(currentLatest, prevPath);
            console.log('✓ Previous index backed up to prev symlink');
        }
        catch (error) {
            // No previous latest link exists
            console.log('No previous index to backup');
        }
        // Update latest symlink
        try {
            await fs.unlink(latestPath);
        }
        catch { } // Ignore if doesn't exist
        await fs.symlink(path.relative(path.dirname(latestPath), runDir), latestPath);
        console.log('✓ Latest symlink updated');
        const duration = Date.now() - startTime;
        // Write run manifest
        const manifest = {
            timestamp: new Date().toISOString(),
            duration_ms: duration,
            total_documents: docs.length,
            total_nodes: nodes.length,
            sources: sources,
            options: options,
            index_path: indexPath,
            run_dir: runDir,
            success: true,
        };
        await fs.writeFile(path.join(runDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
        console.log(`✓ Index build completed in ${duration}ms`);
        return {
            runDir,
            count: nodes.length,
            sources,
            duration,
            indexPath,
        };
    }
    catch (error) {
        const duration = Date.now() - startTime;
        // Write error manifest
        const errorManifest = {
            timestamp: new Date().toISOString(),
            duration_ms: duration,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            run_dir: runDir,
            success: false,
        };
        try {
            await fs.mkdir(runDir, { recursive: true });
            await fs.writeFile(path.join(runDir, 'manifest.json'), JSON.stringify(errorManifest, null, 2));
            await fs.writeFile(path.join(runDir, 'errors.log'), JSON.stringify(errorManifest, null, 2));
        }
        catch (writeError) {
            console.error('Failed to write error logs:', writeError);
        }
        console.error('Index build failed:', error);
        throw error;
    }
}
export async function getLatestIndexPath() {
    const config = getConfig();
    const latestPath = path.join(config.LOG_DIR, 'indexes', 'latest');
    try {
        const realPath = await fs.readlink(latestPath);
        return path.resolve(path.dirname(latestPath), realPath);
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=buildIndex.js.map
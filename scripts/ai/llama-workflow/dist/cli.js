import { Command } from 'commander';
import { spawnSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../../../');
const SUPPORT_DIR = path.join(PROJECT_ROOT, 'data/support');
const INDEX_DIR = path.join(PROJECT_ROOT, 'packages/memory/indexes/operator_knowledge');
function loadSupportDocuments() {
    return fs.readdir(SUPPORT_DIR)
        .then(async (files) => {
        const markdownFiles = files.filter((file) => file.endsWith('.md'));
        const docs = await Promise.all(markdownFiles.map(async (file) => {
            const content = await fs.readFile(path.join(SUPPORT_DIR, file), 'utf-8');
            const title = content.split('\n').find((line) => line.startsWith('#'))?.replace(/^#+\s*/, '') ?? file.replace('.md', '');
            return { fileName: file, title, content };
        }));
        return docs;
    })
        .catch(() => []);
}
function computeRelevanceScore(doc, query) {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0)
        return 0;
    const text = `${doc.title} ${doc.content}`.toLowerCase();
    let matches = 0;
    for (const term of terms) {
        if (text.includes(term)) {
            matches += 1;
        }
    }
    return matches / terms.length;
}
async function runQuery(query, topK) {
    const documents = await loadSupportDocuments();
    if (!documents.length) {
        return 'No knowledge base documents found. Have you synced data/support?';
    }
    const ranked = documents
        .map((doc) => ({
        doc,
        score: computeRelevanceScore(doc, query),
    }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);
    if (!ranked.length) {
        return `No matches found for query "${query}".`;
    }
    const lines = [];
    lines.push(`Top results for "${query}":`);
    ranked.forEach(({ doc, score }, index) => {
        const snippet = doc.content.replace(/\s+/g, ' ').slice(0, 240);
        lines.push(`\n${index + 1}. ${doc.title} (${doc.fileName}) — relevance ${(score * 100).toFixed(1)}%\n   ${snippet}…`);
    });
    return lines.join('\n');
}
function runRefresh(forceMock, additionalArgs) {
    const args = ['-y', 'tsx', 'scripts/rag/build-index.ts'];
    if (forceMock) {
        args.push('--force-mock');
    }
    args.push(...additionalArgs);
    const result = spawnSync('npx', args, {
        cwd: PROJECT_ROOT,
        stdio: 'inherit',
        env: process.env,
    });
    return result.status ?? 0;
}
async function runInsight(window, format) {
    const metadataPath = path.join(INDEX_DIR, 'index_metadata.json');
    try {
        const metadataRaw = await fs.readFile(metadataPath, 'utf-8');
        const metadata = JSON.parse(metadataRaw);
        const topSources = [...(metadata.sources ?? [])]
            .sort((a, b) => b.size - a.size)
            .slice(0, 5);
        if (format === 'json') {
            return JSON.stringify({
                window,
                buildTime: metadata.buildTime,
                documentCount: metadata.documentCount,
                topSources,
            }, null, 2);
        }
        const lines = [];
        lines.push(`# Knowledge Base Insight Report (${window})`);
        lines.push(`- Build Time: ${metadata.buildTime}`);
        lines.push(`- Documents Indexed: ${metadata.documentCount}`);
        lines.push('');
        lines.push('Top Sources (by size):');
        topSources.forEach((source, idx) => {
            lines.push(`  ${idx + 1}. ${source.fileName} — ${source.size} chars`);
        });
        return format === 'txt' ? lines.join('\n') : lines.map((line) => line.trimEnd()).join('\n');
    }
    catch {
        return 'No index metadata found. Run `refresh` to build the knowledge base index.';
    }
}
const program = new Command();
program
    .name('llama-workflow')
    .description('CLI wrapper for LlamaIndex workflows used by MCP server');
program
    .command('query')
    .description('Query knowledge base documents')
    .requiredOption('-q, --query <text>', 'Query text')
    .option('--topK <number>', 'Number of results to return', (value) => parseInt(value, 10), 5)
    .action(async (options) => {
    const output = await runQuery(options.query, options.topK);
    console.log(output);
});
program
    .command('refresh')
    .description('Rebuild the vector index via scripts/rag/build-index.ts')
    .option('--force-mock', 'Use mock embeddings')
    .allowUnknownOption(true)
    .action((options, command) => {
    const additionalArgs = command.args.slice(1);
    const exitCode = runRefresh(Boolean(options.forceMock), additionalArgs);
    process.exit(exitCode);
});
program
    .command('insight')
    .description('Generate knowledge base insight report from index metadata')
    .option('--window <window>', 'Time window for analysis', '7d')
    .option('--format <format>', 'Output format (md|json|txt)', 'md')
    .action(async (options) => {
    const format = options.format;
    const output = await runInsight(options.window, format);
    console.log(output);
});
if (process.argv.length <= 2) {
    program.help();
}
else {
    program.parseAsync(process.argv).catch((error) => {
        console.error(error);
        process.exit(1);
    });
}

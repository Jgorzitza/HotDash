import { promises as fs } from "fs";
import { dirname, join } from "path";
async function ensureDirectory(filePath) {
    await fs.mkdir(dirname(filePath), { recursive: true });
}
async function appendRecord(filePath, record) {
    await ensureDirectory(filePath);
    const line = `${JSON.stringify(record)}\n`;
    await fs.appendFile(filePath, line, "utf8");
}
async function readRecords(filePath) {
    try {
        const contents = await fs.readFile(filePath, "utf8");
        return contents
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => line.length > 0)
            .map((line) => JSON.parse(line));
    }
    catch (error) {
        if (error?.code === "ENOENT") {
            return [];
        }
        throw error;
    }
}
function filePathFor(baseDir, type) {
    const fileName = type === "decisions" ? "decisions.ndjson" : "facts.ndjson";
    return join(baseDir, fileName);
}
export function fileMemory(baseDir) {
    const decisionsPath = filePathFor(baseDir, "decisions");
    const factsPath = filePathFor(baseDir, "facts");
    return {
        async putDecision(decision) {
            await appendRecord(decisionsPath, decision);
        },
        async listDecisions(scope) {
            const entries = await readRecords(decisionsPath);
            if (!scope) {
                return entries;
            }
            return entries.filter((entry) => entry.scope === scope);
        },
        async putFact(fact) {
            await appendRecord(factsPath, fact);
        },
        async getFacts(topic, key) {
            const entries = await readRecords(factsPath);
            return entries.filter((entry) => {
                const topicMatch = topic ? entry.topic === topic : true;
                const keyMatch = key ? entry.key === key : true;
                return topicMatch && keyMatch;
            });
        },
    };
}
export function fileMemoryPaths(baseDir) {
    return {
        decisions: filePathFor(baseDir, "decisions"),
        facts: filePathFor(baseDir, "facts"),
    };
}
//# sourceMappingURL=file.js.map
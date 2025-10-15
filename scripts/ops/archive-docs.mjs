// scripts/ops/archive-docs.mjs
// Sweep docs/planning/* older than 2 days into docs/_archive/<YYYY-MM-DD-archive>/
import fs from 'node:fs';
import path from 'node:path';

const PLANNING_DIR = 'docs/planning';
const ARCHIVE_BASE = 'docs/_archive';
const TTL_DAYS = 2;

function getArchiveDir() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return path.join(ARCHIVE_BASE, `${yyyy}-${mm}-${dd}-archive`);
}

function archiveOldPlanningDocs() {
  if (!fs.existsSync(PLANNING_DIR)) {
    console.log(`📂 ${PLANNING_DIR} not found; nothing to archive.`);
    return;
  }

  const cutoff = Date.now() - (TTL_DAYS * 24 * 60 * 60 * 1000);
  const files = fs.readdirSync(PLANNING_DIR);
  const toArchive = [];

  for (const file of files) {
    const fullPath = path.join(PLANNING_DIR, file);
    const stat = fs.statSync(fullPath);

    if (stat.isFile() && stat.mtimeMs < cutoff) {
      toArchive.push({ file, fullPath });
    }
  }

  if (toArchive.length === 0) {
    console.log(`✅ No planning docs older than ${TTL_DAYS} days.`);
    return;
  }

  const archiveDir = getArchiveDir();
  fs.mkdirSync(archiveDir, { recursive: true });

  console.log(`📦 Archiving ${toArchive.length} planning doc(s) to ${archiveDir}:`);

  for (const { file, fullPath } of toArchive) {
    const dest = path.join(archiveDir, file);
    fs.renameSync(fullPath, dest);
    console.log(`  → ${file}`);
  }

  console.log(`✅ Planning TTL sweep complete. Stage & commit with: git add ${ARCHIVE_BASE} ${PLANNING_DIR}`);
}

archiveOldPlanningDocs();

#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

function ts() {
  return new Date().toISOString().replace(/[-:T]/g, '').slice(0, 15);
}

async function run() {
  const prefix = process.env.SESSION_PREFIX || '';
  const name = `${prefix}${prefix ? '-' : ''}${ts()}`;
  const base = join('artifacts', 'ops', 'langfuse', name);
  if (!existsSync(base)) await mkdir(base, { recursive: true });

  const files = [
    '01-provision-clickhouse.log',
    '02-provision-minio.log',
    '03-gateway-deploy.log',
    '04-validation.log',
    'COMMANDS.md',
    'summary.json',
  ];

  for (const f of files) {
    const p = join(base, f);
    if (existsSync(p)) continue;
    if (f.endsWith('.json')) {
      await writeFile(p, JSON.stringify({ session: name, createdAt: new Date().toISOString() }, null, 2));
    } else if (f === 'COMMANDS.md') {
      await writeFile(
        p,
        `# Commands Executed — ${name}\n\nPaste the exact commands executed per phase here. Do not paste secrets.\n\n- Phase 1 (ClickHouse):\n- Phase 2 (MinIO):\n- Phase 3 (Gateway deploy + secrets):\n- Phase 4 (Validation):\n`,
      );
    } else {
      await writeFile(p, `# ${f}\n\nTee command output here.\n`);
    }
  }

  console.log(`✅ Created Langfuse evidence session: ${base}`);
}

run().catch((e) => {
  console.error('❌ Error:', e);
  process.exit(1);
});

